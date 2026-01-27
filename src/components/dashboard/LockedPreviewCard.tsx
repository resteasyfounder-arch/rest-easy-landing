import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface LockedPreviewCardProps {
  title: string;
  description: string;
  previewContent?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function LockedPreviewCard({
  title,
  description,
  previewContent,
  icon: Icon = Lock,
  className,
}: LockedPreviewCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border-border/50 bg-muted/30",
      className
    )}>
      <CardContent className="p-6">
        {/* Blurred preview content */}
        {previewContent && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-sm pointer-events-none">
            {previewContent}
          </div>
        )}
        
        {/* Lock overlay */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-display font-medium text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LockedPreviewCard;
