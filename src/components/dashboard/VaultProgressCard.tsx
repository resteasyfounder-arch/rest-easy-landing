import { FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useVaultDocuments } from "@/hooks/useVaultDocuments";
import { totalDocumentCount } from "@/data/vaultDocuments";
import { cn } from "@/lib/utils";

interface VaultProgressCardProps {
  className?: string;
}

export function VaultProgressCard({ className }: VaultProgressCardProps) {
  const navigate = useNavigate();
  const { documents, excludedDocIds } = useVaultDocuments();

  const savedTypeIds = new Set(documents.map((d) => d.document_type_id));
  const completedCount = [...savedTypeIds].filter((id) => !excludedDocIds.has(id)).length;
  const applicableTotal = totalDocumentCount - excludedDocIds.size;
  const percentage = applicableTotal > 0 ? Math.round((completedCount / applicableTotal) * 100) : 0;

  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display font-semibold text-foreground">Easy Vault</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Documents</span>
            <span className="font-medium text-foreground">
              {completedCount}/{applicableTotal}
            </span>
          </div>
          <Progress value={percentage} className="h-2 bg-muted" />
          <p className="text-xs text-muted-foreground">{percentage}% complete</p>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate("/vault")}
        >
          Go to Vault
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default VaultProgressCard;
