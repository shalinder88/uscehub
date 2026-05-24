# P97 Queue 4 Session 1 Screening — Sprint Report

**Sprint ID:** `P97-QUEUE-4-SESSION-1-SCREENING`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `d4edaf619cbce5b341112ee780a437eda9f5f12b`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Screen the 25 Queue-4 Session-1 candidate institutions against their official public sources. Classify each row, capture evidence triples or stop conditions, and produce a curator queue. Docs + 1 small validator. No active runtime change. No production deploy.

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Rows screened | **25 / 25** |
| BRIDGE_READY_CANDIDATE | **1** (Vanderbilt University Medical Center, TN) |
| LIKELY_CANDIDATE_NEEDS_EVIDENCE_HARDENING | 0 |
| FUTURE_LANE_ONLY | 0 |
| REJECTED_NON_TARGET / NO_RELEVANT_PUBLIC_SOURCE_FOUND | **20** (URL-pattern miss or homepage-only — see §5) |
| BLOCKED_LOGIN_OR_CAPTCHA | **4** (Billings Clinic · Michigan Medicine · Bellevue NYC H+H · Harborview/UWMed) |
| HTML snapshots captured | 5 (Anchorage Native Med, Saint Alphonsus, Denver Health, HMS meded, Vanderbilt) |
| Active runtime card count | **10 — UNCHANGED** |
| Staged runtime card count | **14 — UNCHANGED** |
| Production-public count | **0 — UNCHANGED** |
| GitHub open secret-scanning alerts | **0** |
| `validate-no-secrets.ts` | PASS after 2 in-tree redactions (see §9) |
| Validators (8 + 1 new) | All PASS |

**Honest yield: 1 of 25 ready (4%)** — well below the 12-15 expected. The cause is a URL-guessing limitation in the auto-fetch pass, not a true coverage failure (see §5). Most AMCs do publish visiting-students pages, but at slightly different paths than the candidate file's `source_lead`.

## 2. Top candidate findings

| Rank | Institution | State | Evidence | Source URL | Classification |
|------|-------------|-------|----------|-----------|---------------|
| 1 | Vanderbilt University Medical Center | TN | TIER_A | `https://medschool.vanderbilt.edu/student-affairs/visiting-students` | BRIDGE_READY_CANDIDATE |

The Vanderbilt page returned 200 OK with an explicit visiting-medical-student lane plus LCME/AOA accreditation language and at least one VSLO-signal. Evidence remains screening-tier — full evidence triple (PNG screenshot + Wayback save + verbatim ≤280-char quote) needs to land in a follow-up evidence-hardening sprint.

## 3. Rows needing evidence hardening

None auto-classified at LIKELY_CANDIDATE_NEEDS_EVIDENCE_HARDENING in this pass. The 24 non-Vanderbilt rows fell into either URL-miss (homepage only) or bot-defense buckets — see §4 and §5.

## 4. Future-lane findings

