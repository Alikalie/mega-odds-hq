import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Search,
  Clock,
  Loader2,
  Check,
  ChevronsUpDown,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTipCategories } from "@/hooks/useTipCategories";
import { useFixtures } from "@/hooks/useFixtures";
import { LEAGUES, getFlagEmoji } from "@/lib/leagues";
import { cn } from "@/lib/utils";
import { usePredictionTypes } from "@/hooks/usePredictionTypes";

interface AdminTipsPageProps {
  tipType: "free" | "vip" | "special";
}

interface TipWithCategory extends Tip {
  category: string;
}

const AdminTipsPage = ({ tipType }: AdminTipsPageProps) => {
  const { data: categories } = useTipCategories();
  const { fixtures, isLoading: isLoadingFixtures, fetchFixtures } = useFixtures();
  const [tips, setTips] = useState<TipWithCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [homeTeamOpen, setHomeTeamOpen] = useState(false);
  const [awayTeamOpen, setAwayTeamOpen] = useState(false);
  const [fixtureDate, setFixtureDate] = useState<Date>(new Date());
  const [newTip, setNewTip] = useState({
    homeTeam: "",
    awayTeam: "",
    prediction: "",
    odds: "",
    matchTime: "",
    league: "",
    categories: [] as string[],
  });

  const typeConfig = {
    free: { title: "Free Tips", color: "text-primary", table: "free_tips" as const },
    vip: { title: "VIP Tips", color: "text-vip", table: "vip_tips" as const },
    special: { title: "Special Tips", color: "text-special", table: "special_tips" as const },
  };

  const config = typeConfig[tipType];

  const filteredCategories = categories?.filter((c) =>
    tipType === "free" ? !c.is_vip && !c.is_special :
    tipType === "vip" ? c.is_vip :
    c.is_special
  ) || [];

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

      const formattedTips: TipWithCategory[] = (data || []).map((t) => ({
        id: t.id,
        homeTeam: t.home_team,
        awayTeam: t.away_team,
        prediction: t.prediction,
        odds: t.odds,
        matchTime: t.match_time,
        league: t.league,
        status: t.status as Tip["status"],
        category: t.category,
      }));

      setTips(formattedTips);
    } catch (err) {
      console.error("Error fetching tips:", err);
      toast.error("Failed to load tips");
    } finally {
      setIsLoading(false);
    }
  };

  const displayedTips = tips.filter((tip) => {
    const matchesSearch =
      tip.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.league.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || tip.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLeagueSelect = (selectedValue: string) => {
    // cmdk lowercases onSelect value, so find original name from LEAGUES
    const league = LEAGUES.find((l) => l.name.toLowerCase() === selectedValue.toLowerCase());
    const leagueName = league?.name || selectedValue;
    setNewTip({ ...newTip, league: leagueName, homeTeam: "", awayTeam: "", matchTime: "" });
    const dateStr = format(fixtureDate, "yyyy-MM-dd");
    fetchFixtures(leagueName, dateStr);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    setFixtureDate(date);
    if (newTip.league) {
      const dateStr = format(date, "yyyy-MM-dd");
      setNewTip({ ...newTip, homeTeam: "", awayTeam: "", matchTime: "" });
      fetchFixtures(newTip.league, dateStr);
    }
  };

  const handleAddTip = async () => {
    if (!newTip.league) {
      toast.error("Please select a league first");
      return;
    }
    if (!newTip.homeTeam || !newTip.awayTeam || !newTip.prediction) {
      toast.error("Please fill in home team, away team, and prediction");
      return;
    }
    if (newTip.categories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setIsSubmitting(true);
    try {
      const insertRows = newTip.categories.map((cat) => ({
        home_team: newTip.homeTeam,
        away_team: newTip.awayTeam,
        prediction: newTip.prediction,
        odds: newTip.odds,
        match_time: newTip.matchTime || "TBD",
        league: newTip.league || "Unknown",
        category: cat,
      }));

      const { data, error } = await supabase
        .from(config.table)
        .insert(insertRows)
        .select();

      if (error) throw error;

      const formattedTips: TipWithCategory[] = (data || []).map((d) => ({
        id: d.id,
        homeTeam: d.home_team,
        awayTeam: d.away_team,
        prediction: d.prediction,
        odds: d.odds,
        matchTime: d.match_time,
        league: d.league,
        status: d.status as Tip["status"],
        category: d.category,
      }));

      setTips((prev) => [...formattedTips, ...prev]);
      setIsAddDialogOpen(false);
      setNewTip({
        homeTeam: "",
        awayTeam: "",
        prediction: "",
        odds: "",
        matchTime: "",
        league: "",
        categories: [],
      });
      toast.success(`Tip added to ${newTip.categories.length} category(ies)`);

      // Send push notification
      try {
        let profileQuery = supabase.from("profiles").select("id").eq("status", "approved");
        if (tipType === "vip") {
          profileQuery = profileQuery.in("subscription", ["vip", "special"]);
        } else if (tipType === "special") {
          profileQuery = profileQuery.eq("subscription", "special");
        }
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
      const { error } = await supabase.from(config.table).delete().eq("id", id);
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
      const { error } = await supabase.from(config.table).update({ status }).eq("id", id);
      if (error) throw error;
      setTips((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      toast.success("Status updated");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title={config.title}>
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tips..."
                className="pl-10 bg-secondary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant={tipType === "free" ? "default" : tipType}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tip
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New {config.title.slice(0, -1)}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label>Match Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fixtureDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fixtureDate ? format(fixtureDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fixtureDate}
                          onSelect={handleDateChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* League Selection (Required First) */}
                  <div className="space-y-2">
                     <Label>League <span className="text-destructive">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                          {newTip.league || "Select or type league..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[320px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search or type league name..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const input = (e.target as HTMLInputElement).value.trim();
                                if (input && !LEAGUES.find((l) => l.name.toLowerCase() === input.toLowerCase())) {
                                  setNewTip({ ...newTip, league: input, homeTeam: "", awayTeam: "", matchTime: "" });
                                }
                              }
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <p className="text-sm text-muted-foreground py-2">No league found. Press Enter to use typed name.</p>
                            </CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                              {LEAGUES.map((league) => (
                                <CommandItem
                                  key={league.name}
                                  value={league.name}
                                  onSelect={handleLeagueSelect}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", newTip.league === league.name ? "opacity-100" : "opacity-0")} />
                                  <span className="mr-1.5">{getFlagEmoji(league.countryCode)}</span>
                                  {league.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {isLoadingFixtures && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Fetching fixtures for {format(fixtureDate, "MMM d")}...
                      </p>
                    )}
                    {newTip.league && !isLoadingFixtures && fixtures.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        ✅ Loaded {fixtures.length} fixture(s) for {newTip.league}
                      </p>
                    )}
                    {newTip.league && !isLoadingFixtures && fixtures.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        ⚠️ No fixtures loaded for {newTip.league}. Type teams manually below.
                      </p>
                    )}
                  </div>

                  {/* Home & Away Teams */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Home Team <span className="text-destructive">*</span></Label>
                      {fixtures.length > 0 ? (
                        <Popover open={homeTeamOpen} onOpenChange={setHomeTeamOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-left" disabled={!newTip.league}>
                              <span className="truncate">{newTip.homeTeam || "Select home team..."}</span>
                              <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[220px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search teams..." />
                              <CommandList>
                                <CommandEmpty>No team found.</CommandEmpty>
                                <CommandGroup className="max-h-[200px] overflow-y-auto">
                                  {fixtures.map((f) => (
                                    <CommandItem
                                      key={`home-${f.id}`}
                                      value={`${f.homeTeam} ${f.awayTeam} ${f.matchTime}`}
                                      onSelect={() => {
                                        setNewTip((current) => ({
                                          ...current,
                                          homeTeam: f.homeTeam,
                                          awayTeam: f.awayTeam,
                                          matchTime: f.matchTime || current.matchTime,
                                        }));
                                        setHomeTeamOpen(false);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", newTip.homeTeam === f.homeTeam ? "opacity-100" : "opacity-0")} />
                                      {f.homeTeam}
                                      <span className="ml-auto text-[10px] text-muted-foreground">{f.matchTime}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input placeholder="Home team" value={newTip.homeTeam} onChange={(e) => setNewTip({ ...newTip, homeTeam: e.target.value })} disabled={!newTip.league} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Away Team <span className="text-destructive">*</span></Label>
                      {fixtures.length > 0 ? (
                        <Popover open={awayTeamOpen} onOpenChange={setAwayTeamOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-left" disabled={!newTip.league}>
                              <span className="truncate">{newTip.awayTeam || "Select away team..."}</span>
                              <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[220px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search teams..." />
                              <CommandList>
                                <CommandEmpty>No team found.</CommandEmpty>
                                <CommandGroup className="max-h-[200px] overflow-y-auto">
                                  {fixtures.map((f) => (
                                    <CommandItem
                                      key={`away-${f.id}`}
                                      value={`${f.awayTeam} ${f.homeTeam} ${f.matchTime}`}
                                      onSelect={() => {
                                        setNewTip((current) => ({
                                          ...current,
                                          awayTeam: f.awayTeam,
                                          homeTeam: f.homeTeam,
                                          matchTime: f.matchTime || current.matchTime,
                                        }));
                                        setAwayTeamOpen(false);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", newTip.awayTeam === f.awayTeam ? "opacity-100" : "opacity-0")} />
                                      {f.awayTeam}
                                      <span className="ml-auto text-[10px] text-muted-foreground">{f.matchTime}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input placeholder="Away team" value={newTip.awayTeam} onChange={(e) => setNewTip({ ...newTip, awayTeam: e.target.value })} disabled={!newTip.league} />
                      )}
                    </div>
                  </div>

                  {/* Prediction, Odds, Match Time */}
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prediction <span className="text-destructive">*</span></Label>
                      <PredictionInput value={newTip.prediction} onChange={(v) => setNewTip({ ...newTip, prediction: v })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Odds</Label>
                      <Input placeholder="e.g., 1.85 (optional)" value={newTip.odds} onChange={(e) => setNewTip({ ...newTip, odds: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Match Time {newTip.matchTime && <span className="text-xs text-muted-foreground ml-1">(auto-filled)</span>}</Label>
                    <Input
                      type="time"
                      value={newTip.matchTime}
                      onChange={(e) => setNewTip({ ...newTip, matchTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Categories (select up to 4)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredCategories.map((cat) => {
                        const isChecked = newTip.categories.includes(cat.slug);
                        return (
                          <label key={cat.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked && newTip.categories.length >= 4) {
                                  toast.error("Maximum 4 categories allowed");
                                  return;
                                }
                                setNewTip({
                                  ...newTip,
                                  categories: checked
                                    ? [...newTip.categories, cat.slug]
                                    : newTip.categories.filter((s) => s !== cat.slug),
                                });
                              }}
                            />
                            <span className="text-sm">{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <Button className="w-full" variant={tipType === "free" ? "default" : tipType} onClick={handleAddTip} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Tip
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-1 justify-start">
              <TabsTrigger value="all">All ({tips.length})</TabsTrigger>
              {filteredCategories.map((cat) => {
                const count = tips.filter((t) => t.category === cat.slug).length;
                return (
                  <TabsTrigger key={cat.slug} value={cat.slug}>
                    {cat.name} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Tips List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {displayedTips.map((tip, i) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative"
                >
                  <TipCard tip={tip} />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {filteredCategories.find((c) => c.slug === tip.category)?.name || tip.category}
                    </span>
                    <Select value={tip.status} onValueChange={(value) => handleUpdateStatus(tip.id, value as Tip["status"])}>
                      <SelectTrigger className="h-7 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="void">Void</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteTip(tip.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {displayedTips.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tips found in this category</p>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminTipsPage;
