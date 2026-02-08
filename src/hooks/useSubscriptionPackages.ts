import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SubscriptionPackage {
  id: string;
  name: string;
  slug: string;
  tier: string;
  price: number;
  duration_days: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  package_id: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  package?: SubscriptionPackage;
}

export const useSubscriptionPackages = (tier?: string) => {
  return useQuery({
    queryKey: ["subscription-packages", tier],
    queryFn: async () => {
      let query = supabase
        .from("subscription_packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (tier) {
        query = query.eq("tier", tier);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SubscriptionPackage[];
    },
  });
};

export const useAllPackages = () => {
  return useQuery({
    queryKey: ["all-subscription-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_packages")
        .select("*")
        .order("tier", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SubscriptionPackage[];
    },
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: Omit<SubscriptionPackage, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("subscription_packages")
        .insert(pkg)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
      queryClient.invalidateQueries({ queryKey: ["all-subscription-packages"] });
      toast.success("Package created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create package: ${error.message}`);
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SubscriptionPackage> & { id: string }) => {
      const { data, error } = await supabase
        .from("subscription_packages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
      queryClient.invalidateQueries({ queryKey: ["all-subscription-packages"] });
      toast.success("Package updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update package: ${error.message}`);
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscription_packages").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
      queryClient.invalidateQueries({ queryKey: ["all-subscription-packages"] });
      toast.success("Package deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete package: ${error.message}`);
    },
  });
};

export const useUserSubscriptions = (userId?: string) => {
  return useQuery({
    queryKey: ["user-subscriptions", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          package:subscription_packages(*)
        `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("expires_at", { ascending: false });

      if (error) throw error;
      return data as UserSubscription[];
    },
    enabled: !!userId,
  });
};

export const useCreateUserSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, packageId, durationDays }: { userId: string; packageId: string; durationDays: number }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          package_id: packageId,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
      toast.success("Subscription activated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to activate subscription: ${error.message}`);
    },
  });
};
