import { useState } from "react";
 import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Crown, Lock, Target, Percent, Flame, Gem } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { TipCard, Tip } from "@/components/cards/TipCard";
import { UpgradeDialog } from "@/components/dialogs/UpgradeDialog";
import { Button } from "@/components/ui/button";

const vipCategories = [
  { title: "VIP 2 Odds", description: "Premium 2 odds picks", icon: Target, count: 8 },
  { title: "VIP 5 Odds", description: "Curated 5 odds combos", icon: Percent, count: 5 },
  { title: "VIP Hot Tips", description: "Expert insider picks", icon: Flame, count: 6 },
  { title: "VIP Accumulators", description: "High-value multiples", icon: Gem, count: 3 },
];

const mockVipTips: Tip[] = [
  {
    id: "v1",
    homeTeam: "AC Milan",
    awayTeam: "Inter Milan",
    prediction: "Draw",
    odds: "3.20",
    matchTime: "20:45",
    league: "Serie A",
    status: "pending",
  },
  {
    id: "v2",
    homeTeam: "Chelsea",
    awayTeam: "Arsenal",
    prediction: "Under 2.5",
    odds: "2.10",
    matchTime: "16:30",
    league: "Premier League",
    status: "pending",
  },
];

const VipPage = () => {
   const { isVip, isApproved, user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [view, setView] = useState<"categories" | "tips">("categories");

   if (!user || !isApproved || !isVip) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
          {/* Locked State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-6"
          >
            <div className="w-24 h-24 mx-auto rounded-3xl bg-vip/10 flex items-center justify-center">
              <Lock className="w-12 h-12 text-vip" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold">
                VIP <span className="text-vip">Predictions</span>
              </h1>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Upgrade to VIP to access premium predictions with higher accuracy rates.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
              <h3 className="font-semibold flex items-center gap-2">
                <Crown className="w-5 h-5 text-vip" />
                VIP Benefits
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  "Daily VIP predictions",
                  "Higher accuracy tips (80%+)",
                  "Exclusive betting strategies",
                  "Priority customer support",
                  "Access to VIP community",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-vip/20 flex items-center justify-center">
                      <Crown className="w-3 h-3 text-vip" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="vip"
              size="xl"
              className="w-full"
              onClick={() => setShowUpgrade(true)}
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to VIP
            </Button>
          </motion.div>

          <UpgradeDialog
            open={showUpgrade}
            onOpenChange={setShowUpgrade}
            tier="vip"
          />
        </div>
      </AppLayout>
    );
  }

  // VIP User View
  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold">VIP Tips</h1>
            <Crown className="w-6 h-6 text-vip" />
          </div>
          <p className="text-sm text-muted-foreground">
            Premium predictions for VIP members
          </p>
        </motion.div>

        <div className="flex gap-2">
          <Button
            variant={view === "categories" ? "vip" : "secondary"}
            size="sm"
            onClick={() => setView("categories")}
          >
            Categories
          </Button>
          <Button
            variant={view === "tips" ? "vip" : "secondary"}
            size="sm"
            onClick={() => setView("tips")}
          >
            All Tips
          </Button>
        </div>

        {view === "categories" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {vipCategories.map((category, i) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={category.icon}
                href="#"
                count={category.count}
                variant="vip"
                index={i}
              />
            ))}
          </motion.div>
        )}

        {view === "tips" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {mockVipTips.map((tip, i) => (
              <TipCard key={tip.id} tip={tip} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default VipPage;
