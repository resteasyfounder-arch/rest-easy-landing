import remyAvatar from "@/assets/remy-avatar.png";
import { Skeleton } from "@/components/ui/skeleton";

const GeneratingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-hero z-50 flex flex-col items-center justify-center p-6 safe-area-top safe-area-bottom">
      <div className="max-w-sm text-center space-y-8 animate-fade-up">
        {/* Remy avatar with pulse */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <img
              src={remyAvatar}
              alt="Remy"
              className="relative w-20 h-20 rounded-full object-cover border-2 border-primary/30"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl text-foreground">
            Remy is reviewing your answers…
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Preparing your personalized summary
          </p>
        </div>

        {/* Skeleton loading indicators */}
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <Skeleton className="h-4 w-4/6 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default GeneratingScreen;
