import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminAppInfoPage = () => {
  const [info, setInfo] = useState({
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

  const handleSave = () => {
    // Will be connected to Supabase
    toast.success("App information updated successfully!");
  };

  return (
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
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </header>

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
    </div>
  );
};

export default AdminAppInfoPage;
