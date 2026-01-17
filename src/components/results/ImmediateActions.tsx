import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import type { ImmediateAction } from "@/types/report";

interface ImmediateActionsProps {
  actions: ImmediateAction[];
}

const ImmediateActions = ({ actions }: ImmediateActionsProps) => {
  // Sort by priority
  const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Zap className="h-5 w-5 text-amber-600" />
          Immediate Actions
        </CardTitle>
        <p className="text-sm text-muted-foreground font-body">
          Your top priorities to address this week
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedActions.map((action, index) => (
          <div
            key={index}
            className="flex gap-3 p-3 rounded-lg bg-background/60 border border-border/50"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="font-display text-sm font-bold text-amber-700">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-body font-semibold text-sm text-foreground">
                {action.title}
              </h4>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                {action.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ImmediateActions;
