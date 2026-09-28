import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const Body = z.object({ question: z.string().trim().min(2).max(500) });

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Row = { id: string; home_team: string; away_team: string; prediction: string; odds: string; league: string; match_time: string; tip_date: string; status: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Please sign in first." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    const userId = claims?.claims?.sub;
    if (!userId) return json({ error: "Please sign in first." }, 401);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: profile } = await admin.from("profiles").select("status, subscription").eq("id", userId).maybeSingle();
    if (!profile || profile.status !== "approved") return json({ error: "Your account must be approved to use the tips assistant." }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Please type a question (2–500 characters)." }, 400);
    const { question } = parsed.data;

    // Access: free for all approved users; vip for vip/special; special for special.
    const tables: [string, string][] = [["free_tips", "free"]];
    if (profile.subscription === "vip" || profile.subscription === "special") tables.push(["vip_tips", "vip"]);
    if (profile.subscription === "special") tables.push(["special_tips", "special"]);

    const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const tips: (Row & { tier: string })[] = [];
    for (const [table, tier] of tables) {
      const { data } = await admin.from(table)
        .select("id, home_team, away_team, prediction, odds, league, match_time, tip_date, status")
        .eq("hidden_from_history", false).gte("tip_date", since)
        .order("tip_date", { ascending: false }).limit(80);
      (data || []).forEach((r: Row) => tips.push({ ...r, tier }));
    }
    if (!tips.length) return json({ answer: "There are no published tips available to you right now.", matches: [] });

    const catalog = tips.map((t, i) =>
      `#${i} [${t.tier}] ${t.tip_date} ${t.match_time} | ${t.league} | ${t.home_team} vs ${t.away_team} | prediction: ${t.prediction} | odds: ${t.odds || "-"} | status: ${t.status}`
    ).join("\n");

    const prompt = `You help users of the Mega Odds football tips app find tips. Today is ${new Date().toISOString().slice(0, 10)}.
Only use the tips listed below; never invent tips. Pick up to 5 tips that best match the user's question and explain briefly (one sentence each) why each matches. If none match, say so kindly.
Reply ONLY with JSON: {"answer":"short friendly summary","matches":[{"index":number,"why":"one sentence"}]}

TIPS:
${catalog}

QUESTION: ${question}`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({ model: "openai/gpt-6-astra", input: prompt, stream: true, store: false, reasoning: { effort: "low" } }),
      signal: req.signal,
    });
    if (!res.ok || !res.body) {
      const txt = await res.text();
      console.error("AI error", res.status, txt);
      const msg = res.status === 429 ? "The assistant is busy, please try again in a moment." :
        res.status === 402 ? "AI credits are used up. Please try again later." : "The assistant could not answer right now.";
      return json({ error: msg }, res.status);
    }
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
        try { const ev = JSON.parse(d); if (ev.type === "response.output_text.delta") text += ev.delta; } catch { /* ignore */ }
      }
    }
    const m = text.match(/\{[\s\S]*\}/);
    let out: any = { answer: text.trim() || "No clear answer.", matches: [] };
    try { if (m) out = JSON.parse(m[0]); } catch { /* keep fallback */ }
    const matches = (Array.isArray(out.matches) ? out.matches : []).slice(0, 5)
      .filter((x: any) => Number.isInteger(x?.index) && tips[x.index])
      .map((x: any) => {
        const t = tips[x.index];
        return { id: t.id, tier: t.tier, homeTeam: t.home_team, awayTeam: t.away_team, prediction: t.prediction, odds: t.odds, league: t.league, matchTime: t.match_time, tipDate: t.tip_date, status: t.status, why: String(x.why || "") };
      });
    return json({ answer: String(out.answer || ""), matches });
  } catch (e) {
    if ((e as Error).name === "AbortError") return json({ error: "cancelled" }, 499);
    console.error(e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
