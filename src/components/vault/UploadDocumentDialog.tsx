import { useState, useCallback } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import type { VaultDocument } from "@/data/vaultDocuments";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: VaultDocument;
  categoryId: string;
  onUpload: (file: File, notes?: string) => void;
  isUploading: boolean;
}

const UploadDocumentDialog = ({
  open,
  onOpenChange,
  document,
  categoryId,
  onUpload,
  isUploading,
}: UploadDocumentDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptStr = document.acceptedFileTypes?.join(",") ?? ".pdf,.jpg,.png";
  const maxSize = 20 * 1024 * 1024;

  const validateFile = useCallback(
    (f: File) => {
      if (f.size > maxSize) {
        setError("File too large. Maximum size is 20MB.");
        return false;
      }
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (document.acceptedFileTypes && !document.acceptedFileTypes.includes(ext)) {
        setError(`File type not accepted. Allowed: ${document.acceptedFileTypes.join(", ")}`);
        return false;
      }
      setError(null);
      return true;
    },
    [document.acceptedFileTypes, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && validateFile(f)) setFile(f);
    },
    [validateFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleSubmit = () => {
    if (!file) return;
    onUpload(file, notes || undefined);
  };

  const reset = () => {
    setFile(null);
    setNotes("");
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload {document.name}</DialogTitle>
        </DialogHeader>

        {document.description && (
          <p className="text-sm text-muted-foreground">{document.description}</p>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onClick={() => {
            const input = window.document.getElementById("vault-file-input");
            input?.click();
          }}
        >
          <input
            id="vault-file-input"
            type="file"
            accept={acceptStr}
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Accepted: {document.acceptedFileTypes?.join(", ") ?? "PDF, JPG, PNG"} · Max 20MB
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Textarea
          placeholder="Optional notes about this document..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none"
          rows={2}
        />

        {isUploading && <Progress value={undefined} className="h-1.5" />}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
