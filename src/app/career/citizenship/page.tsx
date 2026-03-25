import type { Metadata } from "next";
import {
  Flag,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Lightbulb,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Citizenship Pathways — Immigration Timeline for Physicians",
  description:
    "Understand common immigration pathways for international medical graduate physicians: J-1 waiver to green card, H-1B, EB-1 extraordinary ability, and EB-2 NIW routes with timeline estimates.",
  alternates: {
    canonical: "https://uscehub.com/career/citizenship",
  },
  openGraph: {
    title: "Citizenship Pathways — IMG Physician Immigration — USCEHub",
    description:
      "Common immigration pathways for IMG physicians with timeline estimates, requirements, and tips.",
    url: "https://uscehub.com/career/citizenship",
  },
};

interface Pathway {
  id: number;
  title: string;
  route: string[];
  totalTimeline: string;
  keyRequirements: string[];
  pitfalls: string[];
  color: string;
  colorBg: string;
}

const pathways: Pathway[] = [
  {
    id: 1,
    title: "J-1 Waiver to Green Card (EB-2/EB-3)",
    route: [
      "J-1 Visa",
      "Conrad 30 Waiver",
      "H-1B Status",
      "PERM Labor Cert",
      "I-140 Petition",
      "I-485 / Green Card",
    ],
    totalTimeline: "7-12 years total",
    keyRequirements: [
      "Complete 3-year waiver service obligation",
      "Employer sponsors H-1B after waiver period",
      "PERM labor certification process (6-18 months)",
      "I-140 immigrant petition approval",
      "Priority date must be current for your country of birth",
      "I-485 adjustment of status or consular processing",
    ],
    pitfalls: [
      "Country of birth backlog (India/China can add 5-10+ years)",
      "Employer must be willing to sponsor through entire process",
      "Job changes during PERM/I-140 process can restart timeline",
      "H-1B cap issues if waiver employer does not sponsor",
      "3-year waiver obligation is strictly enforced",
    ],
    color: "text-accent",
    colorBg: "bg-accent/10",
  },
  {
    id: 2,
    title: "J-1 Waiver to EB-1 (Extraordinary Ability)",
    route: [
      "J-1 Visa",
      "Conrad 30 Waiver",
      "H-1B Status",
      "EB-1A/EB-1B Petition",
      "I-485 / Green Card",
    ],
    totalTimeline: "5-8 years total",
    keyRequirements: [
      "Complete 3-year waiver service obligation",
      "Build extraordinary ability profile (publications, awards, peer review, leadership)",
      "For EB-1A: self-petition, no employer sponsorship needed",
      "For EB-1B: outstanding researcher/professor, employer sponsors",
      "Meet at least 3 of 10 USCIS criteria for extraordinary ability",
      "Priority dates are generally current for EB-1",
    ],
    pitfalls: [
      "High evidentiary burden — many applications are denied",
      "Need sustained record of achievement, not just clinical work",
      "Publications and citations are heavily weighted",
      "Requires significant effort to build qualifying profile",
      "Denial does not prevent other green card petitions",
    ],
    color: "text-warning",
    colorBg: "bg-warning/10",
  },
  {
    id: 3,
    title: "H-1B Direct to Green Card (PERM)",
    route: [
      "H-1B Visa",
      "3+ Years Employment",
      "PERM Labor Cert",
      "I-140 Petition",
      "I-485 / Green Card",
    ],
    totalTimeline: "5-10+ years total",
    keyRequirements: [
      "H-1B cap-subject or cap-exempt employer (hospitals, universities)",
      "Employer sponsors PERM labor certification",
      "Prevailing wage determination",
      "I-140 immigrant petition filed and approved",
      "Wait for priority date to become current",
      "Adjust status or consular processing",
    ],
    pitfalls: [
      "H-1B cap lottery (if not cap-exempt) has low selection rate",
      "Tied to employer throughout the process",
      "PERM recruitment process can be lengthy and rigid",
      "Country of birth backlog significantly impacts timeline",
      "Any change in job duties may require new PERM",
    ],
    color: "text-cyan",
    colorBg: "bg-cyan/10",
  },
  {
    id: 4,
    title: "EB-2 NIW (National Interest Waiver)",
    route: [
      "Any Valid Status",
      "NIW Petition (Self)",
      "I-140 Approval",
      "I-485 / Green Card",
    ],
    totalTimeline: "3-7 years total",
    keyRequirements: [
      "Advanced degree (MD qualifies) or exceptional ability",
      "Work must be in the national interest of the United States",
      "No employer sponsorship or PERM required — self-petition",
      "Demonstrate work has substantial merit and national importance",
      "Show you are well-positioned to advance the proposed endeavor",
      "Demonstrate it would be beneficial to waive the labor certification",
    ],
    pitfalls: [
      "Approval rates vary — strong petition preparation is critical",
      "Must demonstrate impact beyond your local practice",
      "Clinical physicians in HPSAs have strong cases",
      "Priority date backlog applies (EB-2 India/China wait times)",
      "May need to maintain valid nonimmigrant status while waiting",
    ],
    color: "text-success",
    colorBg: "bg-success/10",
  },
];

