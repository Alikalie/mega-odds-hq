import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Crown, Lock, Target, Percent, Flame, Gem, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { TipCard, Tip } from "@/components/cards/TipCard";
import { Button } from "@/components/ui/button";
import { VipPackageCard } from "@/components/packages/VipPackageCard";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const vipCategories = [
  { title: "VIP 2 Odds", description: "Premium 2 odds picks", icon: Target, count: 8 },
  { title: "VIP 5 Odds", description: "Curated 5 odds combos", icon: Percent, count: 5 },
  { title: "VIP Hot Tips", description: "Expert insider picks", icon: Flame, count: 6 },
  { title: "VIP Accumulators", description: "High-value multiples", icon: Gem, count: 3 },
];

const vipPackages = [
  {
    tier: "vip" as const,
    title: "VIP Weekly",
    price: "$15",
    period: "week",
    features: [
      "Daily VIP predictions",
      "80%+ accuracy rate",
      "Betting strategies",
      "Email notifications",
    ],
  },
  {
    tier: "vip" as const,
    title: "VIP Monthly",
    price: "$49",
    period: "month",
    isPopular: true,
    features: [
      "All weekly features",
      "Priority support",
      "VIP community access",
      "Exclusive betting guides",
      "Money-back guarantee",
    ],
  },
];

const VipPage = () => {
  const { isVip, isApproved, user } = useAuth();
  const [view, setView] = useState<"categories" | "tips">("categories");
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    if (isVip && isApproved) {
      fetchTips();
    }
  }, [isVip, isApproved]);

  const fetchTips = async () => {
    const { data } = await supabase
      .from("vip_tips")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setTips(
        data.map((t) => ({
          id: t.id,
          homeTeam: t.home_team,
          awayTeam: t.away_team,
          prediction: t.prediction,
          odds: t.odds,
          matchTime: t.match_time,
          league: t.league,
          status: t.status,
        }))
      );
    }
  };

  // Not logged in or not VIP - Show packages
  if (!user || !isApproved || !isVip) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-vip to-amber-500 flex items-center justify-center shadow-glow-vip">
              <Crown className="w-10 h-10 text-vip-foreground" />
            </div>
            
            <h1 className="text-3xl font-display font-bold">
              VIP <span className="text-vip">Packages</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Choose your VIP plan and start winning with premium predictions.
            </p>
          </motion.div>

          {/* VIP Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 space-y-3"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-vip" />
              Why Go VIP?
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Win Rate", value: "80%+" },
                { label: "Daily Tips", value: "15+" },
                { label: "Experts", value: "10+" },
                { label: "Guarantee", value: "100%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 bg-secondary/50 rounded-xl">
                  <p className="text-vip font-bold text-lg">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Packages */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Choose Your Plan
            </h2>
            {vipPackages.map((pkg, i) => (
              <VipPackageCard key={pkg.title} {...pkg} index={i} />
            ))}
          </div>

          {/* Login CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-3"
          >
            <p className="text-sm text-muted-foreground">Already have an account?</p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth">
                <Lock className="w-4 h-4 mr-2" />
                Login to Access VIP
              </Link>
            </Button>
          </motion.div>
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
            {tips.length > 0 ? (
              tips.map((tip, i) => <TipCard key={tip.id} tip={tip} index={i} />)
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No VIP tips available yet. Check back soon!
              </p>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default VipPage;
