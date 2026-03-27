import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  MapPin,
  Building2,
  Mountain,
  TreePine,
  Sun,
  Shield,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Stethoscope,
  Users,
  Infinity,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "J-1 Waiver Pathways Beyond Conrad 30 — HHS, ARC, DRA, SCRC, VA — USCEHub",
  description:
    "Complete guide to all 6 J-1 waiver pathways for physicians: Conrad 30, HHS Clinical Care, ARC, DRA, SCRC, and VA. Requirements, processing times, fees, and which pathway is right for you.",
  alternates: {
    canonical: "https://uscehub.com/career/waiver/pathways",
  },
  openGraph: {
    title: "J-1 Waiver Pathways Beyond Conrad 30 — USCEHub",
    description:
      "All 6 J-1 waiver pathways compared: Conrad 30, HHS, ARC, DRA, SCRC, VA. Requirements, slots, fees, and processing times.",
    url: "https://uscehub.com/career/waiver/pathways",
  },
};

interface Pathway {
  name: string;
  shortName: string;
  icon: typeof MapPin;
  slots: string;
  fee: string;
  processing: string;
  specialties: string;
  coverage: string;
  requirements: string[];
  pros: string[];
  cons: string[];
  url: string;
  color: string;
}

const pathways: Pathway[] = [
  {
    name: "Conrad State 30 Program",
    shortName: "Conrad 30",
    icon: MapPin,
    slots: "30 per state (+ up to 10 flex in most states)",
    fee: "Varies by state ($0-500 state fee)",
    processing: "State: 2-10 weeks → DOS: 8-12 weeks → USCIS: 1-3 months",
    specialties: "All specialties accepted (primary care prioritized)",
    coverage: "All 50 states + DC",
    requirements: [
      "Must work in a HPSA, MUA, or serve a MUP for 3 years",
      "Full-time (40+ hours/week) at the sponsoring facility",
      "Full unrestricted state medical license required",
      "Employer must demonstrate failed US physician recruitment",
      "No non-compete clauses allowed in federal waiver contracts",
      "Work in H-1B status after waiver approval",
    ],
    pros: [
      "Most common and well-understood pathway",
      "All specialties eligible (not just primary care)",
      "Every state participates",
      "Flex slots available in most states for non-HPSA sites",
    ],
    cons: [
      "Only 30 slots per state — competitive states fill in days",
      "19 states filled all 30 slots in FY 2024",
      "Some states (TX, AZ, IN) have no flex slots",
      "Potential sunset risk — reauthorization pending in Congress",
    ],
    url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/conrad-30-waiver-program",
    color: "text-accent",
  },
  {
    name: "HHS Clinical Care Waiver (Supplement B)",
    shortName: "HHS",
    icon: Building2,
    slots: "Unlimited — no cap (~110 cases reviewed/year)",
    fee: "No HHS fee (standard DOS $120 fee applies)",
    processing: "6-8 weeks at HHS level, plus DOS and USCIS (total 6-9 months)",
    specialties: "Primary care only: Family Medicine, General Internal Medicine, General Pediatrics, OB/GYN, General Psychiatry",
    coverage: "Nationwide — any facility in a HPSA with score 7+ (expanded from FQHCs-only in 2020)",
    requirements: [
      "Facility must be in a HPSA with score of 7 or higher",
      "Limited to primary care specialties and general psychiatry",
      "3-year full-time service commitment",
      "Expanded in 2020 beyond FQHCs to any qualifying facility",
      "Facilities in HPSAs marked 'Proposed for Withdrawal' on HRSA website are NOT eligible (since Oct 2023)",
    ],
    pros: [
      "Unlimited slots — no state cap",
      "No application fee",
      "Good backup when Conrad slots are full",
      "Available nationwide, not limited by state programs",
    ],
    cons: [
      "Total timeline 6-9 months (HHS 6-8 weeks + DOS + USCIS)",
      "Limited to primary care and psychiatry only (no subspecialists)",
      "Requires HPSA score 7+ (not all HPSA sites qualify)",
      "Long wait makes planning difficult",
    ],
    url: "https://www.hhs.gov/about/agencies/oga/about-oga/what-we-do/visitor-exchange-program/supplementary-b-clinical-care.html",
    color: "text-cyan",
  },
  {
    name: "Appalachian Regional Commission (ARC)",
    shortName: "ARC",
    icon: Mountain,
    slots: "Unlimited — no cap",
    fee: "No application fee (eliminated June 2021)",
    processing: "Typically faster than HHS — 3-6 months total",
    specialties: "Primary care, psychiatry, AND subspecialists accepted",
    coverage:
      "423 Appalachian counties across 13 states: AL, GA, KY, MD, MS, NY, NC, OH, PA, SC, TN, VA, WV (all of WV is covered)",
    requirements: [
      "Must be in an Appalachian county designated as HPSA",
      "Employer must demonstrate 6 months of failed US physician recruitment",
      "3-year full-time service commitment",
      "Accepts subspecialists — not limited to primary care",
      "Facility must be in an ARC-eligible county",
    ],
    pros: [
      "Unlimited slots with no application fee",
      "Accepts subspecialists (unlike HHS)",
      "Faster processing than HHS",
      "Covers parts of 13 states including NY, PA, OH, NC",
      "Effectively gives eligible states more than 30 total waiver slots",
    ],
    cons: [
      "Geographic limitation — only Appalachian counties qualify",
      "Must demonstrate 6 months failed recruitment (documentation burden)",
      "Not all counties in covered states are ARC-eligible",
      "Less well-known — some employers unfamiliar with the process",
    ],
    url: "https://www.arc.gov/j-1-visa-waivers/",
    color: "text-success",
  },
  {
    name: "Delta Regional Authority (DRA)",
    shortName: "DRA",
    icon: TreePine,
    slots: "Unlimited — rolling applications (400+ physicians sponsored 2021-2024)",
    fee: "No fee (eliminated October 2022)",
    processing: "Varies by state — contact DRA directly",
    specialties: "Primary care prioritized; specialists accepted with documentation of community need",
    coverage:
      "240 counties/parishes across 8 states: AL, AR, IL, KY, LA, MS, MO, TN",
    requirements: [
      "Must be in a DRA-eligible county",
      "Accepts primary care and specialists if need is demonstrated",
      "3-year full-time service commitment",
      "Employer must demonstrate community need for the specialty",
    ],
    pros: [
      "Unlimited slots",
      "Rolling applications — no fiscal year deadline pressure",
      "Accepts specialists beyond primary care",
      "Covers parts of 8 southern/midwestern states",
    ],
    cons: [
      "Limited to 252 counties in 8 states (mostly Mississippi Delta region)",
      "Less documented process — harder to find guidance",
      "Not all employers know about this pathway",
      "Geographic limitation to Delta region",
    ],
    url: "https://dra.gov",
    color: "text-warning",
  },
  {
    name: "Southeast Crescent Regional Commission (SCRC)",
    shortName: "SCRC",
    icon: Sun,
    slots: "Unlimited — launched summer 2022",
    fee: "$3,000 non-refundable processing fee",
    processing: "Approximately 60 days for review",
    specialties: "Primary care, psychiatry, and subspecialists accepted",
    coverage:
      "428 counties across 7 states: AL, FL (entire state covered), GA (122 counties), MS, NC (69 counties), SC, VA",
    requirements: [
      "Must be in an SCRC-eligible county",
      "Accepts primary care, psychiatry, and subspecialists",
      "3-year full-time service commitment",
      "$3,000 application processing fee required",
    ],
    pros: [
      "Unlimited slots — newest pathway with growing capacity",
      "ALL of Florida is covered — every county in the state qualifies",
      "Also covers 122 GA counties, 69 NC counties, parts of AL/MS/SC/VA",
      "Accepts subspecialists, not just primary care",
    ],
    cons: [
      "$3,000 non-refundable fee — highest of any pathway",
      "Newer program (launched 2022) — less track record than ARC or DRA",
      "Limited to southeastern states only",
      "Uses patient-to-physician ratio (minimum 2,000:1) for decisions",
    ],
    url: "https://scrc.gov",
    color: "text-danger",
  },
  {
    name: "Department of Veterans Affairs (VA)",
    shortName: "VA",
    icon: Shield,
    slots: "Case-by-case — not subject to same rules",
    fee: "No application fee",
    processing: "Varies significantly",
    specialties: "Based on VA facility needs — all specialties possible",
    coverage: "VA facilities nationwide",
    requirements: [
      "Must be employed at a VA medical center",
      "Not subject to standard HPSA/MUA requirements",
      "Justification based on VA-specific staffing needs",
      "Must be eligible for VA employment",
    ],
    pros: [
      "Not limited by shortage-area designations",
      "Federal employment benefits (PSLF-eligible, federal retirement)",
      "Can be in any specialty the VA needs",
      "Research and teaching positions also eligible",
    ],
    cons: [
      "Must work at a VA facility specifically",
      "VA is NOT currently H-1B cap-exempt (legislation pending — verify before choosing)",
      "VA hiring process can be slow and bureaucratic",
      "Salary may be lower than private sector",
    ],
    url: "https://www.vacareers.va.gov/",
    color: "text-muted",
  },
];