const tips = [
  {
    title: "File I-140 Early",
    description:
      "Your priority date is established when your I-140 is filed. Even if your date is not current, filing early locks in your place in line. This is especially critical for applicants born in India or China.",
  },
  {
    title: "Maintain Valid Status",
    description:
      "Always ensure your immigration status is valid while any petition is pending. Gaps in status can cause complications. H-1B can be extended in 1-year increments beyond the 6-year limit if an I-140 is approved.",
  },
  {
    title: "Consider Multiple Pathways",
    description:
      "You can pursue EB-1 and EB-2 NIW simultaneously. An EB-1 denial does not affect a pending EB-2 case. Having multiple pathways gives you the best chance of a faster green card.",
  },
  {
    title: "Document Everything",
    description:
      "Keep records of publications, presentations, peer reviews, and awards throughout your career. These become critical evidence for EB-1 and NIW petitions.",
  },
  {
    title: "Choose Employers Wisely",
    description:
      "Before accepting a position, clarify the employer's commitment to immigration sponsorship and timeline. Get green card sponsorship commitments in writing as part of your contract.",
  },
  {
    title: "AC21 Portability",
    description:
      "After your I-485 has been pending for 180+ days and your I-140 is approved, you may change employers under AC21 portability if the new job is in the same or similar occupation.",
  },
];

export default function CitizenshipPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Citizenship Pathways for International Medical Graduate Physicians",
    description:
      "Common immigration pathways for IMG physicians including J-1 waiver, H-1B, EB-1, and EB-2 NIW routes.",
    url: "https://uscehub.com/career/citizenship",
    publisher: {
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Citizenship Pathways for Physicians
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            Understand the most common immigration routes for international
            medical graduates. From J-1 waiver to green card, with timeline
            estimates and key considerations.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 mb-10">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted">
              This is general information about immigration pathways, not legal
              advice. Immigration law is complex and changes frequently. Always
              consult a qualified immigration attorney for guidance specific to
              your situation.
            </p>
          </div>
        </div>

        {/* Pathways */}
        <div className="space-y-8 mb-16">
          {pathways.map((pathway) => (
            <div
              key={pathway.id}
              className="rounded-xl border border-border bg-surface p-6 sm:p-8"
            >
              {/* Title & Timeline */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {pathway.title}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${pathway.colorBg} ${pathway.color}`}
                >
                  <Clock className="h-3 w-3" />
                  {pathway.totalTimeline}
                </span>
              </div>

              {/* Visual Route */}
              <div className="mb-6 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max py-2">
                  {pathway.route.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className={`rounded-lg ${pathway.colorBg} px-4 py-2.5 text-xs font-medium ${pathway.color} whitespace-nowrap`}
                      >
                        {step}
                      </div>
                      {i < pathway.route.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requirements */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Key Requirements
                  </h3>
                  <ul className="space-y-2">
                    {pathway.keyRequirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="rounded-full bg-success/20 p-0.5 mt-1.5 shrink-0">
                          <div className="h-1 w-1 rounded-full bg-success" />
                        </div>
                        <span className="text-sm text-muted">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pitfalls */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-danger" />
                    Common Pitfalls
                  </h3>
                  <ul className="space-y-2">
                    {pathway.pitfalls.map((pitfall, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="rounded-full bg-danger/20 p-0.5 mt-1.5 shrink-0">
                          <div className="h-1 w-1 rounded-full bg-danger" />
                        </div>
                        <span className="text-sm text-muted">{pitfall}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-6 w-6 text-warning" />
            <h2 className="text-2xl font-bold text-foreground">
              Tips and Strategies
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface p-5 hover-glow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {tip.title}
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
