export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { ListingDisclaimer } from "@/components/listings/listing-disclaimer";
import { ListingTrustMetadata } from "@/components/listings/listing-trust-metadata";
import { findDisplayEligibleByName } from "@/lib/p102-display-eligible-listings";
import { ShareButtons } from "@/components/listings/share-buttons";
import { SaveButton } from "@/components/listings/save-button";
import { ReviewForm } from "@/components/listings/review-form";
import { FlagButton } from "@/components/listings/flag-button";
import { listingVerificationStatus } from "@/lib/listing-display";
import { computeListingV2Signals } from "@/lib/listing-v2-signals";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  Building2,
  Mail,
  ExternalLink,
  Calendar,
  Users,
  ArrowRight,
  Shield,
  List,
  Stethoscope,
  Info,
  Zap,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  LISTING_TYPE_LABELS,
  US_STATES,
  formatDate,
} from "@/lib/utils";
import type { Metadata } from "next";
import type { ReactNode } from "react";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Three-tier "About this program" formatter. No regex (global rule).
 *
 * Tier 1 (existing): split on `\n\n` for explicit paragraphs; promote a
 *   paragraph to a bullet list if 3+ lines look list-like.
 * Tier 2 (new): for any paragraph that didn't become a list, scan its
 *   sentences for a known field label like "Cost:", "Visa:", "Apply:",
 *   etc. If 3+ sentences match → render those as a "Key details"
 *   definition list, then any remaining prose underneath.
 * Tier 3: plain paragraph fallback.
 *
 * The mega-audit 2026-05-28 H1 finding showed ~80% of descriptions are
 * stored as a single paragraph with field-value structure baked in
 * ("Cost: $4,500 per elective. Visa: J-1 sponsored. Duration: 4 weeks.")
 * — Tier 2 surfaces that without any data migration.
 */
const ABOUT_LABELS = [
  "Cost",
  "Duration",
  "Visa",
  "Apply",
  "Application",
  "Eligibility",
  "Path to USCE",
  "Stipend",
  "Schedule",
  "Note",
  "Contact",
  "Format",
  "Funding",
  "Slot allocation priority",
];

interface LabelMatch {
  label: string;
  value: string;
}

function tryMatchLabel(sentence: string): LabelMatch | null {
  for (const label of ABOUT_LABELS) {
    const prefix = label + ":";
    if (sentence.startsWith(prefix + " ")) {
      return { label, value: sentence.slice(prefix.length + 1).trim() };
    }
    if (sentence.startsWith(prefix)) {
      const tail = sentence.slice(prefix.length).trim();
      if (tail.length > 0) return { label, value: tail };
    }
  }
  return null;
}

function splitSentences(text: string): string[] {
  // Sentence-ish split on ". " — close enough for typical English prose.
  // Re-stitches segments that look like a continuation (very short
  // trailing fragment, common abbreviation) so we don't shred mid-sentence.
  const raw = text.split(". ");
  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const piece = raw[i].trim();
    if (!piece) continue;
    const isLast = i === raw.length - 1;
    const text = isLast ? piece : piece + ".";
    out.push(text);
  }
  return out;
}

