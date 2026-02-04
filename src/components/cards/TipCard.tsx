import { motion } from "framer-motion";
import { Clock, Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Tip {
  id: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: string;
  matchTime: string;
  league: string;
  status: "pending" | "won" | "lost" | "void";
}

interface TipCardProps {
  tip: Tip;
  index?: number;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    label: "Pending",
  },
  won: {
    icon: Check,
    color: "text-success",
    bg: "bg-success/10",
    label: "Won",
  },
  lost: {
    icon: X,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Lost",
  },
  void: {
    icon: Minus,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    label: "Void",
  },
};

export const TipCard = ({ tip, index = 0 }: TipCardProps) => {
  const status = statusConfig[tip.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card rounded-xl p-4 space-y-3"
    >
      {/* League & Time */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{tip.league}</span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{tip.matchTime}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
            H
          </div>
          <span className="font-medium">{tip.homeTeam}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
            A
          </div>
          <span className="font-medium">{tip.awayTeam}</span>
        </div>
      </div>

      {/* Prediction & Odds */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Pick:</span>
          <span className="px-2 py-1 bg-primary/10 rounded-md text-primary font-semibold text-sm">
            {tip.prediction}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Odds:</span>
          <span className="font-bold text-lg">{tip.odds}</span>
        </div>
      </div>

      {/* Status */}
      <div
        className={cn(
          "flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium",
          status.bg,
          status.color
        )}
      >
        <StatusIcon className="w-3.5 h-3.5" />
        <span>{status.label}</span>
      </div>
    </motion.div>
  );
};
