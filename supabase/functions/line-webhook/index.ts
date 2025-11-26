import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-line-signature',
};

// LINE Messaging API URLs
const LINE_API_URL = 'https://api.line.me/v2/bot/message/reply';
const LINE_CONTENT_URL = 'https://api-data.line.me/v2/bot/message';

// Helper: Verify LINE signature
async function verifySignature(body: string, signature: string, channelSecret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = encoder.encode(channelSecret);
  const message = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return signature === computedSignature;
}

// Helper: Send reply message to LINE
async function replyMessage(replyToken: string, messages: any[], channelAccessToken: string) {
  const response = await fetch(LINE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LINE API error:', response.status, errorText);
    throw new Error(`LINE API error: ${response.status}`);
  }

  return response.json();
}

// Helper: Get image content from LINE
async function getImageContent(messageId: string, channelAccessToken: string): Promise<string> {
  const response = await fetch(`${LINE_CONTENT_URL}/${messageId}/content`, {
    headers: {
      'Authorization': `Bearer ${channelAccessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get image content: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return `data:image/jpeg;base64,${base64}`;
}

// Helper: Call OCR function
async function performOCR(imageBase64: string, supabaseUrl: string, supabaseKey: string): Promise<string> {
  const response = await fetch(`${supabaseUrl}/functions/v1/ocr-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    throw new Error('OCR failed');
  }

  const data = await response.json();
  return data.text || '';
}

// Helper: Call extract-report function
async function extractReport(rawMessage: string, supabaseUrl: string, supabaseKey: string): Promise<any[]> {
  const response = await fetch(`${supabaseUrl}/functions/v1/extract-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ rawMessage }),
  });

  if (!response.ok) {
    throw new Error('Extract report failed');
  }

  const data = await response.json();
  return data.reports || [];
}

// Helper: Generate embedding
async function generateEmbedding(text: string, supabaseUrl: string, supabaseKey: string): Promise<number[]> {
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-embedding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Generate embedding failed');
  }

  const data = await response.json();
  return data.embedding || [];
}

// Helper: Check duplicates
async function checkDuplicates(embedding: number[], supabaseUrl: string, supabaseKey: string): Promise<any[]> {
  const response = await fetch(`${supabaseUrl}/functions/v1/check-duplicates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ embedding, threshold: 0.85 }),
  });

  if (!response.ok) {
    throw new Error('Check duplicates failed');
  }

  const data = await response.json();
  return data.duplicates || [];
}

// Helper: Get urgency label
function getUrgencyLabel(level: number): string {
  switch (level) {
    case 1: return "ต่ำ (เตือนภัย)";
    case 2: return "ปานกลาง";
    case 3: return "สูง";
    case 4: return "สูงมาก";
    case 5: return "วิกฤติ";
    default: return "ไม่ระบุ";
  }
}

// Helper: Get urgency color
function getUrgencyColor(level: number): string {
  switch (level) {
    case 1: return "#4CAF50";
    case 2: return "#FFC107";
    case 3: return "#FF9800";
    case 4: return "#F44336";
    case 5: return "#9C27B0";
    default: return "#9E9E9E";
  }
}

// Helper: Get help category Thai name
function getHelpCategoryName(category: string): string {
  const categories: Record<string, string> = {
    drowning: "จมน้ำ",
    trapped: "ติดขัง",
    water: "ขาดน้ำดื่ม",
    food: "ขาดอาหาร",
    electricity: "ขาดไฟฟ้า",
    shelter: "ต้องการที่พักพิง",
    medical: "ต้องการรักษา",
    medicine: "ขาดยา",
    evacuation: "ต้องการอพยพ",
    missing: "คนหาย",
    clothes: "ต้องการเสื้อผ้า",
    unreachable: "ติดต่อไม่ได้",
    other: "อื่นๆ",
  };
  return categories[category] || category;
}

