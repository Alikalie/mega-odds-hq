import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Package,
  Crown,
  Star,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import {
  useAllPackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  SubscriptionPackage,
} from "@/hooks/useSubscriptionPackages";
import { cn } from "@/lib/utils";

const AdminPackagesPage = () => {
  const { data: packages, isLoading } = useAllPackages();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tier: "special",
    price: "",
    duration_days: "30",
    features: "",
    is_popular: false,
    is_active: true,
    display_order: "0",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      tier: "special",
      price: "",
      duration_days: "30",
      features: "",
      is_popular: false,
      is_active: true,
      display_order: "0",
    });
    setEditingPackage(null);
  };

  const openEditDialog = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      slug: pkg.slug,
      tier: pkg.tier,
      price: pkg.price.toString(),
      duration_days: pkg.duration_days.toString(),
      features: pkg.features.join("\n"),
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      display_order: pkg.display_order.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const featuresArray = formData.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const packageData = {
      name: formData.name,
      slug: formData.slug,
      tier: formData.tier,
      price: parseFloat(formData.price),
      duration_days: parseInt(formData.duration_days),
      features: featuresArray,
      is_popular: formData.is_popular,
      is_active: formData.is_active,
      display_order: parseInt(formData.display_order),
    };

    if (editingPackage) {
      await updatePackage.mutateAsync({ id: editingPackage.id, ...packageData });
    } else {
      await createPackage.mutateAsync(packageData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      await deletePackage.mutateAsync(id);
    }
  };

  const vipPackages = packages?.filter((p) => p.tier === "vip") || [];
  const specialPackages = packages?.filter((p) => p.tier === "special") || [];

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
            <h1 className="text-lg font-display font-bold">Subscription Packages</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., Gold"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      placeholder="e.g., gold"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="49.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (days)</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    placeholder="30 days access&#10;Priority support&#10;VIP community"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_popular}
                      onCheckedChange={(c) => setFormData({ ...formData, is_popular: c })}
                    />
                    <Label>Popular Badge</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={createPackage.isPending || updatePackage.isPending}
                >
                  {(createPackage.isPending || updatePackage.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* VIP Packages */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-vip" />
                  <h2 className="text-lg font-display font-bold text-vip">VIP Packages</h2>
                </div>
                <div className="glass-card rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Popular</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vipPackages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">{pkg.name}</TableCell>
                          <TableCell>${pkg.price}</TableCell>
                          <TableCell>{pkg.duration_days} days</TableCell>
                          <TableCell>
                            {pkg.is_popular && <Check className="w-4 h-4 text-vip" />}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              pkg.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                            )}>
                              {pkg.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(pkg)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDelete(pkg.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>

              {/* Special Packages */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-special" />
                  <h2 className="text-lg font-display font-bold text-special">Special Packages</h2>
                </div>
                <div className="glass-card rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Popular</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {specialPackages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">{pkg.name}</TableCell>
                          <TableCell>${pkg.price}</TableCell>
                          <TableCell>{pkg.duration_days} days</TableCell>
                          <TableCell>
                            {pkg.is_popular && <Check className="w-4 h-4 text-special" />}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              pkg.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                            )}>
                              {pkg.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(pkg)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDelete(pkg.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminPackagesPage;
