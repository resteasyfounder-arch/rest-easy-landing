import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProfileReview from "@/components/assessment/ProfileReview";
import { ProfilePromptModal } from "@/components/profile/ProfilePromptModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft, X, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import {
  GentleIntro,
  
  AutosaveIndicator,
} from "@/components/assessment/shared";
import AnswerButton from "@/components/assessment/shared/AnswerButton";
import {
  JourneySidebar,
  JourneyHeader,
  JourneyDrawer,
  AnimatedQuestionCard,
  SectionComplete,
} from "@/components/assessment/journey";
import SectionSummary from "@/components/assessment/SectionSummary";
import SectionAnswerList from "@/components/assessment/SectionAnswerList";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";

type FlowPhase = "intro" | "profile" | "profile-review" | "assessment" | "section-summary" | "section-edit" | "review" | "complete";

type AnswerValue = "yes" | "partial" | "no" | "not_sure" | "na";

type SchemaOption = {
  value: AnswerValue;
  label: string;
  score_value?: AnswerValue;
};

type SchemaQuestion = {
  id: string;
  item_id: string;
  section_id: string;
  dimension: string;
  weight: number;
  prompt: string;
  type: string;
  options: SchemaOption[];
  applies_if?: string;
  system_na?: boolean;
  question_meta?: Record<string, unknown>;
};

type ProfileQuestion = {
  id: string;
  field: string;
  prompt: string;
  type: string;
  options: Array<{ value: "yes" | "no"; label: string }>;
  value_map: Record<"yes" | "no", boolean>;
};

type SchemaSection = {
  id: string;
  label: string;
  dimension: string;
  weight: number;
};

type Schema = {
  assessment_id: string;
  version: string;
  sections: SchemaSection[];
  answer_scoring: Record<AnswerValue, number | null>;
  profile_questions: ProfileQuestion[];
  questions: SchemaQuestion[];
};

type AnswerRecord = {
  question_id: string;
  item_id: string;
  section_id: string;
  dimension: string;
  answer_value: AnswerValue;
  answer_label?: string;
  score_fraction?: number | null;
  question_text?: string;
  question_meta?: Record<string, unknown>;
};

const ASSESSMENT_ID = "readiness_v1";
const SCHEMA_VERSION = "v1";

// Only keep subject_id in localStorage for session continuity
const STORAGE_KEYS = {
  subjectId: "rest-easy.readiness.subject_id",
};

const evaluateCondition = (
  expression: string | undefined,
  profile: Record<string, unknown>,
  answers: Record<string, AnswerValue>
) => {
  if (!expression || expression === "always") {
    return true;
  }

  const listPattern = /([^\s]+)\s+in\s+(\[[^\]]+\])/g;
  let jsExpression = expression.replace(/\band\b/g, "&&").replace(/\bor\b/g, "||");
  jsExpression = jsExpression.replace(listPattern, (_match, left, list) => {
    return `${list}.includes(${left})`;
  });

  try {
    const fn = new Function("profile", "answers", `return (${jsExpression});`);
    return Boolean(fn(profile, answers));
  } catch (_err) {
    return false;
  }
};