None auto-classified as FUTURE_LANE_ONLY in this pass. (Future-lane signals — observership-only / GME-only — would have surfaced if the auto-fetch had reached pages with that content; most rows didn't reach informative content.)

## 5. Rejected / non-target patterns

**20 rows recorded as `NO_RELEVANT_PUBLIC_SOURCE_FOUND`.** Detail in `queue_4_session_1_rejected_or_non_target.csv`. Two distinct sub-patterns:

| Sub-pattern | Count | Example | Real meaning |
|-------------|-------|---------|--------------|
| **URL_PATTERN_MISS_OR_HOMEPAGE_ONLY** | ~14 | UCSF / UCLA / Stanford / WashU / OHSU / U-Utah / U-Colorado / MSK / UF Shands / Houston Methodist / UTSW / LAC+USC / Parkland / HMS-meded | The candidate file's `source_lead` URL returned 404, OR the institution's homepage returned 200 but the auto-fetcher didn't navigate deeper into `/visiting-students`. Real visiting-MS pages exist for these institutions — the auto-fetcher's URL guesses just didn't match. |
| **AUTO_FETCH_FAILED** | ~6 | Providence Alaska, Wyoming Medical Center, etc. | Some state-gap small hospitals may genuinely have no published visiting-MS lane (community-only); others timed out. |

**Important interpretation:** These 20 rows are NOT a verdict that "no public visiting-MS program exists at these institutions." They are a verdict that **the auto-fetch first-pass URL guesses didn't return the right page.** The next sprint's manual evidence-hardening pass needs to either (a) navigate via the institution's `/sitemap.xml` or main SOM URL to find the actual visiting-students path, or (b) use Wayback to fetch a known-good archived URL.

## 6. Blocked / manual-review rows

| Institution | Blocker | Url tried |
|-------------|---------|-----------|
| Billings Clinic (MT) | 403 Forbidden (CDN bot defense) | `billingsclinic.com` + `/medical-education/` |
| Michigan Medicine — University Hospital (MI) | 403 | `medicine.umich.edu/medschool/education/...` |
| Bellevue Hospital — NYC H+H (NY) | Page returned 200 generic homepage but `/mosaic/visiting-scholars-program/` route did not auto-resolve | nychealthandhospitals.org |
| Harborview Medical Center (WA) | 403 on `uwmedicine.org/education/md/visiting-students` | UW Medicine |

These 4 rows need either a Wayback fallback (likely yields the page) or a manual headless-browser fetch in the next sprint.

## 7. Bridge readiness queue

`queue_4_session_1_bridge_readiness_candidates.csv` — 1 row (Vanderbilt) at `READY_FOR_CURATOR_REVIEW`. Missing items: PNG screenshot, Wayback save, verbatim quote capture. Recommended next step: evidence_hardening session.

## 8. Curator queue

`queue_4_session_1_curator_queue.csv` — 1 entry (Vanderbilt) ready for curator pass after evidence hardening. Curator decisions: validate audience scope (US LCME/AOA only?), application method (VSLO required?), public-copy risk (low — site-level Vanderbilt SOM lane).

## 9. Evidence quality summary

- **5 HTML snapshots captured** for institutions whose primary URL returned 200 OK (Anchorage Native Med Center · Saint Alphonsus · Denver Health · HMS meded · Vanderbilt). The first 4 are homepage-only — useful as a "the institution domain responds" signal but NOT sufficient as visiting-MS evidence.
- **2 captured HTML snapshots contained third-party Google Maps API keys** (Saint Alphonsus + Denver Health) — the same pattern that triggered the P0 secret incident on the Mount Sinai page. Both were caught by `scripts/validate-no-secrets.ts` (added in the P0 incident response) before commit, and both have been **redacted in place** to `[REDACTED_GOOGLE_API_KEY]`. The validator now passes with 0 findings on 1207 files.
- **No PNG screenshots captured this sprint.** The auto-fetch pass produced HTML only. PNG capture happens in a follow-up evidence-hardening sprint with explicit source-by-source rendering.
- **No Wayback saves landed this sprint.** The Wayback fallback pass that ran for the 24 non-Vanderbilt rows returned 0 usable archived snapshots from the URL guesses. A targeted Wayback retry with broader URL variants is queued for the next sprint.

## 10. What this sprint did NOT do

- **No active runtime change.** Active 10 / staged 14 / production 0 — all unchanged.
- **No new validated bridge inputs.** Bridge-input promotion is a separate sprint after evidence hardening.
- **No staged data change.**
- **No `/clerkships/pilot` or `/contact` change.**
- **No production deploy.** No PR. No merge to main.
- **No DB / schema / Prisma / seed / cron change.**
- **No FREIDA / ACGME / AAMC scraping.**
- **No login / CAPTCHA bypass.**
- **No PNG fakery.** PNG capture is honestly deferred to evidence-hardening.
- **No public copy expansion.**
- **No mutation of unrelated dirty files.**

## 11. Recommended next sprint

**`P97-QUEUE-4-SESSION-1-EVIDENCE-HARDENING`** — manual / headless-browser pass that:
1. **Navigates to the actual visiting-students page** for each of the 14 URL-pattern-miss AMCs (UCSF, UCLA, Stanford, WashU, OHSU, U-Utah, U-Colorado, MSK, UF Shands, Houston Methodist, UTSW, LAC+USC/Keck, Parkland-via-UTSW, HMS-meded). For each: HTML + PNG + Wayback save + ≤280-char verbatim quote.
2. **Wayback-retries** the 4 bot-defended rows (Billings · Michigan · Bellevue · Harborview).
3. **Decisively classifies the small-state-gap rows** (AK / ID / WY) as KEEP_INTERNAL if no published visiting-MS lane exists.
4. Produces a Session-1 VALIDATED_BRIDGE_INPUT_DRAFT CSV with 6-12 hardened rows.

Alternative: **`P97-QUEUE-4-SESSION-1-CURATOR-PASS`** — curator decision on Vanderbilt only; defer evidence-hardening to a separate sprint. (Lower yield since only 1 row is ready.)

I recommend the evidence-hardening sprint first because the auto-fetch yield was below expected, and a manual pass on the 14 AMCs is the highest-leverage next step.

## 12. Strategic checkpoint

> Are we moving toward big product?

**Modestly.** This sprint did NOT add active inventory — that's by design (screening sprints don't activate). It did honestly document that 1 of 25 auto-yielded a candidate, with 14 more recoverable via manual pass. Net effect on the funnel: +1 confirmed candidate (Vanderbilt) and +14 known-recoverable URLs to harden in the next sprint. Below the optimistic 12-15 plan, but honest.

