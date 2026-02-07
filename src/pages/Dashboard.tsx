import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { useImprovementItems } from "@/hooks/useImprovementItems";
import { useRemySurface } from "@/hooks/useRemySurface";
import { LogOut, RotateCcw, Heart, Trophy, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { RemyBriefCard } from "@/components/remy/RemyBriefCard";
import {
  ReportStatusBadge,
  AssessmentCTA,
  WelcomeHeader,
  ReportSummaryCard,
  ReadinessScoreCard,
  VaultPreviewCard,
  RoadmapCard,
  QuestionEditModal,
  QuickStatsStrip,
  UnlockTeaserCard,
  ProfileNudge,
  ProgressHero,
  JourneyTimeline,
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

const STORAGE_KEYS = {
  subjectId: "rest-easy.readiness.subject_id",
};

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isStartingFresh, setIsStartingFresh] = useState(false);
  const {
    assessmentState,
    isLoading,
    hasStarted,
    isComplete,
    isReportReady,
    isReportGenerating,
    reportPreview,
    isLoadingReport,
    startFresh,
  } = useAssessmentState({
    autoRefresh: true,
    refreshInterval: 30000,
    includeReportPreview: true,
  });

  // Get subject_id from localStorage for the improvement items hook
  const [subjectId, setSubjectId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedSubjectId = localStorage.getItem(STORAGE_KEYS.subjectId);
    setSubjectId(storedSubjectId);
  }, []);

  // Backfill subject id from server state if localStorage wasn't populated yet
  useEffect(() => {
    if (!subjectId && assessmentState.subject_id) {
      setSubjectId(assessmentState.subject_id);
      localStorage.setItem(STORAGE_KEYS.subjectId, assessmentState.subject_id);
    }
  }, [subjectId, assessmentState.subject_id]);

  const {
    payload: remyPayload,
    isLoading: isLoadingRemy,
    error: remyError,
    dismissNudge,
    acknowledgeAction,
    refresh: refreshRemy,
  } = useRemySurface({
    subjectId: subjectId || assessmentState.subject_id || null,
    surface: "dashboard",
    enabled: hasStarted,
  });

  // Fetch schema-driven improvement items for the roadmap
  const {
    items: improvementItems,
    completedItems,
    isLoading: isLoadingRoadmap,
    refresh: refreshRoadmap,
  } = useImprovementItems({
    subjectId,
    enabled: isComplete && isReportReady,
  });

  // Question edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<import("@/types/assessment").RoadmapItem | null>(null);

  const handleEditQuestion = (item: import("@/types/assessment").RoadmapItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditingItem(null);
    refreshRoadmap();
  };

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
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const applicableSections = assessmentState.sections.filter((s) => s.is_applicable);
  const completedSectionsCount = applicableSections.filter((s) => s.progress === 100).length;
  const totalSections = applicableSections.length;
  const sectionsRemaining = totalSections - completedSectionsCount;

  // Find the next section to continue
  const nextSection = applicableSections.find(
    (s) => s.status === "in_progress" || s.status === "available"
  );

  // Calculate totals for quick stats
  const totalQuestionsAnswered = applicableSections.reduce((acc, s) => acc + s.questions_answered, 0);
  const totalQuestions = applicableSections.reduce((acc, s) => acc + s.questions_total, 0);

  // Estimate remaining time (assume ~30 seconds per question)
  const remainingQuestions = totalQuestions - totalQuestionsAnswered;
  const estimatedMinutes = Math.max(1, Math.ceil(remainingQuestions * 0.5));

  // Calculate action metrics from schema-driven roadmap
  const actionsTotal = improvementItems.length + completedItems.length;
  const actionsRemaining = improvementItems.length;

  // Check for locked sections (for profile nudge)
  const lockedSectionsCount = assessmentState.sections.filter(
    (s) => s.status === "locked"
  ).length;

  const handleSectionClick = (sectionId: string) => {
    navigate(`/readiness?section=${sectionId}`);
  };

  const handleContinue = (sectionId: string) => {
    navigate(`/readiness?section=${sectionId}`);
  };

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <WelcomeHeader
            userName={reportPreview?.userName}
            assessedDate={reportPreview?.generatedAt}
            hasStarted={hasStarted}
            isComplete={isComplete}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>

        {hasStarted && (
          <RemyBriefCard
            payload={remyPayload}
            isLoading={isLoadingRemy}
            error={remyError}
            onDismiss={(nudgeId) => dismissNudge(nudgeId, 24)}
            onAcknowledge={acknowledgeAction}
            onRetry={refreshRemy}
          />
        )}

        {/* ==================== COMPLETED ASSESSMENT VIEW ==================== */}
        {isComplete ? (
          <div className="space-y-6 animate-fade-in">
            {/* Report generating indicator */}
            {isReportGenerating && (
              <div className="flex justify-center">
                <ReportStatusBadge status="generating" />
              </div>
            )}

            {/* Top Row: Score Card + Vault Card */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <ReadinessScoreCard
                score={assessmentState.overall_score}
                tier={assessmentState.tier}
                actionsRemaining={actionsRemaining}
                actionsTotal={actionsTotal}
                sections={assessmentState.sections}
                onViewByCategory={() => navigate("/results#categories")}
                className="lg:col-span-3"
              />
              <VaultPreviewCard className="lg:col-span-2" />
            </div>

            {/* Report Summary Card */}
            {reportPreview?.executive_summary && (
              <ReportSummaryCard
                summary={reportPreview.executive_summary}
                metrics={reportPreview.metrics}
                strengths={reportPreview.strengths}
                areasToImprove={reportPreview.areas_requiring_attention}
                onViewReport={() => navigate("/results")}
              />
            )}

            {/* Roadmap Card - Schema-driven */}
            {(improvementItems.length > 0 || completedItems.length > 0 || isLoadingRoadmap) && (
              <RoadmapCard
                items={improvementItems}
                completedItems={completedItems}
                isLoading={isLoadingRoadmap}
                onViewAll={() => navigate("/results#action-plan")}
                onEditQuestion={handleEditQuestion}
              />
            )}

            {/* Question Edit Modal */}
            <QuestionEditModal
              open={editModalOpen}
              onOpenChange={setEditModalOpen}
              item={editingItem}
              subjectId={subjectId || ""}
              onSuccess={handleEditSuccess}
            />
          </div>
        ) : hasStarted ? (
          /* ==================== IN-PROGRESS ASSESSMENT VIEW (Journey Design) ==================== */
          <div className="space-y-8">
            {/* Progress Hero - Narrative focused */}
            <ProgressHero
              overallProgress={assessmentState.overall_progress}
              sectionsRemaining={sectionsRemaining}
              currentSectionLabel={nextSection?.label}
              estimatedMinutes={estimatedMinutes}
              onContinue={() => nextSection && handleContinue(nextSection.id)}
            />

            {/* Quick Stats Strip */}
            <QuickStatsStrip
              estimatedMinutes={estimatedMinutes}
              questionsAnswered={totalQuestionsAnswered}
              questionsTotal={totalQuestions}
              sectionsCompleted={completedSectionsCount}
              sectionsTotal={totalSections}
            />

            {/* Profile Nudge - Only when relevant */}
            {!assessmentState.profile_complete && lockedSectionsCount > 0 && (
              <ProfileNudge
                lockedSectionsCount={lockedSectionsCount}
                onComplete={() => navigate("/profile")}
              />
            )}

            {/* Journey Timeline */}
            {applicableSections.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <h2 className="font-display text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Your Journey
                  </h2>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <JourneyTimeline
                  sections={applicableSections}
                  onSectionClick={handleSectionClick}
                  onContinue={handleContinue}
                />
              </div>
            )}

            {/* Unlock Teaser Cards */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <h2 className="font-display text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  What You'll Unlock
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <UnlockTeaserCard
                  title="Your Readiness Score"
                  description="See how prepared you are across all areas"
                  icon={Trophy}
                  showScorePreview={true}
                />
                <UnlockTeaserCard
                  title="Your Action Roadmap"
                  description="Personalized steps to improve your readiness"
                  icon={Map}
                  previewItems={[
                    "Prioritized action items",
                    "Quick wins to start today",
                    "Expert guidance tailored to you",
                  ]}
                />
              </div>
            </div>

            {/* Start Fresh */}
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
        ) : (
          /* ==================== NOT STARTED (EMPTY STATE) ==================== */
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-soft">
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
                    Take a few moments to understand your readiness. Our gentle assessment will help
                    you see where you stand and guide your next steps.
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
