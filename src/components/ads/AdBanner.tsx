import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdBanner = ({ slot, format = "auto", className = "" }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container my-4 ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2503088895956417"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
