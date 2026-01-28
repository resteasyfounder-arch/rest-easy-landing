import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface UnlockTeaserCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  previewItems?: string[];
  showScorePreview?: boolean;
  className?: string;
}

const UnlockTeaserCard = ({
  title,
  description,
  icon: Icon,
  previewItems,
  showScorePreview = false,
  className,
}: UnlockTeaserCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden border-border/50 bg-gradient-to-br from-muted/30 to-muted/50",
      "group hover:border-primary/20 transition-colors duration-300",
      className
    )}>
      <CardContent className="p-6">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10 space-y-4">
          {/* Icon and title */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-medium text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            </div>
          </div>

          {/* Preview content */}
          <div className="mt-4">
            {showScorePreview ? (
              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <div className="text-5xl font-display font-bold text-primary/20 blur-[2px] select-none">
                    ??
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-2 border-dashed border-primary/30 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : previewItems ? (
              <div className="space-y-2 opacity-60">
                {previewItems.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="h-4 w-4 rounded border border-muted-foreground/30 flex-shrink-0" />
                    <span className="blur-[1px]">{item}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Reveal text */}
          <p className="text-xs text-center text-muted-foreground/70 pt-2 border-t border-border/50">
            Complete your assessment to unlock
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnlockTeaserCard;
