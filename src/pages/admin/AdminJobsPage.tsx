import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Loader2, Share2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { JobPost } from "@/pages/JobsPage";
import { sendPush } from "@/lib/webNotifications";

export const jobLink = (id: string) => `${window.location.origin}/jobs?job=${id}`;

const copyLink = async (id: string) => {
  const url = jobLink(id);
  try {
    if (navigator.share) { await navigator.share({ title: "Job at Mega Odds", url }); return; }
  } catch {}
  await navigator.clipboard.writeText(url);
  toast.success("Job link copied — paste it anywhere to share");
};

const empty: Partial<JobPost> = { title: "", description: "", is_active: true };

const AdminJobsPage = () => {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Partial<JobPost> | null>(null);
  const [busy, setBusy] = useState(false);
  const [jobsOn, setJobsOn] = useState<boolean | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["job_posts_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobPost[];
    },
  });

  const { data: toggle } = useQuery({
    queryKey: ["jobs_toggle"],
    queryFn: async () => (await supabase.from("feature_toggles").select("*").eq("feature_key", "jobs").maybeSingle()).data,
  });
  const on = jobsOn ?? !!toggle?.is_enabled;

  const setToggle = async (v: boolean) => {
    setJobsOn(v);
    const { error } = await supabase.from("feature_toggles").update({ is_enabled: v }).eq("feature_key", "jobs");
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
    toast.success(v ? "Jobs button is now visible" : "Jobs button hidden");
  };

  const refresh = () => { qc.invalidateQueries({ queryKey: ["job_posts_admin"] }); qc.invalidateQueries({ queryKey: ["job_posts_public"] }); };

  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    setBusy(true);
    const path = `job-images/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    setBusy(false);
    if (error) return toast.error("Upload failed: " + error.message);
    setEdit((e) => ({ ...e, image_url: supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl }));
  };

  const save = async () => {
    if (!edit?.title?.trim() || !edit?.description?.trim()) return toast.error("Title and description are required");
    setBusy(true);
    const { id, created_at, ...rest } = edit as any;
    const payload = { ...rest, deadline: rest.deadline || null };
    const res = id
      ? await supabase.from("job_posts").update(payload).eq("id", id).select("id").single()
      : await supabase.from("job_posts").insert(payload).select("id").single();
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    const newId = res.data.id;
    if (!id && payload.is_active) {
      const link = jobLink(newId);
      const { data: users } = await supabase.from("profiles").select("id");
      if (users?.length) {
        await supabase.from("notifications").insert(
          users.map((u) => ({ user_id: u.id, title: "New job: " + payload.title, message: `Mega Odds is hiring! View and apply: ${link}` }))
        );
      }
      sendPush({ all: true, title: "New job: " + payload.title, message: "Mega Odds is hiring — tap to view and apply", url: `/jobs?job=${newId}` });
      toast.success("Job posted and users notified");
    } else toast.success("Job saved");
    setEdit(null);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this job advert?")) return;
    const { error } = await supabase.from("job_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const f = (k: keyof JobPost) => ({
    value: (edit?.[k] as string) || "",
    onChange: (e: any) => setEdit((p) => ({ ...p, [k]: e.target.value })),
  });

  return (
    <AdminLayout title="Job Adverts">
      <div className="space-y-4 max-w-3xl">
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Show Jobs button to users</p>
            <p className="text-xs text-muted-foreground">Appears under Profile when switched on.</p>
          </div>
          <Switch checked={on} onCheckedChange={setToggle} />
        </div>

        <Button onClick={() => setEdit({ ...empty })}><Plus className="w-4 h-4 mr-1" />New job advert</Button>

        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : jobs.map((j) => (
          <div key={j.id} className="glass-card rounded-xl p-3 flex gap-3 items-center">
            {j.image_url && <img src={j.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{j.title}</p>
              <p className="text-xs text-muted-foreground">{j.is_active ? "Published" : "Hidden"}{j.deadline ? ` · deadline ${j.deadline}` : ""}</p>
            </div>
            <Button size="icon" variant="ghost" title="Copy share link" onClick={() => copyLink(j.id)}><Share2 className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setEdit(j)}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(j.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        {!isLoading && jobs.length === 0 && <p className="text-sm text-muted-foreground">No job adverts yet.</p>}
      </div>

      <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit job" : "New job advert"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Job title *</Label><Input {...f("title")} placeholder="e.g. Sports Tipster" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Location</Label><Input {...f("location")} placeholder="Freetown / Remote" /></div>
              <div><Label>Job type</Label><Input {...f("job_type")} placeholder="Full-time" /></div>
              <div><Label>Salary</Label><Input {...f("salary")} placeholder="Negotiable" /></div>
              <div><Label>Deadline</Label><Input type="date" {...f("deadline")} /></div>
            </div>
            <div><Label>Description *</Label><Textarea rows={4} {...f("description")} /></div>
            <div><Label>Requirements</Label><Textarea rows={3} {...f("requirements")} /></div>
            <div><Label>How to apply</Label><Textarea rows={3} {...f("how_to_apply")} /></div>
            <div><Label>Application link</Label><Input {...f("apply_link")} placeholder="https://..." /></div>
            <div><Label>Application email</Label><Input type="email" {...f("apply_email")} placeholder="jobs@..." /></div>
            <div>
              <Label>Image / flyer</Label>
              <div className="flex items-center gap-3 mt-1">
                {edit?.image_url && <img src={edit.image_url} alt="" className="h-20 rounded-lg object-cover" />}
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg border border-border hover:bg-muted">
                  <Upload className="w-4 h-4" />{busy ? "Uploading..." : "Upload image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
                </label>
                {edit?.image_url && <Button size="sm" variant="ghost" onClick={() => setEdit((p) => ({ ...p, image_url: null }))}>Remove</Button>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Published</Label>
              <Switch checked={!!edit?.is_active} onCheckedChange={(v) => setEdit((p) => ({ ...p, is_active: v }))} />
            </div>
            <Button className="w-full" onClick={save} disabled={busy}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminJobsPage;
