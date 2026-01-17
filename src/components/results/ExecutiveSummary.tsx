interface ExecutiveSummaryProps {
  summary: string;
}

const ExecutiveSummary = ({ summary }: ExecutiveSummaryProps) => {
  // Split summary into paragraphs
  const paragraphs = summary.split('\n\n').filter(p => p.trim());

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-primary rounded-full" />
        Executive Summary
      </h2>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="font-body text-gray-700 leading-relaxed mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveSummary;
