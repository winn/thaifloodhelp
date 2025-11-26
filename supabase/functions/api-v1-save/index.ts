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
    const reportData = await req.json();
    
    // Validate required fields
    if (!reportData.name || !reportData.raw_message) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ข้อมูลไม่ครบถ้วน กรุณาระบุ name และ raw_message',
          message: 'Missing required fields: name and raw_message' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Saving report to database');

    // Insert the report
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        name: reportData.name || '-',
        lastname: reportData.lastname || null,
        reporter_name: reportData.reporter_name || null,
        raw_message: reportData.raw_message,
        address: reportData.address || null,
        location_lat: reportData.location_lat || null,
        location_long: reportData.location_long || null,
        map_link: reportData.map_link || null,
        phone: reportData.phone || [],
        number_of_adults: reportData.number_of_adults || 0,
        number_of_children: reportData.number_of_children || 0,
        number_of_infants: reportData.number_of_infants || 0,
        number_of_seniors: reportData.number_of_seniors || 0,
        number_of_patients: reportData.number_of_patients || 0,
        health_condition: reportData.health_condition || null,
        help_needed: reportData.help_needed || null,
        help_categories: reportData.help_categories || [],
        last_contact_at: reportData.last_contact_at || null,
        additional_info: reportData.additional_info || null,
        urgency_level: reportData.urgency_level || 1,
        status: reportData.status || 'pending',
        line_user_id: reportData.line_user_id || null,
        line_display_name: reportData.line_display_name || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('ไม่สามารถบันทึกข้อมูลได้');
    }

    console.log('Report saved successfully:', data.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'บันทึกข้อมูลสำเร็จ',
        data: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-v1-save function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
