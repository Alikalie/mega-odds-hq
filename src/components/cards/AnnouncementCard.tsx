import { motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onDismiss?: (id: string) => void;
  index?: number;
}

export const AnnouncementCard = ({
  announcement,
  onDismiss,
  index = 0,
}: AnnouncementCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="relative bg-accent/10 border border-accent/20 rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{announcement.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {announcement.description}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {announcement.createdAt}
          </p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onDismiss(announcement.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
