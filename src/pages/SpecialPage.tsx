import { useState } from "react";
 import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Star, Lock, Zap, Diamond, Sparkles, Rocket } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { TipCard, Tip } from "@/components/cards/TipCard";
import { UpgradeDialog } from "@/components/dialogs/UpgradeDialog";
import { Button } from "@/components/ui/button";

const specialCategories = [
  { title: "Banker Tips", description: "Guaranteed safe picks", icon: Diamond, count: 4 },
  { title: "High Stakes", description: "Maximum risk, maximum reward", icon: Zap, count: 2 },
  { title: "Jackpot Combos", description: "Life-changing multiples", icon: Sparkles, count: 1 },
  { title: "Exclusive Picks", description: "Hand-picked by experts", icon: Rocket, count: 3 },
];

const mockSpecialTips: Tip[] = [
  {
    id: "s1",
    homeTeam: "Juventus",
    awayTeam: "Napoli",
    prediction: "1X & Over 1.5",
    odds: "2.45",
    matchTime: "18:00",
    league: "Serie A",
    status: "pending",
  },
  {
    id: "s2",
    homeTeam: "Atletico Madrid",
    awayTeam: "Sevilla",
    prediction: "BTTS & Over 2.5",
    odds: "3.10",
    matchTime: "21:00",
    league: "La Liga",
    status: "pending",
  },
];

const SpecialPage = () => {
   const { isSpecial, isApproved, user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [view, setView] = useState<"categories" | "tips">("categories");

   if (!user || !isApproved || !isSpecial) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
          {/* Locked State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-6"
          >
            <div className="w-24 h-24 mx-auto rounded-3xl bg-special/10 flex items-center justify-center">
              <Lock className="w-12 h-12 text-special" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold">
                Special <span className="text-special">Predictions</span>
              </h1>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Access exclusive high-stakes predictions designed for serious bettors.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
              <h3 className="font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-special" />
                Special Benefits
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  "All VIP features included",
                  "High-stakes exclusive predictions",
                  "Personalized betting strategies",
                  "1-on-1 expert consultation",
                  "Early access to tips",
                  "Money-back guarantee",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-special/20 flex items-center justify-center">
                      <Star className="w-3 h-3 text-special" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="special"
              size="xl"
              className="w-full"
              onClick={() => setShowUpgrade(true)}
            >
              <Star className="w-5 h-5 mr-2" />
              Upgrade to Special
            </Button>
          </motion.div>

          <UpgradeDialog
            open={showUpgrade}
            onOpenChange={setShowUpgrade}
            tier="special"
          />
        </div>
      </AppLayout>
    );
  }

  // Special User View
  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold">Special Tips</h1>
            <Star className="w-6 h-6 text-special" />
          </div>
          <p className="text-sm text-muted-foreground">
            Exclusive predictions for Special members
          </p>
        </motion.div>

        <div className="flex gap-2">
          <Button
            variant={view === "categories" ? "special" : "secondary"}
            size="sm"
            onClick={() => setView("categories")}
          >
            Categories
          </Button>
          <Button
            variant={view === "tips" ? "special" : "secondary"}
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
            {specialCategories.map((category, i) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={category.icon}
                href="#"
                count={category.count}
                variant="special"
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
            {mockSpecialTips.map((tip, i) => (
              <TipCard key={tip.id} tip={tip} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default SpecialPage;
