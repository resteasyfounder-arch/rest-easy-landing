import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VaultProgressProps {
  completedCount: number;
  applicableTotal: number;
}

const VaultProgress = ({ completedCount, applicableTotal }: VaultProgressProps) => {
  const percentage = applicableTotal > 0
    ? Math.round((completedCount / applicableTotal) * 100)
    : 0;

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Essential Documents</h2>
              <p className="text-sm text-muted-foreground">Track and organize your important documents</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">{completedCount}</span>
            <span className="text-muted-foreground">/{applicableTotal}</span>
            <p className="text-xs text-muted-foreground">completed</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium text-foreground">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2 bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
};

export default VaultProgress;
