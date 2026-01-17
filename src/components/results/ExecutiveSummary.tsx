interface ExecutiveSummaryProps {
  summary: string;
}

const ExecutiveSummary = ({ summary }: ExecutiveSummaryProps) => {
  const paragraphs = summary.split('\n\n').filter(p => p.trim());

  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
        Executive Summary
      </h2>
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="font-body text-gray-700 leading-relaxed mb-5 last:mb-0 text-base">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
};

export default ExecutiveSummary;
