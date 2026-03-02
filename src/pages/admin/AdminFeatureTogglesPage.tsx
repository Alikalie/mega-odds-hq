import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings2, Loader2, Shield, UserCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SuperAdminGuard } from "@/components/guards/SuperAdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useFeatureToggles, useUpdateFeatureToggle, useAdminFeatureAccess, useUpsertAdminAccess } from "@/hooks/useFeatureToggles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  user_id: string;
  role: string;
  email?: string;
}

const AdminFeatureTogglesPage = () => {
  const { user } = useAuth();
  const { data: toggles, isLoading } = useFeatureToggles();
  const updateToggle = useUpdateFeatureToggle();
  const { data: allAccess } = useAdminFeatureAccess();
  const upsertAccess = useUpsertAdminAccess();
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");
    if (roles && roles.length > 0) {
      const ids = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", ids);
      setAdmins(
        roles.map((r) => ({
          ...r,
          email: profiles?.find((p) => p.id === r.user_id)?.email,
        }))
      );
    }
  };

  const isAdminGranted = (adminId: string, featureKey: string) => {
    return allAccess?.some((a) => a.admin_id === adminId && a.feature_key === featureKey && a.is_granted) ?? false;
  };

  return (
    <SuperAdminGuard>
      <AdminLayout title="Feature Toggles">
        <div className="space-y-8">
          {/* Feature Switches */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Settings2 className="w-4 h-4" /> Feature Controls
            </div>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : toggles?.map((toggle) => (
              <div key={toggle.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-semibold">{toggle.feature_name}</Label>
                  <p className="text-xs text-muted-foreground">{toggle.description}</p>
                </div>
                <Switch
                  checked={toggle.is_enabled}
                  onCheckedChange={(checked) => updateToggle.mutate({ id: toggle.id, is_enabled: checked })}
                />
              </div>
            ))}
          </motion.div>

          {/* Admin Access Assignment */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <UserCheck className="w-4 h-4" /> Admin Feature Access
            </div>
            <p className="text-xs text-muted-foreground">
              Assign which admins can use each feature. Super Admins always have access.
            </p>

            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No regular admins found</p>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div key={admin.user_id} className="glass-card rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{admin.email || admin.user_id}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {toggles?.map((toggle) => (
                        <label key={toggle.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={isAdminGranted(admin.user_id, toggle.feature_key)}
                            onCheckedChange={(checked) => {
                              upsertAccess.mutate({
                                admin_id: admin.user_id,
                                feature_key: toggle.feature_key,
                                is_granted: !!checked,
                                granted_by: user?.id || "",
                              });
                            }}
                          />
                          {toggle.feature_name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </AdminLayout>
    </SuperAdminGuard>
  );
};

export default AdminFeatureTogglesPage;
