import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttentionArea } from "@/types/report";

interface AttentionSectionProps {
  areas: AttentionArea[];
}

const AttentionSection = ({ areas }: AttentionSectionProps) => {
  // Sort by priority - PRIORITY first, then IMPORTANT
  const sortedAreas = [...areas].sort((a, b) => {
    if (a.priority === "PRIORITY" && b.priority !== "PRIORITY") return -1;
    if (a.priority !== "PRIORITY" && b.priority === "PRIORITY") return 1;
    return 0;
  });

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        Areas Requiring Attention
      </h2>
      <p className="text-sm text-gray-600 font-body mb-4">
        Focus areas to improve your readiness
      </p>
      <div className="space-y-3">
        {sortedAreas.map((area, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border",
              area.priority === "PRIORITY"
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "text-xs font-body font-bold px-2 py-1 rounded",
                  area.priority === "PRIORITY"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {area.priority}
              </span>
              <div className="flex-1">
                <h3 className="font-body font-semibold text-gray-900 mb-1">
                  {area.title}
                </h3>
                <p className="font-body text-sm text-gray-600 leading-relaxed">
                  {area.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttentionSection;
