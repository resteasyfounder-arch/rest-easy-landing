import remyAvatar from "@/assets/remy-avatar.png";

interface AiSummary {
  summary: string;
  top_priority: string;
  encouragement: string;
}

interface RemySummaryCardProps {
  aiSummary: AiSummary;
}

const RemySummaryCard = ({ aiSummary }: RemySummaryCardProps) => {
  return (
    <div className="bg-primary/[0.03] rounded-2xl border border-primary/10 p-6 md:p-8 space-y-4">
      {/* Remy header */}
      <div className="flex items-center gap-3">
        <img
          src={remyAvatar}
          alt="Remy"
          className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
        />
        <p className="font-display text-sm font-semibold text-foreground">Remy's Take</p>
      </div>

      {/* Merged summary + encouragement */}
      <p className="font-body text-sm text-foreground/85 leading-relaxed">
        {aiSummary.summary} {aiSummary.encouragement}
      </p>

      {/* Focus area */}
      <div className="bg-card rounded-xl p-3.5 border border-border">
        <p className="font-body text-xs font-medium text-muted-foreground mb-1">Where to focus first</p>
        <p className="font-body text-sm text-foreground/80">
          {aiSummary.top_priority}
        </p>
      </div>
    </div>
  );
};

export default RemySummaryCard;
