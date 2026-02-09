import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, Send, Trash2, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Loader2 } from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UserOption {
  id: string;
  email: string;
  full_name: string | null;
}

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendType, setSendType] = useState<"single" | "all">("single");
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [{ data: notifs }, { data: usersData }] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("profiles").select("id, email, full_name"),
      ]);
      setNotifications(notifs || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (sendType === "single" && !formData.userId) {
      toast.error("Please select a user");
      return;
    }

    try {
      if (sendType === "all") {
        // Send to all users
        const notificationsToInsert = users.map((user) => ({
          user_id: user.id,
          title: formData.title,
          message: formData.message,
        }));

        const { error } = await supabase
          .from("notifications")
          .insert(notificationsToInsert);

        if (error) throw error;
        toast.success(`Notification sent to ${users.length} users`);
      } else {
        // Send to single user
        const { error } = await supabase.from("notifications").insert({
          user_id: formData.userId,
          title: formData.title,
          message: formData.message,
        });

        if (error) throw error;
        toast.success("Notification sent");
      }

      setDialogOpen(false);
      setFormData({ userId: "", title: "", message: "" });
      fetchData();
    } catch (err) {
      console.error("Error sending notification:", err);
      toast.error("Failed to send notification");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Notification deleted");
      fetchData();
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("Failed to delete notification");
    }
  };

  const getUserEmail = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.email || "Unknown";
  };

  return (
    <AdminGuard>
      <AdminLayout title="Notifications">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Send Notifications
              </h2>
              <p className="text-sm text-muted-foreground">
                Send messages to users
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Notification
            </Button>
          </div>

          {/* Notifications Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">
                        {getUserEmail(notification.user_id)}
                      </TableCell>
                      <TableCell>{notification.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            notification.is_read
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {notification.is_read ? "Read" : "Unread"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(notification.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {notifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No notifications sent yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Send Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Send To</Label>
                <div className="flex gap-2">
                  <Button
                    variant={sendType === "single" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSendType("single")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Single User
                  </Button>
                  <Button
                    variant={sendType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSendType("all")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    All Users
                  </Button>
                </div>
              </div>

              {sendType === "single" && (
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select
                    value={formData.userId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, userId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Notification title"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Notification message"
                  rows={4}
                />
              </div>

              <Button onClick={handleSend} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminNotificationsPage;
