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
    { title: "Closing Message", page: "10" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 print:break-inside-avoid">
      <p className="text-sm text-gray-500 font-body mb-2">
        This report contains personal information about your end-of-life planning status and is intended solely for your use.
      </p>
      
      <h2 className="font-display text-xl font-bold text-gray-900 mt-6 mb-4">
        Table of Contents
      </h2>
      
      <div className="space-y-2">
        {sections.map((section, index) => (
          <div key={index} className="flex items-end gap-2">
            <span className="font-body text-gray-700">{section.title}</span>
            <span className="flex-1 border-b border-dotted border-gray-300 mb-1" />
            <span className="text-gray-400 font-body text-sm">{section.page}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOfContents;