// Create Flex Message for report review
function createReviewFlexMessage(report: any, reportIndex: number, sessionId: string): any {
  const totalPeople = (report.number_of_adults || 0) +
                      (report.number_of_children || 0) +
                      (report.number_of_infants || 0) +
                      (report.number_of_seniors || 0);

  const urgencyLevel = report.urgency_level || 1;
  const urgencyColor = getUrgencyColor(urgencyLevel);
  const urgencyLabel = getUrgencyLabel(urgencyLevel);

  const helpCategories = (report.help_categories || [])
    .map((c: string) => getHelpCategoryName(c))
    .join(", ") || "ไม่ระบุ";

  const bodyContents: any[] = [
    {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: "ระดับความเร่งด่วน",
          size: "sm",
          color: "#555555",
          flex: 0
        },
        {
          type: "text",
          text: urgencyLabel,
          size: "sm",
          color: urgencyColor,
          weight: "bold",
          align: "end"
        }
      ]
    },
    {
      type: "separator",
      margin: "md"
    }
  ];

  // Name
  if (report.name) {
    bodyContents.push({
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        { type: "text", text: "ชื่อ", size: "sm", color: "#555555", flex: 2 },
        { type: "text", text: report.name + (report.lastname ? ` ${report.lastname}` : ''), size: "sm", color: "#111111", flex: 5, wrap: true }
      ]
    });
  }

  // Phone
  if (report.phone && report.phone.length > 0) {
    bodyContents.push({
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        { type: "text", text: "โทรศัพท์", size: "sm", color: "#555555", flex: 2 },
        { type: "text", text: report.phone.join(", "), size: "sm", color: "#111111", flex: 5, wrap: true }
      ]
    });
  }

  // Address
  if (report.address) {
    bodyContents.push({
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        { type: "text", text: "ที่อยู่", size: "sm", color: "#555555", flex: 2 },
        { type: "text", text: report.address, size: "sm", color: "#111111", flex: 5, wrap: true }
      ]
    });
  }

  // People count
  if (totalPeople > 0) {
    const peopleParts: string[] = [];
    if (report.number_of_adults > 0) peopleParts.push(`ผู้ใหญ่ ${report.number_of_adults}`);
    if (report.number_of_children > 0) peopleParts.push(`เด็ก ${report.number_of_children}`);
    if (report.number_of_infants > 0) peopleParts.push(`ทารก ${report.number_of_infants}`);
    if (report.number_of_seniors > 0) peopleParts.push(`ผู้สูงอายุ ${report.number_of_seniors}`);
    if (report.number_of_patients > 0) peopleParts.push(`ผู้ป่วย ${report.number_of_patients}`);

    bodyContents.push({
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        { type: "text", text: "จำนวนคน", size: "sm", color: "#555555", flex: 2 },
        { type: "text", text: peopleParts.join(", "), size: "sm", color: "#111111", flex: 5, wrap: true }
      ]
    });
  }

  // Health condition
  if (report.health_condition) {
    bodyContents.push({
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        { type: "text", text: "สุขภาพ", size: "sm", color: "#555555", flex: 2 },
        { type: "text", text: report.health_condition, size: "sm", color: "#111111", flex: 5, wrap: true }
      ]
    });
  }

  // Help needed
  if (report.help_needed) {
    bodyContents.push({
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        { type: "text", text: "ต้องการ", size: "sm", color: "#555555", flex: 2 },
        { type: "text", text: report.help_needed, size: "sm", color: "#111111", flex: 5, wrap: true }
      ]
    });
  }

  // Help categories
  bodyContents.push({
    type: "box",
    layout: "horizontal",
    margin: "md",
    contents: [
      { type: "text", text: "ประเภท", size: "sm", color: "#555555", flex: 2 },
      { type: "text", text: helpCategories, size: "sm", color: "#111111", flex: 5, wrap: true }
    ]
  });

  return {
    type: "flex",
    altText: `รายงานขอความช่วยเหลือ #${reportIndex + 1}`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: urgencyColor,
        contents: [
          {
            type: "text",
            text: `รายงานขอความช่วยเหลือ #${reportIndex + 1}`,
            color: "#FFFFFF",
            weight: "bold",
            size: "lg"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: bodyContents
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#06C755",
            action: {
              type: "postback",
              label: "ยืนยันส่งรายงาน",
              data: `action=submit&session=${sessionId}&index=${reportIndex}`
            }
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "postback",
              label: "ยกเลิก",
              data: `action=cancel&session=${sessionId}&index=${reportIndex}`
            }
          }
        ]
      }
    }
  };
}

