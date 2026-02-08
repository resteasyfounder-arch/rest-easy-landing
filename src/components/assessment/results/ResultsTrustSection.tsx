import { Shield, Lock, Clock } from "lucide-react";

const ResultsTrustSection = () => {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground px-2.5 py-1.5 bg-muted/30 rounded-full">
        <Shield className="w-3.5 h-3.5" />
        <span className="text-xs font-body">Bank-level encryption</span>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground px-2.5 py-1.5 bg-muted/30 rounded-full">
        <Lock className="w-3.5 h-3.5" />
        <span className="text-xs font-body">Private & secure</span>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground px-2.5 py-1.5 bg-muted/30 rounded-full">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs font-body">~15 min to get started</span>
      </div>
    </div>
  );
};

export default ResultsTrustSection;
