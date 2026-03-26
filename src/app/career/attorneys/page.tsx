import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Star,
  Globe,
  Phone,
  Mail,
  AlertTriangle,
  Info,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Immigration Attorneys for Physicians — J-1 Waiver & H-1B Specialists",
  description:
    "Find immigration attorneys who specialize in physician immigration — J-1 waivers, Conrad 30, H-1B, EB-2 NIW, EB-1. Verified specialists, not general practitioners.",
  alternates: {
    canonical: "https://uscehub.com/career/attorneys",
  },
};

interface Attorney {
  name: string;
  firm: string;
  specialties: string[];
  states: string;
  website: string;
  notes: string;
  featured: boolean;
}

// Initial directory — verified firms known for physician immigration
// These are NOT paid sponsors yet. Listed based on reputation in the field.
// When firms pay for sponsored listings, they'll be marked as "Sponsored."
const ATTORNEYS: Attorney[] = [
  {
    name: "Greg Siskind",
    firm: "Siskind Susser (Visalaw.com)",
    specialties: ["J-1 waivers", "Conrad 30", "H-1B", "EB-2 NIW", "EB-1"],
    states: "National (Memphis, TN based)",
    website: "https://www.visalaw.com/our-practice-areas/healthcare/",
    notes: "Author of the Physician Immigration Handbook. One of the most recognized firms in physician immigration. Created the first immigration law website (1994).",
    featured: false,
  },
  {
    name: "Murthy Law Firm",
    firm: "Murthy Law Firm",
    specialties: ["J-1 waivers", "H-1B", "EB-2 NIW", "EB-1", "Green cards"],
    states: "National (Baltimore, MD based)",
    website: "https://www.murthy.com/medical-professionals/physicians/",
    notes: "Dedicated physician immigration practice. Handles J-1, H-1B, Conrad 30, NIW, and green card cases for physicians across all specialties.",
    featured: false,
  },
  {
    name: "Jeelani Law Firm",
    firm: "Jeelani Law Firm",
    specialties: ["J-1 waivers", "Conrad 30", "HHS waivers", "ARC waivers"],
    states: "National",
    website: "https://www.jeelani-law.com/services/j1-visa-waiver-lawyer/",
    notes: "Specializes specifically in J-1 waiver cases for physicians. Known for handling complex waiver situations including extenuating circumstances transfers.",
    featured: false,
  },
  {
    name: "Ford Murray Law",
    firm: "Ford Murray Law",
    specialties: ["Conrad 30", "J-1 waivers", "IGA waivers (ARC, DRA, SCRC)", "H-1B"],
    states: "National",
    website: "https://fordmurraylaw.com/conrad-30-j-1-visa-waiver/",
    notes: "Publishes detailed Conrad 30 state-by-state deadline information. Strong presence in physician waiver community. Known for IGA pathway expertise.",
    featured: false,
  },
  {
    name: "Berardi Immigration Law",
    firm: "Berardi Immigration Law",
    specialties: ["J-1 waivers", "H-1B", "EB-2 NIW", "Cap-exempt H-1B"],
    states: "National (Buffalo, NY based)",
    website: "https://berardiimmigrationlaw.com/the-health-human-services-hhs-waiver-option-for-physicians/",
    notes: "Known for detailed online resources about physician immigration pathways. Handles HHS Supplement B waivers and cap-exempt H-1B for academic medical centers.",
    featured: false,
  },
  {
    name: "Reddy Neumann Brown",
    firm: "Reddy Neumann Brown PC",
    specialties: ["H-1B", "J-1 waivers", "Conrad 30", "Green cards", "EB-2 NIW"],
    states: "National (Houston, TX based)",
    website: "https://www.rnlawgroup.com/understanding-the-conrad-30-waiver-a-physicians-route-from-j-1-to-h-1b/",
    notes: "Large immigration firm with significant physician practice. Detailed online resources about H-1B denial options and Conrad 30 processes.",
    featured: false,
  },
];

