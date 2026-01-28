import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import { useImprovementItems } from "@/hooks/useImprovementItems";
import { LogOut, RotateCcw, Target, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { RoadmapRow } from "@/components/dashboard/RoadmapRow";
import { motion } from "framer-motion";
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

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20
    }
  },
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
    startFresh,
  } = useAssessmentState({
    autoRefresh: true,
    refreshInterval: 30000,
    includeReportPreview: true,
  });

  const [subjectId, setSubjectId] = useState<string | null>(null);
  useEffect(() => {
    const storedSubjectId = localStorage.getItem(STORAGE_KEYS.subjectId);
    setSubjectId(storedSubjectId);
  }, []);

  const {
    items: improvementItems,
  } = useImprovementItems({
    subjectId,
    enabled: isComplete && isReportReady,
  });

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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto p-8 space-y-12">
          <div className="space-y-4">
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const applicableSections = assessmentState.sections.filter((s) => s.is_applicable);

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-6 py-12 md:py-20 space-y-20"
      >

        {/* Header Zone */}
        <motion.section variants={itemVariants} className="space-y-8 relative">
          {/* Decorative Blur behind header */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
                Member Dashboard
              </span>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[0.9]">
                {isComplete ? "Your Profile" : "Your Sanctuary"}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-body max-w-lg leading-relaxed pt-2">
                {isComplete
                  ? "Here is your personalized roadmap to peace of mind."
                  : "Let’s take this one step at a time. No rush, just progress."}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" /> Log Out
            </Button>
          </div>

          {!isComplete && hasStarted && (
            <div className="flex items-center gap-6 p-8 bg-card/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="p-3 bg-white rounded-full shadow-soft">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 space-y-2 relative z-10">
                <div className="flex justify-between text-base font-medium">
                  <span className="text-foreground font-display">Current Progress</span>
                  <span className="text-primary">{Math.round(assessmentState.overall_progress)}%</span>
                </div>
                <Progress value={assessmentState.overall_progress} className="h-3 bg-secondary" />
              </div>
            </div>
          )}
        </motion.section>

        {/* Main Content Area */}
        <div className="space-y-20">

          {/* 1. Assessment Status */}
          <section>
            <motion.div variants={itemVariants}>
              <SectionHeader
                kicker="Step 01"
                title="Assessment Journey"
                subtitle="Complete these sections to unlock your personalized score and roadmap."
              />
            </motion.div>

            <motion.div variants={containerVariants} className="space-y-3">
              {/* Profile Step */}
              <motion.div variants={itemVariants}>
                <RoadmapRow
                  title="Profile Setup"
                  description="Tell us a bit about you to personalize the experience."
                  status={assessmentState.profile_complete ? "completed" : "in_progress"}
                  onClick={() => navigate("/profile")}
                />
              </motion.div>

              {/* Assessment Sections */}
              {applicableSections.map((section) => (
                <motion.div key={section.id} variants={itemVariants}>
                  <RoadmapRow
                    title={section.title}
                    description={section.description || "Review your readiness in this area."}
                    status={
                      section.progress === 100 ? "completed" :
                        section.status === "available" || section.status === "in_progress" ? "in_progress" : "locked"
                    }
                    onClick={() => navigate(`/readiness?section=${section.id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State CTA for new users */}
            {!hasStarted && !isComplete && (
              <motion.div variants={itemVariants} className="mt-12">
                <Button
                  size="lg"
                  className="group relative h-16 px-10 rounded-full text-lg shadow-elevated overflow-hidden"
                  onClick={() => navigate("/readiness")}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Begin Assessment <Play className="h-5 w-5 fill-current" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>
              </motion.div>
            )}
          </section>

          {/* 2. Results & Reports */}
          <section>
            <motion.div variants={itemVariants}>
              <SectionHeader
                kicker="Step 02"
                title="Your Report"
                subtitle="The insights generated from your answers."
              />
            </motion.div>

            <motion.div variants={containerVariants} className="space-y-3">
              <motion.div variants={itemVariants}>
                <RoadmapRow
                  title="Readiness Score & Analysis"
                  description={isComplete ? "View your detailed score breakdown and tier." : "Complete assessment to unlock."}
                  status={isComplete ? "available" : "locked"}
                  onClick={() => navigate("/results")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <RoadmapRow
                  title="Action Roadmap"
                  description={
                    isComplete
                      ? `You have ${improvementItems.length} recommended actions remaining.`
                      : "Unlock your personalized to-do list."
                  }
                  status={isComplete ? "available" : "locked"}
                  onClick={() => navigate("/results#action-plan")}
                />
              </motion.div>
            </motion.div>
          </section>

          {/* Footer Actions */}
          <motion.section variants={itemVariants} className="pt-8 border-t border-border/40 flex justify-center opacity-60 hover:opacity-100 transition-opacity">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-destructive text-sm">
                  <RotateCcw className="h-3.5 w-3.5 mr-2" /> Start Over
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start Fresh?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear your current progress and start a new assessment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStartFresh}>Yes, Start Fresh</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.section>

        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
