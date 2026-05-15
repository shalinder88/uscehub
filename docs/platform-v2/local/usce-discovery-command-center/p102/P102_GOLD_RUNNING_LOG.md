# P102-GOLD Running Log — Per-Institution Results

schemaVersion: p102-deep-0f-1
sprint: P102-GOLD deep benchmark
branch: `local/p102-gold-deep-benchmark`
status: IN PROGRESS

Per the operating model, this log is appended **one institution at a time**. Institution N is fully complete (deep packet written, regate verdict, quote-verify passed, validators green, final status assigned) before institution N+1 begins.

Final status values:
- `GOLD_PASS_PUBLIC_SAFE_FOUND` — ≥1 quote-verified PUBLIC_SAFE_USCE produced
- `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT` — 0 PUBLIC_SAFE_USCE, framework correctly identified absence
- `GOLD_PASS_FUTURE_LANE_ONLY` — institution only produces future-lane content (GME/jobs/etc.)
- `GOLD_PASS_HUMAN_REVIEW_REQUIRED` — produces ≥1 HUMAN_REVIEW candidate, no false PUBLIC_SAFE
- `GOLD_FAIL_QUOTE_VERIFICATION` — re-verify failed
- `GOLD_FAIL_SCOPE_DISCIPLINE` — system/school-level source incorrectly attributed to campus
- `GOLD_FAIL_OVERPROMOTION` — Tier 2/3 content promoted to PUBLIC_SAFE_USCE
- `GOLD_FAIL_MISSING_TIER` — required tier unexpectedly absent without honest reason
- `GOLD_BLOCKED_FETCH` — A0 capture blocked (bot/403); document and continue
- `GOLD_NEEDS_P102_FIX` — exposes a framework bug requiring a fix

---

_(Entries appended below as each institution completes.)_

---

## Gold #5 — Hartford Hospital (Hartford, CT) — `hartfordhospital.org`

Run ID: `p102-0r-dry-run-1`. Failure mode: no public lane by absence after broad search.

| Metric | Value |
|---|---:|
| Source candidates probed | 2 (existing A0 capture) |
| Accepted sources | 2 (/research, /careers) |
| Rejected sources | 0 |
| Tier 1 claims | 0 (TIER_COVERAGE_WEAK) |
| Tier 2 claims | 0 |
| Tier 3 claims | 3 |
| PUBLIC_SAFE_USCE | **0** |
| FUTURE_LANE_ONLY | 3 |
| HUMAN_REVIEW_REQUIRED | 0 |
| Quote-verified | 3 / 3 (100%) |
| Rejected on quote re-verify | 0 |
| A4 tasks before / after | 0 / 0 |
| Scope conflicts | 0 |
| Public-safety failures | 0 |
| Model A3 verdict | PASS_PUBLISH_READY |
| Deterministic regate verdict | PASS_WITH_CAVEATS |

**Final status: `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT`**

The institution publishes a research page and a careers page on its primary domain. Neither contains USCE content. No /observership, /visiting-student, /electives paths returned 200 in the A0 probe. The framework correctly returned zero PUBLIC_SAFE_USCE without inventing absence-as-refusal. Tier 1 status is WEAK (not NEGATIVE) because no explicit refusal sentence exists on the captured pages.

Caveat: Hartford's deep-mode read only saw 2 accepted sources. If a more thorough Tier 1 search had been authorized (e.g. via `--fetch-additional` to probe `/medical-education`, `/medical-students`, `/student-affairs`), additional Tier 1 pages might or might not exist. The current outcome reflects an absence after the deterministic-probe search.

---

## Gold #3 — Houston Methodist Hospital (Houston, TX) — `houstonmethodist.org`

Run ID: `p102-1-trial-2-run-1`. Failure mode: false-positive `/observership` URL (resolves to a Pharmacy P1/P2 externship).

| Metric | Value |
|---|---:|
| Source candidates probed | 39 (existing A0 capture) |
| Accepted sources | 6 |
| Rejected sources | 33 (HTTP 404s) |
| Tier 1 claims | 19 (TIER_COVERAGE_PARTIAL, lane `CAUTION_SAFE_INTERNAL_REVIEW`) |
| Tier 2 claims | 17 |
| Tier 3 claims | 17 |
| PUBLIC_SAFE_USCE | **0** (correct — `/observership` is a Pharmacy P1/P2 externship, model correctly held it at HUMAN_REVIEW_REQUIRED) |
| FUTURE_LANE_ONLY | 1 (Tier 1) + future-lane Tier 2/3 |
| HUMAN_REVIEW_REQUIRED | 15 (Tier 1) + future-lane Tier 2/3 |
| Quote-verified | 53 / 53 (100%) |
| Rejected on quote re-verify | 1 (filtered by orchestrator during deep extraction) |
| A4 tasks before / after | 0 / 0 (model correctly concluded no Tier 1 medical-student observership page exists) |
| Scope conflicts | 0 |
| Public-safety failures | 0 |
| Model A3 verdict | PASS_PUBLISH_READY |
| Deterministic regate verdict | PASS_WITH_CAVEATS |

