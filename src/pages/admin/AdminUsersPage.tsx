 import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Crown,
  Star,
  ArrowLeft,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { Loader2 } from "lucide-react";
 import { AdminGuard } from "@/components/guards/AdminGuard";
import { UserBadge } from "@/components/ui/user-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  fullName: string;
  status: "pending" | "approved" | "blocked";
  subscription: "free" | "vip" | "special";
  role: "user" | "admin";
  createdAt: string;
}

const AdminUsersPage = () => {
   const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     fetchUsers();
   }, []);
 
   const fetchUsers = async () => {
     setIsLoading(true);
     try {
       // Fetch profiles
       const { data: profiles, error: profilesError } = await supabase
         .from("profiles")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (profilesError) throw profilesError;
 
       // Fetch roles
       const { data: roles, error: rolesError } = await supabase
         .from("user_roles")
         .select("user_id, role");
 
       if (rolesError) throw rolesError;
 
       const rolesMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);
 
       const formattedUsers: User[] = (profiles || []).map((p) => ({
         id: p.id,
         email: p.email,
         fullName: p.full_name || "",
         status: p.status as User["status"],
         subscription: p.subscription as User["subscription"],
         role: (rolesMap.get(p.id) as User["role"]) || "user",
         createdAt: new Date(p.created_at).toLocaleDateString(),
       }));
 
       setUsers(formattedUsers);
     } catch (err) {
       console.error("Error fetching users:", err);
       toast.error("Failed to load users");
     } finally {
       setIsLoading(false);
     }
   };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

   const handleApprove = async (id: string) => {
     const { error } = await supabase
       .from("profiles")
       .update({ status: "approved" })
       .eq("id", id);
 
     if (error) {
       toast.error("Failed to approve user");
       return;
     }
 
     toast.success("User approved");
     setUsers((prev) =>
       prev.map((u) => (u.id === id ? { ...u, status: "approved" as const } : u))
     );
  };

   const handleBlock = async (id: string) => {
     const { error } = await supabase
       .from("profiles")
       .update({ status: "blocked" })
       .eq("id", id);
 
     if (error) {
       toast.error("Failed to block user");
       return;
     }
 
     toast.success("User blocked");
     setUsers((prev) =>
       prev.map((u) => (u.id === id ? { ...u, status: "blocked" as const } : u))
     );
  };

   const handleUpgrade = async (id: string, tier: "free" | "vip" | "special") => {
     const { error } = await supabase
       .from("profiles")
       .update({ subscription: tier })
       .eq("id", id);
 
     if (error) {
       toast.error("Failed to update subscription");
       return;
     }
 
     toast.success(`User subscription updated to ${tier.toUpperCase()}`);
     setUsers((prev) =>
       prev.map((u) => (u.id === id ? { ...u, subscription: tier } : u))
     );
  };

  return (
     <AdminGuard>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-display font-bold">User Management</h1>
        </div>
      </header>

      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 bg-secondary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

         {isLoading ? (
           <div className="flex items-center justify-center py-20">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
         ) : (
           <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-sm font-semibold">User</th>
                  <th className="text-left p-4 text-sm font-semibold">Status</th>
                  <th className="text-left p-4 text-sm font-semibold">Subscription</th>
                  <th className="text-left p-4 text-sm font-semibold">Role</th>
                  <th className="text-left p-4 text-sm font-semibold">Joined</th>
                  <th className="text-right p-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-secondary/20"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <UserBadge variant={user.status} />
                    </td>
                    <td className="p-4">
                      <UserBadge variant={user.subscription} />
                    </td>
                    <td className="p-4">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-accent text-sm font-medium">
                          <Shield className="w-4 h-4" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.createdAt}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {user.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                              <UserCheck className="w-4 h-4 mr-2 text-success" />
                              Approve User
                            </DropdownMenuItem>
                          )}
                          {user.status !== "blocked" && (
                            <DropdownMenuItem onClick={() => handleBlock(user.id)}>
                              <UserX className="w-4 h-4 mr-2 text-destructive" />
                              Block User
                            </DropdownMenuItem>
                          )}
                          {user.status === "blocked" && (
                            <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                              <Check className="w-4 h-4 mr-2 text-success" />
                              Unblock User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpgrade(user.id, "free")}>
                            Set to Free
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpgrade(user.id, "vip")}>
                            <Crown className="w-4 h-4 mr-2 text-vip" />
                            Upgrade to VIP
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpgrade(user.id, "special")}>
                            <Star className="w-4 h-4 mr-2 text-special" />
                            Upgrade to Special
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
         )}
      </div>
    </div>
     </AdminGuard>
  );
};

export default AdminUsersPage;
