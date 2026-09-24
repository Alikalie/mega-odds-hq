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
import { validateApkUrl } from "@/lib/apk";
import { Smartphone, Upload, MousePointerClick } from "lucide-react";

const AdminSiteSettingsPage = () => {
  const { data, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const [f, setF] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0 });

  useEffect(() => { if (data) setF(data); }, [data]);

  useEffect(() => {
    const count = async (since?: Date) => {
      let q = supabase.from("apk_clicks").select("id", { count: "exact", head: true });
      if (since) q = q.gte("created_at", since.toISOString());
      const { count } = await q;
      return count || 0;
    };
    const start = new Date(); start.setHours(0, 0, 0, 0);
    Promise.all([count(), count(start), count(new Date(Date.now() - 7 * 864e5))]).then(([total, today, week]) =>
      setStats({ total, today, week })
    );
  }, []);

  const uploadIcon = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 1024 * 1024) return toast.error("Icon must be under 1 MB");
    setUploading(true);
    const path = `apk-icons/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) return toast.error("Upload failed: " + error.message);
    set("apk_icon_url", supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    toast.success("Icon uploaded — click Save to apply");
  };

  const apkError = f?.apk_enabled ? validateApkUrl(f?.apk_url) : null;

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const save = async (bump: boolean) => {
    if (apkError) return toast.error("Fix the APK link: " + apkError);
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
            <p className="text-xs text-muted-foreground">{f.apk_enabled ? "Enabled — icon shows in the top bar" : "Disabled — icon and download pop-up are hidden"}</p>
            <div>
              <Label>Download URL</Label>
              <Input placeholder="https://..." value={f.apk_url} onChange={(e) => set("apk_url", e.target.value)} className={apkError ? "border-destructive" : ""} />
              {apkError ? <p className="text-xs text-destructive mt-1">{apkError}</p> : <p className="text-xs text-success mt-1">Link looks valid</p>}
            </div>
            <div><Label>Button label</Label><Input value={f.apk_label} onChange={(e) => set("apk_label", e.target.value)} /></div>
            <div>
              <Label>Icon</Label>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                  {f.apk_icon_url ? <img src={f.apk_icon_url} alt="APK icon" className="w-full h-full object-cover" /> : <Smartphone className="w-6 h-6 text-primary" />}
                </div>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer border border-input rounded-md px-3 h-9">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload icon
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadIcon(e.target.files?.[0])} />
                </label>
                {f.apk_icon_url && <Button variant="ghost" size="sm" onClick={() => set("apk_icon_url", null)}>Use default</Button>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[["Today", stats.today], ["Last 7 days", stats.week], ["All time", stats.total]].map(([l, v]) => (
                <div key={l as string} className="rounded-lg bg-secondary/50 p-3 text-center">
                  <MousePointerClick className="w-4 h-4 mx-auto text-primary" />
                  <p className="text-lg font-bold">{v}</p>
                  <p className="text-xs text-muted-foreground">{l} clicks</p>
                </div>
              ))}
            </div>
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
