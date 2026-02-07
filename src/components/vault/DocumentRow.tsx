import { Circle, CheckCircle2, ExternalLink, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VaultDocument } from "@/data/vaultDocuments";

interface DocumentRowProps {
  document: VaultDocument;
  isUploaded?: boolean;
  uploadedDate?: string;
}

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

const DocumentRow = ({ document, isUploaded = false, uploadedDate }: DocumentRowProps) => {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted/30 transition-colors group">
      {isUploaded ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isUploaded ? "text-foreground" : "text-foreground/80"}`}>
            {document.name}
          </span>
          {document.hasExternalLink && (
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {document.priority === "high" && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityStyles.high}`}>
              high
            </Badge>
          )}
          {document.priority === "medium" && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityStyles.medium}`}>
              medium
            </Badge>
          )}
        </div>
        {!isUploaded && (
          <p className="text-xs text-amber-600 mt-0.5">Missing — add a document with this information</p>
        )}
        {isUploaded && uploadedDate && (
          <p className="text-xs text-muted-foreground mt-0.5">Uploaded {uploadedDate}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Upload ${document.name}`}
      >
        <Upload className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
};

export default DocumentRow;