**Final status: `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT`**

The framework correctly identified that Houston Methodist's `/observership` is a Pharmacy P1/P2 externship — NOT a medical-student observership — and held it at HUMAN_REVIEW_REQUIRED rather than promoting to PUBLIC_SAFE_USCE. This is the canonical "false-positive URL is a redirect" test, and the framework passed it cleanly. The model also correctly held other Tier 1 candidate quotes (audience-unclear references) at the CAUTION_SAFE_INTERNAL_REVIEW lane (which the classifier then routes to FUTURE_LANE_ONLY or HUMAN_REVIEW based on source family). Zero scope conflicts, zero overclaims.

---

## Gold #8 — The Brooklyn Hospital Center (Brooklyn, NY) — `tbh.org`

Run ID: `p102-1-trial-2-run-2`. Failure mode: GME-rich but no USCE; framework must not promote any of the 87+ GME claims to Tier 1.

| Metric | Value |
|---|---:|
| Source candidates probed | 59 (existing A0 capture, includes deep paths) |
| Accepted sources | 23 |
| Rejected sources | 36 |
| Tier 1 claims | 19 (TIER_COVERAGE_PARTIAL, lane `FUTURE_LANE_ONLY` because most "student" mentions are residency/podiatry students, not medical students) |
| Tier 2 claims | 62 |
| Tier 3 claims | 6 |
| PUBLIC_SAFE_USCE | **0** |
| FUTURE_LANE_ONLY | majority of all 87 |
| HUMAN_REVIEW_REQUIRED | 1 |
| Quote-verified | 87 / 87 (100%) |
| Rejected on quote re-verify | 0 |
| A4 tasks before / after | 0 / 0 |
| Scope conflicts | 0 |
| Public-safety failures | 0 |
| Model A3 verdict | PASS_PUBLISH_READY |
| Deterministic regate verdict | PASS_WITH_CAVEATS |

**Final status: `GOLD_PASS_FUTURE_LANE_ONLY`**

Brooklyn has substantial GME / residency / fellowship content (podiatry, emergency medicine, internal medicine, pharmacy) and a volunteer program. The framework correctly classified almost everything as Tier 2 future-lane and did NOT promote any of the heavy GME content to Tier 1 USCE. The 19 Tier 1 candidates (e.g., podiatry "student-visitation", "externship") were correctly held to FUTURE_LANE_ONLY because the page audience is residency/podiatry rotators, not medical students seeking observership. This validates the deep classifier's tier-discipline.

---

## Gold #6 — AdventHealth Orlando (Orlando, FL) — `adventhealth.com`

Run ID: `p102-1-trial-2-run-3`. Failure mode: parent-system / campus ambiguity; system-domain content must NOT auto-attribute to Orlando.

| Metric | Value |
|---|---:|
| Source candidates probed | 39 + 6 A4 = 45 total |
| Accepted sources | 8 + 1 from A4 = 9 |
| Rejected sources | 31 + 5 A4 rejects |
| Tier 1 claims | 32 (TIER_COVERAGE_WEAK at packet, lane `HUMAN_REVIEW_REQUIRED`) |
| Tier 2 claims | 30 |
| Tier 3 claims | 22 |
| PUBLIC_SAFE_USCE | **0** (after the P102-0G scope-discipline bugfix; all 32 Tier 1 candidates held to HUMAN_REVIEW_REQUIRED because every source is on system-domain `adventhealth.com`) |
| FUTURE_LANE_ONLY | 24 |
| HUMAN_REVIEW_REQUIRED | 61 |
| Quote-verified | 85 / 85 (100%) |
| Rejected on quote re-verify | 0 |
| A4 tasks before / after | 2 / 0 (1 task fetched the AdventHealth Redmond clerkship page; the page is rich Tier 1 content but explicitly about Redmond, GA — correctly held to HUMAN_REVIEW for AdventHealth Orlando) |
| Scope conflicts | 0 (deterministic re-classifier held all system-domain Tier 1 candidates) |
| Public-safety failures | 0 |
| Model A3 verdict | PASS_PUBLISH_READY |
| Deterministic regate verdict | PASS_WITH_CAVEATS |

