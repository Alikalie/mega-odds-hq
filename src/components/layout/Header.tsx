import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { NotificationsSheet } from "@/components/notifications/NotificationsSheet";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  showInfo?: boolean;
  onInfoClick?: () => void;
}

export const Header = ({ showInfo = true, onInfoClick }: HeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-glow-primary">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                MEGA <span className="text-primary">ODDS</span>
              </span>
            </motion.div>
          </Link>

          <div className="flex items-center gap-1">
            {showInfo && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onInfoClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <Info className="w-5 h-5" />
              </Button>
            )}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative"
                onClick={() => setNotificationsOpen(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <NotificationsSheet
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
};