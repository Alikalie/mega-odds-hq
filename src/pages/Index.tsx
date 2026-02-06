import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Crown, Star, TrendingUp, Users, Target, Zap, ArrowRight, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/cards/StatCard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  { title: "Win Rate", value: "78%", icon: Target, variant: "success" as const },
  { title: "Tips Today", value: "24", icon: TrendingUp, variant: "accent" as const },
  { title: "Active Users", value: "2.4K", icon: Users, variant: "warning" as const },
  { title: "Streak", value: "12", icon: Zap, variant: "default" as const },
];

const Index = () => {
  const { user, isAdmin } = useAuth();

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

        {/* Quick Access Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Link to="/free-tips" className="block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card rounded-2xl p-4 text-center hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-semibold">Free Tips</span>
              <p className="text-xs text-muted-foreground mt-1">Daily picks</p>
            </motion.div>
          </Link>

          <Link to="/vip" className="block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card rounded-2xl p-4 text-center hover:border-vip/30 transition-all group border border-vip/20"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-vip/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6 text-vip" />
              </div>
              <span className="text-sm font-semibold text-vip">VIP</span>
              <p className="text-xs text-muted-foreground mt-1">Premium</p>
            </motion.div>
          </Link>

          <Link to="/special" className="block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card rounded-2xl p-4 text-center hover:border-special/30 transition-all group border border-special/20"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-special/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-special" />
              </div>
              <span className="text-sm font-semibold text-special">Special</span>
              <p className="text-xs text-muted-foreground mt-1">Exclusive</p>
            </motion.div>
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

        {/* VIP CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 text-center space-y-4 border border-vip/20"
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
          <div className="flex gap-3">
            <Button variant="vip" className="flex-1" size="lg" asChild>
              <Link to="/vip">
                <Sparkles className="w-4 h-4 mr-2" />
                View VIP
              </Link>
            </Button>
            <Button variant="special" className="flex-1" size="lg" asChild>
              <Link to="/special">
                <Star className="w-4 h-4 mr-2" />
                Special
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, title: "Verified Tips", desc: "Expert analyzed" },
              { icon: Target, title: "80%+ Win Rate", desc: "Proven success" },
              { icon: Users, title: "2K+ Members", desc: "Growing community" },
              { icon: Zap, title: "Instant Access", desc: "Real-time tips" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="glass-card rounded-xl p-4 space-y-2"
              >
                <feature.icon className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Get Started / User Actions */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {!user ? (
            <div className="glass-card rounded-2xl p-6 text-center space-y-4">
              <h3 className="font-display font-bold text-lg">Ready to Win?</h3>
              <p className="text-sm text-muted-foreground">
                Create your free account and start winning today!
              </p>
              <div className="flex gap-3">
                <Button variant="hero" size="lg" className="flex-1" asChild>
                  <Link to="/auth">
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="flex-1" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center space-y-4">
              <h3 className="font-display font-bold text-lg">Welcome Back!</h3>
              <p className="text-sm text-muted-foreground">
                Check out today's predictions
              </p>
              <div className="flex gap-3">
                <Button variant="hero" size="lg" className="flex-1" asChild>
                  <Link to="/free-tips">
                    <Trophy className="w-4 h-4 mr-2" />
                    View Tips
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="flex-1" asChild>
                  <Link to="/profile">My Profile</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Admin Quick Access - Only visible to logged in admins */}
          {user && isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-4 border border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Admin Panel</p>
                    <p className="text-xs text-muted-foreground">Manage your platform</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">
                    Open
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </motion.section>
      </div>
    </AppLayout>
  );
};

export default Index;
