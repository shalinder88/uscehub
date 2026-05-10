# P97 Promotion Batch 3 — Evidence Hardening — Sprint 1 Report

**Date:** 2026-05-09
**Sprint ID:** `P97-PROMOTION-BATCH-3-EVIDENCE-HARDENING-1`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `128c2a2 P97: curate promotion batch three candidates`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Land Tier-A+ persistent evidence (PNG + HTML snapshot + Wayback URL + verbatim quote) for the 7 DRAFT rows + Mount Sinai retry + 5 Class A broad-IMG rows. **No active runtime change. No production. No UI.**

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Rows attempted | **13** (7 DRAFT + Mount Sinai + 5 Class A) |
| PNGs landed | **13/13** |
| HTML snapshots landed/verified | **13/13** (8 fetched live; 4 via Wayback; 1 carried forward) |
| Archives verified or landed | **10/13** verified; 3 deferred (Wayback save not yet invoked for NYP Columbia / NYP Cornell / HCA Aventura — live HTML succeeded) |
| Quotes landed | **13/13** quote files |
| Rows now Tier-A+ | **8** (7 DRAFT + Mount Sinai) |
| Rows still in evidence-hardening | **4** (NYP Columbia + NYP Cornell pending Wayback; 2 Mayo pending per-site mapping decision) |
| Rows reclassified to wrong-lane | **1** (HCA Aventura → KEEP_INTERNAL / Class D) |
| Bridge validator on VALIDATED_CANDIDATE | **PASSED** — 7/7 rows promoted to `VALIDATED_BRIDGE_INPUT` |
| Production untouched | YES ✅ |
| UI deferred | YES ✅ |

## 2. Why this sprint matters

