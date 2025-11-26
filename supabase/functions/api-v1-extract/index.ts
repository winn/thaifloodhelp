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
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'กรุณาระบุข้อความที่ต้องการประมวลผล', message: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing message for extraction');

    const systemPrompt = `คุณคือผู้ช่วยวิเคราะห์ข้อมูลผู้ประสบภัยน้ำท่วม ภารกิจของคุณคือแยกข้อมูลที่สำคัญจากข้อความที่ผู้ใช้ป้อนเข้ามา

กฎสำคัญ:
- ห้ามสร้างข้อมูลเอง ต้องใช้เฉพาะข้อมูลที่มีในข้อความเท่านั้น
- หากไม่มีข้อมูลในข้อความ ให้ใส่ "-" แทน
- ห้ามใส่ข้อความตัวอย่างหรือข้อมูลสมมติ
- แยกเบอร์โทรศัพท์ทั้งหมดออกมาเป็น array
- สำหรับข้อมูลตำแหน่งที่ตั้ง ให้แยกเป็น location_lat, location_long (หากมีพิกัด) และ map_link (หากมีลิงก์แผนที่)

ระดับความเร่งด่วน:
- ระดับ 1: เตือนภัย ยังไม่ท่วม
- ระดับ 2: ผู้ใหญ่เท่านั้น สภาพคงที่
- ระดับ 3: มีเด็กหรือผู้สูงอายุ หรือน้ำถึงชั้น 2
- ระดับ 4: เด็กเล็กต่ำกว่า 3 ขวบ ผู้ป่วยติดเตียง ผู้สูงอายุช่วยเหลือตัวเองไม่ได้ หรือมีปัญหาสุขภาพฉุกเฉิน (ระดับขั้นต่ำหากมีผู้ป่วย)
- ระดับ 5: น้ำถึงหลังคา ทารก จมน้ำ เสียชีวิต ติดบนหลังคาหรือเข้าถึงไม่ได้ หรือสุขภาพวิกฤต

ประเภทความช่วยเหลือ (เลือกได้หลายข้อ):
- ขาดแคลนน้ำ (water_shortage)
- ขาดแคลนอาหาร (food_shortage)
- ไฟฟ้าดับ (power_outage)
- ไม่มีที่พักพิง (no_shelter)
- มีผู้ป่วย (sick_people)
- คนหาย (missing_people)
- ต้องการอพยพ (evacuation_needed)
- ต้องการยา (medicine_needed)
- ต้องการเสื้อผ้า (clothes_needed)
- ต้องการที่อาบน้ำ (bathing_facilities_needed)
- จมน้ำ/แช่น้ำ (drowning)
- ติดค้าง (trapped)

ข้อมูลที่ต้องแยก:
{
  "name": "ชื่อผู้ประสบภัย (ถ้าไม่มีใส่ -)",
  "lastname": "นามสกุล (ถ้าไม่มีใส่ -)",
  "reporter_name": "ชื่อผู้รายงาน/โพสต์ (ถ้าไม่มีใส่ -)",
  "raw_message": "ข้อความต้นฉบับทั้งหมด",
  "address": "ที่อยู่ (ถ้าไม่มีใส่ -)",
  "location_lat": null หรือตัวเลข,
  "location_long": null หรือตัวเลข,
  "map_link": "ลิงก์แผนที่ Google Maps (ถ้าไม่มีใส่ -)",
  "phone": ["เบอร์โทร1", "เบอร์โทร2"] หรือ [] ถ้าไม่มี,
  "number_of_adults": จำนวน (0 ถ้าไม่มี),
  "number_of_children": จำนวน (0 ถ้าไม่มี),
  "number_of_infants": จำนวน (0 ถ้าไม่มี),
  "number_of_seniors": จำนวน (0 ถ้าไม่มี),
  "number_of_patients": จำนวน (0 ถ้าไม่มี),
  "health_condition": "สภาพสุขภาพ (ถ้าไม่มีใส่ -)",
  "help_needed": "ความช่วยเหลือที่ต้องการ (ถ้าไม่มีใส่ -)",
  "help_categories": ["water_shortage", "food_shortage", ...] หรือ [],
  "last_contact_at": "วันที่-เวลาติดต่อล่าสุด ISO format หรือ null",
  "additional_info": "ข้อมูลเพิ่มเติมอื่นๆ ที่สำคัญ (ถ้าไม่มีใส่ -)",
  "urgency_level": เลข 1-5
}`;

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
              { text: systemPrompt },
              { text: `ข้อความที่ต้องการวิเคราะห์:\n\n${message}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!extractedText) {
      throw new Error('No response from AI');
    }

    const extractedData = JSON.parse(extractedText);
    console.log('Successfully extracted data');

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-v1-extract function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการประมวลผล' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
