import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FeatureToggle {
  id: string;
  feature_key: string;
  feature_name: string;
  description: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminFeatureAccess {
  id: string;
  admin_id: string;
  feature_key: string;
  is_granted: boolean;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useFeatureToggles = () => {
  return useQuery({
    queryKey: ["feature-toggles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_toggles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as FeatureToggle[];
    },
  });
};

export const useFeatureEnabled = (featureKey: string) => {
  const { data: toggles } = useFeatureToggles();
  return toggles?.find((t) => t.feature_key === featureKey)?.is_enabled ?? false;
};

export const useUpdateFeatureToggle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from("feature_toggles")
        .update({ is_enabled, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-toggles"] });
      toast.success("Feature toggle updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useAdminFeatureAccess = () => {
  return useQuery({
    queryKey: ["admin-feature-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_feature_access")
        .select("*");
      if (error) throw error;
      return data as AdminFeatureAccess[];
    },
  });
};

export const useMyFeatureAccess = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["my-feature-access", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_feature_access")
        .select("*")
        .eq("admin_id", userId!)
        .eq("is_granted", true);
      if (error) throw error;
      return data as AdminFeatureAccess[];
    },
  });
};

export const useUpsertAdminAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      admin_id,
      feature_key,
      is_granted,
      granted_by,
    }: {
      admin_id: string;
      feature_key: string;
      is_granted: boolean;
      granted_by: string;
    }) => {
      const { error } = await supabase
        .from("admin_feature_access")
        .upsert(
          { admin_id, feature_key, is_granted, granted_by, updated_at: new Date().toISOString() },
          { onConflict: "admin_id,feature_key" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-access"] });
      toast.success("Admin access updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
