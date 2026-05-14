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



