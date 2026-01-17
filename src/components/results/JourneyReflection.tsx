import type { JourneyReflection as JourneyReflectionType } from "@/types/report";

interface JourneyReflectionProps {
  reflection: JourneyReflectionType;
  userName: string;
}

const JourneyReflection = ({ reflection, userName }: JourneyReflectionProps) => {
  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
        Understanding Your Planning Journey
      </h2>
      
      {/* Summary Narrative */}
      <div className="prose prose-lg max-w-none mb-10">
        {reflection.summary.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="font-body text-gray-700 leading-relaxed mb-5 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Strongest Area */}
      <div className="mb-8">
        <p className="font-body text-gray-700 leading-relaxed">
          <span className="font-semibold text-gray-900">Your strongest area, by far, is "{reflection.strongest_area.category}"</span> at an impressive {reflection.strongest_area.score}%. {reflection.strongest_area.insight}
        </p>
      </div>

      {/* Growth Areas */}
      {reflection.growth_areas && reflection.growth_areas.length > 0 && (
        <div className="mb-8">
          <p className="font-body text-gray-700 leading-relaxed mb-4">
            Now, let's look at areas where {userName} has the most opportunity for growth:
          </p>
          {reflection.growth_areas.map((area, idx) => (
            <p key={idx} className="font-body text-gray-700 leading-relaxed mb-3">
              Your "{area.category}" category currently stands at {area.score}%. {area.insight}
            </p>
          ))}
        </div>
      )}

      {/* Response Highlights */}
      {reflection.response_highlights && reflection.response_highlights.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-xl font-bold text-gray-900 mb-4">
            Reflecting on Your Responses
          </h3>
          <p className="font-body text-gray-600 mb-6">
            {userName}, your thoughtful responses to our questions have given us a clear picture of your current end-of-life preparedness journey.
          </p>
          {reflection.response_highlights.map((highlight, idx) => (
            <p key={idx} className="font-body text-gray-700 leading-relaxed mb-4">
              You indicated, "{highlight.question_context}" — {highlight.implication}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};

export default JourneyReflection;
