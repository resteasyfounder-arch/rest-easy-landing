import { ArrowRight } from "lucide-react";

interface MovingForwardProps {
  content: string;
  userName: string;
}

const MovingForward = ({ content, userName }: MovingForwardProps) => {
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ArrowRight className="h-5 w-5 text-primary" />
        Moving Forward: {userName}'s Guide
      </h2>
      
      <div className="bg-gradient-to-br from-primary/5 to-white rounded-xl border border-primary/20 p-6">
        <div className="prose prose-sm max-w-none">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="font-body text-gray-700 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovingForward;
