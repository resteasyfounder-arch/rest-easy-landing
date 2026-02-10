import { Heart, Wallet, Lock, Brain, Shield, Smartphone, Users, Home, FileText, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const categories = [
  { icon: Heart, label: "Healthcare Directives", desc: "Medical proxies, advance directives, and emergency contacts" },
  { icon: Wallet, label: "Financial Access", desc: "Bills, accounts, and authorized access for your person" },
  { icon: Shield, label: "Legal Preparedness", desc: "Powers of attorney, wills, and guardianship plans" },
  { icon: Smartphone, label: "Digital Life", desc: "Device access, online accounts, and digital legacy" },
  { icon: Users, label: "Family Communication", desc: "Who knows what, and how to coordinate in a crisis" },
  { icon: Home, label: "Home & Property", desc: "Property access, maintenance, and household management" },
  { icon: FileText, label: "Insurance Coverage", desc: "Policy details, claims contacts, and beneficiary info" },
  { icon: MapPin, label: "Emergency Contacts", desc: "Key people to reach in an urgent situation" },
  { icon: Briefcase, label: "Business Affairs", desc: "Business continuity, partnerships, and succession" },
  { icon: Brain, label: "Mental Health & Care", desc: "Care preferences, therapist contacts, and support plans" },
  { icon: Users, label: "Dependents & Pets", desc: "Guardianship plans, pet care, and daily routines" },
];

const previewCount = 4;

const LifeReadinessTeaser = () => {
  const navigate = useNavigate();
  const previewCategories = categories.slice(0, previewCount);
  const lockedCount = categories.length - previewCount;

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
            Your full Life Readiness Score covers {categories.length} categories — with Remy guiding you through each one
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {previewCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/30 border border-border/40"
            >
              <Icon className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
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

        {/* Locked remaining categories */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/20 border border-dashed border-border/40">
          <Lock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
          <p className="font-body text-sm text-muted-foreground">
            <span className="font-medium">+{lockedCount} more categories</span> unlocked when you create an account
          </p>
        </div>
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
