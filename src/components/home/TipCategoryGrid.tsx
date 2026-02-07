import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Ticket,
  Goal,
  TrendingUp,
  Target,
  Flame,
  Circle,
  Activity,
  Gift,
  Layers,
  History,
  Swords,
  Trophy,
  Crown,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon map for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Ticket,
  Goal,
  TrendingUp,
  Target,
  Flame,
  Circle,
  Activity,
  Gift,
  Layers,
  History,
  Swords,
  Trophy,
  Crown,
};

export interface TipCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  tip_count: number;
  is_vip: boolean;
  is_special: boolean;
  display_order: number;
}

interface TipCategoryGridProps {
  categories: TipCategory[];
  isLoading?: boolean;
}

export const TipCategoryGrid = ({ categories, isLoading }: TipCategoryGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-xl bg-card/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category, index) => {
        const IconComponent = iconMap[category.icon] || Trophy;
        const href = category.is_vip
          ? `/vip?category=${category.slug}`
          : category.is_special
          ? `/special?category=${category.slug}`
          : `/free-tips?category=${category.slug}`;

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
          >
            <Link to={href} className="block">
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl p-4 aspect-[4/3] flex flex-col items-center justify-center gap-2 transition-all duration-200 tap-highlight group",
                  "bg-gradient-to-br from-card to-card/80 border-2",
                  category.is_vip
                    ? "border-vip/30 hover:border-vip/60 hover:shadow-glow-vip"
                    : category.is_special
                    ? "border-special/30 hover:border-special/60 hover:shadow-glow-special"
                    : "border-primary/20 hover:border-primary/50 hover:shadow-glow-primary"
                )}
              >
                {/* VIP/Special Badge */}
                {(category.is_vip || category.is_special) && (
                  <div
                    className={cn(
                      "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      category.is_vip
                        ? "bg-vip/20 text-vip"
                        : "bg-special/20 text-special"
                    )}
                  >
                    {category.is_vip ? "VIP" : "Special"}
                  </div>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                    category.is_vip
                      ? "bg-vip/10"
                      : category.is_special
                      ? "bg-special/10"
                      : "bg-primary/10"
                  )}
                >
                  <IconComponent
                    className={cn(
                      "w-7 h-7",
                      category.is_vip
                        ? "text-vip"
                        : category.is_special
                        ? "text-special"
                        : "text-primary"
                    )}
                  />
                </div>

                {/* Name */}
                <span className="text-sm font-bold text-center uppercase tracking-wide">
                  {category.name}
                </span>

                {/* Tip count badge */}
                {category.tip_count > 0 && (
                  <span
                    className={cn(
                      "absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      category.is_vip
                        ? "bg-vip/20 text-vip"
                        : category.is_special
                        ? "bg-special/20 text-special"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    {category.tip_count}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};
