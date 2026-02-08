import { motion } from "framer-motion";
import { Calendar, Clock, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserSubscription } from "@/hooks/useSubscriptionPackages";
import { format, differenceInDays } from "date-fns";

interface SubscriptionCardProps {
  subscription: UserSubscription;
  index: number;
}

export const SubscriptionCard = ({ subscription, index }: SubscriptionCardProps) => {
  const pkg = subscription.package;
  if (!pkg) return null;

  const expiresAt = new Date(subscription.expires_at);
  const daysRemaining = differenceInDays(expiresAt, new Date());
  const isExpiringSoon = daysRemaining <= 7;
  const isExpired = daysRemaining < 0;

  const isVip = pkg.tier === "vip";
  const Icon = isVip ? Crown : Star;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "glass-card rounded-xl p-4 border",
        isVip ? "border-vip/30" : "border-special/30",
        isExpired && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isVip ? "bg-vip/10" : "bg-special/10"
            )}
          >
            <Icon className={cn("w-5 h-5", isVip ? "text-vip" : "text-special")} />
          </div>
          <div>
            <h3 className="font-semibold">{pkg.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{pkg.tier} Package</p>
          </div>
        </div>
        <div
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            isExpired
              ? "bg-destructive/10 text-destructive"
              : isExpiringSoon
              ? "bg-warning/10 text-warning"
              : "bg-success/10 text-success"
          )}
        >
          {isExpired ? "Expired" : isExpiringSoon ? `${daysRemaining}d left` : "Active"}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Started: {format(new Date(subscription.starts_at), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Expires: {format(expiresAt, "MMM d, yyyy")}</span>
        </div>
      </div>
    </motion.div>
  );
};
