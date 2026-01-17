import { cn } from "@/lib/utils";
import type { CategoryAnalysis } from "@/types/report";

interface CategoryScoresProps {
  categories: CategoryAnalysis[];
}

const CategoryScores = ({ categories }: CategoryScoresProps) => {
  const sortedCategories = [...categories].sort((a, b) => b.score - a.score);

  const normalizeScore = (score: number) => {
    return score <= 1 ? Math.round(score * 100) : Math.round(score);
  };

  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
        Assessment Results by Category
      </h2>
      
      {/* Score Table */}
      <div className="mb-10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left font-display font-semibold text-gray-900 py-3 pr-4">Category</th>
              <th className="text-right font-display font-semibold text-gray-900 py-3 w-20">Score</th>
              <th className="text-left font-display font-semibold text-gray-900 py-3 pl-4 w-1/3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((category) => {
              const score = normalizeScore(category.score);
              return (
                <tr key={category.section_id} className="border-b border-gray-100">
                  <td className="font-body text-gray-700 py-3 pr-4">{category.section_label}</td>
                  <td className="text-right font-body font-semibold text-gray-900 py-3">{score}%</td>
                  <td className="py-3 pl-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          score >= 80 ? "bg-green-500" :
                          score >= 60 ? "bg-emerald-500" :
                          score >= 40 ? "bg-amber-500" : "bg-red-400"
                        )}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detailed Analysis */}
      <h3 className="font-display text-xl font-bold text-gray-900 mb-6">
        Detailed Category Analysis
      </h3>
      <div className="space-y-8">
        {sortedCategories.map((category) => (
          <div key={category.section_id} className="print:break-inside-avoid">
            <h4 className="font-display text-lg font-semibold text-gray-900 mb-2">
              {category.section_label}
            </h4>
            <p className="font-body text-gray-700 leading-relaxed">
              {category.analysis}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryScores;
