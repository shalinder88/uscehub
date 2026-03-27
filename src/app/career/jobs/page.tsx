import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Briefcase,
  ExternalLink,
  Search,
  DollarSign,
  AlertTriangle,
  Info,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "J-1 Waiver Physician Jobs — Where to Find Real Positions — USCEHub",
  description:
    "Verified sources for J-1 waiver and H-1B physician positions. Salary benchmarks by specialty, legitimate job boards, and red flags to watch for.",
  alternates: {
    canonical: "https://uscehub.com/career/jobs",
  },
};

const JOB_SOURCES = [
  {
    name: "PracticeLink",
    description:
      "22,500+ J-1 eligible physician jobs. Filter by specialty, state, and visa type. Free account required for full details.",
    url: "https://jobs.practicelink.com/jobs/physician/accept-j1/",
    volume: "22,500+",
    bestFor: "Largest volume of J-1 tagged positions",
  },
  {
    name: "PracticeMatch",
    description:
      "190+ Internal Medicine positions with J-1 filter, plus hundreds more across specialties. Free account required.",
    url: "https://www.practicematch.com/physicians/jobs/internal-medicine/?J1Visa=1",
    volume: "500+",
    bestFor: "Strong specialty filtering, good for subspecialists",
  },
  {
    name: "MDOpts",
    description:
      "98+ publicly viewable J-1/H-1B listings with real salary ranges and employer details. No account required for basic listings.",
    url: "https://www.mdopts.org/job-options.php",
    volume: "98+",
    bestFor: "Most transparent — salary and details visible without login",
  },
  {
    name: "3RNET (National Rural Recruitment)",
    description:
      "Rural and underserved physician positions with J-1 waiver contacts by state. Nonprofit. State-by-state J-1 coordinator directory.",
    url: "https://www.3rnet.org/resources/j1-waiver",
    volume: "Varies",
    bestFor: "Rural positions, direct state J-1 coordinator contacts",
  },
  {
    name: "CompHealth",
    description:
      "Physician staffing company with dedicated J-1 waiver placement services. Recruiters handle job search and waiver coordination.",
    url: "https://comphealth.com/resources/get-hired-j-1-visa-physician",
    volume: "Varies",
    bestFor: "Full-service — recruiter handles everything",
  },
  {
    name: "St. John Associates",
    description:
      "Physician recruiting firm specializing in visa-sponsored placements. Dedicated J-1 waiver and H-1B practice.",
    url: "https://stjohnjobs.com/for-physicians/visa-information-for-physicians/",
    volume: "Varies",
    bestFor: "Visa-specific recruiting — they understand the waiver process",
  },
];

