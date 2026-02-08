import { Heart, Wallet, Lock, Brain } from "lucide-react";

const categories = [
  { icon: Heart, label: "Healthcare Directives" },
  { icon: Wallet, label: "Financial Access" },
];

const LifeReadinessTeaser = () => {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-base font-semibold text-foreground">
            Findability is step one
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            Your full Life Readiness Score covers 5 categories — with Remy guiding you through each one
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 border border-border/50"
          >
            <Lock className="w-3 h-3 text-muted-foreground/60" />
            <span className="font-body text-xs text-muted-foreground">
              {category.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Brain className="w-3 h-3 text-primary" />
          <span className="font-body text-xs text-primary font-medium">
            +3 more with Remy
          </span>
        </div>
      </div>
    </div>
  );
};

export default LifeReadinessTeaser;
