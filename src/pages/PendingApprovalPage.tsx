import { motion } from "framer-motion";
import { Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PendingApprovalPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm text-center space-y-6"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-warning/10 flex items-center justify-center">
            <Clock className="w-12 h-12 text-warning" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold">
              Awaiting Approval
            </h1>
            <p className="text-muted-foreground text-sm">
              Your account has been created and is pending admin approval.
              You'll receive an email once your account is activated.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-left space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  1
                </span>
                Our team will review your registration
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  2
                </span>
                You'll receive an email confirmation once approved
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  3
                </span>
                Login and start accessing predictions
              </li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <Button variant="hero" size="lg" className="w-full" asChild>
              <Link to="/">Return Home</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Questions? Contact us at support@megaodds.com
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
