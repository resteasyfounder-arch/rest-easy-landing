import { Circle, CheckCircle2, ExternalLink, Upload, Pencil, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VaultDocument } from "@/data/vaultDocuments";
import type { VaultDocumentRow } from "@/hooks/useVaultDocuments";

interface DocumentRowProps {
  document: VaultDocument;
  savedDoc?: VaultDocumentRow;
  onUpload: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

const DocumentRow = ({ document, savedDoc, onUpload, onEdit, onDownload, onDelete }: DocumentRowProps) => {
  const isCompleted = !!savedDoc;
  const isInline = document.inputMethod === "inline";

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted/30 transition-colors group">
      {isCompleted ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-foreground/80"}`}>
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
        {!isCompleted && (
          <p className="text-xs text-amber-600 mt-0.5">Missing — {isInline ? "create this document" : "add a document with this information"}</p>
        )}
        {isCompleted && savedDoc.file_name && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {savedDoc.file_name} · Uploaded {new Date(savedDoc.created_at).toLocaleDateString()}
          </p>
        )}
        {isCompleted && isInline && !savedDoc.file_name && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Last edited {new Date(savedDoc.updated_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isCompleted ? (
          <>
            {savedDoc.storage_path && (
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download" onClick={onDownload}>
                <Download className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {isInline && (
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit" onClick={onEdit}>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive/70" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={isInline ? `Create ${document.name}` : `Upload ${document.name}`}
            onClick={isInline ? onEdit : onUpload}
          >
            {isInline ? <Pencil className="h-4 w-4 text-muted-foreground" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentRow;
