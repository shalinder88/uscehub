import type { Metadata } from "next";
import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Visa & Immigration for Physicians — J-1, H-1B, Green Card",
  description:
    "The full immigration path for IMG physicians — ECFMG certification, J-1 training, the J-1 waiver, H-1B, the green card, and citizenship. Built from official USCIS, DOS, and ECFMG data.",
  alternates: {
    canonical: "https://uscehub.com/career/visa",
  },
  openGraph: {
    title: "Visa & Immigration for Physicians — J-1, H-1B, Green Card — USCEHub",
    description:
      "ECFMG, J-1, waiver, H-1B, green card, and citizenship guides for IMG physicians, built from official data.",
    url: "https://uscehub.com/career/visa",
  },
};

const tools = [
  {
    href: "/career/visa-journey",
    title: "Visa Journey Timeline",
    desc: "J-1 → waiver → H-1B → green card, mapped end to end with realistic timelines.",
  },
  {
    href: "/career/h1b",
    title: "H-1B Visa Guide",
    desc: "Cap-exempt status, transfers, and the fee structure for physicians.",
  },
  {
    href: "/career/greencard",
    title: "Green Card Pathways",
    desc: "EB-2 NIW, EB-1, and PERM routes compared for IMG physicians.",
  },
  {
    href: "/career/visa-bulletin",
    title: "Visa Bulletin Tracker",
    desc: "Monthly EB-2 / EB-1 priority date movement, including EB-2 India.",
  },
  {
    href: "/career/ecfmg",
    title: "ECFMG Certification",
    desc: "Pathways, fees, and timeline for 2026 certification.",
  },
  {
    href: "/career/citizenship",
    title: "Citizenship Pathways",
    desc: "Naturalization timeline and requirements after the green card.",
  },
  {
    href: "/career/h4-spouse",
    title: "H-4 Spouse & Family",
    desc: "Work authorization, EAD eligibility, and family resources.",
  },
  {
    href: "/career/alerts",
    title: "Policy Alerts",
    desc: "H-1B fees, Conrad 30 reauthorization, and USCIS processing changes.",
  },
];

export default function VisaHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Visa & Immigration for Physicians",
    description:
      "ECFMG, J-1, waiver, H-1B, green card, and citizenship guidance for IMG physicians.",
    url: "https://uscehub.com/career/visa",
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
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Visa &amp; Immigration
              </h1>
              <p className="text-muted max-w-3xl">
                The full immigration path for IMG physicians — from ECFMG
                certification and J-1 training through the waiver, H-1B, the
                green card, and citizenship. Every guide is built from official
                USCIS, Department of State, and ECFMG data.
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
      </div>
    </>
  );
}
