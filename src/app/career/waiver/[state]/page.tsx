import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  Briefcase,
  Shield,
  CheckCircle2,
  Lightbulb,
  ExternalLink,
  ArrowLeft,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  getWaiverStateBySlug,
  getAllWaiverStateSlugs,
} from "@/lib/waiver-data";

export async function generateStaticParams() {
  return getAllWaiverStateSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const stateData = getWaiverStateBySlug(slug);
  if (!stateData) return { title: "Not Found" };

  const title = `J-1 Waiver in ${stateData.stateName} — Conrad 30 Guide`;
  const description = `Complete J-1 waiver guide for ${stateData.stateName}. Conrad 30 slots, flex slots, processing times, specialty needs, requirements, and application tips for IMG physicians.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://uscehub.com/career/waiver/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://uscehub.com/career/waiver/${slug}`,
    },
  };
}

export default async function WaiverStatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: slug } = await params;
  const stateData = getWaiverStateBySlug(slug);
  if (!stateData) notFound();

  const totalSlots = stateData.conradSlots + stateData.flexSlots;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `J-1 Waiver in ${stateData.stateName} — Conrad 30 Guide`,
    description: `Complete J-1 waiver guide for ${stateData.stateName} including Conrad 30 slots, processing times, and tips.`,
    url: `https://uscehub.com/career/waiver/${slug}`,
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
        {/* Breadcrumb */}
        <Link
          href="/career/waiver"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All States
        </Link>

        {/* Header */}
        <div className="rounded-xl border border-border bg-surface p-8 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <div className="rounded-lg bg-accent/10 p-4 shrink-0 self-start">
              <MapPin className="h-8 w-8 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  {stateData.stateName}
                </h1>
                <span className="rounded-full px-3 py-1 text-xs font-medium bg-accent/10 text-accent">
                  {stateData.stateCode}
                </span>
              </div>
              <p className="text-muted">
                Conrad State 30 J-1 waiver program overview, slot data,
                processing times, and application guidance for{" "}
                {stateData.stateName}.
              </p>

              {/* Confidence label — all 50 states now verified */}
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Verified March 2026 · Sources: State DOH, 3RNET, USCIS, HRSA
              </div>
            </div>
          </div>
        </div>

        {/* Slot Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-3xl font-bold text-foreground mb-1">
              {stateData.conradSlots}
            </div>
            <div className="text-sm text-muted">Conrad 30 Slots</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-3xl font-bold text-cyan mb-1">
              {stateData.flexSlots}
            </div>
            <div className="text-sm text-muted">Flex Slots</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {totalSlots}
            </div>
            <div className="text-sm text-muted">Total Available</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-3xl font-bold text-warning mb-1">
              {stateData.processingTime}
            </div>
            <div className="text-sm text-muted">Processing Time</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-bold text-foreground">
                  Timeline Overview
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted">
                    Estimated Total Timeline
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {stateData.timeline}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted">
                    State Processing Time
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {stateData.processingTime}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted">
                    Federal Fiscal Year Start
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    October 1
                  </span>
                </div>
              </div>
            </div>

            {/* Specialty Priorities */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-bold text-foreground">
                  Specialty Priorities
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {stateData.specialtyNeeds.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full px-3 py-1 text-xs font-medium bg-accent/10 text-accent"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Priority Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stateData.priorityAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full px-3 py-1 text-xs font-medium bg-success/10 text-success"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-bold text-foreground">
                  Requirements
                </h2>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {stateData.requirements}
              </p>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-bold text-foreground">
                  Application Tips
                </h2>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {stateData.tips}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Official Website */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Official Resource
              </h3>
              <a
                href={stateData.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {stateData.stateName} Health Department
              </a>
            </div>

            {/* Related Jobs Placeholder */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">
                  Waiver Jobs in {stateData.stateName}
                </h3>
              </div>
              <p className="text-xs text-muted mb-4">
                Browse J-1 waiver positions currently available in{" "}
                {stateData.stateName}.
              </p>
              <Link
                href={`/career/jobs?state=${stateData.stateCode}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
              >
                View Jobs
              </Link>
            </div>

            {/* Quick Facts */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Quick Facts
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span className="text-xs text-muted">
                    3-year service commitment required
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span className="text-xs text-muted">
                    Must serve in HPSA or MUA designated area
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span className="text-xs text-muted">
                    Employer must sponsor the waiver application
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span className="text-xs text-muted">
                    Apply early in federal fiscal year (starts October 1)
                  </span>
                </div>
              </div>
            </div>

            {/* Find a Lawyer */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">
                  Need Legal Help?
                </h3>
              </div>
              <p className="text-xs text-muted mb-4">
                Find immigration lawyers who specialize in J-1 waivers.
              </p>
              <Link
                href="/career/lawyers"
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-alt px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
              >
                Browse Lawyers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
