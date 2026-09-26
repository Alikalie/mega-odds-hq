import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const Body = z.object({
  homeTeam: z.string().min(1).max(120),
  awayTeam: z.string().min(1).max(120),
  prediction: z.string().min(1).max(200),
  league: z.string().max(200).default(""),
  matchDate: z.string().max(60).default(""),
  matchTime: z.string().max(60).default(""),
});

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: role } = await admin.rpc("get_user_role", { _user_id: claims.claims.sub });
    if (role !== "admin" && role !== "super_admin") return json({ error: "Admins only" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const t = parsed.data;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured" }, 500);

    const prompt = `You are a sports results checker for a betting tips app.
Match: ${t.homeTeam} vs ${t.awayTeam}
League: ${t.league || "unknown"}
Date: ${t.matchDate || "unknown"} ${t.matchTime}
Prediction given to users: "${t.prediction}"

Search the web for the final result of this match. Then decide if the prediction WON, LOST, or is VOID (match postponed/cancelled/abandoned). If the match has not finished or you cannot find a reliable result, answer "pending".
Reply ONLY with JSON: {"status":"won"|"lost"|"void"|"pending","score":"final score or empty","confidence":"high"|"medium"|"low","reason":"one short sentence"}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        Authorization: `Bearer ${apiKey}`,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        tools: [{ type: "web_search" }],
      }),
      signal: req.signal,
    });
    if (!res.ok || !res.body) {
      const txt = await res.text();
      console.error("AI error", res.status, txt);
      const msg = res.status === 429 ? "AI is busy, try again shortly." :
        res.status === 402 ? "AI credits are used up. Add credits to keep using the AI checker." :
        "AI could not check this match.";
      return json({ error: msg }, res.status);
    }

    // Consume SSE stream, collect output text
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const d = line.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "response.output_text.delta") text += ev.delta;
        } catch { /* ignore */ }
      }
    }
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return json({ status: "pending", score: "", confidence: "low", reason: "AI gave no clear answer." });
    const out = JSON.parse(m[0]);
    const status = ["won", "lost", "void", "pending"].includes(out.status) ? out.status : "pending";
    return json({ status, score: String(out.score || ""), confidence: String(out.confidence || "low"), reason: String(out.reason || "") });
  } catch (e) {
    if ((e as Error).name === "AbortError") return json({ error: "cancelled" }, 499);
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
