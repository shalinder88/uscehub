# P102 Website Ingestion Local Preview Report

schemaVersion: p102-ingestion-report-1
branch: `local/p102-approved-rows-website-ingestion`
parent commit: `90fd1eb` (reviewer workflow complete)
this report HEAD: see git log
production main: `739ab1e` UNCHANGED

## 1. Outcome

| Metric | Required | Result |
|---|---|---:|
| Existing UI audit | required | **delivered** |
| Local data adapter (P102 export → UI shape) | required | **delivered** |
| Sync script (canonical → static snapshot) | required | **delivered** |
| Website-data validator | required | **delivered + wired into p102-validate-all** |
| Preview listing route `/usce/verified-preview` | required | **delivered** (noindex) |
| Preview detail route `/usce/verified-preview/[rowId]` | required | **delivered** (SSG; 13 static paths) |
| Source-quote evidence box component | required | **delivered** |
| Preview card component | required | **delivered** (visually consistent with `<ListingCard>`) |
| Top-50 review instructions | required | **delivered** |
| Next.js build | clean | **clean** (162 / 162 pages compiled; 13 SSG paths for the preview detail route) |
| TypeScript `tsc --noEmit` | clean | **clean** |
| Validator dispatcher | all PASS | **14 / 14 PASS** |
| Lint issues in new files | 0 | **0** (3 introduced + 3 fixed) |
| Routes / components / homepage NOT touched | required | **none touched** |
| Prisma schema / migrations / DB | NOT touched | **not touched** |

## 2. What was built

### Phase B — UI audit

`P102_WEBSITE_INGESTION_AUDIT.md` — documents the existing USCEHub stack (Next.js 16, Prisma, NextAuth), the production routes (`/browse`, `/listing/[id]`, `/observerships/...`), reusable components (`ListingCard`, `ListingTrustMetadata`, `ListingVerificationBadge`, `ListingDisclaimer`, etc.), and the smallest integration path (parallel preview route, no touching of production routes, no schema change).

### Phase C — Local data adapter

- `scripts/p102-sync-approved-rows-to-website.ts` — copies `docs/.../p102/exports/public_safe_opportunity_rows_approved.json` into `src/data/generated/p102-approved-usce.generated.json`. Strips the private T7 `cleanedTextPath` from the public snapshot.
- `src/lib/p102-approved-usce.ts` — SSR-safe adapter library. Exports `getAllApprovedRows()`, `getApprovedRowById()`, `getApprovedRowIds()`, `getSnapshotMetadata()`, type definitions, and label helpers. Includes runtime `isDisplayable()` guard so a hand-edited snapshot can never leak unsafe rows.

### Phase D — Website-data validator

- `scripts/p102-validate-website-approved-usce-data.ts` — independent re-validator that confirms the snapshot's rows satisfy every public-safe display gate (rowId unique, sourceUrl https, sourceQuote ≥ 10 chars and never `NOT_STATED_ON_SOURCE`, sourceHash present, visibilityLane = `PUBLIC_SAFE_USCE`, reviewStatus in allowed set, opportunityType in Tier 1 USCE set, system/school scope → `campusApplicabilityProof` ≥ 30 chars, reviewedAt is ISO date).
- Wired into `scripts/p102-validate-all.ts` as the 14th validator.

### Phase E — Preview routes + components

- `src/app/usce/verified-preview/page.tsx` — listing page. `force-static`. `robots: { index: false, follow: false }`. Renders 13 cards in a 1-2-3 column grid.
- `src/app/usce/verified-preview/[rowId]/page.tsx` — detail page. `generateStaticParams()` emits 13 static paths. Renders source quote evidence box, logistics fields, provenance dl, report-issue mailto link. Returns 404 for any unknown rowId.
- `src/components/listings/p102-source-quote-evidence-box.tsx` — verbatim quote + attribution to source URL + "Verify on official source" external link + last-reviewed date + review status badge + optional `campusApplicabilityProof` section.
- `src/components/listings/p102-preview-listing-card.tsx` — minimal preview card. Visually inspired by `<ListingCard>` but routes to `/usce/verified-preview/[rowId]` (NOT `/listing/[id]`). No save/apply CTAs. No star ratings.

### Phase F — Top-50 review instructions

`P102_TOP50_REVIEW_INSTRUCTIONS.md` — step-by-step guide for the human reviewer including valid vs invalid `campusApplicabilityProof` examples, the per-row workflow, and the rebuild-and-validate cycle that follows each review pass.

