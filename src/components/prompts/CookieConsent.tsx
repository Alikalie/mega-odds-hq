import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

const KEY = "mega_odds_cookie_consent";

export const CookieConsent = () => {
  const { data: s } = useSiteSettings();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!s || !s.cookie_enabled) return;
    const stored = localStorage.getItem(KEY);
    // Re-show when admin bumps the version (updated message)
    setShow(!stored || !stored.startsWith(`v${s.cookie_version}:`));
  }, [s]);

  if (!s || !show) return null;

  const decide = (choice: "accepted" | "declined") => {
    localStorage.setItem(KEY, `v${s.cookie_version}:${choice}`);
    setShow(false);
  };

  const style = s.cookie_style;
  const top = s.cookie_position === "top";

  return (
    <div
      className={cn(
        "fixed z-[60] left-0 right-0 flex justify-center",
        top ? "top-0" : "bottom-20",
        style === "bar" ? "" : "px-4",
        style === "card" && (top ? "top-4" : "")
      )}
    >
      <div
        style={{ background: s.cookie_bg_color, color: s.cookie_text_color }}
        className={cn(
          "shadow-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center",
          style === "bar" ? "w-full" : "w-full max-w-lg rounded-2xl",
          style === "minimal" && "max-w-md rounded-full py-2 px-4"
        )}
      >
        <div className="flex items-start gap-2 flex-1">
          {style !== "minimal" && <Cookie className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="text-xs leading-relaxed">{s.cookie_message}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => decide("declined")}
            className="text-xs px-3 py-1.5 rounded-lg border opacity-80"
            style={{ borderColor: s.cookie_text_color }}
          >
            {s.cookie_decline_text}
          </button>
          <button
            onClick={() => decide("accepted")}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: s.cookie_button_color, color: s.cookie_bg_color }}
          >
            {s.cookie_accept_text}
          </button>
        </div>
      </div>
    </div>
  );
};
