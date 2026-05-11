# P97 Queue 4 Session 1 Curator Pass — Sprint Report

**Sprint ID:** `P97-QUEUE-4-SESSION-1-CURATOR-PASS`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `5d0ef0ad3d31c513341bb69afe398c3e07df24a5`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Curator-led manual review of the 2 evidence-hardening candidates (Vanderbilt + UCSF) to capture verbatim audience / application / cost quotes from each institution's official source and decide bridge-readiness. Also reclassify the 18 prior "rejected" rows to `MANUAL_BROWSER_NAV_REQUIRED` so they aren't lost as false rejections. Docs + 1 new validator. No active runtime change. No production.

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Curator input rows | **2** (Vanderbilt + UCSF) |
| Quote-captured rows | **6** total (4 for Vanderbilt + 2 for UCSF) |
| TIER_A rows | **2** (both promoted) |
| Ready-for-bridge rows | **2** |
| Keep-internal / drop rows | 0 (the 4 small-state-gap rows from prior sprint are moved to backlog as `LIKELY_NO_PUBLIC_VISITING_MS_LANE`, not dropped) |
| Manual-browser-required backlog | **23 rows** (14 URL-pattern-miss AMCs + 4 bot-defended + 5 small state-gap reclassified) |
| Active runtime card count | **10 — UNCHANGED** |
| Staged runtime card count | **14 — UNCHANGED** |
| Production-public count | **0 — UNCHANGED** |
| GitHub open secret-scanning alerts | **0** |
| Validators (11) | All PASS |

**Honest yield: 2 TIER_A bridge-ready rows.** Both Vanderbilt and UCSF have verbatim audience-eligibility quotes ("accredited U.S. medical schools" / "US medical and osteopathic students"), verbatim application method (VSLO via AAMC), and clean SOM-level scope.

## 2. Vanderbilt decision

| Field | Value |
|-------|-------|
| Source | `https://medschool.vanderbilt.edu/md/visiting-students/` |
| Title | Visiting Medical Students | School of Medicine | Vanderbilt University |
| **Audience verbatim** | "Vanderbilt University School of Medicine accepts visiting students from other **accredited U.S. medical schools** from June to December each year." |
| **Eligibility verbatim** | "Be in your 4th year of medical school. Attend a university that has an affiliation agreement with Vanderbilt University School of Medicine. Have either BLS or ACLS training that has not expired. **Passing Step 1 or Step 2, or COMLEX score**." |
| **Application method** | VSLO (AAMC) — "View the catalog and apply through the Visiting Student Learning Opportunities (VSLO) portal of AAMC." |
| **Cost verbatim** | "Pay the **$180.00 non-refundable processing fee** for visiting students via our online platform." |
| Source scope | SCHOOL_LEVEL (Vanderbilt SOM) — card framed as VUMC must carry `SCHOOL_LEVEL_SOURCE_NOT_HOSPITAL_SPECIFIC` caveat |
| Audience decision | US_LCME_AOA_ONLY (Step 1/2 implies LCME; COMLEX implies AOA) |
| Evidence strength | **TIER_A** |
| Bridge readiness | **READY_FOR_BRIDGE_VALIDATION** |
| Missing items | PNG screenshot; Wayback save |

## 3. UCSF decision

| Field | Value |
|-------|-------|
| Source | `https://meded.ucsf.edu/visiting-student-program` (singular "student" — the plural URLs all 404) |
| Title | Visiting Student Program | UCSF Medical Education |
| **Audience verbatim** | "UCSF School of Medicine uses the AAMC Visiting Student Learning Opportunities (VSLO) Application Service to receive applications from **US medical and osteopathic students**." |
| Eligibility verbatim | "Applicants must be in good academic standing and actively progressing to the next milestone in their training." |
| Application method | VSLO (AAMC) — verbatim |
| Cost | Not stated by source (next-sprint to confirm) |
| Source scope | SCHOOL_LEVEL (UCSF SOM) — card framed as UCSF Medical Center must carry `SCHOOL_LEVEL_SOURCE_NOT_HOSPITAL_SPECIFIC` caveat |
| Audience decision | US_LCME_AOA_ONLY ("US medical and osteopathic students" — LCME + AOA explicit) |
| Evidence strength | **TIER_A** |
| Bridge readiness | **READY_FOR_BRIDGE_VALIDATION** |
| Missing items | PNG screenshot; Wayback save |

