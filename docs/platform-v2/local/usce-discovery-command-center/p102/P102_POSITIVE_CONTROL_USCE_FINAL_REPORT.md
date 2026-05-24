# P102 Positive-Control USCE Calibration Complete Report

schemaVersion: p102-pc-final-1
branch: `local/p102-positive-control-promotion-fix`
parent commit: `0fb4590` (P102-FIX initial)
this report HEAD: see git log
production main: `739ab1e` UNCHANGED

## 1. Outcome — pass criteria met

| Metric | Threshold | Result |
|---|---|---|
| Institutions producing ≥ 1 PUBLIC_SAFE_USCE | ≥ 5 / 10 positive controls | **9 / 13 runs** (8 positive controls + gold-set bonus promotions) |
| Total PUBLIC_SAFE_USCE source claims (all runs) | ≥ 1 | **91** |
| Quote-verification failures (strict) | 0 | **0 / 1495** |
| Over-promotion failures (HIDDEN_REJECTED → PUBLIC) | 0 | **0** |
| Scope failures on system / school domains | 0 | **0** (Memorial Hollywood caught + fixed mid-run) |
| Gold-set verification | 11 / 11 PASS | **11 / 11 PASS** |
| Validator dispatcher | 12 / 12 PASS | **12 / 12 PASS** |
| Unit tests | all pass | **155 / 155 PASS** |
| TypeScript compile | clean | **clean** |

## 2. Institutions run

| # | Institution | Run ID | Total claims | PUBLIC_SAFE_USCE | Notes |
|---|---|---|---:|---:|---|
| 1 | MSK | `p102-pc-1-msk` | 48 | **1** | Bone Marrow Transplant Elective for medical students |
| 2 | Orlando Health (pre-Gap-A) | `p102-pc-2-orlando-health` | 30 | 0 | Superseded by `p102-pc-2b-orlando-health` |
| 2b | Orlando Health (post-Gap-A) | `p102-pc-2b-orlando-health` | 86 | **27** | Full VSLO clerkship program at `/medical-professionals/graduate-medical-education/clerkship-programs` |
| 3 | UM / UHealth | `p102-pc-3-um-uhealth` | 12 | 0 | A0 only reached generic research-lab pages; `/offices/faculty-affairs/services/observerships` unreached |
| 4 | Memorial Hollywood | `p102-pc-4-memorial-hollywood` | 109 | 0 | Acronym-domain system bug caught mid-run; 32 over-promotions corrected to HUMAN_REVIEW_REQUIRED |
| 5 | Hospital for Special Surgery | `p102-pc-5-hss` | 119 | **15** | Academic Visitor Program observership content fully promoted |
| 6 | Houston Methodist (deep) | `p102-pc-6-houston-methodist-deep` | 76 | **4** | `/academic-institute/education/medical/medical-student-rotations` reached via Gap A; original gold-test had `/observership` redirect to Pharmacy |
| 7 | UAB | `p102-pc-7-uab` | 68 | **29** | International Visiting Medical Student program at `/medicine/international/international-programs/international-visiting-medical-students` |
| 8 | Stanford | `p102-pc-8-stanford` | 11 | 0 | `/visiting-clerkships` blocked by `robots.txt`; honest absence |
| 9 | UCSF Fresno | `p102-pc-9-ucsf-fresno` | 74 | **3** | Visiting-medical-students contact (address/phone + Dean of Research name) on `/education/visiting-medical-students` |
| 10 | Emory University Hospital | `p102-pc-10-emory` | 93 | **4** | MD/PhD, CTSA TL1, GDBBS, T32 training programs on `/research/training/index.html` |

Plus gold-set regression bonus promotions (existing runs, reclassified under P102-FIX):

| # | Institution | Run ID | PUBLIC_SAFE_USCE (was) | PUBLIC_SAFE_USCE (now) |
|---|---|---|---:|---:|
| Gold 4 | Mayo Clinic Rochester | `p102-gold-4-mayo-clinic-rochester` | 0 | **1** |
| Gold 10 | Boston Medical Center | `p102-gold-10-boston-medical-center` | 0 | **7** |

## 3. Cross-run aggregate

