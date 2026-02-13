import { useSearchParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Check, X, Minus, Trophy, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useFreeTips } from "@/hooks/useFreeTips";
import { useTipCategories } from "@/hooks/useTipCategories";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

const FreeTipsPage = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const queryClient = useQueryClient();

  const { data: tips, isLoading: tipsLoading } = useFreeTips(categorySlug || undefined);
  const { data: categories } = useTipCategories();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("free-tips-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "free_tips" }, () => {
        queryClient.invalidateQueries({ queryKey: ["free-tips"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const currentCategory = categories?.find((c) => c.slug === categorySlug);
  const categoryName = currentCategory?.name || "Tips";

  const grouped = tips ? groupTipsByDate(tips) : {};

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <Link to="/"><Button variant="ghost" size="sm" className="mb-2 -ml-2"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
          <h1 className="text-xl font-display font-bold">{categoryName}</h1>
          <p className="text-sm text-muted-foreground">Today's predictions</p>
        </motion.div>

        {tipsLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => (<div key={i} className="h-40 rounded-xl bg-card/50 animate-pulse" />))}</div>
        ) : tips && tips.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {Object.entries(grouped).map(([dateLabel, dateTips]) => (
              <div key={dateLabel} className="space-y-3">
                <div className="flex items-center gap-2 py-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">{dateLabel}</span>
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
                        <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Pick:</span><span className="px-2 py-1 bg-primary/10 rounded-md text-primary font-semibold text-sm">{tip.prediction}</span></div>
                        <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Odds:</span><span className="font-bold text-lg">{tip.odds}</span></div>
                      </div>
                      <div className={cn("flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium", status.bg, status.color)}>
                        <StatusIcon className="w-3.5 h-3.5" /><span>{status.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4"><Trophy className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="font-semibold text-lg mb-1">No Tips Available</h3>
            <p className="text-sm text-muted-foreground">Check back later for new predictions</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default FreeTipsPage;
