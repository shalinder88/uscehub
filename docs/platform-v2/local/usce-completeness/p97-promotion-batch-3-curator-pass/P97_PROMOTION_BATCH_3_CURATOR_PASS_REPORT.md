# P97 Promotion Batch 3 — Curator Pass — Sprint Report

**Date:** 2026-05-09
**Sprint ID:** `P97-PROMOTION-BATCH-3-CURATOR-PASS`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `08d893c P97: build national screening scoreboard and queue four`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Curator-review the 25 READY_FOR_HUMAN_APPROVAL rows on T7; produce a validator-passing bridge-input DRAFT for the safest subset; surface evidence-hardening + copy-carveout queues for the remainder. **No active runtime change. No production. No UI.**

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Rows reviewed | **25** |
| Approved for bridge-input DRAFT | **7** (Class B US-only Tier-1 AMCs) |
| Needs evidence hardening | **6** (5 Class A broad-IMG + 1 bot-defense block) |
| Needs copy carveout | **9** (Class C PARTIAL/NOT_MENTIONED audience) |
| Defer to future lane | **3** (Class D residency-supporting) |
| Bridge-input validator on new DRAFT | **PASSED** (7/7 rows) |
| Production untouched | YES ✅ |
| Active runtime touched | NO ✅ |
| Staged runtime touched | NO ✅ |
| `/contact` / `/clerkships/pilot` / app code touched | NO ✅ |
| Mac-local HTML snapshots landed | 7 |
| Mac-local Wayback archives | 7 (6 sprint-fresh + 1 prior April 2024 HEAD-verified) |
| 347→5 bottleneck movement | **+7 rows** moved into validator-passing DRAFT |

## 2. Why this sprint matters

The prior scoreboard sprint identified the project's real bottleneck: **347 verified institutions on T7 vs 5 active runtime cards**. The 25 READY_FOR_HUMAN_APPROVAL rows (Yale / Mayo / Cleveland Clinic Main / NYP Columbia + Cornell / Johns Hopkins / Mount Sinai / Duke / Northwestern / Penn / NYU Langone Tisch / Mayo Phoenix + Jacksonville / Westchester / Methodist TX / Newark Beth Israel / Saint Barnabas / BronxCare / Englewood / Carilion / Grady / IU Methodist / ChristianaCare / Jackson Memorial / HCA Aventura) were the highest-leverage promotion target.

This sprint moved 7 of them into a validator-passing DRAFT — a 350% increase in DRAFT-stage Tier-1 AMC coverage (from 2 prior DRAFT rows to 9 DRAFT rows including the existing UPMC + Lincoln).

## 3. Row-by-row curator summary

Detail in `promotion_batch_3_curator_matrix.csv`. Summary by class:

### Class B — APPROVED_WITH_PUBLIC_COPY_CARVEOUT (7 rows)

| Institution | State | Source | Evidence on Mac-local |
|-------------|-------|--------|------------------------|
| Jackson Memorial Hospital | FL | UM Miller SOM visiting-students | HTML snapshot + April 2024 Wayback |
| Duke University Hospital | NC | Duke SOM Office of Registrar visiting-students | HTML snapshot + sprint-fresh Wayback |
| Northwestern Memorial Hospital | IL | Feinberg SOM visiting-students | HTML snapshot + sprint-fresh Wayback |
| Hospital of the University of Pennsylvania | PA | Perelman SOM application page | HTML snapshot + sprint-fresh Wayback |
| NYU Langone Health - Tisch Hospital | NY | NYU Grossman SOM Visiting MD Students | HTML snapshot + sprint-fresh Wayback |
| Methodist Hospital (San Antonio) | TX | HCA Healthcare GME location page | HTML snapshot + sprint-fresh Wayback |
| Indiana University Health Methodist Hospital | IN | IU SOM Guest Students | HTML snapshot + sprint-fresh Wayback |

All 7 are US-only LCME/AOA per source. Mirror the active CCF Mercy / Highland US-only pattern. All 7 carry SYSTEM_LEVEL or SITE_LEVEL caveat in `campus_name`.

### Class B — NEEDS_EVIDENCE_HARDENING (1 row, bot-defense)

| Institution | State | Block |
|-------------|-------|-------|
| Mount Sinai Hospital | NY | HTML fetch returned HTTP 403 (bot defense pattern matches Pitt SOM from Sprint 5) |

Resolution: same authenticated-browser fallback used for Pitt SOM in the manual-PNG-landing-1 sprint.

### Class A — NEEDS_EVIDENCE_HARDENING (5 rows, broad-IMG)

