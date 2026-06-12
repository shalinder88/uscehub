import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Shield,
  ExternalLink,
  Zap,
  Info,
} from "lucide-react";
import { SPONSOR_DATA } from "@/lib/sponsor-data";
import {
  LIVE_NOTICE_EMPLOYERS,
  CAP_EXEMPT_KEYS,
  normEmployerKey,
} from "@/lib/sponsor-truth-overlay";
import {
  employerSlug,
  parseSalaryForSchema,
  parseValidThrough,
} from "@/lib/sponsor-page-utils";

// Pre-build a slug → index map once.
const SLUG_MAP = new Map<string, number>();
for (let i = 0; i < SPONSOR_DATA.length; i++) {
  const s = employerSlug(SPONSOR_DATA[i].e);
  if (!SLUG_MAP.has(s)) SLUG_MAP.set(s, i);
}

const LIVE_KEYS = [...LIVE_NOTICE_EMPLOYERS.keys()];

function getLive(name: string) {
  const k = normEmployerKey(name);
  if (LIVE_NOTICE_EMPLOYERS.has(k)) return LIVE_NOTICE_EMPLOYERS.get(k)!;
  for (const lk of LIVE_KEYS) {
    if (k.startsWith(lk) && lk.length >= 18) return LIVE_NOTICE_EMPLOYERS.get(lk)!;
  }
  return null;
}

export async function generateStaticParams() {
  return [...SLUG_MAP.keys()].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const idx = SLUG_MAP.get(slug);
  if (idx === undefined) return { title: "Employer Not Found" };
  const r = SPONSOR_DATA[idx];
  const live = getLive(r.e);
  const title = `${r.e} — H-1B Physician Sponsorship | USCEHub`;
  const description = live
    ? `${r.e} is actively filing H-1B for physicians. ${live.notices[0]?.role} · ${live.notices[0]?.salaryText}. DOL history: ${r.p} certified physician position${r.p !== 1 ? "s" : ""}. Free, public data.`
    : `${r.e} has certified ${r.p} physician H-1B position${r.p !== 1 ? "s" : ""} in ${r.c}, ${r.s}. Specialties: ${r.sp.slice(0, 3).join(", ")}. DOL public data — free.`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://uscehub.com/career/sponsors/${slug}`,
    },
    openGraph: { title, description, url: `https://uscehub.com/career/sponsors/${slug}` },
    robots: { index: false, follow: false },
  };
}

function buildJobPostingSchema(
  name: string,
  city: string,
  state: string,
  notice: { role: string; salaryText: string; periodText: string; noticeUrl: string; firstSeenAt: string }
) {
  const salary = parseSalaryForSchema(notice.salaryText);
  const validThrough = parseValidThrough(notice.periodText);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: notice.role,
    datePosted: notice.firstSeenAt.slice(0, 10),
    hiringOrganization: {
      "@type": "Organization",
      name,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressRegion: state,
        addressCountry: "US",
      },
    },
    employmentType: "FULL_TIME",
    description: `${name} has filed a Labor Condition Application (LCA) with the U.S. Department of Labor seeking an H-1B nonimmigrant for the position of ${notice.role}. Salary: ${notice.salaryText}. Employment period: ${notice.periodText}. Source: public LCA notice posted pursuant to 20 CFR 655.734. Employer-level H-1B history does not guarantee sponsorship for any specific role — verify directly with the employer.`,
  };

  if (salary) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        value: salary.value,
        unitText: salary.unitText,
      },
    };
  }

  if (validThrough) schema.validThrough = validThrough;

  return JSON.stringify(schema);
}

const US_STATES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",DC:"Washington DC",FL:"Florida",GA:"Georgia",HI:"Hawaii",
  ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",
  MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",
  OR:"Oregon",PA:"Pennsylvania",PR:"Puerto Rico",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",
  WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

