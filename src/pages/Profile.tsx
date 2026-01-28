import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { CompactLifeCard } from "@/components/profile/CompactLifeCard";
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

const PROFILE_ITEMS: ProfileItem[] = [
  { id: "profile.household.has_dependents", label: "Family", icon: Users, fieldPath: "household.has_dependents" },
  { id: "profile.pets.has_pets", label: "Pets", icon: Heart, fieldPath: "pets.has_pets" },
  { id: "profile.family.supports_aging_parent", label: "Caregiving", icon: HandHeart, fieldPath: "family.supports_aging_parent" },
  { id: "profile.home.owns_real_property", label: "Home", icon: Home, fieldPath: "home.owns_real_property" },
  { id: "profile.home.has_significant_personal_property", label: "Belongings", icon: Briefcase, fieldPath: "home.has_significant_personal_property" },
  { id: "profile.financial.has_beneficiary_accounts", label: "Finances", icon: PiggyBank, fieldPath: "financial.has_beneficiary_accounts" },
  { id: "profile.digital.owns_crypto", label: "Digital Assets", icon: Laptop, fieldPath: "digital.owns_crypto" },
  { id: "profile.emotional.has_spiritual_practices", label: "Faith & Spirituality", icon: Flower2, fieldPath: "emotional.has_spiritual_practices" },
];

// Question prompts
const QUESTION_PROMPTS: Record<string, string> = {
  "profile.household.has_dependents": "Do other people depend on you for care or financial support?",
  "profile.pets.has_pets": "Do you have pets that are part of your family?",
  "profile.family.supports_aging_parent": "Are you caring for or supporting an aging parent?",
  "profile.home.owns_real_property": "Do you own a home or other real estate?",
  "profile.home.has_significant_personal_property": "Do you have valuable belongings or collections?",
  "profile.financial.has_beneficiary_accounts": "Do you have retirement accounts, life insurance, or investments?",
  "profile.digital.owns_crypto": "Do you own cryptocurrency or significant digital assets?",
  "profile.emotional.has_spiritual_practices": "Do you have spiritual or religious traditions important to you?",
};

// Unlock hints
const UNLOCK_HINTS: Record<string, string> = {
  "profile.household.has_dependents": "Guardian designation, dependent care",
  "profile.pets.has_pets": "Pet guardian, care instructions",
  "profile.family.supports_aging_parent": "Caregiver coordination",
  "profile.home.owns_real_property": "Property distribution planning",
  "profile.home.has_significant_personal_property": "Heirloom & collection handling",
  "profile.financial.has_beneficiary_accounts": "Beneficiary review, transfers",
  "profile.digital.owns_crypto": "Wallet access, recovery phrases",
  "profile.emotional.has_spiritual_practices": "Ceremony & memorial wishes",
};

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

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assessmentState, isLoading, refresh } = useAssessmentState();
  
  const [isSaving, setIsSaving] = useState(false);

  const { profile_answers, status, overall_progress, report_stale } = assessmentState;
  const hasStarted = status !== "not_started";

  // Calculate stats
  const completedCount = PROFILE_ITEMS.filter(item => profile_answers[item.id] !== undefined).length;
  const totalCount = PROFILE_ITEMS.length;

  // Get "yes" items for summary
  const yesItems = useMemo(() => {
    return PROFILE_ITEMS
      .filter(item => profile_answers[item.id] === "yes")
      .map(item => item.label);
  }, [profile_answers]);

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

      const newState = await refresh();

      if (!newState) {
        throw new Error("Failed to refresh state");
      }

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
          title: "Saved",
          description: "Your profile has been updated.",
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
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
          
          {/* Empty State - Not started */}
          {!hasStarted && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <UserCircle className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h1 className="text-xl font-display font-bold text-foreground mb-1">
                  Your Life Story
                </h1>
                <p className="text-muted-foreground font-body text-sm max-w-xs mx-auto">
                  Let's create a snapshot of what matters most
                </p>
              </div>

              <Card className="p-6 text-center bg-card/60 backdrop-blur-sm border-border/40 max-w-md mx-auto">
                <div className="space-y-4">
                  <p className="text-foreground/80 font-body text-sm leading-relaxed">
                    A few quick questions help us personalize your assessment.
                  </p>
                  <Button
                    onClick={handleStartReadiness}
                    size="lg"
                    className="gap-2 font-body"
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
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Header + Summary Row */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-shrink-0">
                  <ProfileHeader 
                    completedCount={completedCount}
                    totalCount={totalCount}
                  />
                </div>
                <div className="flex-1">
                  <ProfileSummary 
                    yesItems={yesItems}
                    totalItems={totalCount}
                  />
                </div>
              </div>

              {/* Horizontal Grid of Life Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PROFILE_ITEMS.map((item) => (
                  <CompactLifeCard
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    icon={item.icon}
                    questionPrompt={QUESTION_PROMPTS[item.id]}
                    currentValue={profile_answers[item.id] ?? null}
                    unlockHint={UNLOCK_HINTS[item.id]}
                    onAnswer={(value) => handleProfileUpdate(item.id, value)}
                    disabled={isSaving}
                  />
                ))}
              </div>

              {/* Assessment CTA */}
              <Card className="p-3 bg-card/60 backdrop-blur-sm border-border/40 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-body text-muted-foreground">Life Readiness</p>
                    <p className="text-sm font-display font-semibold text-foreground">
                      {status === "completed" ? "Complete" : `${Math.round(overall_progress)}%`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartReadiness}
                    className="font-body text-xs h-8"
                  >
                    {status === "completed" ? "Review" : "Continue"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
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
