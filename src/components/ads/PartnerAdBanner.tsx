import { ExternalLink, Megaphone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ReferralBanners } from "./ReferralBanners";

export const PartnerAdBanner = () => {
  const { data: settings } = useSiteSettings();
  const s = settings as any;

  if (!s?.partner_ad_enabled || !s?.partner_ad_url) return null;

  return (
    <>
    <a
      href={s.partner_ad_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block mx-4 mt-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/15 via-card to-primary/10 p-4 flex items-center gap-3 hover:border-primary/60 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
        <Megaphone className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sponsored</p>
        <p className="font-display font-bold text-sm truncate">{s.partner_ad_label || "Partner offer"}</p>
        {s.partner_ad_subtext && (
          <p className="text-xs text-muted-foreground truncate">{s.partner_ad_subtext}</p>
        )}
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-2 shrink-0">
        Join <ExternalLink className="w-3 h-3" />
      </span>
    </a>
    <ReferralBanners />
    </>
  );
};
