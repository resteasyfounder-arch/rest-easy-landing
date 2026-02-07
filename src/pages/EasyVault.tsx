import { useState, useMemo, useCallback } from "react";
import { Info } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from "@/components/layout/AppLayout";
import { VaultProgress, DocumentCategory, TrustNetworkPanel, VaultPaywall } from "@/components/vault";
import UploadDocumentDialog from "@/components/vault/UploadDocumentDialog";
import InlineDocumentEditor from "@/components/vault/InlineDocumentEditor";
import { vaultCategories, totalDocumentCount } from "@/data/vaultDocuments";
import { useVaultDocuments } from "@/hooks/useVaultDocuments";
import type { VaultDocument } from "@/data/vaultDocuments";

// Helper to find a document definition by type ID
function findDocDef(typeId: string): { doc: VaultDocument; categoryId: string } | null {
  for (const cat of vaultCategories) {
    const doc = cat.documents.find((d) => d.id === typeId);
    if (doc) return { doc, categoryId: cat.id };
  }
  return null;
}

const EasyVault = () => {
  const isPaidUser = true;
  const { documents, isLoading, excludedDocIds, upload, saveInline, remove, download, markNotApplicable, unmarkNotApplicable } = useVaultDocuments();

  // Map document_type_id → saved row for fast lookup
  const savedDocsMap = useMemo(() => {
    const map = new Map<string, (typeof documents)[0]>();
    for (const d of documents) {
      map.set(d.document_type_id, d);
    }
    return map;
  }, [documents]);

  const completedCount = [...savedDocsMap.keys()].filter((id) => !excludedDocIds.has(id)).length;
  const applicableTotal = totalDocumentCount - excludedDocIds.size;

  // Upload dialog state
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const uploadDef = uploadTarget ? findDocDef(uploadTarget) : null;

  // Inline editor state
  const [inlineTarget, setInlineTarget] = useState<string | null>(null);
  const inlineDef = inlineTarget ? findDocDef(inlineTarget) : null;
  const existingInline = inlineTarget ? savedDocsMap.get(inlineTarget) : undefined;

  const handleUpload = useCallback(
    (file: File, notes?: string) => {
      if (!uploadDef) return;
      upload.mutate(
        { file, documentTypeId: uploadDef.doc.id, category: uploadDef.categoryId, displayName: uploadDef.doc.name, notes },
        { onSuccess: () => setUploadTarget(null) }
      );
    },
    [uploadDef, upload]
  );

  const handleSaveInline = useCallback(
    (content: string) => {
      if (!inlineDef) return;
      saveInline.mutate(
        { documentTypeId: inlineDef.doc.id, category: inlineDef.categoryId, displayName: inlineDef.doc.name, inlineContent: content },
        { onSuccess: () => setInlineTarget(null) }
      );
    },
    [inlineDef, saveInline]
  );

  const handleDownload = useCallback(
    async (docId: string) => {
      const result = await download.mutateAsync(docId);
      if (result?.url) {
        window.open(result.url, "_blank");
      }
    },
    [download]
  );

  const handleDelete = useCallback(
    (docId: string) => {
      if (window.confirm("Are you sure you want to remove this document?")) {
        remove.mutate(docId);
      }
    },
    [remove]
  );

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        {!isPaidUser && <VaultPaywall />}

        <div className={`p-4 md:p-8 max-w-7xl mx-auto ${!isPaidUser ? "pointer-events-none select-none blur-[2px]" : ""}`}>
          <h1 className="text-2xl font-bold text-foreground mb-6">EasyVault</h1>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <VaultProgress completedCount={completedCount} applicableTotal={applicableTotal} />

              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                  Documents are prioritized based on your personal situation.{" "}
                  <button className="underline font-medium hover:text-amber-900 dark:hover:text-amber-100">
                    Update preferences
                  </button>
                </AlertDescription>
              </Alert>

              <Accordion type="multiple" className="space-y-0">
                {vaultCategories.map((category) => (
                  <DocumentCategory
                    key={category.id}
                    category={category}
                    savedDocs={savedDocsMap}
                    excludedDocIds={excludedDocIds}
                    onUpload={(typeId) => setUploadTarget(typeId)}
                    onEdit={(typeId) => setInlineTarget(typeId)}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onMarkNA={(typeId) => markNotApplicable.mutate(typeId)}
                    onUnmarkNA={(typeId) => unmarkNotApplicable.mutate(typeId)}
                  />
                ))}
              </Accordion>
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <TrustNetworkPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Upload dialog */}
      {uploadDef && (
        <UploadDocumentDialog
          open={!!uploadTarget}
          onOpenChange={(v) => !v && setUploadTarget(null)}
          document={uploadDef.doc}
          categoryId={uploadDef.categoryId}
          onUpload={handleUpload}
          isUploading={upload.isPending}
        />
      )}

      {/* Inline editor */}
      {inlineDef && (
        <InlineDocumentEditor
          open={!!inlineTarget}
          onOpenChange={(v) => !v && setInlineTarget(null)}
          documentTypeId={inlineDef.doc.id}
          documentName={inlineDef.doc.name}
          existingContent={existingInline?.inline_content}
          onSave={handleSaveInline}
          isSaving={saveInline.isPending}
        />
      )}
    </AppLayout>
  );
};

export default EasyVault;
