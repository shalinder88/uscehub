# P102 Public-Safe Opportunity Row Contract

schemaVersion: p102-row-contract-1
branch: `local/p102-high-yield-usce-and-ingestion-contract`
parent commit: `8468d53`
production main: `739ab1e` UNCHANGED

## 1. Purpose

This contract defines how **source claims** (per-quote, per-source-URL records emitted by the deep extraction pipeline) become **opportunity rows** (per-program records that downstream display surfaces can render). It is the bridge between extraction and ingestion.

A source claim answers: *"What does this verbatim quote on this URL say?"*
An opportunity row answers: *"What program does this institution publicly offer?"*

Many source claims (offer, audience, pathway, eligibility, application route, contact name, contact email, contact phone, fee, duration) collapse into one opportunity row.

## 2. The four exports

The row builder produces four local-only JSON files under `docs/platform-v2/local/usce-discovery-command-center/p102/exports/`:

| Export | Visibility lane | Purpose |
|---|---|---|
| `public_safe_opportunity_rows.json` | `PUBLIC_SAFE_USCE` | Website-ready rows with verified quote + source URL. **Public-display candidates after one-time human review.** |
| `public_safe_review_queue.json` | `CAUTION_SAFE_INTERNAL_REVIEW` + `HUMAN_REVIEW_REQUIRED` | Tier 1 candidates needing one-time human check before public-safe promotion. **Internal review only.** |
| `future_lane_archive.json` | `FUTURE_LANE_ONLY` | Tier 2 (residency, fellowship) + Tier 3 (careers, jobs, visa) source claims. **Internal future archive — never published as USCE.** |
| `hidden_rejected_archive.json` | `HIDDEN_REJECTED` | Model A3 actively rejected (cross-campus mis-attribution, scope mismatch, etc.). **Audit trail only — never published.** |

All four are local JSON. **None are imported to the database. None are rendered by the website surface in this sprint.** A future minimal-ingestion sprint will add a display surface that reads `public_safe_opportunity_rows.json`.

## 3. `publicSafeOpportunityRow` shape

```typescript
interface PublicSafeOpportunityRow {
  // Identity
  rowId: string;                          // hash of (institutionId + opportunityName + sourceUrl)
  institutionId: string;                  // canonical institution id
  institutionName: string;                // canonical name (e.g., "Hospital for Special Surgery")
  parentSystem: string | null;            // from inferIdentity (e.g., "Northwell Health" or null)
  campus: string | null;                  // campus differentiator if known (e.g., "Memorial Regional Hollywood")
  city: string;
  state: string;                          // 2-letter state code

  // Opportunity
  opportunityName: string;                // e.g., "Bone Marrow Transplant Elective" / "Academic Visitor Program" / "International Visiting Medical Students"
  opportunityType: 'OBSERVERSHIP' | 'VISITING_MEDICAL_STUDENT' | 'CLINICAL_ELECTIVE' | 'SUB_INTERNSHIP' | 'AWAY_ROTATION' | 'INTERNATIONAL_VISITING_STUDENT' | 'RESEARCH_OPPORTUNITY' | 'EXTERNSHIP';
  audience: string | null;                // e.g., "LCME/AOA US 4th-year medical students" / "International medical students with B-1/B-2 visa" / "IMG physicians"
  eligibility: string | null;             // e.g., "Final year of training, completed core clerkships"
  specialty: string | null;               // e.g., "Otolaryngology" / "Bone Marrow Transplant" / "General"

  // Logistics (all optional — quote-backed when present)
  applicationRoute: string | null;        // e.g., "VSLO" / "SlideRoom" / "Paper application via GME office"
  cost: string | null;                    // verbatim from source: "$300 application fee + $5200 per 4-week elective"
  duration: string | null;                // verbatim: "4 weeks" / "2-4 weeks" / "Up to 8 weeks"
  deadline: string | null;                // verbatim: "Rolling" / "March 1 for Fall" / null if NOT_STATED
  contact: {
    name: string | null;
    title: string | null;
    email: string | null;
    phone: string | null;
  } | null;

  // Source provenance (REQUIRED for any public-safe row)
  sourceUrl: string;                      // primary canonical source URL
  sourceQuote: string;                    // verbatim quote that supports the offer (NEVER NOT_STATED)
  sourceHash: string;                     // sha256 of the source URL's cleaned text
  cleanedTextPath: string;                // canonical T7 path
  sourceScope: 'INSTITUTION_SPECIFIC' | 'CAMPUS_SPECIFIC' | 'DEPARTMENT_LEVEL';
  campusApplicabilityProof: string | null; // when scope is system/school but quote names the campus

  // Provenance + audit
  lastReviewed: string;                   // ISO date when the row was generated
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';   // model confidence on the strongest claim in the group
  visibilityLane: 'PUBLIC_SAFE_USCE';      // always PUBLIC_SAFE_USCE for this export
  humanReviewStatus: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';  // default PENDING
  extractedFromRunId: string;
  claimIds: string[];                      // all source claim IDs that contributed to this row
  notStatedFields: string[];               // fields the source page intentionally did not state
  warnings: string[];                      // any quality / scope notes for the reviewer
  schemaVersion: 'p102-row-contract-1';
}
```