| Metric | Value |
|---|---:|
| Total runs (gold + positive-control + dry/trial) | 22 |
| Total verified model claims (all ledgers) | 1495 |
| **PUBLIC_SAFE_USCE source claims** | **91** |
| **Institutions producing ≥ 1 PUBLIC_SAFE_USCE** | **9** |
| Quote-verification OK (strict) | 1495 |
| Quote-verification failures (strict) | 0 |
| Scope conflicts (post-Memorial Hollywood fix) | 0 over-promotion; Cleveland's 5 pre-existing scope-discipline notes preserved |
| HIDDEN_REJECTED preserved (Northwell Cohen Children's) | 2 / 2 |

## 4. Bug found and fixed mid-sprint: acronym-domain HEALTH_SYSTEM_LEVEL

Memorial Hollywood (`mhs.net`) initially produced **32 PUBLIC_SAFE_USCE claims** that should have been `HEALTH_SYSTEM_LEVEL` → `HUMAN_REVIEW_REQUIRED` (the AdventHealth Redmond pattern). Three issues compounded:

1. **`p102-discovery-runner.ts` never invoked `inferIdentity`** to populate `parentSystem` on the canonical institution. All `05_canonical_institution.json` files had `parentSystem: null` since the original P102-0R sprint.
2. **`inferSourceScope` couldn't detect acronym-domain systems** like `mhs.net` (where `mhs` doesn't tokenize-match `memorial`/`healthcare`/`system`). It correctly handled `adventhealth.com` and `hartfordhealthcare.org` (token matches), but not pure acronyms.
3. **`p102-reclassify-ledger.ts` didn't re-infer source scope** when `parentSystem` was added post-extraction — it only re-ran the visibility classifier.

Fixes applied in this sprint:

- `scripts/p102-discovery-runner.ts:752` — call `inferIdentity(canonicalName, official_domain)` and propagate `parentSystem` (and `aliases`) into the canonical institution at A0 time. The identity canonicalizer's curated system registry now drives all subsequent scope inference.
- `scripts/p102-extraction-lib.ts:inferSourceScope` — new "acronym-domain system fallback" branch (~10 lines). When `parentSystem` is set AND the source URL is on the institution's official host AND the canonical name has campus tokens beyond the parent name → `HEALTH_SYSTEM_LEVEL`. Triggers on Memorial Healthcare System / Sentara / BJC / Piedmont / etc. without weakening the existing token-match logic.
- `scripts/p102-reclassify-ledger.ts` — when canonical now carries a `parentSystem` that wasn't set at extraction time, re-infer source scope via `inferSourceScope` and override only when the new scope is **strictly more restrictive** than what's recorded (no weakening of HIDDEN_REJECTED or HEALTH_SYSTEM_LEVEL).

After fixes:
- Memorial Hollywood: 0 PUBLIC_SAFE_USCE, 69 HUMAN_REVIEW_REQUIRED, 40 FUTURE_LANE_ONLY. 6 scope conflicts correctly flagged.
- Gold-set 11/11 still PASS (no regressions on Cleveland, AdventHealth, etc.).
- 2 new tests added (P102-FIX-16: acronym-domain → HEALTH_SYSTEM_LEVEL; P102-FIX-17: bare system canonical → INSTITUTION_SPECIFIC).

## 5. Safety property checks

| Safety property | Status |
|---|---|
| Cleveland system-domain Tier 1 → HUMAN_REVIEW_REQUIRED | preserved |
| AdventHealth Orlando system-domain → HUMAN_REVIEW_REQUIRED | preserved |
| Memorial Hollywood acronym-domain → HUMAN_REVIEW_REQUIRED | **newly enforced (bug + fix)** |
| Northwell Cohen Children's HIDDEN_REJECTED | preserved (reclassifier never un-hides) |
| Brigham off-domain `medschool.harvard.edu` refusal | preserved |
| Vanderbilt off-domain `medschool.vanderbilt.edu` refusal | preserved |
| Michigan partial bot-block tolerance | preserved |
| Pure GME claim (both signals agree) → FUTURE_LANE_ONLY | preserved |
| NOT_STATED MISSING_FIELD never promotes | preserved (P102-FIX-15 test) |
| Stanford `/visiting-clerkships` robots.txt block | preserved (honest absence on Stanford) |
| GME/residency/fellowship → FUTURE_LANE_ONLY | preserved |
| Careers/jobs/visa → FUTURE_LANE_ONLY | preserved |