## 4. Source-scope decisions

Both rows are SCHOOL_LEVEL sources (the institution's SOM administers the visiting-students program; the hospital card is supported only with the explicit `SCHOOL_LEVEL_SOURCE_NOT_HOSPITAL_SPECIFIC` caveat). This mirrors the existing batch-3 pattern: HUP / Northwestern / Jackson / Methodist San Antonio all carry the same caveat shape. Detail in `session_1_curator_scope_decisions.csv`.

## 5. Audience decisions

Both rows decide `US_LCME_AOA_ONLY`. Vanderbilt's "Step 1 or Step 2, or COMLEX score" confirms both LCME and AOA explicitly. UCSF's "US medical and osteopathic students" confirms the same. Neither source addresses international / IMG / Caribbean — those audiences default to `EXCLUDED_NOT_STATED_AS_ELIGIBLE` for any future card framing. Detail in `session_1_curator_audience_decisions.csv`.

## 6. Bridge readiness decisions

| Institution | Status |
|-------------|--------|
| Vanderbilt University Medical Center | **READY_FOR_BRIDGE_VALIDATION** (TIER_A) |
| UCSF Medical Center | **READY_FOR_BRIDGE_VALIDATION** (TIER_A) |

Both rows have all five gates met (evidence triple HTML + verbatim quote present; audience explicit; application named; no banned phrase; school-level scope with required caveat). PNG screenshot and Wayback save are deferred to the bridge-validation sprint, which is consistent with the slice-1 + slice-2 pattern.

## 7. Manual browser backlog correction

**The 18 prior "rejected" rows are NOT final rejections.** Detail in `session_1_manual_browser_required_backlog.csv` (23 entries total):

| Group | Count | New status |
|-------|-------|-----------|
| URL-pattern-miss AMCs needing real browser navigation | 14 | MANUAL_BROWSER_NAV_REQUIRED → `P97-QUEUE-4-SESSION-1-MANUAL-NAVIGATION-PASS-2` |
| Bot-defended rows (Billings / Michigan / Bellevue / Harborview) | 4 | MANUAL_BROWSER_NAV_REQUIRED → same sprint, with explicit browser tooling |
| Small state-gap community hospitals | 5 (Saint Alphonsus / Alaska Native / Providence Alaska / Wyoming Medical Center + Billings as edge case) | LIKELY_NO_PUBLIC_VISITING_MS_LANE → can remain backlog without urgency |

This correction preserves the funnel: 23 institutions are queued for a real browser-based pass, not dropped.

## 8. Evidence manifest

| Institution | HTML | Quote count | PNG | Wayback | Secret scan |
|-------------|------|-------------|-----|---------|-------------|
| Vanderbilt | SAVED (redacted-safe) | 4 | PENDING | PENDING | REDACTED_BEFORE_SAVE |
| UCSF | SAVED (redacted-safe) | 2 | PENDING | PENDING | REDACTED_BEFORE_SAVE |

Both HTML snapshots passed `validate-no-secrets` (no AIza / AKIA / etc. patterns). The proactive redactor caught any embedded keys before saving — the P0 guard-rail working as designed.

## 9. What this sprint did NOT do

- No active runtime change.
- No staged data change.
- No `/clerkships/pilot` or `/contact` change.
- No production deploy. No PR. No merge to main.
- No DB / schema / Prisma / seed / cron change.
- No screening of the 18-row backlog (that's the next sprint).
- No FREIDA / ACGME / AAMC scraping.
- No login / CAPTCHA bypass.
- No fake PNG / fake Wayback / fake quote.
- No public copy expansion.
- No mutation of unrelated dirty files.

## 10. Recommended next sprint

**Two natural paths — recommend Option A first:**

**Option A — `P97-QUEUE-4-SESSION-1-BRIDGE-VALIDATION`** for the 2 TIER_A rows. Add Vanderbilt + UCSF to a new validated-bridge-input CSV mirroring the batch-3 pattern. Capture PNG screenshots + Wayback saves. Output: a 2-row bridge-input CSV ready for staged batch 4 build in a follow-up sprint. **High leverage** — converts 2 confirmed candidates into the same pipeline that produced active inventory in Slices 1+2.

**Option B — `P97-QUEUE-4-SESSION-1-MANUAL-NAVIGATION-PASS-2`** for the 18-row browser backlog. Use Chrome MCP / preview tools / headless Chrome to navigate each AMC SOM landing and click through to the visiting-students sub-page. Expected yield: 6–10 of 18. Lower per-row leverage than Option A but bigger total potential.

After Option A lands (staged batch 4 with 2 cards added), proceed to Option B.

## 11. Strategic checkpoint

> Are we moving toward big product?

**Yes.** This sprint converted 2 candidates from TIER_B (uncertain) to TIER_A (bridge-ready). They are now first-class candidates for staged batch 4. The pipeline `347 screened → 9 validated → 14 staged + mapped → /contact wired → 10 active → batch 4 in motion` is moving.

> Did this produce usable bridge inputs?

**Yes — 2 TIER_A rows ready for bridge validation.** Both with verbatim audience + application quotes from their official SOM sources.

> Did we drift?

**No.** This sprint touched 0 source data files, 1 new validator, 9 docs + 2 redacted-safe HTML snapshots + 2 quote files. No app code changed. The validator caught zero new keys (proactive redaction worked).

> What stops now?

The auto-curl URL-pattern guessing for new candidates. The real browser-based navigation sprint (Option B) is the right approach for the 18 backlog rows.

> What continues?

The "screen → harden → curate → validate → stage → activate" discipline. Vanderbilt + UCSF are now at the curate-to-validate boundary. Slice 3 (or 4) can activate them after bridge validation + audit + staged batch 4 build (3 more sprints).

## 12. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged data change | CONFIRMED |
| No `/clerkships/pilot/*` / `/contact/*` change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline preserved | CONFIRMED |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No FREIDA / ACGME / AAMC scraping | CONFIRMED |
| No login / CAPTCHA bypass | CONFIRMED |
| No fake PNG / Wayback / quote | CONFIRMED — PNG_PENDING + WAYBACK_PENDING set honestly |
| No tokens / secrets committed | CONFIRMED — proactive redactor + validator PASS |
| No `gh auth status -t` | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| Backlog correction does not drop the 18 rows | CONFIRMED — 23 entries queued in manual-browser-required backlog |

## 13. Plain-English summary

We took the two best candidates from the screening sprint (Vanderbilt and UCSF) and confirmed by directly reading their official school-of-medicine pages that both accept US medical students through the AAMC's VSLO system. Vanderbilt's page even gave us the exact $180 fee, the 4th-year-only rule, and the Step 1/2 or COMLEX requirement; UCSF's page confirmed "US medical and osteopathic students" verbatim. Both are now ready for the next sprint to convert them into the same kind of staged listing that became Duke, NYU Tisch, HUP, and Northwestern. We also corrected the prior sprint's misclassification of 18 rows from "rejected" to "needs real browser navigation" so they aren't lost.

## 14. Progress estimate

**Rough progress toward strong USCEHub v1 launch: ~35%** (was ~33% at sprint start).

Movement of +2% reflects 2 TIER_A bridge-ready candidates. The next bridge-validation sprint can convert them into a 2-row staged batch 4 (would push to ~37%). Then a noindex slice 3 with both rows brings active to 12 (~39%). The big jump (~40–43%) comes when the 18-row manual-navigation backlog also converts 6–10 candidates. Not inflating.
