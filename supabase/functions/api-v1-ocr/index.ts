import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Validate API key and check rate limit
async function validateApiKey(apiKey: string, supabase: any): Promise<{ valid: boolean; error?: string; apiKeyId?: string }> {
  if (!apiKey) {
    return { valid: false, error: 'API key is required. Please include X-API-Key header.' };
  }

  // Check if API key exists and is active
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('id, user_id, rate_limit_per_minute, is_active')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (keyError || !keyData) {
    return { valid: false, error: 'Invalid or inactive API key.' };
  }

  // Check rate limit - count requests in the last minute
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count, error: countError } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', keyData.id)
    .gte('called_at', oneMinuteAgo);

  if (countError) {
    console.error('Error checking rate limit:', countError);
    return { valid: false, error: 'Error checking rate limit.' };
  }

  if (count && count >= keyData.rate_limit_per_minute) {
    return { valid: false, error: `Rate limit exceeded. Maximum ${keyData.rate_limit_per_minute} requests per minute.` };
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id);

  return { valid: true, apiKeyId: keyData.id };
}

// Log API usage
async function logApiUsage(apiKeyId: string, endpoint: string, success: boolean, supabase: any) {
  await supabase
    .from('api_usage_logs')
    .insert({
      api_key_id: apiKeyId,
      endpoint,
      success
    });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Extract API key from header
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    // Validate API key and check rate limit
    const validation = await validateApiKey(apiKey || '', supabase);
    
    if (!validation.valid) {
      await logApiUsage(validation.apiKeyId || '', '/api/v1/ocr', false, supabase);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: validation.error?.includes('Rate limit') ? 429 : 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { image, imageUrl } = await req.json();

    if (!image && !imageUrl) {
      await logApiUsage(validation.apiKeyId!, '/api/v1/ocr', false, supabase);
      return new Response(
        JSON.stringify({ error: 'กรุณาส่งรูปภาพ (image หรือ imageUrl)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      await logApiUsage(validation.apiKeyId!, '/api/v1/ocr', false, supabase);
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let mimeType: string;
    let base64Data: string;

    if (imageUrl) {
      // Fetch image from URL and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        await logApiUsage(validation.apiKeyId!, '/api/v1/ocr', false, supabase);
        return new Response(
          JSON.stringify({ error: 'ไม่สามารถดาวน์โหลดรูปภาพจาก URL ได้' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await imageResponse.arrayBuffer();
      base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    } else {
      // Extract base64 data and mime type from data URL
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        await logApiUsage(validation.apiKeyId!, '/api/v1/ocr', false, supabase);
        return new Response(
          JSON.stringify({ error: 'รูปแบบรูปภาพไม่ถูกต้อง' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      mimeType = matches[1];
      base64Data = matches[2];
    }

    // Check file size (base64 string length * 3/4 gives approximate bytes)
    const fileSizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB limit
    
    if (fileSizeInBytes > maxSizeInBytes) {
      await logApiUsage(validation.apiKeyId!, '/api/v1/ocr', false, supabase);
      return new Response(
        JSON.stringify({ 
          error: 'ไฟล์ใหญ่เกินไป',
          details: `ขนาดไฟล์: ${(fileSizeInBytes / 1024 / 1024).toFixed(2)} MB, ขนาดสูงสุดที่อนุญาต: ${(maxSizeInBytes / 1024 / 1024).toFixed(2)} MB`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing OCR request, mime type:', mimeType, 'file size:', (fileSizeInBytes / 1024 / 1024).toFixed(2), 'MB');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              },
              {
                text: `อ่านข้อความทั้งหมดจากรูปภาพนี้ ให้ผลลัพธ์เป็นข้อความล้วนๆ ไม่ต้องมีคำอธิบายหรือหมายเหตุใดๆ

กฎ:
1. อ่านข้อความทุกบรรทัดตามลำดับจากบนลงล่าง
2. รักษารูปแบบการขึ้นบรรทัดใหม่ตามต้นฉบับ
3. ถ้ามีเบอร์โทรศัพท์ ให้อ่านตัวเลขให้ครบ
4. ถ้ามีที่อยู่ ให้อ่านให้ครบถ้วน
5. ถ้าไม่มีข้อความในรูป ให้ตอบว่า "ไม่พบข้อความในรูปภาพ"
6. ตอบเฉพาะข้อความที่อ่านได้ ไม่ต้องเพิ่มคำอธิบาย`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      await logApiUsage(validation.apiKeyId!, '/api/v1/ocr', false, supabase);
      return new Response(
        JSON.stringify({ error: 'ไม่สามารถประมวลผลรูปภาพได้', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!extractedText) {
      await logApiUsage(validation.apiKeyId!, '/api/v1/ocr', false, supabase);
      return new Response(
        JSON.stringify({ error: 'ไม่สามารถอ่านข้อความจากรูปภาพได้' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OCR successful, text length:', extractedText.length);
    await logApiUsage(validation.apiKeyId!, '/api/v1/ocr', true, supabase);

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-v1-ocr function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
