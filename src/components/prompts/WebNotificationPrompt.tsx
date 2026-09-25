import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { notificationPermission, registerNotificationWorker, requestNotificationPermission } from "@/lib/webNotifications";

const KEY = "mega_odds_notif_prompt_dismissed";

export const WebNotificationPrompt = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const perm = notificationPermission();
    if (perm === "granted") { registerNotificationWorker(); return; }
    if (!user || perm !== "default" || localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, [user]);

  if (!show) return null;

  const dismiss = () => { localStorage.setItem(KEY, "1"); setShow(false); };

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="relative bg-card border border-border rounded-2xl p-4 shadow-xl flex gap-3">
        <button onClick={dismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 pr-4">
          <p className="font-display font-bold text-sm">Turn on notifications</p>
          <p className="text-xs text-muted-foreground mt-0.5">Get new tips and updates straight to your browser.</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-8 text-xs" onClick={async () => { await requestNotificationPermission(); dismiss(); }}>Allow</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={dismiss}>Not now</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
