import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  UserPlus,
  Calendar,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAllPackages } from "@/hooks/useSubscriptionPackages";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserSubscription {
  id: string;
  user_id: string;
  package_id: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  user_email?: string;
  package_name?: string;
  package_tier?: string;
}

const AdminSubscriptionsPage = () => {
  const { data: packages, isLoading: packagesLoading } = useAllPackages();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    packageId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all user subscriptions with package info
      const { data: subs, error: subsError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          package:subscription_packages(name, tier)
        `)
        .order("expires_at", { ascending: false });

      if (subsError) throw subsError;

      // Fetch user emails
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email");

      const profileMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);

      setSubscriptions(
        (subs || []).map((s: any) => ({
          ...s,
          user_email: profileMap.get(s.user_id) || "Unknown",
          package_name: s.package?.name,
          package_tier: s.package?.tier,
        }))
      );

      setUsers(profiles || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscription = async () => {
    if (!formData.userId || !formData.packageId) {
      toast.error("Please select both user and package");
      return;
    }

    setIsSubmitting(true);
    try {
      const pkg = packages?.find((p) => p.id === formData.packageId);
      if (!pkg) throw new Error("Package not found");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + pkg.duration_days);

      const { error } = await supabase.from("user_subscriptions").insert({
        user_id: formData.userId,
        package_id: formData.packageId,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      // Update user's subscription tier in profiles
      await supabase
        .from("profiles")
        .update({ subscription: pkg.tier as "vip" | "special" })
        .eq("id", formData.userId);

      toast.success("Subscription added successfully");
      setIsDialogOpen(false);
      setFormData({ userId: "", packageId: "" });
      fetchData();
    } catch (err: any) {
      console.error("Error adding subscription:", err);
      toast.error(err.message || "Failed to add subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast.success("Subscription deactivated");
      fetchData();
    } catch (err) {
      console.error("Error deactivating:", err);
      toast.error("Failed to deactivate subscription");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Subscription deleted");
      fetchData();
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Failed to delete subscription");
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-display font-bold">User Subscriptions</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add User Subscription</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select
                    value={formData.userId}
                    onValueChange={(v) => setFormData({ ...formData, userId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Package</Label>
                  <Select
                    value={formData.packageId}
                    onValueChange={(v) => setFormData({ ...formData, packageId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.tier}) - ${p.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddSubscription}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Assign Subscription
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Starts</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub) => {
                      const isExpired = new Date(sub.expires_at) < new Date();
                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.user_email}</TableCell>
                          <TableCell>{sub.package_name}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs capitalize",
                                sub.package_tier === "vip"
                                  ? "bg-vip/10 text-vip"
                                  : "bg-special/10 text-special"
                              )}
                            >
                              {sub.package_tier}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(sub.starts_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(sub.expires_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs",
                                isExpired || !sub.is_active
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-success/10 text-success"
                              )}
                            >
                              {isExpired ? "Expired" : sub.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(sub.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminSubscriptionsPage;
