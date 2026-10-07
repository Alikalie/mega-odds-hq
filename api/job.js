// Vercel serverless: serves job share pages as real HTML so link previews show the job picture.
export default async function handler(req, res) {
  const id = String(req.query.id || "");
  const r = await fetch(
    `https://dyhqqwmaxmpxgoqxtjod.supabase.co/functions/v1/job-share?id=${encodeURIComponent(id)}&site=https://mega-odds-hq.vercel.app`
  );
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.status(200).send(await r.text());
}