export default function WaiverPathwaysPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <Link
        href="/career/waiver"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to State Intelligence
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          All J-1 Waiver Pathways for Physicians
        </h1>
        <p className="text-muted max-w-3xl text-base leading-relaxed">
          Conrad 30 is the most common, but it&apos;s not the only option.
          There are 5 additional pathways — several with{" "}
          <strong className="text-foreground">unlimited slots</strong> and no
          state cap. If Conrad is full in your state, one of these may work.
        </p>
        <div className="mt-4">
          <VerifiedBadge
            date="March 2026"
            sources={["USCIS", "HHS OGA", "ARC", "DRA", "SCRC", "Congress.gov"]}
          />
        </div>
      </div>

      {/* Quick comparison table */}
      <div className="overflow-x-auto mb-12">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-3 text-left font-semibold text-foreground">
                Pathway
              </th>
              <th className="px-3 py-3 text-left font-semibold text-foreground">
                Slots
              </th>
              <th className="px-3 py-3 text-left font-semibold text-foreground">
                Fee
              </th>
              <th className="px-3 py-3 text-left font-semibold text-foreground">
                Specialties
              </th>
              <th className="px-3 py-3 text-left font-semibold text-foreground">
                Processing
              </th>
            </tr>
          </thead>
          <tbody>
            {pathways.map((p) => (
              <tr
                key={p.shortName}
                className="border-b border-border/50 hover:bg-surface/50"
              >
                <td className="px-3 py-3 font-medium text-foreground">
                  {p.shortName}
                </td>
                <td className="px-3 py-3 text-muted">{p.slots.split("—")[0].trim()}</td>
                <td className="px-3 py-3 text-muted">{p.fee}</td>
                <td className="px-3 py-3 text-muted text-xs">
                  {p.specialties.split(":")[0]}
                </td>
                <td className="px-3 py-3 text-muted text-xs">{p.processing.split("—")[0].trim()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed pathway cards */}
      <div className="space-y-8">
        {pathways.map((pathway) => {
          const Icon = pathway.icon;
          return (
            <section
              key={pathway.shortName}
              id={pathway.shortName.toLowerCase().replace(/\s+/g, "-")}
              className="rounded-xl border border-border bg-surface p-6 sm:p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`rounded-lg bg-surface-alt p-3 shrink-0`}>
                  <Icon className={`h-6 w-6 ${pathway.color}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {pathway.name}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Infinity className="h-3 w-3" />
                      {pathway.slots.split("—")[0].trim()}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {pathway.fee}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {pathway.processing.split("—")[0].trim()}
                    </span>
                  </div>
                </div>
                <a
                  href={pathway.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline shrink-0"
                >
                  Official site <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-accent" />
                    Eligible Specialties
                  </h3>
                  <p className="text-sm text-muted">{pathway.specialties}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan" />
                    Geographic Coverage
                  </h3>
                  <p className="text-sm text-muted">{pathway.coverage}</p>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Requirements
                </h3>
                <ul className="space-y-1.5">
                  {pathway.requirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pros / Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-success/5 border border-success/20 p-4">
                  <h4 className="text-xs font-semibold text-success mb-2 uppercase tracking-wider">
                    Advantages
                  </h4>
                  <ul className="space-y-1.5">
                    {pathway.pros.map((pro, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted"
                      >
                        <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
                  <h4 className="text-xs font-semibold text-warning mb-2 uppercase tracking-wider">
                    Limitations
                  </h4>
                  <ul className="space-y-1.5">
                    {pathway.cons.map((con, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted"
                      >
                        <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-xl border border-border bg-surface-alt p-6 sm:p-8 text-center">
        <h3 className="text-lg font-bold text-foreground mb-2">
          Not Sure Which Pathway Is Right for You?
        </h3>
        <p className="text-sm text-muted mb-4 max-w-xl mx-auto">
          Start with our state-by-state intelligence. Each state page includes
          which pathways are available, slot fill data, and specific guidance.
        </p>
        <Link
          href="/career/waiver"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          Browse All 50 States
        </Link>
      </div>
    </div>
  );
}
