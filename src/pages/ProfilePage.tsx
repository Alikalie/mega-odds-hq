import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { UserBadge } from "@/components/ui/user-badge";
import { Switch } from "@/components/ui/switch";
import { AnnouncementCard, Announcement } from "@/components/cards/AnnouncementCard";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "My Dashboard", href: "/dashboard" },
  { icon: User, label: "Edit Profile", href: "/profile/edit" },
  { icon: Bell, label: "Notifications", href: "/profile/notifications" },
  { icon: Shield, label: "Privacy & Security", href: "/profile/security" },
  { icon: HelpCircle, label: "Help & Support", href: "/profile/help" },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
 
   useEffect(() => {
     if (profile?.status === "approved") {
       fetchAnnouncements();
     }
   }, [profile]);
 
   const fetchAnnouncements = async () => {
     const { data, error } = await supabase
       .from("announcements")
       .select("*")
       .order("created_at", { ascending: false })
       .limit(5);
 
     if (!error && data) {
       setAnnouncements(
         data.map((a) => ({
           id: a.id,
           title: a.title,
           description: a.description,
           createdAt: new Date(a.created_at).toLocaleDateString(),
         }))
       );
     }
   };

  const handleDismissAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };
 
   const handleSignOut = async () => {
     await signOut();
     toast.success("Signed out successfully");
     navigate("/");
   };
 
   if (isLoading) {
     return (
       <AppLayout showInfo={false}>
         <div className="flex items-center justify-center min-h-[60vh]">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
       </AppLayout>
     );
   }

  return (
    <AppLayout showInfo={false}>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
           {user && profile ? (
             <>
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                   {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1">
                   <h2 className="font-display font-bold text-lg">
                     {profile.full_name || "User"}
                   </h2>
                   <p className="text-sm text-muted-foreground">{profile.email}</p>
                   <div className="flex items-center gap-2 mt-2">
                     <UserBadge variant={profile.subscription} />
                     <UserBadge variant={profile.status} />
                     {isAdmin && (
                       <UserBadge variant="special" className="bg-accent/20 text-accent" />
                     )}
                   </div>
                 </div>
              </div>

               {profile.subscription === "free" && profile.status === "approved" && (
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
 
               {isAdmin && (
                 <div className="mt-4 pt-4 border-t border-border/50">
                   <Button variant="outline" className="w-full" asChild>
                     <Link to="/admin">
                       <Shield className="w-4 h-4 mr-2" />
                       Admin Dashboard
                     </Link>
                   </Button>
                 </div>
               )}
             </>
           ) : (
             <div className="text-center py-4">
               <p className="text-muted-foreground mb-4">
                 Sign in to access your profile
               </p>
               <Button variant="hero" asChild>
                 <Link to="/auth">Sign In / Register</Link>
              </Button>
            </div>
          )}
        </motion.div>
 
         {/* Pending Status */}
         {user && profile?.status === "pending" && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-center"
           >
             <p className="text-sm text-warning">
               Your account is pending admin approval. You'll be notified once approved.
             </p>
           </motion.div>
         )}

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
            {isDark ? (
              <Moon className="w-5 h-5 text-accent" />
            ) : (
              <Sun className="w-5 h-5 text-vip" />
            )}
            <span className="font-medium">Dark Mode</span>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </motion.div>

        {/* Menu Items */}
         {user && (
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
         )}

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 pt-4"
        >
           {!user ? (
             <Button variant="hero" className="w-full" size="lg" asChild>
               <Link to="/auth">Sign In / Register</Link>
             </Button>
           ) : (
             <Button
               variant="ghost"
               className="w-full text-destructive hover:text-destructive"
               onClick={handleSignOut}
             >
               <LogOut className="w-4 h-4 mr-2" />
               Sign Out
             </Button>
           )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
