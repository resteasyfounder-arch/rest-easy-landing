import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { LogOut, RotateCcw } from "lucide-react";
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
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
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
      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <WelcomeHeader />
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>

        {/* Main Score Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Score/Progress Circle */}
              <div className="flex-shrink-0">
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

              {/* Score/Progress Details */}
              <div className="flex-1 text-center sm:text-left space-y-4">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
                    {isComplete ? "Your Readiness Score" : "Your Assessment Progress"}
                  </h2>
                  {isComplete ? (
                    <div className="mt-2">
                      <TierBadge tier={assessmentState.tier} size="md" />
                    </div>
                  ) : hasStarted && (
                    <p className="mt-2 text-primary font-medium">
                      {getProgressMessage()}
                    </p>
                  )}
                </div>

                {!isComplete && hasStarted && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {completedSectionsCount} of {totalSections} sections completed
                      </span>
                      <span className="font-medium">{Math.round(assessmentState.overall_progress)}%</span>
                    </div>
                    <Progress value={assessmentState.overall_progress} className="h-2" />
                    <p className="text-sm text-muted-foreground/80 italic">
                      Complete all sections to see your personalized Readiness Score
                    </p>
                  </div>
                )}

                {isComplete && assessmentState.report_status !== "not_started" && (
                  <div className="pt-2">
                    <ReportStatusBadge status={assessmentState.report_status} />
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <AssessmentCTA assessmentState={assessmentState} className="w-full sm:w-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Profile Progress (if not complete) */}
        {!assessmentState.profile_complete && (
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-medium text-foreground">Profile Completion</h3>
                <span className="text-sm text-muted-foreground">
                  {assessmentState.profile_progress}%
                </span>
              </div>
              <Progress value={assessmentState.profile_progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Complete your profile to personalize your assessment
              </p>
            </CardContent>
          </Card>
        )}

        {/* Section Progress */}
        {hasStarted && applicableSections.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Assessment Sections
              </h2>
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

            <div className="grid gap-3 sm:grid-cols-2">
              {applicableSections.map((section) => (
                <SectionProgressCard
                  key={section.id}
                  section={section}
                  onClick={() => navigate(`/readiness?section=${section.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State - Not Started */}
        {!hasStarted && (
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="p-8 text-center">
              <div className="max-w-sm mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Ready to Begin?
                </h3>
                <p className="text-muted-foreground font-body">
                  Take our comprehensive readiness assessment to understand where you stand
                  and get personalized guidance for your journey.
                </p>
                <AssessmentCTA assessmentState={assessmentState} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
