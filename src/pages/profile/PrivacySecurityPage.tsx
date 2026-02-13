import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PrivacySection {
  id: string;
  title: string;
  content: string;
}

const PrivacySecurityPage = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("privacy_security")
      .select("id, title, content")
      .eq("is_active", true)
      .order("display_order");
    if (!error && data) setSections(data);
    setIsLoading(false);
  };

  return (
    <AppLayout showInfo={false}>
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">Privacy & Security</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sections.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
            No privacy & security information available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold">{section.title}</h3>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PrivacySecurityPage;
