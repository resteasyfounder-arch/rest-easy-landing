import { Loader2, Sparkles } from "lucide-react";

const ReportLoading = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
      
      <div className="mt-8 space-y-3 max-w-sm">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Generating Your Report
        </h2>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          Our AI is analyzing your responses to create a personalized action plan. 
          This usually takes about 15-30 seconds.
        </p>
      </div>
      
      <div className="mt-8 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};

export default ReportLoading;
