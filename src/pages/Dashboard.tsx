import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { LogOut, RotateCcw, Target, Heart, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import {
  ScoreCircle,
  ProgressCircle,
  SectionProgressCard,
  ReportStatusBadge,
  AssessmentCTA,
  WelcomeHeader,
  TierBadge,
} from "@/components/dashboard";
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

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isStartingFresh, setIsStartingFresh] = useState(false);
  const {
    assessmentState,
    isLoading,
    hasStarted,
    isComplete,
    startFresh,
  } = useAssessmentState({ autoRefresh: true, refreshInterval: 30000 });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleStartFresh = async () => {
    setIsStartingFresh(true);
    try {
      await startFresh();
      toast.success("Started fresh! Your previous assessment has been archived.");
    } catch (error) {
      toast.error("Failed to start fresh. Please try again.");
    } finally {
      setIsStartingFresh(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const applicableSections = assessmentState.sections.filter((s) => s.is_applicable);
  const completedSectionsCount = applicableSections.filter((s) => s.progress === 100).length;
  const totalSections = applicableSections.length;

  // Motivational message based on progress
  const getProgressMessage = () => {
    if (completedSectionsCount === 0) return "Ready to begin your journey?";
    if (completedSectionsCount === 1) return "Great start! Keep going.";
    if (assessmentState.overall_progress < 50) return "You're making progress!";
    if (assessmentState.overall_progress < 75) return "More than halfway there!";
    if (assessmentState.overall_progress < 100) return "Almost finished!";
    return "Assessment complete!";
  };

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 space-y-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <WelcomeHeader hasStarted={hasStarted} isComplete={isComplete} />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>

        {/* Main Progress Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden shadow-sm">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Score/Progress Circle with animation */}
              <div className="animate-fade-in">
                {isComplete ? (
                  <ScoreCircle
                    score={assessmentState.overall_score}
                    tier={assessmentState.tier}
                    size="lg"
                    animated={true}
                  />
                ) : (
                  <ProgressCircle
                    progress={assessmentState.overall_progress}
                    size="lg"
                    animated={true}
                  />
                )}
              </div>

              {/* Progress Details */}
              <div className="space-y-4 max-w-sm">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
                  {isComplete ? "Your Readiness Score" : "Your Journey Progress"}
                </h2>
                
                {isComplete ? (
                  <div className="space-y-3">
                    <TierBadge tier={assessmentState.tier} size="md" />
                    {assessmentState.report_status !== "not_started" && (
                      <div className="pt-2">
                        <ReportStatusBadge status={assessmentState.report_status} />
                      </div>
                    )}
                  </div>
                ) : hasStarted ? (
                  <div className="space-y-4">
                    {/* Milestone chip */}
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <Target className="h-3.5 w-3.5" />
                        {completedSectionsCount} of {totalSections} sections completed
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="space-y-2">
                      <Progress value={assessmentState.overall_progress} className="h-2" />
                      <p className="text-primary font-medium text-sm">
                        {getProgressMessage()}
                      </p>
                    </div>

                    {/* Encouraging prompt */}
                    <p className="text-muted-foreground/80 text-sm italic">
                      Complete all sections to reveal your personalized Readiness Score
                    </p>
                  </div>
                ) : null}
              </div>

              {/* CTA */}
              <AssessmentCTA assessmentState={assessmentState} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion Card */}
        {!assessmentState.profile_complete && (
          <Card className="border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 dark:border-amber-800/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-medium text-foreground">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us personalize your assessment experience
                  </p>
                  <div className="mt-3 space-y-1">
                    <Progress value={assessmentState.profile_progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {assessmentState.profile_progress}% complete
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Progress - Journey Style */}
        {hasStarted && applicableSections.length > 0 && (
          <div className="space-y-5">
            {/* Journey section header */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <h2 className="font-display text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Your Assessment Journey
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Stacked sections */}
            <div className="space-y-3">
              {applicableSections.map((section) => (
                <SectionProgressCard
                  key={section.id}
                  section={section}
                  onClick={() => navigate(`/readiness?section=${section.id}`)}
                />
              ))}
            </div>

            {/* Quieter Start Fresh at bottom */}
            <div className="pt-6 border-t border-border/50 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Need to begin again?</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground hover:text-destructive"
                      disabled={isStartingFresh}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Start Fresh
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Start a Fresh Assessment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will archive your current assessment and start a new one from scratch. 
                        Your previous answers will be saved but no longer active.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleStartFresh}>
                        Yes, Start Fresh
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - Not Started */}
        {!hasStarted && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-sm">
            <CardContent className="p-10 text-center">
              <div className="max-w-md mx-auto space-y-6">
                {/* Warm illustration */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    Welcome to Rest Easy
                  </h3>
                  <p className="text-muted-foreground font-body leading-relaxed">
                    Take a few moments to understand your readiness. 
                    Our gentle assessment will help you see where you stand 
                    and guide your next steps.
                  </p>
                </div>
                
                <AssessmentCTA assessmentState={assessmentState} />
                
                <p className="text-xs text-muted-foreground/70">
                  Takes about 15-20 minutes • Save progress anytime
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
