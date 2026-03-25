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

export function ActivityFeed() {
  const [activities, setActivities] = useState<string[]>([]);
  const [fadeIndex, setFadeIndex] = useState(-1);

  useEffect(() => {
    setActivities([generateActivity(), generateActivity(), generateActivity()]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const replaceIdx = Math.floor(Math.random() * 3);
      setFadeIndex(replaceIdx);
      setTimeout(() => {
        setActivities((prev) => {
          const next = [...prev];
          next[replaceIdx] = generateActivity();
          return next;
        });
        setFadeIndex(-1);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className="bg-background pb-6">
      <div className="mx-auto max-w-3xl px-4">
        <div className="space-y-1">
          {activities.map((activity, i) => (
            <div
              key={`${i}-${activity}`}
              className={`text-center text-xs text-muted transition-opacity duration-400 ${
                fadeIndex === i ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
              {activity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
