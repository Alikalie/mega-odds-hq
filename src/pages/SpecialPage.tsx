import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Star, Lock, Zap, Diamond, Sparkles, Shield, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TipCard, Tip } from "@/components/cards/TipCard";
import { Button } from "@/components/ui/button";
import { SpecialPackageCard } from "@/components/packages/SpecialPackageCard";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";

const SpecialPage = () => {
  const { isSpecial, isApproved, user } = useAuth();
  const { data: packages, isLoading: packagesLoading } = useSubscriptionPackages("special");
  const [tips, setTips] = useState<Tip[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);

  useEffect(() => {
    if (isSpecial && isApproved) {
      fetchTips();
    }
  }, [isSpecial, isApproved]);

  const fetchTips = async () => {
    setTipsLoading(true);
    const { data } = await supabase
      .from("special_tips")
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
    setTipsLoading(false);
  };

  // Not logged in or not Special - Show packages
  if (!user || !isApproved || !isSpecial) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-special to-red-500 flex items-center justify-center shadow-glow-special">
              <Star className="w-10 h-10 text-special-foreground" />
            </div>
            
            <h1 className="text-3xl font-display font-bold">
              Special <span className="text-special">Packages</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Exclusive high-stakes predictions for serious bettors. Choose your tier.
            </p>
          </motion.div>

          {/* Special Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 space-y-4"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-special" />
              Special Member Benefits
            </h3>
            <div className="space-y-3">
              {[
                { icon: Diamond, text: "Exclusive high-odds predictions" },
                { icon: Zap, text: "Personal betting advisor" },
                { icon: Sparkles, text: "Priority insider tips" },
                { icon: Star, text: "Money-back guarantee" },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-special/10 flex items-center justify-center">
                    <benefit.icon className="w-4 h-4 text-special" />
                  </div>
                  <span className="text-sm text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Packages Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Choose Your Package
            </h2>
            {packagesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-special" />
              </div>
            ) : packages && packages.length > 0 ? (
              <div className="grid gap-4">
                {packages.map((pkg, i) => (
                  <SpecialPackageCard key={pkg.id} pkg={pkg} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No packages available at the moment
              </p>
            )}
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
                Login to Access Special
              </Link>
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Special User View - Show tips
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {tipsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-special" />
            </div>
          ) : tips.length > 0 ? (
            tips.map((tip, i) => <TipCard key={tip.id} tip={tip} index={i} />)
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No Special tips available yet. Check back soon!
            </p>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SpecialPage;
