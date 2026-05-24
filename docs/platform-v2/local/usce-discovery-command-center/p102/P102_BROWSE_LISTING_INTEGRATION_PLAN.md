# P102 Browse / Listing Integration Plan

Generated: 2026-05-17
Branch: `local/p102-display-readiness-visual-qa`
Parent: `38f9802` (display-readiness reconciliation)

**Plan only. No production /browse mutation, no schema migration, no
seed run, no DB mutation in this sprint.**

---

## 1. Where current `/browse` data comes from

`src/app/browse/page.tsx` is a `force-dynamic` server component that
queries Prisma directly:

```ts
import { prisma } from "@/lib/prisma";
const conditions: any[] = [{ status: "APPROVED" }];
// + search / type / category / audience / state / sort / free / visa / verified filters
const listings = await prisma.listing.findMany({
  where: { AND: conditions },
  orderBy,
  take: 50,
});
```

Categories filter through `CATEGORY_TYPES`:

```ts
const CATEGORY_TYPES: Record<string, string[]> = {
  clinical: ["OBSERVERSHIP", "EXTERNSHIP", "ELECTIVE"],
  research: ["RESEARCH", "POSTDOC"],
  volunteer: ["VOLUNTEER"],
};
```

So `/browse?category=clinical` already separates clinical from research
at the query layer. Good — the model has the right primitives, it just
hasn't been wired to the link-truth campaign yet.

---

## 2. Where listing detail data comes from

`src/app/listing/[id]/page.tsx` reads a single row from Prisma:

```ts
const listing = await prisma.listing.findUnique({ where: { id } });
```

Renders title, organization, location, duration, cost, application
method, `websiteUrl` (the verified link from `VERIFIED_LINKS` override
during seed), trust badges, reviews, save/flag buttons.

---

## 3. How `verified-links.ts` currently affects seed/data

`prisma/seed.ts` lines 240–275 do the wiring:

```ts
if (isHidden(program.name)) { hidden++; continue; }   // skip hide-list entirely
const verifiedEntry = VERIFIED_LINKS[program.name];   // exact key match
const finalUrl = verifiedEntry ? verifiedEntry.url : program.link;
const isVerified = verifiedEntry ? verifiedEntry.verified : false;
await prisma.listing.create({
  data: {
    websiteUrl: finalUrl,
    linkVerified: isVerified,
    // ...
  },
});
```

What this CURRENTLY captures:
- `websiteUrl` — the verified institutional URL after my one-by-one
  reorientation work
- `linkVerified` — boolean from `verified-links.ts`
- Hide-list excludes confirmed-dead / broker rows from the table
  entirely

What this DOES NOT yet capture:
- The 11-state classification (`DIRECT_TRUE_USCE_LINK`,
  `MOVED_REORIENTED_TO_TRUE_USCE_LINK`, `PROTECTED_BROWSER_REQUIRED`,
  etc.) — the seed has only the boolean
- The display-readiness bucket (`clinical` / `research` / `outreach
  hold` / `manual browser` / `research reverify`)
- The badge (`DIRECT` / `REORIENTED` / `PROTECTED` / `RESEARCH` /
  `HOLD`)
- The evidence quote that backs the verification
- The held-but-not-hidden rows (outreach + research-reverify +
  manual-browser): these currently seed into the table as plain
  `linkVerified=false` rows and appear in `/browse` indistinguishable
  from "we never tried to verify this"
- `linkVerificationStatus` enum (`VERIFIED` / `REVERIFYING` /
  `NEEDS_MANUAL_REVIEW` / etc.) is in the Prisma schema but the seed
  doesn't populate it

---

## 4. How the display-eligibility export should map into browse / listing

Three integration shapes, smallest → largest. The plan picks the
smallest that meets the goal.

### Shape A — read-side display-readiness filter (smallest)

Browse page consults the display-eligibility export at render time and
filters Prisma rows down to the 170 clinical + 9 research display-
eligible programs. Listing detail page does the same per-row.

- **Mutation surface:** read-only adapter; no DB writes; no schema
  changes.
- **Where the adapter lives:** `src/lib/p102-display-eligible-
  listings.ts` (new). Loads the 7 JSON exports at module init
  (filesystem read, server-only).
- **How browse uses it:** added `AND` condition
  `{ title: { in: displayEligibleClinicalNames } }` (or the research
  set when `category=research`). Existing filters (state, specialty,
  audience, free, visa) stack normally.
- **How listing detail uses it:** check the loaded title against the
  hold + hidden sets; if held / hidden, redirect to `notFound()` or
  show a held-status page.
- **What the page renders new:** a small badge near the listing title
  reflecting `DIRECT` / `REORIENTED` / `PROTECTED`. Color tokens match
  the existing `<TrustBadges>` palette.