**Final status: `GOLD_PASS_HUMAN_REVIEW_REQUIRED`** (with a fixed framework bug recorded in P102-0G)

This is the institution that exposed the P102-0G scope-discipline bug: an A4-fetched Redmond clerkship page (rich medical-student USCE content on `adventhealth.com`) was being promoted to PUBLIC_SAFE_USCE because the orchestrator was accepting the model's emitted `INSTITUTION_SPECIFIC` scope. The fix (deterministic `inferSourceScope` ALWAYS overrides the model's emission) now correctly classifies the same content as HUMAN_REVIEW_REQUIRED for AdventHealth Orlando. This is the canonical "system-domain rich content must not auto-attribute to the campus" test, and the framework passed it (after the bug was found and fixed).

---

## Gold #1 — Cleveland Clinic Florida (Weston, FL) — `my.clevelandclinic.org`

Run ID: `p102-gold-1-cleveland-clinic-florida`. Failure mode: clear international medical student / visiting student program test (expected to produce PUBLIC_SAFE_USCE candidates, but on a system-level domain).

| Metric | Value |
|---|---:|
| Source candidates probed | 59 |
| Accepted sources | 20 (live A0 capture) |
| Rejected sources | 39 (HTTP 404/etc.) |
| Tier 1 claims | 36 (TIER_COVERAGE_PARTIAL, lane `HUMAN_REVIEW_REQUIRED` — all held because `my.clevelandclinic.org` is a system-level domain serving Cleveland Clinic Foundation/Ohio, Cleveland Clinic Florida, Abu Dhabi, etc.) |
| Tier 2 claims | 142 (extensive residency/fellowship content; lane FUTURE_LANE_ONLY) |
| Tier 3 claims | 3 |
| PUBLIC_SAFE_USCE | **0** (correct — system-domain content cannot be attributed to Cleveland Clinic Florida specifically without explicit campus-applicability proof) |
| FUTURE_LANE_ONLY | 145 |
| HUMAN_REVIEW_REQUIRED | 40 |
| Quote-verified | 185 / 185 (100%) |
| Rejected on quote re-verify | 1 (filtered during deep extraction; 0 on standalone re-verify) |
| A4 tasks before / after | 2 / 2 (both reference off-domain `clevelandcliniccfl.org`; A4 fetch attempted 8 same-domain probes, 0 accepted — tasks remain open) |
| Scope conflicts | 0 (deterministic classifier held every Tier 1 candidate) |
| Public-safety failures | 0 |
| Model A3 verdict | PASS_PUBLISH_READY |
| Deterministic regate verdict | PASS_WITH_CAVEATS (publicSafe=false, futureLaneValue=HIGH) |

**Final status: `GOLD_PASS_HUMAN_REVIEW_REQUIRED`**

This is the gold-set's "international medical student program test." The expected outcome was ≥1 PUBLIC_SAFE_USCE because Cleveland Clinic does run a known IMG observership program. The actual outcome was 0 PUBLIC_SAFE_USCE because every captured source is on the enterprise `my.clevelandclinic.org` domain serving the Ohio main campus and all sister hospitals (Florida, Abu Dhabi, etc.). The classifier correctly refuses to attribute system-level content to the Cleveland Clinic Florida campus specifically.

**This is the correct framework behavior** even though it's the "wrong" outcome for the gold expectation. The framework didn't fail; the source set is wrong for this test. Cleveland Clinic Florida campus-specific elective / observership pages live at `clevelandcliniccfl.org` (a separate domain) which is off-domain for this run. The A4 hostile-gate correctly emitted recovery tasks pointing at that other domain — but `--fetch-additional` is bounded to the run's `officialDomains` set and refused to traverse off-domain. The captured signal explicitly references "If you're a practicing physician or medical student from outside the U.S., consider applying for an observership" — but no detail page (eligibility, fee, duration) was reachable from within `my.clevelandclinic.org`.

**Action for gold-set queue:** add `clevelandcliniccfl.org` to Cleveland Clinic Florida's `officialDomains` in the institution registry, or split into a second run-id whose A0 probe targets that domain. Out of scope for P102-GOLD execution; recorded as a `GOLD-FIX` follow-up.

---

## Gold #2 — Vanderbilt University Medical Center (Nashville, TN) — `vumc.org`

Run ID: `p102-gold-2-vanderbilt-vumc`. Failure mode: clear US MD/DO VSLO-only restriction (expected PUBLIC_SAFE_USCE for VSLO + possible NEGATIVE for IMG).