| Institution | State | Why deferred |
|-------------|-------|--------------|
| Mayo Clinic Hospital - Saint Marys Campus | MN | Broad INTL/CARIB/IMG=YES claim per T7; Class-A claim has high reputational risk if mis-stated; Mayo system uses one URL for all 3 sites |
| NewYork-Presbyterian Hospital - Columbia University Medical Center | NY | Vagelos broad-IMG claim needs Mac-local Tier-A+ verification |
| NewYork-Presbyterian Hospital - Weill Cornell Medical Center | NY | Weill Cornell international page broad-IMG claim needs verification |
| Mayo Clinic Hospital - Phoenix | AZ | Same Mayo system page; per-site mapping unclear |
| HCA Florida Aventura Hospital | FL | HCA GME pattern but BROAD-IMG vs Methodist TX's US-only — audience signal differs across HCA sites |

These rows could have been promoted aggressively but the broad-IMG claim is exactly the kind of source-overclaim risk the project's banned-phrase enforcement catches. Hardening evidence first is correct.

### Class C — NEEDS_COPY_CARVEOUT (9 rows, PARTIAL/NOT_MENTIONED audience)

| Institution | State | Issue |
|-------------|-------|-------|
| Yale New Haven Hospital | CT | INTL=NOT_MENTIONED, CARIB=PARTIAL — needs careful audience_detail encoding |
| Cleveland Clinic Main Campus | OH | Same source URL as active CCF Mercy + CC Hillcrest — coexistence question |
| Johns Hopkins Hospital | MD | $750 research fee — fee handling needs careful copy |
| Mayo Clinic Hospital - Jacksonville | FL | Mayo per-site audience-matrix inconsistency (Jacksonville=PARTIAL vs Saint Marys/Phoenix=YES) |
| ChristianaCare - Christiana Hospital | DE | All audiences NOT_MENTIONED |
| Westchester Medical Center | NY | PARTIAL audience |
| Saint Barnabas Medical Center | NJ | PARTIAL audience; RWJBH system |
| Carilion Clinic | VA | All NOT_MENTIONED |
| Grady Memorial Hospital | GA | Public safety-net + Emory affiliate; PARTIAL audience |

These 9 are deferred to a curator-decision sprint that resolves the encoding (UNKNOWN_NOT_STATED vs ONLY_IF_AFFILIATED vs EXCLUDED_EXPLICIT for each non-LCME audience type).

### Class D — DEFER_TO_FUTURE_LANE (3 rows, residency-supporting)

| Institution | State | Why wrong lane |
|-------------|-------|----------------|
| Newark Beth Israel Medical Center | NJ | Source page is residency/post-match-IMG context (RWJBH medical-education page) — wrong lane for visiting-MS pilot |
| BronxCare Health System | NY | Source page is family-medicine residency electives; J-1/H-1B is residency-context |
| Englewood Health | NJ | Source page is residency-and-fellowship programs; J-1/H-1B is residency-context |

These represent a future "residency-support lane" for IMG-post-match users — separate from the visiting-MS pilot. Out of scope here.

## 4. Bridge-input DRAFT result

File: `promotion_batch_3_bridge_input_DRAFT.csv` (8 lines: 1 header + 7 data rows).

```
File: docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-curator-pass/promotion_batch_3_bridge_input_DRAFT.csv
Rows: 7

Overall: PASSED
  7 row(s) passed all bridge-input gates.
  No runtime mutation. No public promotion. No import.
```

All 7 rows carry:
- `bridge_review_status = NEEDS_HUMAN_COPY_REVIEW` (correct for evidence_triple_complete=false)
- `evidence_triple_complete = false` (PNG missing — same as UPMC/Lincoln pre-PNG state)
- `not_allowed_actions = NO_IMPORT_READY;NO_PUBLIC_NOW;NO_RUNTIME_MUTATION;NO_INDEXED_PUBLICATION;NO_PNG_BYPASS_AT_RUNTIME`
- `human_reviewer_required = true`
- US-only audience encoded via audience_detail (us_md_do=ELIGIBLE_EXPLICIT; intl/img/Caribbean=EXCLUDED_EXPLICIT)
- Sprint-fresh or HEAD-verified Wayback URLs
- HTML snapshot file paths that resolve on disk

## 5. Evidence-hardening queue

File: `promotion_batch_3_evidence_hardening_queue.csv` — 15 rows (6 NEEDS_EVIDENCE_HARDENING + 9 NEEDS_COPY_CARVEOUT). Two priority groups:

- **P0/P1 (6 rows):** Mount Sinai + 5 Class A broad-IMG rows. Need PNG capture + verbatim-quote re-verification.
- **P2/P3 (9 rows):** Class C copy-carveout decisions.

The next sprint (`P97-PROMOTION-BATCH-3-EVIDENCE-HARDENING-1`) addresses the 7 DRAFT rows + Mount Sinai + the 5 Class A rows = 13 institutions for PNG landing.

## 6. Public-copy risk summary

Detail in `promotion_batch_3_public_copy_carveouts.csv`. All 7 approved rows carry the same conservative copy pattern:

