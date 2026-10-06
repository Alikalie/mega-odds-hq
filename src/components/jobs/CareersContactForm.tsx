import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "Write a message").max(2000),
});

export const CareersContactForm = () => {
  const { user, profile } = useAuth();
  const [f, setF] = useState({ full_name: profile?.full_name || "", email: profile?.email || "", message: "" });
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const p = schema.safeParse(f);
    if (!p.success) return toast.error(p.error.errors[0].message);
    setBusy(true);
    const { error } = await supabase.from("career_messages").insert({ full_name: p.data.full_name, email: p.data.email, message: p.data.message, user_id: user?.id });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent to the Mega Odds team");
    setF({ ...f, message: "" });
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <h2 className="font-display font-bold">Questions? Contact our hiring team</h2>
      <Input placeholder="Your name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
      <Input type="email" placeholder="Your email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <Textarea rows={4} placeholder="Your message" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      <Button className="w-full" onClick={send} disabled={busy}>Send message</Button>
    </div>
  );
};
