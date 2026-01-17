import type { ReportTier, ReportMetrics } from "@/types/report";
import restEasyLogo from "@/assets/rest-easy-logo.png";

interface CoverPageProps {
  score: number;
  tier: ReportTier;
  userName: string;
  generatedAt: string;
  metrics: ReportMetrics;
}

const getTierColor = (tier: ReportTier): string => {
  switch (tier) {
    case "Rest Easy Ready":
      return "text-green-600";
    case "Well Prepared":
      return "text-emerald-600";
    case "On Your Way":
      return "text-amber-600";
    case "Getting Started":
      return "text-orange-600";
    default:
      return "text-primary";
  }
};

const CoverPage = ({ score, tier, userName, generatedAt, metrics }: CoverPageProps) => {
  const formattedDate = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center py-16 border-b-2 border-gray-200 mb-12 print:py-24 print:mb-16">
      {/* Logo */}
      <img src={restEasyLogo} alt="Rest Easy" className="h-16 mx-auto mb-8 print:h-20" />

      {/* Title */}
      <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-3 print:text-5xl">
        End-of-Life Readiness Report
      </h1>
      <p className="font-body text-xl text-gray-500 mb-12 print:text-2xl">
        A Comprehensive Assessment of Your Preparedness
      </p>

      {/* Prepared For */}
      <div className="mb-12">
        <p className="text-sm text-gray-400 uppercase tracking-widest font-body mb-2">
          Prepared for
        </p>
        <p className="font-display text-3xl font-semibold text-gray-900">{userName}</p>
        <p className="text-gray-500 font-body mt-2">{formattedDate}</p>
      </div>

      {/* Score */}
      <div className="inline-flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-36 h-36 rounded-full border-8 border-gray-100 flex flex-col items-center justify-center print:w-40 print:h-40">
            <span className="text-6xl font-display font-bold text-gray-900 print:text-7xl">{score}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-body">
              Overall Score
            </span>
          </div>
        </div>
        <p className={`font-display text-2xl font-semibold mt-4 ${getTierColor(tier)}`}>
          {tier}
        </p>
      </div>

      {/* Metrics */}
      <div className="flex justify-center gap-8 md:gap-12 mt-8 flex-wrap">
        <MetricItem label="Categories Assessed" value={metrics.categoriesAssessed} />
        <MetricItem label="Strengths Identified" value={metrics.strengthsIdentified} />
        <MetricItem label="Areas to Address" value={metrics.areasToAddress} />
        <MetricItem label="Action Items" value={metrics.actionItems} />
      </div>
    </div>
  );
};

const MetricItem = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center">
    <span className="text-3xl font-display font-bold text-gray-900">{value}</span>
    <p className="text-xs text-gray-500 font-body mt-1">{label}</p>
  </div>
);

export default CoverPage;
