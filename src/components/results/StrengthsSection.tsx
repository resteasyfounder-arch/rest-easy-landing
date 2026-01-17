import type { Strength } from "@/types/report";

interface StrengthsSectionProps {
  strengths: Strength[];
}

const StrengthsSection = ({ strengths }: StrengthsSectionProps) => {
  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">
        Areas of Strength
      </h2>
      <p className="font-body text-gray-600 mb-6">
        The following areas demonstrate your thoughtful preparation and provide a strong foundation:
      </p>
      
      <div className="space-y-6">
        {strengths.map((strength, index) => (
          <div key={index} className="print:break-inside-avoid">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-green-600">✓</span>
              {strength.title}
            </h3>
            <p className="font-body text-gray-700 leading-relaxed pl-6">
              {strength.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StrengthsSection;
