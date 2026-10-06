import { toast } from "sonner";

export const jobUrl = (id: string) => `${window.location.origin}/careers?job=${id}`;

/** Shares the job link together with its image (when supported) so the picture shows in WhatsApp etc. */
export const shareJob = async (job: { id: string; title: string; image_url?: string | null }) => {
  const url = jobUrl(job.id);
  const text = `${job.title} — Mega Odds is hiring! View and apply: ${url}`;
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
