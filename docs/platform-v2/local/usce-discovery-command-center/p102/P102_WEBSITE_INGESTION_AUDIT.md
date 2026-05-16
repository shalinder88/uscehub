# P102 Website Ingestion Audit

schemaVersion: p102-ingestion-audit-1
branch: `local/p102-approved-rows-website-ingestion`
parent commit: `90fd1eb` (reviewer workflow complete)
production main: `739ab1e` UNCHANGED

## 1. What already exists on USCEHub

USCEHub.com is a Next.js 16 + Prisma + NextAuth app. The existing site already has the right surfaces — we do NOT need to redesign anything:

### Routes (existing, do not touch)
- `/browse` — main USCE listing surface. Reads from Prisma `listing` table with `where: { status: "APPROVED" }`. Renders `<ListingCard>`s with filters.
- `/listing/[id]` — listing detail page. 602 lines. Reads from Prisma by listing id. Renders full trust metadata, source URL, share buttons, review form, flag button.
- `/observerships` — observerships-by-state index, reads listing counts from Prisma.
- `/observerships/[state]` — per-state listings.
- `/observerships/specialty` — by-specialty listings.
- `/clerkships/maine`, `/clerkships/pilot` — pilot routes.

### Components (existing, reusable)
- `src/components/listings/listing-card.tsx` — the canonical card. Expects `listing` prop with `id, title, listingType, city, state, specialty, duration, cost, shortDescription, certificateOffered, lorPossible, visaSupport, linkVerified, linkVerificationStatus, lastVerifiedAt, reviews`.
- `src/components/listings/listing-verification-badge.tsx` — verification status pill.
- `src/components/listings/listing-trust-metadata.tsx` — full trust block (badge + last-verified + report-broken-link).
- `src/components/listings/listing-disclaimer.tsx` — disclaimer line.
- `src/components/listings/listing-reverification-notice.tsx`
- `src/components/listings/report-broken-link-button.tsx`
- `src/components/listings/trust-badges.tsx`
- `src/components/listings/save-button.tsx`
- `src/components/listings/flag-button.tsx`
- `src/components/listings/listing-filters.tsx`

### Lib (existing, reusable)
- `src/lib/listing-display.ts` — composes verification + CTA decisions. Has `listingDisplay()` + `listingVerificationStatus()` SSR-safe pure functions.
- `src/lib/listing-cta.ts` — conservative CTA decision rules.
- `src/lib/prisma.ts` — Prisma client.

### Data source today
The production listings come from Prisma. Schema field `listing.linkVerificationStatus` enum: `VERIFIED | REVERIFYING | NEEDS_MANUAL_REVIEW | SOURCE_DEAD | PROGRAM_CLOSED | NO_OFFICIAL_SOURCE | UNKNOWN`. Last-verified date is `listing.lastVerifiedAt`.

## 2. What the existing UI is missing (for source-quote display)

The card and detail page show **verification status** (verified / reverifying / needs-review / unverified) but they do NOT currently display a **verbatim source quote** as evidence on the public surface. The P102 row contract carries `sourceQuote` as a first-class field — we should surface it on the preview detail page in an evidence box, as the trust differentiator vs every IMG-info site that copies content.

Other fields the current UI does not expose that P102 carries:
- `campusApplicabilityProof` (reviewer-supplied evidence for system/school scope)
- `sourceScope` (INSTITUTION_SPECIFIC / CAMPUS_SPECIFIC / DEPARTMENT_LEVEL / HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL)
- `extractedFromRunId` (audit trail to the P102 run)
- `claimIds` (links into the underlying verified-claim ledgers)
- `humanReviewStatus` (AUTO_PUBLIC_SAFE vs REVIEWER_APPROVED)

These all belong in the detail-page evidence section — not on the card.

## 3. Smallest integration path (chosen)

Build a **parallel preview** at `/usce/verified-preview` that:

1. Does NOT touch `/browse`, `/listing/[id]`, `/observerships`, or any production route.
2. Does NOT touch the Prisma schema.
3. Does NOT import to the DB.
4. Reads from a local generated JSON snapshot of the P102 approved export.
5. Reuses the EXISTING trust components (`ListingVerificationBadge`, `ListingTrustMetadata`, `ListingDisclaimer`, `ReportBrokenLinkButton`) wherever possible for visual consistency.
6. Has its OWN card component (`P102PreviewListingCard`) that wraps the visual style of `ListingCard` but routes to `/usce/verified-preview/[rowId]` instead of `/listing/[id]`.
7. Detail page (`/usce/verified-preview/[rowId]`) reads the local JSON snapshot by `rowId` and renders the source quote evidence box prominently.

