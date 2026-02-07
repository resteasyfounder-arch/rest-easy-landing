import { Plus } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import DocumentRow from "./DocumentRow";
import type { VaultCategory } from "@/data/vaultDocuments";

interface DocumentCategoryProps {
  category: VaultCategory;
  completedIds: Set<string>;
}

const DocumentCategory = ({ category, completedIds }: DocumentCategoryProps) => {
  const completedCount = category.documents.filter((d) => completedIds.has(d.id)).length;
  const totalCount = category.documents.length;
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
              {missingCount === 0 && (
                <span className="text-xs text-emerald-600">Complete</span>
              )}
            </div>
            <Progress value={progress} className="h-1.5 bg-muted mt-1.5 w-40" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1 pb-2">
          {category.documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              isUploaded={completedIds.has(doc.id)}
            />
          ))}
          <Button variant="ghost" size="sm" className="text-primary mt-2 gap-1.5">
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default DocumentCategory;
