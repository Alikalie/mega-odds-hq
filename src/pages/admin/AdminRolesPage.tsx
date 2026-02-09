import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  role: "user" | "admin";
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

const AdminRolesPage = () => {
  const { user: currentUser } = useAuth();
  const [adminRoles, setAdminRoles] = useState<(UserRole & { profile?: UserProfile })[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch admin roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      // Combine roles with profiles
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

    // Check if already admin
    const existingAdmin = adminRoles.find((r) => r.user_id === selectedUserId);
    if (existingAdmin) {
      toast.error("This user is already an admin");
      return;
    }

    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: selectedUserId,
        role: "admin",
      });

      if (error) throw error;

      toast.success("Admin added successfully");
      setDialogOpen(false);
      setSelectedUserId("");
      fetchData();
    } catch (err) {
      console.error("Error adding admin:", err);
      toast.error("Failed to add admin");
    }
  };

  const handleRemoveAdmin = async (roleId: string, userId: string) => {
    // Prevent removing yourself
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

  return (
    <AdminGuard>
      <AdminLayout title="Admin Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Admin Users
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage administrator access
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>

          {/* Admin Table */}
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
                    <TableHead>Added On</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
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
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(adminRole.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {adminRole.user_id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAdmin(adminRole.id, adminRole.user_id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {adminRoles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No admins found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Add Admin Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Select a user to grant administrator privileges
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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

              <Button onClick={handleAddAdmin} className="w-full">
                <UserCheck className="w-4 h-4 mr-2" />
                Make Admin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminRolesPage;
