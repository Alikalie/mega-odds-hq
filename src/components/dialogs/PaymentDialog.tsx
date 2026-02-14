import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Smartphone, Wallet, Phone, CreditCard, MessageCircle, Mail, Send, Upload, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PaymentMethod {
  id: string;
  name: string;
  account_number: string;
  account_name: string | null;
  icon: string;
}

interface SupportContact {
  id: string;
  type: string;
  value: string;
  label: string | null;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSierraLeone: boolean;
  packageName?: string;
  packageId?: string;
  requestedTier?: string;
  onUpgradeRequestSent?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Wallet,
  Phone,
  CreditCard,
};

const supportIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp: MessageCircle,
  email: Mail,
  telegram: Send,
};

export const PaymentDialog = ({ open, onOpenChange, isSierraLeone, packageName, packageId, requestedTier, onUpgradeRequestSent }: PaymentDialogProps) => {
  const { user, profile } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchData();
      setProofFile(null);
      setProofPreview(null);
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [{ data: methods }, { data: contacts }] = await Promise.all([
        supabase.from("payment_methods").select("*").eq("is_active", true).order("display_order"),
        supabase.from("support_contacts").select("*").eq("is_active", true).order("display_order"),
      ]);
      setPaymentMethods(methods || []);
      setSupportContacts(contacts || []);
    } catch (err) {
      console.error("Error fetching payment data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleContactClick = (contact: SupportContact) => {
    if (contact.type === "whatsapp") {
      window.open(`https://wa.me/${contact.value.replace(/\s/g, "")}`, "_blank");
    } else if (contact.type === "email") {
      window.open(`mailto:${contact.value}`, "_blank");
    } else if (contact.type === "telegram") {
      window.open(`https://t.me/${contact.value.replace("@", "")}`, "_blank");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be less than 5MB");
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmitWithProof = async () => {
    if (!user || !requestedTier) return;
    setIsSubmitting(true);

    try {
      let proofUrl: string | null = null;

      if (proofFile) {
        const fileExt = proofFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(filePath, proofFile);

        if (uploadError) throw uploadError;
        proofUrl = filePath;
      }

      const { error } = await supabase.from("upgrade_requests").insert({
        user_id: user.id,
        user_email: profile?.email || user.email || "",
        user_name: profile?.full_name || null,
        user_phone: profile?.phone_number || null,
        user_country: profile?.country || null,
        current_tier: profile?.subscription || "free",
        requested_tier: requestedTier,
        requested_package_id: packageId || null,
        requested_package_name: packageName || null,
        payment_proof_url: proofUrl,
      });

      if (error) throw error;

      toast.success("Upgrade request submitted! Admin will review shortly.");
      onUpgradeRequestSent?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isSierraLeone) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Complete Your Payment</DialogTitle>
            <DialogDescription>
              {packageName ? `Pay for ${packageName}` : "Choose your payment method"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Copy the account number and make payment via your preferred method. Then upload your proof below.
            </p>

            {paymentMethods.map((method) => {
              const IconComponent = iconMap[method.icon] || CreditCard;
              return (
                <div key={method.id} className="glass-card rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.name}</h3>
                      {method.account_name && (
                        <p className="text-xs text-muted-foreground">{method.account_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
                    <code className="flex-1 text-sm font-mono">{method.account_number}</code>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(method.account_number, method.id)} className="shrink-0">
                      {copiedId === method.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Payment Proof Upload */}
            {user && requestedTier && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-medium">Upload Payment Proof</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                {proofPreview ? (
                  <div className="relative">
                    <img src={proofPreview} alt="Payment proof" className="w-full max-h-48 object-contain rounded-lg border border-border" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => { setProofFile(null); setProofPreview(null); }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-24 border-dashed flex flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tap to upload screenshot</span>
                  </Button>
                )}

                <Button
                  className="w-full"
                  onClick={handleSubmitWithProof}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Submit Upgrade Request</>
                  )}
                </Button>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Or send payment proof to:</p>
              <div className="flex flex-wrap gap-2">
                {supportContacts.map((contact) => {
                  const IconComponent = supportIconMap[contact.type] || MessageCircle;
                  return (
                    <Button key={contact.id} variant="outline" size="sm" onClick={() => handleContactClick(contact)} className="gap-2">
                      <IconComponent className="w-4 h-4" />
                      {contact.label || contact.type}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Non-Sierra Leone users
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Contact Support for Payment</DialogTitle>
          <DialogDescription>
            Payment for VIP and Special packages in your region requires contacting our support team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Our support team will guide you through the payment process and activate your subscription.
          </p>

          <div className="space-y-3">
            {supportContacts.map((contact) => {
              const IconComponent = supportIconMap[contact.type] || MessageCircle;
              return (
                <Button key={contact.id} variant="outline" className="w-full justify-start gap-3 h-14" onClick={() => handleContactClick(contact)}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{contact.label || contact.type}</p>
                    <p className="text-xs text-muted-foreground">{contact.value}</p>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Submit request for non-SL users too */}
          {user && requestedTier && (
            <div className="border-t border-border pt-4">
              <Button className="w-full" onClick={handleSubmitWithProof} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  "Submit Upgrade Request"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
