import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SuggestProgramForm } from "@/components/community/community-tabs";

// PR 0e-fix: page softened. The submission form is now a placeholder
// that points users to /contact-admin (PR 0e audit C3). The page emits
// noindex until a real submission backend exists, so search engines do
// not surface a placeholder as a working intake (PR 0e audit H2).
export const metadata: Metadata = {
  title: "Suggest a Program — Coming Soon",
  description:
    "Program suggestion intake is being planned. For now, suggest programs by contacting admin via /contact-admin.",
  alternates: {
    canonical: "https://uscehub.com/community/suggest-program",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SuggestProgramPage() {
  return (
    <div className="bg-[var(--bg)] dark:bg-slate-950">
      <div style={{ background: "var(--bg-alt)", borderBottom: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="text-3xl sm:text-4xl"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
              }}
            >
              Suggest a Program
            </h1>
            <p className="mt-3 text-base" style={{ color: "var(--ink-soft)" }}>
              Help fellow medical students and graduates by submitting programs you know about.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/community"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Community
        </Link>

        <SuggestProgramForm standalone />
      </div>
    </div>
  );
}