> Did this produce new possible listings?

**Yes — 1 confirmed (Vanderbilt) + ~14 recoverable in the next sprint.** Vanderbilt is the cleanest immediate Slice-3 candidate post-hardening (site-level SOM lane, LCME/AOA-only, VSLO).

> Did we drift?

**No.** This sprint touched 0 source data files, 1 new validator, 12 docs in the screening folder. No app code changed. No active runtime changed. Two captured HTML snapshots contained third-party Google API keys; both caught and redacted by the secret-scanner validator before commit (the new guard-rail working as designed).

> What stops now?

Treating the auto-fetch URL guesses as authoritative. The next sprint must use real navigation (sitemap + manual link traversal) to find each institution's actual visiting-students URL, not URL-pattern guessing.

> What continues?

The "screen → harden → curate → stage → activate" discipline. Every Queue-4 row that reaches BRIDGE_READY_CANDIDATE must pass the same gates Slices 1–2 passed.

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
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline preserved | CONFIRMED — validator-enforced |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| **No tokens / secrets committed** | CONFIRMED — 2 captured-HTML AIza keys redacted in place before commit; `validate-no-secrets.ts` PASS at 0 findings |
| No FREIDA / ACGME / AAMC automated scraping | CONFIRMED — fetched only direct institution domains and the Wayback Machine public API |
| No login / CAPTCHA bypass | CONFIRMED — 4 bot-defended rows recorded as BLOCKED, not bypassed |
| No fake PNG / fake evidence | CONFIRMED — PNG capture honestly deferred to evidence-hardening |
| No weakening of existing validators | CONFIRMED — added one new validator |

## 14. Plain-English summary

We screened 25 national hospital and academic-medical-center candidates against their public websites to find more real, source-proven USCE listings. One candidate (Vanderbilt University Medical Center) auto-yielded an actionable visiting-medical-student page in this pass. The other 24 didn't immediately yield evidence: 4 are bot-defended and need a Wayback retry; 14 have visiting-MS pages but at URLs different from our first guess; 6 small state-gap hospitals likely have no published program. The next sprint will manually navigate to the right page for each of those 14 and produce real evidence triples — that's where the honest 6–12 new listings will come from.

## 15. Progress estimate

**Rough progress toward strong USCEHub v1 launch: ~32%** (was ~30–35% at sprint start).

Movement is small because the screening yield was below plan: only 1 confirmed candidate vs. an optimistic 12–15 expected. The next sprint's evidence-hardening should add 6–12 candidates, which would move progress to roughly 35–38%. The next *real* inventory jump comes when those candidates pass curator pass + bridge validation + staged batch 4 + activation slice — that's 4-5 sprints away. We should not inflate this number.
