import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const APP_DOWNLOAD_URL = "https://median.co/share/zpbywrk#apk";
const COOKIE_KEY = "mega_odds_app_prompt";
const UPGRADE_COOKIE_KEY = "mega_odds_upgrade_clicked";

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
};

const isFirstVisit = (): boolean => {
  return !getCookie("mega_odds_visited");
};

const markVisited = () => {
  setCookie("mega_odds_visited", "true", 365);
};

export const AppDownloadPrompt = () => {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    // Don't show on desktop/big screens
    if (!isMobile) return;

    // Check if user already clicked upgrade today
    const upgradeClicked = getCookie(UPGRADE_COOKIE_KEY);
    if (upgradeClicked) return;

    // Check if already shown today
    const lastShown = getCookie(COOKIE_KEY);
    const today = new Date().toDateString();
    if (lastShown === today) return;

    const firstVisit = isFirstVisit();
    setIsFirstTime(firstVisit);
    
    // Small delay before showing
    const timer = setTimeout(() => {
      setShow(true);
      setCookie(COOKIE_KEY, today, 1);
      if (firstVisit) markVisited();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isMobile]);

  const handleDownload = () => {
    setCookie(UPGRADE_COOKIE_KEY, "true", 1);
    window.open(APP_DOWNLOAD_URL, "_blank");
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50"
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-sm">
                  {isFirstTime ? "Download Mega Odds App" : "Upgrade Your App"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isFirstTime
                    ? "Get the best experience with our mobile app. Faster, smoother, and always up to date!"
                    : "A new version is available! Update now for the latest features and improvements."}
                </p>
                <Button
                  size="sm"
                  variant="hero"
                  className="mt-2 h-8 text-xs"
                  onClick={handleDownload}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {isFirstTime ? "Download Now" : "Update App"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
