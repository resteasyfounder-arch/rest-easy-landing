import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AssessmentProgress from "@/components/assessment/AssessmentProgress";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  }
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

const Readiness = () => {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  useEffect(() => {
    const bootstrap = async () => {
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
    };

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

  const totalSteps = useMemo(() => {
    if (!schema) {
      return 0;
    }
    return schema.profile_questions.length + applicableQuestions.length;
  }, [schema, applicableQuestions]);

  const getNextStepId = useCallback(() => {
    if (!schema) {
      return null;
    }

    const nextProfile = schema.profile_questions.find(
      (question) => !profileAnswers[question.id]
    );
    if (nextProfile) {
      return `profile:${nextProfile.id}`;
    }

    const nextQuestion = applicableQuestions.find(
      (question) => !answers[question.id]
    );
    if (nextQuestion) {
      return `question:${nextQuestion.id}`;
    }

    return null;
  }, [schema, profileAnswers, applicableQuestions, answers]);

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

  useEffect(() => {
    if (!schema || loading) {
      return;
    }
    if (!currentStepId) {
      setCurrentStepId(getNextStepId());
      return;
    }
    if (!isStepApplicable(currentStepId)) {
      setCurrentStepId(getNextStepId());
    }
  }, [
    schema,
    loading,
    currentStepId,
    profileAnswers,
    answers,
    applicableQuestions,
    getNextStepId,
    isStepApplicable,
  ]);

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

  const currentStepIndex = useMemo(() => {
    if (!schema || totalSteps === 0) {
      return 0;
    }
    const completedProfile = Object.keys(profileAnswers).length;
    const completed = profileComplete
      ? schema.profile_questions.length + completedQuestionCount
      : completedProfile;
    return Math.min(completed, totalSteps - 1);
  }, [schema, totalSteps, profileAnswers, profileComplete, completedQuestionCount]);

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

  const handleContinue = async () => {
    if (!schema || !currentStepId || !pendingValue) {
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      if (currentStepId.startsWith("profile:") && currentProfileQuestion) {
        const mapped = currentProfileQuestion.value_map[
          pendingValue as "yes" | "no"
        ];
        const nextProfileAnswers = {
          ...profileAnswers,
          [currentProfileQuestion.id]: pendingValue as "yes" | "no",
        };
        const nextProfile = setNestedValue(profile, currentProfileQuestion.field, mapped);
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
        const nextAnswers = { ...answers, [currentQuestion.id]: answerRecord };
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
      setCurrentStepId(getNextStepId());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save response.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (stepHistory.length === 0) {
      return;
    }
    for (let i = stepHistory.length - 1; i >= 0; i -= 1) {
      const candidate = stepHistory[i];
      if (isStepApplicable(candidate)) {
        setStepHistory(stepHistory.slice(0, i));
        setCurrentStepId(candidate);
        return;
      }
    }
    setStepHistory([]);
    setCurrentStepId(getNextStepId());
  };

  const resetFlow = () => {
    localStorage.removeItem(STORAGE_KEYS.profile);
    localStorage.removeItem(STORAGE_KEYS.profileAnswers);
    localStorage.removeItem(STORAGE_KEYS.answers);
    setProfile({});
    setProfileAnswers({});
    setAnswers({});
    setCurrentStepId(null);
    setStepHistory([]);
    setScoreSaved(false);
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

  const isComplete = profileComplete && currentStepId === null;

  useEffect(() => {
    if (!isComplete || !results || !subjectId || scoreSaved) {
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
  }, [isComplete, results, subjectId, scoreSaved]);

  if (loading) {
    return (
      <AppLayout hideBottomNav>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground font-body">Loading readiness assessment...</p>
        </div>
      </AppLayout>
    );
  }

  if (fatalError) {
    return (
      <AppLayout hideBottomNav>
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center space-y-3">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Unable to load assessment
            </h1>
            <p className="text-muted-foreground font-body">{fatalError}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!schema) {
    return null;
  }

  return (
    <AppLayout hideBottomNav>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="px-4 py-4 border-b border-border/50 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={stepHistory.length === 0}>
            Back
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-body">
              Life Readiness
            </p>
          </div>
          <div className="w-16" />
        </header>

        {currentStepId && totalSteps > 0 && (
          <AssessmentProgress currentStep={currentStepIndex} totalSteps={totalSteps} />
        )}

        <main className="flex-1 px-6 py-8">
          {currentProfileQuestion && (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Profile Setup
                </p>
                <h2 className="text-2xl font-display font-semibold text-foreground mt-2">
                  {currentProfileQuestion.prompt}
                </h2>
              </div>
              <RadioGroup
                value={pendingValue ?? ""}
                onValueChange={setPendingValue}
                className="space-y-3"
              >
                {currentProfileQuestion.options.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 transition-colors",
                      pendingValue === option.value
                        ? "border-primary/50 bg-primary/5"
                        : "hover:border-primary/30"
                    )}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="font-body text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
              {saveError && (
                <p className="text-sm text-destructive font-body">{saveError}</p>
              )}
            </div>
          )}

          {currentQuestion && (
            <div className="space-y-6">
              <div>
                {currentSection && (
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                    {currentSection.label}
                  </p>
                )}
                <h2 className="text-2xl font-display font-semibold text-foreground mt-2">
                  {currentQuestion.prompt}
                </h2>
              </div>
              <RadioGroup
                value={pendingValue ?? ""}
                onValueChange={setPendingValue}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <label
                    key={`${currentQuestion.id}-${option.value}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 transition-colors",
                      pendingValue === option.value
                        ? "border-primary/50 bg-primary/5"
                        : "hover:border-primary/30"
                    )}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="font-body text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
              {saveError && (
                <p className="text-sm text-destructive font-body">{saveError}</p>
              )}
            </div>
          )}

          {isComplete && results && (
            <div className="space-y-6">
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

              <Button variant="outline" onClick={resetFlow} className="w-full">
                Start Over
              </Button>
            </div>
          )}
        </main>

        {!isComplete && (
          <footer className="px-6 py-5 border-t border-border/50 bg-background">
            <Button
              size="lg"
              className="w-full font-body"
              onClick={handleContinue}
              disabled={!pendingValue || saving}
            >
              {saving ? "Saving..." : "Continue"}
            </Button>
          </footer>
        )}
      </div>
    </AppLayout>
  );
};

export default Readiness;
