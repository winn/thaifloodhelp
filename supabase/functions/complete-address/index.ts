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
    const { address } = await req.json();

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'กรุณาระบุที่อยู่' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญด้านที่อยู่ในประเทศไทย มีหน้าที่แปลงที่อยู่แบบย่อให้เป็นที่อยู่แบบเต็ม

กฎสำคัญ:
1. ขยายคำย่อให้เต็ม เช่น ซ. → ซอย, ถ. → ถนน, ต. → ตำบล, อ. → อำเภอ, จ. → จังหวัด, ม. → หมู่
2. เติมข้อมูลที่ขาดหายไป เช่น ตำบล อำเภอ จังหวัด รหัสไปรษณีย์ โดยอ้างอิงจากข้อมูลที่มี
3. ถ้าไม่แน่ใจ 100% ว่าข้อมูลถูกต้อง ให้คงที่อยู่เดิมไว้ อย่าเดา
4. รักษาข้อมูลเดิมทั้งหมด อย่าลบหรือเปลี่ยนแปลงข้อมูลที่มีอยู่
5. ตอบกลับเฉพาะที่อยู่ที่แก้ไขแล้ว ไม่ต้องอธิบายเพิ่มเติม

ตัวอย่าง:
- "ซ.12 รัตนอุทิศ เขต8 หาดใหญ่" → "ซอย 12 ถนนรัตนอุทิศ เขต 8 ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110"
- "123 ม.5 บางกระทุ่ม เมือง เชียงใหม่" → "123 หมู่ 5 ต.บางกระทุ่ม อ.เมือง จ.เชียงใหม่ 50000"
- "บ้านเลขที่ 45 ถ.สุขุมวิท คลองเตย กทม" → "บ้านเลขที่ 45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              { text: `แปลงที่อยู่นี้ให้สมบูรณ์:\n${address}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const completedAddress = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!completedAddress) {
      return new Response(
        JSON.stringify({ completedAddress: address }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Original:', address);
    console.log('Completed:', completedAddress);

    return new Response(
      JSON.stringify({ completedAddress }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in complete-address function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