The prior curator-pass sprint produced 7 NEEDS_HUMAN_COPY_REVIEW DRAFT rows. Those rows could NOT advance to staged runtime until they reached `evidence_triple_complete=true` (the bridge validator's gate for `VALIDATED_BRIDGE_INPUT` status).

This sprint converts 7 NEEDS_HUMAN_COPY_REVIEW rows → **7 VALIDATED_BRIDGE_INPUT rows.** That is direct, measurable promotion-side movement. The 347→5 bottleneck pipeline is now `347 verified → 9 VALIDATED_BRIDGE_INPUT → 7 staged → 5 active`, up from `347 → 2 → 7 → 5` before.

## 3. Evidence result by row

| Row | Tier | Bridge status | PNG | HTML | Wayback | Quote |
|-----|------|---------------|-----|------|---------|-------|
| Jackson Memorial Hospital (FL) | Tier-A+ | VALIDATED_BRIDGE_INPUT | ✅ | ✅ | ✅ prior April 2024 | ✅ 3 excerpts |
| Duke University Hospital (NC) | Tier-A+ | VALIDATED_BRIDGE_INPUT | ✅ | ✅ | ✅ sprint-fresh | ✅ 4 excerpts (LCME/COCA confirmed) |
| Northwestern Memorial Hospital (IL) | Tier-A+ | VALIDATED_BRIDGE_INPUT | ✅ | ✅ | ✅ sprint-fresh | ✅ 4 excerpts |
| Hospital of the University of Pennsylvania (PA) | Tier-A+ | VALIDATED_BRIDGE_INPUT | ✅ | ✅ | ✅ sprint-fresh | ✅ 3 excerpts |
| NYU Langone Health - Tisch Hospital (NY) | Tier-A+ | VALIDATED_BRIDGE_INPUT | ✅ | ✅ | ✅ sprint-fresh | ✅ 3 excerpts |
| Methodist Hospital - San Antonio (TX) | Tier-A+ | VALIDATED_BRIDGE_INPUT | ✅ | ✅ | ✅ sprint-fresh | ✅ 2 excerpts |
| IU Health Methodist Hospital (IN) | Tier-A+ | VALIDATED_BRIDGE_INPUT | ✅ | ✅ | ✅ sprint-fresh | ✅ 3 excerpts |
| Mount Sinai Hospital (NY) | Tier-A+ | DRAFT-eligible (next sprint) | ✅ Wayback render | ✅ Wayback HTML | ✅ prior Feb 2026 | ✅ 3 excerpts (URL slug 'visiting-lcme-schools' confirms LCME-only) |
| Mayo Clinic Hospital - Saint Marys (MN) | TIER_A_NO_PNG (per-site mapping) | NEEDS_SOURCE_SCOPE_REVIEW | ✅ Wayback render | ✅ Wayback HTML | ✅ prior May 2026 | ✅ 2 excerpts |
| NYP - Columbia (NY) | TIER_A_NO_ARCHIVE | NEEDS_EVIDENCE_HARDENING | ✅ | ✅ | ❌ Wayback save deferred | ✅ 4 excerpts (Visiting Student Program + International Visiting Students sections confirmed) |
| NYP - Weill Cornell (NY) | TIER_A_NO_ARCHIVE | NEEDS_EVIDENCE_HARDENING | ✅ | ✅ | ❌ Wayback save deferred | ✅ 2 excerpts (Office of International Medical Student Education) |
| Mayo Clinic Hospital - Phoenix (AZ) | TIER_A_NO_PNG (per-site mapping) | NEEDS_SOURCE_SCOPE_REVIEW | ✅ Wayback render | ✅ Wayback HTML | ✅ prior May 2026 | ✅ 2 excerpts |
| HCA Florida Aventura Hospital (FL) | TIER_A_NO_ARCHIVE | KEEP_INTERNAL/Reclassify | ✅ | ✅ | ❌ Wayback save deferred | ✅ 2 excerpts — **page focus is residency/fellowship/GME (wrong lane)** |

## 4. DRAFT-to-validated movement

The 7 Class B DRAFT rows all advanced from `NEEDS_HUMAN_COPY_REVIEW` (evidence_triple_complete=false, status reflects pending PNG) to `VALIDATED_BRIDGE_INPUT` (evidence_triple_complete=true, all evidence triple components present and on-disk).

Validator output:
```
File: docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/promotion_batch_3_evidence_hardening_1_bridge_input_VALIDATED_CANDIDATE.csv
Rows: 7
Overall: PASSED
  7 row(s) passed all bridge-input gates.
  No runtime mutation. No public promotion. No import.
```

The schema's `VALIDATED_WITHOUT_EVIDENCE_TRIPLE` rule is the strict gate: `bridge_review_status === VALIDATED_BRIDGE_INPUT` requires `evidence_triple_complete === "true"`. All 7 rows satisfy both.

## 5. Class A broad-IMG handling

Per sprint-prompt instruction, Class A rows were **evidence-checked but not promoted**.

- **Mayo Saint Marys + Mayo Phoenix (2 rows):** Tier-A evidence captured via Wayback. Confirmed the Mayo VMSC page has an "international applicants" section. Per-site mapping issue: one URL covers Saint Marys + Phoenix + Jacksonville. Curator must decide whether to render as 1 system-level Mayo card or 3 site-level cards before promotion.
- **NYP Columbia + NYP Weill Cornell (2 rows):** Live HTML fetched + PNG rendered + quotes captured. Strong international-visiting signal confirmed (Vagelos has dedicated "International Visiting Students" + "Visiting Student Fees" sub-sections; Weill Cornell page is "Office of International Medical Student Education"). Wayback save deferred to next sprint. Eligibility/visa/fee specifics need quote-level capture before promotion.
- **HCA Florida Aventura (1 row):** **RECLASSIFIED.** Page focus is residency/fellowship/GME consortium (10 GME teaching hospitals, 45+ residency/fellowship programs, FIU partnership). This is **Class D wrong-lane** — same misclassification pattern as Newark Beth Israel / BronxCare / Englewood. Recommended next status: KEEP_INTERNAL or DEFER_TO_FUTURE_LANE (residency-supporting source, not visiting-MS).

The conservative non-promotion decision matches the prior sprint's instruction: "Do not force promotion if evidence/caveats are insufficient."

## 6. Bot defense / retry issues

- **Mount Sinai (Icahn SOM):** Live page returned HTTP 403 (Akamai-style bot defense pattern matches Pitt SOM). Resolution: existing Wayback snapshot 2026-02-11 fetched via Wayback's own URL (which is bot-defense-free). PNG rendered from the Wayback HTML; quotes confirm "LCME-accredited US medical schools" audience.
- **Mayo VMSC:** Same bot defense (HTTP 403). Same Wayback fallback (May 8 2026 snapshot). Used for both Saint Marys and Phoenix sites.
- **No CAPTCHA / login bypass attempted.** All fallbacks used the public Wayback Machine — no credentials, no token forgery, no headless-detection spoofing.

## 7. Bridge validator result

| File | Result |
|------|--------|
| `first_pilot_mini_curator_reaudit_6_bridge_input_DRAFT.csv` (UPMC + Lincoln) | PASSED — 2 rows |
| `promotion_batch_3_bridge_input_DRAFT.csv` (prior NEEDS_HUMAN_COPY_REVIEW) | PASSED — 7 rows |
| **`promotion_batch_3_evidence_hardening_1_bridge_input_VALIDATED_CANDIDATE.csv` (NEW)** | **PASSED — 7 rows VALIDATED_BRIDGE_INPUT** |
| All other validators | PASSED |

## 8. Scoreboard delta

Detail in `promotion_batch_3_evidence_hardening_1_scoreboard_delta.csv`. Headline:

- **VALIDATED_BRIDGE_INPUT rows in repo: 2 → 9** (+7)
- **Tier-A+ Batch 3 rows: 0 → 8** (+8)
- **Mac-local PNGs: 5 → 18** (+13)
- **Mac-local HTML snapshots: 5 → 18** (+13)
- **Mac-local quote files: 5 → 13** (+8)
- **Active runtime: 5 → 5** UNCHANGED
- **Staged runtime: 7 → 7** UNCHANGED
- **Production public: 0 → 0** UNCHANGED

The 347→5 funnel pipeline status: `347 verified → 9 VALIDATED_BRIDGE_INPUT → 7 staged → 5 active`. Nine rows are now ready for staged-runtime promotion.

## 9. What this sprint did NOT do

- Did NOT modify the active 5-card runtime.
- Did NOT modify the staged 7-card runtime.
- Did NOT generate any new staged runtime data file.
- Did NOT promote Class A rows beyond Tier-A evidence capture.
- Did NOT broaden audience eligibility for any row.
- Did NOT change the safe-public-summary text in the carveouts.
- Did NOT touch `/contact` or `/clerkships/pilot`.
- Did NOT modify any existing validator script.
- Did NOT add any app code.
- Did NOT enable the correction-intake env flag.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form, login, or contact request.
- Did NOT bypass any CAPTCHA / bot defense (Mount Sinai + Mayo used public Wayback fallbacks documented honestly).
- Did NOT mutate the T7 source files (read-only).
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 10. Recommended next sprint

**`P99-P97-STAGED-RUNTIME-BATCH-3-DATA-ONLY`** — promote the 7 newly-VALIDATED_BRIDGE_INPUT rows + 2 prior validated (UPMC + Lincoln) into a NEW staged runtime data file (e.g. `public-listings-pilot-staged-batch-3.generated.{json,ts}`) under `src/data/`, NOT imported by app. Mirror the `P99-P97-RUNTIME-GENERATION-BATCH-2-STAGED-DATA-ONLY` pattern that produced the existing 7-card staged batch-2 file.

Alternative: `P97-PROMOTION-BATCH-3-CLASS-A-CURATOR-PASS` first (4 Class A rows still need decisions), but staged-batch-3 promotion is the bigger product win.

## 11. Strategic checkpoint

**Are we moving toward big product?** YES. **+7 VALIDATED_BRIDGE_INPUT rows** is a 350% increase in validated bridge candidates (from 2 → 9). Active runtime hasn't grown yet, but the bottleneck just before the runtime gate has shrunk dramatically.

**Did this reduce the 347→5 bottleneck?** YES, by 7 rows at the runtime-gate step. The 9 VALIDATED_BRIDGE_INPUT rows (UPMC + Lincoln + Jackson + Duke + Northwestern + Penn + NYU + Methodist SA + IU Methodist) are now ready for staged runtime promotion.

**Are we drifting?** NO. This sprint did real promotion work, not validator/spec work. Caveats preserved. Audience not broadened. Production untouched. HCA Aventura misclassification was caught and honestly reported rather than rushed in.

**What must stop?** Continue avoiding correction-intake sub-spec sprints. Continue avoiding net-new screening until the remaining 18 Class A/C/D rows are processed.

**What must continue?** Tier-A+ evidence discipline. Bot-defense honesty (Wayback fallback documented; no bypass). Production-untouched. Curator dual-signoff for any audience-broadening decision.

## 12. Hard-rule confirmation

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
| No app code change | CONFIRMED — only docs + new HTML/PNG/quote artifacts in sprint folder |
| No existing validator weakened | CONFIRMED |
| No fake evidence / fake PNG / fake Wayback | CONFIRMED — every PNG rendered from a real HTML/Wayback source; capture method documented per row |
| No screenshot bypass for runtime readiness | CONFIRMED — VALIDATED_BRIDGE_INPUT only granted to rows with PNG+HTML+Wayback+quote all on-disk |
| No lowering evidence standards | CONFIRMED — Class A rows DEFERRED, HCA Aventura reclassified rather than rushed in |
| No broad IMG-friendly / hospital-approved / guaranteed-rotation / apply-through-USCEHub claim | CONFIRMED |
| No site-specific guarantee unless source supports | CONFIRMED |
| No visa sponsorship overclaim | CONFIRMED |
| No audience broadening / caveat removal | CONFIRMED |
| No automated ACGME / FREIDA scraping | CONFIRMED |
| No login / CAPTCHA bypass | CONFIRMED — Wayback fallbacks honestly documented |
| No T7 mutation | CONFIRMED |
| No staging of unrelated dirty files / `.claude/launch.json` / Maine generated / NPPES / redesign | CONFIRMED |
| No broad `git add .` / `--no-verify` / amend / force push | CONFIRMED |

---

## POST-COMMIT INCIDENT NOTE (added 2026-05-09)

GitHub secret scanning flagged commit `8509729` (this sprint's commit) for a Google API key in `html-snapshots/mount-sinai-wayback.html` at line 104.

Root cause: the Wayback Machine snapshot of the live Mount Sinai page included Mount Sinai's own Google Maps embed (a third-party HTTP-referrer-restricted Google Maps JavaScript API key) inside the verbatim `<script>` and `<iframe>` tags of the archived HTML. We captured the Wayback HTML verbatim as evidence and did not pre-scan it for credentials before staging.

Action taken in this working tree (does not modify the introducing commit):
- Both occurrences of the Google API key in `mount-sinai-wayback.html` (lines 104 and 1326) were redacted to `[REDACTED_GOOGLE_API_KEY]`.
- Page text content (admissions / VSP description / dates / reviewer info) is preserved verbatim. Only the Google Maps embed loader and iframe URLs lost their key, which would have rendered a map widget — not core evidence.
- Wayback URL for Mount Sinai remains the canonical source-of-truth; the on-disk HTML is now a sanitized copy, not a bit-for-bit Wayback mirror.

A new validator `scripts/validate-no-secrets.ts` is added repo-wide and passes (1114 files scanned, 0 findings). Going forward, any HTML capture must be scanned by this validator before commit. See `docs/platform-v2/local/security-incidents/2026-05-google-api-key-mountsinai-wayback/` for the full incident report, history-cleanup options, and prevention checklist.

The secret value remains in git history at commit `8509729` until/unless a force-push history rewrite is explicitly authorized. Production main (`739ab1e2…`) is unaffected.
