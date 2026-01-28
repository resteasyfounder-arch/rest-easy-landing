import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { LifeAreaCategory } from "@/components/profile/LifeAreaCategory";
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
} from "lucide-react";
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

// Grouped profile items by category
const PROFILE_CATEGORIES = {
  people: {
    title: "People in Your Life",
    items: [
      { id: "profile.household.has_dependents", label: "Family", icon: Users, fieldPath: "household.has_dependents" },
      { id: "profile.pets.has_pets", label: "Pets", icon: Heart, fieldPath: "pets.has_pets" },
      { id: "profile.family.supports_aging_parent", label: "Caregiving", icon: HandHeart, fieldPath: "family.supports_aging_parent" },
    ],
  },
  assets: {
    title: "Your Assets",
    items: [
      { id: "profile.home.owns_real_property", label: "Home", icon: Home, fieldPath: "home.owns_real_property" },
      { id: "profile.home.has_significant_personal_property", label: "Belongings", icon: Briefcase, fieldPath: "home.has_significant_personal_property" },
      { id: "profile.financial.has_beneficiary_accounts", label: "Finances", icon: PiggyBank, fieldPath: "financial.has_beneficiary_accounts" },
    ],
  },
  personal: {
    title: "Personal & Digital",
    items: [
      { id: "profile.digital.owns_crypto", label: "Digital Assets", icon: Laptop, fieldPath: "digital.owns_crypto" },
      { id: "profile.emotional.has_spiritual_practices", label: "Faith & Spirituality", icon: Flower2, fieldPath: "emotional.has_spiritual_practices" },
    ],
  },
};

// Flat list for iteration
const ALL_PROFILE_ITEMS: ProfileItem[] = [
  ...PROFILE_CATEGORIES.people.items,
  ...PROFILE_CATEGORIES.assets.items,
  ...PROFILE_CATEGORIES.personal.items,
];

// Question prompts for each profile item
const QUESTION_PROMPTS: Record<string, string> = {
  "profile.household.has_dependents": "Do other people depend on you for care or financial support?",
  "profile.pets.has_pets": "Do you have pets that are part of your family?",
  "profile.family.supports_aging_parent": "Are you caring for or supporting an aging parent?",
  "profile.home.owns_real_property": "Do you own a home or other real estate?",
  "profile.home.has_significant_personal_property": "Do you have valuable belongings or collections?",
  "profile.financial.has_beneficiary_accounts": "Do you have retirement accounts, life insurance, or investment accounts?",
  "profile.digital.owns_crypto": "Do you own cryptocurrency or significant digital assets?",
  "profile.emotional.has_spiritual_practices": "Do you have spiritual or religious traditions important to you?",
};

// Unlock hints explaining what each answer unlocks
const UNLOCK_HINTS: Record<string, string> = {
  "profile.household.has_dependents": "Guardian designation, dependent care instructions, inheritance planning",
  "profile.pets.has_pets": "Pet guardian selection, care instructions, veterinary preferences",
  "profile.family.supports_aging_parent": "Caregiver coordination, medical decision support",
  "profile.home.owns_real_property": "Property distribution, deed information, mortgage details",
  "profile.home.has_significant_personal_property": "Heirloom distribution, collection handling, special items",
  "profile.financial.has_beneficiary_accounts": "Beneficiary review, account consolidation, transfer planning",
  "profile.digital.owns_crypto": "Wallet access, recovery phrases, digital asset transfer",
  "profile.emotional.has_spiritual_practices": "Ceremony preferences, religious rites, memorial wishes",
};

