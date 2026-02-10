import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, Circle, Folder, Shield, Users } from "lucide-react";

interface TourPreviewProps {
  stepId: string;
}

const TourPreview = ({ stepId }: TourPreviewProps) => {
  return (
    <div key={stepId} className="animate-fade-in rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
      {renderPreview(stepId)}
    </div>
  );
};

function renderPreview(id: string) {
  switch (id) {
    case "home":
      return <DashboardPreview />;
    case "profile":
      return <ProfilePreview />;
    case "readiness":
      return <ReadinessPreview />;
    case "report":
      return <ReportPreview />;
    case "vault":
      return <VaultPreview />;
    default:
      return null;
  }
}

/* ─── Dashboard ─── */
function DashboardPreview() {
  return (
    <div className="p-3 space-y-3">
      {/* Progress section */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Your Progress</p>
        <Progress value={42} className="h-2" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>42% complete</span>
          <span>~12 min left</span>
        </div>
      </div>
      {/* Journey nodes */}
      <div className="flex items-center gap-2 pt-1">
        {/* Completed */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground">Legal</span>
        </div>
        <div className="h-px w-4 bg-border" />
        {/* Current */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
            <Circle className="w-2.5 h-2.5 text-primary fill-primary" />
          </div>
          <span className="text-[10px] font-medium text-foreground">Financial</span>
        </div>
        <div className="h-px w-4 bg-border" />
        {/* Locked */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-3 h-3 text-muted-foreground/50" />
          </div>
          <span className="text-[10px] text-muted-foreground/50">Healthcare</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile ─── */
function ProfilePreview() {
  const areas = [
    { label: "Family", active: true },
    { label: "Pets", active: true },
    { label: "Home", active: true },
    { label: "Finances", active: false },
  ];
  return (
    <div className="p-3 space-y-3">
      {/* Life area chips */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Life Areas</p>
        <div className="flex flex-wrap gap-1.5">
          {areas.map((a) => (
            <span
              key={a.label}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                a.active
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {a.active && <Check className="w-2.5 h-2.5" />}
              {a.label}
            </span>
          ))}
        </div>
      </div>
      {/* Trust network */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Users className="w-3 h-3" /> Trust Network
        </p>
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[8px] font-bold text-primary">JD</div>
          <div className="w-6 h-6 rounded-full bg-accent/30 border-2 border-background -ml-1.5 flex items-center justify-center text-[8px] font-bold text-accent-foreground">SK</div>
          <span className="text-[10px] text-muted-foreground ml-1.5">+3 more</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Life Readiness ─── */
function ReadinessPreview() {
  const answers = [
    { label: "Yes", selected: false },
    { label: "Partially", selected: true },
    { label: "No", selected: false },
  ];
  return (
    <div className="p-3 space-y-2.5">
      <p className="text-xs font-display font-semibold text-foreground text-center leading-snug">
        Do you have a current will?
      </p>
      <div className="space-y-1.5">
        {answers.map((a) => (
          <div
            key={a.label}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-body text-center transition-colors ${
              a.selected
                ? "border-primary bg-primary/8 text-foreground font-medium"
                : "border-border/60 bg-card text-muted-foreground"
            }`}
          >
            {a.label}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">Question 3 of 8</p>
    </div>
  );
}

/* ─── Readiness Report ─── */
function ReportPreview() {
  const sections = [
    { label: "Key Strengths", color: "bg-green-500", width: "w-3/4" },
    { label: "Areas to Address", color: "bg-amber-500", width: "w-1/2" },
    { label: "Action Items", color: "bg-primary", width: "w-2/3" },
  ];
  return (
    <div className="p-3 space-y-3">
      {/* Score */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full border-[3px] border-primary flex items-center justify-center shrink-0">
          <span className="text-sm font-display font-bold text-primary">78</span>
        </div>
        <div>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
            Well Prepared
          </Badge>
          <p className="text-[10px] text-muted-foreground mt-0.5">Your Readiness Score</p>
        </div>
      </div>
      {/* Section bars */}
      <div className="space-y-1.5">
        {sections.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${s.color} shrink-0`} />
            <span className="text-[10px] text-muted-foreground w-20 shrink-0">{s.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${s.color}/60 ${s.width}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── EasyVault ─── */
function VaultPreview() {
  const categories = [
    { label: "Legal", count: "2/4", pct: 50 },
    { label: "Financial", count: "1/3", pct: 33 },
    { label: "Healthcare", count: "0/2", pct: 0 },
  ];
  return (
    <div className="p-3 space-y-2">
      {categories.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-foreground w-16 shrink-0">{c.label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/60 transition-all"
              style={{ width: `${c.pct}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-6 text-right">{c.count}</span>
        </div>
      ))}
      <div className="flex items-center gap-1 pt-1 justify-center">
        <Shield className="w-3 h-3 text-muted-foreground/60" />
        <span className="text-[9px] text-muted-foreground/60">Encrypted storage</span>
      </div>
    </div>
  );
}

export default TourPreview;