const WHAT_TO_ASK = [
  "How many physician J-1 waiver cases have you handled in the past year?",
  "What is your success rate for the specific pathway I need (Conrad/HHS/ARC)?",
  "What are your total fees, including all filing fees? Get it in writing.",
  "Who in your firm will actually handle my case — you or an associate?",
  "What is your response time for emails and calls?",
  "Do you have experience with my specific state's Conrad 30 process?",
  "Can you provide references from physician clients?",
  "What happens if my application is denied? Is there additional cost?",
];

export default function AttorneysPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Scale className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Physician Immigration Attorneys
          </h1>
        </div>
        <p className="text-muted max-w-2xl text-sm">
          Not all immigration attorneys understand physician immigration.
          These firms specialize in J-1 waivers, Conrad 30, H-1B, and green
          cards specifically for physicians. We list them based on reputation
          in the field — not payment.
        </p>
      </div>

      {/* Important note */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-5 mb-8 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          <strong className="text-foreground">Choose carefully.</strong> Your
          immigration attorney makes decisions that affect your career for
          years. The biggest mistake IMGs make is using a general immigration
          attorney who doesn&apos;t understand physician-specific rules.
          Filing I-485 too early, missing a state deadline, or choosing the
          wrong pathway can set you back years.
        </div>
      </div>

      {/* Attorney Directory */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Firms Known for Physician Immigration
        </h2>
        <div className="space-y-4">
          {ATTORNEYS.map((atty) => (
            <div
              key={atty.firm}
              className="rounded-xl border border-border bg-surface p-6 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-foreground">{atty.firm}</h3>
                    {atty.featured && (
                      <span className="rounded-full bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5">
                        SPONSORED
                      </span>
                    )}
                  </div>
                  {atty.name !== atty.firm && (
                    <p className="text-xs text-muted mb-2">{atty.name}</p>
                  )}
                  <p className="text-xs text-muted mb-3">{atty.notes}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {atty.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <MapPin className="h-3 w-3" />
                    {atty.states}
                  </div>
                </div>
                <a
                  href={atty.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline shrink-0"
                >
                  Website <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          This is not an exhaustive list. Inclusion does not constitute
          endorsement. We do not receive referral fees from any attorney
          listed. Firms marked &quot;Sponsored&quot; pay for enhanced visibility
          but are held to the same listing standards.
        </p>
      </section>

      {/* What to Ask */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          Questions to Ask Before Hiring
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WHAT_TO_ASK.map((q, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <span className="text-xs text-muted">{q}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Typical Costs */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Typical Attorney Costs for Physicians
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Service</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Typical Fee Range</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Who Pays</th>
              </tr>
            </thead>
            <tbody>
              {[
                { service: "Initial consultation", fee: "$175 - $350/hour", who: "You" },
                { service: "J-1 waiver application", fee: "$3,000 - $8,000", who: "Employer (usually)" },
                { service: "H-1B petition", fee: "$3,000 - $6,000", who: "Employer (required by law)" },
                { service: "EB-2 NIW (self-petition)", fee: "$5,000 - $15,000", who: "You" },
                { service: "EB-1 (self-petition)", fee: "$10,000 - $20,000", who: "You" },
                { service: "PERM labor certification", fee: "$3,000 - $8,000", who: "Employer" },
                { service: "I-485 adjustment of status", fee: "$2,000 - $5,000", who: "You" },
                { service: "Contract review", fee: "$500 - $2,000", who: "You" },
              ].map((row) => (
                <tr key={row.service} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{row.service}</td>
                  <td className="px-4 py-3 text-accent font-mono">{row.fee}</td>
                  <td className="px-4 py-3 text-xs text-muted">{row.who}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          These are typical ranges — actual fees vary by firm, complexity, and
          location. Government filing fees (USCIS, DOS) are additional. Always
          get a written fee agreement before engaging an attorney.
        </p>
      </section>

      {/* For Attorneys */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">
          Immigration Attorneys: Want to Be Listed?
        </h2>
        <p className="text-sm text-muted mb-4 max-w-lg mx-auto">
          We&apos;re building the most trusted directory of physician
          immigration specialists. If your firm handles physician waivers
          and H-1B cases, contact us about a sponsored listing.
        </p>
        <a
          href="mailto:attorneys@uscehub.com?subject=Attorney Directory Listing"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          <Mail className="h-4 w-4" />
          attorneys@uscehub.com
        </a>
      </div>
    </div>
  );
}