// Helper to build profile_json from profile_answers
function buildProfileJson(profileAnswers: Record<string, "yes" | "no">): Record<string, Record<string, boolean>> {
  const result: Record<string, Record<string, boolean>> = {};
  
  for (const [questionId, answer] of Object.entries(profileAnswers)) {
    const item = ALL_PROFILE_ITEMS.find(i => i.id === questionId);
    if (!item) continue;
    
    const [category, field] = item.fieldPath.split(".");
    if (!result[category]) {
      result[category] = {};
    }
    result[category][field] = answer === "yes";
  }
  
  return result;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assessmentState, isLoading, refresh } = useAssessmentState();
  
  const [isSaving, setIsSaving] = useState(false);

  const { profile_complete, profile_progress, profile_answers, status, overall_progress, report_stale } = assessmentState;
  const hasStarted = status !== "not_started";

  // Calculate completed count
  const completedCount = ALL_PROFILE_ITEMS.filter(item => profile_answers[item.id] !== undefined).length;
  const totalCount = ALL_PROFILE_ITEMS.length;

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

      console.log("[Profile] Saving update:", questionId, "=", value);
      console.log("[Profile] Profile JSON to send:", profileJson);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
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

      // Consume the response to get updated state
      const responseData = await response.json();
      console.log("[Profile] Server response profile_answers:", responseData.assessment_state?.profile_answers);

      // Refresh state to ensure hook is synced
      const newState = await refresh();
      console.log("[Profile] After refresh, profile_answers:", newState?.profile_answers);

      if (!newState) {
        throw new Error("Failed to refresh state");
      }

      // Detect if new questions were unlocked
      if (
        newState.overall_progress < previousProgress ||
        (previousStatus === "completed" && newState.status === "in_progress")
      ) {
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
      } else if (!wasStale && newState.report_stale) {
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
      console.error("[Profile] Error saving profile:", error);
      toast({
        title: "Error saving",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [profile_answers, overall_progress, status, report_stale, refresh, navigate, toast]);

  const getAnswersMap = (): Record<string, "yes" | "no" | null> => {
    const result: Record<string, "yes" | "no" | null> = {};
    ALL_PROFILE_ITEMS.forEach(item => {
      result[item.id] = profile_answers[item.id] ?? null;
    });
    return result;
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
          
          {/* Empty State - Not started */}
          {!hasStarted && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Simplified header for empty state */}
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <UserCircle className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                  Your Life Story
                </h1>
                <p className="text-muted-foreground font-body text-base leading-relaxed max-w-xs mx-auto">
                  Let's create a snapshot of what matters most in your life
                </p>
              </div>

              <Card className="p-8 text-center bg-card/60 backdrop-blur-sm border-border/40">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h2 className="text-lg font-display font-semibold text-foreground">
                      Welcome! Let's get started
                    </h2>
                    <p className="text-foreground/80 font-body text-base leading-relaxed max-w-sm mx-auto">
                      A few quick questions help us understand your unique situation — 
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
            </div>
          )}

          {/* Profile Content - Has started */}
          {hasStarted && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Personalized Header with Avatar + Progress Ring */}
              <ProfileHeader 
                completedCount={completedCount}
                totalCount={totalCount}
              />

              {/* Assessment Status Card */}
              <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-body text-muted-foreground">Life Readiness</p>
                    <p className="font-display font-semibold text-foreground">
                      {status === "completed" ? "Assessment Complete" : `${Math.round(overall_progress)}% Complete`}
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

              {/* Categorized Life Areas */}
              <div className="space-y-2">
                <LifeAreaCategory
                  title={PROFILE_CATEGORIES.people.title}
                  items={PROFILE_CATEGORIES.people.items}
                  answers={getAnswersMap()}
                  questionPrompts={QUESTION_PROMPTS}
                  unlockHints={UNLOCK_HINTS}
                  onAnswer={handleProfileUpdate}
                  disabled={isSaving}
                  defaultOpen={true}
                />

                <LifeAreaCategory
                  title={PROFILE_CATEGORIES.assets.title}
                  items={PROFILE_CATEGORIES.assets.items}
                  answers={getAnswersMap()}
                  questionPrompts={QUESTION_PROMPTS}
                  unlockHints={UNLOCK_HINTS}
                  onAnswer={handleProfileUpdate}
                  disabled={isSaving}
                  defaultOpen={true}
                />

                <LifeAreaCategory
                  title={PROFILE_CATEGORIES.personal.title}
                  items={PROFILE_CATEGORIES.personal.items}
                  answers={getAnswersMap()}
                  questionPrompts={QUESTION_PROMPTS}
                  unlockHints={UNLOCK_HINTS}
                  onAnswer={handleProfileUpdate}
                  disabled={isSaving}
                  defaultOpen={true}
                />
              </div>

              {/* Help text */}
              <p className="text-center text-sm text-muted-foreground font-body pt-2">
                Changes here personalize your assessment and unlock relevant questions.
              </p>
            </div>
          )}
        </div>
      </div>

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
