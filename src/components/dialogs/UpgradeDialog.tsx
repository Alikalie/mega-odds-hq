import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Star, Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: "vip" | "special";
}

const tierConfig = {
  vip: {
    title: "Upgrade to VIP",
    description: "Get access to premium predictions with higher accuracy rates.",
    icon: Crown,
    color: "text-vip",
    buttonVariant: "vip" as const,
    features: [
      "Daily VIP predictions",
      "Higher accuracy tips",
      "Exclusive betting strategies",
      "Priority support",
    ],
  },
  special: {
    title: "Upgrade to Special",
    description: "Access exclusive high-stakes predictions for serious bettors.",
    icon: Star,
    color: "text-special",
    buttonVariant: "special" as const,
    features: [
      "All VIP features",
      "High-stakes predictions",
      "Personalized betting advice",
      "1-on-1 consultation",
    ],
  },
};

export const UpgradeDialog = ({ open, onOpenChange, tier }: UpgradeDialogProps) => {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 bg-card border-border/50">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
          <DialogTitle className="font-display text-xl">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {config.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-foreground"
              >
                <div className={`w-5 h-5 rounded-full bg-secondary flex items-center justify-center`}>
                  <Lock className={`w-3 h-3 ${config.color}`} />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant={config.buttonVariant}
            className="w-full"
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Request Upgrade
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            asChild
          >
            <Link to="/auth">Register / Login</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
