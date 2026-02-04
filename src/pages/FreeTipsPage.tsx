import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Percent,
  Timer,
  Dices,
  Trophy,
  Flame,
  Goal,
  ArrowUpDown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { TipCard, Tip } from "@/components/cards/TipCard";
import { Button } from "@/components/ui/button";

const categories = [
  { title: "2 Odds Daily", description: "Safe bets with 2.0 odds", icon: Target, count: 5 },
  { title: "5 Odds Daily", description: "Medium risk, good returns", icon: Percent, count: 3 },
  { title: "10 Odds Daily", description: "Higher odds, bigger wins", icon: Timer, count: 2 },
  { title: "Rollover Tips", description: "Accumulator predictions", icon: Dices, count: 4 },
  { title: "Straight Wins", description: "Home & away wins", icon: Trophy, count: 6 },
  { title: "Hot Tips", description: "Today's best picks", icon: Flame, count: 3 },
  { title: "BTTS", description: "Both teams to score", icon: Goal, count: 4 },
  { title: "Over/Under", description: "Goals predictions", icon: ArrowUpDown, count: 5 },
];

// Mock tips data
const mockTips: Tip[] = [
  {
    id: "1",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    prediction: "Over 2.5",
    odds: "1.85",
    matchTime: "15:00",
    league: "Premier League",
    status: "pending",
  },
  {
    id: "2",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    prediction: "BTTS",
    odds: "1.72",
    matchTime: "20:00",
    league: "La Liga",
    status: "pending",
  },
  {
    id: "3",
    homeTeam: "Bayern Munich",
    awayTeam: "Dortmund",
    prediction: "Home Win",
    odds: "1.65",
    matchTime: "17:30",
    league: "Bundesliga",
    status: "won",
  },
  {
    id: "4",
    homeTeam: "PSG",
    awayTeam: "Lyon",
    prediction: "Over 1.5",
    odds: "1.35",
    matchTime: "21:00",
    league: "Ligue 1",
    status: "pending",
  },
];

const FreeTipsPage = () => {
  const [view, setView] = useState<"categories" | "tips">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (title: string) => {
    setSelectedCategory(title);
    setView("tips");
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-display font-bold">Free Tips</h1>
          <p className="text-sm text-muted-foreground">
            Daily predictions across multiple categories
          </p>
        </motion.div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={view === "categories" ? "default" : "secondary"}
            size="sm"
            onClick={() => setView("categories")}
          >
            Categories
          </Button>
          <Button
            variant={view === "tips" ? "default" : "secondary"}
            size="sm"
            onClick={() => setView("tips")}
          >
            All Tips
          </Button>
        </div>

        {/* Categories View */}
        {view === "categories" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {categories.map((category, i) => (
              <div
                key={category.title}
                onClick={() => handleCategoryClick(category.title)}
                className="cursor-pointer"
              >
                <CategoryCard
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  href="#"
                  count={category.count}
                  index={i}
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Tips View */}
        {view === "tips" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {selectedCategory && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing: <span className="text-foreground font-medium">{selectedCategory}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Clear
                </Button>
              </div>
            )}
            
            <div className="space-y-3">
              {mockTips.map((tip, i) => (
                <TipCard key={tip.id} tip={tip} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default FreeTipsPage;