- **Risk:** very low. Nothing in the DB changes. If the export is
  stale, the worst case is some new programs (added between snapshot
  and request) don't appear in browse until the next export rebuild.

### Shape B — write classification back into the Prisma row at seed time

Modify `prisma/seed.ts` so each `listing.create({ data })` call also
sets `linkVerificationStatus`, `sourceUrl`, and a new
`displayEligibilityBucket` column. Reverts to a single source-of-truth
inside the DB.

- **Mutation surface:** schema migration adds 1–2 columns; seed
  changes; production seed re-run required to apply.
- **Schema:** add `displayEligibilityBucket String?` to Listing,
  populated from the export. Optionally backfill
  `linkVerificationStatus` from the classification.
- **Where the adapter lives:** seed.ts directly reads the export.
- **How browse uses it:** Prisma `where` condition on
  `displayEligibilityBucket` enum. Cleaner queries, no module-init
  filesystem read.
- **Risk:** medium. Schema migration + seed re-run, both of which
  the current sprint is explicitly forbidden from doing. Defer.

### Shape C — extend `/usce/verified-preview` to serve the 170 + 9 rows directly

Replace or augment the existing snapshot (`p102-approved-usce.
generated.json`) with the new display-eligibility export so the
existing preview surface shows the full corpus.

- **Mutation surface:** static snapshot regeneration; no schema, no
  seed, no DB.
- **Where it goes:** new script `scripts/p102-build-approved-snapshot-
  from-display-eligibility.ts` that maps the display-eligibility row
  shape into the `P102ApprovedRow` snapshot shape and writes
  `src/data/generated/p102-approved-usce.generated.json`.
- **Risk:** low–medium. The snapshot is used by `/usce/verified-
  preview` (already noindex), so the regression surface is limited
  to internal preview. The existing `p102-preview-rows.ts` adapter
  expects three input sources (AUTO_REVIEWED / EXACT_SEED /
  INTELLIGENT_GATE) — would add a fourth, `DISPLAY_ELIGIBLE`, and
  let the existing precedence logic merge them.

**Recommendation: Shape A first.** It's reversible, requires no schema
change, no seed run, no DB mutation, and gives the live `/browse` page
the exact behavior the operator wants — only display the 170 verified-
true rows in the clinical lane and the 9 research-valid rows in the
research lane. Shape B and Shape C are valid follow-ups once Shape A
has been QA'd locally.

---

## 5. What fields are safe to show on the browse / listing card

Fields the display-eligibility export already provides:

| Field | Source | Safe to show |
|---|---|---|
| `programName` (== Listing.title) | data.js exact key | yes |
| `institution` | data.js | yes |
| `state` | data.js | yes |
| `finalUrl` | verified-links.ts | yes — this is the verified URL |
| `classification` | classifier | yes — show as badge |
| `badge` (DIRECT/REORIENTED/PROTECTED) | classifier | yes |
| `subType` (observership / visiting-student-elective / sub-i / etc.) | classifier | yes |
| `audience` | classifier | yes |
| `evidenceQuote` | verified-links.ts notes / WebFetch evidence | yes — short |
| `provenanceNote` | verified-links.ts notes | yes — on detail page only |

Fields from data.js that we can show with caveats:
- `program.city` — yes
- `program.specialties` — yes
- `program.duration` — yes IF present and unambiguous; otherwise show
  "Not clearly listed"
- `program.cost` / `program.feeAmount` — yes IF present from the
  official source; otherwise "Not listed on source"
- `program.visa` — yes IF present; otherwise "Check official source"
- `program.requirements` — yes

---

## 6. What fields must display as "Not listed on source"

If the canonical visiting-students page didn't disclose a value, the
display must NOT invent one. Recommended fallbacks:

| Field | If missing | Fallback copy |
|---|---|---|
| Cost / Fee | data.js empty or "TBD" | "Not listed on source" |
| Duration | data.js empty or single ambiguous value | "Not clearly listed — check official page" |
| Visa support | data.js empty | "Check official source" |
| Application method | data.js empty | "Verify on official page" |
| Eligibility | data.js empty | "Verify on official page" |
| Deadline | data.js empty | "Not listed on source" |
| Application URL | not in verified-links.ts | omit (use `finalUrl` only) |

This honest-when-unknown pattern is already partially used in the
existing `ListingDisclaimer` component. The adapter should set
explicit "not listed" sentinels rather than empty strings so the UI
can render the fallback copy consistently.

---

## 7. How to keep research separate

The display-eligibility export already separates them — `display_
eligible_clinical_usce.json` (170 rows) and `display_eligible_
research.json` (9 rows). The browse page can either:

- (a) Use the existing `category=clinical|research|volunteer` filter
  and additionally filter `title IN (clinicalNames)` for clinical and
  `title IN (researchNames)` for research, OR
- (b) Add a new top-level lane `/browse?lane=research` that always
  filters to the 9 research rows, separate from the clinical
  category.

