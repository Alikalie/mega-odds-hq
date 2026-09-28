import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DEFAULTS = { icon: "/favicon.png", apple: "/apple-touch-icon.png", manifest: "/manifest.webmanifest" };

const setLink = (rel: string, href: string) => {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement("link"); el.rel = rel; document.head.appendChild(el); }
  el.href = href;
  if (rel === "icon") el.type = "image/png";
};

/** Keeps the browser tab icon and home-screen icon in sync with the admin-chosen logo. */
export const DynamicAppIcons = () => {
  const { data } = useSiteSettings();
  const logo = (data as any)?.logo_url as string | null | undefined;

  useEffect(() => {
    if (data === undefined) return;
    if (!logo) {
      setLink("icon", DEFAULTS.icon);
      setLink("apple-touch-icon", DEFAULTS.apple);
      setLink("manifest", DEFAULTS.manifest);
      return;
    }
    const v = `?v=${encodeURIComponent(logo.slice(-24))}`;
    setLink("icon", logo + v);
    setLink("apple-touch-icon", logo + v);
    const manifest = {
      name: "Mega Odds", short_name: "Mega Odds", start_url: window.location.origin + "/", display: "standalone",
      background_color: "#000000", theme_color: "#000000",
      icons: [{ src: logo, sizes: "512x512", type: "image/png", purpose: "any" }],
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }));
    setLink("manifest", url);
    return () => URL.revokeObjectURL(url);
  }, [logo, data]);

  return null;
};
