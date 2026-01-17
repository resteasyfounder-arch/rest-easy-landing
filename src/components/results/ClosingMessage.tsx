interface ClosingMessageProps {
  message: string;
}

const ClosingMessage = ({ message }: ClosingMessageProps) => {
  const paragraphs = message.split('\n\n').filter(p => p.trim());

  return (
    <section className="mb-12 print:break-inside-avoid">
      <div className="border-t-2 border-gray-200 pt-10">
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="font-body text-gray-700 leading-relaxed mb-5 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
        
        <p className="font-body text-gray-700 mt-8">
          Warmly,<br />
          <span className="font-semibold">Your Rest Easy Advisor</span>
        </p>
      </div>
    </section>
  );
};

export default ClosingMessage;
