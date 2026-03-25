"use client";

import { useState, useEffect } from "react";
import { PartyPopper, X } from "lucide-react";

const BASE_COUNT = 47;

interface MatchSubmission {
  program: string;
  year: string;
  uscehubProgram: string;
  name?: string;
  submittedAt: string;
}

function getSubmissions(): MatchSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("match-submissions") || "[]");
  } catch {
    return [];
  }
}

export function MatchCounter() {
  const [showModal, setShowModal] = useState(false);
  const [submissions, setSubmissions] = useState<MatchSubmission[]>([]);
  const [form, setForm] = useState({ name: "", program: "", year: "2026", uscehubProgram: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmissions(getSubmissions());
  }, []);

  const totalCount = BASE_COUNT + submissions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.program || !form.uscehubProgram) return;
    const newSubmission: MatchSubmission = {
      program: form.program,
      year: form.year,
      uscehubProgram: form.uscehubProgram,
      name: form.name || undefined,
      submittedAt: new Date().toISOString(),
    };
    const updated = [...submissions, newSubmission];
    localStorage.setItem("match-submissions", JSON.stringify(updated));
    setSubmissions(updated);
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setForm({ name: "", program: "", year: "2026", uscehubProgram: "" });
    }, 2000);
  };

  return (
    <>
      <div className="border-t border-border bg-surface-alt py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 text-sm text-muted">
          <PartyPopper className="h-4 w-4 text-amber-500" />
          <span>
            <span className="font-semibold text-foreground">{totalCount}</span> IMGs who used USCEHub opportunities matched into residency
          </span>
          <span className="text-border-strong">|</span>
          <button
            onClick={() => setShowModal(true)}
            className="font-medium text-accent hover:text-accent"
          >
            Report Your Match
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Report Your Match</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <PartyPopper className="mx-auto h-8 w-8 text-amber-500" />
                <p className="mt-2 font-medium text-foreground">Congratulations on your match!</p>
                <p className="mt-1 text-sm text-muted">Thank you for sharing.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Name (optional)</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Program Matched *</label>
                  <input
                    type="text"
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    placeholder="e.g., Internal Medicine at NYU"
                    required
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Match Year *</label>
                    <select
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      {["2026", "2025", "2024", "2023", "2022"].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">USCEHub Program Used *</label>
                    <input
                      type="text"
                      value={form.uscehubProgram}
                      onChange={(e) => setForm({ ...form, uscehubProgram: e.target.value })}
                      placeholder="e.g., Cleveland Clinic"
                      required
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
