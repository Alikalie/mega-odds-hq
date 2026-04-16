import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SuperAdminGuard } from "@/components/guards/SuperAdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface PredictionType {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

const AdminPredictionTypesPage = () => {
  const [types, setTypes] = useState<PredictionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PredictionType | null>(null);
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("prediction_types")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setTypes(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load prediction types");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editingType) {
        const { error } = await supabase
          .from("prediction_types")
          .update({ name: name.trim(), display_order: displayOrder })
          .eq("id", editingType.id);
        if (error) throw error;
        toast.success("Updated");
      } else {
        const { error } = await supabase
          .from("prediction_types")
          .insert({ name: name.trim(), display_order: displayOrder });
        if (error) throw error;
        toast.success("Added");
      }
      setDialogOpen(false);
      setEditingType(null);
      setName("");
      setDisplayOrder(0);
      fetchTypes();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("prediction_types")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
      setTypes((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: isActive } : t)));
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("prediction_types").delete().eq("id", id);
      if (error) throw error;
      setTypes((prev) => prev.filter((t) => t.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (t: PredictionType) => {
    setEditingType(t);
    setName(t.name);
    setDisplayOrder(t.display_order);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditingType(null);
    setName("");
    setDisplayOrder(types.length);
    setDialogOpen(true);
  };

  return (
    <SuperAdminGuard>
      <AdminLayout title="Prediction Types">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" />
                Prediction Types
              </h2>
              <p className="text-sm text-muted-foreground">Manage prediction options for tip forms</p>
            </div>
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Type
            </Button>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.display_order}</TableCell>
                      <TableCell>
                        <Switch checked={t.is_active} onCheckedChange={(v) => handleToggle(t.id, v)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {types.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No prediction types yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingType ? "Edit" : "Add"} Prediction Type</DialogTitle>
              <DialogDescription>
                {editingType ? "Update this prediction type" : "Add a new prediction option"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Over 2.5" />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} />
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingType ? "Update" : "Add"} Prediction Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </SuperAdminGuard>
  );
};

export default AdminPredictionTypesPage;
