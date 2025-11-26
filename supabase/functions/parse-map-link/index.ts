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
    const { mapLink } = await req.json();

    if (!mapLink || typeof mapLink !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid map link" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Sanitize URL - remove leading/trailing whitespace and leading "-" character
    const cleanedLink = mapLink.trim().replace(/^-+/, '');

    let lat: number | null = null;
    let lng: number | null = null;

    // Check if it's a shortened goo.gl link
    if (cleanedLink.includes("goo.gl") || cleanedLink.includes("maps.app.goo.gl")) {
      try {
        // Follow redirect to get full URL
        const response = await fetch(cleanedLink, {
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)",
          },
        });
        const fullUrl = response.url;
        
        // Parse coordinates from full URL
        const coordMatch = fullUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        }
      } catch (err) {
        console.error("Error following redirect:", err);
      }
    }

    // Try to parse coordinates from various Google Maps URL formats
    if (lat === null || lng === null) {
      // Format: @lat,lng or /lat,lng
      const coordMatch = cleanedLink.match(/[@\/](-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        lat = parseFloat(coordMatch[1]);
        lng = parseFloat(coordMatch[2]);
      }
    }

    // Format: !3d(lat)!4d(lng) or similar
    if (lat === null || lng === null) {
      const lat3dMatch = cleanedLink.match(/!3d(-?\d+\.\d+)/);
      const lng4dMatch = cleanedLink.match(/!4d(-?\d+\.\d+)/);
      if (lat3dMatch && lng4dMatch) {
        lat = parseFloat(lat3dMatch[1]);
        lng = parseFloat(lng4dMatch[1]);
      }
    }

    // Format: ?q=lat,lng
    if (lat === null || lng === null) {
      const qMatch = cleanedLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        lat = parseFloat(qMatch[1]);
        lng = parseFloat(qMatch[2]);
      }
    }

    if (lat !== null && lng !== null) {
      // Validate coordinates are within reasonable bounds
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return new Response(
          JSON.stringify({ lat, lng, success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        error: "Could not extract coordinates from map link",
        lat: null,
        lng: null,
        success: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (err) {
    console.error("Error parsing map link:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});