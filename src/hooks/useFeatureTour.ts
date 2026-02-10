import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "rest-easy.tour_complete";

export interface TourStep {
  id: string;
  title: string;
  description: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "home",
    title: "Your Home Base",
    description:
      "Track your progress while your assessment is underway. Once complete, this becomes your dashboard — a snapshot of your readiness score, report highlights, and action roadmap.",
  },
  {
    id: "profile",
    title: "Your Life Snapshot",
    description:
      "Keep your profile up to date as life changes. The questions and sections you see adapt based on what matters to you. You can also manage your Trust Network here — the people you want to have access when it matters most.",
  },
  {
    id: "readiness",
    title: "Life Readiness Assessment",
    description:
      "Personalized questions that adapt to your life. Work through them at your own pace — your progress is saved automatically. Once complete, your Readiness Report will be generated.",
  },
  {
    id: "report",
    title: "Your Readiness Report",
    description:
      "This is where the value comes together. Get a tailored gap analysis with prioritized next steps so you know exactly where to focus your end-of-life planning efforts.",
  },
  {
    id: "vault",
    title: "EasyVault Document Storage",
    description:
      "Keep everything your loved ones will need in one place. Upload important documents, mark what doesn't apply to your life, and track your progress so nothing gets missed.",
  },
];

interface UseFeatureTourReturn {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  close: () => void;
  hasCompleted: boolean;
}

export function useFeatureTour(): UseFeatureTourReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );

  const markComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setHasCompleted(true);
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const next = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsOpen(false);
      markComplete();
    }
  }, [currentStep, markComplete]);

  const back = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsOpen(false);
    markComplete();
  }, [markComplete]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    step: TOUR_STEPS[currentStep],
    start,
    next,
    back,
    skip,
    close,
    hasCompleted,
  };
}
