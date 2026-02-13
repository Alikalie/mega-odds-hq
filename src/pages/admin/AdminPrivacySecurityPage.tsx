import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface PrivacySection {
  id: string;
  title: string;
  content: string;
  display_order: number;
  is_active: boolean;
}

const AdminPrivacySecurityPage = () => {
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrivacySection | null>(null);
  const [form, setForm] = useState({ title: "", content: "", display_order: 0, is_active: true });

  useEffect(() => { fetchSections(); }, []);

  const fetchSections = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("privacy_security")
      .select("*")
      .order("display_order");
    setSections((data as PrivacySection[]) || []);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    try {
      if (editing) {
        const { error } = await supabase.from("privacy_security").update(form).eq("id", editing.id);
        if (error) throw error;
        toast.success("Section updated");
      } else {
        const { error } = await supabase.from("privacy_security").insert(form);
        if (error) throw error;
        toast.success("Section added");
      }
      setDialogOpen(false);
      resetForm();
      fetchSections();
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("privacy_security").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Section deleted"); fetchSections(); }
  };

  const resetForm = () => { setEditing(null); setForm({ title: "", content: "", display_order: 0, is_active: true }); };

  const openEdit = (s: PrivacySection) => {
    setEditing(s);
    setForm({ title: s.title, content: s.content, display_order: s.display_order, is_active: s.is_active });
    setDialogOpen(true);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Privacy & Security">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy & Security Sections
              </h2>
              <p className="text-sm text-muted-foreground">Manage content shown to users</p>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">{s.content}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${s.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Data Protection Policy" />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Enter section content..." rows={6} />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Section</Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminPrivacySecurityPage;
