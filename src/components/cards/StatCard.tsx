import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning" | "accent";
  index?: number;
}

const variantStyles = {
  default: {
    iconBg: "bg-secondary",
    iconColor: "text-foreground",
  },
  success: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  warning: {
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  accent: {
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  index = 0,
}: StatCardProps) => {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="glass-card rounded-xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", styles.iconColor)} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold font-display">{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-primary mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};
