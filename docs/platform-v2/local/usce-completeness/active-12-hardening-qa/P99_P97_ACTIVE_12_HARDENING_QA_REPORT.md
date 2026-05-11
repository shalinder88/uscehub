# P99-P97 Active-12 Hardening QA Report

**Sprint ID:** `P99-P97-ACTIVE-12-HARDENING-QA`
**Date:** 2026-05-11
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `e87deee` (Sprint 3 — batch-4 noindex activation slice)
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED
**Scope:** Code-level static hardening QA of the 12-card noindex pilot runtime. No app code change. No new validator. **Browser preview NOT exercised in this turn** (preview tooling in the autonomous shell is bound to a different project) — that verification is explicitly punted to the next live-shell touch.

---

## 1. What was verified (code-level)

| Check | Method | Result |
|-------|--------|--------|
| `validate-no-secrets` over 1278 files | `npx tsx scripts/validate-no-secrets.ts` | PASS — 0 findings |
| `tsc --noEmit` over full repo | `npx tsc --noEmit` | PASS — 0 errors |
| `validate-micro-pilot-runtime` — 12 cards | run | PASS — all gates green, route `noindex+nofollow` |
| `validate-p99-contact-ref-prefill` — 16 listings | run | PASS — 7 activated + 2 batch-3-staged-deferred behave correctly |
| `validate-p99-staged-runtime-batch-4-report-mapping` | run | PASS |
| `validate-p99-batch-4-promotion-candidate-audit` | run | PASS |
| `validate-p99-batch-3-promotion-candidate-audit` | run | PASS — invariants intact post batch-4 slice |
| `validate-p99-staged-runtime-batch-3-report-mapping` | run | PASS |
| 20-field allow-list per card | static scan of `public-listings-pilot.generated.json` | PASS — 0 extra keys, 0 missing keys across 12 cards |
| Listing-ID regex `^pilot-\d{3}-[A-Z]{2}-[a-z0-9-]+$` | static regex | PASS — 12/12 |
| `official_source_url` shape `^https://` | static scan | PASS — 12/12 |
| Banned-phrase patterns (`guarantee`, `hospital-approved`, `IMG-friendly`, `apply through USCEHub`, etc.) | static scan with negation tolerance | PASS — 0 hits |
| Forbidden internal keys (`screenshot_path`, `reviewer_notes`, `npi`, `ccn`, etc.) | static scan | PASS — 0 leaks |
| `audience_detail` completeness (4 keys per card) | static scan | PASS — 12/12 |
| School-level caveat on slice rows | restriction_tags + fit_warnings + campus_name contain `SPECIFIC_GUARANTEE` and "System-level" | PASS — HUP, Northwestern, Vanderbilt UMC, UCSF Medical Center all carry the caveat |
| Audience counts vs `.generated.ts` exports | `img_relevant = 2` (Cleveland Clinic Mercy + Hillcrest), `us_only = 10`, `total = 12` | PASS — matches `.generated.ts` `PILOT_IMG_RELEVANT_COUNT/PILOT_US_ONLY_COUNT/PILOT_TOTAL_COUNT` |
| `/clerkships/pilot` route exports `robots: { index: false, follow: false }` | static read of `src/app/clerkships/pilot/page.tsx` | PASS |
| Header count badge reads from re-exported constants (`PILOT_TOTAL_COUNT` etc. from `@/lib/usce-pilot-data`) | static trace | PASS — badge auto-updates to "12 listings · 2 open to international students per source · 10 US MD/DO per source" |
| `/contact` hidden form fields present (`listing_id`, `report_ref`, `runtime_set`, `evidence_join_key`, `page_path`, `honeypot_field`) | static read of `src/app/contact/ContactReportForm.tsx` | PASS |

## 2. What was NOT verified (and why)

| Check | Why deferred |
|-------|-------------|
| Browser preview of `/clerkships/pilot` with all 12 cards visible | Preview MCP is bound to a different project in this shell; spinning up `npm run dev` against `usmle-platform` was deliberately out of scope to keep the autonomous run safe. Punt to next live-shell touch. |
| Browser preview of `/contact?listing_id=…&ref=pilot-listing` for each of the 12 IDs | Same reason as above. Resolver is unit-validator-covered, but the rendered banner is not turn-verified. |
| External link health (HEAD on each `official_source_url`) | Issuing 12 outbound HEAD requests from an autonomous shell is poor manners and unreliable across this network; punt. URLs all match prior known shapes and `source_status` records the last fetch outcome. |
| Correction submission round-trip | `USCE_CORRECTION_INTAKE_ENABLED=false` — endpoint returns 404 by design. Live POST verification is its own future sprint. |

## 3. Defects found

NONE. The 12-card runtime passes every static invariant. The earlier QA spot-check that suggested a count mismatch (`us_only=7` vs declared `10`) was a faulty classifier in the QA script — using the correct rule (`img_relevant = international_student == ELIGIBLE_EXPLICIT`) the counts match the exported constants exactly.

## 4. Recommendation

The runtime is code-level clean and safe to leave at 12 active cards. The next live-shell touch should:

1. `cd ~/usmle-platform && npm run dev`
2. Open `/clerkships/pilot` — confirm 12 cards render, header reads "12 listings · 2 open to international students per source · 10 US MD/DO per source", noindex meta tag present in `<head>`.
3. Visit `/contact?listing_id=pilot-020-TN-vanderbilt-university-medical-center&ref=pilot-listing` — confirm banner names "Vanderbilt University Medical Center" and "Nashville, TN".
4. Visit `/contact?listing_id=pilot-021-CA-ucsf-medical-center&ref=pilot-listing` — same for UCSF.
5. Spot-check `official_source_url` clicks for both new rows return real visiting-student pages.

If any of those fail, that becomes Sprint 4-B. As of this turn, no code change is required.

## 5. What this sprint did NOT do

- **No code change.** This is a docs-only sprint.
- No production deploy. No PR. No merge to main. No force-push.
- No DB / schema / Prisma / seed / cron.
- No active runtime data change.
- No staged batch-2/3/4 data change.
- No `/clerkships/pilot` route change.
- No `/contact` UI change.
- No correction endpoint env-flag flip.
- No homepage / nav / sitemap exposure.
- No new screening / curation / bridge / activation.
- No public copy change.
- `NO_PUBLIC_NOW` / `NO_IMPORT_READY` token discipline preserved.

## 6. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No app code change | CONFIRMED |
| No new validator (no weakening / loosening) | CONFIRMED — existing validators all PASS |
| No staged data change | CONFIRMED |
| No active runtime data change | CONFIRMED |
| `/clerkships/pilot` unchanged | CONFIRMED |
| `/contact` unchanged | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` token discipline | CONFIRMED |
| No banned phrase introduced | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