- US LCME / AOA only (explicit)
- International / Caribbean / IMG explicitly excluded by accreditation language
- Visa policy not stated
- Cost not stated (or specifically documented for HCA pattern)
- System-level OR site-level caveat in `campus_name`
- Banned-claim list per row (no guarantee, no hospital-approved, no apply-through-USCEHub, no IMG-friendly, no Caribbean accessible, no J-1/H-1B sponsorship)

These mirror the active 5-card pilot's copy discipline.

## 7. Scoreboard delta

Detail in `promotion_batch_3_scoreboard_delta.csv`.

Headline metrics:
- **READY_FOR_HUMAN_APPROVAL rows reviewed: +25** (all 25 went through curator)
- **APPROVED_FOR_BRIDGE_INPUT_DRAFT: +7** (Class B Tier-1 AMC US-only)
- **Bridge-input DRAFT rows in repo: 2 → 9** (existing UPMC + Lincoln, plus 7 new)
- **Mac-local HTML snapshots: +7**
- **Mac-local Wayback archives: +7**
- **Active runtime: 5 → 5 unchanged** (DRAFT does not activate)
- **Staged runtime: 7 → 7 unchanged**
- **Production public: 0 → 0 unchanged**
- **Rows moved closer to runtime: +7** ← the headline metric
- **347→5 funnel bottleneck status: RESOLVING (positive movement)**

## 8. What this sprint did NOT do

- Did NOT modify the active 5-card runtime.
- Did NOT modify the staged 7-card runtime.
- Did NOT generate any new staged runtime data file.
- Did NOT modify `/clerkships/pilot/*` or `/contact/*`.
- Did NOT modify any existing validator script.
- Did NOT add any new endpoint or app code.
- Did NOT enable the correction-intake env flag.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT broaden audience eligibility.
- Did NOT remove any caveat.
- Did NOT mutate the T7 source files (read-only).
- Did NOT scrape ACGME/FREIDA or bypass any bot defense (Mount Sinai's 403 is honestly documented).
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 9. Recommended next sprint

**`P97-PROMOTION-BATCH-3-EVIDENCE-HARDENING-1`** — land Tier-A+ persistent PNGs for the 7 DRAFT rows + Mount Sinai + 5 Class A rows (13 institutions total). Same pattern as the manual-PNG-landing-1 sprint that closed the gap for UPMC + Lincoln.

After Sprint 4 in the next-actions plan (`P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1` resolving B-001/B-002/B-003), the 9-row DRAFT can be safely activated to a non-default preview route.

## 10. Strategic checkpoint

Detail in `promotion_batch_3_next_actions.csv` and the prior sprint's strategic checkpoint document.

**Are we moving toward the big product?** YES. 7 Tier-1 AMC rows are now in a validator-passing DRAFT. That's product movement.

**Did this reduce the 347→5 bottleneck?** YES, by 7 rows. The bottleneck went from 347 verified → 5 active to 347 verified → 9 DRAFT → 7 staged → 5 active. The pipeline now has visible flow.

**Are we drifting?** NO. This sprint did real promotion work, not validator/spec work. Caveats preserved. Audience not broadened. Production untouched.

**What must stop?** Continue avoiding correction-intake sub-spec sprints; continue avoiding net-new screening until the 25 READY rows are fully consumed (still 18 to process: 6 evidence-hardening + 9 copy-carveout + 3 deferred).

**What must continue?** Tier-A+ evidence discipline. Strict banned-phrase enforcement. Production-untouched. Curator dual-signoff for any high-risk transition.

## 11. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime activation | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged runtime change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No app code change | CONFIRMED — only docs + new HTML snapshots in sprint folder |
| No existing validator weakened | CONFIRMED |
| No fake promotion | CONFIRMED — bridge validator independently confirmed PASS |
| No lowering evidence standards | CONFIRMED — Class A rows DEFERRED rather than rushed in |
| No hiding evidence gaps | CONFIRMED — Mount Sinai 403 documented; Mayo per-site mapping flagged |
| No broad IMG-friendly claim | CONFIRMED — Class A all DEFERRED for verification |
| No hospital-approved / guaranteed-rotation / apply-through-USCEHub claim | CONFIRMED — must_not_claim explicit on every DRAFT row |
| No site-specific guarantee unless source supports | CONFIRMED — system-level caveat in campus_name where applicable |
| No visa sponsorship claim | CONFIRMED — visa_public_caveat = "not stated" for all DRAFT rows |
| No audience broadening | CONFIRMED |
| No caveat removal | CONFIRMED |
| No automated ACGME/FREIDA scraping | CONFIRMED — public visiting-students pages only |
| No login / CAPTCHA bypass | CONFIRMED — Mount Sinai bot-defense honestly documented as a block |
| No T7 mutation | CONFIRMED |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
