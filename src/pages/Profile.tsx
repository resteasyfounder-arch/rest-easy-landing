import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import { ProfileEditModal, QUESTION_PROMPTS } from "@/components/profile/ProfileEditModal";

// Profile items for the visual snapshot
const SNAPSHOT_ITEMS = [
  {
    id: "profile.household.has_dependents",
    label: "Family",
    icon: Users,
  },
  {
    id: "profile.pets.has_pets",
    label: "Pets",
    icon: Heart,
  },
  {
    id: "profile.family.supports_aging_parent",
    label: "Caregiving",
    icon: HandHeart,
  },
  {
    id: "profile.home.owns_real_property",
    label: "Home",
    icon: Home,
  },
  {
    id: "profile.home.has_significant_personal_property",
    label: "Belongings",
    icon: Briefcase,
  },
  {
    id: "profile.financial.has_beneficiary_accounts",
    label: "Finances",
    icon: PiggyBank,
  },
  {
    id: "profile.digital.owns_crypto",
    label: "Digital",
    icon: Laptop,
  },
  {
    id: "profile.emotional.has_spiritual_practices",
    label: "Faith",
    icon: Flower2,
  },
];

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

// Visual snapshot component
const LifeSnapshot = ({ 
  profileAnswers, 
  onItemClick 
}: { 
  profileAnswers: Record<string, string>;
  onItemClick: (item: typeof SNAPSHOT_ITEMS[0]) => void;
}) => {
  const getItemState = (id: string) => {
    const answer = profileAnswers[id];
    if (answer === "yes") return "active";
    if (answer === "no") return "inactive";
    return "unknown";
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square">
      {/* Central avatar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
          <UserCircle className="w-10 h-10 text-primary" />
        </div>
      </div>

      {/* Connection lines (decorative) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Subtle circular connection */}
        <circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="none" 
          stroke="url(#lineGradient)" 
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
      </svg>

      {/* Snapshot items arranged around center */}
      {SNAPSHOT_ITEMS.map((item, index) => {
        const state = getItemState(item.id);
        const Icon = item.icon;
        
        // Calculate position around the circle
        const angle = (index / SNAPSHOT_ITEMS.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 38; // percentage from center
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          >
            <button
              onClick={() => onItemClick(item)}
              className={cn(
                "flex flex-col items-center gap-1.5 group cursor-pointer",
                state === "active" && "animate-fade-in",
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  "hover:scale-110 hover:shadow-lg",
                  state === "active" && [
                    "bg-primary/15 border-2 border-primary/30 shadow-md shadow-primary/10",
                    "hover:shadow-primary/20",
                    `animate-float-gentle animate-delay-${index}`,
                  ],
                  state === "inactive" && [
                    "bg-muted/30 border border-border/30",
                    "hover:bg-muted/50 hover:border-border/50",
                  ],
                  state === "unknown" && [
                    "bg-muted/20 border border-dashed border-border/20",
                    "hover:bg-muted/30 hover:border-border/30",
                  ],
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    state === "active" && "text-primary",
                    state === "inactive" && "text-muted-foreground/40 group-hover:text-muted-foreground/60",
                    state === "unknown" && "text-muted-foreground/20 group-hover:text-muted-foreground/40",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-body transition-all duration-300 text-center",
                  state === "active" && "text-foreground font-medium",
                  state === "inactive" && "text-muted-foreground/50 group-hover:text-muted-foreground/70",
                  state === "unknown" && "text-muted-foreground/30 group-hover:text-muted-foreground/50",
                )}
              >
                {item.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const {
    profileAnswers,
    isComplete,
    completedCount,
    clearProfile,
    updateAnswer,
    saveProfile,
    isLoading,
  } = useGuestProfile();

  const [editingItem, setEditingItem] = useState<typeof SNAPSHOT_ITEMS[0] | null>(null);

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

  const handleItemClick = (item: typeof SNAPSHOT_ITEMS[0]) => {
    setEditingItem(item);
  };

  const handleEditAnswer = async (value: "yes" | "no") => {
    if (!editingItem) return;
    updateAnswer(editingItem.id, value);
    await saveProfile();
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
        <div className="max-w-xl mx-auto px-6 py-10 pb-32">
          {/* Header */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Your Life, At a Glance
            </h1>
            <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-xs mx-auto">
              A snapshot of what matters in your world
            </p>
          </div>

          {/* Empty State */}
          {completedCount === 0 && (
            <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="space-y-5">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-body text-base leading-relaxed max-w-sm mx-auto">
                    We'd love to learn a little about you. Just a few simple questions — 
                    no right or wrong answers.
                  </p>
                  <p className="text-sm text-muted-foreground font-body mt-2">
                    Takes about a minute. You can always change this later.
                  </p>
                </div>
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              
              {/* Life Snapshot Visual Card */}
              <Card className="p-6 pt-8 bg-card/60 backdrop-blur-sm border-border/40 overflow-hidden">
                <LifeSnapshot 
                  profileAnswers={profileAnswers} 
                  onItemClick={handleItemClick}
                />
                
                {/* Summary below the visual */}
                {isComplete && (
                  <div className="text-center mt-6 pt-6 border-t border-border/30">
                    <p className="text-base font-body text-foreground/80 leading-relaxed italic">
                      "{summary}"
                    </p>
                  </div>
                )}
              </Card>

              {/* Continue CTA */}
              {isComplete ? (
                <div className="text-center space-y-4 pt-4">
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
              ) : (
                <div className="text-center space-y-4 pt-4">
                  <p className="text-foreground font-body text-base leading-relaxed">
                    A few more questions to complete your snapshot.
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
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditProfile}
                  className="gap-2 text-muted-foreground hover:text-foreground font-body"
                >
                  <Edit3 className="w-4 h-4" />
                  Update
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
                        This will clear what you've shared. You can always fill it out again.
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

      {/* Edit Modal */}
      {editingItem && (
        <ProfileEditModal
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          icon={editingItem.icon}
          label={editingItem.label}
          questionPrompt={QUESTION_PROMPTS[editingItem.id] || editingItem.label}
          currentValue={profileAnswers[editingItem.id] as "yes" | "no" | null}
          onAnswer={handleEditAnswer}
        />
      )}
    </AppLayout>
  );
};

export default Profile;
