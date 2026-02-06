import { motion } from "framer-motion";
import { Crown, Star, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PackageCardProps {
  tier: "vip" | "special";
  title: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  index: number;
}

export const VipPackageCard = ({
  tier,
  title,
  price,
  period,
  features,
  isPopular,
  index,
}: PackageCardProps) => {
  const Icon = tier === "vip" ? Crown : Star;
  const colorClass = tier === "vip" ? "text-vip" : "text-special";
  const bgClass = tier === "vip" ? "bg-vip/10" : "bg-special/10";
  const borderClass = tier === "vip" ? "border-vip/30" : "border-special/30";
  const glowClass = tier === "vip" ? "shadow-glow-vip" : "shadow-glow-special";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative glass-card rounded-2xl p-6 border ${borderClass} ${
        isPopular ? glowClass : ""
      }`}
    >
      {isPopular && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full ${bgClass} ${colorClass} text-xs font-bold`}>
          Most Popular
        </div>
      )}

      <div className="text-center space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-2xl ${bgClass} flex items-center justify-center`}>
          <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>

        <div>
          <h3 className="font-display font-bold text-xl">{title}</h3>
          <div className="mt-2">
            <span className="text-3xl font-bold">{price}</span>
            <span className="text-muted-foreground text-sm">/{period}</span>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-left">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className={`w-4 h-4 ${colorClass} flex-shrink-0`} />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={tier === "vip" ? "vip" : "special"}
          size="lg"
          className="w-full"
          asChild
        >
          <Link to={`/auth?package=${tier}`}>
            Register Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};
