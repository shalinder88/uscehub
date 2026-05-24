# P102 Exact-Link Seed Extraction — Spec

Generated: 2026-05-16  
Branch: `local/p102-exact-link-seed-extraction`  
Precedes: `P102_INTELLIGENT_EXTRACTION_GATE_SPEC.md` (which fixed downstream noise)

---

## 1. Why this exists

Broad institution-level crawling produced 925 raw claims across 4 runs and
only 2 auto-promote rows (after the intelligent gate filtered the noise).
The remaining 24 holds are dominated by generic `/education` and
`/academics` landing pages — the model correctly cannot prove what
specific opportunity a generic page describes.

The classifier is not at fault. The input is.

The fastest route to a useful website is to stop broad crawling and start
from URLs that are *already known* to be direct opportunity pages.

---

## 2. Where the seed URLs come from

| Source | Status |
|---|---|
| 13 existing approved preview rows | known good, already in production preview |
| 2 intelligent auto-promote rows | known good, just promoted by Stage F |
| URLs the operator found manually outside this pipeline | gold standard — must be ingested |
| One direct-link page per institution that previously returned a generic landing | conversion target |

Operator-found exact links are the **truth set**. Discovery should learn
from them, not the other way around.

---

## 3. What an exact-link seed run does

```
seed row (one direct URL)
  ↓
fetch exact URL only — no crawling, no link-following
  ↓
save raw HTML + cleaned text + sourceHash to canonical evidence root
  ↓
extract one (or N if page lists multiple programs) opportunity quote
  ↓
Stage C triage (single URL → single decision)
  ↓
Stage D audience classification
  ↓
Stage E direct-link validation
  ↓
Stage F+G row builder + dedup
  ↓
write to exact_seed_public_safe_rows.json / hold / rejected
```

The runner reuses Stages C-G logic from the intelligent gate. The only
new component is the fetcher + the seed-CSV reader.

---

## 4. What an exact-link seed run does NOT do

- No broad crawl
- No homepage discovery
- No following internal links
- No A0/A1 deep crawl
- No model-call (deterministic only this sprint)
- No emitting one row per claim
- No emitting one row per quote
- No fabrication: if fetch fails or page is empty, the seed is marked
  `runStatus=FAILED_FETCH` and produces zero rows

---

## 5. Public-safe exact seed row requires

- official source URL
- direct opportunity page (`directLinkStatus = VALID_DIRECT_USCE_SOURCE`)
- verified source quote (≥10 chars, present in cleaned text)
- sourceHash
- audience classification ≠ `UNKNOWN_HOLD`
- opportunity type is Tier 1 USCE
- not pharmacy / allied-health
- not GME-only
- not careers / jobs
- not a generic education landing page
- source scope institution/campus-specific OR campus applicability proven

Holds (`exact_seed_hold_rows.json`):
- system/school pages with multiple teaching sites and no campus proof
- source quote proves opportunity but not target institution
- audience unclear
- application route unclear but opportunity exists

Rejects (`exact_seed_rejected_rows.json`):
- pharmacy / P1-P4 student rotations
- nursing / allied health
- residency / fellowship / GME only
- career / jobs pages
- generic education landing pages
- broken / redirected / irrelevant
- pages with no opportunity details

---

## 6. CSV schema

`p102_exact_usce_seed_links.csv` — single source of truth for seed runs.

| Column | Type | Required |
|---|---|---|
| seedId | string | yes |
| institutionId | string | yes |
| institutionName | string | yes |
| parentSystem | string | no |
| campus | string | no |
| city | string | yes |
| state | string | yes |
| sourceUrl | string (https://…) | yes |
| sourceDomain | string | yes |
| expectedAudience | enum | yes |
| expectedOpportunityType | enum | yes |
| expectedSpecialty | string | no |
| expectedCampus | string | no |
| expectedDirectLink | `true` \| `false` | yes |
| knownGoodReason | string | yes |
| priorEvidenceRef | string | no |
| notes | string | no |
| runStatus | enum | yes (updated by runner) |
| finalStatus | enum | yes (updated by runner) |

**expectedAudience** enum:
`US_MD_DO_VISITING_STUDENT | INTERNATIONAL_MEDICAL_STUDENT | IMG_GRADUATE_OBSERVER | IMG_GRADUATE_EXTERNSHIP | BOTH_STUDENT_AND_IMG_GRADUATE | UNKNOWN_HOLD`

**expectedOpportunityType** enum:
`VISITING_MEDICAL_STUDENT_ELECTIVE | CLINICAL_ELECTIVE | OBSERVERSHIP | EXTERNSHIP | SUB_INTERNSHIP | CLERKSHIP | INTERNATIONAL_VISITING_STUDENT | IMG_OBSERVERSHIP | OTHER_USCE`

**runStatus** enum:
`PENDING | FETCHED | EXTRACTED | FAILED_FETCH | FAILED_EXTRACT`

**finalStatus** enum:
`PENDING | AUTO_PROMOTE | HOLD_REVIEW | REJECTED | FAILED`

---

## 7. Scripts

| Script | Role |
|---|---|
| `scripts/p102-run-exact-usce-seed-links.ts` | Fetch + extract + classify + build for one or more seeds |
| `scripts/p102-validate-exact-seed-rows.ts` | Verify output integrity (~15 checks) |

Both follow the existing P102 convention: read inputs from
`docs/.../p102/exports/` or `queues/`, write outputs to
`docs/.../p102/exports/`, never touch DB or website code.

---

## 8. Outputs

```
exports/
  exact_seed_public_safe_rows.json     — auto-promote, ready for website
  exact_seed_hold_rows.json            — needs human review
  exact_seed_rejected_rows.json        — failed quality checks
  exact_seed_duplicate_clusters.json   — collapsed duplicates
evidence/
  per-seed:  raw HTML + cleaned text + sourceHash
```

Evidence files live under
`docs/platform-v2/local/usce-discovery-command-center/p102/evidence/exact-seed/<seedId>/`.

---

## 9. Success criteria for Batch 1

| Metric | Target |
|---|---|
| Auto-promote rate | > 50% of seeds that fetch successfully |
| Rejection rate | < 20% (seeds should be curated) |
| Validator | passes all checks |
| Build | passes |
| Network errors | reported per seed, not silent |
| Cost | $0 (deterministic, no model calls) |

If auto-promote rate is below 50%, the diagnosis is either bad seed
quality or a bug in the gate. The fix is in the seed file, not in the
classifier.

---

## 10. Out of scope

- DB inserts
- Schema migrations
- Production routes
- Sitemap / robots / metadata changes
- Adding new institutions to the canonical registry (use existing IDs only)
- Model-backed re-extraction (separate sprint, gated on `ANTHROPIC_API_KEY`)
- Push / deploy / PR
