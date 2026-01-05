import { Heart, Wallet, Smartphone, FileText, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    icon: Heart,
    label: "Healthcare Directives",
    description: "Medical wishes & proxy access",
    available: false,
  },
  {
    icon: Wallet,
    label: "Financial Access",
    description: "Bills, accounts & assets",
    available: false,
  },
  {
    icon: Smartphone,
    label: "Digital Legacy",
    description: "Devices, accounts & memories",
    available: false,
  },
  {
    icon: FileText,
    label: "Legal Documents",
    description: "Wills, trusts & powers of attorney",
    available: false,
  },
  {
    icon: Users,
    label: "Dependent Care",
    description: "Kids, pets & loved ones",
    available: false,
  },
];

const LifeReadinessTeaser = () => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Findability is just the beginning
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          The full Life Readiness Score goes deeper
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category, index) => (
          <div
            key={index}
            className={cn(
              "relative p-4 rounded-xl border bg-card transition-all",
              "border-border/50 hover:border-border hover:shadow-sm"
            )}
          >
            {/* Lock badge */}
            <div className="absolute top-2 right-2">
              <Lock className="w-3 h-3 text-muted-foreground/50" />
            </div>

            <category.icon className="w-6 h-6 text-primary/60 mb-2" />
            <h3 className="font-body font-medium text-sm text-foreground mb-1">
              {category.label}
            </h3>
            <p className="font-body text-xs text-muted-foreground">
              {category.description}
            </p>
          </div>
        ))}

        {/* CTA card */}
        <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-center">
          <p className="font-body text-sm font-medium text-primary">
            Unlock all categories
          </p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default LifeReadinessTeaser;