export default async function SponsorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = SLUG_MAP.get(slug);
  if (idx === undefined) notFound();

  const r = SPONSOR_DATA[idx];
  const live = getLive(r.e);
  const capEx = CAP_EXEMPT_KEYS.has(normEmployerKey(r.e));
  const stateName = US_STATES[r.s] ?? r.s;

  return (
    <>
      {/* JobPosting JSON-LD for live notices */}
      {live &&
        live.notices.map((n, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: buildJobPostingSchema(r.e, r.c, r.s, n),
            }}
          />
        ))}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/career/sponsors"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All H-1B physician sponsors
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="rounded-xl bg-accent/10 p-3 shrink-0">
            <Building2 className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {r.e}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {r.c}, {stateName}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {r.p} certified H-1B position{r.p !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {r.sp.map((sp) => (
                <span
                  key={sp}
                  className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                >
                  {sp}
                </span>
              ))}
              {capEx && (
                <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  Cap-Exempt
                </span>
              )}
              {live && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  <Zap className="h-3 w-3" />
                  Actively Filing H-1B
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live notice panel */}
        {live && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/5 p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-amber-800">
                Active H-1B Filing — Public LCA Notice
              </h2>
            </div>
            <p className="text-[11px] text-amber-700/80 mb-4">
              Under 20 CFR 655.734, employers must publicly post LCA notices for ~10 business days.
              This is the freshest legal signal that an employer is actively sponsoring H-1B —
              months ahead of DOL quarterly disclosure files.
            </p>
            {live.notices.map((n, i) => (
              <div
                key={i}
                className="rounded-lg bg-white/60 dark:bg-amber-900/10 border border-amber-300/30 p-4 mb-3 last:mb-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{n.role}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted">
                      <span className="flex items-center gap-1 text-success font-mono font-bold">
                        <DollarSign className="h-3 w-3" />
                        {n.salaryText}
                      </span>
                      {n.periodText && (
                        <span>{n.periodText}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={n.noticeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    View LCA Notice PDF
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
            <p className="mt-3 text-[10px] text-amber-700/70 italic">
              Employer history does not guarantee sponsorship for any specific role. Always verify visa terms directly with the employer&apos;s HR or immigration counsel.
            </p>
          </div>
        )}

        {/* DOL History panel */}
        <div className="rounded-xl border border-border bg-surface p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-bold text-foreground">DOL H-1B Filing History</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                Certified Positions
              </p>
              <p className="text-2xl font-bold text-foreground font-mono">{r.p}</p>
              {r.n > 0 && (
                <p className="text-[10px] text-success mt-0.5">{r.n} new this cycle</p>
              )}
            </div>
            {r.a > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Avg Salary Offered
                </p>
                <p className="text-2xl font-bold text-success font-mono">
                  ${r.a.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted mt-0.5">from LCA filings</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                Sponsorship Type
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {capEx ? (
                  <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-700">
                    Cap-Exempt
                  </span>
                ) : (
                  <span className="rounded-full bg-surface-alt border border-border px-2 py-0.5 text-[10px] text-muted">
                    Cap-Subject
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
              Specialties
            </p>
            <div className="flex flex-wrap gap-1.5">
              {r.sp.map((sp) => (
                <span
                  key={sp}
                  className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent"
                >
                  {sp}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
            <Shield className="h-3 w-3 text-success" />
            Source: U.S. Department of Labor, LCA Disclosure Data, FY2025 Q3 · Public domain
          </div>
        </div>

        {/* Cap-exempt explainer */}
        {capEx && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 mb-5 flex gap-3">
            <Info className="h-4 w-4 text-green-700 shrink-0 mt-0.5" />
            <div className="text-xs text-green-800">
              <strong>Cap-Exempt employer:</strong> This institution (typically a hospital or
              university) is exempt from the annual H-1B lottery cap. They can sponsor
              H-1B workers year-round without lottery risk — highly favorable for J-1
              waiver physicians converting to H-1B.
            </div>
          </div>
        )}

        {/* Caveat */}
        <div className="rounded-xl border border-border bg-surface-alt p-4">
          <h3 className="text-xs font-bold text-foreground mb-2">About this data</h3>
          <div className="space-y-1.5 text-xs text-muted">
            <p>
              <strong className="text-foreground">DOL history</strong> shows certified LCA
              positions from FY2025 Q3 public data. LCA filing ≠ H-1B approval (~80%
              approval rate). Employer-level history does not guarantee any specific role
              will sponsor.
            </p>
            {live && (
              <p>
                <strong className="text-foreground">Active filing notice</strong> is sourced
                directly from the employer&apos;s own public website, as required by 20 CFR
                655.734. It confirms H-1B filing intent for a specific role — not an approved
                petition. Always verify current status directly with the employer.
              </p>
            )}
            <p>
              Data is free because it is public domain government information. We do not
              guarantee accuracy. Use this as a starting point for your own due diligence.
            </p>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <Link
            href="/career/sponsors"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All sponsors
          </Link>
          <Link
            href="/career/waiver"
            className="text-xs text-accent hover:underline"
          >
            J-1 Waiver guide →
          </Link>
        </div>
      </div>
    </>
  );
}
