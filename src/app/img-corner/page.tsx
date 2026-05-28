import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { Globe, Sparkles } from "lucide-react";

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
    title: "IMG Match Rates",
    desc: "Match rates by specialty, scores that mattered, US clinical experience benchmarks. 2026 NRMP results integrated.",
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
              className="rounded-2xl p-6"
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
            className="inline-block rounded-2xl px-6 py-4"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              boxShadow: "0 12px 32px -10px rgba(0,0,0,0.10)",
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
              We&apos;re building this.
            </p>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.6 }}>
              IMG Corner consolidates everything an international medical
              graduate needs in one place. Live in the next release.
            </p>
            <p
              className="mt-4 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Need IMG info now? Browse our{" "}
              <Link
                href="/img-resources"
                style={{ color: "var(--teal-deep)", textDecoration: "underline" }}
              >
                current match data
              </Link>{" "}
              or{" "}
              <Link
                href="/contact-admin"
                style={{ color: "var(--teal-deep)", textDecoration: "underline" }}
              >
                contact admin
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
