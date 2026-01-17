import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ExecutiveSummaryProps {
  summary: string;
}

const ExecutiveSummary = ({ summary }: ExecutiveSummaryProps) => {
  // Split summary into paragraphs
  const paragraphs = summary.split('\n\n').filter(p => p.trim());

  return (
    <Card className="border-primary/20 bg-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="font-body text-sm leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExecutiveSummary;
