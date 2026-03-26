import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Stethoscope,
  Shield,
  Globe,
  FileText,
  GraduationCap,
  ExternalLink,
  ArrowRight,
  Star,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Recommended Tools & Resources for IMGs",
  description:
    "Curated list of essential tools, study resources, and services for International Medical Graduates preparing for USMLE, ECFMG certification, and residency applications.",
  alternates: {
    canonical: "https://uscehub.com/resources",
  },
  openGraph: {
    title: "Recommended Tools & Resources for IMGs — USCEHub",
    description:
      "Essential study tools, exam prep, insurance, and services for IMGs applying to US residency programs.",
    url: "https://uscehub.com/resources",
  },
};

const EXAM_PREP = [
  {
    name: "UWorld USMLE",
    description:
      "The gold standard question bank for USMLE Step 1 and Step 2 CK. Used by 95%+ of medical students. Detailed explanations build clinical reasoning.",
    price: "$400-600",
    icon: BookOpen,
    tag: "Most Popular",
    url: "https://www.uworld.com/usmle/", // REPLACE with affiliate link
    why: "Highest-yield resource for Step 2 CK — the score that matters most for IMGs.",
  },
  {
    name: "Amboss",
    description:
      "Integrated question bank and medical library. Strong visual aids, clinical decision support, and well-organized study plans.",
    price: "$200-400/yr",
    icon: BookOpen,
    tag: "Great Value",
    url: "https://www.amboss.com/us", // REPLACE with affiliate link
    why: "Best as a supplement to UWorld. The built-in medical library saves research time.",
  },
  {
    name: "First Aid for the USMLE",
    description:
      "The classic review book for Step 1 and Step 2. Pairs with UWorld for comprehensive coverage. Updated annually.",
    price: "$55",
    icon: FileText,
    tag: "Essential",
    url: "https://www.amazon.com/s?k=first+aid+usmle", // REPLACE with Amazon affiliate link
    why: "Use the latest edition. Many IMGs annotate First Aid with UWorld explanations.",
  },
];

const OET_PREP = [
  {
    name: "E2Language OET Prep",
    description:
      "Online OET preparation with mock tests, video lessons, and live practice. Covers all four sub-tests (Listening, Reading, Speaking, Writing).",
    price: "$200-400",
    icon: Globe,
    url: "https://www.e2language.com/", // REPLACE with affiliate link
    why: "OET is required for ALL IMGs. Minimum scores: Listening 350, Reading 350, Speaking 350, Writing 300.",
  },
  {
    name: "OET Official Practice",
    description:
      "Official practice materials from OET. Includes sample tests, preparation guides, and scoring criteria explanations.",
    price: "Free-$100",
    icon: Globe,
    url: "https://www.occupationalenglishtest.org/preparation/",
    why: "Start here for free before investing in paid courses. Understand the test format first.",
  },
];

const INSURANCE = [
  {
    name: "HPSO Malpractice Insurance",
    description:
      "Professional liability insurance for medical students and observers. Required by most clinical rotation sites before you can start.",
    price: "$200-500/yr",
    icon: Shield,
    url: "https://www.hpso.com/", // REPLACE with affiliate link
    why: "Many observership programs require proof of malpractice insurance before your first day.",
  },
  {
    name: "CM&F Group",
    description:
      "Medical malpractice and professional liability insurance. Offers specific policies for medical students and clinical observers.",
    price: "$200-400/yr",
    icon: Shield,
    url: "https://www.cmfgroup.com/", // REPLACE with affiliate link
    why: "Alternative to HPSO. Compare both and pick the one that covers your specific rotation type.",
  },
];

const CREDENTIALS = [
  {
    name: "WES (World Education Services)",
    description:
      "Credential evaluation for international degrees. Required by many state medical boards and some residency programs.",
    price: "$200+",
    icon: GraduationCap,
    url: "https://www.wes.org/", // Apply for WES affiliate at wes.org/wes-affiliate-program/ (10% commission)
    why: "Some states require WES evaluation for medical licensure. Check your target state's requirements early.",
  },
  {
    name: "ECFMG Certification",
    description:
      "Required for all IMGs entering US residency. Includes USMLE exams, OET, and pathway completion.",
    price: "$935+",
    icon: GraduationCap,
    url: "https://www.ecfmg.org/certification/",
    why: "Start early — the process takes months. 2026 Pathways deadline is January 31, 2026.",
  },
];

