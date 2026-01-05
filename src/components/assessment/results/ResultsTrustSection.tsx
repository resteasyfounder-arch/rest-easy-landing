import { Shield, Lock, Clock } from "lucide-react";

const stats = [
  {
    icon: Shield,
    stat: "87%",
    label: "discover at least one blind spot",
  },
  {
    icon: Clock,
    stat: "15 min",
    label: "average per rescue mission",
  },
  {
    icon: Lock,
    stat: "100%",
    label: "private & secure",
  },
];

const ResultsTrustSection = () => {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((item, index) => (
          <div
            key={index}
            className="text-center p-3 rounded-xl bg-muted/30 border border-border/50"
          >
            <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-display text-lg font-bold text-foreground">
              {item.stat}
            </p>
            <p className="font-body text-xs text-muted-foreground leading-tight">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-body">Bank-level encryption</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-body">Your data stays yours</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsTrustSection;
