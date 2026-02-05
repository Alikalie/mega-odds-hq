 import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
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
 import { Loader2 } from "lucide-react";

interface AdminTipsPageProps {
  tipType: "free" | "vip" | "special";
}

const mockTips: Tip[] = [
  { id: "1", homeTeam: "Manchester United", awayTeam: "Liverpool", prediction: "Over 2.5", odds: "1.85", matchTime: "15:00", league: "Premier League", status: "pending" },
  { id: "2", homeTeam: "Barcelona", awayTeam: "Real Madrid", prediction: "BTTS", odds: "1.72", matchTime: "20:00", league: "La Liga", status: "pending" },
  { id: "3", homeTeam: "Bayern Munich", awayTeam: "Dortmund", prediction: "Home Win", odds: "1.65", matchTime: "17:30", league: "Bundesliga", status: "won" },
];

const AdminTipsPage = ({ tipType }: AdminTipsPageProps) => {
  const [tips, setTips] = useState(mockTips);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
    free: { title: "Free Tips", color: "text-primary" },
    vip: { title: "VIP Tips", color: "text-vip" },
    special: { title: "Special Tips", color: "text-special" },
  };

  const config = typeConfig[tipType];

  const filteredTips = tips.filter(
    (tip) =>
      tip.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTip = () => {
    const tip: Tip = {
      id: Date.now().toString(),
      homeTeam: newTip.homeTeam,
      awayTeam: newTip.awayTeam,
      prediction: newTip.prediction,
      odds: newTip.odds,
      matchTime: newTip.matchTime,
      league: newTip.league,
      status: "pending",
    };
    setTips((prev) => [tip, ...prev]);
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
  };

  const handleDeleteTip = (id: string) => {
    setTips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateStatus = (id: string, status: Tip["status"]) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
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
                    <SelectItem value="2-odds">2 Odds Daily</SelectItem>
                    <SelectItem value="5-odds">5 Odds Daily</SelectItem>
                    <SelectItem value="10-odds">10 Odds Daily</SelectItem>
                    <SelectItem value="btts">BTTS</SelectItem>
                    <SelectItem value="over-under">Over/Under</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                variant={tipType === "free" ? "default" : tipType}
                onClick={handleAddTip}
              >
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

        {/* Tips List */}
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
      </div>
    </div>
     </AdminGuard>
  );
};

export default AdminTipsPage;
