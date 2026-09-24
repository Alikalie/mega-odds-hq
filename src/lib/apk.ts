import { supabase } from "@/integrations/supabase/client";

export const validateApkUrl = (url?: string | null): string | null => {
  if (!url || !url.trim()) return "Download link is required";
  let u: URL;
  try { u = new URL(url.trim()); } catch { return "Enter a full link starting with https://"; }
  if (u.protocol !== "https:") return "Link must start with https://";
  if (!u.hostname.includes(".")) return "Link must include a valid website address";
  return null;
};

export const isValidApkUrl = (url?: string | null) => !validateApkUrl(url);

export const trackApkClick = (url: string, userId?: string | null) => {
  supabase
    .from("apk_clicks")
    .insert({ apk_url: url, user_id: userId ?? null, user_agent: navigator.userAgent.slice(0, 300) })
    .then(({ error }) => error && console.warn("apk click not tracked", error.message));
};
