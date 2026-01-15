import { useMemo } from "react";
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

// Profile items organized by human themes
const PROFILE_THEMES = {
  people: {
    title: "The people in your life",
    items: [
      {
        id: "profile.household.has_dependents",
        label: "People who depend on you",
        activeLabel: "You have people who depend on you",
        icon: Users,
      },
      {
        id: "profile.pets.has_pets",
        label: "Pets",
        activeLabel: "You have pets in your life",
        icon: Heart,
      },
      {
        id: "profile.family.supports_aging_parent",
        label: "Aging parent",
        activeLabel: "You're caring for an aging parent",
        icon: HandHeart,
      },
    ],
  },
  home: {
    title: "Your home & belongings",
    items: [
      {
        id: "profile.home.owns_real_property",
        label: "Home ownership",
        activeLabel: "You own your home",
        icon: Home,
      },
      {
        id: "profile.home.has_significant_personal_property",
        label: "Meaningful belongings",
        activeLabel: "You have meaningful belongings to pass on",
        icon: Briefcase,
      },
    ],
  },
  financial: {
    title: "Finances & digital life",
    items: [
      {
        id: "profile.financial.has_beneficiary_accounts",
        label: "Beneficiary accounts",
        activeLabel: "You have accounts with beneficiaries",
        icon: PiggyBank,
      },
      {
        id: "profile.digital.owns_crypto",
        label: "Digital assets",
        activeLabel: "You have digital assets",
        icon: Laptop,
      },
    ],
  },
  meaning: {
    title: "What gives life meaning",
    items: [
      {
        id: "profile.emotional.has_spiritual_practices",
        label: "Faith & traditions",
        activeLabel: "Faith and traditions are important to you",
        icon: Flower2,
      },
    ],
  },
};

// Generate a reflective summary based on profile
function generateSummary(profileAnswers: Record<string, string>): string {
  const yesItems: string[] = [];
  
  if (profileAnswers["profile.household.has_dependents"] === "yes") {
    yesItems.push("loved ones who count on you");
  }
  if (profileAnswers["profile.pets.has_pets"] === "yes") {
    yesItems.push("pets who are part of the family");
  }
  if (profileAnswers["profile.family.supports_aging_parent"] === "yes") {
    yesItems.push("a parent you're helping care for");
  }
  if (profileAnswers["profile.home.owns_real_property"] === "yes") {
    yesItems.push("a home");
  }
  if (profileAnswers["profile.home.has_significant_personal_property"] === "yes") {
    yesItems.push("belongings that matter");
  }
  if (profileAnswers["profile.emotional.has_spiritual_practices"] === "yes") {
    yesItems.push("traditions close to your heart");
  }

  if (yesItems.length === 0) {
    return "Everyone's situation is different. We'll focus on the essentials.";
  }

  if (yesItems.length === 1) {
    return `Your life includes ${yesItems[0]}.`;
  }

  if (yesItems.length === 2) {
    return `Your life includes ${yesItems[0]} and ${yesItems[1]}.`;
  }

  const lastItem = yesItems.pop();
  return `Your life includes ${yesItems.join(", ")}, and ${lastItem}.`;
}

const Profile = () => {
  const navigate = useNavigate();
  const {
    profileAnswers,
    isComplete,
    completedCount,
    clearProfile,
    isLoading,
  } = useGuestProfile();

  // Categorize items by yes/no
  const { activeItems, inactiveCount } = useMemo(() => {
    const active: Array<{ theme: string; item: typeof PROFILE_THEMES.people.items[0] }> = [];
    let inactive = 0;

    Object.entries(PROFILE_THEMES).forEach(([themeKey, theme]) => {
      theme.items.forEach((item) => {
        const answer = profileAnswers[item.id];
        if (answer === "yes") {
          active.push({ theme: themeKey, item });
        } else if (answer === "no") {
          inactive++;
        }
      });
    });

    return { activeItems: active, inactiveCount: inactive };
  }, [profileAnswers]);

  const summary = useMemo(() => generateSummary(profileAnswers), [profileAnswers]);

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
        <div className="max-w-xl mx-auto px-6 py-12 pb-32">
          {/* Header */}
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 mb-4">
              <UserCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              About You
            </h1>
            <p className="text-muted-foreground font-body text-base leading-relaxed max-w-sm mx-auto">
              A glimpse of what makes your life yours
            </p>
          </div>

          {/* Empty State */}
          {completedCount === 0 && (
            <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="space-y-5">
                <p className="text-foreground font-body text-base leading-relaxed max-w-sm mx-auto">
                  We'd love to learn a little about you. Just a few simple questions — 
                  no right or wrong answers.
                </p>
                <p className="text-sm text-muted-foreground font-body">
                  Takes about a minute. You can always change this later.
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

          {/* Profile Content */}
          {completedCount > 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              
              {/* Reflective Summary */}
              {isComplete && (
                <div className="text-center px-4">
                  <p className="text-lg font-body text-foreground leading-relaxed italic">
                    "{summary}"
                  </p>
                </div>
              )}

              {/* Active Items - What's part of their life */}
              {activeItems.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-body text-muted-foreground uppercase tracking-wide px-1">
                    What's part of your life
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {activeItems.map(({ item }) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-primary/10 border border-primary/20"
                        >
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="font-body text-sm text-foreground">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* If nothing active, show a gentle message */}
              {activeItems.length === 0 && isComplete && (
                <Card className="p-6 bg-card/40 border-border/30 text-center">
                  <p className="text-muted-foreground font-body">
                    Your situation is simpler — and that's perfectly fine.
                    We'll focus on the essentials.
                  </p>
                </Card>
              )}

              {/* Inactive count - subtle, collapsed */}
              {inactiveCount > 0 && (
                <p className="text-sm text-muted-foreground/70 font-body text-center">
                  {inactiveCount} {inactiveCount === 1 ? "area" : "areas"} not applicable to you
                </p>
              )}

              {/* Continue / Complete CTA */}
              {isComplete ? (
                <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/40">
                  <div className="text-center space-y-4">
                    <p className="text-foreground font-body text-base leading-relaxed">
                      Whenever you're ready, we can continue.
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
              ) : (
                <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/40">
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

              {/* Actions - subtle footer */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditProfile}
                  className="gap-2 text-muted-foreground hover:text-foreground font-body"
                >
                  <Edit3 className="w-4 h-4" />
                  Update answers
                </Button>
                
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
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
