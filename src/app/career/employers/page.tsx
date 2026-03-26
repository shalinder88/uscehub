import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Globe,
  Shield,
  Clock,
  DollarSign,
  ArrowRight,
  Mail,
  Phone,
  ExternalLink,
  Star,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Post J-1 Waiver Physician Jobs — Reach IMG Physicians — USCEHub",
  description:
    "Reach thousands of J-1 waiver and H-1B physicians actively searching for positions. Post your HPSA-designated positions where waiver physicians actually look.",
  alternates: {
    canonical: "https://uscehub.com/career/employers",
  },
};

const STATS = [
  { value: "50", label: "State Guides", detail: "Every state with waiver intelligence" },
  { value: "22", label: "Career Tools", detail: "Physicians use daily/weekly" },
  { value: "390+", label: "Indexed Pages", detail: "Growing organic traffic" },
  { value: "#1", label: "Conrad 30 Tracker", detail: "Only real-time tracker in market" },
];

const WHY_POST = [
  {
    icon: Users,
    title: "Your Exact Audience",
    description: "We're not a generic job board. Every visitor is a physician navigating the J-1 waiver or H-1B process — the exact candidates you're trying to recruit.",
  },
  {
    icon: MapPin,
    title: "HPSA-Focused",
    description: "Our tools — Conrad 30 tracker, HPSA lookup, state intelligence — all drive physicians toward underserved area positions. Your positions.",
  },
  {
    icon: TrendingUp,
    title: "Growing Traffic",
    description: "22 tools physicians use regularly: visa bulletin tracker, policy alerts, state guides. They come back weekly. They see your listing.",
  },
  {
    icon: Shield,
    title: "Trusted Platform",
    description: "Every data point verified against official sources. Physicians trust us because we don't publish unverified information. Your listing carries that trust.",
  },
  {
    icon: Clock,
    title: "Year-Round Visibility",
    description: "Physicians search for waiver positions year-round, not just during match season. Your listing stays active for 90 days with option to renew.",
  },
  {
    icon: Globe,
    title: "Immigration-Aware",
    description: "We explain the waiver process, H-1B requirements, and contract terms. Physicians arriving at your listing already understand the commitment.",
  },
];

