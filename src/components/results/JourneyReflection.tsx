import { Compass, TrendingUp, TrendingDown, Quote } from "lucide-react";
import type { JourneyReflection as JourneyReflectionType } from "@/types/report";

interface JourneyReflectionProps {
  reflection: JourneyReflectionType;
  userName: string;
}

const JourneyReflection = ({ reflection, userName }: JourneyReflectionProps) => {
  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Compass className="h-5 w-5 text-primary" />
        Understanding Your Planning Journey
      </h2>
      
      {/* Summary Narrative */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="prose prose-sm max-w-none">
          {reflection.summary.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="font-body text-gray-700 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Strongest Area */}
      <div className="bg-green-50 rounded-xl border border-green-200 p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-green-800 mb-1">
              Your Strongest Area: {reflection.strongest_area.category}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-display font-bold text-green-600">
                {reflection.strongest_area.score}%
              </span>
            </div>
            <p className="font-body text-green-700 leading-relaxed">
              {reflection.strongest_area.insight}
            </p>
          </div>
        </div>
      </div>

      {/* Growth Areas */}
      {reflection.growth_areas && reflection.growth_areas.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 mb-6">
          <h3 className="font-display font-bold text-amber-800 mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-600" />
            Opportunities for Growth
          </h3>
          <div className="space-y-4">
            {reflection.growth_areas.map((area, idx) => (
              <div key={idx} className="border-l-4 border-amber-400 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-bold text-amber-900">
                    {area.category}
                  </span>
                  <span className="text-sm font-body text-amber-600">
                    ({area.score}%)
                  </span>
                </div>
                <p className="font-body text-amber-800 text-sm leading-relaxed">
                  {area.insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Highlights */}
      {reflection.response_highlights && reflection.response_highlights.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Quote className="h-5 w-5 text-primary" />
            Reflecting on Your Responses
          </h3>
          <div className="space-y-4">
            {reflection.response_highlights.map((highlight, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <p className="font-body text-gray-600 text-sm italic mb-2">
                  "{highlight.question_context}"
                </p>
                <p className="font-body text-gray-800 text-sm">
                  → {highlight.implication}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyReflection;
