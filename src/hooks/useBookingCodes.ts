import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BookingCode {
  id: string;
  category_slug: string;
  code: string;
  description: string | null;
  tip_type: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useBookingCodes = (tipType?: string) => {
  return useQuery({
    queryKey: ["booking-codes", tipType],
    queryFn: async () => {
      let query = supabase
        .from("booking_codes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (tipType) query = query.eq("tip_type", tipType);
      const { data, error } = await query;
      if (error) throw error;
      return data as BookingCode[];
    },
  });
};

export const useAllBookingCodes = () => {
  return useQuery({
    queryKey: ["booking-codes-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingCode[];
    },
  });
};

export const useCreateBookingCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: Omit<BookingCode, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("booking_codes")
        .insert(code)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-codes"] });
      queryClient.invalidateQueries({ queryKey: ["booking-codes-all"] });
      toast.success("Booking code added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useDeleteBookingCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("booking_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-codes"] });
      queryClient.invalidateQueries({ queryKey: ["booking-codes-all"] });
      toast.success("Booking code deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