## 3. Cumulative cross-sprint state

| Metric | Value |
|---|---:|
| P102 runs (gold + positive-control + Florida + HY) | 35 |
| Total verified model claims | 2491 |
| PUBLIC_SAFE_USCE source claims | 90 |
| Auto-approved opportunity rows (post-dedup) | 13 |
| Reviewer-approved rows | 0 (review pass pending) |
| Total approved export rows | 13 |
| Review queue entries | 925 |
| Future-lane archive | 1472 |
| Hidden-rejected (audit) | 3 |
| Quote-verification failures (strict, all runs) | 0 / 2491 |
| Over-promotion failures | 0 |
| Scope failures | 0 |
| Validator dispatcher | 14 / 14 PASS |
| Gold-set verification | 11 / 11 PASS |
| Unit tests | 155 / 155 PASS |
| Next.js build | clean (162 / 162 pages, includes 14 preview pages) |

## 4. What the preview surface displays

### Listing page `/usce/verified-preview`

- Internal-preview banner ("Internal preview · not indexed").
- Headline: `13 quote-backed opportunities from 9 institutions`.
- Snapshot metadata (synced date, canonical update date).
- Existing `<ListingDisclaimer>` for visual consistency with `/browse`.
- 13 `<P102PreviewListingCard>`s in a 1-2-3 column grid.
- Footer cross-link to `/browse` clarifying production listings are separate.

### Detail page `/usce/verified-preview/[rowId]`

- Internal-preview banner.
- Back link to listing.
- Header: opportunity name + institution + city/state + opportunity type badge + specialty badge.
- `<ListingDisclaimer>`.
- **`<P102SourceQuoteEvidenceBox>`** — verbatim quote in a styled blockquote with attribution to the official source URL, an external "Verify on official source" link, last-reviewed date, review status badge, and the `campusApplicabilityProof` evidence box (when applicable).
- Logistics fields (audience, eligibility, application route, cost, duration, deadline, contact) — each labeled "Not stated on source" when absent rather than guessed.
- Provenance section (source scope, review status, extracted-from run id, source hash).
- Optional warnings list (when the row carries reviewer / framework notes).
- Report-issue button (mailto with pre-filled subject/body referencing the rowId and sourceUrl).

### Copy rules enforced

Used: "Source-linked", "Last reviewed", "Source quote", "Verify on official source", "Report an issue".

Avoided: "Officially verified", "Hospital-approved", "Guaranteed", "Best", "Top-rated", star ratings, fake review language.

## 5. SEO posture

The preview routes carry `robots: { index: false, follow: false, nocache: true }` at both the listing and detail level. The preview is an internal dev surface; production indexing remains driven by `/browse` and the Prisma listing table. No sitemap entry. No canonical override. No homepage link.

## 6. Safety properties preserved

