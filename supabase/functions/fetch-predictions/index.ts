const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { date } = await req.json();
    const targetDate = date || new Date().toISOString().split("T")[0];

    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    if (!rapidApiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `https://betminer.p.rapidapi.com/bm/v3/edge-analysis/${targetDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "betminer.p.rapidapi.com",
          "x-rapidapi-key": rapidApiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("BetMiner API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();

    // Transform to a simplified format
    const predictions = (result.data || []).map((match: any) => ({
      match_id: match.match_id,
      kickoff: match.kickoff,
      status: match.status,
      home_team: match.home_team?.name || "Unknown",
      away_team: match.away_team?.name || "Unknown",
      home_logo: match.home_team?.logo || "",
      away_logo: match.away_team?.logo || "",
      league: match.competition?.name || "Unknown",
      country: match.competition?.country || "",
      score: match.score,
      predictions: match.predictions,
      probabilities: match.probabilities,
      odds: match.odds,
      edge_analysis: match.edge_analysis,
      best_value: match.best_value,
      value_score: match.value_score,
      form: match.form,
      is_trap: match.is_trap,
    }));

    return new Response(
      JSON.stringify({ success: true, data: predictions, date: targetDate }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Prediction fetch error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
