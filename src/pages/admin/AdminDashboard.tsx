import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Bell,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Trophy,
  Crown,
  Star,
  TrendingUp,
  UserCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Trophy, label: "Free Tips", href: "/admin/free-tips" },
  { icon: Crown, label: "VIP Tips", href: "/admin/vip-tips" },
  { icon: Star, label: "Special Tips", href: "/admin/special-tips" },
  { icon: Bell, label: "Announcements", href: "/admin/announcements" },
  { icon: Info, label: "App Info", href: "/admin/app-info" },
];

const statsCards = [
  { title: "Total Users", value: "2,456", icon: Users, change: "+12%", trend: "up" },
  { title: "VIP Members", value: "342", icon: Crown, change: "+8%", trend: "up" },
  { title: "Special Members", value: "89", icon: Star, change: "+15%", trend: "up" },
  { title: "Pending Approval", value: "23", icon: Clock, change: "-5%", trend: "down" },
  { title: "Tips Today", value: "48", icon: TrendingUp, change: "+20%", trend: "up" },
  { title: "Approved Today", value: "12", icon: UserCheck, change: "+3%", trend: "up" },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-display font-bold">
                Admin <span className="text-primary">Panel</span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => navigate("/")}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Exit Admin
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-display font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@megaodds.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6 space-y-6">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-display font-bold">
              Welcome back, Admin
            </h2>
            <p className="text-muted-foreground">
              Here's what's happening with Mega Odds today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {statsCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      stat.title.includes("VIP")
                        ? "bg-vip/10"
                        : stat.title.includes("Special")
                        ? "bg-special/10"
                        : stat.title.includes("Pending")
                        ? "bg-warning/10"
                        : "bg-primary/10"
                    )}
                  >
                    <stat.icon
                      className={cn(
                        "w-5 h-5",
                        stat.title.includes("VIP")
                          ? "text-vip"
                          : stat.title.includes("Special")
                          ? "text-special"
                          : stat.title.includes("Pending")
                          ? "text-warning"
                          : "text-primary"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      stat.trend === "up"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="font-display font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button variant="outline" asChild>
                <Link to="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/free-tips">
                  <Trophy className="w-4 h-4 mr-2" />
                  Add Free Tip
                </Link>
              </Button>
              <Button variant="vip" asChild>
                <Link to="/admin/vip-tips">
                  <Crown className="w-4 h-4 mr-2" />
                  Add VIP Tip
                </Link>
              </Button>
              <Button variant="special" asChild>
                <Link to="/admin/special-tips">
                  <Star className="w-4 h-4 mr-2" />
                  Add Special Tip
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="font-display font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: "New user registered", user: "john@example.com", time: "2 min ago" },
                { action: "VIP tip added", user: "Admin", time: "15 min ago" },
                { action: "User approved", user: "jane@example.com", time: "1 hour ago" },
                { action: "Announcement posted", user: "Admin", time: "2 hours ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
