import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AdminSiteSettingsPage = () => {
  const { data, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const [f, setF] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setF(data); }, [data]);

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const save = async (bump: boolean) => {
    setSaving(true);
    const { id, updated_at, ...rest } = f;
    const payload = { ...rest, updated_at: new Date().toISOString(), cookie_version: bump ? f.cookie_version + 1 : f.cookie_version };
    const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
    setSaving(false);
    if (error) return toast.error("Failed to save: " + error.message);
    toast.success(bump ? "Saved — banner will re-appear for all users" : "Settings saved");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <AdminLayout title="Cookies & App Link">
      {isLoading || !f ? (
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mt-20" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <section className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold">Cookie Banner</h2>
              <Switch checked={f.cookie_enabled} onCheckedChange={(v) => set("cookie_enabled", v)} />
            </div>
            <div><Label>Message</Label><Textarea rows={4} value={f.cookie_message} onChange={(e) => set("cookie_message", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Accept button text</Label><Input value={f.cookie_accept_text} onChange={(e) => set("cookie_accept_text", e.target.value)} /></div>
              <div><Label>Decline button text</Label><Input value={f.cookie_decline_text} onChange={(e) => set("cookie_decline_text", e.target.value)} /></div>
              <div><Label>Style</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={f.cookie_style} onChange={(e) => set("cookie_style", e.target.value)}>
                  <option value="card">Card</option><option value="bar">Full-width bar</option><option value="minimal">Minimal pill</option>
                </select></div>
              <div><Label>Position</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={f.cookie_position} onChange={(e) => set("cookie_position", e.target.value)}>
                  <option value="bottom">Bottom</option><option value="top">Top</option>
                </select></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["cookie_bg_color", "Background"], ["cookie_text_color", "Text"], ["cookie_button_color", "Button"]].map(([k, l]) => (
                <div key={k}><Label>{l}</Label><Input type="color" className="h-10 p-1" value={f[k]} onChange={(e) => set(k, e.target.value)} /></div>
              ))}
            </div>
            <div className="rounded-xl p-4 text-xs" style={{ background: f.cookie_bg_color, color: f.cookie_text_color }}>
              {f.cookie_message}
              <div className="mt-2 flex gap-2">
                <span className="px-3 py-1 rounded-lg border" style={{ borderColor: f.cookie_text_color }}>{f.cookie_decline_text}</span>
                <span className="px-3 py-1 rounded-lg font-semibold" style={{ background: f.cookie_button_color, color: f.cookie_bg_color }}>{f.cookie_accept_text}</span>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold">APK Download Link</h2>
              <Switch checked={f.apk_enabled} onCheckedChange={(v) => set("apk_enabled", v)} />
            </div>
            <div><Label>Download URL</Label><Input placeholder="https://..." value={f.apk_url} onChange={(e) => set("apk_url", e.target.value)} /></div>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button disabled={saving} onClick={() => save(false)}>Save</Button>
            <Button variant="outline" disabled={saving} onClick={() => save(true)}>Save & show cookie update to all users</Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSiteSettingsPage;
