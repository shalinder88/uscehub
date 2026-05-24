# Overnight Autonomous USCEHub Build — Final Scoreboard

**Date span:** 2026-05-10 → 2026-05-11
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED across all sprints
**Pre-overnight HEAD:** `b38e264`
**Final HEAD:** `08fe62e` (after Sprint 4 docs commit; Sprint 10/11/12 commit adds this scoreboard)

---

## 1. Honest progress estimate

> Pre-overnight USCEHub v1 readiness: **~38%**
> Post-overnight USCEHub v1 readiness: **~43%**

Net gain: +5 percentage points. The user explicitly instructed: *"Do NOT inflate progress. If you only get to 45%, say 45%."* — these numbers are not rounded up. The drivers of the gain:

- Active pilot inventory grew 10 → 12 cards (+20% inventory) on real source-verified data, with audit-then-activate discipline preserved.
- Batch-4 mapping + audit + activation pipeline is now end-to-end repeatable for batch 5.
- Validator stack expanded (one new validator, two relaxed to accept post-slice state without losing meaning) and remained 100% green throughout.

The reason the gain is not larger:

- Browser-preview verification of the active 12 was not exercised this turn (preview tooling in the autonomous shell is bound to a different project) — that work is genuinely punted.
- Sprints 5–8 of the originally-planned 12 (manual-nav backlog pass 2, curator+bridge for new wins, staged batch 5 data-only, batch 5 mapping/audit/activation) were skipped because they require live browser navigation that the autonomous shell can't do well.
- No homepage / nav / sitemap exposure work happened (correct per scope, but it's the largest single remaining gate to "real product").
- No correction-endpoint env-flag flip (correct per scope, but no live correction round-trip was proven).

## 2. Sprint roll-up

| # | Sprint | HEAD | Result |
|---|--------|------|--------|
| 0 | Push baseline `847fb9b` (batch-4 staged data-only) | `847fb9b` | pushed |
| 1 | Batch-4 report-issue mapping | `57c39ac` | pushed |
| 2 | Batch-4 promotion candidate audit | `5288725` | pushed |
| 3 | Batch-4 noindex activation slice (active 10 → 12) | `e87deee` | pushed |
| 4 | Active-12 hardening QA (code-level, docs-only) | `08fe62e` | pushed |
| 5 | Manual-nav backlog pass 2 (23 rows) | — | SKIPPED — needs live browser |
| 6 | Curator + bridge for new wins | — | SKIPPED — blocked by Sprint 5 |
| 7 | Staged batch 5 data-only | — | SKIPPED — blocked by Sprint 6 |
| 8 | Batch 5 mapping/audit/activation | — | SKIPPED — blocked by Sprint 7 |
| 9 | Core user-path QA | (covered by Sprint 4) | code-level checks rolled into Sprint 4 |
| 10 | Correction/report flow hardening | (this commit) | code-level audit; no change required |
| 11 | Source/trust/copy consistency audit | (this commit) | code-level scan; no defect |
| 12 | Final scoreboard | (this commit) | this file |

## 3. Sprint 10 — Correction/Report Flow Audit

`src/app/api/usce/corrections/route.ts` and `src/lib/usce-corrections/*.ts` reviewed.

**Defenses in place:**

| Defense | Verified |
|---------|----------|
| Disabled by default (`USCE_CORRECTION_INTAKE_ENABLED !== "true"` → 404) | ✓ |
| Content-Length cap @ 16 KB before body read | ✓ |
| Re-check raw text length cap before JSON parse | ✓ |
| `try/catch` around `JSON.parse` returns opaque `invalid_request` | ✓ |
| Strict allow-list payload validator with discriminated-union result | ✓ |
| Forbidden-PII-key denylist of 40 entries (passport, visa, SSN, MRN, ECFMG, USMLE, NRMP, AAMC, ACGME, payment, credentials, etc.) | ✓ |
| Honeypot field (`honeypot_field`) rejected if non-empty | ✓ |
| `user_message` length bounds (5 ≤ len ≤ 4000) | ✓ |
| Listing-ID regex `^pilot-\d{3}-[A-Z]{2}-[a-z0-9-]+$` | ✓ |
| ISO-Z timestamp regex on `submitted_at` | ✓ |
| HTTP URL regex on `page_url` | ✓ |
| Email regex on `contact_email` (optional field) | ✓ |
| Endpoint **never** echoes which validation rule tripped (coarse `invalid_request` only) | ✓ |
| `force-dynamic` directive prevents accidental static caching of the route | ✓ |
| 405 for GET / PUT / DELETE / PATCH | ✓ |
| Filesystem write error returns opaque 500 `intake_failed`, never leaks queue path | ✓ |
| Queue root override gated to `USCE_CORRECTION_QUEUE_ROOT` env (for tests) | ✓ |

**Gaps noted (not blocking; ranked):**

| Rank | Gap | Impact today | Why not fixed now |
|------|-----|--------------|-------------------|
| 1 | No rate-limit / throttling on the endpoint | LOW — endpoint is currently 404 by env flag | When the flag flips, a per-IP throttle + global QPS cap should ship in the *same* sprint as the flip. Adding it now would be dead code with no production validation. |
| 2 | No CAPTCHA / proof-of-work on submission | LOW — same reason | Same. Stage with the env-flag flip. |
| 3 | No audit-event signing / append-only WAL | LOW — file queue is local and noindex-pilot scope | Defer until a paid product launch raises stakes. |
| 4 | `correction_id` is returned verbatim in the response | LOW — UUID-shaped; not a leak | Acceptable; readers benefit from a reference number. |

**Conclusion**: the endpoint is correctly hardened *for its current disabled-by-default posture*. No change required this sprint. The gaps above are tracked for the env-flag-flip sprint.

## 4. Sprint 11 — Source/Trust/Copy Consistency Audit

Static scan of `src/data/usce/public-listings-pilot.generated.json` across all 12 cards:

| Axis | Result |
|------|--------|
| 20-field allow-list per card | PASS — 0 extra keys, 0 missing keys |
| `listing_id` regex shape | PASS — 12/12 |
| `official_source_url` shape (`^https://`) | PASS — 12/12 |
| `audience_detail` 4-key completeness | PASS — 12/12 |
| Banned-phrase patterns (`guarantee`, `hospital-approved`, `IMG-friendly`, `apply through USCEHub`, etc.) | PASS — 0 hits (negation patterns correctly tolerated) |
| Forbidden internal keys leaked (`screenshot_path`, `reviewer_notes`, `npi`, `ccn`, `nppes_npi`, `ein`, `aamc_id`, `nrmp_id`, `acgme_id`, etc.) | PASS — 0 leaks |
| `source_status` enum consistency | PASS — values `OFFICIAL_SOURCE_ARCHIVED` / `OFFICIAL_SOURCE_FETCHED` only |
| `display_bucket` enum consistency | PASS — `READY_PUBLIC_IMG_RELEVANT` / `READY_PUBLIC_US_STUDENT_ONLY` only |
| `source_page_type` enum consistency | PASS — `POLICY_HUB` / `SPECIALTY_PAGE` / `SYSTEM_PAGE` only |
| `specialty` enum consistency | PASS — single value `multispecialty_visiting` |
| `SYSTEM_PAGE_SOURCE_NO_*_SPECIFIC_GUARANTEE` token shape | PASS — all 5 system-level caveats follow identical shape (Hillcrest, HUP, Northwestern Memorial, UCSF Medical Center, Vanderbilt UMC) |
| `campus_name` contains "System-level" + SOM source name for slice rows | PASS — HUP, Northwestern, Vanderbilt UMC, UCSF Medical Center |
| Audience-count derived constants vs `.generated.ts` exports | PASS — `img_relevant=2`, `us_only=10`, `total=12` match exported `PILOT_IMG_RELEVANT_COUNT/PILOT_US_ONLY_COUNT/PILOT_TOTAL_COUNT` |
| `/clerkships/pilot` route metadata | PASS — `robots: { index: false, follow: false }` set |
| `/contact` hidden form fields (`listing_id`, `report_ref`, `runtime_set`, `evidence_join_key`, `page_path`, `honeypot_field`) | PASS — all present in `ContactReportForm.tsx` |

**Conclusion**: no copy / trust / consistency defect found. The card data wire shape is uniform across original-5 + batch-3-active-5 + batch-4-active-2.

## 5. Validator stack — final state

All validators PASS at HEAD `08fe62e`:

| Validator | Status |
|-----------|--------|
| `validate-no-secrets` (1278 files) | PASS — 0 findings |
| `tsc --noEmit` | PASS — 0 errors |
| `validate-micro-pilot-runtime` | PASS — 12 cards, route `noindex+nofollow` |
| `validate-p99-contact-ref-prefill` | PASS — 16 known listings |
| `validate-p99-staged-runtime-batch-3-report-mapping` | PASS |
| `validate-p99-batch-3-promotion-candidate-audit` | PASS |
| `validate-p99-staged-runtime-batch-4-report-mapping` | PASS |
| `validate-p99-batch-4-promotion-candidate-audit` | PASS |

GitHub open alerts: NOT_VERIFIED_THIS_TURN (gh CLI may be logged out post P0 token-rotation cleanup). Prior verified state = 0 open / alert #1 resolved as `wont_fix`.

## 6. What was deliberately not done

- No production deploy. No `vercel --prod`.
- No PR to main. No merge to main. No force-push. No `--no-verify`. No `--amend`.
- No homepage / nav / sitemap exposure.
- No `/contact` UI change.
- No correction endpoint env-flag flip.
- No DB / schema / Prisma / seed / cron.
- No new evidence capture. No new screening. No new bridge curation.
- No `gh auth status -t`. No tokens printed.
- No T7 mutation.
- No `git add .` / no broad staging.
- No mutation of unrelated dirty files (`.claude/launch.json`, NPPES tree, redesign-mockups, frozen-internal-copy READMEs all UNTOUCHED).
- `NO_PUBLIC_NOW` / `NO_IMPORT_READY` token discipline preserved throughout.

## 7. Recommended next sessions (in order)

1. **Live-shell preview verification of active-12** — `cd ~/usmle-platform && npm run dev`, then visually confirm `/clerkships/pilot` (12 cards, header reads "12 listings · 2 open to international students per source · 10 US MD/DO per source") and `/contact?listing_id=pilot-020-…&ref=pilot-listing` (Vanderbilt banner) and `/contact?listing_id=pilot-021-…&ref=pilot-listing` (UCSF banner). Single live-shell touch; no code change unless a defect is found.
2. **Manual-nav backlog pass 2** — the 23 MANUAL_BROWSER_NAV_REQUIRED rows from the Queue 4 curator pass. Needs a real browser session. Output: an updated curator-pass CSV with a screened/curated/reject decision per row.
3. **Curator + bridge for new wins from #2** — same shape as the batch-3 / batch-4 pipeline.
4. **Staged batch 5 data-only** — generate a new `public-listings-pilot-staged-batch-5.generated.{json,ts}` plus audit docs. Repeat: mapping → audit → noindex slice.
5. **Correction-endpoint env-flag flip** — flip `USCE_CORRECTION_INTAKE_ENABLED=true` in a single sprint that *also* ships per-IP rate-limit and proof-of-work. Live POST round-trip verification on each of the 12 IDs.
6. **Homepage / nav / sitemap exposure decision** — the largest remaining gate. Out of scope for autonomous runs; needs explicit user direction on positioning + audience.

## 8. Hard-rule confirmation across the overnight run

| Rule | Status |
|------|--------|
| No production deploy | CONFIRMED across all 5 commits |
| No merge / PR to main | CONFIRMED |
| Production main `739ab1e` unchanged | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| `/clerkships/pilot` route metadata unchanged (noindex+nofollow preserved) | CONFIRMED |
| `/contact` UI unchanged | CONFIRMED |
| Correction endpoint env-flag unchanged (default-disabled) | CONFIRMED |
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline | CONFIRMED |
| No banned phrase introduced | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No weakening of meaningful validator gates | CONFIRMED — Sprint-3 relaxations widened `runtimeSet` accepted values to `{staged, active}` (both authorized states); no gate was deleted |
| Honest progress reporting (no inflation) | CONFIRMED — net gain reported as +5 percentage points (~38% → ~43%) |
