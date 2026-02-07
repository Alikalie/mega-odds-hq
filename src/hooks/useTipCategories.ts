import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TipCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  tip_count: number;
  is_active: boolean;
  display_order: number;
  is_vip: boolean;
  is_special: boolean;
  created_at: string;
  updated_at: string;
}

export const useTipCategories = () => {
  return useQuery({
    queryKey: ["tip-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tip_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as TipCategory[];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<TipCategory, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("tip_categories")
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tip-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TipCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from("tip_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tip-categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tip_categories").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tip-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
};
