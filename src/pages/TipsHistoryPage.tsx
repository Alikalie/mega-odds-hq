import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Check, X, Minus, Trophy, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const statusConfig = {
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/50", label: "Pending" },
  won: { icon: Check, color: "text-success", bg: "bg-success/10", label: "Won" },
  lost: { icon: X, color: "text-destructive", bg: "bg-destructive/10", label: "Lost" },
  void: { icon: Minus, color: "text-muted-foreground", bg: "bg-muted/30", label: "Void" },
};

const TYPE_TO_TABLE: Record<string, "free_tips" | "vip_tips" | "special_tips"> = {
  free: "free_tips",
  vip: "vip_tips",
  special: "special_tips",
};

const TYPE_TO_LABEL: Record<string, string> = {
  free: "Free Tips",
  vip: "VIP Tips",
  special: "Special Tips",
};

const TipsHistoryPage = () => {
  const { type = "free" } = useParams<{ type: string }>();
  const { isApproved, isVip, isSpecial } = useAuth();
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const table = TYPE_TO_TABLE[type] || "free_tips";
  const label = TYPE_TO_LABEL[type] || "Tips";

  // Block VIP/Special history if not entitled
  const blocked =
    (type === "vip" && (!isApproved || !isVip)) ||
    (type === "special" && (!isApproved || !isSpecial));

  useEffect(() => {
    if (blocked) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      setTips(data || []);
      setLoading(false);
    };
    load();
  }, [table, blocked]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    tips.forEach((t) => {
      const key = format(parseISO(t.created_at), "yyyy-MM-dd");
      if (!g[key]) g[key] = [];
      g[key].push(t);
    });
    return g;
  }, [tips]);

  const dateKeys = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <Link to={`/${type === "free" ? "free-tips" : type}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />Back
            </Button>
          </Link>
          <h1 className="text-xl font-display font-bold">{label} History</h1>
          <p className="text-sm text-muted-foreground">All previous predictions by date</p>
        </motion.div>

        {blocked ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            You need an active {type.toUpperCase()} subscription to view this history.
          </div>
        ) : loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : dateKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No History Yet</h3>
            <p className="text-sm text-muted-foreground">Past predictions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dateKeys.map((dk) => {
              const dayTips = grouped[dk];
              const dateLabel = format(parseISO(dk), "EEEE, MMM d, yyyy");
              return (
                <div key={dk} className="space-y-3">
                  <div className="flex items-center gap-2 py-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{dateLabel}</span>
                    <span className="text-xs text-muted-foreground">({dayTips.length})</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {dayTips.map((tip: any, i: number) => {
                    const status = statusConfig[tip.status as keyof typeof statusConfig] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="glass-card rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">{tip.league}</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" /><span>{tip.match_time}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">H</div><span className="font-medium">{tip.home_team}</span></div>
                          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">A</div><span className="font-medium">{tip.away_team}</span></div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Pick:</span><span className="px-2 py-1 bg-primary/10 rounded-md text-primary font-semibold text-sm">{tip.prediction}</span></div>
                          {tip.odds && (
                            <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Odds:</span><span className="font-bold text-lg">{tip.odds}</span></div>
                          )}
                        </div>
                        <div className={cn("flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium", status.bg, status.color)}>
                          <StatusIcon className="w-3.5 h-3.5" /><span>{status.label}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TipsHistoryPage;
