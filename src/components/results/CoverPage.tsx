import type { ReportTier, ReportMetrics } from "@/types/report";
import restEasyLogo from "@/assets/rest-easy-logo.png";

interface CoverPageProps {
  score: number;
  tier: ReportTier;
  userName: string;
  generatedAt: string;
  metrics: ReportMetrics;
}

const getTierGradient = (tier: ReportTier): string => {
  switch (tier) {
    case "Rest Easy Ready":
      return "from-green-600 to-green-500";
    case "Well Prepared":
      return "from-emerald-600 to-emerald-500";
    case "On Your Way":
      return "from-amber-600 to-amber-500";
    case "Getting Started":
      return "from-orange-600 to-orange-500";
    default:
      return "from-primary to-primary/80";
  }
};

const CoverPage = ({ score, tier, userName, generatedAt, metrics }: CoverPageProps) => {
  const formattedDate = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl overflow-hidden print:rounded-none print:min-h-[90vh] mb-8">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex justify-center">
        <img src={restEasyLogo} alt="Rest Easy" className="h-12 object-contain" />
      </div>

      {/* Main Content */}
      <div className="px-8 py-12 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          End-of-Life Readiness Report
        </h1>
        <p className="text-slate-300 text-lg font-body">
          A Comprehensive Assessment of Your Preparedness
        </p>

        <div className="mt-8 mb-10">
          <p className="text-slate-400 text-sm font-body uppercase tracking-wider">
            Prepared for
          </p>
          <p className="text-2xl font-display font-semibold mt-1">{userName}</p>
          <p className="text-slate-400 text-sm font-body mt-2">{formattedDate}</p>
        </div>

        {/* Score Circle */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${getTierGradient(tier)} flex flex-col items-center justify-center shadow-2xl`}>
              <span className="text-5xl font-display font-bold">{score}</span>
              <span className="text-sm font-body uppercase tracking-wider opacity-90">
                Overall Score
              </span>
            </div>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="inline-block bg-white/10 backdrop-blur rounded-full px-6 py-2 mb-10">
          <span className="font-display font-semibold text-lg">{tier}</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <MetricCard label="Categories Assessed" value={metrics.categoriesAssessed} />
          <MetricCard label="Strengths Identified" value={metrics.strengthsIdentified} />
          <MetricCard label="Areas to Address" value={metrics.areasToAddress} />
          <MetricCard label="Action Items" value={metrics.actionItems} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-white/5 rounded-lg p-4 text-center">
    <span className="text-2xl font-display font-bold text-white">{value}</span>
    <p className="text-xs font-body text-slate-400 mt-1">{label}</p>
  </div>
);

export default CoverPage;