const SALARY_BENCHMARKS = [
  { specialty: "Pulmonary/Critical Care", range: "$350K - $510K", source: "MDOpts, Thoracic.org, PracticeLink 2026", note: "NE listing at $510K + $100K sign-on. Pure pulm-only jobs are rare; most combine with CC." },
  { specialty: "Critical Care / Intensivist", range: "$325K - $400K+", source: "Sound Physicians, USACS, Indeed 2026", note: "Sound Physicians, USACS, Prime Healthcare actively recruiting. Night coverage adds premium." },
  { specialty: "Hospitalist", range: "$325K - $400K", source: "Sound Physicians 2026", note: "Sound Physicians NC: $380-390K nocturnist. MI: $325-400K + $75K bonus. Nocturnists earn 15-25% more." },
  { specialty: "Gastroenterology", range: "$500K - $700K+", source: "AdventHealth, Indeed 2026", note: "AdventHealth FL: base + bonus >$700K. Marshfield, Baystate, Corewell Health actively hiring." },
  { specialty: "Cardiology (Non-Invasive)", range: "$350K - $520K", source: "PracticeLink, MDOpts 2026", note: "Conemaugh PA accepts Conrad, ARC, DRA, HHS + O-1 visas." },
  { specialty: "Cardiology (Interventional)", range: "$450K - $650K+", source: "PracticeLink, MDOpts 2026", note: "Flowers Hospital AL, HHS OK Heart Institute, Tulane Heart Failure actively hiring." },
  { specialty: "Neurology", range: "$350K - $402K", source: "PracticeMatch, Indeed 2026", note: "Aurora WI: $402K guarantee + up to $200K sign-on/loan forgiveness. IN: $350K + RVU incentives." },
  { specialty: "Nephrology", range: "$175K - $350K", source: "MDOpts 2026", note: "MD: $175K starting with partnership after 2 yrs. Multiple states. Lower initial salary but partnership track common." },
  { specialty: "Psychiatry", range: "$250K - $380K", source: "Indeed, PracticeLink 2026", note: "Qualifies for Mental Health HPSA. Benefis MT, Mindpath CA, OSF IL, State of MI all actively hiring." },
  { specialty: "Endocrinology", range: "$220K - $320K", source: "ZipRecruiter, MDOpts 2026", note: "University of Missouri, Benefis MT, Ohio University. High demand due to 80% fellowship fill rate." },
  { specialty: "Hematology/Oncology", range: "$350K - $500K+", source: "Indeed, ASCO Careers 2026", note: "Marshfield WI, UnityPoint IA, MercyOne IA. Some with 100+ clinical trials access." },
  { specialty: "Emergency Medicine", range: "$235/hr - $400K+", source: "Indeed, USACS 2026", note: "USACS has J-1 locations in AL, AZ, CA, FL, GA, OH, PA, TX. MO: $235/hr for EM board-certified." },
  { specialty: "Family Medicine", range: "$260K - $355K", source: "Indeed, MDOpts 2026", note: "KS: $290K + $65K recruitment. FL: $260K + $20K sign-on. 4-day week options available." },
  { specialty: "Internal Medicine (Outpatient)", range: "$215K - $307K", source: "ChenMed, MDOpts 2026", note: "ChenMed TX: $215-307K (max 450 patient panel). FL: $260K + $20K. ACCESS Chicago hiring." },
  { specialty: "General Surgery", range: "$385K - $500K+", source: "ZipRecruiter, Indeed 2026", note: "UnityPoint IA: $385K 2-yr guarantee. Fewer J-1 listings because surgery is not primary care under HHS." },
  { specialty: "Pediatrics", range: "$120K - $280K", source: "MDOpts, Indeed 2026", note: "Rural positions at lower end. IU Health Riley Children's (Ped Hem/Onc) at higher end." },
];

const RED_FLAGS = [
  {
    title: "Non-compete clauses",
    detail: "Conrad 30 program rules prohibit non-compete clauses in waiver contracts. If an employer includes one, they either don't understand the waiver requirements or are hoping you don't. After the 3-year period, enforceability depends on state law.",
  },
  {
    title: "Salary significantly below market",
    detail: "Some employers exploit the 3-year commitment. If the offer is 30%+ below market for your specialty, walk away. You have options.",
  },
  {
    title: "No written contract before waiver filing",
    detail: "Never let an employer file your waiver without a signed, detailed employment contract. Verbal promises mean nothing in immigration law.",
  },
  {
    title: "Employer won't pay immigration attorney",
    detail: "Most reputable employers cover attorney fees for the waiver and H-1B. If they won't, it signals they're not serious about supporting you.",
  },
  {
    title: "Unrealistic patient volumes",
    detail: "40+ patients/day in primary care or 25+ in specialty is a burnout factory. Ask about expected panel size and patient volume before signing.",
  },
  {
    title: "No malpractice coverage provided",
    detail: "Employer should provide malpractice insurance. If they expect you to buy your own (especially tail coverage), factor $10K-50K+ into your evaluation.",
  },
];

