import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const packageType = searchParams.get("package") || "free";
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) {
        toast.error(error.message || "Invalid verification code");
      } else {
        toast.success("Email verified successfully!");
        
        // Send welcome email in background
        const fullName = data?.user?.user_metadata?.full_name || "";
        if (fullName && email) {
          supabase.functions.invoke("send-welcome-email", {
            body: { email, fullName },
          }).catch(console.error);
        }
        
        navigate("/pending-approval");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification code resent! Check your email.");
      }
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold">Verify Your Email</h1>
            <p className="text-muted-foreground text-sm">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-sm font-medium flex items-center justify-center gap-1">
              <Mail className="w-4 h-4" />
              {email || "your email"}
            </p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleVerify}
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-primary font-medium hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
