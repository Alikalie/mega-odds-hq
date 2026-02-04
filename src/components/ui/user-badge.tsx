import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "free" | "vip" | "special" | "pending" | "approved" | "blocked";
  className?: string;
}

const variantStyles = {
  free: "bg-secondary text-secondary-foreground",
  vip: "bg-vip/20 text-vip",
  special: "bg-special/20 text-special",
  pending: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  blocked: "bg-destructive/20 text-destructive",
};

const variantLabels = {
  free: "Free",
  vip: "VIP",
  special: "Special",
  pending: "Pending",
  approved: "Approved",
  blocked: "Blocked",
};

export const UserBadge = ({ variant, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {variantLabels[variant]}
    </span>
  );
};
