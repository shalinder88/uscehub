# P102 Live Data Crosswalk

Generated: 2026-05-16  
Branch: `local/p102-live-site-crosscheck-exact-links`

---

## 1. Where the 304 live listings come from

| Source | Role | Count |
|---|---|---:|
| `/Users/shelly/usmle-observerships/data.js` (sibling repo) | Canonical `PROGRAMS[]` array — operator's hand-curated USCE program list | **207 programs** (206 with HTTP link) |
| `prisma/verified-links.ts` | Operator's verified URL overrides | **79 entries** (47 with `verified:true`) |
| `prisma/seed.ts` | Builds Listing rows by merging the two above (verified URL wins) | Inserts 1 listing per program (~207) |
| Production DB (somewhere else, ahead of local) | Live `/browse` page reads from here | 304 listings (97 more than local seed produces — added later via admin UI or production seed run) |

**Local DB count likely = 207.** Live `/browse` = 304. Delta = production-only additions.

Hardcoded display claim:
- `src/lib/site-metrics.ts:38` → `opportunitiesIndexed: 304`

---

## 2. Live Listing schema (Prisma)

`prisma/schema.prisma` → `model Listing`. The fields most relevant for crosswalk:

| Listing field | Type | Source-relevance |
|---|---|---|
| `id` | String CUID | live `/listing/[id]` route key |
| `title` | String | the program name (e.g. "Wayne State University / Detroit Medical Center") |
| `listingType` | enum OBSERVERSHIP/EXTERNSHIP/RESEARCH/POSTDOC/ELECTIVE/VOLUNTEER | from `data.js` `program.type` |
| `specialty` | String (comma-joined) | from `program.specialties` |
| `city`, `state`, `country` | String | from `program.location` |
| `duration`, `cost`, `applicationDeadline` | String | from data.js |
| `eligibilitySummary` | String | `requirements + visa` |
| `visaSupport` | Boolean | derived from `program.visa` |
| `websiteUrl` | String? | the seed URL (verified-links override or data.js raw) |
| `sourceUrl` | String? | newer field (Phase 3.2) — currently unused at seed time |
| `applicationUrl` | String? | newer field — currently unused at seed time |
| `linkVerified` | Boolean | `verified-links.ts` boolean (true/false) |
| `linkVerificationStatus` | enum UNKNOWN/etc | newer field — currently unused at seed time |
| `lastVerifiedAt` | DateTime? | newer field — currently null on seeded rows |
| `audienceTag` | String? | free-form, not enforced |
| `usmleTier` | String? | free-form, not enforced |

The newer fields (`sourceUrl`, `linkVerificationStatus`, `lastVerifiedAt`, `verificationFailureReason`) exist in the schema but are not populated by the current seed flow — they're meant to be set by a future verification job.

---

## 3. Seed → live URL flow

```
data.js PROGRAMS[i].link
  ↓
prisma/verified-links.ts[program.name]?.url   (override if present)
  ↓
Listing.websiteUrl                            (final URL stored)
Listing.linkVerified = verifiedEntry.verified (true/false flag)
```

This is exactly what `prisma/seed.ts` lines 238-265 do.

**Net result:** 47 of 207 live listings (23%) have an operator-verified source URL. The other 160 use the raw `program.link` from `data.js`, which is often a generic institutional landing page (e.g. `/education`, `/gme`).

---

## 4. Crosswalk live listing ↔ P102 row

Each existing live Listing maps to an exact-seed row if the live `websiteUrl` is fed into the runner:

| Live listing field | P102 row field | Notes |
|---|---|---|
| `title` | `institutionName` (approximate; live title may include `/` for affiliated centers) |
| `state`, `city` | `state`, `city` | direct |
| `listingType` | `opportunityType` | enum mapping (see §6) |
| `audienceTag` | `audienceClass` | enum lift (see §7) |
| `websiteUrl` | `sourceUrl` | direct |
| `linkVerified` | (re-derived as `directLinkStatus`) | runner replaces the binary flag |
| (none) | `sourceQuote` | NEW from runner |
| (none) | `sourceHash` | NEW from runner |
| (none) | `directLinkStatus` | NEW from runner |
| (none) | `triageDecision` | NEW from runner |
| (none) | `audienceConfidence` | NEW from runner |

---

## 5. Proposed per-row merge decisions

Decision applied to each live listing after running the exact-link runner on its `websiteUrl`:

