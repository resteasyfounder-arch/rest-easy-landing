import { CheckCircle2 } from "lucide-react";
import type { Strength } from "@/types/report";

interface StrengthsSectionProps {
  strengths: Strength[];
}

const StrengthsSection = ({ strengths }: StrengthsSectionProps) => {
  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        Your Strengths
      </h2>
      <p className="text-sm text-gray-600 font-body mb-4">
        Areas where you're well-prepared
      </p>
      <div className="space-y-3">
        {strengths.map((strength, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-green-50 border border-green-200"
          >
            <h3 className="font-body font-semibold text-gray-900 flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {strength.title}
            </h3>
            <p className="font-body text-sm text-gray-600 leading-relaxed pl-4">
              {strength.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrengthsSection;