- **No production route touched.** `/browse`, `/listing/[id]`, `/observerships/...` remain exactly as committed at `90fd1eb`.
- **No Prisma schema change.** No migration. No seed import. No DB write.
- **No homepage / SEO / robots / sitemap changes.**
- **Static snapshot strips `cleanedTextPath`** — the private T7 path never enters the website bundle.
- **Two layers of validation**: build-time approved-export validator + post-sync website-data validator. Both pass before `next build` runs.
- **Runtime `isDisplayable()` guard** in the adapter — even if the snapshot is hand-edited to bypass the build-time validators, the adapter refuses to render any row missing sourceUrl / sourceQuote / sourceHash / institutionName / city / state, or with sourceQuote = `NOT_STATED_ON_SOURCE`, or with visibilityLane ≠ `PUBLIC_SAFE_USCE`.
- **Hidden-rejected claims (Northwell Cohen Children's etc.) remain in the audit archive only** — never reach the snapshot.
- **Future-lane (GME / careers / jobs) opportunityType is rejected by all three layers** (approval validator, website-data validator, adapter `isDisplayable`).

## 7. How to test locally

```bash
cd /Users/shelly/usmle-platform

# 1. (Optional) rebuild the canonical approved export if you've edited the
#    review decisions CSV.
npx tsx scripts/p102-build-approved-public-safe-export.ts

# 2. Sync the canonical export into the website snapshot.
npx tsx scripts/p102-sync-approved-rows-to-website.ts

# 3. Validate.
npx tsx scripts/p102-validate-website-approved-usce-data.ts
npx tsx scripts/p102-validate-all.ts

# 4. Build + preview.
npm run build         # confirms 14 SSG pages compile
npm run dev           # then open http://localhost:3000/usce/verified-preview
```

## 8. Files added / modified

### Added
- `docs/.../p102/P102_WEBSITE_INGESTION_AUDIT.md`
- `docs/.../p102/P102_TOP50_REVIEW_INSTRUCTIONS.md`
- `docs/.../p102/P102_WEBSITE_INGESTION_REPORT.md` (this file)
- `scripts/p102-sync-approved-rows-to-website.ts`
- `scripts/p102-validate-website-approved-usce-data.ts`
- `src/data/generated/p102-approved-usce.generated.json`
- `src/lib/p102-approved-usce.ts`
- `src/components/listings/p102-source-quote-evidence-box.tsx`
- `src/components/listings/p102-preview-listing-card.tsx`
- `src/app/usce/verified-preview/page.tsx`
- `src/app/usce/verified-preview/[rowId]/page.tsx`

### Modified
- `scripts/p102-validate-all.ts` — added the website-data validator to the dispatcher.
- `scripts/p102-build-approved-public-safe-export.ts` — moved `readdirSync` import to top-level (lint fix); explicitly `void`ed the unused `institutionId` param (kept for future use).
- `scripts/p102-validate-approved-public-safe-export.ts` — dropped unused `e` param in `catch` (lint fix).

### NOT touched
- `src/app/page.tsx` (homepage)
- `src/app/browse/page.tsx`
- `src/app/listing/[id]/page.tsx`
- `src/app/observerships/**`
- `src/components/listings/listing-card.tsx`
- `src/components/listings/listing-trust-metadata.tsx`
- `src/lib/listing-display.ts`
- `src/lib/prisma.ts`
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `next.config.ts`
- `.vercel/**`

## 9. What remains before deploy

This sprint did NOT touch production. To get the preview rows in front of a real audience, the next sprints need (in order):

1. **Manual top-50 review** (the user, ~3 sittings per the instructions).
2. Re-sync + re-validate + verify the row count grows from 13 → ~25-50.
3. **Local screenshot QA** of the preview surface across desktop + mobile.
4. **Decision point**: keep the rows as a noindex preview, or promote into Prisma.
   - If keep-as-preview: change `robots` to `index: true` on the preview routes, add canonical URLs, add a homepage card linking to it.
   - If promote-to-Prisma: a one-off import script (new sprint) that creates `listing` rows with the new fields (`sourceQuote`, `sourceScope`, `campusApplicabilityProof`, `extractedFromRunId`, `claimIds`). This needs a Prisma migration — separate user approval gate.
5. **Then PR / deploy** — under your explicit approval.

## 10. Exact next recommendation

**A. Manually review the top 50** (user, ~3 sittings, ≥10 approvals target). Use `P102_TOP50_REVIEW_INSTRUCTIONS.md` as the guide.

After the review pass, the preview corpus grows from 13 to ~25-50 rows. Then **B. Local screenshot QA** of the preview surface, then **C. Decision: noindex preview or Prisma promotion**.

NOT recommended:
- D. Prepare PR / deploy — premature without manual review pass + screenshot QA.
- E. Resume extraction — grows the review queue without expanding the launch corpus.

## 11. Out-of-scope reminders

- No push.
- No deploy.
- No PR / merge to main.
- No DB / Prisma / migrations / seed.
- No homepage / SEO / sitemap / robots changes.
- No public import.
- No auto-publish.
- No fake approvals.

Branch: `local/p102-approved-rows-website-ingestion`. Local commits only. Production main `739ab1e` UNCHANGED.

---

## P102 Website Ingestion Local Preview Report — TL;DR

The 13 quote-backed launch-ready rows from P102 now render in the existing USCEHub UI shell at `/usce/verified-preview` (noindex) — without touching any production route or the Prisma schema. The source quote evidence box surfaces the verbatim official-source quote with a "Verify on official source" external link. Next.js build is clean (162 / 162 pages compiled, 14 SSG paths for the preview). 14 / 14 validators PASS. Production main `739ab1e` UNCHANGED.

**Next: manual top-50 review** to grow the corpus from 13 to ~25-50, then local screenshot QA, then decide noindex preview vs Prisma promotion.
