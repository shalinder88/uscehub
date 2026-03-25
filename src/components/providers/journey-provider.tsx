"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { JourneyPhase } from "@/lib/journey";
import { JOURNEY_STORAGE_KEY } from "@/lib/journey";

interface JourneyContextValue {
  phase: JourneyPhase;
  setPhase: (phase: JourneyPhase) => void;
  isFirstVisit: boolean;
  dismissFirstVisit: () => void;
}

const JourneyContext = createContext<JourneyContextValue>({
  phase: "medical_graduate",
  setPhase: () => {},
  isFirstVisit: false,
  dismissFirstVisit: () => {},
});

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<JourneyPhase>("medical_graduate");
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(JOURNEY_STORAGE_KEY);
      if (stored && (stored === "medical_graduate" || stored === "resident" || stored === "attending")) {
        setPhaseState(stored as JourneyPhase);
        setIsFirstVisit(false);
      } else {
        setIsFirstVisit(true);
      }
    } catch {
      setIsFirstVisit(true);
    }
    setMounted(true);
  }, []);

  const setPhase = useCallback((newPhase: JourneyPhase) => {
    setPhaseState(newPhase);
    try {
      localStorage.setItem(JOURNEY_STORAGE_KEY, newPhase);
    } catch {
      // localStorage not available
    }
  }, []);

  const dismissFirstVisit = useCallback(() => {
    setIsFirstVisit(false);
  }, []);

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <JourneyContext.Provider value={{ phase, setPhase, isFirstVisit, dismissFirstVisit }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  return useContext(JourneyContext);
}
