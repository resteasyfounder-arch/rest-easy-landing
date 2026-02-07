import { useState } from "react";
import { Info } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from "@/components/layout/AppLayout";
import { VaultProgress, DocumentCategory, TrustNetworkPanel, VaultPaywall } from "@/components/vault";
import { vaultCategories } from "@/data/vaultDocuments";

const EasyVault = () => {
  const isPaidUser = true; // hardcoded for UI preview; false to see paywall
  const [completedIds] = useState<Set<string>>(new Set());
  const completedCount = completedIds.size;

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        {!isPaidUser && <VaultPaywall />}

        <div className={`p-4 md:p-8 max-w-7xl mx-auto ${!isPaidUser ? "pointer-events-none select-none blur-[2px]" : ""}`}>
          <h1 className="text-2xl font-bold text-foreground mb-6">EasyVault</h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1 space-y-4">
              <VaultProgress completedCount={completedCount} />

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
                    completedIds={completedIds}
                  />
                ))}
              </Accordion>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-80 shrink-0">
              <TrustNetworkPanel />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EasyVault;
