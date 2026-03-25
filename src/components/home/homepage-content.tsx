"use client";

import { useJourney } from "@/components/providers/journey-provider";
import { ResidentHero, AttendingHero, PhaseCards } from "@/components/home/phase-hero";

interface HomepageContentProps {
  /** Rendered server-side USCE hero + sections */
  usceContent: React.ReactNode;
}

export function HomepageContent({ usceContent }: HomepageContentProps) {
  const { phase } = useJourney();

  return (
    <>
      {phase === "medical_graduate" && usceContent}
      {phase === "resident" && <ResidentHero />}
      {phase === "attending" && <AttendingHero />}
      <PhaseCards />
    </>
  );
}
