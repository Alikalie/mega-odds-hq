import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  cover_letter: z.string().trim().min(20, "Cover letter should be at least 20 characters").max(5000),
});

export const JobApplyForm = ({ jobId, onDone }: { jobId: string; onDone: () => void }) => {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ full_name: profile?.full_name || "", email: profile?.email || "", phone: "", cover_letter: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    if (!file) return toast.error("Please attach your resume / CV");
    if (file.size > 10 * 1024 * 1024) return toast.error("Resume must be under 10 MB");
    setBusy(true);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const up = await supabase.storage.from("resumes").upload(path, file);
    if (up.error) { setBusy(false); return toast.error("Upload failed: " + up.error.message); }
    const { error } = await supabase.from("job_applications").insert({ ...parsed.data, job_id: jobId, user_id: user.id, resume_path: path });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Application sent! We'll be in touch.");
    onDone();
  };

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <h3 className="font-semibold">Apply for this job</h3>
      <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
      <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div><Label>Phone (optional)</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      <div><Label>Cover letter</Label><Textarea rows={5} value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} placeholder="Tell us why you're a great fit..." /></div>
      <div>
        <Label>Resume / CV</Label>
        <label className="mt-1 flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg border border-border hover:bg-muted">
          <Upload className="w-4 h-4" />{file ? file.name : "Choose file (PDF, Word or image)"}
          <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
      </div>
      <Button variant="hero" className="w-full" onClick={submit} disabled={busy}>
        {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Submit application
      </Button>
    </div>
  );
};
