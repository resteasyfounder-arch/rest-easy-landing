import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { ProfileEditModal, QUESTION_PROMPTS } from "@/components/profile/ProfileEditModal";
import { useToast } from "@/hooks/use-toast";
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
  ArrowRight,
  Loader2,
  Check,
  X,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const SUPABASE_URL = "https://ltldbteqkpxqohbwqvrn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGRidGVxa3B4cW9oYndxdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTY0MjUsImV4cCI6MjA4MzU3MjQyNX0.zSWhg_zFbrDhIA9egmaRsGsRiQg7Pd9fgHyTp39v3CE";
const ASSESSMENT_ID = "readiness_v1";
const SCHEMA_VERSION = "v1";

const STORAGE_KEYS = {
  subjectId: "rest-easy.readiness.subject_id",
};

// Profile items configuration
interface ProfileItem {
  id: string;
  label: string;
  icon: LucideIcon;
  fieldPath: string;
}

const PROFILE_ITEMS: ProfileItem[] = [
  { id: "profile.household.has_dependents", label: "Family", icon: Users, fieldPath: "household.has_dependents" },
  { id: "profile.pets.has_pets", label: "Pets", icon: Heart, fieldPath: "pets.has_pets" },
  { id: "profile.family.supports_aging_parent", label: "Caregiving", icon: HandHeart, fieldPath: "family.supports_aging_parent" },
  { id: "profile.home.owns_real_property", label: "Home", icon: Home, fieldPath: "home.owns_real_property" },
  { id: "profile.home.has_significant_personal_property", label: "Belongings", icon: Briefcase, fieldPath: "home.has_significant_personal_property" },
  { id: "profile.financial.has_beneficiary_accounts", label: "Finances", icon: PiggyBank, fieldPath: "financial.has_beneficiary_accounts" },
  { id: "profile.digital.owns_crypto", label: "Digital", icon: Laptop, fieldPath: "digital.owns_crypto" },
  { id: "profile.emotional.has_spiritual_practices", label: "Faith", icon: Flower2, fieldPath: "emotional.has_spiritual_practices" },
];

// Helper to build profile_json from profile_answers
function buildProfileJson(profileAnswers: Record<string, "yes" | "no">): Record<string, Record<string, boolean>> {
  const result: Record<string, Record<string, boolean>> = {};
  
  for (const [questionId, answer] of Object.entries(profileAnswers)) {
    const item = PROFILE_ITEMS.find(i => i.id === questionId);
    if (!item) continue;
    
    const [category, field] = item.fieldPath.split(".");
    if (!result[category]) {
      result[category] = {};
    }
    result[category][field] = answer === "yes";
  }
  
  return result;
}

// Profile item card component
interface ProfileItemCardProps {
  item: ProfileItem;
  currentValue: "yes" | "no" | null;
  onClick: () => void;
}

