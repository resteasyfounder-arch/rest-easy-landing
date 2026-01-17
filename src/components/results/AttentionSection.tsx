import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttentionArea } from "@/types/report";

interface AttentionSectionProps {
  areas: AttentionArea[];
}

const AttentionSection = ({ areas }: AttentionSectionProps) => {
  // Sort by priority - PRIORITY first, then IMPORTANT
  const sortedAreas = [...areas].sort((a, b) => {
    if (a.priority === "PRIORITY" && b.priority !== "PRIORITY") return -1;
    if (a.priority !== "PRIORITY" && b.priority === "PRIORITY") return 1;
    return 0;
  });

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-red-500/5 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Areas Requiring Attention
        </CardTitle>
        <p className="text-sm text-muted-foreground font-body">
          Focus areas to improve your readiness
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {sortedAreas.map((area, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                area.priority === "PRIORITY"
                  ? "bg-red-500/5 border-red-500/30"
                  : "bg-background/60 border-amber-500/20"
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "text-[10px] font-body font-bold px-1.5 py-0.5 rounded",
                    area.priority === "PRIORITY"
                      ? "bg-red-500/20 text-red-700"
                      : "bg-amber-500/20 text-amber-700"
                  )}
                >
                  {area.priority}
                </span>
                <div className="flex-1">
                  <h4 className="font-body font-semibold text-sm text-foreground">
                    {area.title}
                  </h4>
                  <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttentionSection;
