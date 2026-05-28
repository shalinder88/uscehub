import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { Globe, Sparkles, BarChart3, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "IMG Corner — Coming Soon",
  description:
    "International Medical Graduate hub — ECFMG pathways, USMLE strategy, visas (J-1 / H-1B), IMG match rates by specialty, and IMG-friendly residency programs. Coming soon.",
  alternates: {
    canonical: "https://uscehub.com/img-corner",
  },
};

// Same content list /img-resources surfaces — shown blurred behind the
// Coming Soon overlay so visitors can preview what's coming.
const previewSections = [
  {
    title: "ECFMG Certification",
    desc: "Six pathways, USMLE Step requirements, OET, fees, timeline, and the 7-year rule.",
  },
  {
    title: "USMLE Strategy",
    desc: "Step 1 pass/fail framing, Step 2 CK target scores by specialty, scheduling and prep.",
  },
  {
    title: "Visas — J-1 vs H-1B",
    desc: "J-1 sponsorship via ECFMG, H-1B employer sponsorship, the Conrad 30 waiver, and state-by-state slot availability.",
  },
  {
    title: "Licensing Pathways",
    desc: "Alternative IMG licensing routes (Tennessee, Florida, etc.) that bypass full US residency.",
  },
  {
    title: "Interview Prep",
    desc: "Common IMG-specific interview questions, sponsorship questions, and how to answer them.",
  },
];

export default function ImgCornerPage() {
  return (
    <div className="bg-[var(--bg)] dark:bg-slate-950">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "IMG Corner", url: "https://uscehub.com/img-corner" },
        ]}
      />

      {/* Hero */}
      <div style={{ background: "var(--bg-alt)", borderBottom: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--teal-soft)" }}
            >
              <Globe className="h-6 w-6" style={{ color: "var(--teal)" }} />
            </div>
            <h1
              className="text-4xl sm:text-5xl"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
              }}
            >
              IMG Corner
            </h1>
            <p className="mt-3 text-base" style={{ color: "var(--ink-soft)" }}>
              The path from foreign medical school to a U.S. residency is its
              own process — ECFMG, USMLE, visas, observerships, the Match.
            </p>
            <div
              className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
              style={{ background: "var(--teal-soft)", color: "var(--teal-deep)" }}
            >
              <Sparkles className="h-4 w-4" />
              Coming Soon
            </div>
          </div>
        </div>
      </div>

      {/* Residency Intelligence — live now (only unblurred preview card) */}
      <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
        <Link
          href="/img-resources"
          className="card-lift group block rounded-2xl p-6"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--teal-soft)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--teal-soft)" }}
            >
              <BarChart3 className="h-6 w-6" style={{ color: "var(--teal)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  Residency Intelligence
                </h2>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: "var(--teal-soft)", color: "var(--teal-deep)" }}
                >
                  Live
                </span>
              </div>
              <p className="mt-1.5" style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6 }}>
                Match rates by specialty, scores that mattered, US clinical experience
                benchmarks, IMG-friendly programs, and 2026 NRMP results — already live.
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1 text-sm"
                style={{ color: "var(--teal)", fontWeight: 600 }}
              >
                Open Residency Intelligence
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Blurred preview of what's coming */}
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
          style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }}
          aria-hidden
        >
          {previewSections.map((s) => (
            <div
              key={s.title}
              className="card-lift rounded-2xl p-6"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 22,
                  fontWeight: 500,
                  color: "var(--ink)",
                  marginBottom: 6,
                }}
              >
                {s.title}
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6 }}>
                {s.desc}
              </p>
              <span
                className="mt-3 inline-block text-xs"
                style={{ color: "var(--teal)", fontWeight: 500 }}
              >
                Open →
              </span>
            </div>
          ))}
        </div>

        {/* Overlay message */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-6"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="card-lift inline-block rounded-2xl px-6 py-4"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              maxWidth: 480,
              pointerEvents: "auto",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 20,
                fontWeight: 500,
                color: "var(--ink)",
                marginBottom: 8,
              }}
            >
              More IMG content coming soon.
            </p>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.6 }}>
              Residency Intelligence (above) is already live. ECFMG pathways,
              USMLE strategy, visas, and licensing guides arrive in the next release.
            </p>
            <p
              className="mt-4 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Have a question now?{" "}
              <Link
                href="/contact-admin"
                style={{ color: "var(--teal-deep)", textDecoration: "underline" }}
              >
                Contact admin
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
