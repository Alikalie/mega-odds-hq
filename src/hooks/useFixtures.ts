import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
  status: string;
}

export const useFixtures = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFixtures = async (league: string, date?: string) => {
    if (!league) {
      setFixtures([]);
      return;
    }

    setIsLoading(true);
    try {
      const fetchDate = date || new Date().toISOString().split("T")[0];
      const { data, error } = await supabase.functions.invoke("fetch-fixtures", {
        body: { league, date: fetchDate },
      });

      if (error) throw error;

      if (data?.fixtures && data.fixtures.length > 0) {
        setFixtures(data.fixtures);
        toast.success(`Found ${data.fixtures.length} match(es)`);
      } else {
        setFixtures([]);
        toast.info(data?.message || "No matches found for this league on selected date. Enter teams manually.");
      }
    } catch (err) {
      console.error("Error fetching fixtures:", err);
      setFixtures([]);
      toast.error("Could not fetch fixtures. Enter teams manually.");
    } finally {
      setIsLoading(false);
    }
  };

  return { fixtures, isLoading, fetchFixtures };
};