function KeyDetailsList({ items }: { items: LabelMatch[] }): ReactNode {
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr",
        gap: "6px 14px",
        margin: "4px 0 14px",
        padding: "12px 14px",
        background: "var(--paper-soft)",
        borderRadius: 10,
        border: "1px solid var(--line)",
      }}
    >
      {items.map((m, j) => (
        <div key={j} style={{ display: "contents" }}>
          <dt
            style={{
              fontWeight: 600,
              color: "var(--ink)",
              fontSize: 13.5,
              whiteSpace: "nowrap",
              paddingTop: 2,
            }}
          >
            {m.label}
          </dt>
          <dd
            style={{
              margin: 0,
              color: "var(--ink-soft)",
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            {m.value.endsWith(".") ? m.value.slice(0, -1) : m.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function renderAboutBlocks(input: string | null | undefined): ReactNode {
  const description = (input ?? "").trim();
  if (!description) return null;

  // Be flexible about paragraph separation. Some listings store double
  // newlines, some store single newlines per sentence, some are one big
  // block. We try `\n\n` first; if that yields exactly one paragraph but
  // the source contains `\n`, fall back to single-newline splits.
  let paragraphs = description
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length <= 1 && description.includes("\n")) {
    const singleSplit = description
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    if (singleSplit.length >= 3) paragraphs = singleSplit;
  }

  // Pass A — cross-paragraph aggregation: detect short "Label:"-prefixed
  // paragraphs (typical of the Pittsburgh-style listing where each
  // labeled fact got its own \n-separated paragraph). If 3+ such
  // labeled-paragraphs exist, consolidate them into a single
  // KeyDetailsList block placed at the position of the first one and
  // strip the originals from the render stream.
  type Block = { kind: "prose"; text: string } | { kind: "list"; lines: string[] } | { kind: "details"; items: LabelMatch[] };
  const fullParaLabels: (LabelMatch | null)[] = paragraphs.map((p) => {
    if (p.length > 280) return null; // too long to be a single labeled fact
    return tryMatchLabel(p);
  });
  const labeledCount = fullParaLabels.filter((m) => m !== null).length;

  const blocks: Block[] = [];
  if (labeledCount >= 3) {
    let consolidatedItems: LabelMatch[] | null = null;
    paragraphs.forEach((para, i) => {
      const label = fullParaLabels[i];
      if (label) {
        if (consolidatedItems === null) {
          consolidatedItems = [];
          blocks.push({ kind: "details", items: consolidatedItems });
        }
        consolidatedItems.push(label);
      } else {
        blocks.push({ kind: "prose", text: para });
      }
    });
  } else {
    // Pass B — per-paragraph tier 1 + tier 2 + tier 3.
    paragraphs.forEach((para) => {
      // Tier 1: line-level bullet detection.
      const lines = para
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const looksLikeList =
        lines.length >= 3 &&
        lines.filter((l) => {
          const noTrailingDot = !l.endsWith(".");
          const isShort = l.length <= 120;
          const commaCount = l.split(",").length - 1;
          return noTrailingDot && isShort && commaCount <= 2;
        }).length /
          lines.length >=
          0.7;
      if (looksLikeList) {
        blocks.push({ kind: "list", lines });
        return;
      }

      // Tier 2: sentence-level "Label:" inside a dense paragraph.
      const sentences = splitSentences(para);
      const labeled: LabelMatch[] = [];
      const proseSentences: string[] = [];
      sentences.forEach((s) => {
        const m = tryMatchLabel(s);
        if (m) labeled.push(m);
        else proseSentences.push(s);
      });
      if (labeled.length >= 3) {
        const prose = proseSentences.join(" ").trim();
        if (prose) blocks.push({ kind: "prose", text: prose });
        blocks.push({ kind: "details", items: labeled });
        return;
      }

      // Tier 3: plain paragraph.
      blocks.push({ kind: "prose", text: para });
    });
  }

  return blocks.map((b, i) => {
    if (b.kind === "prose") return <p key={i}>{b.text}</p>;
    if (b.kind === "list") {
      return (
        <ul
          key={i}
          style={{ paddingLeft: 22, margin: "8px 0 14px", listStyle: "disc" }}
        >
          {b.lines.map((line, j) => (
            <li key={j} style={{ marginBottom: 4, lineHeight: 1.55 }}>
              {line}
            </li>
          ))}
        </ul>
      );
    }
    return <KeyDetailsList key={i} items={b.items} />;
  });
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, shortDescription: true, city: true, state: true, listingType: true },
  });
  if (!listing) return { title: "Listing Not Found — USCEHub" };
  const description =
    listing.shortDescription ||
    `${listing.title} — ${LISTING_TYPE_LABELS[listing.listingType] || listing.listingType} opportunity in ${listing.city}, ${listing.state}. Browse details, eligibility, and reviews on USCEHub.`;
  return {
    title: listing.title,
    description,
    openGraph: {
      title: `${listing.title} — USCEHub`,
      description,
      url: `https://uscehub.com/listing/${id}`,
      type: "website",
    },
    alternates: {
      canonical: `https://uscehub.com/listing/${id}`,
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      organization: true,
      poster: {
        select: { name: true, posterProfile: true },
      },
      reviews: {
        where: { moderationStatus: "APPROVED" },
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Admins can preview pending/rejected/hidden listings from the moderation
  // queue. Everyone else can only see APPROVED listings.
  const session = await auth();
  const isAdmin = session?.user && (session.user as { role?: string }).role === "ADMIN";
  if (!listing || (listing.status !== "APPROVED" && !isAdmin)) {
    notFound();
  }

  // Don't inflate view counts for admin previews.
  if (listing.status === "APPROVED") {
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  const avgRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.overallRating, 0) /
        listing.reviews.length
      : null;

  const typeVariant = listing.listingType.toLowerCase() as
    | "observership"
    | "externship"
    | "research"
    | "postdoc"
    | "elective"
    | "volunteer";

  // ── P102 Shape A: pull this row's truth-layer enrichment (SOURCE
  //    badge, SPECIALTY tag, verified finalUrl, evidence quote).
  //    Lookup is O(1) on the adapter's cached index; returns null
  //    for rows the truth layer doesn't know about (graceful
  //    degradation — page renders as before).
  const truthLookup = findDisplayEligibleByName(listing.title);
  const sourceBadge = truthLookup?.row.badge as
    | "DIRECT"
    | "REORIENTED"
    | "PROTECTED"
    | "RESEARCH"
    | undefined;
  const specialtyLimited = truthLookup?.row.specialtyLimited;
  const sourceFinalUrl = truthLookup?.row.finalUrl;
  const sourceEvidenceQuote = truthLookup?.row.evidenceQuote;

  const SOURCE_BADGE_CLASS: Record<string, string> = {
    DIRECT:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700",
    REORIENTED:
      "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100 border-sky-300 dark:border-sky-700",
    PROTECTED:
      "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100 border-amber-300 dark:border-amber-700",
    RESEARCH:
      "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100 border-violet-300 dark:border-violet-700",
  };
  const SOURCE_BADGE_TITLE: Record<string, string> = {
    DIRECT: "Direct official source",
    REORIENTED: "Reoriented to official source",
    PROTECTED: "Live in browser (bot-protected)",
    RESEARCH: "Research / postdoctoral",
  };

  // ════════════════════════════════════════════════════════════════════
  //   MOCKUP 98 HERO — data helpers (Step 2A: hero structural port)
  //   No regex per project binding; uses indexOf/slice/split only.
  // ════════════════════════════════════════════════════════════════════

  // Title split: if title ends in "(SUFFIX)", separate the parens-suffix
  // so it can render muted (e.g. "...Sciences (UAMS)" → main + "(UAMS)").
  let titleMain = listing.title;
  let titleSuffix: string | null = null;
  {
    const open = listing.title.lastIndexOf("(");
    const close = listing.title.lastIndexOf(")");
    if (open > 0 && close === listing.title.length - 1 && close > open) {
      const inner = listing.title.slice(open + 1, close); // contents of parens
      // Only treat parens as institution acronym when it's plausibly one:
      //   - short (≤ 8 chars), OR
      //   - ALL UPPERCASE (e.g. "TTUHSC", "UAMS", "NYU Langone Health"
      //     wouldn't match since lowercase chars present)
      // This rules out specialty hints like "(Pathology)" or "(MD/DO)"
      // that aren't institution names.
      const isAcronymLike =
        inner.length <= 8 || inner === inner.toUpperCase();
      if (isAcronymLike) {
        titleMain = listing.title.slice(0, open).trimEnd();
        titleSuffix = listing.title.slice(open); // includes both parens
      }
    }
  }

  // audienceTag → human label. audienceTag is a comma-separated string of
  // 5 known tokens. Multi-audience rows join with " · " (mockup shows one
  // composite pill, not multiple pills).
  const AUDIENCE_TAG_LABEL: Record<string, string> = {
    "IMG-GRAD-OBSERVER": "IMG graduates",
    "IMG-STUDENT-CLERKSHIP": "INTL students",
    "US-MD-DO-VISITING": "U.S. M4",
    "PRE-MED": "Pre-med",
    "RESEARCH": "Researchers",
  };
  const audienceTokens = (listing.audienceTag || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const audienceLabel =
    audienceTokens.length > 0
      ? audienceTokens.map((t) => AUDIENCE_TAG_LABEL[t] || t).join(" · ")
      : null;

  // Some legacy rows link to a placeholder Organization called "USCEHub
  // Directory" (the seed-file default before real orgs were curated).
  // Treat those as if no org was linked.
  const PLACEHOLDER_ORG = new Set(["USCEHub Directory", "USCEHub"]);
  const realOrgName =
    listing.organization?.name && !PLACEHOLDER_ORG.has(listing.organization.name)
      ? listing.organization.name
      : null;

  // Subtitle: "<Org or City+State> · <Type label>"
  const subtitleType = LISTING_TYPE_LABELS[listing.listingType] || listing.listingType;
  const subtitlePrefix = realOrgName || `${listing.city}, ${US_STATES[listing.state] || listing.state}`;
  const heroSubtitle = `${subtitlePrefix} · ${subtitleType}`;

  // Apply button: prefer P102 truth-layer canonical URL > listing.sourceUrl
  //                > applicationUrl > websiteUrl.
  const applyHref =
    sourceFinalUrl ||
    listing.sourceUrl ||
    listing.applicationUrl ||
    listing.websiteUrl ||
    null;

  // Display version of applyHref (strip protocol) for the Direct-source mono URL.
  // No regex per project binding — use string split.
  const applyHrefDisplay = applyHref
    ? applyHref.split("://").pop() || applyHref
    : null;

  // Apply button label: "Apply at <SHORT>" — order of preference:
  //   1. parens-suffix on title  (e.g. "(UAMS)" → "UAMS")
  //   2. shortened *real* org name (skip placeholder "USCEHub Directory")
  //   3. shortened title  (e.g. "Texas Tech HSC" from "Texas Tech HSC IM IMG ...")
  //   4. generic "Program"
  //
  // shortenInstitutionName: take up to 4 leading words, stopping at common
  // generic type-words ("Medical", "College", "School", "Center", "Hospital",
  // "for", "of", "and"). NO REGEX per project binding.
  const TYPE_STOP_WORDS = new Set([
    "medical",
    "college",
    "school",
    "center",
    "hospital",
    "for",
    // "of" intentionally NOT a stop word — "University of Florida"
    // pattern would otherwise break (would stop at "University").
    "and",
    "department",
    "office",
    "program",
    // Specialties that often follow the institution name in titles like
    // "Texas Tech HSC Internal Medicine IMG Observership"
    "internal",
    "general",
    "surgery",
    "pediatrics",
    "psychiatry",
    "neurology",
    "radiology",
    "emergency",
    "obstetrics",
    "family",
    "anesthesia",
    "anesthesiology",
    "dermatology",
    "pathology",
    "ophthalmology",
    "neurosurgery",
    "orthopedic",
    "orthopedics",
    "international",
    "visiting",
    "img",
    "observership",
    "clerkship",
    "elective",
  ]);
  function stripPunct(s: string): string {
    return s
      .split("(")
      .join("")
      .split(")")
      .join("")
      .split(",")
      .join("")
      .split(":")
      .join("")
      .split("—") // em-dash
      .join("")
      .split("–") // en-dash
      .join("")
      .split("/")
      .join("")
      .trim();
  }
  function shortenInstitutionName(name: string | null | undefined): string | null {
    if (!name) return null;
    const words = name.split(" ");
    const out: string[] = [];
    for (const raw of words) {
      const clean = stripPunct(raw);
      if (!clean) continue;
      const lc = clean.toLowerCase();
      if (TYPE_STOP_WORDS.has(lc) && out.length > 0) break;
      out.push(clean);
      if (out.length >= 3) break;
    }
    return out.join(" ") || null;
  }
  const orgShort = titleSuffix
    ? titleSuffix.slice(1, -1)
    : shortenInstitutionName(realOrgName) ||
      shortenInstitutionName(listing.title) ||
      "Program";

  // Hero meta items — show what we have, skip blanks.
  const heroMetaItems: { icon: "pin" | "clock" | "cal" | "users"; text: string; bold?: boolean }[] = [];
  if (listing.city && listing.state) {
    heroMetaItems.push({
      icon: "pin",
      text: `${listing.city}, ${US_STATES[listing.state] || listing.state}`,
      bold: true,
    });
  }
  if (listing.duration) {
    heroMetaItems.push({ icon: "clock", text: listing.duration, bold: true });
  }
  if (listing.applicationMethod && listing.applicationMethod !== "external" && listing.applicationMethod !== "platform") {
    heroMetaItems.push({ icon: "cal", text: listing.applicationMethod });
  }
  if (audienceLabel) {
    heroMetaItems.push({ icon: "users", text: audienceLabel });
  }

  // ════════════════════════════════════════════════════════════════════
  //   STEP 3: Quick-highlights / money tiles / What's-included / Apply-steps
  //   Plan B (Step 4): per-row override via `extractedSignals` Json column.
  //   When populated by hand for top programs, replaces the heuristic.
  //   When null, falls back to computeListingV2Signals heuristic.
  //   See src/lib/listing-v2-signals.ts for both shape + heuristic.
  // ════════════════════════════════════════════════════════════════════
  const heuristicSignals = computeListingV2Signals({
    cost: listing.cost,
    duration: listing.duration,
    specialty: listing.specialty,
    applicationMethod: listing.applicationMethod,
    audienceTag: listing.audienceTag,
    visaSupport: listing.visaSupport,
    linkVerified: listing.linkVerified,
    featured: listing.featured,
    certificateOffered: listing.certificateOffered,
    lorPossible: listing.lorPossible,
    fullDescription: listing.fullDescription,
    shortDescription: listing.shortDescription,
    eligibilitySummary: listing.eligibilitySummary,
    stepRequirements: listing.stepRequirements,
    ecfmgRequired: listing.ecfmgRequired,
    applicationDeadline: listing.applicationDeadline,
    housingSupport: listing.housingSupport,
  });

  // Plan B override: if the row has hand-curated `extractedSignals`,
  // use that for the 5 mockup-98 sections; otherwise use the heuristic
  // result. Hand-curated rows can opt out individual sections by
  // omitting that field — the heuristic fills the gap for that one.
  type V2SignalKey = keyof typeof heuristicSignals;
  type ExtractedRow = Partial<Record<V2SignalKey, unknown>>;
  const override = (listing.extractedSignals ?? null) as ExtractedRow | null;
  const pick = <K extends V2SignalKey>(k: K) => {
    const fromOverride = override?.[k];
    if (Array.isArray(fromOverride) && fromOverride.length > 0) {
      return fromOverride as (typeof heuristicSignals)[K];
    }
    return heuristicSignals[k];
  };
  const v2signals = {
    strong: pick("strong"),
    watch: pick("watch"),
    money: pick("money"),
    included: pick("included"),
    clerkships: pick("clerkships"),
    applySteps: pick("applySteps"),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: listing.title,
    description: listing.fullDescription || listing.shortDescription,
    provider: listing.organization
      ? {
          "@type": "MedicalOrganization",
          name: listing.organization.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: listing.organization.city,
            addressRegion: listing.organization.state,
            addressCountry: "US",
          },
          ...(listing.organization.website
            ? { url: listing.organization.website }
            : {}),
        }
      : undefined,
    occupationalCategory: listing.specialty,
    timeToComplete: listing.duration,
    offers: {
      "@type": "Offer",
      price: listing.cost,
      priceCurrency: "USD",
    },
    url: `https://uscehub.com/listing/${id}`,
    applicationStartDate: listing.startDate || undefined,
    applicationDeadline: listing.applicationDeadline || undefined,
    // AggregateRating intentionally omitted (PR 0d audit C2): without a
    // verified-purchase / completed-application gate on POST /api/reviews
    // and without a minimum-N threshold, AggregateRating in structured
    // data risks Google rich-results spam classification. Re-introduce
    // when both gates are in place. See REVIEW_FLOW_AUDIT.md §14.
  };

  return (
    <div className="bg-[var(--bg)] dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ═══════════════════════════════════════════════════════════════════
          STEP 2A: MOCKUP 98 MATTE-BLACK HERO
          Scoped under .lv2 so its tokens don't leak to rest of page.
          Day tokens (light) on :root; dark variant under .dark .lv2.
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="lv2">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Sonolex tokens — day (mockup 98) */
              /* NOTE: --bg is set transparent so .lv2 inherits the page's
                 background. Site-wide background palette across home /
                 browse / listing is a separate deferred task. */
              .lv2 {
                --bg: transparent;
                --paper: #ffffff;
                --paper-soft: #fcfaf2;
                --ink: #1a1f1f;
                --ink-soft: #2d3434;
                --ink-mid: #4a5252;
                --ink-quiet: #6a7070;
                --line: #e9e3d3;
                --line-strong: #c5b899;
                --line-soft: #f0ead8;
                --teal: #0f5757;
                --teal-soft: #c5dcd9;
                --teal-deep: #084040;
                --cta-bg: #0f5757;
                --cta-fg: #ffffff;
                --cta-bg-hover: #084040;
                --shadow-rest: 0 1px 3px rgba(13,20,24,.04);
                --shadow-hover: 0 18px 40px -18px rgba(13,20,24,.14), 0 4px 10px -6px rgba(13,20,24,.08);
                /* background intentionally not set — inherit from page */
                padding-bottom: 12px;
              }
              /* Sonolex tokens — dark (mockup 99) */
              .dark .lv2 {
                --bg: #1d1f26;
                --paper: #23262e;
                --paper-soft: #2a2d35;
                --ink: #f7f5ec;
                --ink-soft: #d8d4c5;
                --ink-mid: #a8a4a0;
                --ink-quiet: #6b6864;
                --line: rgba(247,245,236,.10);
                --line-strong: rgba(247,245,236,.22);
                --line-soft: rgba(247,245,236,.06);
                --teal: #0fa595;
                --teal-soft: rgba(15,165,149,.16);
                --teal-deep: #5fb8a4;
                --cta-bg: #0fa595;
                --cta-fg: #0d1418;
                --cta-bg-hover: #5fb8a4;
                --shadow-rest: 0 1px 3px rgba(0,0,0,.35);
                --shadow-hover: 0 18px 40px -18px rgba(0,0,0,.55), 0 4px 10px -6px rgba(0,0,0,.30);
              }

              /* Breadcrumb */
              .lv2-crumbs { max-width: 1380px; margin: 0 auto; padding: 14px 32px 0; display: flex; justify-content: flex-end; }
              .lv2-crumbs-inner { color: var(--ink-quiet); font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
              .lv2-crumbs-inner a { color: var(--ink-mid); text-decoration: none; transition: color .15s; }
              .lv2-crumbs-inner a:hover { color: var(--ink); }
              .lv2-crumbs-inner .sep { color: var(--ink-quiet); font-size: 10px; }

              /* Matte-black hero */
              .lv2-hero-wrap { max-width: 1380px; margin: 8px auto 0; padding: 0 32px; }
              .lv2-hero {
                background: linear-gradient(135deg, #0a0a0a 0%, #161616 100%);
                color: #fff; border-radius: 22px; padding: 64px 44px 56px;
                position: relative; overflow: hidden;
                box-shadow: 0 30px 80px -30px rgba(10,10,10,.30), 0 2px 0 rgba(255,255,255,.02) inset;
              }
              .lv2-hero::before {
                content: ""; position: absolute; top: -140px; right: -100px;
                width: 420px; height: 420px; border-radius: 50%;
                background: radial-gradient(circle, rgba(26,84,84,.40), transparent 70%);
                pointer-events: none;
              }
              .lv2-hero::after {
                content: ""; position: absolute; bottom: -160px; left: -80px;
                width: 360px; height: 360px; border-radius: 50%;
                background: radial-gradient(circle, rgba(26,84,84,.18), transparent 70%);
                pointer-events: none;
              }
              .lv2-hero-inner { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: flex-end; }
              .lv2-hero-left { min-width: 0; }

              .lv2-pill-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
              .lv2-pill {
                display: inline-flex; align-items: center; gap: 6px;
                font-size: 11.5px; font-weight: 600; letter-spacing: .04em;
                padding: 6px 12px; border-radius: 980px; line-height: 1.3;
                text-transform: uppercase;
              }
              .lv2-pill.verified { background: rgba(22,121,77,.18); color: #a3e3c1; border: 1px solid rgba(163,227,193,.25); }
              .lv2-pill.verified::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #5fd49a; box-shadow: 0 0 0 4px rgba(95,212,154,.2); }
              .lv2-pill.type { background: rgba(255,255,255,.10); color: #fff; border: 1px solid rgba(255,255,255,.15); }
              .lv2-pill.audience { background: rgba(255,255,255,.06); color: rgba(255,255,255,.85); border: 1px solid rgba(255,255,255,.12); }
              .lv2-pill.fit { background: rgba(255,255,255,.10); color: #a3e3c1; border: 1px solid rgba(163,227,193,.20); }
              .lv2-pill.fit::before { content: "★"; color: #fbe072; margin-right: 2px; }

              .lv2-hero h1 {
                font-size: clamp(28px, 3vw, 40px);
                font-weight: 800; letter-spacing: -.03em;
                line-height: 1.15; margin: 0 0 12px; color: #fff;
              }
              .lv2-hero h1 .suffix { color: rgba(255,255,255,.55); font-weight: 600; }
              .lv2-subtitle { font-size: 17px; font-weight: 500; color: rgba(255,255,255,.72); margin: 0 0 22px; line-height: 1.4; }
              .lv2-subtitle b { color: #fff; font-weight: 600; }

              .lv2-hero-meta { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; font-size: 13.5px; color: rgba(255,255,255,.78); }
              .lv2-hero-meta .item { display: inline-flex; align-items: center; gap: 8px; }
              .lv2-hero-meta .item b { color: #fff; font-weight: 600; }
              .lv2-hero-meta .ic { width: 18px; height: 18px; flex-shrink: 0; color: rgba(255,255,255,.6); }

              .lv2-hero-right { display: flex; flex-direction: column; gap: 12px; min-width: 240px; align-items: flex-end; }
              .lv2-apply-hero {
                display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                background: #fff; color: #0a0a0a; padding: 13px 22px; border-radius: 12px;
                font-size: 14px; font-weight: 700; letter-spacing: .01em;
                min-width: 240px; text-decoration: none; transition: all .2s;
              }
              .lv2-apply-hero:hover { background: #f0efe9; transform: translateY(-2px); box-shadow: 0 12px 28px -10px rgba(0,0,0,.4); }
              .lv2-apply-hero .ic { width: 18px; height: 18px; transition: transform .2s; }
              .lv2-apply-hero:hover .ic { transform: translate(3px, 0); }

              /* ===== Sub-step 2B: Body layout + cards ===== */
              .lv2-body-wrap { max-width: 1380px; margin: 0 auto; padding: 0 32px; }
              .lv2-disclaimer-wrap { margin: 18px 0 6px; }
              .lv2-main { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 28px; align-items: start; margin-top: 14px; }
              .lv2-main-left { min-width: 0; }
              .lv2-main-aside { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 18px; }

              .lv2-card {
                background: var(--paper);
                border: 1px solid var(--line);
                border-radius: 16px;
                padding: 26px 30px;
                margin-bottom: 14px;
                box-shadow: var(--shadow-rest);
                transition: transform .25s ease, box-shadow .25s ease, border-color .2s;
              }
              .lv2-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-hover); border-color: var(--line-strong); }

              .lv2-section-h { display: flex; align-items: center; gap: 10px; margin: 0 0 16px; }
              .lv2-section-h h2 { font-size: 20px; font-weight: 700; letter-spacing: -.015em; color: var(--ink); margin: 0; line-height: 1.2; }
              .lv2-ic-circle { flex-shrink: 0; width: 30px; height: 30px; border-radius: 8px; background: var(--cta-bg); color: var(--cta-fg); display: inline-flex; align-items: center; justify-content: center; }
              .lv2-ic-circle.teal { background: var(--teal); }
              .lv2-ic-circle svg { width: 15px; height: 15px; }

              /* About prose */
              .lv2-about p { font-size: 15.5px; line-height: 1.65; color: var(--ink-soft); margin: 0 0 10px; white-space: pre-wrap; }
              .lv2-about p:last-child { margin-bottom: 0; }
              .lv2-about p b { color: var(--ink); font-weight: 600; }

              /* Teaching-hospital sub-card */
              .lv2-contact-card {
                background: linear-gradient(135deg, var(--teal-soft) 0%, #e8efed 100%);
                border: 1px solid #a8c8c0;
                border-radius: 14px;
                padding: 20px;
                display: flex; align-items: center; gap: 16px;
                margin-top: 14px;
                transition: all .25s;
              }
              .dark .lv2-contact-card { background: linear-gradient(135deg, rgba(15,165,149,.12) 0%, var(--paper-soft) 100%); border-color: rgba(15,165,149,.20); }
              .lv2-contact-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
              .lv2-contact-card .lv2-ic-teal { flex-shrink: 0; width: 48px; height: 48px; border-radius: 12px; background: var(--teal); color: #fff; display: flex; align-items: center; justify-content: center; }
              .lv2-contact-card .lv2-ic-teal svg { width: 22px; height: 22px; }
              .lv2-contact-card .lv2-meta { min-width: 0; flex: 1; }
              .lv2-contact-card .lv2-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .12em; color: var(--teal); margin-bottom: 4px; }
              .lv2-contact-card .lv2-value { font-size: 15.5px; font-weight: 600; color: var(--ink); line-height: 1.3; }
              .lv2-contact-card .lv2-value small { display: block; font-size: 13px; color: var(--ink-mid); font-weight: 400; margin-top: 2px; }
              .lv2-contact-card .lv2-go { flex-shrink: 0; background: var(--cta-bg); color: var(--cta-fg); padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; transition: all .2s; }
              .lv2-contact-card .lv2-go:hover { background: var(--cta-bg-hover); transform: translateY(-1px); }

              /* VSLO/platform sub-card */
              .lv2-platform-card {
                background: linear-gradient(135deg, var(--paper) 0%, var(--paper-soft) 100%);
                border: 1px solid var(--line);
                border-radius: 14px;
                padding: 18px;
                display: flex; align-items: center; gap: 14px;
                margin-top: 14px;
                transition: all .25s;
              }
              .lv2-platform-card:hover { border-color: var(--teal); transform: translateY(-2px); box-shadow: var(--shadow-hover); }
              .lv2-platform-card .lv2-logo-tile { flex-shrink: 0; width: 54px; height: 54px; border-radius: 12px; background: var(--teal); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; letter-spacing: .06em; }
              .lv2-platform-card .lv2-text { flex: 1; min-width: 0; }
              .lv2-platform-card .lv2-name { font-size: 15.5px; font-weight: 700; color: var(--ink); margin: 0; line-height: 1.3; }
              .lv2-platform-card .lv2-sub { font-size: 13px; color: var(--ink-mid); margin: 2px 0 0; line-height: 1.4; }
              .lv2-platform-card a { flex-shrink: 0; font-size: 12.5px; font-weight: 600; color: var(--teal); display: inline-flex; align-items: center; gap: 5px; text-decoration: none; }

              /* Specialty tags */
              .lv2-tags { display: flex; flex-wrap: wrap; gap: 8px; }
              .lv2-tag { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 500; padding: 8px 14px; border-radius: 10px; background: var(--paper-soft); border: 1px solid var(--line); color: var(--ink-soft); transition: all .2s; }
              .lv2-tag b { color: var(--ink); font-weight: 600; }
              .lv2-tag:hover { border-color: var(--teal); background: var(--paper); transform: translateY(-1px); box-shadow: 0 4px 10px -4px rgba(0,0,0,.06); }
              .lv2-tag svg { width: 14px; height: 14px; color: var(--teal); flex-shrink: 0; }

              /* Eligibility list */
              .lv2-elig p { font-size: 14px; color: var(--ink-soft); line-height: 1.6; margin: 0 0 8px; }
              .lv2-elig p:last-child { margin-bottom: 0; }
              .lv2-elig p b { color: var(--ink); font-weight: 600; }

              /* ===== Sub-step 2B: Right sidebar ===== */

              /* Verified source CTA card */
              .lv2-cta-card {
                background: var(--paper);
                border: 1px solid var(--teal-soft);
                border-radius: 16px;
                padding: 22px 24px;
                box-shadow: var(--shadow-rest);
              }
              .lv2-cta-card .lv2-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; color: var(--teal); display: inline-flex; align-items: center; gap: 6px; margin-bottom: 12px; }
              .lv2-cta-card .lv2-label svg { width: 14px; height: 14px; }
              .lv2-cta-card h3 { font-size: 14.5px; font-weight: 600; color: var(--ink-soft); line-height: 1.5; margin: 0 0 16px; letter-spacing: -.005em; }
              .lv2-cta-card a.lv2-cta-apply { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--cta-bg); color: var(--cta-fg); padding: 12px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 700; width: 100%; text-decoration: none; transition: all .2s; }
              .lv2-cta-card a.lv2-cta-apply:hover { background: var(--cta-bg-hover); transform: translateY(-1px); box-shadow: 0 8px 20px -8px rgba(0,0,0,.15); }
              .lv2-cta-card a.lv2-cta-apply svg { width: 15px; height: 15px; }

              /* At-a-glance table */
              .lv2-glance {
                background: var(--paper);
                border: 1px solid var(--line);
                border-radius: 16px;
                padding: 18px 22px;
                box-shadow: var(--shadow-rest);
              }
              .lv2-glance .lv2-gh { padding-bottom: 10px; margin-bottom: 6px; border-bottom: 1px solid var(--line-soft); }
              .lv2-glance .lv2-gh h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .14em; color: var(--ink-quiet); font-weight: 700; margin: 0; display: inline-flex; align-items: center; gap: 6px; }
              .lv2-glance .lv2-gh h4 svg { width: 14px; height: 14px; }
              .lv2-row { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; font-size: 13px; gap: 12px; }
              .lv2-row .lv2-l { color: var(--ink-quiet); font-weight: 500; flex-shrink: 0; }
              .lv2-row .lv2-v { color: var(--ink); font-weight: 600; text-align: right; min-width: 0; }
              .lv2-row .lv2-v.teal { color: var(--teal); }
              .lv2-row .lv2-v.green { color: var(--teal); display: inline-flex; align-items: center; gap: 4px; justify-content: flex-end; }
              .lv2-row .lv2-v.red { color: #b3503e; display: inline-flex; align-items: center; gap: 4px; justify-content: flex-end; }
              .dark .lv2-row .lv2-v.red { color: #e07c6e; }
              .lv2-row .lv2-v svg { width: 12px; height: 12px; flex-shrink: 0; }

              /* Side cards (contact + direct source) */
              .lv2-side-card {
                background: var(--paper);
                border: 1px solid var(--line);
                border-radius: 16px;
                padding: 18px 22px;
                box-shadow: var(--shadow-rest);
              }
              .lv2-side-card h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .14em; color: var(--ink-quiet); font-weight: 700; margin: 0 0 10px; display: inline-flex; align-items: center; gap: 6px; }
              .lv2-side-card h4 svg { width: 14px; height: 14px; }
              .lv2-side-card .lv2-name { font-size: 14.5px; font-weight: 600; color: var(--ink); line-height: 1.35; }
              .lv2-side-card .lv2-sub { font-size: 13px; color: var(--ink-mid); margin-top: 3px; line-height: 1.4; }
              .lv2-side-card .lv2-sub.mono { font-family: ui-monospace, Menlo, monospace; font-size: 12px; word-break: break-all; margin-top: 6px; }
              .lv2-side-card .lv2-go { display: inline-flex; align-items: center; gap: 5px; margin-top: 12px; font-size: 12.5px; font-weight: 600; color: var(--teal); text-decoration: none; transition: color .15s; }
              .lv2-side-card .lv2-go:hover { color: var(--teal-deep); }
              .lv2-side-card .lv2-src-link {
                display: flex; align-items: center; justify-content: space-between; gap: 10px;
                padding: 12px 14px;
                background: var(--paper-soft);
                border: 1px solid var(--line-soft);
                border-radius: 10px;
                font-size: 12px;
                color: var(--ink);
                word-break: break-all;
                font-family: ui-monospace, Menlo, monospace;
                line-height: 1.45;
                font-weight: 500;
                text-decoration: none;
                transition: all .2s;
              }
              .lv2-side-card .lv2-src-link:hover { border-color: var(--teal); background: var(--paper); }
              .lv2-side-card .lv2-src-link svg { color: var(--teal); width: 14px; flex-shrink: 0; }

              /* ===== Sub-step 3: Highlights split + money tiles + bullets + steps ===== */
              .lv2-hl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
              .lv2-hl {
                padding: 18px 20px; border-radius: 14px; border: 1px solid;
                transition: all .25s;
              }
              .lv2-hl:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
              .lv2-hl.pros { background: linear-gradient(135deg, #d9f0e2 0%, #dceee5 100%); border-color: #a8c8c0; }
              .lv2-hl.cons { background: linear-gradient(135deg, #f5dccc 0%, #fbe8db 100%); border-color: #e0a888; }
              .dark .lv2-hl.pros { background: linear-gradient(135deg, rgba(95,184,164,.08), rgba(95,184,164,.04)); border-color: rgba(95,184,164,.22); }
              .dark .lv2-hl.cons { background: linear-gradient(135deg, rgba(212,161,85,.08), rgba(212,161,85,.04)); border-color: rgba(212,161,85,.22); }
              .lv2-hl h3 {
                font-size: 12px; text-transform: uppercase; letter-spacing: .14em; font-weight: 700;
                margin: 0 0 12px; display: flex; align-items: center; gap: 8px;
              }
              .lv2-hl.pros h3 { color: #0f5757; }
              .lv2-hl.cons h3 { color: #b3503e; }
              .dark .lv2-hl.pros h3 { color: #5fb8a4; }
              .dark .lv2-hl.cons h3 { color: #d4a155; }
              .lv2-hl h3 svg { width: 14px; height: 14px; }
              .lv2-hl ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
              .lv2-hl li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.45; color: var(--ink-soft); }
              .lv2-hl li > span { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
              .lv2-hl li b { display: block; color: var(--ink); font-weight: 600; font-size: 13px; }
              .lv2-hl li .tail { display: block; color: var(--ink-mid); font-size: 12.5px; }
              .lv2-hl.pros li::before {
                content: "✓"; color: #0f5757; font-weight: 700; flex-shrink: 0;
                font-size: 14px; line-height: 1.4;
              }
              .dark .lv2-hl.pros li::before { color: #5fb8a4; }
              .lv2-hl.cons li::before {
                content: "!"; color: #b3503e; font-weight: 700; flex-shrink: 0;
                font-size: 14px; line-height: 1.4; width: 14px; text-align: center;
              }
              .dark .lv2-hl.cons li::before { color: #d4a155; }

              /* Money strip — 4 inline metric tiles */
              .lv2-money {
                display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
                border: 1px solid var(--line); border-radius: 14px; overflow: hidden;
                background: var(--paper);
              }
              .lv2-money-tile {
                padding: 18px 16px; border-right: 1px solid var(--line-soft);
                text-align: left; transition: background .2s;
              }
              .lv2-money-tile:last-child { border-right: 0; }
              .lv2-money-tile:hover { background: var(--paper-soft); }
              .lv2-money-tile .lv2-ml {
                font-size: 10.5px; text-transform: uppercase; letter-spacing: .14em;
                color: var(--ink-quiet); font-weight: 700;
                display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
              }
              .lv2-money-tile .lv2-ml svg { color: var(--teal); width: 13px; height: 13px; flex-shrink: 0; }
              .lv2-money-tile .lv2-mv {
                font-size: 16px; font-weight: 700; color: var(--ink);
                letter-spacing: -.015em; line-height: 1.25;
              }
              .lv2-money-tile .lv2-mv small {
                display: block; font-size: 11.5px; color: var(--ink-quiet);
                font-weight: 500; margin-top: 2px;
              }

              /* Bullets (✓ green / ! amber / × red) */
              .lv2-bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 13px; }
              .lv2-bullets li { display: flex; align-items: flex-start; gap: 12px; font-size: 14.5px; line-height: 1.55; color: var(--ink-soft); }
              .lv2-bullets li b { color: var(--ink); font-weight: 600; }
              .lv2-bullets li .lv2-check {
                flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
                background: #d9f0e2; display: inline-flex; align-items: center; justify-content: center;
                margin-top: 1px;
              }
              .dark .lv2-bullets li .lv2-check { background: rgba(95,184,164,.16); }
              .lv2-bullets li .lv2-check svg { width: 13px; height: 13px; color: #0f5757; }
              .dark .lv2-bullets li .lv2-check svg { color: #5fb8a4; }
              .lv2-bullets.warn li .lv2-check { background: #fbe8db; }
              .lv2-bullets.warn li .lv2-check svg { color: #b3503e; }
              .dark .lv2-bullets.warn li .lv2-check { background: rgba(212,161,85,.16); }
              .dark .lv2-bullets.warn li .lv2-check svg { color: #d4a155; }

              /* Numbered steps */
              .lv2-steps { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; counter-reset: lv2step; }
              .lv2-steps li {
                display: flex; align-items: flex-start; gap: 14px;
                counter-increment: lv2step;
                font-size: 14.5px; line-height: 1.55; color: var(--ink-soft);
              }
              .lv2-steps li::before {
                content: counter(lv2step, decimal-leading-zero);
                flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px;
                background: var(--cta-bg); color: var(--cta-fg); font-weight: 700; font-size: 13px;
                display: inline-flex; align-items: center; justify-content: center; letter-spacing: .04em;
              }
              .lv2-steps li b { color: var(--ink); font-weight: 600; }
              .lv2-steps li small {
                display: block; color: var(--ink-mid); font-size: 13px; font-weight: 400;
                margin-top: 3px; line-height: 1.45;
              }

              @media(max-width: 820px) {
                .lv2-crumbs { padding: 12px 16px 0; }
                .lv2-hero-wrap { padding: 0 16px; }
                .lv2-hero { padding: 24px 20px; border-radius: 16px; }
                .lv2-hero-inner { grid-template-columns: 1fr; gap: 20px; align-items: stretch; }
                .lv2-hero-right { align-items: stretch; }
                .lv2-apply-hero { min-width: 0; width: 100%; }
                .lv2-hero h1 { font-size: 26px; }
                .lv2-subtitle { font-size: 15px; }
                .lv2-body-wrap { padding: 0 16px; }
                .lv2-main { grid-template-columns: 1fr; gap: 16px; }
                .lv2-main-aside { position: static; }
                .lv2-card { padding: 20px 18px; border-radius: 14px; }
                .lv2-cta-card { padding: 18px 18px; border-radius: 14px; }
                .lv2-contact-card { flex-wrap: wrap; }
                .lv2-platform-card { flex-wrap: wrap; }
              }
            `,
          }}
        />

        <nav className="lv2-crumbs" aria-label="Breadcrumb">
          <div className="lv2-crumbs-inner">
            <Link href="/observerships">Directory</Link>
            <span className="sep">→</span>
            <Link href={`/observerships/state/${listing.state.toLowerCase()}`}>
              {US_STATES[listing.state] || listing.state}
            </Link>
            <span className="sep">→</span>
            <span>{orgShort}</span>
          </div>
        </nav>

        <section className="lv2-hero-wrap">
          <div className="lv2-hero">
            <div className="lv2-hero-inner">
              <div className="lv2-hero-left">
                <div className="lv2-pill-row">
                  {listing.linkVerified && <span className="lv2-pill verified">Verified</span>}
                  <span className="lv2-pill type">
                    {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
                  </span>
                  {audienceLabel && <span className="lv2-pill audience">{audienceLabel}</span>}
                  {listing.featured && <span className="lv2-pill fit">Recommended</span>}
                </div>
                <h1>
                  {titleMain}
                  {titleSuffix && <span className="suffix"> {titleSuffix}</span>}
                </h1>
                {heroSubtitle && <p className="lv2-subtitle">{heroSubtitle}</p>}
                <div className="lv2-hero-meta">
                  {heroMetaItems.map((m, i) => {
                    const Icon =
                      m.icon === "pin"
                        ? MapPin
                        : m.icon === "clock"
                          ? Clock
                          : m.icon === "cal"
                            ? Calendar
                            : Users;
                    return (
                      <span key={i} className="item">
                        <Icon className="ic" />
                        {m.bold ? <b>{m.text}</b> : <span>{m.text}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="lv2-hero-right">
                {applyHref && (
                  <a
                    className="lv2-apply-hero"
                    href={applyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply at {orgShort}
                    <ArrowRight className="ic" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SUB-STEP 2B: V2 BODY (mockup 98 — About + sidebar + preserved V1)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="lv2-body-wrap">
          <div className="lv2-disclaimer-wrap">
            <ListingDisclaimer />
          </div>

          <main className="lv2-main">
            <div className="lv2-main-left">
            {/* ════════════ V2 LEFT COL — mockup 98 ════════════ */}

            {/* About this program — three-tier auto-format.
                Tier 1: explicit \n\n splits → paragraphs, with line-by-line
                bullet detection for short list-like lines.
                Tier 2 (NEW): single-paragraph descriptions whose sentences
                start with known field labels ("Cost:", "Visa:", "Apply:",
                "Duration:", "Eligibility:", "Path to USCE:", "Stipend:",
                "Schedule:", "Note:", "Contact:", "Format:", "Application:")
                → extract those into a "Key details" definition list; render
                remaining sentences as prose underneath. Catches the dense-
                prose listings that have field structure baked in but no
                newline breaks (mega-audit 2026-05-28 H1).
                Tier 3: fall back to plain paragraph. */}
            <div className="lv2-card lv2-about">
              <div className="lv2-section-h">
                <span className="lv2-ic-circle"><Info /></span>
                <h2>About this program</h2>
              </div>
              {renderAboutBlocks(listing.fullDescription || listing.shortDescription)}

              {realOrgName && listing.organization && (
                <div className="lv2-contact-card">
                  <div className="lv2-ic-teal"><Building2 /></div>
                  <div className="lv2-meta">
                    <div className="lv2-label">Teaching hospital / institution</div>
                    <div className="lv2-value">
                      {realOrgName}
                      <small>
                        {listing.organization.city},{" "}
                        {US_STATES[listing.organization.state] || listing.organization.state}
                      </small>
                    </div>
                  </div>
                  {listing.organization.website && (
                    <a
                      className="lv2-go"
                      href={listing.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View site <ArrowRight />
                    </a>
                  )}
                </div>
              )}

              {(listing.applicationMethod === "VSLO" ||
                listing.applicationMethod === "VSAS/VSLO" ||
                listing.applicationMethod === "VSAS") && (
                <div className="lv2-platform-card">
                  <div className="lv2-logo-tile">VSLO</div>
                  <div className="lv2-text">
                    <p className="lv2-name">AAMC VSLO platform</p>
                    <p className="lv2-sub">
                      Applications submitted through your home medical school&apos;s
                      Dean&apos;s office.
                    </p>
                  </div>
                  <a
                    href="https://students-residents.aamc.org/visiting-student-learning-opportunities"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn about VSLO <ArrowRight />
                  </a>
                </div>
              )}

              {sourceEvidenceQuote && (
                <blockquote
                  style={{
                    marginTop: "18px",
                    paddingLeft: "14px",
                    borderLeft: "3px solid var(--teal-soft)",
                    fontSize: "14px",
                    color: "var(--ink-mid)",
                    lineHeight: 1.55,
                    fontStyle: "italic",
                  }}
                >
                  {sourceEvidenceQuote}
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "11px",
                      color: "var(--ink-quiet)",
                      fontStyle: "normal",
                      letterSpacing: ".05em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Verbatim from source page · audited 2026-05-25
                  </div>
                </blockquote>
              )}
            </div>

            {/* ════════════ STEP 3: Quick highlights (STRONG / WATCH) ════════════ */}
            {(v2signals.strong.length > 0 || v2signals.watch.length > 0) && (
              <div className="lv2-card">
                <div className="lv2-section-h">
                  <span className="lv2-ic-circle teal"><Zap /></span>
                  <h2>Quick highlights</h2>
                </div>
                <div className="lv2-hl-grid">
                  {v2signals.strong.length > 0 && (
                    <div className="lv2-hl pros">
                      <h3><Check /> Strong points</h3>
                      <ul>
                        {v2signals.strong.map((p, i) => (
                          <li key={i}>
                            <span>
                              <b>{p.title}</b>
                              <span className="tail">{p.tail}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {v2signals.watch.length > 0 && (
                    <div className="lv2-hl cons">
                      <h3><AlertTriangle /> Watch for</h3>
                      <ul>
                        {v2signals.watch.map((p, i) => (
                          <li key={i}>
                            <span>
                              <b>{p.title}</b>
                              <span className="tail">{p.tail}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════ STEP 3: Fees / Duration / Lead-time / Malpractice ════════════ */}
            {v2signals.money.length > 0 && (
              <div className="lv2-card">
                <div className="lv2-section-h">
                  <span className="lv2-ic-circle"><DollarSign /></span>
                  <h2>Fees, duration &amp; what it costs</h2>
                </div>
                <div className="lv2-money">
                  {v2signals.money.map((tile, i) => {
                    const Icon =
                      tile.icon === "dollar"
                        ? DollarSign
                        : tile.icon === "clock"
                          ? Clock
                          : tile.icon === "cal"
                            ? Calendar
                            : Shield;
                    return (
                      <div key={i} className="lv2-money-tile">
                        <div className="lv2-ml">
                          <Icon /> {tile.label}
                        </div>
                        <div className="lv2-mv">
                          {tile.value}
                          {tile.small && <small>{tile.small}</small>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════ STEP 3: What's included ════════════ */}
            {v2signals.included.length > 0 && (
              <div className="lv2-card">
                <div className="lv2-section-h">
                  <span className="lv2-ic-circle teal"><Check /></span>
                  <h2>What&apos;s included</h2>
                </div>
                <ul className="lv2-bullets">
                  {v2signals.included.map((item, i) => (
                    <li key={i}>
                      <span className="lv2-check"><Check /></span>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ════════════ STEP 3: Required clerkships ════════════ */}
            {v2signals.clerkships.length > 0 && (
              <div className="lv2-card">
                <div className="lv2-section-h">
                  <span className="lv2-ic-circle"><List /></span>
                  <h2>Required clerkships completed</h2>
                </div>
                <div className="lv2-tags">
                  {v2signals.clerkships.map((c, i) => (
                    <span key={i} className="lv2-tag">
                      <Check />
                      <b>{c}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════ STEP 3: How to apply ════════════ */}
            {v2signals.applySteps.length > 0 && (
              <div className="lv2-card">
                <div className="lv2-section-h">
                  <span className="lv2-ic-circle teal"><ArrowRight /></span>
                  <h2>How to apply</h2>
                </div>
                <ol className="lv2-steps">
                  {v2signals.applySteps.map((step, i) => (
                    <li key={i}>
                      <div>
                        <b>{step.title}</b>
                        <small>{step.detail}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Available specialties (split listing.specialty on commas) */}
            {listing.specialty && (
              <div className="lv2-card">
                <div className="lv2-section-h">
                  <span className="lv2-ic-circle teal"><Stethoscope /></span>
                  <h2>Available specialties</h2>
                </div>
                <div className="lv2-tags">
                  {listing.specialty
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, i) => (
                      <span key={i} className="lv2-tag">
                        <Stethoscope />
                        <b>{s}</b>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Eligibility */}
            {(listing.eligibilitySummary ||
              listing.stepRequirements ||
              listing.ecfmgRequired ||
              listing.graduationYearPref) && (
              <div className="lv2-card lv2-elig">
                <div className="lv2-section-h">
                  <span className="lv2-ic-circle"><Users /></span>
                  <h2>Eligibility requirements</h2>
                </div>
                {listing.eligibilitySummary && <p>{listing.eligibilitySummary}</p>}
                {listing.stepRequirements && (
                  <p><b>USMLE / COMLEX:</b> {listing.stepRequirements}</p>
                )}
                {listing.ecfmgRequired && (
                  <p><b>ECFMG:</b> {listing.ecfmgRequired}</p>
                )}
                {listing.graduationYearPref && (
                  <p><b>Graduation year:</b> {listing.graduationYearPref}</p>
                )}
              </div>
            )}

            {/* Housing */}
            {listing.housingSupport && (
              <div className="lv2-card lv2-elig">
                <div className="lv2-section-h">
                  <span className="lv2-ic-circle"><MapPin /></span>
                  <h2>Housing</h2>
                </div>
                <p>{listing.housingSupport}</p>
              </div>
            )}

            {/* Reviews — preserved V1 component, restyled into V2 card */}
            <div className="lv2-card">
              <div className="lv2-section-h">
                <span className="lv2-ic-circle"><Star /></span>
                <h2>
                  Reviews
                  {listing.reviews.length > 0 && (
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--ink-quiet)",
                        marginLeft: "8px",
                      }}
                    >
                      ({listing.reviews.length})
                    </span>
                  )}
                </h2>
              </div>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "var(--ink-quiet)",
                  margin: "0 0 16px",
                  lineHeight: 1.5,
                }}
              >
                User-submitted feedback, moderated before publishing. Separate
                from the verification badges above (which check source-link
                provenance, not review endorsement).
              </p>

              {avgRating !== null && (
                <div
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        style={{
                          width: "18px",
                          height: "18px",
                          fill: star <= Math.round(avgRating) ? "#fbbf24" : "transparent",
                          color: star <= Math.round(avgRating) ? "#fbbf24" : "var(--line-strong)",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {avgRating.toFixed(1)} out of 5
                  </span>
                </div>
              )}

              {listing.reviews.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {listing.reviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        padding: "14px 16px",
                        background: "var(--paper-soft)",
                        border: "1px solid var(--line-soft)",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Avatar
                            name={review.anonymous ? "Anonymous" : review.user?.name || "User"}
                            size="sm"
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "var(--ink)",
                            }}
                          >
                            {review.anonymous ? "Anonymous" : review.user?.name || "User"}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "1px" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              style={{
                                width: "13px",
                                height: "13px",
                                fill: star <= review.overallRating ? "#fbbf24" : "transparent",
                                color: star <= review.overallRating ? "#fbbf24" : "var(--line-strong)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--ink-soft)",
                            margin: 0,
                            lineHeight: 1.55,
                          }}
                        >
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "var(--ink-quiet)",
                    fontStyle: "italic",
                  }}
                >
                  No reviews yet. Be the first to share your experience.
                </p>
              )}

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--line-soft)",
                }}
              >
                <ReviewForm listingId={listing.id} />
              </div>
            </div>

            {/* Flag broken listing */}
            <div style={{ marginTop: "8px", textAlign: "center" }}>
              <FlagButton listingId={listing.id} />
            </div>
            </div>

            {/* ════════════ V2 RIGHT SIDEBAR — mockup 98 ════════════ */}
            <aside className="lv2-main-aside">
              {/* Verified source CTA */}
              {applyHref && (
                <div className="lv2-cta-card">
                  <div className="lv2-label"><Shield /> Verified source</div>
                  <h3>
                    This is the page {orgShort} uses to accept applicants.
                    Confirm details on the official site before applying.
                  </h3>
                  <a
                    className="lv2-cta-apply"
                    href={applyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open {orgShort} page <ExternalLink />
                  </a>
                  <ListingTrustMetadata
                    className="mt-4"
                    listingId={listing.id}
                    sourceUrl={listing.websiteUrl}
                    verificationStatus={listingVerificationStatus({
                      linkVerified: listing.linkVerified,
                      linkVerificationStatus: listing.linkVerificationStatus,
                      lastVerifiedAt: listing.lastVerifiedAt,
                    })}
                    lastVerifiedAt={listing.lastVerifiedAt}
                    suggestUpdateUrl={`/contact-admin?category=coordinator_correction&subject=${encodeURIComponent(
                      `Correction for: ${listing.title} (id: ${listing.id})`
                    )}`}
                  />
                </div>
              )}

              <div className="mt-3 text-sm">
                <Link
                  href={`/claim/${listing.id}`}
                  className="hover:underline"
                  style={{ color: "var(--teal)" }}
                >
                  Are you the coordinator? Claim this program →
                </Link>
              </div>

              {/* At a glance */}
              <div className="lv2-glance">
                <div className="lv2-gh">
                  <h4><List /> At a glance</h4>
                </div>
                <div className="lv2-row">
                  <span className="lv2-l">Program type</span>
                  <span className="lv2-v">{subtitleType}</span>
                </div>
                {listing.specialty && (
                  <div className="lv2-row">
                    <span className="lv2-l">Specialty</span>
                    <span className="lv2-v" style={{ fontSize: "12px" }}>
                      {listing.specialty}
                    </span>
                  </div>
                )}
                <div className="lv2-row">
                  <span className="lv2-l">Location</span>
                  <span className="lv2-v">
                    {listing.city}, {US_STATES[listing.state] || listing.state}
                  </span>
                </div>
                <div className="lv2-row">
                  <span className="lv2-l">Duration</span>
                  <span className="lv2-v" style={{ fontSize: "12px" }}>{listing.duration}</span>
                </div>
                {audienceLabel && (
                  <div className="lv2-row">
                    <span className="lv2-l">Audience</span>
                    <span className="lv2-v teal">{audienceLabel}</span>
                  </div>
                )}
                <div className="lv2-row">
                  <span className="lv2-l">Application</span>
                  <span className="lv2-v">{listing.applicationMethod}</span>
                </div>
                <div className="lv2-row">
                  <span className="lv2-l">Visa support</span>
                  <span className={`lv2-v ${listing.visaSupport ? "green" : ""}`}>
                    {listing.visaSupport ? "Sponsored" : "Not required"}
                  </span>
                </div>
                <div className="lv2-row">
                  <span className="lv2-l">Cost</span>
                  <span className="lv2-v" style={{ fontSize: "12px" }}>{listing.cost}</span>
                </div>
                {listing.applicationDeadline && (
                  <div className="lv2-row">
                    <span className="lv2-l">Deadline</span>
                    <span className="lv2-v" style={{ fontSize: "12px" }}>{listing.applicationDeadline}</span>
                  </div>
                )}
                <div className="lv2-row">
                  <span className="lv2-l">LOR possible</span>
                  <span className={`lv2-v ${listing.lorPossible ? "green" : "red"}`}>
                    {listing.lorPossible ? "Yes" : "No"}
                  </span>
                </div>
                <div className="lv2-row">
                  <span className="lv2-l">Certificate</span>
                  <span className={`lv2-v ${listing.certificateOffered ? "green" : "red"}`}>
                    {listing.certificateOffered ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* Contact */}
              {(realOrgName || listing.contactEmail) && (
                <div className="lv2-side-card">
                  <h4><Mail /> Contact</h4>
                  {realOrgName && <div className="lv2-name">{realOrgName}</div>}
                  <div className="lv2-sub">
                    {listing.city}, {US_STATES[listing.state] || listing.state}
                  </div>
                  {listing.contactEmail && (
                    <div className="lv2-sub mono">{listing.contactEmail}</div>
                  )}
                  {applyHref && (
                    <a
                      className="lv2-go"
                      href={applyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contact via source page <ArrowRight />
                    </a>
                  )}
                </div>
              )}

              {/* Direct source mono URL */}
              {applyHref && applyHrefDisplay && (
                <div className="lv2-side-card">
                  <h4><Shield /> Direct source</h4>
                  <a
                    className="lv2-src-link"
                    href={applyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{applyHrefDisplay}</span>
                    <ExternalLink />
                  </a>
                </div>
              )}

              {/* Save + Share — preserved V1 components */}
              <div className="lv2-side-card">
                <div style={{ marginBottom: "12px" }}>
                  <SaveButton
                    listingId={listing.id}
                    variant="labeled"
                    stopParentNavigation={false}
                  />
                </div>
                <ShareButtons title={listing.title} />
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}
