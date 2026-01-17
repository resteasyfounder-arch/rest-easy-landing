import type { AttentionArea } from "@/types/report";

interface AttentionSectionProps {
  areas: AttentionArea[];
}

const AttentionSection = ({ areas }: AttentionSectionProps) => {
  const sortedAreas = [...areas].sort((a, b) => {
    if (a.priority === "PRIORITY" && b.priority !== "PRIORITY") return -1;
    if (a.priority !== "PRIORITY" && b.priority === "PRIORITY") return 1;
    return 0;
  });

  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">
        Areas Requiring Attention
      </h2>
      <p className="font-body text-gray-600 mb-6">
        The following areas present opportunities for improvement:
      </p>
      
      <div className="space-y-6">
        {sortedAreas.map((area, index) => (
          <div key={index} className="print:break-inside-avoid">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">
              <span className="text-amber-600">⚠</span>{" "}
              {area.title}{" "}
              <span className="text-sm font-body font-normal text-gray-500">
                ({area.priority})
              </span>
            </h3>
            <p className="font-body text-gray-700 leading-relaxed pl-6">
              {area.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AttentionSection;
