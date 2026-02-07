import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import DocumentRow from "./DocumentRow";
import type { VaultCategory } from "@/data/vaultDocuments";
import type { VaultDocumentRow } from "@/hooks/useVaultDocuments";

interface DocumentCategoryProps {
  category: VaultCategory;
  savedDocs: Map<string, VaultDocumentRow>;
  excludedDocIds: Set<string>;
  onUpload: (docTypeId: string) => void;
  onEdit: (docTypeId: string) => void;
  onDownload: (docId: string) => void;
  onDelete: (docId: string) => void;
  onMarkNA: (docTypeId: string) => void;
  onUnmarkNA: (docTypeId: string) => void;
}

const DocumentCategory = ({ category, savedDocs, excludedDocIds, onUpload, onEdit, onDownload, onDelete, onMarkNA, onUnmarkNA }: DocumentCategoryProps) => {
  const applicableDocs = category.documents.filter((d) => !excludedDocIds.has(d.id));
  const excludedCount = category.documents.length - applicableDocs.length;
  const completedCount = applicableDocs.filter((d) => savedDocs.has(d.id)).length;
  const totalCount = applicableDocs.length;
  const missingCount = totalCount - completedCount;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const Icon = category.icon;

  return (
    <AccordionItem value={category.id} className="border border-border/50 rounded-lg px-4 mb-3 data-[state=open]:shadow-sm transition-shadow">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{category.name}</span>
              {missingCount > 0 && (
                <span className="text-xs text-amber-600">{missingCount} missing</span>
              )}
              {missingCount === 0 && totalCount > 0 && (
                <span className="text-xs text-emerald-600">Complete</span>
              )}
              {excludedCount > 0 && (
                <span className="text-xs text-muted-foreground">{excludedCount} N/A</span>
              )}
            </div>
            <Progress value={progress} className="h-1.5 bg-muted mt-1.5 w-40" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1 pb-2">
          {category.documents.map((doc) => {
            const saved = savedDocs.get(doc.id);
            const isExcluded = excludedDocIds.has(doc.id);
            return (
              <DocumentRow
                key={doc.id}
                document={doc}
                savedDoc={saved}
                isExcluded={isExcluded}
                onUpload={() => onUpload(doc.id)}
                onEdit={() => onEdit(doc.id)}
                onDownload={() => saved && onDownload(saved.id)}
                onDelete={() => saved && onDelete(saved.id)}
                onMarkNA={() => onMarkNA(doc.id)}
                onUnmarkNA={() => onUnmarkNA(doc.id)}
              />
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DocumentCategory;
