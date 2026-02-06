import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { supabase } from "@/integrations/supabase/client";

const AdminAppInfoPage = () => {
  const [info, setInfo] = useState({
    id: "",
    title: "",
    content: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAppInfo();
  }, []);

  const fetchAppInfo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("app_information")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        // If no record exists, use defaults
        if (error.code === "PGRST116") {
          setInfo({
            id: "",
            title: "About Mega Odds",
            content: `Welcome to Mega Odds — your ultimate football predictions platform.

**Our Mission**
We provide expert football predictions to help you make smarter betting decisions.

**What We Offer**
- Free daily tips across multiple categories
- Premium VIP predictions with higher accuracy
- Exclusive Special tips for serious bettors

**Disclaimer**
Bet responsibly. Mega Odds provides predictions for entertainment purposes. Always gamble within your means.

Contact: support@megaodds.com`,
          });
          return;
        }
        throw error;
      }

      setInfo({
        id: data.id,
        title: data.title,
        content: data.content,
      });
    } catch (err) {
      console.error("Error fetching app info:", err);
      toast.error("Failed to load app information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (info.id) {
        // Update existing record
        const { error } = await supabase
          .from("app_information")
          .update({
            title: info.title,
            content: info.content,
          })
          .eq("id", info.id);

        if (error) throw error;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from("app_information")
          .insert({
            title: info.title,
            content: info.content,
          })
          .select()
          .single();

        if (error) throw error;
        setInfo((prev) => ({ ...prev, id: data.id }));
      }

      toast.success("App information updated successfully!");
    } catch (err) {
      console.error("Error saving app info:", err);
      toast.error("Failed to save app information");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-display font-bold">App Information</h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3 text-muted-foreground">
                <Info className="w-5 h-5" />
                <p className="text-sm">
                  This content is displayed when users tap the (i) info button.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={info.title}
                  onChange={(e) => setInfo({ ...info, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Content (Markdown supported)</Label>
                <Textarea
                  rows={15}
                  value={info.content}
                  onChange={(e) => setInfo({ ...info, content: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-xl p-6 space-y-4"
            >
              <h3 className="font-display font-bold">Preview</h3>
              <div className="prose prose-sm prose-invert max-w-none">
                <h4>{info.title}</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {info.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
};

export default AdminAppInfoPage;
