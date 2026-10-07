import { toast } from "sonner";

/** Share link served as real HTML (with job picture + full description) so previews work on every device. */
export const jobUrl = (id: string) => `https://mega-odds-hq.vercel.app/job/${id}`;

/** Shares the job link together with its image (when supported) so the picture shows in WhatsApp etc. */
export const shareJob = async (job: { id: string; title: string; image_url?: string | null; description?: string | null; location?: string | null }) => {
  const url = jobUrl(job.id);
  const text = `${job.title} — Mega Odds is hiring!${job.location ? `\n📍 ${job.location}` : ""}${job.description ? `\n\n${job.description}` : ""}\n\nView and apply: ${url}`;
  try {
    if (navigator.share) {
      if (job.image_url) {
        try {
          const blob = await (await fetch(job.image_url)).blob();
          const file = new File([blob], "mega-odds-job." + (blob.type.split("/")[1] || "jpg"), { type: blob.type });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: job.title, text });
            return;
          }
        } catch {}
      }
      await navigator.share({ title: job.title, text, url });
      return;
    }
  } catch (e: any) {
    if (e?.name === "AbortError") return;
  }
  await navigator.clipboard.writeText(text);
  toast.success("Job link copied — paste it anywhere to share");
};
