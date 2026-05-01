"use client";

import { useState, useEffect } from "react";

const COUNTRIES = [
  "India", "Nigeria", "Pakistan", "Egypt", "Philippines",
  "Bangladesh", "Ghana", "Iran", "Syria", "Nepal",
  "Sri Lanka", "Kenya", "Ethiopia", "Colombia", "Brazil",
];

const PROGRAMS = [
  "Cleveland Clinic", "UPMC EOP", "Johns Hopkins", "Mayo Clinic",
  "Mount Sinai", "NYU Langone", "Mass General", "UCLA Health",
  "Stanford Medicine", "Duke University", "Emory Healthcare",
];

const ACTIONS = [
  (country: string, program: string) => `Someone from ${country} just browsed ${program}`,
  (country: string) => `New user signed up from ${country}`,
  (_country: string, program: string) => `${Math.floor(Math.random() * 5) + 2} people saved ${program} today`,
  (country: string) => `A student from ${country} just compared 3 programs`,
  (_country: string, program: string) => `${program} was viewed ${Math.floor(Math.random() * 20) + 10} times today`,
];

function generateActivity(): string {
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const program = PROGRAMS[Math.floor(Math.random() * PROGRAMS.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  return action(country, program);
}

// Single-line ticker — rotates every 3.5s with crossfade. Reads as a "live
// publication" wire-feed strip rather than a stacked notification list.
export function ActivityFeed() {
  const [activity, setActivity] = useState<string | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivity(generateActivity());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActivity(generateActivity());
        setFading(false);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (!activity) return null;

  return (
    <div className="border-b border-[#dfd5b8] bg-[#f0e9d3] py-2.5 dark:border-[#34373f] dark:bg-[#2a2d36]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4">
        <span aria-hidden="true" className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
          Live
        </span>
        <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1a5454] opacity-60 dark:bg-[#0fa595]" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1a5454] dark:bg-[#0fa595]" />
        </span>
        <span
          className={`truncate text-center text-[12.5px] text-[#4a5057] transition-opacity duration-300 dark:text-[#bfc1c9] ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {activity}
        </span>
      </div>
    </div>
  );
}
