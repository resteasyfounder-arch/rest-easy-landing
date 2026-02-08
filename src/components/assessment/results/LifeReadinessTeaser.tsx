import { Heart, Wallet, Lock, Brain, Shield, Smartphone, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const categories = [
  { icon: Heart, label: "Healthcare Directives", desc: "Medical proxies, advance directives, and emergency contacts" },
  { icon: Wallet, label: "Financial Access", desc: "Bills, accounts, and authorized access for your person" },
  { icon: Shield, label: "Legal Preparedness", desc: "Powers of attorney, wills, and guardianship plans" },
  { icon: Smartphone, label: "Digital Life", desc: "Device access, online accounts, and digital legacy" },
  { icon: Users, label: "Family Communication", desc: "Who knows what, and how to coordinate in a crisis" },
];

const LifeReadinessTeaser = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-base font-semibold text-foreground">
            Findability is just the beginning
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            Your full Life Readiness Score covers 5 categories — with Remy guiding you through each one
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/30 border border-border/40"
            >
              <Lock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-body text-sm text-foreground/80 font-medium">
                  {category.label}
                </span>
                <p className="font-body text-xs text-muted-foreground leading-snug">
                  {category.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/login")}
        className="w-full font-body text-primary border-primary/30 hover:bg-primary/5 gap-1"
      >
        See Your Full Score
      </Button>
    </div>
  );
};

export default LifeReadinessTeaser;
