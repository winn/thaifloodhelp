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
    const { rawMessage } = await req.json();
    
    if (!rawMessage || typeof rawMessage !== 'string') {
      return new Response(
        JSON.stringify({ error: 'กรุณาระบุข้อความที่ต้องการประมวลผล' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing message extraction...');

    const systemPrompt = `คุณคือผู้ช่วยที่เชี่ยวชาญในการแยกข้อมูลผู้ประสบภัยน้ำท่วมจากข้อความภาษาไทย

กฎสำคัญสำหรับการจัดระดับความเร่งด่วน (urgency_level):
- ระดับ 1: ยังไม่โดนน้ำ / แจ้งเตือนเฉย ๆ
- ระดับ 2: ผู้ใหญ่ทั้งหมด ไม่มีเด็ก ไม่มีผู้สูงอายุ น้ำท่วมชั้นล่าง
- ระดับ 3: มีเด็กเล็ก หรือผู้สูงอายุ หรือน้ำท่วมถึงชั้นสอง
- ระดับ 4: มีเด็กเล็กมาก (ต่ำกว่า 3 ขวบ) หรือคนช่วยเหลือตัวเองไม่ได้ แต่ยังไม่ถึงขั้นวิกฤต
- ระดับ 5: น้ำถึงหลังคา, เด็กทารก, ผู้สูงอายุช่วยตัวเองไม่ได้, คนเจ็บ/ภาวะฉุกเฉิน

แยกข้อมูลให้ครบถ้วนและถูกต้องที่สุด โดยเฉพาะ:
- ชื่อและนามสกุล (แยกให้ชัดเจน)
- เบอร์โทรศัพท์ (เก็บเป็น array หากมีหลายเบอร์)
- ที่อยู่แบบละเอียด
- จำนวนผู้ประสบภัยแยกตามกลุ่มอายุ
- ภาวะสุขภาพที่สำคัญ
- ความช่วยเหลือที่ต้องการ
- ประเมินระดับความเร่งด่วนตามเกณฑ์ที่กำหนด`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `แยกข้อมูลจากข้อความนี้:\n\n${rawMessage}` }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_report_data',
              description: 'แยกข้อมูลผู้ประสบภัยจากข้อความ',
              parameters: {
                type: 'object',
                properties: {
                  name: { 
                    type: 'string', 
                    description: 'ชื่อของผู้ประสบภัย' 
                  },
                  lastname: { 
                    type: 'string', 
                    description: 'นามสกุลของผู้ประสบภัย' 
                  },
                  address: { 
                    type: 'string', 
                    description: 'ที่อยู่แบบละเอียด รวมหมู่บ้าน ซอย ถนน ตำบล อำเภอ จังหวัด' 
                  },
                  location_lat: { 
                    type: 'string', 
                    description: 'ละติจูด (ถ้ามี)' 
                  },
                  location_long: { 
                    type: 'string', 
                    description: 'ลองติจูด (ถ้ามี)' 
                  },
                  phone: { 
                    type: 'array',
                    items: { type: 'string' },
                    description: 'เบอร์โทรศัพท์ทั้งหมด' 
                  },
                  number_of_adults: { 
                    type: 'integer', 
                    description: 'จำนวนผู้ใหญ่' 
                  },
                  number_of_children: { 
                    type: 'integer', 
                    description: 'จำนวนเด็ก (อายุต่ำกว่า 18 ปี)' 
                  },
                  number_of_seniors: { 
                    type: 'integer', 
                    description: 'จำนวนผู้สูงอายุ (อายุมากกว่า 60 ปี)' 
                  },
                  health_condition: { 
                    type: 'string', 
                    description: 'ภาวะสุขภาพพิเศษ เช่น ป่วย พิการ ติดเตียง' 
                  },
                  help_needed: { 
                    type: 'string', 
                    description: 'ความช่วยเหลือที่ต้องการ เช่น เรือ อาหาร น้ำดื่ม ยา' 
                  },
                  urgency_level: { 
                    type: 'integer', 
                    description: 'ระดับความเร่งด่วน 1-5 ตามเกณฑ์ที่กำหนด',
                    enum: [1, 2, 3, 4, 5]
                  }
                },
                required: ['name', 'address', 'urgency_level']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_report_data' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'ระบบกำลังใช้งานหนัก กรุณาลองใหม่อีกครั้ง' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'ระบบต้องเติมเครดิต กรุณาติดต่อผู้ดูแลระบบ' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    // Extract function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function) {
      throw new Error('No function call in AI response');
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    
    // Add raw_message to the result
    const result = {
      ...extractedData,
      raw_message: rawMessage,
      // Set defaults for optional fields
      lastname: extractedData.lastname || '',
      location_lat: extractedData.location_lat || '',
      location_long: extractedData.location_long || '',
      phone: extractedData.phone || [],
      number_of_adults: extractedData.number_of_adults || 0,
      number_of_children: extractedData.number_of_children || 0,
      number_of_seniors: extractedData.number_of_seniors || 0,
      health_condition: extractedData.health_condition || '',
      help_needed: extractedData.help_needed || '',
    };

    console.log('Extracted data:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-report function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});