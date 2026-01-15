import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProfileIntro from "@/components/assessment/ProfileIntro";
import ProfileReview from "@/components/assessment/ProfileReview";
import ReadinessProgress from "@/components/assessment/ReadinessProgress";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft, X, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

type FlowPhase = "intro" | "profile" | "profile-review" | "assessment" | "complete";

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

const STORAGE_KEYS = {
  subjectId: "rest-easy.readiness.subject_id",
  assessmentId: "rest-easy.readiness.assessment_id",
  profile: "rest-easy.readiness.profile_json",
  profileAnswers: "rest-easy.readiness.profile_answers",
  answers: "rest-easy.readiness.answers",
  flowPhase: "rest-easy.readiness.flow_phase",
};

const SUPABASE_URL = "https://ltldbteqkpxqohbwqvrn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGRidGVxa3B4cW9oYndxdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTY0MjUsImV4cCI6MjA4MzU3MjQyNX0.zSWhg_zFbrDhIA9egmaRsGsRiQg7Pd9fgHyTp39v3CE";

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
    // Schema expressions are internal and controlled.
    // eslint-disable-next-line no-new-func
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

const getAgentUrl = () => {
  return `${SUPABASE_URL}/functions/v1/agent`;
};

const callAgent = async (payload: Record<string, unknown>) => {
  const response = await fetch(getAgentUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : "Request failed.";
    throw new Error(message);
  }
  return data;
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <AppLayout hideBottomNav>
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-4 py-4 border-b border-border/50 flex items-center justify-between">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10" />
      </header>
      <div className="px-6 py-2">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <main className="flex-1 px-6 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </main>
      <footer className="px-6 py-5 border-t border-border/50">
        <Skeleton className="h-12 w-full rounded-md" />
      </footer>
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
  <AppLayout hideBottomNav>
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
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
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Flow phase state
  const [flowPhase, setFlowPhase] = useState<FlowPhase>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.flowPhase);
    return (stored as FlowPhase) || "intro";
  });

  const [subjectId, setSubjectId] = useState<string | null>(
    localStorage.getItem(STORAGE_KEYS.subjectId)
  );
  const [assessmentId, setAssessmentId] = useState<string | null>(
    localStorage.getItem(STORAGE_KEYS.assessmentId)
  );

  const [profile, setProfile] = useState<Record<string, unknown>>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.profile);
    return raw ? JSON.parse(raw) : {};
  });
  const [profileAnswers, setProfileAnswers] = useState<Record<string, "yes" | "no">>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.profileAnswers);
    return raw ? JSON.parse(raw) : {};
  });
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.answers);
    return raw ? JSON.parse(raw) : {};
  });

  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Persist flow phase
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.flowPhase, flowPhase);
  }, [flowPhase]);

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
          subject_id: subjectId ?? undefined,
          assessment_id: ASSESSMENT_ID,
        }),
      ]);

      setSchema(schemaResponse.schema as Schema);
      if (sessionResponse?.subject_id) {
        setSubjectId(sessionResponse.subject_id);
        localStorage.setItem(STORAGE_KEYS.subjectId, sessionResponse.subject_id);
      }
      if (sessionResponse?.assessment_id) {
        setAssessmentId(sessionResponse.assessment_id);
        localStorage.setItem(STORAGE_KEYS.assessmentId, sessionResponse.assessment_id);
      }
    } catch (err) {
      setFatalError(err instanceof Error ? err.message : "Unable to load readiness.");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.profileAnswers, JSON.stringify(profileAnswers));
  }, [profileAnswers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(answers));
  }, [answers]);

  const answerValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, value.answer_value])
    ) as Record<string, AnswerValue>;
  }, [answers]);

  const applicableQuestions = useMemo(() => {
    if (!schema) {
      return [];
    }
    return schema.questions.filter((question) =>
      evaluateCondition(question.applies_if, profile, answerValues)
    );
  }, [schema, profile, answerValues]);

  const profileComplete = useMemo(() => {
    if (!schema) {
      return false;
    }
    return schema.profile_questions.every((question) => Boolean(profileAnswers[question.id]));
  }, [schema, profileAnswers]);

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
      if (!schema) {
        return null;
      }

      const nextProfile = schema.profile_questions.find(
        (question) => !currentProfileAnswers[question.id]
      );
      if (nextProfile) {
        return `profile:${nextProfile.id}`;
      }

      // Recalculate applicable questions with current state
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
      if (!schema) {
        return false;
      }
      if (stepId.startsWith("profile:")) {
        return schema.profile_questions.some((question) => `profile:${question.id}` === stepId);
      }
      if (stepId.startsWith("question:")) {
        const questionId = stepId.replace("question:", "");
        const question = schema.questions.find((item) => item.id === questionId);
        if (!question) {
          return false;
        }
        return evaluateCondition(question.applies_if, profile, answerValues);
      }
      return false;
    },
    [schema, profile, answerValues]
  );

  // Initialize current step when entering profile or assessment phase
  useEffect(() => {
    if (!schema || loading) {
      return;
    }

    // Only auto-initialize if currentStepId is null
    if (flowPhase === "profile" && !currentStepId) {
      const firstUnansweredProfile = schema.profile_questions.find(
        (q) => !profileAnswers[q.id]
      );
      if (firstUnansweredProfile) {
        setCurrentStepId(`profile:${firstUnansweredProfile.id}`);
      } else {
        // All profile questions answered, go to review
        setFlowPhase("profile-review");
      }
    }

    if (flowPhase === "assessment" && !currentStepId) {
      const nextStep = getNextStepId(profileAnswers, answers, profile);
      if (nextStep) {
        setCurrentStepId(nextStep);
      } else {
        // No more questions, assessment complete
        setFlowPhase("complete");
      }
    }

    // Handle case where current step is no longer applicable (due to profile changes)
    if (currentStepId && currentStepId.startsWith("question:") && !isStepApplicable(currentStepId)) {
      setCurrentStepId(getNextStepId(profileAnswers, answers, profile));
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
  ]);

  // Update pending value when step changes
  useEffect(() => {
    if (!currentStepId) {
      setPendingValue(null);
      return;
    }
    if (currentStepId.startsWith("profile:")) {
      const id = currentStepId.replace("profile:", "");
      setPendingValue(profileAnswers[id] ?? null);
      return;
    }
    if (currentStepId.startsWith("question:")) {
      const id = currentStepId.replace("question:", "");
      setPendingValue(answers[id]?.answer_value ?? null);
    }
  }, [currentStepId, profileAnswers, answers]);

  const currentProfileQuestion = useMemo(() => {
    if (!schema || !currentStepId?.startsWith("profile:")) {
      return null;
    }
    const id = currentStepId.replace("profile:", "");
    return schema.profile_questions.find((question) => question.id === id) ?? null;
  }, [schema, currentStepId]);

  const currentQuestion = useMemo(() => {
    if (!schema || !currentStepId?.startsWith("question:")) {
      return null;
    }
    const id = currentStepId.replace("question:", "");
    return schema.questions.find((question) => question.id === id) ?? null;
  }, [schema, currentStepId]);

  const currentSection = useMemo(() => {
    if (!schema || !currentQuestion) {
      return null;
    }
    return schema.sections.find((section) => section.id === currentQuestion.section_id) ?? null;
  }, [schema, currentQuestion]);

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
    // Reset to first profile question when starting fresh
    if (schema && schema.profile_questions.length > 0) {
      setCurrentStepId(`profile:${schema.profile_questions[0].id}`);
    }
    setStepHistory([]);
    setFlowPhase("profile");
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

  const handleContinue = async () => {
    if (!schema || !currentStepId || !pendingValue) {
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      let nextProfileAnswers = profileAnswers;
      let nextProfile = profile;
      let nextAnswers = answers;

      if (currentStepId.startsWith("profile:") && currentProfileQuestion) {
        const mapped = currentProfileQuestion.value_map[
          pendingValue as "yes" | "no"
        ];
        nextProfileAnswers = {
          ...profileAnswers,
          [currentProfileQuestion.id]: pendingValue as "yes" | "no",
        };
        nextProfile = setNestedValue(profile, currentProfileQuestion.field, mapped);
        setProfileAnswers(nextProfileAnswers);
        setProfile(nextProfile);

        if (subjectId) {
          await callAgent({
            subject_id: subjectId,
            assessment_id: ASSESSMENT_ID,
            profile: {
              profile_json: nextProfile,
              version: SCHEMA_VERSION,
            },
          });
        }

        // Check if profile is now complete
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
        const option = currentQuestion.options.find(
          (item) => item.value === pendingValue
        );
        const scoreValue = (option?.score_value ?? option?.value ?? "na") as AnswerValue;
        const scoreFraction =
          scoreValue === "na" ? null : schema.answer_scoring[scoreValue] ?? null;
        const answerRecord: AnswerRecord = {
          question_id: currentQuestion.id,
          item_id: currentQuestion.item_id,
          section_id: currentQuestion.section_id,
          dimension: currentQuestion.dimension,
          answer_value: pendingValue as AnswerValue,
          answer_label: option?.label,
          score_fraction: scoreFraction,
          question_text: currentQuestion.prompt,
          question_meta: currentQuestion.question_meta,
        };
        nextAnswers = { ...answers, [currentQuestion.id]: answerRecord };
        setAnswers(nextAnswers);

        if (subjectId) {
          await callAgent({
            subject_id: subjectId,
            assessment_id: ASSESSMENT_ID,
            answers: [answerRecord],
          });
        }
      }

      setStepHistory((prev) => [...prev, currentStepId]);
      const nextStep = getNextStepId(nextProfileAnswers, nextAnswers, nextProfile);
      
      if (nextStep) {
        setCurrentStepId(nextStep);
      } else {
        // Assessment complete
        setFlowPhase("complete");
        setCurrentStepId(null);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save response.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (stepHistory.length === 0) {
      // If in profile phase with no history, go back to intro
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
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    setProfile({});
    setProfileAnswers({});
    setAnswers({});
    setCurrentStepId(null);
    setStepHistory([]);
    setScoreSaved(false);
    setFlowPhase("intro");
  };

  const results = useMemo(() => {
    if (!schema) {
      return null;
    }
    const applicableIds = new Set(applicableQuestions.map((question) => question.id));
    const sectionScores: Record<string, number> = {};
    let weightedTotal = 0;
    let weightSum = 0;

    for (const section of schema.sections) {
      const sectionQuestions = schema.questions.filter(
        (question) => question.section_id === section.id && applicableIds.has(question.id)
      );
      if (sectionQuestions.length === 0) {
        continue;
      }

      let sectionTotal = 0;
      let sectionCount = 0;
      for (const question of sectionQuestions) {
        const answer = answers[question.id];
        if (!answer || answer.score_fraction === null || answer.score_fraction === undefined) {
          continue;
        }
        sectionTotal += answer.score_fraction;
        sectionCount += 1;
      }

      if (sectionCount === 0) {
        continue;
      }

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
    if (flowPhase !== "complete" || !results || !subjectId || scoreSaved) {
      return;
    }
    const persistScore = async () => {
      try {
        await callAgent({
          subject_id: subjectId,
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
  }, [flowPhase, results, subjectId, scoreSaved]);

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

  // Determine if we should show header back/exit buttons
  const showNavigation = flowPhase !== "intro" && flowPhase !== "complete";
  const canGoBack = stepHistory.length > 0 || flowPhase === "profile";

  return (
    <AppLayout hideBottomNav>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="px-4 py-4 border-b border-border/50 flex items-center justify-between">
          {showNavigation ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack} 
              disabled={!canGoBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <div className="w-16" />
          )}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-body">
              Life Readiness
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleExit}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </header>

        {/* Progress */}
        {flowPhase !== "intro" && flowPhase !== "complete" && (
          <ReadinessProgress
            phase={flowPhase}
            profileProgress={profileProgress}
            assessmentProgress={assessmentProgress}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Intro Phase */}
          {flowPhase === "intro" && (
            <ProfileIntro
              totalQuestions={schema.profile_questions.length}
              onStart={handleStartProfile}
            />
          )}

          {/* Profile Review Phase */}
          {flowPhase === "profile-review" && (
            <ProfileReview
              answers={profileReviewData}
              applicableQuestionCount={applicableQuestions.length}
              totalQuestionCount={schema.questions.length}
              onEdit={handleEditProfileQuestion}
              onContinue={handleContinueToAssessment}
            />
          )}

          {flowPhase === "profile" && currentProfileQuestion && (
            <div className="px-6 py-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Profile Setup • Question {schema.profile_questions.findIndex(q => q.id === currentProfileQuestion.id) + 1} of {schema.profile_questions.length}
                </p>
                <h2 className="text-2xl font-display font-semibold text-foreground mt-2">
                  {currentProfileQuestion.prompt}
                </h2>
              </div>
              <RadioGroup
                key={`profile-${currentProfileQuestion.id}`}
                value={pendingValue ?? ""}
                onValueChange={setPendingValue}
                className="space-y-3"
              >
                {currentProfileQuestion.options.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 transition-all cursor-pointer",
                      pendingValue === option.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="font-body text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
              {saveError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive font-body">{saveError}</p>
                </div>
              )}
            </div>
          )}

          {flowPhase === "assessment" && currentQuestion && (
            <div className="px-6 py-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                {currentSection && (
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                    {currentSection.label} • Question {applicableQuestions.findIndex(q => q.id === currentQuestion.id) + 1} of {applicableQuestions.length}
                  </p>
                )}
                <h2 className="text-2xl font-display font-semibold text-foreground mt-2">
                  {currentQuestion.prompt}
                </h2>
              </div>
              <RadioGroup
                key={`question-${currentQuestion.id}`}
                value={pendingValue ?? ""}
                onValueChange={setPendingValue}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 transition-all cursor-pointer",
                      pendingValue === option.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="font-body text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
              {saveError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive font-body">{saveError}</p>
                </div>
              )}
            </div>
          )}

          {/* Complete Phase - Results */}
          {flowPhase === "complete" && results && (
            <div className="px-6 py-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    Your Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4">
                    <span className="font-display text-5xl font-bold text-primary">
                      {results.overallScore}%
                    </span>
                    <span className="text-sm text-muted-foreground font-body pb-2">
                      Based on your responses
                    </span>
                  </div>
                  <Progress value={results.overallScore} className="mt-4 h-3" />
                </CardContent>
              </Card>

              <div className="space-y-4">
                {schema.sections.map((section) => {
                  const score = results.sectionScores[section.id];
                  if (score === undefined) {
                    return null;
                  }
                  return (
                    <div key={section.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-sm text-foreground">
                          {section.label}
                        </span>
                        <span className="text-sm text-muted-foreground font-body">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button variant="outline" onClick={resetFlow} className="w-full">
                  Start Over
                </Button>
                <Button variant="ghost" onClick={handleExit} className="w-full">
                  Return Home
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Footer - only for profile and assessment phases */}
        {(flowPhase === "profile" || flowPhase === "assessment") && (
          <footer className="px-6 py-5 border-t border-border/50 bg-background">
            <Button
              size="lg"
              className="w-full font-body gap-2"
              onClick={handleContinue}
              disabled={!pendingValue || saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Continue"}
            </Button>
          </footer>
        )}
      </div>
    </AppLayout>
  );
};

export default Readiness;
