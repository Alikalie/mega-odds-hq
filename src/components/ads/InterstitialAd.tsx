import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdBanner } from "./AdBanner";

interface Props {
  open: boolean;
  slot?: string | null;
  onClose: () => void;
}

const SKIP_AFTER = 5;

export const InterstitialAd = ({ open, slot, onClose }: Props) => {
  const [left, setLeft] = useState(SKIP_AFTER);

  useEffect(() => {
    if (!open) return;
    setLeft(SKIP_AFTER);
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-4 h-14 border-b border-border">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Advertisement</span>
        {left > 0 ? (
          <span className="text-sm text-muted-foreground">Skip in {left}s</span>
        ) : (
          <Button size="sm" variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-1" /> Skip ad
          </Button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="w-full max-w-md min-h-[300px] rounded-xl border border-border bg-card flex items-center justify-center">
          {slot ? (
            <AdBanner key={Date.now()} slot={slot} format="rectangle" className="w-full" />
          ) : (
            <p className="text-sm text-muted-foreground p-6 text-center">Ad space</p>
          )}
        </div>
      </div>
    </div>
  );
};
