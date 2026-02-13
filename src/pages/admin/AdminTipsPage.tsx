import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TipCard, Tip } from "@/components/cards/TipCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTipCategories } from "@/hooks/useTipCategories";

interface AdminTipsPageProps {
  tipType: "free" | "vip" | "special";
}

const AdminTipsPage = ({ tipType }: AdminTipsPageProps) => {
  const { data: categories } = useTipCategories();
  const [tips, setTips] = useState<Tip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTip, setNewTip] = useState({
    homeTeam: "",
    awayTeam: "",
    prediction: "",
    odds: "",
    matchTime: "",
    league: "",
    category: "",
  });

  const typeConfig = {
    free: { title: "Free Tips", color: "text-primary", table: "free_tips" as const },
    vip: { title: "VIP Tips", color: "text-vip", table: "vip_tips" as const },
    special: { title: "Special Tips", color: "text-special", table: "special_tips" as const },
  };

  const config = typeConfig[tipType];

  useEffect(() => {
    fetchTips();
  }, [tipType]);

  const fetchTips = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(config.table)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedTips: Tip[] = (data || []).map((t) => ({
        id: t.id,
        homeTeam: t.home_team,
        awayTeam: t.away_team,
        prediction: t.prediction,
        odds: t.odds,
        matchTime: t.match_time,
        league: t.league,
        status: t.status as Tip["status"],
      }));

      setTips(formattedTips);
    } catch (err) {
      console.error("Error fetching tips:", err);
      toast.error("Failed to load tips");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTips = tips.filter(
    (tip) =>
      tip.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTip = async () => {
    if (!newTip.homeTeam || !newTip.awayTeam || !newTip.prediction || !newTip.odds) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from(config.table)
        .insert({
          home_team: newTip.homeTeam,
          away_team: newTip.awayTeam,
          prediction: newTip.prediction,
          odds: newTip.odds,
          match_time: newTip.matchTime || "TBD",
          league: newTip.league || "Unknown",
          category: newTip.category || "general",
        })
        .select()
        .single();

      if (error) throw error;

      const formattedTip: Tip = {
        id: data.id,
        homeTeam: data.home_team,
        awayTeam: data.away_team,
        prediction: data.prediction,
        odds: data.odds,
        matchTime: data.match_time,
        league: data.league,
        status: data.status as Tip["status"],
      };

      setTips((prev) => [formattedTip, ...prev]);
      setIsAddDialogOpen(false);
      setNewTip({
        homeTeam: "",
        awayTeam: "",
        prediction: "",
        odds: "",
        matchTime: "",
        league: "",
        category: "",
      });
      toast.success("Tip added successfully");

      // Send push notification to relevant users based on tip type
      try {
        let profileQuery = supabase.from("profiles").select("id").eq("status", "approved");
        
        if (tipType === "vip") {
          profileQuery = profileQuery.in("subscription", ["vip", "special"]);
        } else if (tipType === "special") {
          profileQuery = profileQuery.eq("subscription", "special");
        }
        // For free tips, notify all approved users (no subscription filter)

        const { data: profiles } = await profileQuery;
        
        if (profiles && profiles.length > 0) {
          const emoji = tipType === "free" ? "⚽" : tipType === "vip" ? "👑" : "⭐";
          const notifications = profiles.map((p) => ({
            user_id: p.id,
            title: `${emoji} New ${config.title} Available!`,
            message: `${newTip.homeTeam} vs ${newTip.awayTeam} — ${newTip.prediction} @ ${newTip.odds}`,
          }));
          await supabase.from("notifications").insert(notifications);
        }
      } catch (notifErr) {
        console.error("Error sending notifications:", notifErr);
      }

    } catch (err) {
      console.error("Error adding tip:", err);
      toast.error("Failed to add tip");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTip = async (id: string) => {
    try {
      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTips((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tip deleted");
    } catch (err) {
      console.error("Error deleting tip:", err);
      toast.error("Failed to delete tip");
    }
  };

  const handleUpdateStatus = async (id: string, status: Tip["status"]) => {
    try {
      const { error } = await supabase
        .from(config.table)
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setTips((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
      toast.success("Status updated");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
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
            <h1 className={`text-lg font-display font-bold ${config.color}`}>
              {config.title}
            </h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={tipType === "free" ? "default" : tipType}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New {config.title.slice(0, -1)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Home Team</Label>
                    <Input
                      placeholder="Home team"
                      value={newTip.homeTeam}
                      onChange={(e) =>
                        setNewTip({ ...newTip, homeTeam: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Away Team</Label>
                    <Input
                      placeholder="Away team"
                      value={newTip.awayTeam}
                      onChange={(e) =>
                        setNewTip({ ...newTip, awayTeam: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prediction</Label>
                    <Input
                      placeholder="e.g., Over 2.5"
                      value={newTip.prediction}
                      onChange={(e) =>
                        setNewTip({ ...newTip, prediction: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Odds</Label>
                    <Input
                      placeholder="e.g., 1.85"
                      value={newTip.odds}
                      onChange={(e) =>
                        setNewTip({ ...newTip, odds: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Match Time</Label>
                    <Input
                      placeholder="e.g., 15:00"
                      value={newTip.matchTime}
                      onChange={(e) =>
                        setNewTip({ ...newTip, matchTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>League</Label>
                    <Input
                      placeholder="e.g., Premier League"
                      value={newTip.league}
                      onChange={(e) =>
                        setNewTip({ ...newTip, league: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newTip.category}
                    onValueChange={(value) =>
                      setNewTip({ ...newTip, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        ?.filter((c) => 
                          tipType === "free" ? !c.is_vip && !c.is_special :
                          tipType === "vip" ? c.is_vip :
                          c.is_special
                        )
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  variant={tipType === "free" ? "default" : tipType}
                  onClick={handleAddTip}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Tip
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tips..."
              className="pl-10 bg-secondary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTips.map((tip, i) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative"
                >
                  <TipCard tip={tip} />
                  <div className="absolute top-4 right-4 flex gap-1">
                    <Select
                      value={tip.status}
                      onValueChange={(value) =>
                        handleUpdateStatus(tip.id, value as Tip["status"])
                      }
                    >
                      <SelectTrigger className="h-8 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="void">Void</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTip(tip.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {filteredTips.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tips found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminTipsPage;
