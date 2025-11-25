import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'กรุณาระบุคำถามที่ต้องการค้นหา' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Required environment variables are not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Processing query:', query);

    // Generate embedding for the query using Gemini
    const embeddingResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text: query }]
        }
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`Embedding API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.embedding.values;
    console.log('Generated query embedding');

    // Use vector similarity search to find relevant reports
    const { data: vectorResults, error: vectorError } = await supabase.rpc('find_similar_reports', {
      query_embedding: queryEmbedding,
      similarity_threshold: 0.3,
      match_limit: 50
    });

    if (vectorError) {
      console.error('Vector search error:', vectorError);
      throw new Error('ไม่สามารถค้นหาข้อมูลได้');
    }

    console.log(`Vector search found ${vectorResults?.length || 0} similar reports`);

    // Get full report details for the matching IDs
    let reports = [];
    if (vectorResults && vectorResults.length > 0) {
      const reportIds = vectorResults.map((r: any) => r.id);
      const { data: fullReports, error: detailsError } = await supabase
        .from('reports')
        .select('*')
        .in('id', reportIds)
        .order('urgency_level', { ascending: false })
        .order('created_at', { ascending: false });

      if (detailsError) {
        console.error('Error fetching report details:', detailsError);
        throw new Error('ไม่สามารถดึงรายละเอียดข้อมูลได้');
      }

      reports = fullReports || [];
    }

    console.log(`Found ${reports?.length || 0} reports`);

    // Generate natural language response
    const summaryResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'คุณคือผู้ช่วยสรุปข้อมูลผู้ประสบภัย ตอบเป็นภาษาไทยที่เข้าใจง่าย กระชับ และเป็นมิตร' },
              { text: `คำถาม: ${query}\n\nพบข้อมูล ${reports?.length || 0} รายการ\n\nสรุปข้อมูลสำคัญให้กับผู้ใช้` }
            ]
          }
        ]
      }),
    });

    const summaryData = await summaryResponse.json();
    const summary = summaryData.candidates?.[0]?.content?.parts?.[0]?.text || `พบข้อมูล ${reports?.length || 0} รายการ`;

    return new Response(
      JSON.stringify({ 
        summary,
        count: reports?.length || 0,
        reports: reports || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in query-reports function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหา' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});