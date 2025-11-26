import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Validate API key (without updating database)
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

  // Note: In mock mode, we skip rate limit checking to allow unlimited testing
  // In production endpoint (api-v1-save), rate limits are enforced

  return { valid: true, apiKeyId: keyData.id };
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
    
    // Validate API key (no rate limiting in mock mode)
    const validation = await validateApiKey(apiKey || '', supabase);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const reportData = await req.json();

    // Validate required fields
    if (!reportData.name || !reportData.raw_message) {
      return new Response(
        JSON.stringify({ error: 'name and raw_message are required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[MOCK MODE] Would save report data:', {
      name: reportData.name,
      raw_message: reportData.raw_message?.substring(0, 50) + '...',
      hasLocation: !!reportData.location,
      hasLatitude: !!reportData.latitude,
      hasLongitude: !!reportData.longitude,
    });

    // Generate a mock UUID for the response
    const mockId = crypto.randomUUID();

    // In mock mode, we don't actually insert to database
    // We just return a successful response with mock data
    console.log('[MOCK MODE] Report would be saved with ID:', mockId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Report saved successfully (MOCK MODE - not actually saved to database)',
        id: mockId,
        mock: true,
        received_data: {
          name: reportData.name,
          raw_message: reportData.raw_message,
          location: reportData.location || null,
          latitude: reportData.latitude || null,
          longitude: reportData.longitude || null,
          help_category: reportData.help_category || null,
          phone_number: reportData.phone_number || null,
          image_url: reportData.image_url || null,
          source: reportData.source || 'api',
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[MOCK MODE] Error in api-v1-save-mock function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        mock: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
