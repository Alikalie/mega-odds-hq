import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const AdminApplications = ({ jobTitles }: { jobTitles: Record<string, string> }) => {
  const qc = useQueryClient();
  const { data: apps = [] } = useQuery({
    queryKey: ["job_applications"],
    queryFn: async () => (await supabase.from("job_applications").select("*").order("created_at", { ascending: false })).data || [],
  });
  const { data: msgs = [] } = useQuery({
    queryKey: ["career_messages"],
    queryFn: async () => (await supabase.from("career_messages").select("*").order("created_at", { ascending: false })).data || [],
  });

  const openResume = async (path: string) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 600);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  const delMsg = async (id: string) => {
    await supabase.from("career_messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["career_messages"] });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="font-display font-bold">Applications ({apps.length})</h2>
        {apps.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
        {apps.map((a: any) => (
          <div key={a.id} className="glass-card rounded-xl p-3 space-y-1">
            <div className="flex justify-between gap-2">
              <p className="font-semibold">{a.full_name}</p>
              <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-primary">{jobTitles[a.job_id] || "Job"}</p>
            <p className="text-xs text-muted-foreground">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
            {a.cover_letter && <p className="text-sm whitespace-pre-line">{a.cover_letter}</p>}
            {a.resume_path && (
              <Button size="sm" variant="outline" onClick={() => openResume(a.resume_path)}><FileText className="w-4 h-4 mr-1" />Open resume</Button>
            )}
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <h2 className="font-display font-bold">Candidate messages ({msgs.length})</h2>
        {msgs.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        {msgs.map((m: any) => (
          <div key={m.id} className="glass-card rounded-xl p-3 flex gap-2">
            <div className="flex-1">
              <p className="font-semibold">{m.full_name} <span className="text-xs text-muted-foreground font-normal">{m.email}</span></p>
              <p className="text-sm whitespace-pre-line">{m.message}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => delMsg(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
      </section>
    </div>
  );
};