const PRICING = [
  {
    name: "Standard Listing",
    price: "$249",
    period: "per listing / 90 days",
    features: [
      "Position details (specialty, location, salary range)",
      "HPSA designation and waiver pathway eligibility",
      "Direct link to your application page",
      "Appears in state guide for your location",
      "Appears in job search results",
    ],
    cta: "Post a Listing",
    highlighted: false,
  },
  {
    name: "Featured Listing",
    price: "$499",
    period: "per listing / 90 days",
    features: [
      "Everything in Standard, plus:",
      "Highlighted placement in search results",
      "Featured on relevant state guide page",
      "Appears in career dashboard",
      "Priority badge showing verified employer",
      "Employer profile with logo and description",
    ],
    cta: "Post Featured",
    highlighted: true,
  },
  {
    name: "Multi-Position Package",
    price: "$999",
    period: "up to 5 listings / 90 days",
    features: [
      "Everything in Featured for all listings",
      "Employer spotlight section on dashboard",
      "Monthly analytics report",
      "Dedicated account support",
      "Renewal discount (20% off next cycle)",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

const COMPARED_TO = [
  { item: "Physician recruiter placement fee", cost: "$15,000 - $25,000", us: "$249 - $999" },
  { item: "PracticeLink employer subscription", cost: "$3,000 - $10,000/yr", us: "$249 - $999" },
  { item: "Indeed physician job post (sponsored)", cost: "$500 - $2,000/month", us: "$249 / 90 days" },
];

export default function EmployersPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent mb-6">
          <Building2 className="h-3.5 w-3.5" />
          For Employers & Recruiters
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Reach Physicians Who Are<br />
          <span className="text-accent">Actively Seeking Waiver Positions</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Post your HPSA-designated positions where J-1 waiver and H-1B physicians
          actually look. Not a generic job board — a targeted immigration
          career platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-3xl font-bold text-accent">{stat.value}</div>
            <div className="text-sm font-medium text-foreground mt-1">{stat.label}</div>
            <div className="text-[10px] text-muted mt-0.5">{stat.detail}</div>
          </div>
        ))}
      </div>

      {/* Why Post Here */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Why Post on USCEHub?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_POST.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-border bg-surface p-6">
                <div className="rounded-lg bg-accent/10 p-2.5 inline-flex mb-3">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-3">
          Simple, Transparent Pricing
        </h2>
        <p className="text-sm text-muted text-center mb-8 max-w-xl mx-auto">
          A fraction of what you&apos;d pay a recruiter. No subscriptions, no
          hidden fees. Pay per listing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-6 ${
                tier.highlighted
                  ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                  : "border-border bg-surface"
              }`}
            >
              {tier.highlighted && (
                <div className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold text-accent mb-3">
                  <Star className="h-3 w-3" />
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-bold text-foreground">{tier.price}</span>
              </div>
              <p className="text-xs text-muted mb-4">{tier.period}</p>
              <ul className="space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:employers@uscehub.com?subject=Job Posting Inquiry"
                className={`block text-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-accent text-white hover:bg-accent/90"
                    : "bg-surface-alt text-foreground hover:bg-accent/10"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-foreground mb-4 text-center">
          Compare the Cost
        </h2>
        <div className="max-w-2xl mx-auto overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Channel</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Typical Cost</th>
                <th className="px-4 py-3 text-left font-semibold text-accent">USCEHub</th>
              </tr>
            </thead>
            <tbody>
              {COMPARED_TO.map((row) => (
                <tr key={row.item} className="border-b border-border/50">
                  <td className="px-4 py-3 text-muted">{row.item}</td>
                  <td className="px-4 py-3 text-muted font-mono">{row.cost}</td>
                  <td className="px-4 py-3 text-accent font-mono font-bold">{row.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What Your Listing Includes */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-foreground mb-6 text-center">
          What Physicians See When They Find Your Listing
        </h2>
        <div className="rounded-xl border border-border bg-surface p-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-4 mb-4">
            <div className="rounded-lg bg-accent/10 p-3">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground">Your Hospital Name</h3>
                <span className="rounded-full bg-success/10 text-success text-[10px] font-bold px-2 py-0.5">VERIFIED</span>
              </div>
              <p className="text-xs text-muted">Your City, State · HPSA Score: 14 · Conrad 30 Eligible</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center">
            <div className="rounded-lg bg-surface-alt p-2">
              <div className="text-xs font-bold text-foreground">Internal Medicine</div>
              <div className="text-[10px] text-muted">Specialty</div>
            </div>
            <div className="rounded-lg bg-surface-alt p-2">
              <div className="text-xs font-bold text-success">$280K - $320K</div>
              <div className="text-[10px] text-muted">Salary Range</div>
            </div>
            <div className="rounded-lg bg-surface-alt p-2">
              <div className="text-xs font-bold text-accent">J-1 + H-1B</div>
              <div className="text-[10px] text-muted">Visa Support</div>
            </div>
            <div className="rounded-lg bg-surface-alt p-2">
              <div className="text-xs font-bold text-foreground">Full Benefits</div>
              <div className="text-[10px] text-muted">Package</div>
            </div>
          </div>
          <p className="text-xs text-muted">
            Your job description, benefits details, community information, and
            a direct link to your application page. Physicians see exactly
            what they need to make a decision.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Ready to Reach Waiver Physicians?
        </h2>
        <p className="text-sm text-muted mb-6 max-w-lg mx-auto">
          Email us with your position details. We&apos;ll set up your listing
          within 24 hours. No long-term contracts. Cancel anytime.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:employers@uscehub.com?subject=Job Posting Inquiry"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            <Mail className="h-4 w-4" />
            employers@uscehub.com
          </a>
          <span className="text-xs text-muted">or</span>
          <a
            href="mailto:employers@uscehub.com?subject=Schedule a Call"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-surface transition-colors"
          >
            <Phone className="h-4 w-4" />
            Schedule a Call
          </a>
        </div>
        <p className="mt-4 text-[10px] text-muted">
          Currently accepting positions in HPSA/MUA-designated areas with J-1
          waiver or H-1B sponsorship. All listings reviewed before publishing.
        </p>
      </div>

      {/* Related Pages */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/career/waiver" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">J-1 Waiver State Guide</h3>
          <p className="text-xs text-muted mt-1">Where physicians search for waiver opportunities</p>
        </Link>
        <Link href="/career/jobs" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Where Physicians Search</h3>
          <p className="text-xs text-muted mt-1">See which job boards physicians actually use</p>
        </Link>
        <Link href="/career/waiver/hpsa-lookup" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">HPSA Lookup</h3>
          <p className="text-xs text-muted mt-1">Verify your facility qualifies for waiver placement</p>
        </Link>
      </div>
    </div>
  );
}
