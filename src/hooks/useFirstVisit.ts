import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "rest-easy.first_visit_complete";

interface UseFirstVisitReturn {
  isFirstVisit: boolean;
  markVisitComplete: () => void;
}

export function useFirstVisit(): UseFirstVisitReturn {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  });

  const markVisitComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsFirstVisit(false);
  }, []);

  return {
    isFirstVisit,
    markVisitComplete,
  };
}
