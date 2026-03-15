import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Crown, Lock, Sparkles, Loader2, Clock, Check, X, Minus, Trophy, Calendar as CalendarIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VipPackageCard } from "@/components/packages/VipPackageCard";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { useTipCategories } from "@/hooks/useTipCategories";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { AdBanner } from "@/components/ads/AdBanner";

const statusConfig = {
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/50", label: "Pending" },
  won: { icon: Check, color: "text-success", bg: "bg-success/10", label: "Won" },
  lost: { icon: X, color: "text-destructive", bg: "bg-destructive/10", label: "Lost" },
  void: { icon: Minus, color: "text-muted-foreground", bg: "bg-muted/30", label: "Void" },
};

const getDateLabel = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMM d");
  } catch {
    return "Unknown Date";
  }
};

const groupTipsByDate = (tips: any[]) => {
  const groups: Record<string, any[]> = {};
  tips.forEach((tip) => {
    const label = getDateLabel(tip.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(tip);
  });
  return groups;
};

const VipPage = () => {
  const { isVip, isApproved, user } = useAuth();
  const { data: packages, isLoading: packagesLoading } = useSubscriptionPackages("vip");
  const { data: categories } = useTipCategories();
  const [tips, setTips] = useState<any[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState(categorySlug || "all");
  const queryClient = useQueryClient();

  const vipCategories = categories?.filter((c) => c.is_vip) || [];

  useEffect(() => {
    if (isVip && isApproved) {
      fetchTips();
    }
  }, [isVip, isApproved]);

  useEffect(() => {
    if (categorySlug) setActiveCategory(categorySlug);
  }, [categorySlug]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("vip-tips-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "vip_tips" }, () => {
        fetchTips();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTips = async () => {
    setTipsLoading(true);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("vip_tips")
      .select("*")
      .gte("created_at", twoDaysAgo.toISOString())
      .order("created_at", { ascending: false });
    if (data) setTips(data);
    setTipsLoading(false);
  };

  const filteredTips = tips.filter((tip) =>
    activeCategory === "all" || tip.category === activeCategory
  );
  const grouped = groupTipsByDate(filteredTips);

  // Not logged in or not VIP - Show packages
  if (!user || !isApproved || !isVip) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-vip to-amber-500 flex items-center justify-center shadow-glow-vip">
              <Crown className="w-10 h-10 text-vip-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold">VIP <span className="text-vip">Packages</span></h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">Choose your VIP plan and start winning with premium predictions.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-vip" />Why Go VIP?</h3>
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

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Choose Your Plan</h2>
            {packagesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-vip" /></div>
            ) : packages && packages.length > 0 ? (
              <div className="space-y-4">
                {packages.map((pkg, i) => (
                  <VipPackageCard key={pkg.id} tier="vip" title={pkg.name} price={`$${pkg.price}`} period={`${pkg.duration_days} days`} features={pkg.features} isPopular={pkg.is_popular} index={i} packageId={pkg.id} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No packages available at the moment</p>
            )}
          </div>

          <AdBanner slot="2345678901" format="rectangle" />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Already have an account?</p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth"><Lock className="w-4 h-4 mr-2" />Login to Access VIP</Link>
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // VIP User View - Show tips with category tabs
  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold">VIP Tips</h1>
            <Crown className="w-6 h-6 text-vip" />
          </div>
          <p className="text-sm text-muted-foreground">Premium predictions for VIP members</p>
        </motion.div>

        {/* Category Tabs */}
        {vipCategories.length > 0 && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-1 justify-start">
              <TabsTrigger value="all">All</TabsTrigger>
              {vipCategories.map((cat) => (
                <TabsTrigger key={cat.slug} value={cat.slug}>{cat.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {tipsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-vip" /></div>
          ) : filteredTips.length > 0 ? (
            Object.entries(grouped).map(([dateLabel, dateTips]) => (
              <div key={dateLabel} className="space-y-3">
                <div className="flex items-center gap-2 py-2">
                  <CalendarIcon className="w-4 h-4 text-vip" />
                  <span className="text-sm font-semibold text-vip">{dateLabel}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {dateTips.map((tip: any, i: number) => {
                  const status = statusConfig[tip.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <motion.div key={tip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }} className="glass-card rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">{tip.league}</span>
                        <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /><span>{tip.match_time}</span></div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">H</div><span className="font-medium">{tip.home_team}</span></div>
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">A</div><span className="font-medium">{tip.away_team}</span></div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Pick:</span><span className="px-2 py-1 bg-vip/10 rounded-md text-vip font-semibold text-sm">{tip.prediction}</span></div>
                        <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Odds:</span><span className="font-bold text-lg">{tip.odds}</span></div>
                      </div>
                      <div className={cn("flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium", status.bg, status.color)}>
                        <StatusIcon className="w-3.5 h-3.5" /><span>{status.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4"><Trophy className="w-8 h-8 text-muted-foreground" /></div>
              <h3 className="font-semibold text-lg mb-1">No VIP Tips Available</h3>
              <p className="text-sm text-muted-foreground">Check back later for new predictions</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default VipPage;