This means the production site is exactly as it is today. The preview is a developer-only route that lets us evaluate the data + display before promoting anything into Prisma. When the preview proves out, the next sprint can do a one-off Prisma import (separate decision).

### Files to ADD
- `src/data/generated/p102-approved-usce.generated.json` — static snapshot of `docs/.../p102/exports/public_safe_opportunity_rows_approved.json` (copied at build time so Next.js can statically import).
- `src/lib/p102-approved-usce.ts` — adapter functions: `getAllApprovedRows()`, `getApprovedRowById(rowId)`, type definitions.
- `src/app/usce/verified-preview/page.tsx` — preview listing page.
- `src/app/usce/verified-preview/[rowId]/page.tsx` — preview detail page.
- `src/components/listings/p102-preview-listing-card.tsx` — preview card that links to the preview route.
- `src/components/listings/p102-source-quote-evidence-box.tsx` — verbatim source quote evidence box (new component; rendered only on the preview detail page).
- `scripts/p102-sync-approved-rows-to-website.ts` — copies the canonical export into the static snapshot location. Run after every reviewer pass.

### Files to NOT TOUCH
- `src/app/listing/[id]/page.tsx`
- `src/app/browse/page.tsx`
- `src/app/observerships/**`
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/components/listings/listing-card.tsx`
- `src/components/listings/listing-trust-metadata.tsx`
- `src/lib/listing-display.ts`
- `src/lib/prisma.ts`
- `next.config.ts`
- `.vercel/**`
- Homepage (`src/app/page.tsx`).

## 4. What the preview will surface (per detail page)

Every preview detail page shows, in display order:

1. **Header** — institution name, city, state, opportunity type badge, audience badge.
2. **Opportunity description** — `opportunityName`, `opportunityType` mapped to human label.
3. **Logistics block** (only when stated) — `audience`, `eligibility`, `specialty`, `applicationRoute`, `cost`, `duration`, `deadline`, `contact` (name / title / email / phone).
4. **Source quote evidence box** — verbatim `sourceQuote` rendered as a quote block with attribution to `sourceUrl` and a "Verify on official source" external link.
5. **Trust metadata** — reuses `<ListingTrustMetadata>` with `verificationStatus: "verified"` (because P102 rows are always quote-verified) and `lastVerifiedAt: row.lastReviewed`.
6. **Scope + provenance** (small print) — `sourceScope`, `humanReviewStatus`, `extractedFromRunId`, link to underlying P102 run folder.
7. **Report-issue button** — reuses `<ReportBrokenLinkButton>` if compatible, else a simple link.

Disallowed copy on the preview page:
- "Officially verified" / "Hospital-approved" / "Guaranteed" / "Best" / "Top-rated"
- Any star rating (these are not user-reviewed yet)
- Any apply/save/CTA that mutates DB

Allowed copy:
- "Source-linked"
- "Last reviewed"
- "Source quote"
- "Verify on official source"
- "Report an issue"

## 5. Build-time vs runtime data

The adapter reads from a **static JSON snapshot** (`src/data/generated/p102-approved-usce.generated.json`). The reasons:

- Next.js builds (`next build`) statically analyze imports; importing from outside `src/` is fragile in App Router. A copy into `src/data/generated/` is the standard pattern.
- The canonical source of truth remains `docs/.../p102/exports/public_safe_opportunity_rows_approved.json` — the snapshot is a derived artifact, regenerated by `scripts/p102-sync-approved-rows-to-website.ts`.
- The sync script is idempotent: it copies the file, normalizes any path differences, and writes a `generatedAt` timestamp into the snapshot.
- No DB write. No Prisma. No public import.

## 6. Out-of-scope reminders

- No DB / Prisma / migrations / seed.
- No homepage / SEO / sitemap / robots / metadata changes.
- No public import.
- No auto-publish.
- No deploy / push / PR.
- No GME / Tier 2 / Tier 3 in the preview listing.
- No system-scope row without `campusApplicabilityProof`.
- No row without verified source quote.
- No row without source URL.

## 7. Defer to next sprints

- Prisma migration that adds `sourceQuote` + `sourceScope` + `campusApplicabilityProof` + `extractedFromRunId` + `claimIds` columns to `listing` table.
- One-time import script that promotes the preview rows into Prisma after a separate user approval gate.
- Homepage card that surfaces a sample of preview rows.
- Search / filter integration on the preview route (preview list is small enough for now to render unfiltered).

Branch: `local/p102-approved-rows-website-ingestion`. Local commits only. Production main `739ab1e` UNCHANGED.