const setNestedValue = (
  target: Record<string, unknown>,
  path: string,
  value: unknown
) => {
  const parts = path.split(".");
  const next = { ...target };
  let cursor: Record<string, unknown> = next;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    const child = cursor[key];
    cursor[key] = typeof child === "object" && child !== null ? { ...child } : {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
};

const callAgent = async (payload: Record<string, unknown>) => {
  return invokeAuthedFunction<Record<string, unknown>>("agent", payload);
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <AppLayout hideNav>
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <header className="px-4 py-4 flex items-center justify-between">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-10" />
      </header>
      <main className="flex-1 px-6 py-8 space-y-6">
        <div className="max-w-md mx-auto space-y-6">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  </AppLayout>
);

// Error state component
const ErrorState = ({ 
  error, 
  onRetry, 
  onExit 
}: { 
  error: string; 
  onRetry: () => void; 
  onExit: () => void;
}) => (
  <AppLayout hideNav>
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-hero">
      <div className="text-center space-y-6 max-w-sm">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Unable to load assessment
          </h1>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            {error}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={onRetry} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={onExit} className="w-full">
            Go Back Home
          </Button>
        </div>
      </div>
    </div>
  </AppLayout>
);

const Readiness = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Flow phase state - initialized to "intro", will be hydrated from server
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("intro");

  const [subjectId, setSubjectId] = useState<string | null>(
    localStorage.getItem(STORAGE_KEYS.subjectId)
  );
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // State hydrated from server - no localStorage initialization
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [profileAnswers, setProfileAnswers] = useState<Record<string, "yes" | "no">>({});
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});

  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(() => {
    return sessionStorage.getItem("rest-easy.profile-prompt-dismissed") === "true";
  });
  const [lastSaved, setLastSaved] = useState(false);
  const [showJourneyDrawer, setShowJourneyDrawer] = useState(false);
  const [recentlySelected, setRecentlySelected] = useState<string | null>(null);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const [viewingCompletedSection, setViewingCompletedSection] = useState(false);
  const [sectionQuestionSnapshot, setSectionQuestionSnapshot] = useState<Record<string, number>>({});
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [hasPendingNavigation, setHasPendingNavigation] = useState(false);

  // Flow phase is now server-driven, no localStorage persistence needed

  // Legacy report generation state - kept for minimal refactor, but auto-generation is disabled
  // Report generation now happens server-side in the agent edge function

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setFatalError(null);
    try {
      const [schemaResponse, sessionResponse] = await Promise.all([
        callAgent({
          action: "get_schema",
          assessment_id: ASSESSMENT_ID,
          schema_version: SCHEMA_VERSION,
        }),
        callAgent({
          action: "get_state",
          assessment_id: ASSESSMENT_ID,
        }),
      ]);

      setSchema(schemaResponse.schema as Schema);
      
      // Hydrate ALL state from server response
      if (sessionResponse?.subject_id) {
        setSubjectId(sessionResponse.subject_id as string);
        localStorage.setItem(STORAGE_KEYS.subjectId, sessionResponse.subject_id as string);
      }
      if (sessionResponse?.assessment_id) {
        setAssessmentId(sessionResponse.assessment_id as string);
      }
      
      // Hydrate state from server
      const assessmentState = sessionResponse?.assessment_state as Record<string, unknown> | undefined;
      if (assessmentState) {
        setProfile((assessmentState.profile_data as Record<string, unknown>) || {});
        setProfileAnswers((assessmentState.profile_answers as Record<string, "yes" | "no">) || {});
        setAnswers((assessmentState.answers as Record<string, AnswerRecord>) || {});
        
        const hydratedPhase = assessmentState.flow_phase === "complete" ? "review" : ((assessmentState.flow_phase as FlowPhase) || "intro");
        setFlowPhase(hydratedPhase);
        
        console.log("[Readiness] Hydrated from server:", {
          profileAnswerCount: Object.keys((assessmentState.profile_answers as Record<string, unknown>) || {}).length,
          answerCount: Object.keys((assessmentState.answers as Record<string, unknown>) || {}).length,
          serverFlowPhase: assessmentState.flow_phase,
          clientFlowPhase: hydratedPhase,
        });
      }
    } catch (err) {
      setFatalError(err instanceof Error ? err.message : "Unable to load readiness.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL parameter handling moved below applicableSections definition

  // Detect and reset stale flow phase
  // If flowPhase is "complete" but we have no answers, reset to intro
  // IMPORTANT: Only reset if not coming from a URL parameter navigation
  useEffect(() => {
    if (loading) return;
    
    // Don't reset if we have a section URL param - that takes priority
    const sectionParam = searchParams.get("section");
    if (sectionParam) return;
    
    const hasAnswers = Object.keys(answers).length > 0;
    const hasProfileAnswers = Object.keys(profileAnswers).length > 0;
    
    if (flowPhase === "complete" && !hasAnswers) {
      console.log("[Readiness] Resetting stale complete phase - no answers found");
      setFlowPhase("intro");
      setAssessmentId(null);
    }
    
    // If we're in assessment phase but have no applicable questions answered,
    // and profile isn't complete, go back to profile
    if (flowPhase === "assessment" && !hasAnswers && !hasProfileAnswers && schema) {
      console.log("[Readiness] No progress detected, resetting to intro");
      setFlowPhase("intro");
    }
  }, [loading, flowPhase, answers, profileAnswers, schema, searchParams]);

  // Check if profile is already complete on initial load
  useEffect(() => {
    if (!schema || loading) return;
    if (flowPhase !== "intro") return;
    
    // Don't interfere if we have a section URL param
    const sectionParam = searchParams.get("section");
    if (sectionParam) return;

    const totalProfileQuestions = schema.profile_questions.length;
    const answeredProfileQuestions = Object.keys(profileAnswers).length;
    
    if (answeredProfileQuestions >= totalProfileQuestions) {
      setFlowPhase("assessment");
    } else if (!profilePromptDismissed && answeredProfileQuestions < totalProfileQuestions) {
      setShowProfilePrompt(true);
    }
  }, [schema, loading, flowPhase, profileAnswers, profilePromptDismissed, searchParams]);

  // State is now server-driven, no localStorage persistence for profile/answers

  const answerValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, value.answer_value])
    ) as Record<string, AnswerValue>;
  }, [answers]);

  const applicableQuestions = useMemo(() => {
    if (!schema) return [];
    return schema.questions.filter((question) =>
      evaluateCondition(question.applies_if, profile, answerValues)
    );
  }, [schema, profile, answerValues]);

  // Check if assessment is actually complete (all applicable questions answered)
  const isAssessmentComplete = useMemo(() => {
    if (!schema || applicableQuestions.length === 0) return false;
    const answeredCount = applicableQuestions.filter(q => answers[q.id]).length;
    return answeredCount === applicableQuestions.length;
  }, [schema, applicableQuestions, answers]);

  // If we're in assessment phase and all questions are answered, show completion screen
  useEffect(() => {
    if (loading || !schema) return;
    
    // Don't interfere if we have a section URL param
    const sectionParam = searchParams.get("section");
    if (sectionParam) return;
    
    if (flowPhase === "assessment" && isAssessmentComplete && applicableQuestions.length > 0) {
      console.log("[Readiness] Assessment complete, showing completion screen");
      setFlowPhase("complete");
    }
  }, [loading, schema, flowPhase, isAssessmentComplete, applicableQuestions.length, searchParams]);

  // Filter sections to only show those with applicable questions
  const applicableSections = useMemo(() => {
    if (!schema) return [];
    return schema.sections.filter(section => {
      const sectionQuestions = applicableQuestions.filter(q => q.section_id === section.id);
      return sectionQuestions.length > 0;
    });
  }, [schema, applicableQuestions]);

  // Handle URL parameters for section and question navigation
  // Must be after applicableSections and applicableQuestions are defined
  useEffect(() => {
    if (loading || !schema) return;
    
    const sectionParam = searchParams.get("section");
    const questionParam = searchParams.get("question");
    const returnToParam = searchParams.get("returnTo");
    
    if (!sectionParam && !questionParam) return;

    // Prevent complete-phase UI/effects from taking over while we process URL-based navigation.
    setHasPendingNavigation(true);
    
    console.log("[Readiness] URL params - section:", sectionParam, "question:", questionParam, "returnTo:", returnToParam);
    
    // Store returnTo destination if coming from dashboard
    if (returnToParam) {
      setReturnTo(returnToParam);
    }

    const clearUrlParams = () => setSearchParams({}, { replace: true });
    
    // If we have a specific question, find it and navigate directly to it
    if (questionParam) {
      const targetQuestion = applicableQuestions.find(q => q.id === questionParam);
      if (targetQuestion) {
        console.log("[Readiness] Navigating directly to question:", questionParam);
        const allQuestionsAnswered = applicableQuestions.every(q => answers[q.id]);
        setFocusedSectionId(targetQuestion.section_id);
        setFlowPhase(allQuestionsAnswered ? "review" : "assessment");
        setCurrentStepId(`question:${questionParam}`);
        clearUrlParams();
        setHasPendingNavigation(false);
        return;
      } else {
        console.log("[Readiness] Question not found or not applicable:", questionParam);
      }
    }
    
    // Fall back to section navigation if no question param or question not found
    if (sectionParam) {
      // Check if section exists and is applicable
      const section = applicableSections.find(s => s.id === sectionParam);
      if (!section) {
        console.log("[Readiness] Section not found or not applicable:", sectionParam);
        // Keep URL params intact for debugging/retry.
        setHasPendingNavigation(false);
        return;
      }
      
      // Find questions for this section
      const sectionQuestions = applicableQuestions.filter(q => q.section_id === sectionParam);
      const answeredInSection = sectionQuestions.filter(q => answers[q.id]).length;
      const sectionIsComplete = answeredInSection === sectionQuestions.length && sectionQuestions.length > 0;
      
      // Check if entire assessment is complete
      const allQuestionsAnswered = applicableQuestions.every(q => answers[q.id]);
      
      if (sectionIsComplete) {
        // Section is complete - show section summary for review
        console.log("[Readiness] Section complete, showing summary");
        setFocusedSectionId(sectionParam);
        setFlowPhase("section-summary");
        clearUrlParams();
        setHasPendingNavigation(false);
        return;
      }
      
      // Section has unanswered questions - go to first unanswered
      const firstUnanswered = sectionQuestions.find(q => !answers[q.id]);
      if (firstUnanswered) {
        console.log("[Readiness] Navigating to first unanswered in section");
        setFocusedSectionId(sectionParam);
        // Use "review" phase for completed assessments, "assessment" for incomplete
        setFlowPhase(allQuestionsAnswered ? "review" : "assessment");
        setCurrentStepId(`question:${firstUnanswered.id}`);
        clearUrlParams();
        setHasPendingNavigation(false);
      } else if (sectionQuestions.length > 0) {
        // All questions in section answered - show first question in review mode
        console.log("[Readiness] Section fully answered, showing in review mode");
        setFocusedSectionId(sectionParam);
        setFlowPhase(allQuestionsAnswered ? "review" : "assessment");
        setCurrentStepId(`question:${sectionQuestions[0].id}`);
        clearUrlParams();
        setHasPendingNavigation(false);
      }
    }

    setHasPendingNavigation(false);
  }, [loading, schema, searchParams, applicableSections, applicableQuestions, answers, setSearchParams]);

  const completedQuestionCount = useMemo(() => {
    const applicableIds = new Set(applicableQuestions.map((question) => question.id));
    return Object.keys(answers).filter((key) => applicableIds.has(key)).length;
  }, [answers, applicableQuestions]);

  // Progress calculations
  const profileProgress = useMemo(() => {
    if (!schema || schema.profile_questions.length === 0) return 0;
    const completed = Object.keys(profileAnswers).length;
    return Math.round((completed / schema.profile_questions.length) * 100);
  }, [schema, profileAnswers]);

  const assessmentProgress = useMemo(() => {
    if (applicableQuestions.length === 0) return 0;
    return Math.round((completedQuestionCount / applicableQuestions.length) * 100);
  }, [applicableQuestions.length, completedQuestionCount]);

  const getNextStepId = useCallback(
    (
      currentProfileAnswers: Record<string, "yes" | "no">,
      currentAnswers: Record<string, AnswerRecord>,
      currentProfile: Record<string, unknown>
    ) => {
      if (!schema) return null;

      const nextProfile = schema.profile_questions.find(
        (question) => !currentProfileAnswers[question.id]
      );
      if (nextProfile) {
        return `profile:${nextProfile.id}`;
      }

      const currentAnswerValues = Object.fromEntries(
        Object.entries(currentAnswers).map(([key, value]) => [key, value.answer_value])
      ) as Record<string, AnswerValue>;

      const currentApplicable = schema.questions.filter((question) =>
        evaluateCondition(question.applies_if, currentProfile, currentAnswerValues)
      );

      const nextQuestion = currentApplicable.find(
        (question) => !currentAnswers[question.id]
      );
      if (nextQuestion) {
        return `question:${nextQuestion.id}`;
      }

      return null;
    },
    [schema]
  );

  const isStepApplicable = useCallback(
    (stepId: string) => {
      if (!schema) return false;
      if (stepId.startsWith("profile:")) {
        return schema.profile_questions.some((question) => `profile:${question.id}` === stepId);
      }
      if (stepId.startsWith("question:")) {
        const questionId = stepId.replace("question:", "");
        const question = schema.questions.find((item) => item.id === questionId);
        if (!question) return false;
        return evaluateCondition(question.applies_if, profile, answerValues);
      }
      return false;
    },
    [schema, profile, answerValues]
  );

  // Initialize current step when entering profile or assessment phase
  useEffect(() => {
    if (!schema || loading) return;

    if (flowPhase === "profile" && !currentStepId) {
      const firstUnansweredProfile = schema.profile_questions.find(
        (q) => !profileAnswers[q.id]
      );
      if (firstUnansweredProfile) {
        setCurrentStepId(`profile:${firstUnansweredProfile.id}`);
      } else {
        setFlowPhase("profile-review");
      }
    }

    if (flowPhase === "assessment" && !currentStepId) {
      const nextStep = getNextStepId(profileAnswers, answers, profile);
      if (nextStep) {
        setCurrentStepId(nextStep);
      } else if (isAssessmentComplete) {
        // Only go to complete if actually complete
        setFlowPhase("complete");
      }
    }

    // Handle review phase - if we're in review mode and have no currentStepId, set one
    if (flowPhase === "review" && !currentStepId && applicableQuestions.length > 0) {
      setCurrentStepId(`question:${applicableQuestions[0].id}`);
    }

    if (currentStepId && currentStepId.startsWith("question:") && !isStepApplicable(currentStepId)) {
      setCurrentStepId(getNextStepId(profileAnswers, answers, profile));
    }

    // If viewing a section that's no longer applicable, redirect
    if (focusedSectionId && !applicableSections.some(s => s.id === focusedSectionId)) {
      setFocusedSectionId(null);
      setViewingCompletedSection(false);
      const nextStep = getNextStepId(profileAnswers, answers, profile);
      setCurrentStepId(nextStep);
    }
  }, [
    schema,
    loading,
    flowPhase,
    currentStepId,
    profileAnswers,
    answers,
    profile,
    getNextStepId,
    isStepApplicable,
    focusedSectionId,
    applicableSections,
  ]);

  const currentProfileQuestion = useMemo(() => {
    if (!schema || !currentStepId?.startsWith("profile:")) return null;
    const id = currentStepId.replace("profile:", "");
    return schema.profile_questions.find((question) => question.id === id) ?? null;
  }, [schema, currentStepId]);

  const currentQuestion = useMemo(() => {
    if (!schema || !currentStepId?.startsWith("question:")) return null;
    const id = currentStepId.replace("question:", "");
    return schema.questions.find((question) => question.id === id) ?? null;
  }, [schema, currentStepId]);

  const currentSection = useMemo(() => {
    if (!schema || !currentQuestion) return null;
    return schema.sections.find((section) => section.id === currentQuestion.section_id) ?? null;
  }, [schema, currentQuestion]);

  const currentQuestionIndex = useMemo(() => {
    if (!currentQuestion) return 0;
    return applicableQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
  }, [currentQuestion, applicableQuestions]);

  // Snapshot section question count on entry so denominator stays stable
  useEffect(() => {
    const activeSectionId = currentSection?.id ?? focusedSectionId;
    if (!activeSectionId || !schema) return;

    // Only snapshot if we don't already have one for this section
    if (sectionQuestionSnapshot[activeSectionId] != null) return;

    const count = applicableQuestions.filter(q => q.section_id === activeSectionId).length;
    setSectionQuestionSnapshot(prev => ({ ...prev, [activeSectionId]: count }));
  }, [currentSection?.id, focusedSectionId, schema, applicableQuestions, sectionQuestionSnapshot]);

  // Clear snapshot when leaving a section so re-entry gets a fresh count
  const prevSectionRef = useRef<string | null>(null);
  useEffect(() => {
    const activeSectionId = currentSection?.id ?? focusedSectionId;
    const prev = prevSectionRef.current;
    prevSectionRef.current = activeSectionId;

    if (prev && prev !== activeSectionId) {
      setSectionQuestionSnapshot(old => {
        if (!(prev in old)) return old;
        const next = { ...old };
        delete next[prev];
        return next;
      });
    }
  }, [currentSection?.id, focusedSectionId]);

  // Section-specific question progress (more stable UX than global count)
  const currentSectionQuestionIndex = useMemo(() => {
    if (!currentQuestion || !currentSection) return 0;
    const sectionQuestions = applicableQuestions.filter(q => q.section_id === currentSection.id);
    return sectionQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
  }, [currentQuestion, currentSection, applicableQuestions]);

  const currentSectionQuestionCount = useMemo(() => {
    if (!currentSection) return 0;
    // Use snapshot if available, fall back to live count
    if (sectionQuestionSnapshot[currentSection.id] != null) {
      return sectionQuestionSnapshot[currentSection.id];
    }
    return applicableQuestions.filter(q => q.section_id === currentSection.id).length;
  }, [currentSection, applicableQuestions, sectionQuestionSnapshot]);

  const currentProfileIndex = useMemo(() => {
    if (!schema || !currentProfileQuestion) return 0;
    return schema.profile_questions.findIndex(q => q.id === currentProfileQuestion.id) + 1;
  }, [schema, currentProfileQuestion]);

  // Section progress for journey sidebar
  const sectionProgress = useMemo(() => {
    if (!schema) return {};
    const progress: Record<string, { completed: number; total: number }> = {};
    
    for (const section of schema.sections) {
      const sectionQuestions = applicableQuestions.filter(q => q.section_id === section.id);
      const completedInSection = sectionQuestions.filter(q => answers[q.id]).length;
      const total = sectionQuestionSnapshot[section.id] != null
        ? sectionQuestionSnapshot[section.id]
        : sectionQuestions.length;
      progress[section.id] = {
        completed: completedInSection,
        total,
      };
    }
    return progress;
  }, [schema, applicableQuestions, answers, sectionQuestionSnapshot]);

  // Completed sections for journey sidebar - only from applicable sections
  const completedSections = useMemo(() => {
    return applicableSections
      .filter(section => {
        const progress = sectionProgress[section.id];
        return progress && progress.total > 0 && progress.completed === progress.total;
      })
      .map(s => s.id);
  }, [applicableSections, sectionProgress]);

  // Profile review data
  const profileReviewData = useMemo(() => {
    if (!schema) return [];
    return schema.profile_questions
      .filter((q) => profileAnswers[q.id])
      .map((q) => {
        const answerValue = profileAnswers[q.id];
        const option = q.options.find((o) => o.value === answerValue);
        return {
          questionId: q.id,
          question: q.prompt,
          answer: option?.label || answerValue,
        };
      });
  }, [schema, profileAnswers]);



  const handleStartProfile = () => {
    if (schema && schema.profile_questions.length > 0) {
      setCurrentStepId(`profile:${schema.profile_questions[0].id}`);
    }
    setStepHistory([]);
    setShowProfilePrompt(false);
    setFlowPhase("profile");
  };

  const handleSkipProfilePrompt = () => {
    setShowProfilePrompt(false);
    setProfilePromptDismissed(true);
    sessionStorage.setItem("rest-easy.profile-prompt-dismissed", "true");
  };

  const handleContinueToAssessment = () => {
    setFlowPhase("assessment");
    setCurrentStepId(null);
    setStepHistory([]);
  };

  const handleEditProfileQuestion = (questionId: string) => {
    setCurrentStepId(`profile:${questionId}`);
    setFlowPhase("profile");
    setStepHistory([]);
  };

  const handleAnswer = async (value: string) => {
    if (!schema || !currentStepId) return;

    setSaving(true);
    setSaveError(null);
    setLastSaved(true);
    setTimeout(() => setLastSaved(false), 100);

    try {
      let nextProfileAnswers = profileAnswers;
      let nextProfile = profile;
      let nextAnswers = answers;

        if (currentStepId.startsWith("profile:") && currentProfileQuestion) {
        const mapped = currentProfileQuestion.value_map[value as "yes" | "no"];
        nextProfileAnswers = {
          ...profileAnswers,
          [currentProfileQuestion.id]: value as "yes" | "no",
        };
        nextProfile = setNestedValue(profile, currentProfileQuestion.field, mapped);
        setProfileAnswers(nextProfileAnswers);
        setProfile(nextProfile);

        // Always save to server - agent will create subject if needed
        const response = await callAgent({
          assessment_id: ASSESSMENT_ID,
          profile: {
            profile_json: nextProfile,
            version: SCHEMA_VERSION,
          },
        });

        // Store subject_id if we got one back (new user case)
        if (response.subject_id && !subjectId) {
          setSubjectId(response.subject_id as string);
          localStorage.setItem(STORAGE_KEYS.subjectId, response.subject_id as string);
        }

        if (response.assessment_id && !assessmentId) {
          setAssessmentId(response.assessment_id as string);
        }

        const isProfileNowComplete = schema.profile_questions.every(
          (q) => Boolean(nextProfileAnswers[q.id])
        );

        if (isProfileNowComplete) {
          setFlowPhase("profile-review");
          setCurrentStepId(null);
          return;
        }
      }

        if (currentStepId.startsWith("question:") && currentQuestion) {
        const option = currentQuestion.options.find((item) => item.value === value);
        const scoreValue = (option?.score_value ?? option?.value ?? "na") as AnswerValue;
        const scoreFraction =
          scoreValue === "na" ? null : schema.answer_scoring[scoreValue] ?? null;
        const answerRecord: AnswerRecord = {
          question_id: currentQuestion.id,
          item_id: currentQuestion.item_id,
          section_id: currentQuestion.section_id,
          dimension: currentQuestion.dimension,
          answer_value: value as AnswerValue,
          answer_label: option?.label,
          score_fraction: scoreFraction,
          question_text: currentQuestion.prompt,
          question_meta: currentQuestion.question_meta,
        };
        nextAnswers = { ...answers, [currentQuestion.id]: answerRecord };
        setAnswers(nextAnswers);

        // Always save to server - agent will create subject if needed
        const response = await callAgent({
          assessment_id: ASSESSMENT_ID,
          answers: [answerRecord],
        });

        // Store subject_id if we got one back (new user case)
        if (response.subject_id && !subjectId) {
          setSubjectId(response.subject_id as string);
          localStorage.setItem(STORAGE_KEYS.subjectId, response.subject_id as string);
        }
        if (response.assessment_id && !assessmentId) {
          setAssessmentId(response.assessment_id as string);
        }

        // If coming from dashboard (returnTo is set), navigate back immediately after saving
        if (returnTo === "dashboard") {
          console.log("[Readiness] Answer saved, returning to dashboard");
          setReturnTo(null); // Clear the returnTo state
          navigate("/dashboard");
          return;
        }

        // Determine next step based on whether we're focused on a section
        const currentSectionId = focusedSectionId || currentQuestion.section_id;
        
        // Recalculate applicable questions with updated answers
        const nextAnswerValues = Object.fromEntries(
          Object.entries(nextAnswers).map(([key, val]) => [key, val.answer_value])
        ) as Record<string, AnswerValue>;
        
        const nextApplicable = schema.questions.filter((q) =>
          evaluateCondition(q.applies_if, nextProfile, nextAnswerValues)
        );
        
        // Find next unanswered question in the current/focused section
        const sectionQuestions = nextApplicable.filter(q => q.section_id === currentSectionId);
        const nextInSection = sectionQuestions.find(q => !nextAnswers[q.id]);
        
        if (nextInSection) {
          // Stay in the same section
          setStepHistory((prev) => [...prev, currentStepId]);
          setCurrentStepId(`question:${nextInSection.id}`);
        } else if (focusedSectionId) {
          // Focused section is now complete - show section complete view
          setStepHistory((prev) => [...prev, currentStepId]);
          setViewingCompletedSection(true);
        } else {
          // Not focused on a section - check if we just completed the current section
          const justCompletedSectionId = currentQuestion.section_id;
          const justCompletedSectionQuestions = nextApplicable.filter(
            q => q.section_id === justCompletedSectionId
          );
          const sectionNowComplete = justCompletedSectionQuestions.every(
            q => nextAnswers[q.id]
          );
          
          if (sectionNowComplete) {
            // Show section summary before moving on
            setStepHistory((prev) => [...prev, currentStepId]);
            setFocusedSectionId(justCompletedSectionId);
            setFlowPhase("section-summary");
          } else {
            // Find next global step
            setStepHistory((prev) => [...prev, currentStepId]);
            const nextStep = getNextStepId(nextProfileAnswers, nextAnswers, nextProfile);
            
            if (nextStep) {
              setCurrentStepId(nextStep);
            } else {
              setFlowPhase("complete");
              setCurrentStepId(null);
            }
          }
        }

        return;
      }

      // For profile questions, use global navigation
      setStepHistory((prev) => [...prev, currentStepId]);
      const nextStep = getNextStepId(nextProfileAnswers, nextAnswers, nextProfile);
      
      if (nextStep) {
        setCurrentStepId(nextStep);
      } else {
        setFlowPhase("complete");
        setCurrentStepId(null);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save response.");
    } finally {
      setSaving(false);
    }
  };

  // Navigate to a specific section
  const handleSectionClick = (sectionId: string) => {
    if (!schema) return;
    
    // Verify section is still applicable
    if (!applicableSections.some(s => s.id === sectionId)) {
      console.warn('Attempted to navigate to non-applicable section');
      return;
    }
    
    setFocusedSectionId(sectionId);
    setShowJourneyDrawer(false);
    
    // Find the first unanswered question in that section
    const sectionQuestions = applicableQuestions.filter(q => q.section_id === sectionId);
    const firstUnanswered = sectionQuestions.find(q => !answers[q.id]);
    
    if (firstUnanswered) {
      // Section has unanswered questions - go to first unanswered
      setViewingCompletedSection(false);
      setFlowPhase("assessment");
      setCurrentStepId(`question:${firstUnanswered.id}`);
    } else if (sectionQuestions.length > 0) {
      // All questions answered - show section summary
      setViewingCompletedSection(false);
      setFlowPhase("section-summary");
      setCurrentStepId(`question:${sectionQuestions[0].id}`);
    }
  };

  // Continue from completed section to next incomplete section
  const handleContinueFromCompletedSection = () => {
    if (!schema) return;
    
    setViewingCompletedSection(false);
    setFocusedSectionId(null);
    
    // Find next section with unanswered questions
    const nextStep = getNextStepId(profileAnswers, answers, profile);
    if (nextStep) {
      setFlowPhase("assessment");
      setCurrentStepId(nextStep);
    } else {
      setFlowPhase("complete");
      setCurrentStepId(null);
    }
  };

  // Handle editing answers from section summary
  const handleEditSectionAnswers = () => {
    setFlowPhase("section-edit");
  };

  // Handle back from section edit to section summary
  const handleBackToSectionSummary = () => {
    setFlowPhase("section-summary");
  };

  // Handle saving edited answers (batch mode)
  const handleSaveEditedAnswers = async (updatedAnswers: AnswerRecord[]) => {
    if (updatedAnswers.length === 0) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Update local state
      const newAnswers = { ...answers };
      for (const answer of updatedAnswers) {
        newAnswers[answer.question_id] = answer;
      }
      setAnswers(newAnswers);

      // Persist to backend (backend will mark report as stale automatically)
      await callAgent({
        assessment_id: ASSESSMENT_ID,
        answers: updatedAnswers,
      });



      // Clear any cached section insights for this section
      if (focusedSectionId) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`section-insight:${focusedSectionId}:`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Go back to section summary
      setFlowPhase("section-summary");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };


  const handleBack = () => {
    // If viewing completed section, just exit that view
    if (viewingCompletedSection) {
      setViewingCompletedSection(false);
      setFocusedSectionId(null);
      const nextStep = getNextStepId(profileAnswers, answers, profile);
      if (nextStep) {
        setCurrentStepId(nextStep);
      }
      return;
    }

    // If focused on a section, navigate within that section
    if (focusedSectionId && currentQuestion) {
      const sectionQuestions = applicableQuestions.filter(q => q.section_id === focusedSectionId);
      const currentIndex = sectionQuestions.findIndex(q => q.id === currentQuestion.id);
      
      if (currentIndex > 0) {
        // Go to previous question in this section
        setCurrentStepId(`question:${sectionQuestions[currentIndex - 1].id}`);
        return;
      } else {
        // At first question of focused section - exit section focus
        setFocusedSectionId(null);
        if (stepHistory.length > 0) {
          const previousStep = stepHistory[stepHistory.length - 1];
          setStepHistory(stepHistory.slice(0, -1));
          setCurrentStepId(previousStep);
        }
        return;
      }
    }

    // Default back behavior using step history
    if (stepHistory.length === 0) {
      if (flowPhase === "profile") {
        setFlowPhase("intro");
        setCurrentStepId(null);
      }
      return;
    }
    const previousStep = stepHistory[stepHistory.length - 1];
    setStepHistory(stepHistory.slice(0, -1));
    setCurrentStepId(previousStep);
  };

  const handleExit = () => {
    navigate("/");
  };

  const resetFlow = () => {
    // Clear only the subject_id from localStorage
    localStorage.removeItem(STORAGE_KEYS.subjectId);
    // Also clear any legacy keys
    localStorage.removeItem("rest-easy.readiness.report");
    localStorage.removeItem("rest-easy.readiness.report_stale");
    setSubjectId(null);
    setAssessmentId(null);
    setProfile({});
    setProfileAnswers({});
    setAnswers({});
    setCurrentStepId(null);
    setStepHistory([]);
    setScoreSaved(false);
    setFlowPhase("intro");
  };

  const results = useMemo(() => {
    if (!schema) return null;
    const applicableIds = new Set(applicableQuestions.map((question) => question.id));
    const sectionScores: Record<string, number> = {};
    let weightedTotal = 0;
    let weightSum = 0;

    for (const section of schema.sections) {
      const sectionQuestions = schema.questions.filter(
        (question) => question.section_id === section.id && applicableIds.has(question.id)
      );
      if (sectionQuestions.length === 0) continue;

      let sectionTotal = 0;
      let sectionCount = 0;
      for (const question of sectionQuestions) {
        const answer = answers[question.id];
        if (!answer || answer.score_fraction === null || answer.score_fraction === undefined) continue;
        sectionTotal += answer.score_fraction;
        sectionCount += 1;
      }

      if (sectionCount === 0) continue;

      const avg = sectionTotal / sectionCount;
      sectionScores[section.id] = Math.round(avg * 100);
      weightedTotal += avg * section.weight;
      weightSum += section.weight;
    }

    const overallScore = weightSum > 0 ? Math.round((weightedTotal / weightSum) * 100) : 0;
    return { overallScore, sectionScores };
  }, [schema, answers, applicableQuestions]);

  // Persist score when complete
  useEffect(() => {
    if (flowPhase !== "complete" || !results || scoreSaved) return;
    const persistScore = async () => {
      try {
        await callAgent({
          assessment_id: ASSESSMENT_ID,
          assessment: {
            overall_score: results.overallScore,
            status: "completed",
          },
        });
        setScoreSaved(true);
      } catch (_err) {
        // Skip hard failure for guest mode.
      }
    };
    persistScore();
  }, [flowPhase, results, scoreSaved]);

  // Report generation is now handled server-side in the agent edge function
  // when the assessment is first completed or when answers are updated.
  // The /readiness page no longer triggers report generation - it's for taking/reviewing the assessment.
  // The /results page handles showing report generation progress.

  // Handle going back to review sections from complete phase
  const handleReviewSections = () => {
    setFlowPhase("review");
    if (applicableQuestions.length > 0) {
      setCurrentStepId(`question:${applicableQuestions[0].id}`);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (fatalError) {
    return (
      <ErrorState 
        error={fatalError} 
        onRetry={bootstrap} 
        onExit={handleExit} 
      />
    );
  }

  if (!schema) {
    return null;
  }

  const showNavigation = flowPhase !== "intro" && flowPhase !== "complete";
  const canGoBack = stepHistory.length > 0 || flowPhase === "profile";

  // Intro Phase
  if (flowPhase === "intro") {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex flex-col bg-background">
          <header className="flex items-center justify-end px-4 h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="touch-target press-effect"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto">
            <GentleIntro
              headline="Let's understand what matters most to you."
              description="A few quick questions help us personalize your experience. You can always change these later."
              subtext="About 5 minutes · Your progress is saved automatically"
              ctaLabel="Get Started"
              onStart={handleStartProfile}
            />
          </div>
          <ProfilePromptModal
            open={showProfilePrompt}
            onOpenChange={setShowProfilePrompt}
            onStartProfile={handleStartProfile}
            onSkip={handleSkipProfilePrompt}
            completedCount={Object.keys(profileAnswers).length}
            totalCount={schema.profile_questions.length}
          />
        </div>
      </AppLayout>
    );
  }

  // Check for navigation params - if present, skip "complete" phase rendering
  // This prevents a race condition where the complete phase renders before URL params are processed
  const hasNavigationParams = searchParams.has("section") || searchParams.has("question");

  // While URL params are being processed, never show the report-prep screen.
  if (flowPhase === "complete" && (hasNavigationParams || hasPendingNavigation)) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hero px-6">
          <div className="text-center space-y-4 max-w-sm animate-fade-up">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground">Opening your section…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Complete Phase is no longer handled here - we now default to "review" mode
  // when loading a completed assessment. This prevents the "Preparing Report" screen
  // from appearing when navigating to /readiness after completion.
  // The /results page handles showing report generation progress.
  // If somehow we end up in "complete" phase, just show the review UI by falling through.

  // Review Phase - Same as assessment but for completed assessments
  if (flowPhase === "review") {
    // Reuse the assessment UI but with different navigation context
    // Fall through to assessment rendering below
  }

  // Section Summary Phase - Show completed section with AI insights (now with sidebar)
  if (flowPhase === "section-summary" && focusedSectionId) {
    const focusedSection = applicableSections.find(s => s.id === focusedSectionId);
    
    if (focusedSection) {
      return (
        <AppLayout hideNav>
          <div className="min-h-screen flex bg-background">
            {/* Journey Sidebar - Desktop only */}
            <JourneySidebar
              sections={applicableSections}
              currentSectionId={focusedSectionId}
              sectionProgress={sectionProgress}
              completedSections={completedSections}
              onSectionClick={handleSectionClick}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Mobile Journey Header */}
              <JourneyHeader
                sections={applicableSections}
                currentSectionId={focusedSectionId}
                completedSections={completedSections}
                onOpenDrawer={() => setShowJourneyDrawer(true)}
              />

              {/* Desktop Header */}
              <header className="hidden md:flex items-center justify-between px-6 h-14 border-b border-border/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToDashboard}
                  className="touch-target press-effect"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                  <p className="text-sm font-body text-muted-foreground">
                    {focusedSection.label} Summary
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExit}
                  className="touch-target press-effect"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </header>

              {/* Mobile Header Controls */}
              <header className="md:hidden flex items-center justify-between px-4 h-12">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToDashboard}
                  className="touch-target press-effect"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExit}
                  className="touch-target press-effect"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </header>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-hero">
                <SectionSummary
                  sectionId={focusedSectionId}
                  sectionLabel={focusedSection.label}
                  answers={answers}
                  questions={applicableQuestions}
                  onEditAnswers={handleEditSectionAnswers}
                  onContinue={handleContinueFromCompletedSection}
                  onBackToDashboard={handleBackToDashboard}
                  onViewReport={() => navigate("/results")}
                  showContinueButton={!isAssessmentComplete}
                  isAssessmentComplete={isAssessmentComplete}
                />
              </div>
            </div>

            {/* Journey Drawer - Mobile */}
            <JourneyDrawer
              open={showJourneyDrawer}
              onOpenChange={setShowJourneyDrawer}
              sections={applicableSections}
              currentSectionId={focusedSectionId}
              sectionProgress={sectionProgress}
              completedSections={completedSections}
              onSectionClick={handleSectionClick}
            />
          </div>
        </AppLayout>
      );
    }
  }

  // Section Edit Phase - Edit answers in batch mode (with sidebar)
  if (flowPhase === "section-edit" && focusedSectionId && schema) {
    const focusedSection = applicableSections.find(s => s.id === focusedSectionId);
    
    if (focusedSection) {
      return (
        <AppLayout hideNav>
          <div className="min-h-screen flex bg-background">
            {/* Journey Sidebar - Desktop only */}
            <JourneySidebar
              sections={applicableSections}
              currentSectionId={focusedSectionId}
              sectionProgress={sectionProgress}
              completedSections={completedSections}
              onSectionClick={handleSectionClick}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Mobile Journey Header */}
              <JourneyHeader
                sections={applicableSections}
                currentSectionId={focusedSectionId}
                completedSections={completedSections}
                onOpenDrawer={() => setShowJourneyDrawer(true)}
              />

              {/* Desktop Header */}
              <header className="hidden md:flex items-center justify-between px-6 h-14 border-b border-border/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToSectionSummary}
                  className="touch-target press-effect"
                  aria-label="Back to summary"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                  <p className="text-sm font-body text-muted-foreground">
                    Editing {focusedSection.label}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExit}
                  className="touch-target press-effect"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </header>

              {/* Mobile Header Controls */}
              <header className="md:hidden flex items-center justify-between px-4 h-12">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToSectionSummary}
                  className="touch-target press-effect"
                  aria-label="Back to summary"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExit}
                  className="touch-target press-effect"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </header>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-hero">
                <SectionAnswerList
                  sectionId={focusedSectionId}
                  sectionLabel={focusedSection.label}
                  questions={applicableQuestions}
                  answers={answers}
                  answerScoring={schema.answer_scoring}
                  onSaveChanges={handleSaveEditedAnswers}
                  onBack={handleBackToSectionSummary}
                />
              </div>

              {saving && (
                <div className="px-6 py-3 border-t border-border/30 flex items-center justify-center bg-card/50">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Journey Drawer - Mobile */}
            <JourneyDrawer
              open={showJourneyDrawer}
              onOpenChange={setShowJourneyDrawer}
              sections={applicableSections}
              currentSectionId={focusedSectionId}
              sectionProgress={sectionProgress}
              completedSections={completedSections}
              onSectionClick={handleSectionClick}
            />
          </div>
        </AppLayout>
      );
    }
  }

  // Profile Review Phase
  if (flowPhase === "profile-review") {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex flex-col bg-gradient-hero">
          <header className="flex items-center justify-between px-4 h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="touch-target press-effect"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="touch-target press-effect"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto">
            <ProfileReview
              answers={profileReviewData}
              applicableQuestionCount={applicableQuestions.length}
              totalQuestionCount={schema.questions.length}
              onEdit={handleEditProfileQuestion}
              onContinue={handleContinueToAssessment}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Profile Questions Phase
  if (flowPhase === "profile" && currentProfileQuestion) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex flex-col bg-gradient-hero">
          <header className="flex items-center justify-between px-4 h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={!canGoBack}
              className="touch-target press-effect"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-center">
              <p className="text-sm font-body text-muted-foreground">
                {currentProfileIndex} of {schema.profile_questions.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="touch-target press-effect"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </header>

          {/* Progress bar for profile */}
          <div className="px-4">
            <Progress 
              value={(currentProfileIndex / schema.profile_questions.length) * 100} 
              className="h-1"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-md mx-auto space-y-8">
              {/* Section Label */}
              <p className="text-sm text-primary font-medium text-center uppercase tracking-wide">
                Getting to Know You
              </p>

              <AnimatedQuestionCard 
                question={currentProfileQuestion.prompt}
                questionKey={currentProfileQuestion.id}
              />

              <div className="space-y-3">
                {currentProfileQuestion.options.map((option) => (
                  <AnswerButton
                    key={option.value}
                    label={option.label}
                    selected={profileAnswers[currentProfileQuestion.id] === option.value}
                    showConfirmation={recentlySelected === `profile:${currentProfileQuestion.id}:${option.value}`}
                    onClick={() => {
                      setRecentlySelected(`profile:${currentProfileQuestion.id}:${option.value}`);
                      setTimeout(() => setRecentlySelected(null), 500);
                      handleAnswer(option.value);
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-end pt-2">
                <AutosaveIndicator show={lastSaved} />
              </div>

              {saveError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive font-body">{saveError}</p>
                </div>
              )}
            </div>
          </div>

          {saving && (
            <div className="px-6 py-4 border-t border-border/30 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Assessment Questions Phase - Journey-based layout (also used for review phase)
  if (flowPhase === "assessment" || flowPhase === "review") {
    // If currentQuestion is not yet set, show loading state while it initializes
    if (!currentQuestion) {
      return <LoadingSkeleton />;
    }
    
    const isReviewMode = flowPhase === "review";
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex bg-background">
          {/* Journey Sidebar - Desktop only */}
          <JourneySidebar
            sections={applicableSections}
            currentSectionId={currentSection?.id || null}
            sectionProgress={sectionProgress}
            completedSections={completedSections}
            onSectionClick={handleSectionClick}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Mobile Journey Header */}
            <JourneyHeader
              sections={applicableSections}
              currentSectionId={currentSection?.id || null}
              completedSections={completedSections}
              onOpenDrawer={() => setShowJourneyDrawer(true)}
            />

            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-6 h-14 border-b border-border/30">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={stepHistory.length === 0 && !focusedSectionId && !viewingCompletedSection}
                className="touch-target press-effect"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                {viewingCompletedSection ? (
                  <p className="text-sm font-body text-muted-foreground">
                    {currentSection?.label} Complete
                  </p>
                ) : (
                  <p className="text-sm font-body text-muted-foreground">
                    {currentSection?.label} • Question {currentSectionQuestionIndex} of {currentSectionQuestionCount}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExit}
                className="touch-target press-effect"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </header>

            {/* Mobile Header Controls */}
            <header className="md:hidden flex items-center justify-between px-4 h-12">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={stepHistory.length === 0 && !focusedSectionId && !viewingCompletedSection}
                className="touch-target press-effect"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExit}
                className="touch-target press-effect"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-hero">
              {viewingCompletedSection && currentSection ? (
                <SectionComplete
                  sectionId={currentSection.id}
                  sectionLabel={currentSection.label}
                  questionsCompleted={sectionProgress[currentSection.id]?.total || 0}
                  onContinue={handleContinueFromCompletedSection}
                />
              ) : (
                <div className="max-w-lg mx-auto space-y-8">
                  {/* Section Label */}
                  <div className="text-center space-y-2">
                    <p className="text-sm text-primary font-medium uppercase tracking-wide">
                      {currentSection?.label}
                    </p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      Question {currentSectionQuestionIndex} of {currentSectionQuestionCount}
                    </p>
                  </div>

                  <AnimatedQuestionCard 
                    question={currentQuestion.prompt}
                    questionKey={currentQuestion.id}
                  />

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <AnswerButton
                        key={`${option.value}-${index}`}
                        label={option.label}
                        selected={answers[currentQuestion.id]?.answer_value === option.value}
                        showConfirmation={recentlySelected === `question:${currentQuestion.id}:${option.value}`}
                        onClick={() => {
                          setRecentlySelected(`question:${currentQuestion.id}:${option.value}`);
                          setTimeout(() => setRecentlySelected(null), 500);
                          handleAnswer(option.value);
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {isReviewMode ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFlowPhase("complete")}
                        className="text-muted-foreground"
                      >
                        ← Back to Summary
                      </Button>
                    ) : (
                      <div />
                    )}
                    <AutosaveIndicator show={lastSaved} />
                  </div>

                  {saveError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      <p className="text-sm text-destructive font-body">{saveError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {saving && !viewingCompletedSection && (
              <div className="px-6 py-3 border-t border-border/30 flex items-center justify-center bg-card/50">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Journey Drawer - Mobile */}
          <JourneyDrawer
            open={showJourneyDrawer}
            onOpenChange={setShowJourneyDrawer}
            sections={applicableSections}
            currentSectionId={currentSection?.id || null}
            sectionProgress={sectionProgress}
            completedSections={completedSections}
            onSectionClick={handleSectionClick}
          />
        </div>
      </AppLayout>
    );
  }

  // Fallback - show loading instead of blank screen
  return <LoadingSkeleton />;
};

export default Readiness;
