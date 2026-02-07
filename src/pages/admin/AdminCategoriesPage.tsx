import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Crown,
  Star,
  Bell,
  Info,
  LogOut,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  Grid3X3,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AdminGuard } from "@/components/guards/AdminGuard";
import {
  useTipCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  TipCategory,
} from "@/hooks/useTipCategories";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Grid3X3, label: "Categories", href: "/admin/categories" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Trophy, label: "Free Tips", href: "/admin/free-tips" },
  { icon: Crown, label: "VIP Tips", href: "/admin/vip-tips" },
  { icon: Star, label: "Special Tips", href: "/admin/special-tips" },
  { icon: Bell, label: "Announcements", href: "/admin/announcements" },
  { icon: Info, label: "App Info", href: "/admin/app-info" },
];

const iconOptions = [
  "ShieldCheck",
  "Ticket",
  "Goal",
  "TrendingUp",
  "Target",
  "Flame",
  "Circle",
  "Activity",
  "Gift",
  "Layers",
  "History",
  "Swords",
  "Trophy",
  "Crown",
];

const AdminCategoriesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TipCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "Trophy",
    description: "",
    is_vip: false,
    is_special: false,
    is_active: true,
    display_order: 0,
    tip_count: 0,
  });

  const { data: categories, isLoading } = useTipCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      icon: "Trophy",
      description: "",
      is_vip: false,
      is_special: false,
      is_active: true,
      display_order: categories ? categories.length : 0,
      tip_count: 0,
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (category: TipCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description || "",
      is_vip: category.is_vip,
      is_special: category.is_special,
      is_active: category.is_active,
      display_order: category.display_order,
      tip_count: category.tip_count,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: TipCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = () => {
    createCategory.mutate(formData, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        resetForm();
      },
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedCategory) return;
    updateCategory.mutate(
      { id: selectedCategory.id, ...formData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedCategory(null);
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!selectedCategory) return;
    deleteCategory.mutate(selectedCategory.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
      },
    });
  };

  const handleMoveUp = (category: TipCategory) => {
    if (category.display_order <= 1) return;
    updateCategory.mutate({ id: category.id, display_order: category.display_order - 1 });
  };

  const handleMoveDown = (category: TipCategory) => {
    updateCategory.mutate({ id: category.id, display_order: category.display_order + 1 });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <Link to="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">M</span>
                </div>
                <span className="font-display font-bold">
                  Admin <span className="text-primary">Panel</span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    item.href === "/admin/categories"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                asChild
              >
                <Link to="/">
                  <LogOut className="w-5 h-5 mr-3" />
                  Exit Admin
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-display font-bold">Tip Categories</h1>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </header>

          <div className="p-4 lg:p-6">
            {isLoading ? (
              <div className="grid gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {categories?.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "glass-card rounded-xl p-4 flex items-center justify-between",
                      !category.is_active && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveUp(category)}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveDown(category)}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          category.is_vip
                            ? "bg-vip/10"
                            : category.is_special
                            ? "bg-special/10"
                            : "bg-primary/10"
                        )}
                      >
                        <Grid3X3
                          className={cn(
                            "w-6 h-6",
                            category.is_vip
                              ? "text-vip"
                              : category.is_special
                              ? "text-special"
                              : "text-primary"
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{category.name}</span>
                          {category.is_vip && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-vip/20 text-vip">
                              VIP
                            </span>
                          )}
                          {category.is_special && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-special/20 text-special">
                              SPECIAL
                            </span>
                          )}
                          {!category.is_active && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {category.tip_count} tips • Order: {category.display_order}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Category name"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-slug"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_vip">VIP Category</Label>
                <Switch
                  id="is_vip"
                  checked={formData.is_vip}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_vip: checked, is_special: checked ? false : formData.is_special })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_special">Special Category</Label>
                <Switch
                  id="is_special"
                  checked={formData.is_special}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_special: checked, is_vip: checked ? false : formData.is_vip })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAdd} disabled={createCategory.isPending}>
                {createCategory.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-slug"
                />
              </div>
              <div>
                <Label htmlFor="edit-icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div>
                <Label htmlFor="edit-tip-count">Tip Count</Label>
                <Input
                  id="edit-tip-count"
                  type="number"
                  value={formData.tip_count}
                  onChange={(e) => setFormData({ ...formData, tip_count: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is_vip">VIP Category</Label>
                <Switch
                  id="edit-is_vip"
                  checked={formData.is_vip}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_vip: checked, is_special: checked ? false : formData.is_special })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is_special">Special Category</Label>
                <Switch
                  id="edit-is_special"
                  checked={formData.is_special}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_special: checked, is_vip: checked ? false : formData.is_vip })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is_active">Active</Label>
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit} disabled={updateCategory.isPending}>
                {updateCategory.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminGuard>
  );
};

export default AdminCategoriesPage;
