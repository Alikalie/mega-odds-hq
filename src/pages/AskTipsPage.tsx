import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, Send } from "lucide-react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Match = { id: string; tier: string; homeTeam: string; awayTeam: string; prediction: string; odds: string; league: string; matchTime: string; tipDate: string; status: string; why: string };

const EXAMPLES = ["Any over 2.5 goals tips today?", "Tips for Premier League this weekend", "Safest low-odds picks"];

const AskTipsPage = () => {
  const { user, isApproved } = useAuth();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const ask = async (question = q) => {
    if (question.trim().length < 2 || loading) return;
    setQ(question); setLoading(true); setError(null); setAnswer(null); setMatches([]);
    const { data, error } = await supabase.functions.invoke("tips-assistant", { body: { question } });
    setLoading(false);
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) { try { msg = (await error.context.json()).error || msg; } catch { /* ignore */ } }
      return setError(msg);
    }
    setAnswer(data.answer); setMatches(data.matches || []);
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-display font-bold">Ask about tips</h1>
        </div>
        {!user || !isApproved ? (
          <div className="glass-card rounded-xl p-5 text-sm text-muted-foreground">
            This assistant is available to approved members.{" "}
            {!user && <Link to="/auth" className="text-primary font-medium">Sign in</Link>}
          </div>
        ) : (
          <>
            <div className="glass-card rounded-xl p-4 space-y-3">
              <Textarea rows={3} maxLength={500} placeholder="e.g. Which tips today are for both teams to score?" value={q} onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }} />
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button key={ex} onClick={() => ask(ex)} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground">{ex}</button>
                ))}
              </div>
              <Button className="w-full" disabled={loading || q.trim().length < 2} onClick={() => ask()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Ask
              </Button>
            </div>
            {error && <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
            {answer && <p className="text-sm">{answer}</p>}
            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m.id} className="glass-card rounded-xl p-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{m.league} · {m.tipDate} {m.matchTime}</span>
                    <span className="uppercase font-semibold text-primary">{m.tier}</span>
                  </div>
                  <p className="font-semibold">{m.homeTeam} vs {m.awayTeam}</p>
                  <p className="text-sm">Prediction: <span className="font-medium">{m.prediction}</span>{m.odds ? ` · Odds ${m.odds}` : ""} · <span className="capitalize">{m.status}</span></p>
                  <p className="text-xs text-muted-foreground">{m.why}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AskTipsPage;
