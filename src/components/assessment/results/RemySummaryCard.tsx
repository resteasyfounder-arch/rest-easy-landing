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
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      {/* Remy header */}
      <div className="flex items-center gap-3">
        <img
          src={remyAvatar}
          alt="Remy"
          className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
        />
        <div>
          <p className="font-display text-sm font-semibold text-foreground">Remy's Take</p>
          <p className="font-body text-xs text-muted-foreground">Your personal assessment summary</p>
        </div>
      </div>

      {/* Summary */}
      <p className="font-body text-sm text-foreground/90 leading-relaxed">
        {aiSummary.summary}
      </p>

      {/* Top priority */}
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
        <p className="font-body text-xs font-medium text-primary mb-1">Your #1 Priority</p>
        <p className="font-body text-sm text-foreground/80">
          {aiSummary.top_priority}
        </p>
      </div>

      {/* Encouragement */}
      <p className="font-body text-sm text-muted-foreground italic">
        {aiSummary.encouragement}
      </p>
    </div>
  );
};

export default RemySummaryCard;
