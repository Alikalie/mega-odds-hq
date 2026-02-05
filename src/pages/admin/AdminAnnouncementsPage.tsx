 import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnnouncementCard, Announcement } from "@/components/cards/AnnouncementCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
 import { AdminGuard } from "@/components/guards/AdminGuard";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { Loader2 } from "lucide-react";

const mockAnnouncements: Announcement[] = [
  { id: "1", title: "Weekend Special Offer", description: "Get 50% off on VIP subscription this weekend only! Don't miss out on this amazing deal.", createdAt: "2 hours ago" },
  { id: "2", title: "New Features Added", description: "Check out our new tip categories and improved accuracy tracking. We've made it easier than ever to win!", createdAt: "1 day ago" },
  { id: "3", title: "Maintenance Notice", description: "The platform will undergo scheduled maintenance on Sunday from 2-4 AM GMT.", createdAt: "3 days ago" },
];

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
  });

  const handleAdd = () => {
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      description: newAnnouncement.description,
      createdAt: "Just now",
    };
    setAnnouncements((prev) => [announcement, ...prev]);
    setIsAddDialogOpen(false);
    setNewAnnouncement({ title: "", description: "" });
  };

  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
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
          <h1 className="text-lg font-display font-bold">Announcements</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Announcement title"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Write your announcement..."
                  rows={4}
                  value={newAnnouncement.description}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, description: e.target.value })
                  }
                />
              </div>
              <Button className="w-full" onClick={handleAdd}>
                Publish Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((announcement, i) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {announcement.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    {announcement.createdAt}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {announcements.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No announcements yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
     </AdminGuard>
  );
};

export default AdminAnnouncementsPage;
