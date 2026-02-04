import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Crown, Star, TrendingUp, Users, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/cards/StatCard";
import { AppLayout } from "@/components/layout/AppLayout";

const stats = [
  { title: "Win Rate", value: "78%", icon: Target, variant: "success" as const },
  { title: "Tips Today", value: "24", icon: TrendingUp, variant: "accent" as const },
  { title: "Active Users", value: "2.4K", icon: Users, variant: "warning" as const },
  { title: "Streak", value: "12", icon: Zap, variant: "default" as const },
];

const Index = () => {
  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live predictions available
          </div>
          
          <h1 className="text-3xl font-display font-bold leading-tight">
            Win Big with
            <span className="block text-gradient-primary">Expert Predictions</span>
          </h1>
          
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Get daily football tips from our team of experts. Join thousands of winning bettors.
          </p>
        </motion.section>

        {/* Quick Access Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Link to="/free-tips" className="block">
            <div className="glass-card rounded-2xl p-4 text-center hover:bg-secondary/50 transition-all group">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-semibold">Free Tips</span>
            </div>
          </Link>

          <Link to="/vip" className="block">
            <div className="glass-card rounded-2xl p-4 text-center hover:bg-secondary/50 transition-all group">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-vip/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6 text-vip" />
              </div>
              <span className="text-sm font-semibold text-vip">VIP</span>
            </div>
          </Link>

          <Link to="/special" className="block">
            <div className="glass-card rounded-2xl p-4 text-center hover:bg-secondary/50 transition-all group">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-special/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-special" />
              </div>
              <span className="text-sm font-semibold text-special">Special</span>
            </div>
          </Link>
        </motion.section>

        {/* Stats Grid */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            This Month
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                variant={stat.variant}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-vip to-amber-500 flex items-center justify-center shadow-glow-vip">
            <Crown className="w-8 h-8 text-vip-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Go Premium</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock VIP predictions and win more consistently
            </p>
          </div>
          <Button variant="vip" className="w-full" size="lg" asChild>
            <Link to="/vip">Upgrade to VIP</Link>
          </Button>
        </motion.section>

        {/* Get Started */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-3"
        >
          <p className="text-sm text-muted-foreground">
            New to Mega Odds?
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth">Create Free Account</Link>
          </Button>
        </motion.section>
      </div>
    </AppLayout>
  );
};

export default Index;