| Metric | Value |
|---|---:|
| Source candidates probed | 39 |
| Accepted sources | 3 (2 from A0: /gme, /careers + 1 from A4: /gme/visiting-residents) |
| Rejected sources | 36 (HTTP 404 / etc.) |
| Tier 1 claims | 0 (TIER_COVERAGE_WEAK — VUMC's VSLO content is at `medschool.vanderbilt.edu`, off-domain) |
| Tier 2 claims | 41 |
| Tier 3 claims | 11 |
| PUBLIC_SAFE_USCE | **0** |
| FUTURE_LANE_ONLY | 52 |
| HUMAN_REVIEW_REQUIRED | 0 |
| Quote-verified | 52 / 52 (100%) |
| Rejected on quote re-verify | 0 |
| A4 tasks before / after | 2 / 1 (after fetch: 1 task remaining for `medschool.vanderbilt.edu` which is off-domain) |
| Scope conflicts | 0 |
| Public-safety failures | 0 |
| Model A3 verdict | PASS_PUBLISH_READY |
| Deterministic regate verdict | FAIL_NEEDS_A4 (missingFields=1; the remaining A4 task references an off-domain medschool URL) |

**Final status: `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT`**

Vanderbilt's A0 probe only found `/gme` and `/careers` on `vumc.org` (most fixed-path probes returned 404). The A3 hostile gate noted a "Visiting Residents" reference in the GME content and emitted recovery tasks pointing at `vumc.org/gme/visiting-residents` and `medschool.vanderbilt.edu` (off-domain).

A4 `--fetch-additional` ran bounded recovery — after the schemeless URL miner fix (P102-GOLD framework improvement: A4 fetcher now recognizes `vumc.org/path` references in task prose, not just `https://vumc.org/path`), it fetched `vumc.org/gme/visiting-residents`. The page is correctly classified as Tier 2 (it's the GME visiting-residents program for ACGME-accredited residents, NOT a medical-student VSLO/visiting program).

The remaining A4 task (`medschool.vanderbilt.edu` for VSLO) is off-domain and bounded fetch refuses to traverse it. The framework correctly says: VUMC publishes Tier 2 GME content on `vumc.org`; its undergraduate VSLO content lives on a separate medical-school subdomain that we did not authorize for capture. **Honest absence, not silent failure.**

**Framework improvement** captured this sprint: A4 fetcher now mines schemeless URL references from task prose, increasing the success rate of A4 bounded recovery without changing the safety envelope.

---

## Gold #4 — Mayo Clinic Rochester (Rochester, MN) — `mayoclinic.org`

Run ID: `p102-gold-4-mayo-clinic-rochester`. Failure mode: no public lane with explicit negative refusal quote.

| Metric | Value |
|---|---:|
| Source candidates probed | 39 |
| Accepted sources | 39 (substantial yield; Mayo publishes broadly) |
| Tier 1 claims | 18 (TIER_COVERAGE_PARTIAL, lane `CAUTION_SAFE_INTERNAL_REVIEW`) |
| Tier 2 claims | 6 |
| Tier 3 claims | 6 |
| PUBLIC_SAFE_USCE | **0** |
| PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY | **0** (no explicit refusal quote captured) |
| FUTURE_LANE_ONLY | ~6 |
| HUMAN_REVIEW_REQUIRED | 12 |
| Quote-verified | 31 / 31 (100%) |
| Rejected on quote re-verify | 0 |
| A4 tasks before / after | 2 / 2 (not executed; Mayo's recovery URLs target college.mayo.edu — off-domain) |
| Scope conflicts | 0 |
| Public-safety failures | 0 |
| Model A3 verdict | PASS_PUBLISH_READY |
| Deterministic regate verdict | PASS_WITH_CAVEATS (publicSafe=false, futureLaneValue=MEDIUM) |

**Final status: `GOLD_PASS_HUMAN_REVIEW_REQUIRED`**

This was the gold-set's "explicit negative quote" test (Mayo historically published "we do not accept observers" type language). The current Mayo Clinic public site (`mayoclinic.org`) yielded 31 quote-verified claims; 18 Tier 1 candidates but none with a HIGH-confidence definite offer/refusal statement that the model could promote to either PUBLIC_SAFE_USCE or PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY. The Tier 1 lane settled at `CAUTION_SAFE_INTERNAL_REVIEW`.

Notably, **no explicit refusal quote was captured**. Either Mayo no longer publishes the explicit refusal language (the older P101 evidence is stale), or it lives at `college.mayo.edu` (off-domain for `mayoclinic.org` runs). The framework correctly returned 0 PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY rather than synthesizing a refusal from absence.

The framework's honesty here is the point: it didn't invent a "Mayo doesn't accept observers" claim that the captured pages don't actually contain.



