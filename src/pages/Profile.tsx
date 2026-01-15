import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import {
  UserCircle,
  Heart,
  Users,
  Home,
  Briefcase,
  Laptop,
  HandHeart,
  Flower2,
  PiggyBank,
  Edit3,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Profile items with warm, human-centered language - IDs match schema
const PROFILE_ITEMS = [
  {
    id: "profile.financial.has_beneficiary_accounts",
    label: "Financial accounts",
    icon: PiggyBank,
  },
  {
    id: "profile.household.has_dependents",
    label: "People who depend on me",
    icon: Users,
  },
  {
    id: "profile.pets.has_pets",
    label: "Pets in my life",
    icon: Heart,
  },
  {
    id: "profile.digital.owns_crypto",
    label: "Digital assets",
    icon: Laptop,
  },
  {
    id: "profile.family.supports_aging_parent",
    label: "Caring for a parent",
    icon: HandHeart,
  },
  {
    id: "profile.home.owns_real_property",
    label: "My home",
    icon: Home,
  },
  {
    id: "profile.home.has_significant_personal_property",
    label: "Meaningful belongings",
    icon: Briefcase,
  },
  {
    id: "profile.emotional.has_spiritual_practices",
    label: "Faith & traditions",
    icon: Flower2,
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const {
    profileAnswers,
    isComplete,
    completedCount,
    clearProfile,
    isLoading,
  } = useGuestProfile();

  const handleClearProfile = () => {
    clearProfile();
    toast.success("Your answers have been cleared");
  };

  const handleEditProfile = () => {
    navigate("/readiness?edit=profile");
  };

  const handleStartProfile = () => {
    navigate("/readiness");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground font-body">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="max-w-xl mx-auto px-6 py-12 pb-32 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/15 to-primary/5">
              <UserCircle className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-foreground">
                About You
              </h1>
              <p className="text-muted-foreground font-body text-lg leading-relaxed max-w-sm mx-auto">
                A little about your life helps us focus on what matters most to you.
              </p>
            </div>
          </div>

          {/* Empty State - Warm invitation */}
          {completedCount === 0 && (
            <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="space-y-5">
                <p className="text-foreground font-body text-base leading-relaxed max-w-sm mx-auto">
                  We'd love to learn a little about you. Just a few simple questions — 
                  no right or wrong answers.
                </p>
                <p className="text-sm text-muted-foreground font-body">
                  Takes about a minute. You can always change your answers later.
                </p>
                <Button
                  onClick={handleStartProfile}
                  size="lg"
                  className="mt-2 gap-2 font-body"
                >
                  Let's Begin
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Profile Answers - Clean, simple list */}
          {completedCount > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-foreground">
                  What you shared
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditProfile}
                  className="gap-2 text-muted-foreground hover:text-foreground font-body"
                >
                  <Edit3 className="w-4 h-4" />
                  Update
                </Button>
              </div>

              <div className="space-y-2">
                {PROFILE_ITEMS.map((item) => {
                  const answer = profileAnswers[item.id];
                  const Icon = item.icon;
                  const isYes = answer === "yes";

                  // Only show items that have been answered
                  if (!answer) return null;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card/60 border border-border/40"
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          isYes
                            ? "bg-primary/10 text-primary"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="flex-1 font-body text-foreground">
                        {item.label}
                      </span>
                      <span
                        className={`text-sm font-body ${
                          isYes ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {isYes ? "Yes" : "No"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completion message - Warm and encouraging */}
          {isComplete && (
            <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="text-center space-y-4">
                <p className="text-foreground font-body text-base leading-relaxed">
                  Thank you for sharing. Whenever you're ready, we can continue.
                </p>
                <Button
                  onClick={() => navigate("/readiness")}
                  size="lg"
                  className="gap-2 font-body"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Partial completion - Gentle nudge */}
          {completedCount > 0 && !isComplete && (
            <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="text-center space-y-4">
                <p className="text-foreground font-body text-base leading-relaxed">
                  You can finish up anytime, or continue where you left off.
                </p>
                <Button
                  onClick={handleEditProfile}
                  size="lg"
                  className="gap-2 font-body"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Start over option - Neutral, not prominent */}
          {completedCount > 0 && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground font-body"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start over
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">Start over?</AlertDialogTitle>
                    <AlertDialogDescription className="font-body">
                      This will clear what you've shared so far. You can always fill it out again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-body">Keep my answers</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearProfile}
                      className="font-body"
                    >
                      Start over
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