export default function WaiverJobsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Briefcase className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            J-1 Waiver Physician Jobs
          </h1>
        </div>
        <p className="text-muted max-w-3xl text-base leading-relaxed">
          We don&apos;t host fake or stale job listings. Instead, we point you
          to the legitimate sources where actual J-1 waiver positions are
          posted daily, with salary benchmarks so you know what to expect.
        </p>
        <div className="mt-3">
          <VerifiedBadge
            date="March 2026"
            sources={["PracticeLink", "PracticeMatch", "MDOpts", "3RNET"]}
          />
        </div>
      </div>

      {/* Why we do it this way */}
      <div className="rounded-xl border border-border bg-surface-alt p-5 mb-8 flex gap-3">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          <strong className="text-foreground">
            Why we link to sources instead of listing jobs directly:
          </strong>{" "}
          Physician job postings change daily. A position listed today may be
          filled tomorrow. Copying listings from other sites creates stale,
          misleading data that wastes your time. We verify which sources are
          legitimate, give you salary benchmarks from real postings, and let
          you search the live databases yourself. That&apos;s honest.
        </div>
      </div>

      {/* Job Sources */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent" />
          Verified Job Sources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JOB_SOURCES.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border bg-surface p-6 hover:border-accent/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">
                  {source.name}
                </h3>
                <ExternalLink className="h-4 w-4 text-muted group-hover:text-accent shrink-0" />
              </div>
              <p className="text-sm text-muted mb-3">{source.description}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-accent font-medium">
                  <Search className="h-3 w-3" />
                  {source.volume} listings
                </span>
                <span className="text-muted">{source.bestFor}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Salary Benchmarks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-success" />
          J-1 Waiver Salary Benchmarks (2026)
        </h2>
        <p className="text-sm text-muted mb-6">
          Ranges from actual J-1 waiver job postings on legitimate boards.
          These reflect starting salaries for waiver positions, which may be
          lower than non-waiver market rates.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Specialty
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Salary Range
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {SALARY_BENCHMARKS.map((row) => (
                <tr
                  key={row.specialty}
                  className="border-b border-border/50 hover:bg-surface/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.specialty}
                  </td>
                  <td className="px-4 py-3 text-success font-mono font-bold">
                    {row.range}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Non-waiver positions in the same specialties typically pay 10-20%
          more. Always negotiate — listed salary is usually the floor, not the
          ceiling.
        </p>
      </section>

      {/* Red Flags */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Red Flags in J-1 Waiver Job Postings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RED_FLAGS.map((flag) => (
            <div
              key={flag.title}
              className="rounded-lg border border-warning/20 bg-warning/5 p-4"
            >
              <h3 className="text-sm font-semibold text-warning mb-1">
                {flag.title}
              </h3>
              <p className="text-xs text-muted">{flag.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Specialty */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-accent" />
          Browse by Specialty
        </h2>
        <p className="text-sm text-muted mb-4">
          Each specialty page has active employers, salary data, and direct
          search links to job boards — all verified from real postings.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            { name: "Pulm/CC", slug: "pulmonary-critical-care", salary: "$350-510K" },
            { name: "Critical Care", slug: "critical-care", salary: "$325-400K+" },
            { name: "Hospitalist", slug: "hospitalist", salary: "$325-400K" },
            { name: "Gastroenterology", slug: "gastroenterology", salary: "$500-700K+" },
            { name: "Cardiology", slug: "cardiology", salary: "$350-650K+" },
            { name: "Psychiatry", slug: "psychiatry", salary: "$250-380K" },
            { name: "Family Medicine", slug: "family-medicine", salary: "$260-355K" },
            { name: "Neurology", slug: "neurology", salary: "$350-402K" },
            { name: "Nephrology", slug: "nephrology", salary: "$175-350K" },
          ].map((s) => (
            <Link
              key={s.slug}
              href={`/career/jobs/${s.slug}`}
              className="rounded-lg border border-border bg-surface p-3 hover:border-accent/50 transition-colors group text-center"
            >
              <div className="text-sm font-semibold text-foreground group-hover:text-accent">{s.name}</div>
              <div className="text-xs text-success font-mono mt-1">{s.salary}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* H-1B Alert */}
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 mb-8">
        <h3 className="text-lg font-bold text-danger mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          $100K H-1B Filing Fee Is Now Law (Sept 2025)
        </h3>
        <p className="text-sm text-muted">
          Presidential Proclamation 10973 imposed a $100,000 supplemental fee
          on new H-1B petitions requiring consular processing. This applies to
          cap-exempt employers too. It does NOT apply to change-of-status
          (already in US), extensions, or many transfers. Expires Sept 2026
          unless renewed. A physician exemption bill has been introduced.
          Only ~85 employers have paid the fee so far. Impact: smaller
          practices reducing sponsorship, but large academic systems absorbing
          the cost. Source: Federal Register, AMA.
        </p>
      </div>

      {/* Related Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/career/waiver/tracker"
          className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">
            Conrad 30 Slot Tracker
          </h3>
          <p className="text-xs text-muted mt-1">
            Check which states still have waiver slots
          </p>
        </Link>
        <Link
          href="/career/waiver/pathways"
          className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">
            Alternative Pathways
          </h3>
          <p className="text-xs text-muted mt-1">
            HHS, ARC, DRA, SCRC — unlimited slots
          </p>
        </Link>
        <Link
          href="/career/waiver/hpsa-lookup"
          className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">
            HPSA Score Lookup
          </h3>
          <p className="text-xs text-muted mt-1">
            Check if a facility is in a shortage area
          </p>
        </Link>
      </div>
    </div>
  );
}
