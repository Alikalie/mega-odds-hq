import { motion } from "framer-motion";
import { Clock, Check, X, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Tip } from "@/components/cards/TipCard";

interface TipsTableProps {
  tips: Tip[];
  isLoading?: boolean;
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

export const TipsTable = ({ tips, isLoading }: TipsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-card/50 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No tips available for your subscription</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Prediction</TableHead>
              <TableHead>Odds</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tips.map((tip, i) => {
              const status = statusConfig[tip.status];
              const StatusIcon = status.icon;

              return (
                <TableRow key={tip.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-0.5">
                      <p>{tip.homeTeam}</p>
                      <p className="text-muted-foreground text-xs">vs {tip.awayTeam}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {tip.league}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {tip.matchTime}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-primary/10 rounded-md text-primary font-semibold text-sm">
                      {tip.prediction}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold">{tip.odds}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        status.bg,
                        status.color
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};
