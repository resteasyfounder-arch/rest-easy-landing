import { cn } from "@/lib/utils";
import { Shield, TrendingUp, Award, Star } from "lucide-react";
import type { ScoreTier } from "@/types/assessment";

interface TierBadgeProps {
  tier: ScoreTier;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const tierConfig: Record<ScoreTier, {
  icon: typeof Shield;
  bgClass: string;
  textClass: string;
}> = {
  "Getting Started": {
    icon: Shield,
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-600",
  },
  "On Your Way": {
    icon: TrendingUp,
    bgClass: "bg-yellow-500/10",
    textClass: "text-yellow-600",
  },
  "Well Prepared": {
    icon: Award,
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-600",
  },
  "Rest Easy Ready": {
    icon: Star,
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-3 py-1 text-sm gap-1.5",
  lg: "px-4 py-1.5 text-base gap-2",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function TierBadge({ tier, size = "md", className }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center rounded-full font-medium",
      config.bgClass,
      config.textClass,
      sizeClasses[size],
      className
    )}>
      <Icon className={iconSizes[size]} />
      <span>{tier}</span>
    </div>
  );
}

export default TierBadge;
