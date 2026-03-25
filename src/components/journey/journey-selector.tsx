"use client";

import { useJourney } from "@/components/providers/journey-provider";
import { PHASE_CONFIGS, PHASE_ORDER } from "@/lib/journey";
import type { JourneyPhase } from "@/lib/journey";
import { useState } from "react";

export function JourneySelector() {
  const { isFirstVisit, setPhase, dismissFirstVisit } = useJourney();
  const [selected, setSelected] = useState<JourneyPhase | null>(null);
  const [animatingOut, setAnimatingOut] = useState(false);

  if (!isFirstVisit) return null;

  const handleSelect = (phase: JourneyPhase) => {
    setSelected(phase);
    setAnimatingOut(true);
    setTimeout(() => {
      setPhase(phase);
      dismissFirstVisit();
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-center justify-center bg-background p-4 transition-opacity duration-400 ${
        animatingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-3xl text-center">
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
            Welcome to USCEHub
          </span>
        </div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Where are you in your journey?
        </h1>
        <p className="mb-10 text-base text-muted">
          We&apos;ll personalize your experience based on your career stage.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PHASE_ORDER.map((phaseId) => {
            const config = PHASE_CONFIGS[phaseId];
            const Icon = config.icon;
            const isSelected = selected === phaseId;

            return (
              <button
                key={phaseId}
                onClick={() => handleSelect(phaseId)}
                className={`group relative flex flex-col items-center gap-4 rounded-xl border p-8 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-accent bg-accent-light scale-[1.02]"
                    : "border-border bg-surface hover:border-accent/50 hover:bg-surface-alt"
                }`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                    isSelected ? "bg-accent text-white" : "bg-surface-alt text-muted group-hover:text-accent"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">{config.label}</h3>
                  <p className="mt-1 text-sm text-muted">{config.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-muted/60">
          You can switch between phases anytime using the toggle at the bottom of the screen.
        </p>
      </div>
    </div>
  );
}
