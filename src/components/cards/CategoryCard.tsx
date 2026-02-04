import { motion } from "framer-motion";
import { ChevronRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  count?: number;
  variant?: "default" | "vip" | "special";
  index?: number;
}

const variantStyles = {
  default: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    countBg: "bg-primary/20",
    countColor: "text-primary",
  },
  vip: {
    iconBg: "bg-vip/10",
    iconColor: "text-vip",
    countBg: "bg-vip/20",
    countColor: "text-vip",
  },
  special: {
    iconBg: "bg-special/10",
    iconColor: "text-special",
    countBg: "bg-special/20",
    countColor: "text-special",
  },
};

export const CategoryCard = ({
  title,
  description,
  icon: Icon,
  href,
  count,
  variant = "default",
  index = 0,
}: CategoryCardProps) => {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Link
        to={href}
        className="flex items-center gap-4 p-4 glass-card rounded-xl hover:bg-secondary/50 transition-all duration-200 group tap-highlight"
      >
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{title}</h3>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {count !== undefined && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold",
                styles.countBg,
                styles.countColor
              )}
            >
              {count}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
};
