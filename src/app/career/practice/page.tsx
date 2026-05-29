import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Offers & Practice Setup for Physicians — Salary, Contracts, Licensing",
  description:
    "Everything after you match with a job: salary benchmarks, offer comparison, contract review, malpractice insurance, state licensing, credentialing, interview prep, and tax planning for new attendings.",
  alternates: {
    canonical: "https://uscehub.com/career/practice",
  },
  openGraph: {
    title:
      "Offers & Practice Setup for Physicians — Salary, Contracts, Licensing — USCEHub",
    description:
      "Salary, offers, contracts, malpractice, licensing, credentialing, interviews, and taxes for new attending physicians.",
    url: "https://uscehub.com/career/practice",
  },
};

const tools = [
  {
    href: "/career/salary",
    title: "Salary Benchmarks",
    desc: "Verified compensation by specialty and state (Medscape, MGMA, Doximity).",
  },
  {
    href: "/career/offers",
    title: "Offer Comparison",
    desc: "Compare up to four job offers side by side — salary, RVUs, bonus, benefits.",
  },
  {
    href: "/career/contract",
    title: "Contract Checklist",
    desc: "What every J-1 waiver employment contract must include.",
  },
  {
    href: "/career/malpractice",
    title: "Malpractice Insurance",
    desc: "Occurrence vs claims-made, tail coverage, and what to demand.",
  },
  {
    href: "/career/licensing",
    title: "State Licensing",
    desc: "State medical license requirements and realistic timelines.",
  },
  {
    href: "/career/credentialing",
    title: "Credentialing",
    desc: "Hospital privileging — why you start six months early.",
  },
  {
    href: "/career/interview",
    title: "Interview Prep",
    desc: "Prepare for attending job interviews and site visits.",
  },
  {
    href: "/career/taxes",
    title: "Tax Planning",
    desc: "Tax planning essentials for your first attending year.",
  },
];

export default function PracticeHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Offers & Practice Setup for Physicians",
    description:
      "Salary, offers, contracts, malpractice, licensing, credentialing, interviews, and taxes for new attending physicians.",
    url: "https://uscehub.com/career/practice",
    numberOfItems: tools.length,
    provider: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="rounded-xl border border-border bg-surface p-8 sm:p-10 mb-10">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-accent/10 p-3 shrink-0">
              <Briefcase className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Offers &amp; Practice Setup
              </h1>
              <p className="text-muted max-w-3xl">
                Everything after you match with a job. Benchmark the salary,
                compare offers side by side, review the contract and malpractice
                coverage, and work through licensing, credentialing, interviews,
                and taxes before your first attending day.
              </p>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-muted mt-1">{tool.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted max-w-3xl">
          Educational information only — not legal, tax, financial, or insurance
          advice. Confirm specifics with a licensed professional before acting.
        </p>
      </div>
    </>
  );
}
