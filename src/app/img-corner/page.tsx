import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "IMG Corner — ECFMG, Visas, Match Strategy",
  description:
    "Resources specific to International Medical Graduates — ECFMG certification, USMLE pathways, J-1 / H-1B visa basics, IMG match rates by specialty, and IMG-friendly programs.",
  alternates: {
    canonical: "https://uscehub.com/img-corner",
  },
};

const imgSections = [
  {
    title: "ECFMG Certification",
    href: "/career/ecfmg",
    desc: "Six pathways, USMLE Step requirements, OET, fees, timeline, and the 7-year rule.",
  },
  {
    title: "USMLE for IMGs",
    href: "/career/usmle",
    desc: "Step 1 pass/fail framing, Step 2 CK target scores by specialty, scheduling and prep.",
  },
  {
    title: "Visas — J-1 vs H-1B",
    href: "/career/waiver",
    desc: "J-1 sponsorship via ECFMG, H-1B employer sponsorship, the Conrad 30 waiver, and state-by-state slot availability.",
  },
  {
    title: "Licensing Pathways",
    href: "/career/licensing",
    desc: "Alternative IMG licensing routes (Tennessee, Florida, etc.) that bypass full US residency.",
  },
  {
    title: "Interview Prep",
    href: "/career/interview",
    desc: "Common IMG-specific interview questions, sponsorship questions, and how to answer them.",
  },
  {
    title: "Credentialing",
    href: "/career/credentialing",
    desc: "Hospital privileging, NPI, malpractice insurance — what you need post-Match.",
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

      {/* Cream hero matching mockup-127 */}
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
              The path from foreign medical school to a U.S. residency is its own
              process — ECFMG, USMLE, visas, observerships, the Match. Everything
              here is IMG-specific.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {imgSections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl p-6 transition-all hover:translate-y-[-2px]"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                textDecoration: "none",
                color: "var(--ink)",
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
            </Link>
          ))}
        </div>

        <p
          className="mt-10 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Looking for general residency data (specialty competitiveness, FREIDA
          program search, Match statistics)?{" "}
          <Link
            href="/img-resources"
            style={{ color: "var(--teal-deep)", textDecoration: "underline" }}
          >
            See Residency Intelligence
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
