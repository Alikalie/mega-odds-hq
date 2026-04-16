import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Star, Package, Loader2, Calendar, Upload } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TipsTable } from "@/components/dashboard/TipsTable";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { PaymentProofUpload } from "@/components/dashboard/PaymentProofUpload";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useUserSubscriptions } from "@/hooks/useSubscriptionPackages";
import { useTipCategories } from "@/hooks/useTipCategories";
import { supabase } from "@/integrations/supabase/client";
import { Tip } from "@/components/cards/TipCard";
import { Link, Navigate } from "react-router-dom";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useBookingCodes } from "@/hooks/useBookingCodes";
import { useFeatureToggles } from "@/hooks/useFeatureToggles";
import { BookingCodeCard } from "@/components/cards/BookingCodeCard";

interface TipWithDate extends Tip {
  createdAt: string;
  category: string;
}

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

const groupTipsByDate = (tips: TipWithDate[]) => {
  const groups: Record<string, TipWithDate[]> = {};
  tips.forEach((tip) => {
    const label = getDateLabel(tip.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(tip);
  });
  return groups;
};

const UserDashboardPage = () => {
  const { user, profile, isLoading: authLoading, isApproved, isVip, isSpecial } = useAuth();
  const { data: subscriptions, isLoading: subsLoading } = useUserSubscriptions(user?.id);
  const { data: categories } = useTipCategories();

  const [freeTips, setFreeTips] = useState<TipWithDate[]>([]);
  const [vipTips, setVipTips] = useState<TipWithDate[]>([]);
  const [specialTips, setSpecialTips] = useState<TipWithDate[]>([]);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [activeFreeCategory, setActiveFreeCategory] = useState("all");
  const [activeVipCategory, setActiveVipCategory] = useState("all");
  const [activeSpecialCategory, setActiveSpecialCategory] = useState("all");
  const [hasPendingUpgrade, setHasPendingUpgrade] = useState(false);

  const { data: freeBookingCodes } = useBookingCodes("free");
  const { data: vipBookingCodes } = useBookingCodes("vip");
  const { data: specialBookingCodes } = useBookingCodes("special");
  const { data: featureToggles } = useFeatureToggles();
  const bookingCodesEnabled = featureToggles?.find((t) => t.feature_key === "booking_codes")?.is_enabled ?? false;

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
  twoDaysAgo.setHours(0, 0, 0, 0);

  const freeCategories = categories?.filter((c) => !c.is_vip && !c.is_special) || [];
  const vipCategories = categories?.filter((c) => c.is_vip) || [];
  const specialCategories = categories?.filter((c) => c.is_special) || [];

  useEffect(() => {
    if (user) {
      fetchTips();
      // Check for pending upgrade requests without payment proof
      supabase
        .from("upgrade_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .is("payment_proof_url", null)
        .limit(1)
        .then(({ data }) => {
          setHasPendingUpgrade(!!data && data.length > 0);
        });

      const channels = [
        supabase.channel("dash-free").on("postgres_changes", { event: "*", schema: "public", table: "free_tips" }, () => fetchTips()).subscribe(),
        supabase.channel("dash-vip").on("postgres_changes", { event: "*", schema: "public", table: "vip_tips" }, () => fetchTips()).subscribe(),
        supabase.channel("dash-special").on("postgres_changes", { event: "*", schema: "public", table: "special_tips" }, () => fetchTips()).subscribe(),
      ];
      return () => { channels.forEach((c) => supabase.removeChannel(c)); };
    }
  }, [user, isVip, isSpecial]);

  const mapTips = (data: any[]): TipWithDate[] =>
    data.map((t) => ({
      id: t.id,
      homeTeam: t.home_team,
      awayTeam: t.away_team,
      prediction: t.prediction,
      odds: t.odds,
      matchTime: t.match_time,
      league: t.league,
      status: t.status as Tip["status"],
      createdAt: t.created_at,
      category: t.category,
    }));

  const fetchTips = async () => {
    setTipsLoading(true);
    try {
      const { data: free } = await supabase.from("free_tips").select("*").gte("created_at", twoDaysAgo.toISOString()).order("created_at", { ascending: false });
      if (free) setFreeTips(mapTips(free));

      if (isVip) {
        const { data: vip } = await supabase.from("vip_tips").select("*").gte("created_at", twoDaysAgo.toISOString()).order("created_at", { ascending: false });
        if (vip) setVipTips(mapTips(vip));
      }

      if (isSpecial) {
        const { data: special } = await supabase.from("special_tips").select("*").gte("created_at", twoDaysAgo.toISOString()).order("created_at", { ascending: false });
        if (special) setSpecialTips(mapTips(special));
      }
    } catch (err) {
      console.error("Error fetching tips:", err);
    } finally {
      setTipsLoading(false);
    }
  };

  if (authLoading) {
    return (<AppLayout showInfo={false}><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>);
  }
  if (!user) return <Navigate to="/auth" replace />;

  const filterByCategory = (tips: TipWithDate[], activeCategory: string) =>
    activeCategory === "all" ? tips : tips.filter((t) => t.category === activeCategory);

  return (
    <AppLayout showInfo={false}>
      <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-2xl font-display font-bold">My Dashboard</h1>
          <p className="text-sm text-muted-foreground">View your tips and manage your subscriptions</p>
        </motion.div>

        {/* Subscriptions */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4" /> My Subscriptions
          </h2>
          {subsLoading ? (
            <div className="h-20 bg-card/50 animate-pulse rounded-xl" />
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-3">{subscriptions.map((sub, i) => (<SubscriptionCard key={sub.id} subscription={sub} index={i} />))}</div>
          ) : (
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-muted-foreground mb-4">No active subscriptions</p>
              <div className="flex justify-center gap-2">
                <Button variant="vip" size="sm" asChild><Link to="/vip"><Crown className="w-4 h-4 mr-1" />Get VIP</Link></Button>
                <Button variant="special" size="sm" asChild><Link to="/special"><Star className="w-4 h-4 mr-1" />Get Special</Link></Button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Tips */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Today's Odds
          </h2>
          <Tabs defaultValue="free" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="free" className="flex-1"><Trophy className="w-4 h-4 mr-1" />Free ({freeTips.length})</TabsTrigger>
              {isVip && <TabsTrigger value="vip" className="flex-1"><Crown className="w-4 h-4 mr-1" />VIP ({vipTips.length})</TabsTrigger>}
              {isSpecial && <TabsTrigger value="special" className="flex-1"><Star className="w-4 h-4 mr-1" />Special ({specialTips.length})</TabsTrigger>}
            </TabsList>

            {/* Free Tips Tab */}
            <TabsContent value="free" className="mt-4 space-y-4">
              <CategoryTabs
                categories={freeCategories}
                activeCategory={activeFreeCategory}
                onCategoryChange={setActiveFreeCategory}
                tips={freeTips}
              />
              {bookingCodesEnabled && (
                <BookingCodesSection codes={freeBookingCodes} activeCategory={activeFreeCategory} />
              )}
              <DateGroupedTips groups={groupTipsByDate(filterByCategory(freeTips, activeFreeCategory))} isLoading={tipsLoading} />
            </TabsContent>

            {/* VIP Tips Tab */}
            {isVip && (
              <TabsContent value="vip" className="mt-4 space-y-4">
                <CategoryTabs
                  categories={vipCategories}
                  activeCategory={activeVipCategory}
                  onCategoryChange={setActiveVipCategory}
                  tips={vipTips}
                />
                {bookingCodesEnabled && (
                  <BookingCodesSection codes={vipBookingCodes} activeCategory={activeVipCategory} />
                )}
                <DateGroupedTips groups={groupTipsByDate(filterByCategory(vipTips, activeVipCategory))} isLoading={tipsLoading} />
              </TabsContent>
            )}

            {/* Special Tips Tab */}
            {isSpecial && (
              <TabsContent value="special" className="mt-4 space-y-4">
                <CategoryTabs
                  categories={specialCategories}
                  activeCategory={activeSpecialCategory}
                  onCategoryChange={setActiveSpecialCategory}
                  tips={specialTips}
                />
                {bookingCodesEnabled && (
                  <BookingCodesSection codes={specialBookingCodes} activeCategory={activeSpecialCategory} />
                )}
                <DateGroupedTips groups={groupTipsByDate(filterByCategory(specialTips, activeSpecialCategory))} isLoading={tipsLoading} />
              </TabsContent>
            )}
          </Tabs>
        </motion.section>
      </div>
    </AppLayout>
  );
};

const CategoryTabs = ({ categories, activeCategory, onCategoryChange, tips }: {
  categories: { slug: string; name: string }[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  tips: TipWithDate[];
}) => {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant={activeCategory === "all" ? "default" : "outline"}
        onClick={() => onCategoryChange("all")}
        className="h-8 text-xs"
      >
        All ({tips.length})
      </Button>
      {categories.map((cat) => {
        const count = tips.filter((t) => t.category === cat.slug).length;
        return (
          <Button
            key={cat.slug}
            size="sm"
            variant={activeCategory === cat.slug ? "default" : "outline"}
            onClick={() => onCategoryChange(cat.slug)}
            className="h-8 text-xs"
          >
            {cat.name} ({count})
          </Button>
        );
      })}
    </div>
  );
};

const DateGroupedTips = ({ groups, isLoading }: { groups: Record<string, TipWithDate[]>; isLoading: boolean }) => {
  if (isLoading) return <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-card/50 animate-pulse rounded-lg" />)}</div>;
  const entries = Object.entries(groups);
  if (entries.length === 0) return <div className="text-center py-12 text-muted-foreground"><Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No tips available</p></div>;
  return (
    <div className="space-y-4">
      {entries.map(([dateLabel, tips]) => (
        <div key={dateLabel} className="space-y-2">
          <div className="flex items-center gap-2 py-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{dateLabel}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <TipsTable tips={tips} />
        </div>
      ))}
    </div>
  );
};

const BookingCodesSection = ({ codes, activeCategory }: { codes: import("@/hooks/useBookingCodes").BookingCode[] | undefined; activeCategory: string }) => {
  const filtered = codes?.filter((c) => activeCategory === "all" || c.category_slug === activeCategory) || [];
  if (filtered.length === 0) return null;
  return (
    <div className="space-y-2">
      {filtered.map((code) => (
        <BookingCodeCard key={code.id} code={code} />
      ))}
    </div>
  );
};

export default UserDashboardPage;