**Recommendation: (a).** It reuses existing UI affordances and the
existing CATEGORY_TYPES filter. The display-eligibility filter just
narrows what's shown within each category.

The browse hero copy should make the separation explicit:
- "Verified clinical USCE pathways (170)" — the clinical lane
- "Research and postdoctoral pathways (9)" — the research lane
- No mixing in the same default view

Listing detail page for a research row should display a clear
"Research / Postdoctoral" badge and copy like "This is a research
pathway, not a clinical USCE rotation."

---

## 8. How to exclude hidden / holds

The adapter must enforce the buckets as hard sets:

```ts
const CLINICAL = new Set(clinicalRows.map(r => r.programName));
const RESEARCH = new Set(researchRows.map(r => r.programName));
const HIDDEN = new Set([...hiddenRows, ...archiveRows].map(r => r.programName));
const HOLD = new Set([...outreachRows, ...researchReverifyRows, ...manualBrowserRows].map(r => r.programName));
```

Browse must:
- For `category=clinical`: filter `title IN CLINICAL` AND `title NOT IN HIDDEN` AND `title NOT IN HOLD`.
- For `category=research`: filter `title IN RESEARCH` AND `title NOT IN HIDDEN` AND `title NOT IN HOLD`.
- For no category (all): union of CLINICAL ∪ RESEARCH, with the same exclusions.

Listing detail must:
- If the requested `id` resolves to a `title` in HIDDEN: 404.
- If in HOLD: render a "This program is currently held for verification" status page (not a full listing), with a link back to browse. Out-of-scope for now — easier first step is to 404 these too.

---

## 9. Whether schema change is required later

Not for Shape A. The adapter is read-side only — it does not need new
columns.

A future Shape B integration would add:
- `displayEligibilityBucket String?` to Listing (enum:
  `CLINICAL_USCE` / `RESEARCH` / `OUTREACH_HOLD` / `RESEARCH_REVERIFY` /
  `MANUAL_BROWSER` / `HIDDEN` / `ARCHIVE_NEG_INFO`)
- `sourceClassification String?` to Listing (the badge value: DIRECT /
  REORIENTED / PROTECTED / RESEARCH / HOLD / HIDDEN)
- Populate `linkVerificationStatus` from the classification at seed
  time (e.g. DIRECT → `VERIFIED`, PROTECTED → `VERIFIED`,
  BORDERLINE/BROKEN → `NEEDS_MANUAL_REVIEW`, HIDDEN → `SOURCE_DEAD`)

Defer until Shape A is QA'd.

---

## 10. How to do a no-DB local preview first

Build the read-side adapter (`src/lib/p102-display-eligible-listings.
ts`) and a new local-only browse preview route at
`/usce/verified-preview/browse` (sibling to the existing display-
readiness route) that:

1. Loads the 7 display-eligibility exports.
2. Renders the existing `<ListingCard>` UI (or a P102 variant) for each
   clinical row.
3. Has the same filter chips as production `/browse` but operates over
   the static export instead of Prisma.
4. Has a separate "Research" lane that renders the 9 research rows.

This gives the operator a clean preview to QA before touching
production `/browse` at all.

---

## 11. What NOT to touch

Hard guard rails for the integration sprint:

- **Do not modify** `src/app/browse/page.tsx`, `src/app/listing/[id]/
  page.tsx`, `src/components/listings/listing-card.tsx` until the
  local preview at `/usce/verified-preview/browse` has been QA'd and
  approved.
- **Do not run** `prisma db push`, `prisma migrate dev`, `prisma
  migrate deploy`, or seed.
- **Do not add** new columns to the Listing model in this sprint.
- **Do not change** `data.js` in the sibling repo.
- **Do not change** the homepage, SEO metadata, sitemap, robots, or
  canonical URLs.
- **Do not promote** the new noindex preview routes to production
  URLs.
- **Do not introduce** marketing copy ("official database", "hospital-
  approved", "guaranteed", etc.).
- **Do not push, deploy, or open a PR.**

---

## Summary

The cleanest sequence is:

1. **Shape A (this sprint's Phase E):** build the read-side adapter
   `src/lib/p102-display-eligible-listings.ts` and (optionally) a
   local-only `/usce/verified-preview/browse` route.
2. **Operator QA:** open `/usce/verified-preview/browse` and confirm
   only the 170 + 9 rows render, with correct badges and audience.
3. **Operator decides** whether to (i) just wire production `/browse`
   to consult the adapter at read time (still no schema change), or
   (ii) commit to Shape B and add `displayEligibilityBucket` to the
   schema with a migration and seed re-run.
4. **Discovery and outreach** continue in parallel: phone outreach for
   the 3 borderline rows, operator-supplied URLs for the 7 research-
   reverify rows, in-browser check for the 3 manual-browser rows.
