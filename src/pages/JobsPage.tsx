import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Briefcase, MapPin, Calendar, Banknote, Mail, ExternalLink, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureEnabled } from "@/hooks/useFeatureToggles";

export type JobPost = {
  id: string; title: string; location: string | null; job_type: string | null; salary: string | null;
  description: string; requirements: string | null; how_to_apply: string | null; apply_link: string | null;
  apply_email: string | null; deadline: string | null; image_url: string | null; is_active: boolean; created_at: string;
};

const JobsPage = () => {
  const enabled = useFeatureEnabled("jobs");
  const [open, setOpen] = useState<JobPost | null>(null);
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["job_posts_public"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_posts").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobPost[];
    },
  });

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-xl">Jobs at Mega Odds</h1>
        </div>
        {!enabled ? (
          <p className="text-sm text-muted-foreground">Job adverts are not available right now.</p>
        ) : isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
        ) : jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground glass-card rounded-xl p-6 text-center">No open positions at the moment. Check back soon.</p>
        ) : (
          jobs.map((j) => (
            <button key={j.id} onClick={() => setOpen(j)} className="w-full text-left glass-card rounded-xl overflow-hidden hover:bg-secondary/50 transition">
              {j.image_url && <img src={j.image_url} alt={j.title} className="w-full max-h-48 object-cover" />}
              <div className="p-4 space-y-1">
                <h2 className="font-display font-bold">{j.title}</h2>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {j.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>}
                  {j.job_type && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{j.job_type}</span>}
                  {j.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Apply by {new Date(j.deadline).toLocaleDateString()}</span>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{j.description}</p>
                <span className="text-xs text-primary font-semibold">View details →</span>
              </div>
            </button>
          ))
        )}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader><DialogTitle>{open.title}</DialogTitle></DialogHeader>
              {open.image_url && <img src={open.image_url} alt={open.title} className="w-full rounded-lg" />}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {open.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{open.location}</span>}
                {open.job_type && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{open.job_type}</span>}
                {open.salary && <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />{open.salary}</span>}
                {open.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Apply by {new Date(open.deadline).toLocaleDateString()}</span>}
              </div>
              <Section title="About the job" text={open.description} />
              <Section title="Requirements" text={open.requirements} />
              <Section title="How to apply" text={open.how_to_apply} />
              <div className="flex flex-col gap-2 pt-2">
                {open.apply_link && (
                  <Button variant="hero" asChild><a href={open.apply_link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" />Apply now</a></Button>
                )}
                {open.apply_email && (
                  <Button variant="outline" asChild><a href={`mailto:${open.apply_email}?subject=${encodeURIComponent("Application: " + open.title)}`}><Mail className="w-4 h-4 mr-2" />Email {open.apply_email}</a></Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

const Section = ({ title, text }: { title: string; text: string | null }) =>
  text ? (
    <div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-line">{text}</p>
    </div>
  ) : null;

export default JobsPage;
