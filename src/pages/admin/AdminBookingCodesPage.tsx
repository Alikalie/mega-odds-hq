import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Copy, Loader2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useTipCategories } from "@/hooks/useTipCategories";
import { useAllBookingCodes, useCreateBookingCode, useDeleteBookingCode } from "@/hooks/useBookingCodes";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureEnabled, useMyFeatureAccess } from "@/hooks/useFeatureToggles";
import { toast } from "sonner";

const AdminBookingCodesPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const { data: categories } = useTipCategories();
  const { data: codes, isLoading } = useAllBookingCodes();
  const createCode = useCreateBookingCode();
  const deleteCode = useDeleteBookingCode();
  const featureEnabled = useFeatureEnabled("booking_codes");
  const { data: myAccess } = useMyFeatureAccess(user?.id);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    description: "",
    category_slug: "",
    tip_type: "free",
  });

  // Check access: super admin always has access, regular admin needs grant
  const hasAccess = isSuperAdmin || myAccess?.some((a) => a.feature_key === "booking_codes" && a.is_granted);

  if (!featureEnabled && !isSuperAdmin) {
    return (
      <AdminGuard>
        <AdminLayout title="Booking Codes">
          <div className="text-center py-20 text-muted-foreground">
            <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>This feature is currently disabled by the Super Admin.</p>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  if (!hasAccess) {
    return (
      <AdminGuard>
        <AdminLayout title="Booking Codes">
          <div className="text-center py-20 text-muted-foreground">
            <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You don't have access to this feature. Contact Super Admin to enable it.</p>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  const handleAdd = async () => {
    if (!newCode.code || !newCode.category_slug) {
      toast.error("Please fill in code and select a category");
      return;
    }
    await createCode.mutateAsync({
      code: newCode.code,
      description: newCode.description || null,
      category_slug: newCode.category_slug,
      tip_type: newCode.tip_type,
      is_active: true,
      created_by: user?.id || null,
    });
    setDialogOpen(false);
    setNewCode({ code: "", description: "", category_slug: "", tip_type: "free" });
  };

  const allCategories = categories || [];

  return (
    <AdminGuard>
      <AdminLayout title="Booking Codes">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Add booking codes that users can copy for each category.
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Add Code</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Booking Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Booking Code</Label>
                    <Input
                      placeholder="e.g., ABC12345"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Input
                      placeholder="e.g., Today's accumulator"
                      value={newCode.description}
                      onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tip Type</Label>
                    <Select value={newCode.tip_type} onValueChange={(v) => setNewCode({ ...newCode, tip_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newCode.category_slug} onValueChange={(v) => setNewCode({ ...newCode, category_slug: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleAdd} disabled={createCode.isPending}>
                    {createCode.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Booking Code
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : codes && codes.length > 0 ? (
            <div className="space-y-3">
              {codes.map((code, i) => {
                const cat = allCategories.find((c) => c.slug === code.category_slug);
                return (
                  <motion.div
                    key={code.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{code.code}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                          {code.tip_type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {cat?.name || code.category_slug}
                        {code.description && ` — ${code.description}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => deleteCode.mutate(code.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No booking codes yet</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminBookingCodesPage;
