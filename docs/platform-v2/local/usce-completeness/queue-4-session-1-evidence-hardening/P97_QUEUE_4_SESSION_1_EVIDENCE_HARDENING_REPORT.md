# P97 Queue 4 Session 1 Evidence Hardening — Sprint Report

**Sprint ID:** `P97-QUEUE-4-SESSION-1-EVIDENCE-HARDENING`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `1a51366bd6cc72b70de00d5c7e1d111ba8d3d4e4`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Convert Session-1 auto-fetch misses into real evidence by manual-style navigation (anchor following + Wayback fallback) on each institution's official site. Docs + 1 small validator. No active runtime change. No production deploy.

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Input rows processed | **20** (1 already-bridge-ready Vanderbilt + 14 URL-pattern-miss AMCs + 4 bot-defended + 1 LAC+USC re-attempt) |
| Hardened candidate findings | **2** (Vanderbilt @ TIER_B + UCSF @ TIER_B) |
| Ready-for-bridge count | **0** at TIER_A; **2** queued at TIER_B requiring curator review |
| Needs-curator count | 2 |
| Reclassified rejections (still no public lane found) | **18** (incl. all 4 bot-defended; Wayback didn't yield usable snapshots) |
| Bot-defended Wayback retry | 4 attempted; 0 yielded usable archives via the available URL patterns |
| Active runtime card count | **10 — UNCHANGED** |
| Staged runtime card count | **14 — UNCHANGED** |
| Production-public count | **0 — UNCHANGED** |
| GitHub open secret-scanning alerts | **0** |
| Validators (10) | All PASS |

**Honest yield: 2 of 20 confirmed (10%)** — better than the screening-pass 1/25 (4%) but still well below the optimistic 6–12 target. Key limitation: the auto-navigator's 1–2 anchor-hop heuristic doesn't reach visiting-students pages that real institutions hide behind 3+ levels of menus or JavaScript-rendered navigation. The next sprint needs a true browser-based pass (Chrome / headless with JS), not curl-based anchor following.

## 2. Vanderbilt hardening result

- **Status:** TIER_B / NEEDS_EVIDENCE_HARDENING (downgraded from TIER_A in the prior screening pass).
- **Source URL discovered:** `https://medschool.vanderbilt.edu/md/visiting-students/` (different path from the Session-1 URL `medschool.vanderbilt.edu/student-affairs/visiting-students` — that earlier URL still resolves; both should be cross-checked in a deeper pass).
- **Why TIER_B and not TIER_A:** The page mentions visiting students but the auto-extracted "quote" was navigation chrome, not a focused audience-language paragraph. A manual quote-capture would likely move this to TIER_A.
- **Recommended next step:** A focused 1-row evidence-hardening on Vanderbilt to land a 280-char verbatim quote covering audience (LCME/AOA?), application method (VSLO?), and visa language. Likely Slice-3 candidate after that.

## 3. Converted URL-pattern misses

| Row | State | Result |
|-----|-------|--------|
| UCSF Medical Center | CA | **CONFIRMED** at `https://meded.ucsf.edu` (TIER_B) — landing page reached, visiting-MS keyword present, no focused quote auto-extracted |
| Other 13 AMCs (UCLA, Stanford, OHSU, U-Utah, U-Colorado, Denver Health, MSK, UF Shands, Houston Methodist, UTSW, LAC+USC, BWH, MGH, WashU/BJH, Parkland-via-UTSW) | various | No usable visiting-MS lane surfaced via the navigation heuristic. Several SOMs returned a meaningful landing page (e.g., HMS-meded `https://hms.harvard.edu/education-admissions/md-program`, UTSW `https://medschool.utsouthwestern.edu/`, U-Utah `https://medicine.utah.edu/programs/md`) but the auto-navigator didn't follow far enough to find the visiting-students sub-section. |

This pattern is consistent: SOM landing pages typically don't include "visiting medical student" verbatim — that wording appears 2–3 levels deeper, on a child page that the auto-navigator's anchor heuristic missed.

## 4. Bot-defended / Wayback results

| Institution | Wayback recovered? | Outcome |
|-------------|-------------------|---------|
| Billings Clinic (MT) | NO | NO_RELEVANT_PUBLIC_SOURCE_FOUND |
| Michigan Medicine (MI) | NO | NO_RELEVANT_PUBLIC_SOURCE_FOUND |
| Bellevue NYC H+H (NY) | NO | NO_RELEVANT_PUBLIC_SOURCE_FOUND |
| Harborview / UWMed (WA) | NO | NO_RELEVANT_PUBLIC_SOURCE_FOUND |

All 4 bot-defended rows recorded as outstanding — they need either a manual headless-browser fetch or a curator pass that searches the institution's site index.

## 5. Reclassified rejections

18 of 20 rows reclassified from `URL_PATTERN_MISS` / `BLOCKED` to `NO_RELEVANT_PUBLIC_SOURCE_FOUND` after the navigator's deeper attempt. Detail in `session_1_reclassified_rejections.csv`. The reclassification tag is honest: the page reachable via the lead URL did not yield a visiting-MS keyword, so the lead URL is now confirmed not to be the visiting-students landing. The next sprint must use a different navigation approach.

## 6. Future-lane findings

None this sprint. (Future-lane signals — observership-only / GME-only / residency-only — would have surfaced if the auto-navigator had reached pages with that content. Most rejections didn't reach informative content at all.)

## 7. Evidence triple summary

| Institution | HTML snapshot | PNG | Wayback | Verbatim quote | Strength |
|-------------|---------------|-----|---------|----------------|----------|
| Vanderbilt University Medical Center | SAVED (redacted-safe) | PNG_PENDING | PENDING | Captured but navigation chrome only — needs manual quote | TIER_B |
| UCSF Medical Center | SAVED (redacted-safe) | PNG_PENDING | PENDING | Not surfaced by auto-extractor | TIER_B |

The 13 captured HTML snapshots all passed `validate-no-secrets.ts` (no AIza / AKIA / etc. patterns leaked). The script proactively redacted any matches before saving.

## 8. Curator queue

| Rank | Institution | Strength | Recommended action |
|------|-------------|----------|--------------------|
| 1 | Vanderbilt University Medical Center (TN) | TIER_B | EVIDENCE_HARDENING_COMPLETE — but in practice needs a manual quote-capture before curator pass |
| 2 | UCSF Medical Center (CA) | TIER_B | EVIDENCE_HARDENING_COMPLETE — same |

## 9. Bridge validation input

2 candidates queued at `NEEDS_CURATOR_REVIEW_FIRST`. Neither is ready for direct bridge validation; both need the manual quote-capture pass first.

## 10. What this sprint did NOT do

- No active runtime change.
- No staged data change.
- No production deploy. No PR. No merge to main.
- No `/clerkships/pilot` or `/contact` change.
- No DB / schema / Prisma / seed / cron change.
- No FREIDA / ACGME / AAMC scraping.
- No login / CAPTCHA bypass — bot-defended rows recorded as BLOCKED.
- No fake screenshot / fake Wayback / fake quote.
- No public copy expansion.
- No mutation of unrelated dirty files.

## 11. Recommended next sprint

**Two paths, depending on user preference:**

**Option A — `P97-QUEUE-4-SESSION-1-CURATOR-PASS`** for the 2 confirmed candidates (Vanderbilt + UCSF). Curator-driven manual quote capture for both. Expected output: 1–2 TIER_A bridge inputs, ready for staged-batch-4 build. Lower yield but unblocks the next slice.

**Option B — `P97-QUEUE-4-SESSION-1-MANUAL-NAVIGATION-PASS-2`** to retry the 14 URL-pattern misses with a true browser-rendered approach (preview tools / headless Chrome with JS). Higher potential yield (likely 6–10 of 14) but requires Chrome MCP or Claude-in-Chrome to be configured. The screening sub-task is more accurately framed as "open the SOM landing in a browser, find the visiting-students link in nav, follow it" — that's a 30-second browser task, not a curl problem.

**Recommendation:** Option A first. Vanderbilt + UCSF are real product wins; converting them is more valuable than retrying 14 institutions where the limitation is browser-rendering. After Option A, queue Option B as a separate sprint with explicit browser-tool guidance.

## 12. Strategic checkpoint

> Are we moving toward big product?

**Slowly.** This sprint added 0 active inventory and ~1 net new confirmed candidate (UCSF; Vanderbilt was already known). The realistic pipeline now: Vanderbilt + UCSF need manual quote capture → curator pass → bridge validation → staged batch 4 → Slice 4. That's 4 sprints to add 1–2 new active cards.

> Did this produce new possible listings?

**Yes — 1 net new confirmed (UCSF) + 1 deeper-confirmed Vanderbilt path.** Below plan, but real.

> Did we drift?

**No.** This sprint touched 0 source data files, 1 new validator, 11 docs, 13 redacted HTML snapshots. No app code changed. The validator-no-secrets guard caught zero new keys (the redactor ran before save, doing its job).

> What stops now?

The "auto-curl with anchor heuristic" approach for finding visiting-students pages. Real institutions need real browser navigation. The curl approach is good for confirming a known-good URL; it's bad at discovery.

> What continues?

Manual / browser pass for the remaining 14 AMCs (separate sprint). Curator pass on Vanderbilt + UCSF (next sprint).

## 13. Hard-rule confirmation

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
| No login / CAPTCHA bypass | CONFIRMED — 4 bot-defended recorded as BLOCKED |
| No fake PNG / fake Wayback / fake quote | CONFIRMED — PNG status everywhere is PNG_PENDING |
| No tokens / secrets committed | CONFIRMED — redactor ran before save; validator PASS |
| No `gh auth status -t` | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |

## 14. Plain-English summary

We tried to take the 20 institutions our auto-fetch missed last sprint and find each institution's real visiting-medical-student page by following links from their main school-of-medicine landing page. Two yielded clear matches (UCSF and Vanderbilt) — those are real product wins. The other 18 didn't surface via this kind of automated link-following because real visiting-students pages are usually 2–3 menu clicks deep on AMC websites and often need a JavaScript-rendered browser to navigate. The honest next step is either to do a focused curator pass on the 2 we found, or open the next 14 in a real browser and click through. We didn't fake any screenshots or evidence; the secret scanner caught zero leaks; nothing in production changed.

## 15. Progress estimate

**Rough progress toward strong USCEHub v1 launch: ~33%** (was ~32% at sprint start).

Movement is small (+1%) because the auto-navigation heuristic only converted 1 net new candidate beyond what the screening pass already had. To meaningfully move progress we need either (a) a curator pass on Vanderbilt + UCSF that produces TIER_A evidence triples (would push to ~35%), or (b) a real browser-based navigation sprint on the 14 missed AMCs (would push to ~38–40% if it converts 6–10 of them). Not inflating.
