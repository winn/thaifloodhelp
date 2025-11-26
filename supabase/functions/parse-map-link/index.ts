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
    console.log("Received map link:", mapLink);

    if (!mapLink || typeof mapLink !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid map link" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    let lat: number | null = null;
    let lng: number | null = null;
    let fullUrl = mapLink;

    // Check if it's a shortened goo.gl link - follow redirect
    if (mapLink.includes("goo.gl") || mapLink.includes("maps.app.goo.gl")) {
      try {
        console.log("Following shortened URL redirect...");
        const response = await fetch(mapLink, {
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)",
          },
        });
        fullUrl = response.url;
        console.log("Full URL after redirect:", fullUrl);
      } catch (err) {
        console.error("Error following redirect:", err);
        // Continue with original URL if redirect fails
      }
    }

    // Try multiple parsing strategies on the full URL
    
    // Strategy 1: @lat,lng pattern (most common in Google Maps URLs)
    let match = fullUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
      console.log("Strategy 1 (@lat,lng):", { lat, lng });
    }

    // Strategy 2: /lat,lng pattern
    if (lat === null || lng === null) {
      match = fullUrl.match(/\/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
        console.log("Strategy 2 (/lat,lng):", { lat, lng });
      }
    }

    // Strategy 3: !3d(lat)!4d(lng) pattern (Google's internal format)
    if (lat === null || lng === null) {
      const lat3dMatch = fullUrl.match(/!3d(-?\d+\.\d+)/);
      const lng4dMatch = fullUrl.match(/!4d(-?\d+\.\d+)/);
      if (lat3dMatch && lng4dMatch) {
        lat = parseFloat(lat3dMatch[1]);
        lng = parseFloat(lng4dMatch[1]);
        console.log("Strategy 3 (!3d!4d):", { lat, lng });
      }
    }

    // Strategy 4: ?q=lat,lng or &q=lat,lng pattern
    if (lat === null || lng === null) {
      match = fullUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
        console.log("Strategy 4 (?q=):", { lat, lng });
      }
    }

    // Strategy 5: ll=lat,lng pattern
    if (lat === null || lng === null) {
      match = fullUrl.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
        console.log("Strategy 5 (ll=):", { lat, lng });
      }
    }

    // Strategy 6: center=lat,lng pattern
    if (lat === null || lng === null) {
      match = fullUrl.match(/center=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
        console.log("Strategy 6 (center=):", { lat, lng });
      }
    }

    // Validate and return results
    if (lat !== null && lng !== null) {
      // Check if coordinates are within valid bounds
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log("Successfully extracted coordinates:", { lat, lng });
        return new Response(
          JSON.stringify({ lat, lng, success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.error("Coordinates out of bounds:", { lat, lng });
      }
    }

    console.error("Failed to extract coordinates from URL:", fullUrl);
    return new Response(
      JSON.stringify({ 
        error: "Could not extract coordinates from map link",
        mapLink: mapLink,
        fullUrl: fullUrl,
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