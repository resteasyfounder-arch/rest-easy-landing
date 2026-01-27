import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vault, Folder, Lock, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface VaultCategory {
  name: string;
  count: number;
}

interface VaultPreviewCardProps {
  onPreview?: () => void;
  className?: string;
}

const defaultCategories: VaultCategory[] = [
  { name: "Legal", count: 0 },
  { name: "Financial", count: 0 },
  { name: "Health", count: 0 },
];

export function VaultPreviewCard({ onPreview, className }: VaultPreviewCardProps) {
  return (
    <Card className={cn(
      "border-border/50 bg-gradient-to-br from-amber-50/30 via-background to-amber-100/10 dark:from-amber-950/20 dark:to-amber-900/10",
      className
    )}>
      <CardContent className="p-6 space-y-4">
        {/* Header with Coming Soon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Vault className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-display font-semibold text-foreground">Easy Vault</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-muted/80">
            Coming Soon
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          Securely store documents your family may need.
        </p>

        {/* Document categories */}
        <div className="space-y-2.5">
          {defaultCategories.map((category) => (
            <div
              key={category.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-2.5">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.count} docs
                </span>
              </div>
              <Button size="sm" variant="ghost" disabled className="h-7 gap-1 text-muted-foreground">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
          <Lock className="h-3 w-3" />
          <span>Encrypted and user-controlled</span>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onPreview}
          disabled
        >
          Preview Vault
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default VaultPreviewCard;
