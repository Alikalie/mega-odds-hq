import { Copy, Code2, Check, X, Clock, MessageSquare, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import type { BookingCode } from "@/hooks/useBookingCodes";

const statusConfig = {
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/50", label: "Pending" },
  won: { icon: Check, color: "text-green-600", bg: "bg-green-500/10", label: "Won ✅" },
  lost: { icon: X, color: "text-destructive", bg: "bg-destructive/10", label: "Lost ❌" },
  void: { icon: X, color: "text-yellow-600", bg: "bg-yellow-500/10", label: "Void ⚠️" },
};

interface BookingCodeCardProps {
  code: BookingCode;
  categoryName?: string;
}

export const BookingCodeCard = ({ code, categoryName }: BookingCodeCardProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.code);
      toast.success("Booking code copied!");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = code.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Booking code copied!");
    }
  };

  const st = statusConfig[code.status as keyof typeof statusConfig] || statusConfig.pending;
  const StIcon = st.icon;

  const postedDate = parseISO(code.created_at);
  const daysSincePosted = differenceInDays(new Date(), postedDate);
  const isPastRecord = daysSincePosted > 30;
  const dateLabel = format(postedDate, "MMM d, yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass-card rounded-xl p-3 border space-y-2",
        isPastRecord
          ? "border-muted/30 bg-muted/10 opacity-75"
          : "border-primary/20 bg-primary/5"
      )}
    >
      {/* Past record badge */}
      {isPastRecord && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
          <History className="w-3 h-3" />
          <span>Past Record — {dateLabel}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="font-mono font-bold text-primary text-sm truncate">{code.code}</p>
            <div className="flex items-center gap-1.5">
              {!isPastRecord && (
                <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
              )}
              {code.description && (
                <span className="text-[10px] text-muted-foreground truncate">
                  {!isPastRecord && "• "}{code.description}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium", st.bg, st.color)}>
            <StIcon className="w-3 h-3" />{st.label}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={handleCopy}
          >
            <Copy className="w-3 h-3" />
            Copy
          </Button>
        </div>
      </div>
      {code.admin_comment && (
        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-muted/30 rounded-lg px-2 py-1.5">
          <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{code.admin_comment}</span>
        </div>
      )}
    </motion.div>
  );
};
