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
      let query = supabase
        .from("free_tips")
        .select("*")
        .order("match_time", { ascending: true });

      if (categorySlug) {
        query = query.eq("category", categorySlug);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FreeTip[];
    },
  });
};
