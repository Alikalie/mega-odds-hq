import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Shield,
  HelpCircle,
  Crown,
  Star,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { UserBadge } from "@/components/ui/user-badge";
import { Switch } from "@/components/ui/switch";
import { AnnouncementCard, Announcement } from "@/components/cards/AnnouncementCard";

// Mock user data - will be replaced with auth
const mockUser = {
  name: "Guest User",
  email: "guest@example.com",
  subscription: "free" as const,
  status: "approved" as const,
};

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Weekend Special Offer",
    description: "Get 50% off on VIP subscription this weekend only!",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    title: "New Features Added",
    description: "Check out our new tip categories and improved accuracy tracking.",
    createdAt: "1 day ago",
  },
];

const menuItems = [
  { icon: User, label: "Edit Profile", href: "/profile/edit" },
  { icon: Bell, label: "Notifications", href: "/profile/notifications" },
  { icon: Shield, label: "Privacy & Security", href: "/profile/security" },
  { icon: HelpCircle, label: "Help & Support", href: "/profile/help" },
];

const ProfilePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);

  const handleDismissAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AppLayout showInfo={false}>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {mockUser.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg">{mockUser.name}</h2>
              <p className="text-sm text-muted-foreground">{mockUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <UserBadge variant={mockUser.subscription} />
                <UserBadge variant={mockUser.status} />
              </div>
            </div>
          </div>

          {mockUser.subscription === "free" && (
            <div className="mt-4 pt-4 border-t border-border/50 flex gap-2">
              <Button variant="vip" size="sm" className="flex-1" asChild>
                <Link to="/vip">
                  <Crown className="w-4 h-4 mr-1" />
                  Get VIP
                </Link>
              </Button>
              <Button variant="special" size="sm" className="flex-1" asChild>
                <Link to="/special">
                  <Star className="w-4 h-4 mr-1" />
                  Get Special
                </Link>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Announcements
            </h3>
            <div className="space-y-2">
              {announcements.map((announcement, i) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onDismiss={handleDismissAnnouncement}
                  index={i}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-accent" />
            ) : (
              <Sun className="w-5 h-5 text-vip" />
            )}
            <span className="font-medium">Dark Mode</span>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-4 p-4 glass-card rounded-xl hover:bg-secondary/50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 font-medium">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </motion.div>

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 pt-4"
        >
          <Button variant="hero" className="w-full" size="lg" asChild>
            <Link to="/auth">Sign In / Register</Link>
          </Button>
          
          <Button variant="ghost" className="w-full text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