// Create thank you message
function createThankYouMessage(): any {
  return {
    type: "flex",
    altText: "ขอบคุณครับ",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "ขอบคุณครับ",
            weight: "bold",
            size: "xl",
            color: "#06C755",
            align: "center"
          },
          {
            type: "text",
            text: "ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว",
            size: "sm",
            color: "#555555",
            align: "center",
            margin: "md",
            wrap: true
          },
          {
            type: "text",
            text: "ทีมงานจะดำเนินการช่วยเหลือโดยเร็วที่สุด",
            size: "sm",
            color: "#555555",
            align: "center",
            margin: "sm",
            wrap: true
          }
        ]
      }
    }
  };
}

// Store session data in memory (for demo, in production use Redis or database)
const sessionStore = new Map<string, { reports: any[], lineUserId: string, lineDisplayName: string }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LINE_CHANNEL_SECRET = Deno.env.get('LINE_CHANNEL_SECRET');
    const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LINE_CHANNEL_SECRET || !LINE_CHANNEL_ACCESS_TOKEN) {
      throw new Error('LINE credentials not configured');
    }

    const bodyText = await req.text();
    const signature = req.headers.get('x-line-signature') || '';

    // Verify LINE signature
    const isValid = await verifySignature(bodyText, signature, LINE_CHANNEL_SECRET);
    if (!isValid) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const body = JSON.parse(bodyText);
    const events = body.events || [];

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    for (const event of events) {
      const replyToken = event.replyToken;
      const userId = event.source?.userId || '';

      // Handle message events
      if (event.type === 'message') {
        const message = event.message;
        let rawMessage = '';

        // Handle text message
        if (message.type === 'text') {
          rawMessage = message.text;
        }
        // Handle image message
        else if (message.type === 'image') {
          try {
            // Get image content from LINE
            const imageBase64 = await getImageContent(message.id, LINE_CHANNEL_ACCESS_TOKEN);

            // Perform OCR
            rawMessage = await performOCR(imageBase64, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            if (!rawMessage || rawMessage === 'ไม่พบข้อความในรูปภาพ') {
              await replyMessage(replyToken, [{
                type: 'text',
                text: 'ไม่พบข้อความในรูปภาพ กรุณาส่งรูปที่มีข้อความชัดเจน หรือพิมพ์ข้อความโดยตรง'
              }], LINE_CHANNEL_ACCESS_TOKEN);
              continue;
            }
          } catch (error) {
            console.error('Image processing error:', error);
            await replyMessage(replyToken, [{
              type: 'text',
              text: 'เกิดข้อผิดพลาดในการอ่านรูปภาพ กรุณาลองใหม่อีกครั้ง'
            }], LINE_CHANNEL_ACCESS_TOKEN);
            continue;
          }
        } else {
          // Unsupported message type
          await replyMessage(replyToken, [{
            type: 'text',
            text: 'กรุณาส่งข้อความหรือรูปภาพที่มีข้อมูลผู้ประสบภัยน้ำท่วม'
          }], LINE_CHANNEL_ACCESS_TOKEN);
          continue;
        }

        // Extract report data
        try {
          const reports = await extractReport(rawMessage, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

          if (!reports || reports.length === 0) {
            await replyMessage(replyToken, [{
              type: 'text',
              text: 'ไม่สามารถแยกข้อมูลจากข้อความได้ กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง\n\nตัวอย่างข้อความ:\n"ต้องการความช่วยเหลือ คุณสมชาย 081-234-5678 บ้านเลขที่ 123 ม.5 ต.บางนา อ.บางนา กทม. มีผู้สูงอายุ 2 คน น้ำท่วมชั้น 1"'
            }], LINE_CHANNEL_ACCESS_TOKEN);
            continue;
          }

          // Get LINE profile
          let lineDisplayName = '';
          try {
            const profileResponse = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
              headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
            });
            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              lineDisplayName = profile.displayName || '';
            }
          } catch (e) {
            console.error('Failed to get LINE profile:', e);
          }

          // Store session
          const sessionId = crypto.randomUUID();
          sessionStore.set(sessionId, {
            reports,
            lineUserId: userId,
            lineDisplayName
          });

          // Set session timeout (30 minutes)
          setTimeout(() => {
            sessionStore.delete(sessionId);
          }, 30 * 60 * 1000);

          // Create Flex Messages for each report (max 5 bubbles)
          const flexMessages = reports.slice(0, 5).map((report, index) =>
            createReviewFlexMessage(report, index, sessionId)
          );

          await replyMessage(replyToken, flexMessages, LINE_CHANNEL_ACCESS_TOKEN);

        } catch (error) {
          console.error('Extract report error:', error);
          await replyMessage(replyToken, [{
            type: 'text',
            text: 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล กรุณาลองใหม่อีกครั้ง'
          }], LINE_CHANNEL_ACCESS_TOKEN);
        }
      }
      // Handle postback events (button clicks)
      else if (event.type === 'postback') {
        const postbackData = new URLSearchParams(event.postback.data);
        const action = postbackData.get('action');
        const sessionId = postbackData.get('session');
        const reportIndex = parseInt(postbackData.get('index') || '0');

        if (action === 'submit' && sessionId) {
          const session = sessionStore.get(sessionId);

          if (!session) {
            await replyMessage(replyToken, [{
              type: 'text',
              text: 'เซสชันหมดอายุ กรุณาส่งข้อมูลใหม่อีกครั้ง'
            }], LINE_CHANNEL_ACCESS_TOKEN);
            continue;
          }

          const report = session.reports[reportIndex];
          if (!report) {
            await replyMessage(replyToken, [{
              type: 'text',
              text: 'ไม่พบข้อมูลรายงาน กรุณาส่งข้อมูลใหม่อีกครั้ง'
            }], LINE_CHANNEL_ACCESS_TOKEN);
            continue;
          }

          try {
            // Generate embedding
            const embedding = await generateEmbedding(report.raw_message, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            // Check for duplicates
            const duplicates = await checkDuplicates(embedding, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            if (duplicates.length > 0) {
              // Update existing report's timestamp
              await supabase
                .from('reports')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', duplicates[0].id);

              await replyMessage(replyToken, [{
                type: 'text',
                text: 'พบข้อมูลที่คล้ายกันในระบบแล้ว ระบบได้อัปเดตเวลาล่าสุดให้เรียบร้อยแล้วครับ'
              }], LINE_CHANNEL_ACCESS_TOKEN);
            } else {
              // Insert new report
              const { error: insertError } = await supabase
                .from('reports')
                .insert({
                  name: report.name || '',
                  lastname: report.lastname || '',
                  reporter_name: report.reporter_name || session.lineDisplayName || '',
                  address: report.address || '',
                  phone: report.phone || [],
                  location_lat: report.location_lat ? parseFloat(report.location_lat) : null,
                  location_long: report.location_long ? parseFloat(report.location_long) : null,
                  map_link: report.map_link || '',
                  last_contact_at: report.last_contact_at || null,
                  number_of_adults: report.number_of_adults || 0,
                  number_of_children: report.number_of_children || 0,
                  number_of_infants: report.number_of_infants || 0,
                  number_of_seniors: report.number_of_seniors || 0,
                  number_of_patients: report.number_of_patients || 0,
                  health_condition: report.health_condition || '',
                  help_needed: report.help_needed || '',
                  help_categories: report.help_categories || [],
                  additional_info: report.additional_info || '',
                  urgency_level: report.urgency_level || 1,
                  status: 'pending',
                  raw_message: report.raw_message || '',
                  embedding,
                  line_user_id: session.lineUserId,
                  line_display_name: session.lineDisplayName,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

              if (insertError) {
                throw insertError;
              }

              await replyMessage(replyToken, [createThankYouMessage()], LINE_CHANNEL_ACCESS_TOKEN);
            }

            // Remove from session
            session.reports.splice(reportIndex, 1);
            if (session.reports.length === 0) {
              sessionStore.delete(sessionId);
            }

          } catch (error) {
            console.error('Submit error:', error);
            await replyMessage(replyToken, [{
              type: 'text',
              text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'
            }], LINE_CHANNEL_ACCESS_TOKEN);
          }
        }
        else if (action === 'cancel' && sessionId) {
          const session = sessionStore.get(sessionId);

          if (session) {
            session.reports.splice(reportIndex, 1);
            if (session.reports.length === 0) {
              sessionStore.delete(sessionId);
            }
          }

          await replyMessage(replyToken, [{
            type: 'text',
            text: 'ยกเลิกรายงานนี้แล้วครับ'
          }], LINE_CHANNEL_ACCESS_TOKEN);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in line-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
