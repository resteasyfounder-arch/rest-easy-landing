import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  QuestionCard,
  SoftProgress,
  AnswerButton,
  SkipButton,
  AutosaveIndicator,
  PauseScreen,
  CompletionScreen,
  pauseMessages,
} from "@/components/assessment/shared";

type FlowPhase = "intro" | "profile" | "profile-review" | "assessment" | "pause" | "complete";

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
  const [saving, setSaving] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(() => {
    return sessionStorage.getItem("rest-easy.profile-prompt-dismissed") === "true";
  });
  const [lastSaved, setLastSaved] = useState(false);
  const [pauseMessageIndex, setPauseMessageIndex] = useState(0);
  const [questionsSinceLastPause, setQuestionsSinceLastPause] = useState(0);

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

  // Check if profile is already complete on initial load
  useEffect(() => {
    if (!schema || loading) return;
    if (flowPhase !== "intro") return;

    const totalProfileQuestions = schema.profile_questions.length;
    const answeredProfileQuestions = Object.keys(profileAnswers).length;
    
    if (answeredProfileQuestions >= totalProfileQuestions) {
      setFlowPhase("assessment");
    } else if (!profilePromptDismissed && answeredProfileQuestions < totalProfileQuestions) {
      setShowProfilePrompt(true);
    }
  }, [schema, loading, flowPhase, profileAnswers, profilePromptDismissed]);

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
    if (!schema) return [];
    return schema.questions.filter((question) =>
      evaluateCondition(question.applies_if, profile, answerValues)
    );
  }, [schema, profile, answerValues]);

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
      } else {
        setFlowPhase("complete");
      }
    }

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

  const currentProfileIndex = useMemo(() => {
    if (!schema || !currentProfileQuestion) return 0;
    return schema.profile_questions.findIndex(q => q.id === currentProfileQuestion.id) + 1;
  }, [schema, currentProfileQuestion]);

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
    setQuestionsSinceLastPause(0);
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

        if (subjectId) {
          await callAgent({
            subject_id: subjectId,
            assessment_id: ASSESSMENT_ID,
            answers: [answerRecord],
          });
        }

        // Track questions for pause
        const newCount = questionsSinceLastPause + 1;
        setQuestionsSinceLastPause(newCount);

        // Check if we need a pause (every 5 questions)
        if (newCount >= 5) {
          setStepHistory((prev) => [...prev, currentStepId]);
          setPauseMessageIndex((prev) => (prev + 1) % pauseMessages.length);
          setFlowPhase("pause");
          setSaving(false);
          return;
        }
      }

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

  const handlePauseContinue = () => {
    setQuestionsSinceLastPause(0);
    const nextStep = getNextStepId(profileAnswers, answers, profile);
    if (nextStep) {
      setFlowPhase("assessment");
      setCurrentStepId(nextStep);
    } else {
      setFlowPhase("complete");
    }
  };

  const handleSkip = () => {
    if (!currentStepId) return;
    setStepHistory((prev) => [...prev, currentStepId]);
    const nextStep = getNextStepId(profileAnswers, answers, profile);
    if (nextStep) {
      setCurrentStepId(nextStep);
    } else {
      setFlowPhase("complete");
    }
  };

  const handleBack = () => {
    if (flowPhase === "pause") {
      setFlowPhase("assessment");
      return;
    }
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
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    setProfile({});
    setProfileAnswers({});
    setAnswers({});
    setCurrentStepId(null);
    setStepHistory([]);
    setScoreSaved(false);
    setQuestionsSinceLastPause(0);
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
    if (flowPhase !== "complete" || !results || !subjectId || scoreSaved) return;
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

  const showNavigation = flowPhase !== "intro" && flowPhase !== "complete" && flowPhase !== "pause";
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

  // Pause Phase
  if (flowPhase === "pause") {
    return (
      <AppLayout hideNav>
        <PauseScreen
          message={pauseMessages[pauseMessageIndex]}
          onContinue={handlePauseContinue}
          autoAdvanceMs={3500}
        />
      </AppLayout>
    );
  }

  // Complete Phase
  if (flowPhase === "complete" && results) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex flex-col bg-gradient-hero">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-md mx-auto space-y-8 animate-fade-up">
              {/* Score Card */}
              <Card className="border-primary/20 bg-card shadow-soft">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="font-display text-lg text-muted-foreground">
                    Your Life Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <span className="font-display text-6xl font-bold text-primary">
                    {results.overallScore}%
                  </span>
                  <Progress value={results.overallScore} className="mt-6 h-2" />
                </CardContent>
              </Card>

              {/* Section Breakdown */}
              <div className="space-y-4">
                <p className="text-sm font-body text-muted-foreground text-center">
                  Here's how you're doing in each area
                </p>
                {schema.sections.map((section) => {
                  const score = results.sectionScores[section.id];
                  if (score === undefined) return null;
                  return (
                    <div key={section.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-sm text-foreground">
                          {section.label}
                        </span>
                        <span className="text-sm text-muted-foreground font-body">{score}%</span>
                      </div>
                      <Progress value={score} className="h-1.5" />
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={() => navigate("/")} className="w-full min-h-[56px]">
                  View Your Dashboard
                </Button>
                <Button variant="ghost" onClick={resetFlow} className="w-full">
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
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

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-md mx-auto space-y-8 question-enter">
              <SoftProgress
                current={currentProfileIndex}
                total={schema.profile_questions.length}
                sectionName="Getting to Know You"
              />

              <QuestionCard question={currentProfileQuestion.prompt} />

              <div className="space-y-3">
                {currentProfileQuestion.options.map((option) => (
                  <AnswerButton
                    key={option.value}
                    label={option.label}
                    selected={profileAnswers[currentProfileQuestion.id] === option.value}
                    onClick={() => handleAnswer(option.value)}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <SkipButton onClick={handleSkip} />
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

  // Assessment Questions Phase
  if (flowPhase === "assessment" && currentQuestion) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex flex-col bg-gradient-hero">
          <header className="flex items-center justify-between px-4 h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={stepHistory.length === 0}
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

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-md mx-auto space-y-8 question-enter">
              <SoftProgress
                current={currentQuestionIndex}
                total={applicableQuestions.length}
                sectionName={currentSection?.label}
              />

              <QuestionCard question={currentQuestion.prompt} />

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <AnswerButton
                    key={option.value}
                    label={option.label}
                    selected={answers[currentQuestion.id]?.answer_value === option.value}
                    onClick={() => handleAnswer(option.value)}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <SkipButton onClick={handleSkip} />
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

  return null;
};

export default Readiness;
