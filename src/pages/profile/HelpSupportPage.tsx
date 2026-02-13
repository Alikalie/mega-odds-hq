import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, Mail, Send, Copy, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupportContact {
  id: string;
  type: string;
  value: string;
  label: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  email: Mail,
  telegram: Send,
  phone: Phone,
};

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("support_contacts")
      .select("id, type, value, label")
      .eq("is_active", true)
      .order("display_order");
    if (!error && data) setContacts(data);
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const openLink = (type: string, value: string) => {
    if (type === "whatsapp") window.open(`https://wa.me/${value.replace(/[^0-9+]/g, "")}`, "_blank");
    else if (type === "email") window.open(`mailto:${value}`, "_blank");
    else if (type === "telegram") window.open(`https://t.me/${value.replace("@", "")}`, "_blank");
    else if (type === "phone") window.open(`tel:${value}`, "_blank");
  };

  return (
    <AppLayout showInfo={false}>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Help & Support</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
            No support contacts available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact, i) => {
              const Icon = iconMap[contact.type] || Phone;
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold capitalize">{contact.label || contact.type}</p>
                    <p className="text-sm text-muted-foreground truncate">{contact.value}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(contact.value)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openLink(contact.type, contact.value)}>
                      <ArrowLeft className="w-4 h-4 rotate-[135deg]" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HelpSupportPage;
