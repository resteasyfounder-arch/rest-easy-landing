import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface BentoCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
  span?: "default" | "wide";
}

const BentoCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
  span = "default",
}: BentoCardProps) => {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/50 bg-card p-5",
        "shadow-soft hover:shadow-card transition-all duration-300",
        "overflow-hidden",
        span === "wide" && "lg:col-span-2",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-medium text-foreground leading-tight">
            {title}
          </h3>
          <p className="font-body text-sm text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Demo Area */}
      <div
        className="relative rounded-xl bg-muted/30 overflow-hidden"
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
};

export default BentoCard;