| Decision | When |
|---|---|
| **MATCH_UPDATE_WITH_SOURCE_QUOTE** | Live row + runner produced AUTO_PROMOTE quote → enrich the existing listing with `sourceQuote` + `sourceHash` + `directLinkStatus` |
| **NEW_SOURCE_LINKED_ROW** | Exact-seed row exists but no matching live listing (e.g. our new Batch 1/2 additions like Iowa, Vanderbilt, UVM, Rush, Cleveland Clinic Florida observership) |
| **DUPLICATE_HIDE_PREVIEW_ROW** | Exact-seed row's `sourceUrl` matches a live listing's `websiteUrl` — preview adapter should collapse |
| **LIVE_ROW_NEEDS_REVERIFY** | Live `linkVerified=true` but runner returned FAILED_FETCH (URL is now dead) or GENERIC_PAGE_HOLD (no longer a specific opportunity page) |
| **LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK** | Runner returned INVALID_NOT_USCE_SOURCE → live URL doesn't actually point at a USCE opportunity page; live row should be hidden until fixed |
| **FUTURE_LANE_ONLY** | Runner triaged as REJECT_GME_ONLY / REJECT_RESEARCH_ONLY / REJECT_PHARMACY → not a Tier-1 USCE row, downrank in current product |

These decisions are written into the Batch report as a recommended action list. **No production DB mutation in this sprint** — the decisions are documentation for a future migration job.

---

## 6. ListingType ↔ OpportunityType mapping

| Live ListingType | P102 OpportunityType | Notes |
|---|---|---|
| OBSERVERSHIP | OBSERVERSHIP | direct |
| EXTERNSHIP | EXTERNSHIP | direct |
| ELECTIVE | CLINICAL_ELECTIVE | renamed |
| RESEARCH | OTHER_USCE (held — Tier 1 USCE is clinical, not research) | downrank by default |
| POSTDOC | OTHER_USCE (FUTURE_LANE — postdoc is Tier 3) | downrank by default |
| VOLUNTEER | OTHER_USCE (FUTURE_LANE — pre-med) | downrank by default |
| (none) | VISITING_MEDICAL_STUDENT_ELECTIVE | new — exact-seed rows for US MD/DO |
| (none) | CLERKSHIP | new — exact-seed rows from clerkship-program pages |
| (none) | SUB_INTERNSHIP | new — BMC-style sub-I pages |
| (none) | INTERNATIONAL_VISITING_STUDENT | new |
| (none) | IMG_OBSERVERSHIP | new (most live OBSERVERSHIPs collapse here) |

---

## 7. AudienceTag ↔ AudienceClass mapping

Live `audienceTag` is a free-form string. Observed values in `data.js`:

| Live value (sample) | P102 AudienceClass |
|---|---|
| "IMG", "international medical graduate", "post-graduate IMG" | IMG_GRADUATE_OBSERVER |
| "international medical student" | INTERNATIONAL_MEDICAL_STUDENT |
| "US medical student", "MS3/MS4" | US_MD_DO_VISITING_STUDENT |
| (blank / unclear) | UNKNOWN_HOLD |
| "open to both" | BOTH_STUDENT_AND_IMG_GRADUATE |

The runner re-classifies from page content via `classifyAudienceFromText` — so the existing `audienceTag` is treated as a hint, not a source of truth.

---

## 8. Source URL quality distribution (data.js, before runner)

Hand-eyeballed from the first 30 `PROGRAMS[i].link` values:

| URL shape | Count (est.) | Quality |
|---|---:|---|
| Direct observership/visitor program path (e.g. `/observership`, `/academic-visitor-program`) | ~50 | HIGH — runner should auto-promote |
| Department / GME landing (e.g. `/education/gme`, `/medical-education`) | ~80 | MEDIUM — runner will likely GENERIC_PAGE_HOLD |
| Institutional homepage (e.g. `https://med.nyu.edu/`) | ~30 | LOW — runner will INVALID_NOT_USCE_SOURCE |
| Verified override (verified-links.ts) | 47 | HIGH — operator-confirmed |

The 47 verified-overrides are the highest-confidence subset.

---

## 9. What this crosswalk enables

Once the runner has been pointed at all 206 live source URLs, we produce a per-listing report with:

- `directLinkStatus` (replaces the boolean `linkVerified`)
- `sourceQuote` (new evidence the live row doesn't have)
- `audienceClass` (replaces fuzzy `audienceTag`)
- `triageDecision` (catches research-only / pharmacy / GME-only rows)
- The proposed merge decision (§5)

That output is the right input for a future "upgrade /browse with source quotes" migration. **Not in this sprint.** The artifact this sprint produces is the data + the decisions, written to disk for review.
