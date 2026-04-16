import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePredictions, type Prediction } from "@/hooks/usePredictions";
import { format } from "date-fns";
import { Calendar, TrendingUp, Shield, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ratingColors: Record<string, string> = {
  strong_value: "text-green-500 bg-green-500/10",
  value: "text-emerald-500 bg-emerald-500/10",
  fair: "text-muted-foreground bg-muted/50",
  poor: "text-orange-500 bg-orange-500/10",
  avoid: "text-destructive bg-destructive/10",
};

const PredictionCard = ({ match }: { match: Prediction }) => {
  const [expanded, setExpanded] = useState(false);
  const kickoffTime = new Date(match.kickoff);
  const isLive = match.status === "1H" || match.status === "2H" || match.status === "HT";
  const isFinished = match.status === "FT";

  // Find best value market
  const bestMarket = match.edge_analysis
    ? Object.entries(match.edge_analysis)
        .filter(([, v]) => v.rating === "strong_value" || v.rating === "value")
        .sort((a, b) => b[1].edge_pct - a[1].edge_pct)[0]
    : null;

  const marketLabels: Record<string, string> = {
    home_win: "Home Win",
    draw: "Draw",
    away_win: "Away Win",
    btts_yes: "BTTS Yes",
    btts_no: "BTTS No",
    over_15: "Over 1.5",
    over_25: "Over 2.5",
    over_35: "Over 3.5",
    fh_over_05: "1H Over 0.5",
    fh_over_15: "1H Over 1.5",
    dc_1x: "DC 1X",
    dc_12: "DC 12",
    dc_x2: "DC X2",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2 bg-secondary/30 flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{match.league} • {match.country}</span>
        <span className={cn("font-medium", isLive ? "text-green-500" : isFinished ? "text-muted-foreground" : "text-primary")}>
          {isLive ? `🔴 LIVE (${match.status})` : isFinished ? "FT" : format(kickoffTime, "HH:mm")}
        </span>
      </div>

      {/* Teams & Score */}
      <div className="px-4 py-3 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {match.home_logo && <img src={match.home_logo} alt="" className="w-5 h-5" />}
            <span className="font-semibold text-sm">{match.home_team}</span>
          </div>
          {match.score && <span className="font-bold text-lg">{match.score.home}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {match.away_logo && <img src={match.away_logo} alt="" className="w-5 h-5" />}
            <span className="font-semibold text-sm">{match.away_team}</span>
          </div>
          {match.score && <span className="font-bold text-lg">{match.score.away}</span>}
        </div>
      </div>

      {/* Prediction & Best Value */}
      <div className="px-4 pb-3 space-y-2">
        {match.predictions && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2 py-1 rounded bg-primary/10 text-primary font-semibold">
              {match.predictions.result?.replace("_", " ").toUpperCase()}
            </span>
            {match.predictions.btts && (
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-medium">BTTS ✓</span>
            )}
            {match.predictions.over_25 && (
              <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 font-medium">Over 2.5</span>
            )}
            {match.is_trap && (
              <span className="px-2 py-1 rounded bg-destructive/10 text-destructive font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />Trap
              </span>
            )}
          </div>
        )}

        {bestMarket && (
          <div className={cn("flex items-center justify-between px-3 py-2 rounded-lg", ratingColors[bestMarket[1].rating])}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">Best: {marketLabels[bestMarket[0]] || bestMarket[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span>Odds: {bestMarket[1].odds}</span>
              <span className="font-bold">+{bestMarket[1].edge_pct.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Form */}
        {match.form && (
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-muted-foreground">Form:</span>
            <div className="flex gap-0.5">
              {match.form.home.split("").map((c, i) => (
                <span key={i} className={cn("w-4 h-4 rounded flex items-center justify-center font-bold",
                  c === "W" ? "bg-green-500/20 text-green-500" :
                  c === "D" ? "bg-yellow-500/20 text-yellow-500" :
                  "bg-destructive/20 text-destructive"
                )}>{c}</span>
              ))}
            </div>
            <span className="text-muted-foreground">vs</span>
            <div className="flex gap-0.5">
              {match.form.away.split("").map((c, i) => (
                <span key={i} className={cn("w-4 h-4 rounded flex items-center justify-center font-bold",
                  c === "W" ? "bg-green-500/20 text-green-500" :
                  c === "D" ? "bg-yellow-500/20 text-yellow-500" :
                  "bg-destructive/20 text-destructive"
                )}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Expand for odds */}
        <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide Details" : "Show Odds & Analysis"}
        </Button>

        {expanded && match.odds && (
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {Object.entries(match.odds).slice(0, 12).map(([key, val]) => {
              const edge = match.edge_analysis?.[key];
              return (
                <div key={key} className={cn("text-center p-1.5 rounded", edge ? ratingColors[edge.rating] : "bg-muted/30")}>
                  <p className="text-[10px] text-muted-foreground truncate">{marketLabels[key] || key.replace(/_/g, " ")}</p>
                  <p className="font-bold">{val}</p>
                  {edge && <p className="text-[9px]">{edge.edge_pct > 0 ? "+" : ""}{edge.edge_pct.toFixed(1)}%</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PredictionsPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: predictions, isLoading, isError } = usePredictions(selectedDate);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  // Group by league
  const grouped = predictions?.reduce((acc, match) => {
    const key = `${match.country} - ${match.league}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, Prediction[]>) || {};

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-display font-bold">AI Predictions</h1>
          </div>
          <p className="text-sm text-muted-foreground">Edge analysis & value picks powered by AI</p>
        </motion.div>

        {/* Date Picker */}
        <div className="flex items-center justify-between glass-card rounded-xl p-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{format(selectedDate, "EEEE, MMM d, yyyy")}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        

        {isLoading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching AI predictions...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive" />
            <p>Failed to load predictions. Try again later.</p>
          </div>
        ) : predictions && predictions.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([league, matches]) => (
              <div key={league} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded bg-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{league}</span>
                  <span className="text-[10px] text-muted-foreground">({matches.length})</span>
                </div>
                {matches.map((match) => (
                  <PredictionCard key={match.match_id} match={match} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-semibold">No predictions available</p>
            <p className="text-sm">Try another date</p>
          </div>
        )}

        
      </div>
    </AppLayout>
  );
};

export default PredictionsPage;
