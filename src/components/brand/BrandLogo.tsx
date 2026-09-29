import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

export const DEFAULT_LOGO_URL = "/icon-512.png";

export const useLogoUrl = () => {
  const { data } = useSiteSettings();
  return ((data as any)?.logo_url as string | null) || DEFAULT_LOGO_URL;
};

export const BrandLogo = ({ className }: { className?: string }) => {
  const src = useLogoUrl();
  return (
    <img
      src={src}
      alt="Mega Odds logo"
      className={cn("object-contain", className)}
      onError={(e) => {
        if (!e.currentTarget.src.endsWith(DEFAULT_LOGO_URL)) e.currentTarget.src = DEFAULT_LOGO_URL;
      }}
    />
  );
};
