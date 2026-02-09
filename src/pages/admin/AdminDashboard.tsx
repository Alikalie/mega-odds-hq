import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Trophy,
  Crown,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    vipMembers: 0,
    specialMembers: 0,
    pendingApproval: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: profiles } = await supabase.from("profiles").select("status, subscription");
      if (profiles) {
        setStats({
          totalUsers: profiles.length,
          vipMembers: profiles.filter((p) => p.subscription === "vip").length,
          specialMembers: profiles.filter((p) => p.subscription === "special").length,
          pendingApproval: profiles.filter((p) => p.status === "pending").length,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const statsCards = [
    { title: "Total Users", value: stats.totalUsers.toString(), icon: Users },
    { title: "VIP Members", value: stats.vipMembers.toString(), icon: Crown },
    { title: "Special Members", value: stats.specialMembers.toString(), icon: Star },
    { title: "Pending Approval", value: stats.pendingApproval.toString(), icon: Clock },
  ];

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminDashboard;
