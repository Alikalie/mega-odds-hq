import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Star, Lock, Zap, Diamond, Sparkles, Shield, Loader2, Clock, Check, X, Minus, Trophy, Calendar as CalendarIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpecialPackageCard } from "@/components/packages/SpecialPackageCard";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import { useTipCategories } from "@/hooks/useTipCategories";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";


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

const SpecialPage = () => {
  const { isSpecial, isApproved, user } = useAuth();
  const { data: packages, isLoading: packagesLoading } = useSubscriptionPackages("special");
  const { data: categories } = useTipCategories();
  const [tips, setTips] = useState<any[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState(categorySlug || "all");

  const specialCategories = categories?.filter((c) => c.is_special) || [];

  useEffect(() => {
    if (isSpecial && isApproved) {
      fetchTips();
    }
  }, [isSpecial, isApproved]);

  useEffect(() => {
    if (categorySlug) setActiveCategory(categorySlug);
  }, [categorySlug]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("special-tips-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "special_tips" }, () => {
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
      .from("special_tips")
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

  // Not logged in or not Special - Show packages
  if (!user || !isApproved || !isSpecial) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-special to-red-500 flex items-center justify-center shadow-glow-special">
              <Star className="w-10 h-10 text-special-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold">Special <span className="text-special">Packages</span></h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">Exclusive high-stakes predictions for serious bettors. Choose your tier.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-special" />Special Member Benefits</h3>
            <div className="space-y-3">
              {[
                { icon: Diamond, text: "Exclusive high-odds predictions" },
                { icon: Zap, text: "Personal betting advisor" },
                { icon: Sparkles, text: "Priority insider tips" },
                { icon: Star, text: "Money-back guarantee" },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-special/10 flex items-center justify-center"><benefit.icon className="w-4 h-4 text-special" /></div>
                  <span className="text-sm text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Choose Your Package</h2>
            {packagesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-special" /></div>
            ) : packages && packages.length > 0 ? (
              <div className="grid gap-4">
                {packages.map((pkg, i) => (<SpecialPackageCard key={pkg.id} pkg={pkg} index={i} />))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No packages available at the moment</p>
            )}
          </div>

          

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Already have an account?</p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth"><Lock className="w-4 h-4 mr-2" />Login to Access Special</Link>
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Special User View - Show tips with category tabs
  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold">Special Tips</h1>
            <Star className="w-6 h-6 text-special" />
          </div>
          <p className="text-sm text-muted-foreground">Exclusive predictions for Special members</p>
        </motion.div>

        {/* Category Tabs */}
        {specialCategories.length > 0 && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-1 justify-start">
              <TabsTrigger value="all">All</TabsTrigger>
              {specialCategories.map((cat) => (
                <TabsTrigger key={cat.slug} value={cat.slug}>{cat.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {tipsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-special" /></div>
          ) : filteredTips.length > 0 ? (
            Object.entries(grouped).map(([dateLabel, dateTips]) => (
              <div key={dateLabel} className="space-y-3">
                <div className="flex items-center gap-2 py-2">
                  <CalendarIcon className="w-4 h-4 text-special" />
                  <span className="text-sm font-semibold text-special">{dateLabel}</span>
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
                        <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Pick:</span><span className="px-2 py-1 bg-special/10 rounded-md text-special font-semibold text-sm">{tip.prediction}</span></div>
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
              <h3 className="font-semibold text-lg mb-1">No Special Tips Available</h3>
              <p className="text-sm text-muted-foreground">Check back later for new predictions</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SpecialPage;
