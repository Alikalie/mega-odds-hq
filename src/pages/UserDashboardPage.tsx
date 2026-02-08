import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Star, Package, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TipsTable } from "@/components/dashboard/TipsTable";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useUserSubscriptions } from "@/hooks/useSubscriptionPackages";
import { supabase } from "@/integrations/supabase/client";
import { Tip } from "@/components/cards/TipCard";
import { Link, Navigate } from "react-router-dom";

const UserDashboardPage = () => {
  const { user, profile, isLoading: authLoading, isApproved, isVip, isSpecial } = useAuth();
  const { data: subscriptions, isLoading: subsLoading } = useUserSubscriptions(user?.id);
  
  const [freeTips, setFreeTips] = useState<Tip[]>([]);
  const [vipTips, setVipTips] = useState<Tip[]>([]);
  const [specialTips, setSpecialTips] = useState<Tip[]>([]);
  const [tipsLoading, setTipsLoading] = useState(true);

  useEffect(() => {
    if (user && isApproved) {
      fetchTips();
    }
  }, [user, isApproved, isVip, isSpecial]);

  const fetchTips = async () => {
    setTipsLoading(true);
    try {
      // Fetch free tips (all approved users)
      const { data: free } = await supabase
        .from("free_tips")
        .select("*")
        .order("created_at", { ascending: false });

      if (free) {
        setFreeTips(
          free.map((t) => ({
            id: t.id,
            homeTeam: t.home_team,
            awayTeam: t.away_team,
            prediction: t.prediction,
            odds: t.odds,
            matchTime: t.match_time,
            league: t.league,
            status: t.status as Tip["status"],
          }))
        );
      }

      // Fetch VIP tips if user is VIP or Special
      if (isVip) {
        const { data: vip } = await supabase
          .from("vip_tips")
          .select("*")
          .order("created_at", { ascending: false });

        if (vip) {
          setVipTips(
            vip.map((t) => ({
              id: t.id,
              homeTeam: t.home_team,
              awayTeam: t.away_team,
              prediction: t.prediction,
              odds: t.odds,
              matchTime: t.match_time,
              league: t.league,
              status: t.status as Tip["status"],
            }))
          );
        }
      }

      // Fetch Special tips if user is Special
      if (isSpecial) {
        const { data: special } = await supabase
          .from("special_tips")
          .select("*")
          .order("created_at", { ascending: false });

        if (special) {
          setSpecialTips(
            special.map((t) => ({
              id: t.id,
              homeTeam: t.home_team,
              awayTeam: t.away_team,
              prediction: t.prediction,
              odds: t.odds,
              matchTime: t.match_time,
              league: t.league,
              status: t.status as Tip["status"],
            }))
          );
        }
      }
    } catch (err) {
      console.error("Error fetching tips:", err);
    } finally {
      setTipsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AppLayout showInfo={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return (
    <AppLayout showInfo={false}>
      <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-display font-bold">My Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            View your tips and manage your subscriptions
          </p>
        </motion.div>

        {/* Subscriptions */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4" />
              My Subscriptions
            </h2>
          </div>
          
          {subsLoading ? (
            <div className="h-20 bg-card/50 animate-pulse rounded-xl" />
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((sub, i) => (
                <SubscriptionCard key={sub.id} subscription={sub} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-muted-foreground mb-4">No active subscriptions</p>
              <div className="flex justify-center gap-2">
                <Button variant="vip" size="sm" asChild>
                  <Link to="/vip">
                    <Crown className="w-4 h-4 mr-1" />
                    Get VIP
                  </Link>
                </Button>
                <Button variant="special" size="sm" asChild>
                  <Link to="/special">
                    <Star className="w-4 h-4 mr-1" />
                    Get Special
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Tips Table */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Today's Odds
          </h2>

          <Tabs defaultValue="free" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="free" className="flex-1">
                <Trophy className="w-4 h-4 mr-1" />
                Free ({freeTips.length})
              </TabsTrigger>
              {isVip && (
                <TabsTrigger value="vip" className="flex-1">
                  <Crown className="w-4 h-4 mr-1" />
                  VIP ({vipTips.length})
                </TabsTrigger>
              )}
              {isSpecial && (
                <TabsTrigger value="special" className="flex-1">
                  <Star className="w-4 h-4 mr-1" />
                  Special ({specialTips.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="free" className="mt-4">
              <TipsTable tips={freeTips} isLoading={tipsLoading} />
            </TabsContent>

            {isVip && (
              <TabsContent value="vip" className="mt-4">
                <TipsTable tips={vipTips} isLoading={tipsLoading} />
              </TabsContent>
            )}

            {isSpecial && (
              <TabsContent value="special" className="mt-4">
                <TipsTable tips={specialTips} isLoading={tipsLoading} />
              </TabsContent>
            )}
          </Tabs>
        </motion.section>
      </div>
    </AppLayout>
  );
};

export default UserDashboardPage;
