import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PredictionType {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export const usePredictionTypes = () => {
  return useQuery({
    queryKey: ["prediction-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prediction_types")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as PredictionType[];
    },
  });
};
