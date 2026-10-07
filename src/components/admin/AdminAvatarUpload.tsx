import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/** Admin profile picture; tap to upload a new one. */
export const AdminAvatarUpload = ({ size = "md" }: { size?: "md" | "lg" }) => {
  const { user, profile, refreshProfile } = useAuth();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const dim = size === "lg" ? "w-20 h-20 text-2xl" : "w-9 h-9 sm:w-10 sm:h-10";

  const onFile = async (file?: File) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image");
    if (file.size > 3 * 1024 * 1024) return toast.error("Image must be under 3 MB");
    setBusy(true);
    try {
      const path = `${user.id}/avatar.${file.name.split(".").pop() || "jpg"}`;
      const up = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (up.error) throw up.error;
      const url = `${supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl}?t=${Date.now()}`;
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile picture updated");
    } catch (e: any) {
      toast.error("Upload failed: " + (e?.message || "try again"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" title="Change your picture" onClick={() => ref.current?.click()}
      className={cn("relative shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-primary-foreground font-bold group", dim)}>
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile?.full_name?.[0] || "A").toUpperCase()}
      <span className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        {busy ? <Loader2 className="w-4 h-4 animate-spin text-foreground" /> : <Camera className="w-4 h-4 text-foreground" />}
      </span>
      {busy && <span className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-foreground" /></span>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </button>
  );
};
