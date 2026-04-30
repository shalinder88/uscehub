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
    // Client-only localStorage seed AFTER hydration. Server renders
    // totalCount=BASE_COUNT (no submissions); client first render
    // matches; then this effect adds locally-stored submissions to the
    // count. Lazy init would diverge between server and client. React
    // 19 flags setState-in-effect as a cascading-render risk, but this
    // is the documented client-only-after-mount pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="border-t border-[#dfd5b8] bg-[#f0e9d3] py-4 dark:border-[#34373f] dark:bg-[#2a2d36]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-sm text-[#4a5057] dark:text-[#bfc1c9]">
          <PartyPopper className="h-4 w-4 text-[#1a5454] dark:text-[#0fa595]" />
          <span>
            <span className="font-mono font-semibold text-[#0d1418] dark:text-[#f7f5ec]">{totalCount}</span> applicants who used USCEHub opportunities matched into residency
          </span>
          <span className="text-[#dfd5b8] dark:text-[#34373f]">|</span>
          <button
            onClick={() => setShowModal(true)}
            className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#1a5454] hover:underline dark:text-[#0fa595]"
          >
            Report your match
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-6 shadow-xl dark:border-[#34373f] dark:bg-[#23262e]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#0d1418] dark:text-[#f7f5ec]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'Source Serif Pro', ui-serif, Georgia, serif" }}>Report your match</h3>
              <button onClick={() => setShowModal(false)} className="text-[#7a7f88] hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:text-[#f7f5ec]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <PartyPopper className="mx-auto h-8 w-8 text-[#1a5454] dark:text-[#0fa595]" />
                <p className="mt-2 font-medium text-[#0d1418] dark:text-[#f7f5ec]">Congratulations on your match!</p>
                <p className="mt-1 text-sm text-[#4a5057] dark:text-[#bfc1c9]">Thank you for sharing.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a5454] dark:text-[#0fa595]">Name (optional)</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-[#dfd5b8] bg-white px-3 py-2 text-sm text-[#0d1418] placeholder:text-[#7a7f88] focus:border-[#1a5454] focus:outline-none focus:ring-1 focus:ring-[#1a5454]/20 dark:border-[#34373f] dark:bg-[#1d1f26] dark:text-[#f7f5ec] dark:placeholder:text-[#7e8089] dark:focus:border-[#0fa595]"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a5454] dark:text-[#0fa595]">Program matched *</label>
                  <input
                    type="text"
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    placeholder="e.g., Internal Medicine at NYU"
                    required
                    className="w-full rounded-lg border border-[#dfd5b8] bg-white px-3 py-2 text-sm text-[#0d1418] placeholder:text-[#7a7f88] focus:border-[#1a5454] focus:outline-none focus:ring-1 focus:ring-[#1a5454]/20 dark:border-[#34373f] dark:bg-[#1d1f26] dark:text-[#f7f5ec] dark:placeholder:text-[#7e8089] dark:focus:border-[#0fa595]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a5454] dark:text-[#0fa595]">Match year *</label>
                    <select
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="w-full rounded-lg border border-[#dfd5b8] bg-white px-3 py-2 text-sm text-[#0d1418] focus:border-[#1a5454] focus:outline-none focus:ring-1 focus:ring-[#1a5454]/20 dark:border-[#34373f] dark:bg-[#1d1f26] dark:text-[#f7f5ec] dark:focus:border-[#0fa595]"
                    >
                      {["2026", "2025", "2024", "2023", "2022"].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a5454] dark:text-[#0fa595]">USCEHub program used *</label>
                    <input
                      type="text"
                      value={form.uscehubProgram}
                      onChange={(e) => setForm({ ...form, uscehubProgram: e.target.value })}
                      placeholder="e.g., Cleveland Clinic"
                      required
                      className="w-full rounded-lg border border-[#dfd5b8] bg-white px-3 py-2 text-sm text-[#0d1418] placeholder:text-[#7a7f88] focus:border-[#1a5454] focus:outline-none focus:ring-1 focus:ring-[#1a5454]/20 dark:border-[#34373f] dark:bg-[#1d1f26] dark:text-[#f7f5ec] dark:placeholder:text-[#7e8089] dark:focus:border-[#0fa595]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#1a5454] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0e3838] dark:bg-[#0fa595] dark:hover:bg-[#0b8378]"
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
