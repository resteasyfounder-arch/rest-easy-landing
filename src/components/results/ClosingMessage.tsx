import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface ClosingMessageProps {
  message: string;
}

const ClosingMessage = ({ message }: ClosingMessageProps) => {
  // Split message into paragraphs
  const paragraphs = message.split('\n\n').filter(p => p.trim());

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Heart className="h-5 w-5 text-primary" />
          A Message From Rest Easy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="font-body text-sm leading-relaxed text-foreground/90 italic">
            {paragraph}
          </p>
        ))}
        <div className="pt-2 text-right">
          <p className="font-display text-sm text-primary font-medium">
            — The Rest Easy Team
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClosingMessage;
