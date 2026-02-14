import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Gem, Medal, Award, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SubscriptionPackage } from "@/hooks/useSubscriptionPackages";
import { useAuth } from "@/hooks/useAuth";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";

interface SpecialPackageCardProps {
  pkg: SubscriptionPackage;
  index: number;
}

const tierIcons: Record<string, typeof Gem> = {
  silver: Medal,
  gold: Award,
  premium: Trophy,
  platinum: Gem,
};

const tierColors: Record<string, { bg: string; text: string; glow: string }> = {
  silver: { bg: "from-slate-400 to-slate-500", text: "text-slate-300", glow: "shadow-[0_0_20px_rgba(148,163,184,0.3)]" },
  gold: { bg: "from-amber-400 to-amber-600", text: "text-amber-400", glow: "shadow-[0_0_20px_rgba(251,191,36,0.3)]" },
  premium: { bg: "from-purple-500 to-purple-700", text: "text-purple-400", glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]" },
  platinum: { bg: "from-cyan-400 to-cyan-600", text: "text-cyan-400", glow: "shadow-[0_0_20px_rgba(34,211,238,0.3)]" },
};

export const SpecialPackageCard = ({ pkg, index }: SpecialPackageCardProps) => {
  const { user, profile } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const Icon = tierIcons[pkg.slug] || Gem;
  const colors = tierColors[pkg.slug] || tierColors.platinum;
  const isSierraLeone = profile?.country === "Sierra Leone";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          "relative glass-card rounded-2xl p-6 border border-border/50",
          pkg.is_popular && colors.glow
        )}
      >
        {pkg.is_popular && (
          <div className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold",
            "bg-gradient-to-r", colors.bg, "text-background"
          )}>
            Most Popular
          </div>
        )}

        <div className="text-center space-y-4">
          <div className={cn("w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center", colors.bg)}>
            <Icon className="w-8 h-8 text-background" />
          </div>

          <div>
            <h3 className={cn("font-display font-bold text-xl", colors.text)}>{pkg.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">${pkg.price}</span>
              <span className="text-muted-foreground text-sm">/{pkg.duration_days} days</span>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-left">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className={cn("w-4 h-4 flex-shrink-0", colors.text)} />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {user ? (
            <Button variant="special" size="lg" className="w-full" onClick={() => setShowPayment(true)}>
              Get {pkg.name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button variant="special" size="lg" className="w-full" asChild>
              <Link to={`/auth?package=${pkg.slug}`}>
                Get {pkg.name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        isSierraLeone={isSierraLeone}
        packageName={pkg.name}
        packageId={pkg.id}
        requestedTier="special"
      />
    </>
  );
};
