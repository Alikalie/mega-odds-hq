import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";
import defaultLogo from "@/assets/mega-odds-logo.png.asset.json";

export const DEFAULT_LOGO_URL = defaultLogo.url;

export const useLogoUrl = () => {
  const { data } = useSiteSettings();
  return ((data as any)?.logo_url as string | null) || DEFAULT_LOGO_URL;
};

export const BrandLogo = ({ className }: { className?: string }) => {
  const src = useLogoUrl();
  return <img src={src} alt="Mega Odds logo" className={cn("object-contain", className)} />;
};
