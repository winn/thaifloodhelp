import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: image (base64 data URL)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Extract base64 data and mime type
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format. Expected base64 data URL (data:image/...;base64,...)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    console.log('OCR API v1: Processing image, mime type:', mimeType);

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
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    console.log('OCR API v1: Success, text length:', extractedText.length);

    return new Response(
      JSON.stringify({ 
        text: extractedText,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-v1-ocr function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'OCR processing failed',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
