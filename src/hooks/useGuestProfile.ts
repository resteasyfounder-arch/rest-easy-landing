import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://ltldbteqkpxqohbwqvrn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGRidGVxa3B4cW9oYndxdnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTY0MjUsImV4cCI6MjA4MzU3MjQyNX0.zSWhg_zFbrDhIA9egmaRsGsRiQg7Pd9fgHyTp39v3CE";

export interface ProfileData {
  [key: string]: string;
}

interface UseGuestProfileReturn {
  profile: ProfileData;
  profileAnswers: ProfileData;
  isComplete: boolean;
  completedCount: number;
  totalQuestions: number;
  subjectId: string | null;
  assessmentId: string | null;
  updateAnswer: (questionId: string, value: string) => void;
  saveProfile: () => Promise<void>;
  clearProfile: () => void;
  clearAll: () => void;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  PROFILE_JSON: "rest-easy.readiness.profile_json",
  PROFILE_ANSWERS: "rest-easy.readiness.profile_answers",
  SUBJECT_ID: "rest-easy.readiness.subject_id",
  ASSESSMENT_ID: "rest-easy.readiness.assessment_id",
};

const TOTAL_PROFILE_QUESTIONS = 8;

export function useGuestProfile(): UseGuestProfileReturn {
  const [profile, setProfile] = useState<ProfileData>({});
  const [profileAnswers, setProfileAnswers] = useState<ProfileData>({});
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE_JSON);
      const storedAnswers = localStorage.getItem(STORAGE_KEYS.PROFILE_ANSWERS);
      const storedSubjectId = localStorage.getItem(STORAGE_KEYS.SUBJECT_ID);
      const storedAssessmentId = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_ID);

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedAnswers) setProfileAnswers(JSON.parse(storedAnswers));
      if (storedSubjectId) setSubjectId(storedSubjectId);
      if (storedAssessmentId) setAssessmentId(storedAssessmentId);
    } catch (error) {
      console.error("Error loading profile from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.PROFILE_JSON, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.PROFILE_ANSWERS, JSON.stringify(profileAnswers));
      if (subjectId) localStorage.setItem(STORAGE_KEYS.SUBJECT_ID, subjectId);
      if (assessmentId) localStorage.setItem(STORAGE_KEYS.ASSESSMENT_ID, assessmentId);
    }
  }, [profile, profileAnswers, subjectId, assessmentId, isLoading]);

  const completedCount = Object.keys(profileAnswers).length;
  const isComplete = completedCount >= TOTAL_PROFILE_QUESTIONS;

  const updateAnswer = useCallback((questionId: string, value: string) => {
    setProfileAnswers((prev) => ({ ...prev, [questionId]: value }));
    setProfile((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const saveProfile = useCallback(async () => {
    try {
      const agentUrl = `${SUPABASE_URL}/functions/v1/agent`;
      const response = await fetch(agentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: "upsert",
          subject_id: subjectId,
          assessment_key: "life_readiness_v1",
          profile: profile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile to server");
      }

      const result = await response.json();
      if (result.subject_id && !subjectId) {
        setSubjectId(result.subject_id);
      }
      if (result.assessment_id && !assessmentId) {
        setAssessmentId(result.assessment_id);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }, [profile, subjectId, assessmentId]);

  const clearProfile = useCallback(() => {
    setProfile({});
    setProfileAnswers({});
    localStorage.removeItem(STORAGE_KEYS.PROFILE_JSON);
    localStorage.removeItem(STORAGE_KEYS.PROFILE_ANSWERS);
  }, []);

  const clearAll = useCallback(() => {
    setProfile({});
    setProfileAnswers({});
    setSubjectId(null);
    setAssessmentId(null);
    localStorage.removeItem(STORAGE_KEYS.PROFILE_JSON);
    localStorage.removeItem(STORAGE_KEYS.PROFILE_ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECT_ID);
    localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_ID);
    // Also clear cached assessment state
    localStorage.removeItem("rest-easy.readiness.cached_state");
  }, []);

  return {
    profile,
    profileAnswers,
    isComplete,
    completedCount,
    totalQuestions: TOTAL_PROFILE_QUESTIONS,
    subjectId,
    assessmentId,
    updateAnswer,
    saveProfile,
    clearProfile,
    clearAll,
    isLoading,
  };
}
