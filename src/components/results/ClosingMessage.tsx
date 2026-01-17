import { Heart } from "lucide-react";

interface ClosingMessageProps {
  message: string;
}

const ClosingMessage = ({ message }: ClosingMessageProps) => {
  // Split message into paragraphs
  const paragraphs = message.split('\n\n').filter(p => p.trim());

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        A Personal Note
      </h2>
      <div className="bg-gradient-to-br from-primary/5 to-rose-50 rounded-lg p-6 border border-primary/20">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="font-body text-gray-700 leading-relaxed mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ClosingMessage;
