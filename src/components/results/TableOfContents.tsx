const TableOfContents = () => {
  const sections = [
    { title: "Executive Summary", page: "1" },
    { title: "Recommended Immediate Actions", page: "2" },
    { title: "Assessment Results by Category", page: "3" },
    { title: "Areas of Strength", page: "4" },
    { title: "Areas Requiring Attention", page: "5" },
    { title: "Personalized Action Plan", page: "6" },
    { title: "Understanding Your Planning Journey", page: "7" },
    { title: "Practical Timeline", page: "8" },
    { title: "Moving Forward", page: "9" },
    { title: "Resources and Support", page: "10" },
  ];

  return (
    <div className="mb-12 print:break-inside-avoid print:mb-16">
      <p className="text-sm text-gray-500 font-body italic mb-8 text-center">
        This report contains personal information about your end-of-life planning status and is intended solely for your use.
      </p>
      
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
        Table of Contents
      </h2>
      
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={index} className="flex items-end gap-2">
            <span className="font-body text-gray-700">{section.title}</span>
            <span className="flex-1 border-b border-dotted border-gray-300 mb-1.5" />
            <span className="text-gray-400 font-body text-sm tabular-nums">{section.page}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOfContents;
