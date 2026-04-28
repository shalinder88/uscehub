"use client";

import { useState, useEffect } from "react";

const TERMS_VERSION = "2026-03-23";
const STORAGE_KEY = "uscehub_terms_accepted";

const TIMER_SECONDS = 60;

export function TermsGate() {
  const [status, setStatus] = useState<"loading" | "accepted" | "waiting" | "show" | "declined">("loading");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // SSR-safe localStorage hydration. Server renders null (status==
    // "loading"), client renders null in every initial state ("loading",
    // "accepted", "waiting"), so no hydration mismatch is possible.
    // React 19 flags setState-in-effect as a cascading-render risk,
    // but this is the documented hydration pattern (audit P1-13).
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === TERMS_VERSION) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus("accepted");
        return;
      }
    } catch {
      // Fall through to waiting
    }

    // Not yet accepted — wait 60 seconds then show
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("waiting");
    const timer = setTimeout(() => {
      setStatus("show");
    }, TIMER_SECONDS * 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, TERMS_VERSION);
    } catch {
      // Continue even if localStorage fails
    }
    setStatus("accepted");
  };

  const handleDecline = () => {
    setStatus("declined");
  };

  // Loading, accepted, or waiting (timer running) — show nothing
  if (status === "loading" || status === "accepted" || status === "waiting") return null;

  // Declined — blank the site
  if (status === "declined") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
        <div className="text-center px-6">
          <p className="text-white text-lg font-semibold mb-3">
            Access Denied
          </p>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            You must accept the Terms of Service and Privacy Policy to use USCEHub.
            Refresh the page to try again.
          </p>
          <button
            onClick={() => setStatus("show")}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Review Terms Again
          </button>
        </div>
      </div>
    );
  }

  // Show terms modal
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Terms of Service
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please review before continuing
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 pb-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <p>By using USCEHub, you acknowledge and agree that:</p>
            <ul className="space-y-1.5 ml-3 list-disc">
              <li>USCEHub is an <strong className="text-slate-800 dark:text-slate-200">informational directory only</strong> — not a placement agency, medical advisor, or guarantor of any program</li>
              <li>We provide <strong className="text-slate-800 dark:text-slate-200">no guarantees</strong> regarding accuracy, availability, or quality of listed programs</li>
              <li>You <strong className="text-slate-800 dark:text-slate-200">assume all risks</strong> related to applications, clinical experiences, and interactions with institutions</li>
              <li>USCEHub has <strong className="text-slate-800 dark:text-slate-200">no liability</strong> for any damages, losses, injuries, or outcomes</li>
              <li>Disputes are resolved through <strong className="text-slate-800 dark:text-slate-200">binding arbitration</strong> — you waive class action rights</li>
              <li>You agree to our <strong className="text-slate-800 dark:text-slate-200">Privacy Policy</strong> and data practices</li>
            </ul>
          </div>
        </div>

        {/* Expandable full terms */}
        <div className="px-6 pb-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {expanded ? "Hide full Terms of Service" : "Read full Terms of Service"}
          </button>

          {expanded && (
            <div className="mt-3 max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 space-y-4">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">1. Acceptance of Terms</p>
                <p>By accessing USCEHub.com, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, our Privacy Policy, and all applicable laws. If you do not agree, you must discontinue use immediately.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">2. Nature of Platform — Directory Only</p>
                <p>USCEHub is an informational directory. We do NOT operate as a staffing agency, guarantee placement, verify or endorse institutions, provide medical/legal/immigration advice, or supervise any clinical experience. All interactions between users and institutions are solely between those parties.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">3. No Professional Advice</p>
                <p>Nothing on this Platform constitutes medical, legal, immigration, or career advice. No professional-client relationship is created. Consult qualified professionals for advice specific to your situation.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">4. No Guarantee of Accuracy</p>
                <p>We make no warranties regarding accuracy, completeness, or reliability of any information including program listings, costs, requirements, match statistics, or user reviews. Programs may change without our knowledge. You must independently verify all information.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">5. Assumption of Risk</p>
                <p>You assume all risks associated with applying to programs, making payments, traveling, participating in clinical experiences, and all decisions made based on Platform information including risk of injury, illness, financial loss, or other harm.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">12. DISCLAIMER OF WARRANTIES</p>
                <p className="uppercase">THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">13. LIMITATION OF LIABILITY</p>
                <p className="uppercase">USCEHUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM USE OF THE PLATFORM, LISTED PROGRAMS, OR ANY INTERACTIONS. TOTAL LIABILITY SHALL NOT EXCEED $10.00.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">14. Indemnification</p>
                <p>You agree to defend, indemnify, and hold harmless USCEHub from all claims, damages, losses, and expenses arising from your use of the Platform or violation of these Terms.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">15. Binding Arbitration &amp; Class Action Waiver</p>
                <p>All disputes shall be settled by binding arbitration. You waive any right to participate in class action lawsuits or class-wide arbitration. You waive the right to a jury trial.</p>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-blue-600 dark:text-blue-400">
                  <a href="/terms" target="_blank" className="hover:underline">View complete Terms of Service →</a>
                </p>
                <p className="text-blue-600 dark:text-blue-400 mt-1">
                  <a href="/privacy" target="_blank" className="hover:underline">View Privacy Policy →</a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-6 py-4">
          <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-3">
            By clicking &ldquo;I Agree,&rdquo; you confirm that you have read and agree to our{" "}
            <a href="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