const ProfileItemCard = ({ item, currentValue, onClick }: ProfileItemCardProps) => {
  const Icon = item.icon;
  const hasAnswer = currentValue !== null;
  const isYes = currentValue === "yes";
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200",
        "hover:scale-105 active:scale-95 cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        hasAnswer && isYes && "bg-primary/10 border-2 border-primary/30",
        hasAnswer && !isYes && "bg-muted/30 border-2 border-border/30",
        !hasAnswer && "bg-muted/10 border-2 border-dashed border-border/20"
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center transition-all",
          hasAnswer && isYes && "bg-primary/20",
          hasAnswer && !isYes && "bg-muted/40",
          !hasAnswer && "bg-muted/20"
        )}
      >
        <Icon
          className={cn(
            "w-6 h-6 transition-colors",
            hasAnswer && isYes && "text-primary",
            hasAnswer && !isYes && "text-muted-foreground",
            !hasAnswer && "text-muted-foreground/40"
          )}
        />
      </div>
      <span
        className={cn(
          "text-sm font-body font-medium transition-colors",
          hasAnswer && isYes && "text-foreground",
          hasAnswer && !isYes && "text-muted-foreground",
          !hasAnswer && "text-muted-foreground/50"
        )}
      >
        {item.label}
      </span>
      <div className="flex items-center gap-1">
        {hasAnswer ? (
          isYes ? (
            <span className="flex items-center gap-1 text-xs text-primary font-medium">
              <Check className="w-3 h-3" /> Yes
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <X className="w-3 h-3" /> No
            </span>
          )
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
            <Circle className="w-3 h-3" /> Not set
          </span>
        )}
      </div>
    </button>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assessmentState, isLoading, refresh } = useAssessmentState();
  
  const [editingItem, setEditingItem] = useState<ProfileItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { profile_complete, profile_progress, profile_answers, status, overall_progress, report_stale } = assessmentState;
  const hasStarted = status !== "not_started";

  const handleStartReadiness = () => {
    navigate("/readiness");
  };

  const handleProfileUpdate = useCallback(async (questionId: string, value: "yes" | "no") => {
    const subjectId = localStorage.getItem(STORAGE_KEYS.subjectId);
    if (!subjectId) {
      toast({
        title: "Session not found",
        description: "Please start the assessment first.",
        variant: "destructive",
      });
      return;
    }

    const previousProgress = overall_progress;
    const previousStatus = status;
    const wasStale = report_stale;

    setIsSaving(true);

    try {
      // Build updated profile answers
      const updatedAnswers = { ...profile_answers, [questionId]: value };
      const profileJson = buildProfileJson(updatedAnswers);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: "get_state",
          subject_id: subjectId,
          assessment_id: ASSESSMENT_ID,
          profile: {
            profile_json: profileJson,
            version: SCHEMA_VERSION,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile update");
      }

      // Refresh state to get updated data
      const newState = await refresh();

      // Detect if new questions were unlocked
      if (newState && (
        newState.overall_progress < previousProgress ||
        (previousStatus === "completed" && newState.status === "in_progress")
      )) {
        toast({
          title: "New Questions Unlocked",
          description: "Your profile update has unlocked additional questions.",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/readiness")}
            >
              Go to Assessment
            </Button>
          ),
        });
      } else if (!wasStale && newState?.report_stale) {
        toast({
          title: "Report Update Available",
          description: "Your report can be updated to reflect this change.",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your change has been saved.",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setEditingItem(null);
    }
  }, [profile_answers, overall_progress, status, report_stale, refresh, navigate, toast]);

  const getAnswerValue = (questionId: string): "yes" | "no" | null => {
    return profile_answers[questionId] ?? null;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              Tap any area to update your profile
            </p>
          </div>

          {/* Empty State - Not started */}
          {!hasStarted && (
            <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="space-y-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                  <UserCircle className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-display font-semibold text-foreground">
                    Welcome! Let's create your snapshot
                  </h2>
                  <p className="text-foreground/80 font-body text-base leading-relaxed max-w-sm mx-auto">
                    A few quick questions help us understand what matters most in your life — 
                    no right or wrong answers.
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    About 1 minute · You can always update later
                  </p>
                </div>
                <Button
                  onClick={handleStartReadiness}
                  size="lg"
                  className="mt-2 gap-2 font-body"
                >
                  Let's Begin
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Profile Content - Has started */}
          {hasStarted && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              
              {/* Assessment Status Card */}
              <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-body text-muted-foreground">Assessment Status</p>
                    <p className="font-display font-semibold text-foreground">
                      {status === "completed" ? "Complete" : `${Math.round(overall_progress)}% Complete`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartReadiness}
                    className="font-body"
                  >
                    {status === "completed" ? "Review" : "Continue"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>

              {/* Interactive Profile Grid */}
              <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/40">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-3">
                    <UserCircle className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground font-body">
                    {profile_complete 
                      ? "Your profile is complete" 
                      : `Profile ${Math.round(profile_progress)}% complete`
                    }
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {PROFILE_ITEMS.map((item) => (
                    <ProfileItemCard
                      key={item.id}
                      item={item}
                      currentValue={getAnswerValue(item.id)}
                      onClick={() => setEditingItem(item)}
                    />
                  ))}
                </div>
              </Card>

              {/* Help text */}
              <p className="text-center text-sm text-muted-foreground font-body">
                Changes here may unlock or hide assessment questions based on your situation.
              </p>
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
          questionPrompt={QUESTION_PROMPTS[editingItem.id] || `Update your ${editingItem.label.toLowerCase()} status`}
          currentValue={getAnswerValue(editingItem.id)}
          onAnswer={(value) => handleProfileUpdate(editingItem.id, value)}
        />
      )}

      {/* Saving overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="font-body text-foreground">Saving...</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Profile;
