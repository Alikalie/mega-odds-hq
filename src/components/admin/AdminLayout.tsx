import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Info,
  Package,
  CreditCard,
  Trophy,
  Crown,
  Star,
  Menu,
  X,
  LogOut,
  Shield,
  Wallet,
  Send,
  ArrowUpCircle,
  Code2,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const allSidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", superOnly: false },
  { icon: FileText, label: "Categories", href: "/admin/categories", superOnly: true },
  { icon: Package, label: "Packages", href: "/admin/packages", superOnly: true },
  { icon: CreditCard, label: "Subscriptions", href: "/admin/subscriptions", superOnly: true },
  { icon: Users, label: "Users", href: "/admin/users", superOnly: false },
  { icon: Trophy, label: "Free Tips", href: "/admin/free-tips", superOnly: false },
  { icon: Crown, label: "VIP Tips", href: "/admin/vip-tips", superOnly: false },
  { icon: Star, label: "Special Tips", href: "/admin/special-tips", superOnly: false },
  { icon: Bell, label: "Announcements", href: "/admin/announcements", superOnly: false },
  { icon: Send, label: "Notifications", href: "/admin/notifications", superOnly: false },
  { icon: Wallet, label: "Payments", href: "/admin/payments", superOnly: true },
  { icon: ArrowUpCircle, label: "Upgrade Requests", href: "/admin/upgrade-requests", superOnly: true },
  { icon: Shield, label: "Admin Roles", href: "/admin/roles", superOnly: true },
  { icon: Code2, label: "Booking Codes", href: "/admin/booking-codes", superOnly: false },
  { icon: Settings2, label: "Feature Toggles", href: "/admin/feature-toggles", superOnly: true },
  { icon: Info, label: "App Info", href: "/admin/app-info", superOnly: true },
  { icon: Shield, label: "Privacy & Security", href: "/admin/privacy-security", superOnly: true },
];

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, profile } = useAuth();

  const sidebarItems = allSidebarItems.filter(
    (item) => !item.superOnly || isSuperAdmin
  );

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
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
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
            <h1 className="text-lg font-display font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-sm font-medium">{profile?.full_name || "Admin"}</p>
              <p className="text-xs text-muted-foreground">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground font-bold">
              {(profile?.full_name?.[0] || "A").toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
