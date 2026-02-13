import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FreeTip {
  id: string;
  home_team: string;
  away_team: string;
  prediction: string;
  odds: string;
  match_time: string;
  league: string;
  category: string;
  status: "pending" | "won" | "lost" | "void";
  created_at: string;
  updated_at: string;
}

export const useFreeTips = (categorySlug?: string) => {
  return useQuery({
    queryKey: ["free-tips", categorySlug],
    queryFn: async () => {
      // Fetch today's and yesterday's tips
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
      twoDaysAgo.setHours(0, 0, 0, 0);

      let query = supabase
        .from("free_tips")
        .select("*")
        .gte("created_at", twoDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (categorySlug) {
        query = query.eq("category", categorySlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FreeTip[];
    },
  });
};
