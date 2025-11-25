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

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing message extraction...');

    const systemPrompt = `You are an expert Thai language data extraction specialist for flood disaster victim information.

🚨 CRITICAL RULES - ABSOLUTE ZERO HALLUCINATION POLICY:
1. Extract ONLY information that is EXPLICITLY stated in the raw message
2. NEVER infer, assume, guess, or generate any information
3. If information is not clearly present, use empty values (empty string "", empty array [], or 0)
4. NEVER add example data, placeholder text, or explanatory notes
5. This is a life-critical disaster relief system - accuracy is PARAMOUNT

URGENCY LEVEL CLASSIFICATION (urgency_level):
Level 1: ไม่มีน้ำท่วม หรือเป็นเพียงการเตือน - Not flooded yet / warning only
Level 2: มีแต่ผู้ใหญ่ ไม่มีเด็ก/ผู้สูงอายุ/ทารก/ผู้ป่วย น้ำท่วมชั้นล่าง - Adults only, no vulnerable groups, ground floor flooded
Level 3: มีเด็ก หรือผู้สูงอายุ หรือน้ำถึงชั้นสอง - Has children OR seniors, OR water reached second floor
Level 4: มีเด็กเล็กมาก (<3 ปี) หรือทารก หรือมีคนไข้/ผู้ป่วยติดเตียง หรือคนที่ช่วยเหลือตัวเองไม่ได้ ยังไม่ถึงขั้นวิกฤติ - Very young children (<3 years) OR infants OR sick people/bedridden patients (มีคนไข้, ป่วยติดเตียง) OR people unable to self-rescue, not yet critical
Level 5: วิกฤติ - น้ำถึงหลังคา/ติดบนหลังคา (water at roof level/stuck on roof), ทารกตกอยู่ในอันตราย (infants in danger), คนไข้อาการหนัก/ฉุกเฉิน (patients with serious conditions/medical emergency), ผู้สูงอายุช่วยเหลือตัวเองไม่ได้ (elderly unable to self-rescue), หรือมีคนตาย (someone dead/dying)

IMPORTANT: 
- If mentions patients/sick people (มีคนไข้, ผู้ป่วย, ติดเตียง) → minimum level 4
- If mentions roof/stuck on roof (หลังคา, ติดบนหลังคา) → level 5
- If mentions someone dead/dying (คนตาย, กำลังจะตาย) → level 5

EXTRACTION GUIDELINES:
- reporter_name: Extract from social media profile name or signature in message (empty if not present)
- last_contact_at: Only if explicitly stated like "วันที่ 22", "6ชม." etc. Convert to readable format (empty if not present)
- name/lastname: Only if clearly stated (empty if not present)
- address: Copy exact address from message, preserve all details (empty if not present)
- phone: Array of phone numbers only if present (empty array if not present)
- location_lat/location_long: Only if GPS coordinates given (empty if not present)
- map_link: Extract Google Maps link if present (e.g., "https://maps.google.com/...", "https://goo.gl/maps/...", "maps.app.goo.gl/..."). Copy the exact URL (empty if not present)
- number_of_adults: Count all adults (18+ years) including patients, parents, siblings, relatives mentioned. If message says "มีแม่ พ่อ น้องชาย" count as 3 adults. Patients who are adults count in BOTH number_of_adults AND number_of_patients.
- number_of_children: Count children (3-17 years) only if explicitly mentioned (0 if not present)
- number_of_seniors: Count elderly people (60+ years) only if explicitly mentioned (0 if not present)
- number_of_infants: Count babies/infants (0-2 years old) only if stated (0 if not present)
- number_of_patients: Count people with medical conditions (ป่วย, ติดเตียง, โรคประจำตัว) separately. If patient is an adult, they should be counted in BOTH number_of_patients AND number_of_adults.
- health_condition: Only mention if health issues are stated like "ป่วย", "ติดเตียง", "โรคหัวใจ" (empty if not present)
- help_needed: Only if specifically requested like "ต้องการเรือ", "ขาดอาหาร" (empty if not present)
- help_categories: Array of category IDs for help types mentioned:
  * drowning (จมน้ำ) - person in water/drowning
  * trapped (ติดขัง) - trapped/stuck, water blocking all paths (น้ำปิดทุกทาง), cannot leave (ออกไม่ได้)
  * water (ขาดน้ำดื่ม) - lack of drinking water
  * food (ขาดอาหาร) - lack of food
  * electricity (ขาดไฟฟ้า) - no electricity
  * shelter (ต้องการที่พักพิง) - need shelter
  * medical (คนเจ็บ/ต้องการรักษา) - injured/need medical care
  * medicine (ขาดยา) - need medicine
  * evacuation (ต้องการอพยพ) - need evacuation
  * missing (คนหาย) - missing person
  * clothes (เสื้อผ้า) - need clothes
  * unreachable (ติดต่อไม่ได้) - cannot contact/unreachable
  * other (อื่นๆ) - other needs
  (empty array if not present)
- additional_info: Other important details not covered above (empty if not present)

EXAMPLE OF CORRECT EXTRACTION:
Input: "คุณนิด 087-123-4567 บ้านเลขที่ 123 หมู่ 5 ต.แม่กา อ.เมือง จ.เชียงใหม่ มีผู้สูงอายุ 2 คน เด็ก 1 คน น้ำท่วมชั้นสอง"
Output: {
  name: "นิด",
  phone: ["087-123-4567"],
  address: "บ้านเลขที่ 123 หมู่ 5 ต.แม่กา อ.เมือง จ.เชียงใหม่",
  number_of_seniors: 2,
  number_of_children: 1,
  urgency_level: 3,
  (all other fields empty)
}

REMEMBER: When in doubt, leave it empty. Wrong data is worse than no data in a disaster relief system.`;

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
              { text: `แยกข้อมูลจากข้อความนี้:\n\n${rawMessage}` }
            ]
          }
        ],
        tools: [
          {
            function_declarations: [
              {
                name: 'extract_report_data',
                description: 'แยกข้อมูลผู้ประสบภัยจากข้อความ',
                parameters: {
                  type: 'object',
                  properties: {
                    reporter_name: { 
                      type: 'string', 
                      description: 'ชื่อของผู้รายงาน/แจ้งเรื่อง ที่มาจากชื่อโปรไฟล์หรือลายเซ็นในข้อความ' 
                    },
                    last_contact_at: { 
                      type: 'string', 
                      description: 'วันเวลาที่ติดต่อล่าสุด ในรูปแบบ ISO 8601 (ถ้ามีระบุ เช่น "วันที่ 22" "เมื่อวาน")' 
                    },
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
                    map_link: { 
                      type: 'string', 
                      description: 'ลิงก์ Google Maps (ถ้ามี เช่น https://maps.google.com/... หรือ https://goo.gl/maps/... หรือ maps.app.goo.gl/...)' 
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
                    number_of_infants: { 
                      type: 'integer', 
                      description: 'จำนวนทารก (อายุ 0-2 ปี)' 
                    },
                    number_of_seniors: { 
                      type: 'integer', 
                      description: 'จำนวนผู้สูงอายุ (อายุมากกว่า 60 ปี)' 
                    },
                    number_of_patients: { 
                      type: 'integer', 
                      description: 'จำนวนผู้ป่วย หรือผู้ที่มีภาวะสุขภาพพิเศษ' 
                    },
                    health_condition: { 
                      type: 'string', 
                      description: 'ภาวะสุขภาพพิเศษ เช่น ป่วย พิการ ติดเตียง' 
                    },
                    help_needed: { 
                      type: 'string', 
                      description: 'ความช่วยเหลือที่ต้องการ เช่น เรือ อาหาร น้ำดื่ม ยา' 
                    },
                      help_categories: { 
                      type: 'array',
                      items: { 
                        type: 'string',
                        enum: ['drowning', 'trapped', 'water', 'food', 'electricity', 'shelter', 'medical', 'medicine', 'evacuation', 'missing', 'clothes', 'unreachable', 'other']
                      },
                      description: 'ประเภทความช่วยเหลือที่ต้องการ: drowning (จมน้ำ), trapped (ติดขัง/น้ำปิดทุกทาง), water (ขาดน้ำดื่ม), food (ขาดอาหาร), electricity (ขาดไฟฟ้า), shelter (ต้องการที่พักพิง), medical (คนเจ็บ/ต้องการรักษา), medicine (ขาดยา), evacuation (ต้องการอพยพ), missing (คนหาย), clothes (เสื้อผ้า), unreachable (ติดต่อไม่ได้), other (อื่นๆ)' 
                    },
                    additional_info: { 
                      type: 'string', 
                      description: 'ข้อมูลเพิ่มเติมที่สำคัญอื่นๆ ที่ควรบันทึก' 
                    },
                    urgency_level: { 
                      type: 'integer', 
                      description: 'ระดับความเร่งด่วน 1-5 ตามเกณฑ์ที่กำหนด'
                    }
                  },
                  required: []
                }
              }
            ]
          }
        ],
        tool_config: {
          function_calling_config: {
            mode: 'ANY',
            allowed_function_names: ['extract_report_data']
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        // Paid tier still has rate limits but higher - retry after 5 seconds
        console.log('Rate limit hit, waiting 5 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Retry the request once
        const retryResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
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
                  { text: `แยกข้อมูลจากข้อความนี้:\n\n${rawMessage}` }
                ]
              }
            ],
            tools: [
              {
                function_declarations: [
                  {
                    name: 'extract_report_data',
                    description: 'แยกข้อมูลผู้ประสบภัยจากข้อความ',
                    parameters: {
                      type: 'object',
                      properties: {
                        reporter_name: { type: 'string', description: 'ชื่อของผู้รายงาน/แจ้งเรื่อง ที่มาจากชื่อโปรไฟล์หรือลายเซ็นในข้อความ' },
                        last_contact_at: { type: 'string', description: 'วันเวลาที่ติดต่อล่าสุด ในรูปแบบ ISO 8601 (ถ้ามีระบุ เช่น "วันที่ 22" "เมื่อวาน")' },
                        name: { type: 'string', description: 'ชื่อของผู้ประสบภัย' },
                        lastname: { type: 'string', description: 'นามสกุลของผู้ประสบภัย' },
                        address: { type: 'string', description: 'ที่อยู่แบบละเอียด รวมหมู่บ้าน ซอย ถนน ตำบล อำเภอ จังหวัด' },
                        location_lat: { type: 'string', description: 'ละติจูด (ถ้ามี)' },
                        location_long: { type: 'string', description: 'ลองติจูด (ถ้ามี)' },
                        map_link: { type: 'string', description: 'ลิงก์ Google Maps (ถ้ามี)' },
                        phone: { type: 'array', items: { type: 'string' }, description: 'เบอร์โทรศัพท์ทั้งหมด' },
                        number_of_adults: { type: 'integer', description: 'จำนวนผู้ใหญ่' },
                        number_of_children: { type: 'integer', description: 'จำนวนเด็ก (อายุต่ำกว่า 18 ปี)' },
                         number_of_seniors: { type: 'integer', description: 'จำนวนผู้สูงอายุ (อายุมากกว่า 60 ปี)' },
                         number_of_infants: { type: 'integer', description: 'จำนวนทารก (อายุ 0-2 ปี)' },
                         number_of_patients: { type: 'integer', description: 'จำนวนผู้ป่วย หรือผู้ที่มีภาวะสุขภาพพิเศษ' },
                         health_condition: { type: 'string', description: 'ภาวะสุขภาพพิเศษ เช่น ป่วย พิการ ติดเตียง' },
                         help_needed: { type: 'string', description: 'ความช่วยเหลือที่ต้องการ เช่น เรือ อาหาร น้ำดื่ม ยา' },
                         help_categories: { type: 'array', items: { type: 'string', enum: ['drowning', 'trapped', 'water', 'food', 'electricity', 'shelter', 'medical', 'medicine', 'evacuation', 'missing', 'clothes', 'unreachable', 'other'] }, description: 'ประเภทความช่วยเหลือที่ต้องการ' },
                         additional_info: { type: 'string', description: 'ข้อมูลเพิ่มเติมที่สำคัญอื่นๆ ที่ควรบันทึก' },
                        urgency_level: { type: 'integer', description: 'ระดับความเร่งด่วน 1-5 ตามเกณฑ์ที่กำหนด' }
                      },
                      required: []
                    }
                  }
                ]
              }
            ],
            tool_config: {
              function_calling_config: {
                mode: 'ANY',
                allowed_function_names: ['extract_report_data']
              }
            }
          }),
        });
        
        if (!retryResponse.ok) {
          const retryError = await retryResponse.text();
          console.error('Retry failed:', retryResponse.status, retryError);
          return new Response(
            JSON.stringify({ error: 'ยังคงเจอ rate limit - กรุณารอสักครู่แล้วลองใหม่' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const data = await retryResponse.json();
        console.log('Retry successful');
        
        const functionCalls = data.candidates?.[0]?.content?.parts?.filter((part: any) => part.functionCall);
        if (!functionCalls || functionCalls.length === 0) {
          throw new Error('No function call in AI response');
        }

        const extractedReports = functionCalls.map((part: any) => {
          const extractedData = part.functionCall.args;
          return {
            ...extractedData,
            raw_message: rawMessage,
            reporter_name: extractedData.reporter_name || '',
            last_contact_at: extractedData.last_contact_at || '',
            lastname: extractedData.lastname || '',
            location_lat: extractedData.location_lat || '',
            location_long: extractedData.location_long || '',
            phone: extractedData.phone || [],
        number_of_adults: extractedData.number_of_adults || 0,
        number_of_children: extractedData.number_of_children || 0,
        number_of_infants: extractedData.number_of_infants || 0,
        number_of_seniors: extractedData.number_of_seniors || 0,
        number_of_patients: extractedData.number_of_patients || 0,
            health_condition: extractedData.health_condition || '',
            help_needed: extractedData.help_needed || '',
            help_categories: extractedData.help_categories || [],
            additional_info: extractedData.additional_info || '',
            name: extractedData.name || '',
            address: extractedData.address || '',
            urgency_level: extractedData.urgency_level || 1,
          };
        });

        return new Response(
          JSON.stringify({ reports: extractedReports, count: extractedReports.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    // Extract function calls from Gemini format
    const functionCalls = data.candidates?.[0]?.content?.parts?.filter((part: any) => part.functionCall);
    if (!functionCalls || functionCalls.length === 0) {
      throw new Error('No function call in AI response');
    }

    // Process all extracted reports
    const extractedReports = functionCalls.map((part: any) => {
      const extractedData = part.functionCall.args;
      
      return {
        ...extractedData,
        raw_message: rawMessage,
        // Set defaults for optional fields - use empty string instead of examples
        reporter_name: extractedData.reporter_name || '',
        last_contact_at: extractedData.last_contact_at || '',
        lastname: extractedData.lastname || '',
        location_lat: extractedData.location_lat || '',
        location_long: extractedData.location_long || '',
        map_link: extractedData.map_link || '',
        phone: extractedData.phone || [],
        number_of_adults: extractedData.number_of_adults || 0,
        number_of_children: extractedData.number_of_children || 0,
        number_of_seniors: extractedData.number_of_seniors || 0,
        number_of_infants: extractedData.number_of_infants || 0,
        number_of_patients: extractedData.number_of_patients || 0,
        health_condition: extractedData.health_condition || '',
        help_needed: extractedData.help_needed || '',
        help_categories: extractedData.help_categories || [],
        additional_info: extractedData.additional_info || '',
        name: extractedData.name || '',
        address: extractedData.address || '',
        urgency_level: extractedData.urgency_level || 1,
      };
    });

    console.log('Extracted reports:', extractedReports);

    return new Response(
      JSON.stringify({ 
        reports: extractedReports,
        count: extractedReports.length 
      }),
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