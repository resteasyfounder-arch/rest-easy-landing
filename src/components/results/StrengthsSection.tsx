import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type { Strength } from "@/types/report";

interface StrengthsSectionProps {
  strengths: Strength[];
}

const StrengthsSection = ({ strengths }: StrengthsSectionProps) => {
  return (
    <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Your Strengths
        </CardTitle>
        <p className="text-sm text-muted-foreground font-body">
          Areas where you're well-prepared
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {strengths.map((strength, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-background/60 border border-green-500/20"
            >
              <h4 className="font-body font-semibold text-sm text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {strength.title}
              </h4>
              <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed pl-3.5">
                {strength.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrengthsSection;
