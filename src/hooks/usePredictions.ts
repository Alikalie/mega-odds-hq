import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface Prediction {
  match_id: number;
  kickoff: string;
  status: string;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  league: string;
  country: string;
  score: { home: number; away: number; ht_home: number; ht_away: number } | null;
  predictions: {
    result: string;
    correct_score: string;
    htft: string;
    btts: boolean;
    over_25: boolean;
  } | null;
  probabilities: Record<string, number | null> | null;
  odds: Record<string, string> | null;
  edge_analysis: Record<string, {
    model_prob: number;
    implied_prob: number;
    odds: string;
    edge_pct: number;
    rating: string;
  }> | null;
  best_value: any;
  value_score: number;
  form: { home: string; away: string; home_btts: string; away_btts: string } | null;
  is_trap: boolean;
}

export const usePredictions = (date?: Date) => {
  const dateStr = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["predictions", dateStr],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-predictions", {
        body: { date: dateStr },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch predictions");
      return data.data as Prediction[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
