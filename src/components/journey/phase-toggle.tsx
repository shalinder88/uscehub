"use client";

import { useState } from "react";
import { useJourney } from "@/components/providers/journey-provider";
import { PHASE_CONFIGS, PHASE_ORDER } from "@/lib/journey";
import type { JourneyPhase } from "@/lib/journey";

export function PhaseToggle() {
  const { phase, setPhase, isFirstVisit } = useJourney();
  const [expanded, setExpanded] = useState(false);

  if (isFirstVisit) return null;

  const currentConfig = PHASE_CONFIGS[phase];
  const CurrentIcon = currentConfig.icon;

  const handleSelect = (newPhase: JourneyPhase) => {
    setPhase(newPhase);
    setExpanded(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Expanded phase selector */}
      {expanded && (
        <div className="mb-2 animate-slide-up rounded-xl border border-border bg-surface p-2 shadow-lg">
          {PHASE_ORDER.map((phaseId) => {
            const config = PHASE_CONFIGS[phaseId];
            const Icon = config.icon;
            const isActive = phase === phaseId;

            return (
              <button
                key={phaseId}
                onClick={() => handleSelect(phaseId)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div>
                  <div className="font-medium">{config.shortLabel}</div>
                  <div className="text-xs text-muted">{config.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Toggle pill */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-lg transition-all hover:border-accent/50 hover:bg-surface-alt"
      >
        <CurrentIcon className="h-4 w-4 text-accent" />
        <span>{currentConfig.shortLabel}</span>
        <svg
          className={`h-3 w-3 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
