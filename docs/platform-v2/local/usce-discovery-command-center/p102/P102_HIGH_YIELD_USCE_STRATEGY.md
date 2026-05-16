# P102 High-Yield USCE Strategy — pivot from state-first to top-USCE-first

schemaVersion: p102-hy-strategy-1
branch: `local/p102-high-yield-usce-and-ingestion-contract`
parent commit: `8468d53` (Florida Batch 1 complete)
production main: `739ab1e` UNCHANGED

## 1. Why this pivot is needed now

The cumulative state of P102 across the four sprints so far:

| Sprint | Outcome | Insight |
|---|---|---|
| **P102-GOLD** (11 institutions) | 11 / 11 PASS, 0 over-promotions, 769 quote-verified | Framework is **safe** |
| **P102-FIX** (positive controls + classifier widening) | 91 PUBLIC_SAFE_USCE, 9 institutions, 0 over-promotions | Framework can **promote true positives** |
| **P102-FLORIDA Batch 1** (10 hospital-domain runs) | 10 / 10 PASS safety, **0 new public-safe rows**, 314 HUMAN_REVIEW, 393 FUTURE | Hospital-domain state-first has **low public-safe yield** |

The Florida Batch 1 result is honest and important: it proved the framework's safety discipline holds at state scale (system-domain enterprises, off-domain medschool patterns, patient-facing-only domains all correctly produced 0 over-promotions). But it also revealed a structural truth — **most acute-care hospital websites do not host their own visiting-medical-student / observership content**. They route applicants through:

- Affiliated medical school domains (Miller SOM, USF Morsani, UF College of Medicine, Wertheim FIU, FSU College of Medicine).
- System enterprise portals (mayoclinic.org/medical-professionals/, baptisthealth.net/research-medical-education/) — which are correctly held to HEALTH_SYSTEM_LEVEL.
- Department-specific deep URL patterns (Otolaryngology / Emergency Medicine sub-Internship pages).

Continuing pure state-first hospital-domain extraction will produce **lots of HUMAN_REVIEW_REQUIRED + FUTURE_LANE_ONLY rows** but few new PUBLIC_SAFE_USCE rows for weeks. That delays the website indefinitely.

## 2. The new strategy: top-USCE-first → row builder → minimal ingestion → state expansion

### Phase 1 — High-Yield USCE Queue (this sprint)

Build a queue of 25-50 institutions specifically chosen because we **already have evidence** they host real public USCE / observership / visiting-student content on a reachable domain. Sources for the queue:

- P101 Tier A / Tier B candidates (already in `p101_candidate_usce_pages.csv` — 9 INTERNATIONAL_STUDENT_CONFIRMED + 3 IMG_GRAD_OBSERVERSHIP_CONFIRMED institutions with INSTITUTION_SPECIFIC scope).
- Positive-control successes (5 institutions producing 65-91 PUBLIC_SAFE_USCE).
- Florida medical-school domains (medschool.miami.edu, health.usf.edu/medicine, med.ufl.edu, medicine.fiu.edu, med.fsu.edu).
- Texas, California, New York medical-school domains with known IMG-friendly USCE programs.
- Department-specific known URLs (Otolaryngology Sub-I patterns from BMC; ENT / Anesthesiology / Pediatrics elective pages on academic centers).

Goal: produce 100-300 NEW PUBLIC_SAFE_USCE source claims that, after the row-builder pass, become 30-100 deduplicated opportunity rows.

### Phase 2 — Row Builder (this sprint)

Build a deterministic local-only script `scripts/p102-build-public-safe-opportunity-rows.ts` that:

- Reads all `13_model_claims_verified.json` and `13_source_claims.json` ledgers.
- Selects only `visibility === 'PUBLIC_SAFE_USCE'` claims.
- Groups claims by `institution + opportunity-type + source URL + specialty/name` to produce a single row per opportunity (not per claim).
- Emits four local JSON exports:
  - `public_safe_opportunity_rows.json` — website-ready, source-linked, quote-backed
  - `public_safe_review_queue.json` — flagged-for-review-before-publish
  - `future_lane_archive.json` — Tier 2 / Tier 3 internal archive
  - `hidden_rejected_archive.json` — model-hidden claims (Cohen Children's pattern)

No DB import. No public-facing UI. No homepage changes. Local JSON only.

### Phase 3 — Minimal Website Ingestion Contract (next sprint)

Build only the minimal display surface for the public-safe opportunity rows:

- Listing card (institution, opportunity type, audience, application route, location)
- Detail page (verbatim source quote, source URL, last-reviewed date, source status badge)
- Report-correction link

Not a homepage redesign. Not new product surfaces. Just enough display to let the public-safe row bank become useful.

### Phase 4 — Return to State-by-State (after website is alive)

With a real public-safe row bank visible on the website, return to:

- Florida medical-school-domain Batch 2 (medschool.miami.edu, etc.).
- Florida Batch 2+ (HCA, Bethesda FAU, West Kendall Baptist, etc.).
- Then Texas / California / New York / Illinois / Pennsylvania state queues.
- Eventually national.

## 3. What stays exactly the same

- **Safety discipline is not weakened.** All gates (HEALTH_SYSTEM_LEVEL → HUMAN_REVIEW, off-domain medschool refusal, model A3 cross-campus catches, NOT_STATED guard, asymmetric drift) remain in force.
- **GME / residency / fellowship stays FUTURE_LANE_ONLY.** Not pivoting to GME-first.
- **Quote verification stays strict.** No row enters the public-safe export without a verified quote.
- **Claude CLI only.** No SDK / API-key path.
- **T7 canonical root only.**
- **No push, no deploy, no DB, no schema, no UI redesign, no SEO changes.**

## 4. What changes

- **Queue selection bias** shifts from "exhaustive state crawl" to "high-yield USCE-first".
- **Output shape** adds row-level deduplication on top of source-claim level.
- **Local JSON exports** are added under `docs/.../p102/exports/` so a future website surface can read them without DB.

## 5. How long until the website can show real rows

| Track | Estimated wall-clock |
|---|---|
| Phase 1: high-yield queue + Batch 1 (10-15 institutions) | 1-3 days |
| Phase 2: row builder + first export | 0.5 day |
| Phase 3: minimal website ingestion contract + display | 2-4 days |
| **Phase 1 + 2 first website-ready batch** | **~1 week** |

Vs. the alternative (state-by-state hospital-domain only): weeks before website has enough rows to be useful.

## 6. What this sprint commits to

- Phase A: ground state + new branch.
- Phase B: this strategy doc.
- Phase C: build the 25-50-row high-yield queue CSV.
- Phase D: the public-safe opportunity row contract (data-shape spec).
- Phase E: implement `scripts/p102-build-public-safe-opportunity-rows.ts`.
- Phase F: run the row builder on the existing 32 runs (gold + positive control + Florida Batch 1) to produce the first opportunity-row export from the existing 91 PUBLIC_SAFE_USCE source claims.
- Phase G: run high-yield Batch 1 (10-15 institutions).
- Phase H: Batch 1 report + recommendation.
- Phase I: local commit.

## 7. Out-of-scope

- Phase 3 (minimal website ingestion / display) is **next sprint**, not this sprint.
- No DB / Prisma / migrations.
- No homepage changes.
- No big UI redesign.
- No GME-first pivot.
- No national run.
- No state run beyond Florida medical-school-domain hints.

Branch: `local/p102-high-yield-usce-and-ingestion-contract`. Local commits only. Production main `739ab1e` UNCHANGED.
