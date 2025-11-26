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
    const { image, imageUrl } = await req.json();

    if (!image && !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'กรุณาส่งรูปภาพ (image หรือ imageUrl)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let mimeType: string;
    let base64Data: string;

    if (imageUrl) {
      // Fetch image from URL and convert to base64
      console.log('Fetching image from URL:', imageUrl);
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'ไม่สามารถดาวน์โหลดรูปภาพจาก URL ได้' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      mimeType = contentType;
      
      // Convert ArrayBuffer to base64
      const bytes = new Uint8Array(imageBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64Data = btoa(binary);
    } else {
      // Extract base64 data and mime type from data URL
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return new Response(
          JSON.stringify({ error: 'รูปแบบรูปภาพไม่ถูกต้อง (ต้องเป็น data URL หรือใช้ imageUrl)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      mimeType = matches[1];
      base64Data = matches[2];
    }

    console.log('Processing OCR request, mime type:', mimeType);

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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    console.log('OCR Result:', extractedText.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ocr-image function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอ่านรูปภาพ'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
