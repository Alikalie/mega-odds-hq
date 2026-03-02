import { Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { BookingCode } from "@/hooks/useBookingCodes";

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
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = code.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Booking code copied!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-3 border border-primary/20 bg-primary/5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="font-mono font-bold text-primary text-sm truncate">{code.code}</p>
            {code.description && (
              <p className="text-[10px] text-muted-foreground truncate">{code.description}</p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs shrink-0 gap-1"
          onClick={handleCopy}
        >
          <Copy className="w-3 h-3" />
          Copy
        </Button>
      </div>
    </motion.div>
  );
};
