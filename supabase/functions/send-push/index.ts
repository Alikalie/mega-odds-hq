import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { z } from "npm:zod@3";

const Body = z.object({
  user_ids: z.array(z.string().uuid()).max(10000).optional(),
  all: z.boolean().optional(),
  title: z.string().min(1).max(200),
  message: z.string().max(1000).default(""),
  url: z.string().max(500).optional(),
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
    const { data: claims, error: authErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: role } = await admin.rpc("get_user_role", { _user_id: claims.claims.sub });
    if (role !== "admin" && role !== "super_admin") return json({ error: "Admins only" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { user_ids, all, title, message } = parsed.data;
    const link = parsed.data.url && parsed.data.url.startsWith("/") ? parsed.data.url : "/";

    // Only approved users receive push notifications
    let q = admin.from("profiles").select("id").eq("status", "approved");
    if (!all) {
      if (!user_ids?.length) return json({ sent: 0 });
      q = q.in("id", user_ids);
    }
    const { data: profiles, error: pErr } = await q;
    if (pErr) throw pErr;
    const ids = (profiles || []).map((p) => p.id);
    if (!ids.length) return json({ sent: 0 });

    const { data: subs, error: sErr } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", ids);
    if (sErr) throw sErr;

    webpush.setVapidDetails(
      "mailto:megaoddssl@gmail.com",
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!,
    );
    const payload = JSON.stringify({ title, body: message, url: link });
    let sent = 0;
    const stale: string[] = [];
    await Promise.all(
      (subs || []).map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 86400 });
          sent++;
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) stale.push(s.id);
          else console.error("push failed", code, (e as Error).message);
        }
      }),
    );
    if (stale.length) await admin.from("push_subscriptions").delete().in("id", stale);
    return json({ sent, removed: stale.length });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
