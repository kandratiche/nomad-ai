
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TICKETMASTER_API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const apiKey = Deno.env.get("TICKETMASTER_API_KEY");
    if (!apiKey) {
      throw new Error("API Key not set");
    }
    
    searchParams.append("apikey", apiKey);

    const tmResponse = await fetch(`${TICKETMASTER_API_URL}?${searchParams.toString()}`);
    
    if (!tmResponse.ok) {
       const errorText = await tmResponse.text();
       throw new Error(`Ticketmaster error: ${tmResponse.status} ${errorText}`);
    }

    const data = await tmResponse.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})

