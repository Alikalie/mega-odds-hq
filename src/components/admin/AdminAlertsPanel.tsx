import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Clock, ArrowUpCircle, Code2, ShieldAlert, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Log {
  id: string;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  table_name: string;
  summary: string | null;
  created_at: string;
}

const verb: Record<string, string> = { INSERT: "added", UPDATE: "updated", DELETE: "deleted" };
const verbColor: Record<string, string> = { INSERT: "text-primary", UPDATE: "text-warning", DELETE: "text-destructive" };

export const AdminAlertsPanel = () => {
  const { isSuperAdmin } = useAuth();
  const [counts, setCounts] = useState({ users: 0, upgrades: 0, codes: 0 });
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [u, r, c] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("upgrade_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("booking_codes").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setCounts({ users: u.count || 0, upgrades: r.count || 0, codes: c.count || 0 });
    })();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) { setLoading(false); return; }
    supabase
      .from("admin_activity_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { setLogs((data as any) || []); setLoading(false); });
    const ch = supabase
      .channel("admin-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_activity_log" }, (p) =>
        setLogs((prev) => [p.new as Log, ...prev].slice(0, 20)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isSuperAdmin]);

  const alerts = [
    { label: "Users awaiting approval", count: counts.users, icon: Clock, href: "/admin/users", tone: "text-warning bg-warning/10" },
    { label: "Upgrade requests", count: counts.upgrades, icon: ArrowUpCircle, href: "/admin/upgrade-requests", tone: "text-vip bg-vip/10", superOnly: true },
    { label: "Booking codes to review", count: counts.codes, icon: Code2, href: "/admin/booking-codes", tone: "text-special bg-special/10" },
  ].filter((a) => !a.superOnly || isSuperAdmin);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Admin Notifications</h3>
        <div className="space-y-2">
          {alerts.map((a) => (
            <Link key={a.label} to={a.href} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", a.tone)}><a.icon className="w-4 h-4" /></div>
                <span className="text-sm font-medium">{a.label}</span>
              </div>
              <span className={cn("min-w-7 h-7 px-2 rounded-full flex items-center justify-center text-sm font-bold", a.count ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{a.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-special" /> Admin Changes (live)</h3>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No admin changes yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {logs.map((l) => (
                <div key={l.id} className="py-2 border-b border-border/50 last:border-0">
                  <p className="text-sm">
                    <span className="font-medium">{l.actor_email || "Admin"}</span>{" "}
                    <span className={verbColor[l.action]}>{verb[l.action] || l.action}</span>{" "}
                    {l.table_name.replace(/_/g, " ")}
                    {l.actor_role === "super_admin" && <span className="ml-1 text-[10px] text-muted-foreground">(you/super)</span>}
                  </p>
                  <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{l.summary}</span>
                    <span className="whitespace-nowrap">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
