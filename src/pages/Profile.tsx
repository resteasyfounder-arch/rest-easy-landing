import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import {
  UserCircle,
  DollarSign,
  Users,
  Heart,
  Laptop,
  UserPlus,
  Home,
  Sparkles,
  Building,
  Edit3,
  Trash2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
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

// Profile question metadata for display
const PROFILE_QUESTIONS = [
  {
    id: "has_beneficiary_accounts",
    label: "Beneficiary Accounts",
    description: "Financial accounts with named beneficiaries",
    icon: DollarSign,
    category: "Financial",
  },
  {
    id: "has_dependents",
    label: "Dependents",
    description: "Children or others who depend on you",
    icon: Users,
    category: "Family",
  },
  {
    id: "has_pets",
    label: "Pets",
    description: "Animals in your care",
    icon: Heart,
    category: "Household",
  },
  {
    id: "has_digital_assets",
    label: "Digital Assets",
    description: "Online accounts, crypto, digital property",
    icon: Laptop,
    category: "Digital",
  },
  {
    id: "is_caregiver",
    label: "Caregiver Role",
    description: "Caring for elderly or disabled family members",
    icon: UserPlus,
    category: "Family",
  },
  {
    id: "is_homeowner",
    label: "Homeowner",
    description: "Own property or real estate",
    icon: Home,
    category: "Property",
  },
  {
    id: "has_religious_or_cultural_needs",
    label: "Religious/Cultural Needs",
    description: "Specific traditions or requirements",
    icon: Sparkles,
    category: "Personal",
  },
  {
    id: "is_business_owner",
    label: "Business Owner",
    description: "Own or operate a business",
    icon: Building,
    category: "Financial",
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const {
    profileAnswers,
    isComplete,
    completedCount,
    totalQuestions,
    clearProfile,
    isLoading,
  } = useGuestProfile();

  const progressPercent = (completedCount / totalQuestions) * 100;

  // Count how many "Yes" answers affect the assessment
  const yesCount = Object.values(profileAnswers).filter((v) => v === "yes").length;
  const noCount = Object.values(profileAnswers).filter((v) => v === "no").length;

  const handleClearProfile = () => {
    clearProfile();
    toast.success("Profile cleared successfully");
  };

  const handleEditProfile = () => {
    // Navigate to readiness with a flag to edit profile
    navigate("/readiness?edit=profile");
  };

  const handleStartProfile = () => {
    navigate("/readiness");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20">
              <UserCircle className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                Your Profile
              </h1>
              <p className="text-muted-foreground font-body mt-1">
                Personalize your Rest Easy experience
              </p>
            </div>
          </div>

          {/* Completion Card */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                )}
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    {isComplete ? "Profile Complete" : "Profile Incomplete"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {completedCount} of {totalQuestions} questions answered
                  </p>
                </div>
              </div>
              <span className="text-2xl font-display font-bold text-primary">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </Card>

          {/* Empty State */}
          {completedCount === 0 && (
            <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    Set up your profile
                  </h3>
                  <p className="text-muted-foreground font-body mt-2 max-w-md mx-auto">
                    Answer 8 quick questions to personalize your Life Readiness assessment. 
                    Your profile will automatically skip questions that don't apply to you.
                  </p>
                </div>
                <Button
                  onClick={handleStartProfile}
                  size="lg"
                  className="mt-4 gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Profile Answers Grid */}
          {completedCount > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-foreground">
                  About Your Life
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditProfile}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              </div>

              <div className="grid gap-3">
                {PROFILE_QUESTIONS.map((question) => {
                  const answer = profileAnswers[question.id];
                  const Icon = question.icon;
                  const isYes = answer === "yes";

                  return (
                    <Card
                      key={question.id}
                      className={`p-4 transition-all duration-200 ${
                        answer
                          ? "bg-card/80 border-border/50"
                          : "bg-muted/30 border-dashed border-border/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                            isYes
                              ? "bg-primary/10 text-primary"
                              : answer
                              ? "bg-muted text-muted-foreground"
                              : "bg-muted/50 text-muted-foreground/50"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-body font-medium text-foreground truncate">
                            {question.label}
                          </h4>
                          <p className="text-sm text-muted-foreground font-body truncate">
                            {question.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {answer ? (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                isYes
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isYes ? "Yes" : "No"}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/50 font-body">
                              Not answered
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assessment Impact */}
          {isComplete && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Assessment Impact
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Based on your profile, your Life Readiness assessment will be personalized:
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 p-3 rounded-lg bg-background/50">
                    <div className="text-2xl font-display font-bold text-primary">
                      {yesCount}
                    </div>
                    <div className="text-xs text-muted-foreground font-body">
                      Areas included
                    </div>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-background/50">
                    <div className="text-2xl font-display font-bold text-muted-foreground">
                      {noCount}
                    </div>
                    <div className="text-xs text-muted-foreground font-body">
                      Sections skipped
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          {completedCount > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <Button
                onClick={handleEditProfile}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear your profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all your profile answers. You'll need to answer
                      the profile questions again when taking the Life Readiness assessment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearProfile}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear Profile
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Start Assessment CTA */}
          {isComplete && (
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display font-semibold text-foreground">
                    Ready for your assessment?
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    Your profile is complete. Start your personalized Life Readiness assessment.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/readiness")}
                  size="lg"
                  className="gap-2 whitespace-nowrap"
                >
                  Start Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