## 4. Grouping rule (claims → row)

Claims merge into one row when ALL of:

1. Same `institutionId`.
2. Same `sourceUrl` OR same `(opportunityName, specialty)` if the model identified them on related pages within the same institution.
3. Same `opportunityType` (observership claims do not merge with VSLO claims).
4. Same `audience` (international claims do not merge with VSLO US-only claims).

Field aggregation across merged claims:

- `sourceQuote`: pick the **strongest offer-stating quote** (the claim with the most explicit "we offer" / "is open to" / "applications via X" language). Preserve verbatim. If multiple equally strong, pick longest.
- `audience`, `eligibility`, `cost`, `duration`, `deadline`, `applicationRoute`: take the most-specific quote value across the merged claims. If two claims contradict, prefer the one with HIGH confidence; if both HIGH, surface in `warnings` with both values.
- `contact`: union (a row can have name + email + phone from three different claims).
- `claimIds`: union of all contributing claim IDs.
- `notStatedFields`: list of fields that were `NOT_STATED_ON_SOURCE` across the source pages.
- `confidence`: minimum of contributing claims' confidences.

## 5. Inclusion rules

A claim becomes part of a `publicSafeOpportunityRow` ONLY IF:

- `claim.visibility === 'PUBLIC_SAFE_USCE'`.
- `claim.quoteVerified === true`.
- `claim.quote !== 'NOT_STATED_ON_SOURCE'`.
- `claim.sourceUrl` and `claim.sourceHash` and `claim.cleanedTextPath` are all present.
- `claim.sourceScope` is `INSTITUTION_SPECIFIC`, `CAMPUS_SPECIFIC`, or (`DEPARTMENT_LEVEL` AND deepSourceFamily ∈ TIER_1_DEEP_FAMILIES).

A claim is rejected from public-safe export and routed elsewhere if:

| Condition | Routed to |
|---|---|
| `visibility === 'CAUTION_SAFE_INTERNAL_REVIEW'` or `'HUMAN_REVIEW_REQUIRED'` | `public_safe_review_queue.json` |
| `visibility === 'FUTURE_LANE_ONLY'` (GME, residency, fellowship, careers, etc.) | `future_lane_archive.json` |
| `visibility === 'HIDDEN_REJECTED'` (cross-campus catch, scope mis-attribution) | `hidden_rejected_archive.json` |
| `quote === 'NOT_STATED_ON_SOURCE'` (MISSING_FIELD honest absence) | `public_safe_review_queue.json` (review whether to publish absence) |
| `quoteVerified === false` | dropped (audit-trail only in `hidden_rejected_archive.json` with reason `quote_unverified`) |

## 6. What the row builder does NOT do

- **Does NOT modify** the underlying ledgers (`13_model_claims_verified.json`, `13_source_claims.json`).
- **Does NOT** re-extract, re-fetch, re-classify, or re-call any model. It is pure read + group + write.
- **Does NOT** import to the database (Prisma schema unchanged).
- **Does NOT** publish to the website — exports are local JSON only.
- **Does NOT** mark anything as approved — `humanReviewStatus` defaults to `PENDING`.
- **Does NOT** add or remove safety gates from the extraction pipeline.

## 7. Public display readiness

A row in `public_safe_opportunity_rows.json` is **a publication candidate**, not yet published. Before any row appears on the public website, the future minimal-ingestion sprint must add:

1. A reviewer surface that lists `humanReviewStatus === 'PENDING'` rows.
2. A reviewer action that flips one row to `'APPROVED'`.
3. A display surface that filters `humanReviewStatus === 'APPROVED'` only.
4. A "report correction" link on each public row that lets users flag bad data.

Until then, the export remains local evidence for offline review.

## 8. Cross-cumulative state at first row build

After Phase F (row builder run on the existing 32 runs across gold + positive-control + Florida Batch 1), expect:

- ~91 PUBLIC_SAFE_USCE source claims across 9 institutions (positive-control + gold-set bonus).
- After grouping: ~25-50 deduplicated opportunity rows.
- ~314+ HUMAN_REVIEW_REQUIRED source claims → review queue.
- ~700+ FUTURE_LANE_ONLY source claims → future archive.
- ~2 HIDDEN_REJECTED claims (Northwell Cohen Children's) → audit archive.

Each subsequent extraction batch (high-yield Batch 1 / 2, Florida Batch 2, etc.) appends to these exports.

## 9. Out-of-scope reminders

- No DB write.
- No public import.
- No homepage / SEO / sitemap changes.
- No big UI redesign.
- No GME / Tier 2 / Tier 3 in the public-safe export — those go to `future_lane_archive.json` only.

Branch: `local/p102-high-yield-usce-and-ingestion-contract`. Local commits only. Production main `739ab1e` UNCHANGED.
