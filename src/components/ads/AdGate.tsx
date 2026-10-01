import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { InterstitialAd } from "./InterstitialAd";

export const DEFAULT_AD_SLOT = "5747965287";

type Ctx = { goWithAd: (path: string) => void; adOn: boolean };
const AdGateContext = createContext<Ctx>({ goWithAd: () => {}, adOn: false });

export const AdGateProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const [pending, setPending] = useState<string | null>(null);
  const adOn = (settings as any)?.interstitial_ad_enabled !== false;
  const slot = (settings as any)?.interstitial_ad_slot || DEFAULT_AD_SLOT;

  const goWithAd = useCallback(
    (path: string) => (adOn ? setPending(path) : navigate(path)),
    [adOn, navigate]
  );

  return (
    <AdGateContext.Provider value={{ goWithAd, adOn }}>
      {children}
      <InterstitialAd
        open={!!pending}
        slot={slot}
        custom={
          (settings as any)?.custom_ad_enabled && (settings as any)?.custom_ad_image_url
            ? {
                image: (settings as any).custom_ad_image_url,
                link: (settings as any).custom_ad_link,
                title: (settings as any).custom_ad_title,
              }
            : null
        }
        onClose={() => {
          const p = pending;
          setPending(null);
          if (p) navigate(p);
        }}
      />
    </AdGateContext.Provider>
  );
};

export const useAdGate = () => useContext(AdGateContext);
