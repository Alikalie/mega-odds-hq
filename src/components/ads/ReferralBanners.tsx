import { useEffect, useRef, useState } from "react";

const banners = [
  { tag: "d_6193043m_3730c_", site: "6193043", ad: "3730", width: 300, height: 50 },
  { tag: "d_6192817m_3730c_", site: "6192817", ad: "3730", width: 300, height: 50 },
  { tag: "d_6192817m_3847c_", site: "6192817", ad: "3847", width: 475, height: 75 },
];

const ReferralBanner = ({ banner, index }: { banner: typeof banners[number]; index: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(1, entry.contentRect.width / banner.width));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [banner.width]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full overflow-hidden"
      style={{ maxWidth: banner.width, aspectRatio: `${banner.width} / ${banner.height}` }}
    >
      <iframe
        title={`Sponsored partner banner ${index + 1}`}
        src={`https://refbanners.com/I?tag=${banner.tag}&site=${banner.site}&ad=${banner.ad}`}
        width={banner.width}
        height={banner.height}
        scrolling="no"
        loading="lazy"
        className="absolute left-0 top-0 origin-top-left border-0 p-0 m-0"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
};

export const ReferralBanners = () => (
  <div className="mx-4 mt-3 space-y-3" aria-label="Sponsored partner banners">
    {banners.map((banner, index) => <ReferralBanner key={banner.tag} banner={banner} index={index} />)}
  </div>
);