const APPLICATION = [
  {
    name: "ERAS (Electronic Residency Application Service)",
    description:
      "The platform for submitting residency applications. MyERAS opens in June, applications transmit in September.",
    price: "$1,500-3,000+",
    icon: FileText,
    url: "https://eras.aamc.org/",
    why: "Cost depends on how many programs you apply to. IMGs typically apply to 150-200+ programs.",
  },
  {
    name: "FREIDA",
    description:
      "AMA's database of 13,000+ residency programs. Filter by IMG percentage, visa sponsorship, specialty, and location.",
    price: "Free (basic) / $20/yr (premium)",
    icon: Stethoscope,
    url: "https://freida.ama-assn.org/",
    why: "Essential for identifying IMG-friendly programs. Filter by J-1 visa sponsorship and IMG resident percentage.",
  },
  {
    name: "NRMP Match Data",
    description:
      "Official match statistics including specialty-specific data, Charting Outcomes reports, and historical trends.",
    price: "Free",
    icon: Star,
    url: "https://www.nrmp.org/match-data/",
    why: "Study the Charting Outcomes in Advance reports for your target specialty before applying.",
  },
];

function ResourceCard({
  item,
}: {
  item: {
    name: string;
    description: string;
    price: string;
    icon: React.ElementType;
    url: string;
    why: string;
    tag?: string;
  };
}) {
  const Icon = item.icon;
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-slate-200 dark:border-slate-700 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                {item.name}
              </h3>
              {item.tag && (
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-400">
                  {item.tag}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {item.price}
            </p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-500" />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        {item.description}
      </p>
      <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
        Why: <span className="font-normal text-slate-500 dark:text-slate-400">{item.why}</span>
      </p>
    </a>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Recommended Tools & Resources for IMGs",
  description:
    "Curated list of essential tools, study resources, and services for International Medical Graduates.",
  url: "https://uscehub.com/resources",
};

export default function ResourcesPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "Resources", url: "https://uscehub.com/resources" },
        ]}
      />

      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-blue-400" />
            <h1 className="text-3xl font-bold sm:text-4xl">
              Tools &amp; Resources We Recommend
            </h1>
            <p className="mt-4 text-base text-slate-400">
              Everything you need for USMLE prep, ECFMG certification, and
              residency applications — curated by someone who used them all.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] text-slate-500 dark:text-slate-400">
            Some links may be affiliate links. If you purchase through them, we may earn a small commission at no extra cost to you. This helps keep USCEHub free.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Exam Prep */}
        <section className="mb-12">
          <SectionHeader
            title="USMLE Exam Preparation"
            subtitle="Step 2 CK is the most important score for IMGs. Average matched non-US IMG score: 245."
          />
          <div className="space-y-3">
            {EXAM_PREP.map((item) => (
              <ResourceCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* OET */}
        <section className="mb-12">
          <SectionHeader
            title="OET Medicine Preparation"
            subtitle="Required for ALL IMGs regardless of native language. Must pass all 4 sub-tests in a single sitting."
          />
          <div className="space-y-3">
            {OET_PREP.map((item) => (
              <ResourceCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* Insurance */}
        <section className="mb-12">
          <SectionHeader
            title="Malpractice Insurance"
            subtitle="Required by most observership and externship programs before your first day."
          />
          <div className="space-y-3">
            {INSURANCE.map((item) => (
              <ResourceCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* Credentials */}
        <section className="mb-12">
          <SectionHeader
            title="Credentials & Certification"
            subtitle="Get your credentials evaluated and ECFMG certification started early."
          />
          <div className="space-y-3">
            {CREDENTIALS.map((item) => (
              <ResourceCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* Application */}
        <section className="mb-12">
          <SectionHeader
            title="Application & Research Tools"
            subtitle="Essential platforms for the residency application process."
          />
          <div className="space-y-3">
            {APPLICATION.map((item) => (
              <ResourceCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* Cost Summary */}
        <section className="mb-12">
          <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Total Estimated Cost for IMG Application Cycle
            </h2>
            <div className="mt-4 space-y-2">
              {[
                { item: "USMLE Step 1", cost: "$1,000+" },
                { item: "USMLE Step 2 CK", cost: "$1,000+" },
                { item: "OET Medicine", cost: "$587" },
                { item: "ECFMG Certification", cost: "$935+" },
                { item: "Study resources (UWorld, etc.)", cost: "$400-800" },
                { item: "ERAS applications (150-200 programs)", cost: "$1,500-3,000+" },
                { item: "Malpractice insurance", cost: "$200-500" },
                { item: "Observership fees", cost: "$0-3,000" },
                { item: "Travel & housing for rotations", cost: "$3,000-10,000" },
                { item: "Interview costs (mostly virtual now)", cost: "$200-1,500" },
              ].map((row) => (
                <div key={row.item} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">{row.item}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{row.cost}</span>
                </div>
              ))}
              <div className="mt-3 border-t border-amber-200 dark:border-amber-800 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">Estimated Total</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">$12,000 - $22,000+</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">
              Costs vary significantly by location, number of applications, and
              whether observerships are free or paid. Use our{" "}
              <Link href="/tools/cost-calculator" className="underline hover:text-slate-700 dark:hover:text-slate-300">
                Cost Calculator
              </Link>{" "}
              for a personalized estimate.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/browse">
            <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800">
              Browse Opportunities
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </button>
          </Link>
          <Link href="/img-resources">
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              IMG Resources
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
