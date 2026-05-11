# P99-P97 Staged Runtime Batch 4 — Noindex Activation Slice Report

**Sprint ID:** `P99-P97-STAGED-RUNTIME-BATCH-4-NOINDEX-ACTIVATION-SLICE`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `5288725` (Sprint 2 — batch-4 promotion candidate audit)
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED
**Scope:** Activate the 2 audited batch-4 cards (Vanderbilt UMC + UCSF Medical Center) into the noindex pilot runtime. Active runtime grows **10 → 12**. Route remains `noindex+nofollow`. No production deploy, PR, merge to main, or homepage/nav/sitemap exposure.

---

## 1. Executive result

| Item | Value |
|------|-------|
| Active runtime card count | **10 → 12** |
| New cards activated | `pilot-020-TN-vanderbilt-university-medical-center` · `pilot-021-CA-ucsf-medical-center` |
| Existing 10 cards | preserved verbatim |
| `/clerkships/pilot` route metadata | `noindex+nofollow` — UNCHANGED |
| `/contact` UI | UNCHANGED |
| Correction endpoint env-flag | `USCE_CORRECTION_INTAKE_ENABLED=false` — UNCHANGED |
| Validators run | secrets, tsc, micro-pilot-runtime, contact-ref-prefill, batch-4 mapping, batch-4 audit — all PASS |
| Production main | UNCHANGED (`739ab1e`) |
| Reversibility | single `git revert` restores active runtime to 10 |

## 2. Files changed

| File | Change |
|------|--------|
| `src/data/usce/public-listings-pilot.generated.json` | Append 2 cards verbatim from staged batch-4; update `promoted_at` + `source`. Existing 10 cards preserved. |
| `src/data/usce/public-listings-pilot.generated.ts` | Append 2 cards; update `Generated:` comment + source-comment slice path; update `PILOT_US_ONLY_COUNT 8→10` and `PILOT_TOTAL_COUNT 10→12`. |
| `src/lib/usce-contact-context.ts` | Flip `runtimeSet: "staged" → "active"` for `pilot-020` + `pilot-021`. Update inline comment. |
| `scripts/validate-micro-pilot-runtime.ts` | `EXPECTED_CARD_COUNT 10 → 12`; add `BATCH_4_SLICE_NEW_IDS` array + check loop; update header comment. |
| `scripts/validate-p99-contact-ref-prefill.ts` | Move `pilot-020` + `pilot-021` from `STAGED_ONLY_IDS` to `ACTIVATED_IDS`; update inline comment. |
| `scripts/validate-p99-staged-runtime-batch-4-report-mapping.ts` | Relax resolver check to accept `runtimeSet ∈ {staged, active}` (both authorized states across pre/post slice). Limit drift check to staged-batch-4 files only. |
| `scripts/validate-p99-batch-4-promotion-candidate-audit.ts` | Same relaxations as the mapping validator. |
| `docs/.../staged-runtime-batch-4-noindex-activation-slice/` | This sprint report. |

## 3. Card-content fidelity

The 2 appended cards are **bit-identical** to indices 10 and 11 of `src/data/usce/public-listings-pilot-staged-batch-4.generated.json` — verified by `diff` on the cards array slice. No new public copy was authored in this sprint. No caveat was removed. No tag was added. The school-level `SYSTEM_PAGE_SOURCE_NO_<HOSPITAL>_SPECIFIC_GUARANTEE` caveat is present in `campus_name`, `restriction_tags`, and `fit_warnings` for both rows.

## 4. Validator results

| Validator | Result |
|-----------|--------|
| `validate-no-secrets.ts` | PASSED — 0 findings across 1278 files |
| `tsc --noEmit` | PASSED — no errors |
| `validate-micro-pilot-runtime.ts` | PASSED — 12 cards, all gates green; route `noindex+nofollow` |
| `validate-p99-contact-ref-prefill.ts` | PASSED — 16 known listings; 7 activated + 2 batch-3-deferred staged; injection/oversized inputs rejected |
| `validate-p99-staged-runtime-batch-4-report-mapping.ts` | PASSED — 2 mapped IDs; both runtimeSet ∈ {staged, active}; staged batch-4 data unchanged |
| `validate-p99-batch-4-promotion-candidate-audit.ts` | PASSED — caveat retained; US-only audience preserved; no staged drift; no app import |
| `validate-p99-batch-3-promotion-candidate-audit.ts` | PASSED — batch-3 invariants intact |
| `validate-p99-staged-runtime-batch-3-report-mapping.ts` | PASSED — batch-3 mapping intact |

GitHub open alerts: NOT_VERIFIED_THIS_TURN (gh CLI may be logged out post P0 token-rotation cleanup). Last verified state = 0 open / prior alert resolved as `wont_fix`.

## 5. What this sprint did NOT do

- **No production deploy.** No `vercel --prod`. No `--prod` of any kind.
- **No PR. No merge to main. No force-push. No `--no-verify`. No `--amend`.**
- **No homepage / nav / sitemap exposure.** Route stays `noindex+nofollow`.
- **No `/contact` UI change.** No copy change. No new form fields.
- **No correction endpoint env-flag flip.** `USCE_CORRECTION_INTAKE_ENABLED=false` preserved.
- **No staged batch-4 data file mutation.** Only the active runtime + resolver + validators changed.
- **No batch-2, batch-3 staged-data file mutation.**
- **No DB / schema / Prisma / seed / cron.**
- **No new evidence capture. No new screening. No new public copy.**
- **No audience broadening. No caveat removal.**
- `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline preserved.
- No banned phrase introduced (validator confirms).
- No mutation of unrelated dirty files (`.claude/launch.json`, NPPES tree, redesign-mockups, frozen-internal-copy READMEs remain untouched).

## 6. Browser-preview verification

NOT_VERIFIED_THIS_TURN. The runtime-data + resolver + type-check + validator changes are all clean, but the autonomous overnight run does not exercise `npm run dev` + browser preview. The next maintainer touch on `/clerkships/pilot` should:

- Confirm both new cards render with school-level caveat visible in `campus_name`.
- Confirm `/contact?listing_id=pilot-020-…&ref=pilot-listing` shows the Vanderbilt UMC banner.
- Confirm `/contact?listing_id=pilot-021-…&ref=pilot-listing` shows the UCSF Medical Center banner.
- Confirm form posts return a polite generic message (env-flag still off).

## 7. Reversibility

A single `git revert <slice-commit>` restores active runtime to 10 cards, flips both IDs back to `runtimeSet: "staged"`, and reverts all validator constant changes. Staged batch-4 data file is untouched, so re-attempting the slice from a clean revert state is trivial.

## 8. Recommended next sprint

`P99-P97-ACTIVE-12-HARDENING-QA` — exercise the 12-card runtime end-to-end:

1. Browser-preview verify the 12 cards on `/clerkships/pilot`.
2. Browser-preview verify `/contact?listing_id=…&ref=pilot-listing` for each of the 12 IDs (3 original from Maine + 5 batch-3 active + 2 batch-4 active counts the 7 newly activated; the 5 original pilots stay).
3. Spot-check link health: each `official_source_url` returns 200 or a known-archived 301.
4. No code change unless QA surfaces a defect.

## 9. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No staged batch-2/3/4 data change | CONFIRMED |
| No `/clerkships/pilot/*` route or metadata change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No correction endpoint env-flag flip | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No `NO_PUBLIC_NOW` / `NO_IMPORT_READY` token regression | CONFIRMED |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED — scoped to changed files |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No weakening of meaningful validator gates | CONFIRMED — relaxations only widen accepted runtimeSet values to {staged, active}, both authorized by this sprint |
