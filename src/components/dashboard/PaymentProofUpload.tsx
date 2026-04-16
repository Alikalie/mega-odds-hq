import { useState } from "react";
import { Upload, Loader2, CheckCircle, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface PaymentProofUploadProps {
  upgradeRequestId?: string;
  onUploaded?: () => void;
}

export const PaymentProofUpload = ({ upgradeRequestId, onUploaded }: PaymentProofUploadProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

      // Update the upgrade request with the proof URL
      if (upgradeRequestId) {
        const { error: updateError } = await supabase
          .from("upgrade_requests")
          .update({ payment_proof_url: filePath })
          .eq("id", upgradeRequestId);

        if (updateError) throw updateError;
      } else {
        // Find the latest pending upgrade request for this user
        const { data: requests } = await supabase
          .from("upgrade_requests")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1);

        if (requests && requests.length > 0) {
          await supabase
            .from("upgrade_requests")
            .update({ payment_proof_url: filePath })
            .eq("id", requests[0].id);
        }
      }

      setUploaded(true);
      toast.success("Payment proof uploaded successfully!");
      onUploaded?.();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload payment proof");
    } finally {
      setIsUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-green-500/20">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <div>
          <p className="font-medium text-sm">Payment proof uploaded</p>
          <p className="text-xs text-muted-foreground">Our team will review it shortly</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileImage className="w-5 h-5 text-primary" />
        <Label className="font-semibold">Upload Payment Proof</Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload a screenshot of your payment to verify your subscription upgrade
      </p>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <Button variant="outline" className="w-full" disabled={isUploading}>
          {isUploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" />Choose Image</>
          )}
        </Button>
      </div>
    </div>
  );
};
