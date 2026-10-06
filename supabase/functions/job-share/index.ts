import { createClient } from "npm:@supabase/supabase-js@2";

const SITE = "https://megaoddssl.lovable.app";
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const site = url.searchParams.get("site") || SITE;
  const target = `${site}/careers?job=${encodeURIComponent(id)}`;
  let title = "Careers at Mega Odds";
  let desc = "Mega Odds is hiring. View the job and apply.";
  let image = `${SITE}/icon-512.png`;
  if (/^[0-9a-f-]{36}$/i.test(id)) {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb.from("job_posts").select("title,description,location,image_url,is_active").eq("id", id).maybeSingle();
    if (data?.is_active) {
      title = `${data.title} — Mega Odds is hiring`;
      desc = [data.location, (data.description || "").slice(0, 180)].filter(Boolean).join(" · ");
      if (data.image_url) image = data.image_url;
    }
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Mega Odds">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}"><meta property="og:url" content="${esc(target)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0;url=${esc(target)}"></head>
<body><script>location.replace(${JSON.stringify(target)})</script><a href="${esc(target)}">Open job</a></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
});
