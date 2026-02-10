import { Heart, Wallet, Shield, Smartphone, Users, Home, FileText, MapPin, Briefcase, Brain, Lock } from "lucide-react";

const categories = [
  { icon: Heart, label: "Healthcare Directives", desc: "Medical proxies and emergency contacts" },
  { icon: Wallet, label: "Financial Access", desc: "Bills, accounts, and authorized access" },
  { icon: Shield, label: "Legal Preparedness", desc: "Powers of attorney and guardianship" },
  { icon: Smartphone, label: "Digital Life", desc: "Device access and digital legacy" },
  { icon: Users, label: "Family Communication", desc: "Who knows what, and coordination plans" },
  { icon: Home, label: "Home & Property", desc: "Property access and household management" },
  { icon: FileText, label: "Insurance Coverage", desc: "Policy details and beneficiary info" },
  { icon: MapPin, label: "Emergency Contacts", desc: "Key people to reach urgently" },
  { icon: Briefcase, label: "Business Affairs", desc: "Continuity and succession planning" },
  { icon: Brain, label: "Mental Health & Care", desc: "Care preferences and support plans" },
  { icon: Users, label: "Dependents & Pets", desc: "Guardianship and daily routines" },
];

const previewCount = 6;

const LifeReadinessTeaser = () => {
  const previewCategories = categories.slice(0, previewCount);
  const lockedCount = categories.length - previewCount;

  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="font-display text-lg font-semibold text-foreground">
          This is just the beginning
        </h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          Findability is one of {categories.length} areas in your full Life Readiness Score. Here's what becomes easier once everything is in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {previewCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-2.5 px-3 py-3 rounded-xl bg-card border border-border text-left"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-body text-sm text-foreground font-medium leading-tight block">
                  {category.label}
                </span>
                <p className="font-body text-xs text-muted-foreground leading-snug mt-0.5">
                  {category.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked remaining */}
      <div className="flex items-center justify-center gap-2 py-2">
        <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
        <p className="font-body text-sm text-muted-foreground">
          <span className="font-medium">+{lockedCount} more categories</span> — unlocked with a free account
        </p>
      </div>
    </div>
  );
};

export default LifeReadinessTeaser;