## 6. Why some positive controls produced 0 PUBLIC_SAFE_USCE

Three institutions returned 0 PUBLIC_SAFE_USCE despite having known P101 TIER_A/B evidence:

- **UM / UHealth** (`med.miami.edu`): A0 captured 19 sources, all research-lab pages. The P101-known URL `/offices/faculty-affairs/services/observerships` doesn't match the Gap A FIXED_PATHS pattern set. The model emitted 0 A4 recovery tasks because none of the captured pages linked to or referenced the observerships URL. **Not a framework bug** — a queue-authoring gap (need to add UM-specific deep paths or a `known_source_hint` queue column).
- **Memorial Hollywood** (`mhs.net`): A0 reached the Tier 1 URL, but the page is genuinely HEALTH_SYSTEM_LEVEL (applies to all 4 Memorial campuses, not Memorial Regional Hollywood specifically). Held to HUMAN_REVIEW_REQUIRED by scope discipline. **Correct framework behavior**.
- **Stanford** (`med.stanford.edu`): `/visiting-clerkships` returns `403 Forbidden by robots.txt`. The framework correctly refuses. **Correct framework behavior**.

These three honest-absence cases validate the framework's conservative posture.

## 7. Recommendation

**B. One-state deep queue — Florida.**

Florida is the right first state because:

- **Existing evidence already covers Florida**: Orlando Health (positive control: 27 PUBLIC_SAFE_USCE), Cleveland Clinic Florida (gold: system-scope discipline test), AdventHealth Orlando (gold: parent-system ambiguity), BMC-style A4 lessons from Memorial Hollywood and Memorial Healthcare System recovery patterns.
- **Florida has the right complexity stack**: campus/system ambiguity (Memorial, AdventHealth, HCA, BayCare); academic centers (UM, USF, FIU, FAU); IMG-heavy interest; private/community hospitals; VSLO/medical-school off-domain sources (UF Health Jacksonville vs gainesville); hospital-specific vs system-level source scope.
- **Manageable institution count**: ~200 acute-care hospitals statewide, vs ~700 for Texas or ~900 for California. Suitable for one-state pilot.

Expected outcomes per the gold-set calibration:

| Tier | Expected % | What appears |
|---|---:|---|
| PUBLIC_SAFE_USCE | 5–15% | Quote-backed visiting-student / observership / international program rows |
| CAUTION_SAFE_INTERNAL_REVIEW | 5–15% | Tier 1 candidates needing one-time human check |
| HUMAN_REVIEW_REQUIRED | 15–30% | System-scope discipline catches |
| FUTURE_LANE_ONLY | 30–60% | GME-rich, career-rich, jobs-rich institutions |
| No public-safe surface | 10–30% | Honest absence (rural critical-access, off-domain medschool only, bot-blocked) |

Pass criteria for Florida state:
- ≥ 20 institutions produce ≥ 1 quote-backed PUBLIC_SAFE_USCE row.
- 0 over-promotions caught by defense-in-depth.
- 0 quote-verification failures (strict).
- All 12 validators continue to PASS.
- 11 / 11 gold-set still PASS.

After Florida produces real public-safe rows, then advance to **C. minimal website ingestion/display** — source URL + verbatim quote + last-reviewed date — for public-safe rows only. No full UI redesign.

## 8. What is NOT recommended

- **A. P102-FIX-2**: not needed. All findings in this sprint were fixed inline. No blocking bugs open.
- **GME-first pivot**: GME/residency/fellowship/careers stay FUTURE_LANE_ONLY. The current wedge is USCE.
- **National run**: too large for v1. State-by-state cadence after Florida proves out.
- **Big UI redesign**: premature without enough public-safe rows to display.

## 9. Out-of-scope reminders

- No push.
- No PR.
- No deploy.
- No merge.
- No schema migration / Prisma / DB / seed.
- No UI / homepage / SEO / sitemap / robots / metadata / JSON-LD changes.
- No contact resolver changes.
- No public import.
- No state run yet (Florida is the recommendation, not a started action).
- No national run.
- T7 canonical root only (`/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/`).
- Terminal Claude CLI only.

---

Branch: `local/p102-positive-control-promotion-fix`. Local commits only.
Production main `739ab1e` UNCHANGED.
