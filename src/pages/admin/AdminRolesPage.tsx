import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, UserCheck, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserRole {
  id: string;
  user_id: string;
  role: "user" | "admin" | "super_admin";
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

const AdminRolesPage = () => {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [adminRoles, setAdminRoles] = useState<(UserRole & { profile?: UserProfile })[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "super_admin">("admin");
  const [editingRole, setEditingRole] = useState<(UserRole & { profile?: UserProfile }) | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .in("role", ["admin", "super_admin"]);

      if (rolesError) throw rolesError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      const rolesWithProfiles = (rolesData || []).map((role) => ({
        ...role,
        profile: profilesData?.find((p) => p.id === role.user_id),
      }));

      setAdminRoles(rolesWithProfiles);
      setUsers(profilesData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    const existingAdmin = adminRoles.find((r) => r.user_id === selectedUserId);
    if (existingAdmin) {
      toast.error("This user already has an admin role");
      return;
    }

    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: selectedUserId,
        role: selectedRole,
      });

      if (error) throw error;

      toast.success(`${selectedRole === "super_admin" ? "Super Admin" : "Admin"} added successfully`);
      setDialogOpen(false);
      setSelectedUserId("");
      setSelectedRole("admin");
      fetchData();
    } catch (err) {
      console.error("Error adding admin:", err);
      toast.error("Failed to add admin");
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: selectedRole })
        .eq("id", editingRole.id);

      if (error) throw error;

      toast.success("Role updated successfully");
      setEditingRole(null);
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error("Failed to update role");
    }
  };

  const handleRemoveAdmin = async (roleId: string, userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot remove yourself as admin");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Admin removed successfully");
      fetchData();
    } catch (err) {
      console.error("Error removing admin:", err);
      toast.error("Failed to remove admin");
    }
  };

  const nonAdminUsers = users.filter(
    (u) => !adminRoles.find((r) => r.user_id === u.id)
  );

  const openAddDialog = () => {
    setEditingRole(null);
    setSelectedUserId("");
    setSelectedRole("admin");
    setDialogOpen(true);
  };

  const openEditDialog = (role: UserRole & { profile?: UserProfile }) => {
    setEditingRole(role);
    setSelectedRole(role.role as "admin" | "super_admin");
    setDialogOpen(true);
  };

  const roleLabel = (role: string) => {
    if (role === "super_admin") return "Super Admin";
    if (role === "admin") return "Admin";
    return "User";
  };

  const roleBadgeClass = (role: string) => {
    if (role === "super_admin") return "bg-destructive/10 text-destructive";
    return "bg-primary/10 text-primary";
  };

  return (
    <AdminGuard>
      <AdminLayout title="Admin Management">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Admin Users
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage administrator access and roles
              </p>
            </div>
            {isSuperAdmin && (
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            )}
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
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added On</TableHead>
                    {isSuperAdmin && <TableHead className="w-24">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminRoles.map((adminRole) => (
                    <TableRow key={adminRole.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-primary" />
                          </div>
                          {adminRole.profile?.full_name || "Unknown"}
                          {adminRole.user_id === currentUser?.id && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{adminRole.profile?.email || "Unknown"}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadgeClass(adminRole.role)}`}>
                          {roleLabel(adminRole.role)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(adminRole.created_at), "MMM d, yyyy")}
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          {adminRole.user_id !== currentUser?.id && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(adminRole)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAdmin(adminRole.id, adminRole.user_id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {adminRoles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                        No admins found
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
              <DialogTitle>{editingRole ? "Edit Admin Role" : "Add New Admin"}</DialogTitle>
              <DialogDescription>
                {editingRole
                  ? `Change role for ${editingRole.profile?.full_name || editingRole.profile?.email}`
                  : "Select a user and assign an admin role"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!editingRole && (
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {nonAdminUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex flex-col">
                            <span>{user.full_name || user.email}</span>
                            {user.full_name && (
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as "admin" | "super_admin")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin — manage tips, users, announcements</SelectItem>
                    <SelectItem value="super_admin">Super Admin — full system access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={editingRole ? handleUpdateRole : handleAddAdmin}
                className="w-full"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {editingRole ? "Update Role" : "Add Admin"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminRolesPage;
