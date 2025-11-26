import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address || typeof address !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid address" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Sanitize and prepare address for geocoding
    const cleanedAddress = address.trim();
    
    // Use Nominatim (OpenStreetMap) for geocoding - free and no API key required
    // Add Thailand bias and Thai language support
    const encodedAddress = encodeURIComponent(cleanedAddress);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=th&accept-language=th`;
    
    console.log('Geocoding address:', cleanedAddress);
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'ThaiFloodHelp/1.0 (Disaster Relief Application)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      // Generate Google Maps link
      const mapLink = `https://maps.google.com/?q=${lat},${lng}`;

      console.log('Geocoding successful:', { lat, lng, mapLink });

      return new Response(
        JSON.stringify({
          lat,
          lng,
          map_link: mapLink,
          display_name: result.display_name,
          success: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('No geocoding results found for address:', cleanedAddress);

    return new Response(
      JSON.stringify({
        error: "Could not geocode address",
        lat: null,
        lng: null,
        map_link: null,
        success: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (err) {
    console.error("Error geocoding address:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
