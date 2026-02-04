import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, Shield, Trophy, Crown, Star } from "lucide-react";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoDialog = ({ open, onOpenChange }: InfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-primary" />
            </div>
            About Mega Odds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Mega Odds — your ultimate football predictions platform.
            Get daily tips and improve your betting experience!
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Free Tips</h4>
                <p className="text-muted-foreground text-xs">
                  Access daily free predictions across multiple categories.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-vip/10">
              <Crown className="w-5 h-5 text-vip shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-vip">VIP Tips</h4>
                <p className="text-muted-foreground text-xs">
                  Premium predictions with higher accuracy rates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-special/10">
              <Star className="w-5 h-5 text-special shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-special">Special Tips</h4>
                <p className="text-muted-foreground text-xs">
                  Exclusive high-stakes predictions for serious bettors.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
            <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Bet responsibly. Mega Odds provides predictions for entertainment
              purposes. Always gamble within your means.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
