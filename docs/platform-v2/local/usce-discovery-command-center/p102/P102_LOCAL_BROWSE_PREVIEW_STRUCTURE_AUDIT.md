# P102 Local Browse Preview — Structure Audit

Generated: 2026-05-17
Branch: `local/p102-local-browse-preview-from-display-eligibility`
Parent: `1467655`

**No mutation of production `/browse` in this sprint. This audit informs Phase C — building a parallel local preview at `/usce/verified-preview/browse`.**

---

## 1. Where current `/browse` gets data

`src/app/browse/page.tsx` is a `force-dynamic` server component that queries Prisma directly:

```ts
const listings = await prisma.listing.findMany({
  where: { AND: conditions },   // status APPROVED + category/type/audience/state/sort/free/visa/verified filters
  orderBy: [
    { lastVerifiedAt: { sort: "desc", nulls: "last" } },
    { linkVerified: "desc" },
    { createdAt: "desc" },
  ],
  include: { reviews: { where: { moderationStatus: "APPROVED" }, select: { overallRating: true } } },
});
```

Sources:
- `prisma.listing` (Prisma DB rows)
- Seeded from `usmle-observerships/data.js` via `prisma/seed.ts`, with URL overrides from `prisma/verified-links.ts` and skips from `prisma/listings-hidelist.ts`.
- The DB does NOT yet capture the 11-state classification, the display-eligibility bucket, or the `specialtyLimited` field.

For the preview, **we will bypass the DB entirely** and read directly from the display-eligibility JSON exports via `src/lib/p102-display-eligible-listings.ts`.

## 2. Card and detail components

| Component | Path |
|---|---|
| `ListingCard` | `src/components/listings/listing-card.tsx` |
| `ListingFilters` | `src/components/listings/listing-filters.tsx` |
| `ListingVerificationBadge` | `src/components/listings/listing-verification-badge.tsx` |
| `ListingDisclaimer` | `src/components/listings/listing-disclaimer.tsx` |
| `TrustBadges` | `src/components/listings/trust-badges.tsx` |
| `ListingTrustMetadata` | `src/components/listings/listing-trust-metadata.tsx` |
| `P102PreviewListingCard` | `src/components/listings/p102-preview-listing-card.tsx` (sibling preview card; routes to `/usce/verified-preview/[rowId]`) |

Detail route: `src/app/listing/[id]/page.tsx` (Prisma-backed). Existing `/usce/verified-preview` (snapshot-backed) has its own `[rowId]` detail.

For the new browse preview we will **not** mutate `ListingCard` or any production component. We'll create a small dedicated card under `src/app/usce/verified-preview/browse/` so the preview surface evolves independently.

## 3. Required fields on the preview card

Pulled from the display-eligibility export's `DisplayEligibleRow` shape:

| Field | Source | Notes |
|---|---|---|
| `programName` | classifier (= data.js name) | Title |
| `institution` | data.js | Often equals programName; suppress when so |
| `state` | data.js | Two-letter abbreviation; `MULTI` for multi-site |
| `finalUrl` | verified-links.ts override or data.js link | "Verify on official source" link |
| `badge` | classifier → DIRECT/REORIENTED/PROTECTED/RESEARCH/HOLD/HIDDEN | Trust badge |
| `classification` | classifier | Hover/tooltip detail |
| `subType` | classifier (observership / visiting-student-elective / etc.) | Type label |
| `audience` | classifier (e.g. `international-medical-student`) | Audience pill |
| `evidenceQuote` | verified-links.ts note | Source-quote text |
| `provenanceNote` | verified-links.ts note | Long-form detail |
| `verifiedFlag` | verified-links.ts `verified` boolean | |
| `specialtyLimited` | verified-links.ts (optional) | Render SPECIALTY badge if present |

Missing fields the export doesn't carry — must render as honest sentinels per `P102_BROWSE_LISTING_INTEGRATION_PLAN.md` §6:

- City (often unknown for the data.js row level) → "Verify on official page"
- Cost → "Not listed on source"
- Duration → "Not clearly listed — check official page"
- Visa → "Check official source"
- Application method → "Verify on official page"
- Eligibility → "Verify on official page"

## 4. Source / verification surfaces

Existing trust components are tightly coupled to the DB row shape (`linkVerificationStatus` enum, `lastVerifiedAt` date). We'll skip them for the preview and use simple inline badges driven by the classifier's `badge` value:

- `DIRECT` → emerald "Direct official source"
- `REORIENTED` → sky "Reoriented to official source"
- `PROTECTED` → amber "Live in browser (bot-protected)"
- `RESEARCH` → violet "Research / postdoctoral pathway"
- `SPECIALTY` (when `specialtyLimited` present) → fuchsia "Specialty: <value>"

Copy rules — use:
- Source-linked
- Direct official source / Reoriented to official source
- Last reviewed locally on <date>
- Verify on official source
- Report issue

Do not use:
- hospital-approved
- official database
- guaranteed / best / top-rated
- verified by hospital
- fake review language

## 5. Filters

Production `/browse` filters:
- search (`q`)
- category (clinical | research | volunteer)
- type (legacy)
- audience
- state
- sort (cost-low | cost-high | most-reviewed | default fresh-first)
- free (boolean)
- visa (boolean)
- verified (boolean)

For the preview, we'll surface a smaller, more honest set tied to what the truth layer actually knows:
- search (institution / program / state)
- lane (clinical | research)
- subType (observership | visiting-student-elective | visiting-student-clerkship | sub-internship | externship | international-visiting-student | multi-rotation | research-postdoc)
- state
- source badge (DIRECT | REORIENTED | PROTECTED)
- specialty-limited (toggle)

No "free" / "verified" / "visa" filters in the preview because the underlying export doesn't capture those signals truthfully yet.

## 6. Route shape

Production `/browse` is a single page with query-param filters. Detail is `/listing/[id]`.

The preview will mirror that with noindex:
- `/usce/verified-preview/browse` (list)
- `/usce/verified-preview/browse/[slug]` (detail; slug = URL-safe kebab of programName + state)

Both pages will set:
```ts
robots: { index: false, follow: false, nocache: true }
```

No mutation of `/browse` or `/listing/[id]`.

## 7. What can be reused safely

- `src/lib/p102-display-eligible-listings.ts` — adapter shipped in the prior sprint
- Existing dark-mode-safe Tailwind tokens used on `/usce/verified-preview/display-readiness`
- The same `BADGE_STYLES` palette from `display-readiness/page.tsx` (will be reused inline; no shared component yet — wait for the third duplication)

## 8. What must NOT be touched yet

- `src/app/browse/page.tsx`
- `src/app/listing/[id]/page.tsx`
- `src/components/listings/listing-card.tsx`
- `src/components/listings/listing-filters.tsx`
- `src/components/listings/listing-verification-badge.tsx`
- Homepage, sitemap, robots, canonical URLs, JSON-LD, OpenGraph metadata
- `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/verified-links.ts` (already finalized in prior commit), `prisma/listings-hidelist.ts` (same)
- `usmle-observerships/data.js` (sibling repo, read-only)

The preview is purely additive — new files under `src/app/usce/verified-preview/browse/`.
