import { Loader2 } from "lucide-react";

const ReportLoading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-semibold text-gray-900">
            Loading Your Report
          </h2>
          <p className="font-body text-sm text-gray-600">
            Please wait while we retrieve your personalized readiness report...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportLoading;
