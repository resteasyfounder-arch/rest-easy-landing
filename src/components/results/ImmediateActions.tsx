import type { ImmediateAction } from "@/types/report";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImmediateActionsProps {
  actions: ImmediateAction[];
}

const ImmediateActions = ({ actions }: ImmediateActionsProps) => {
  const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

  return (
    <section className="break-inside-avoid">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Top 3 Recommended Actions
        </h2>
      </div>

      <div className="space-y-4">
        {sortedActions.map((action, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row gap-5 p-6 rounded-xl bg-card border border-border/40 hover:border-primary/20 transition-all shadow-sm group"
          >
            {/* Number */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold shadow-soft group-hover:scale-110 transition-transform">
                {index + 1}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {action.description}
              </p>
            </div>

            {/* Action (Optional, if we had a link) */}
            <div className="flex-shrink-0 pt-1">
              <Button variant="ghost" size="sm" className="hidden sm:flex group-hover:bg-primary/5">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImmediateActions;
