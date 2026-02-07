import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const VaultPaywall = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
      <div className="text-center space-y-4 max-w-sm px-6">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Upgrade to access EasyVault</h3>
        <p className="text-sm text-muted-foreground">
          Securely store and organize your essential documents in one place. Available on paid plans.
        </p>
        <Button className="mt-2">Upgrade Now</Button>
      </div>
    </div>
  );
};

export default VaultPaywall;
