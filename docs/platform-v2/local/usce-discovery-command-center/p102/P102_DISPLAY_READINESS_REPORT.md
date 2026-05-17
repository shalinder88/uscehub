# P102 Display Readiness Report

Generated: 2026-05-17
Branch: `local/p102-final-reconciliation-display-readiness`
Parent branch HEAD (link-truth audit): `f658b43`
This branch HEAD (display-readiness work): pending Phase H commit

**No push. No deploy. No PR. No production DB mutation. No schema migration. No production seed run.**

---

## Summary

The P102 borderline one-by-one link-truth campaign is complete (107 packets,
11 batches). This branch converts that audit into a structured display-
eligibility model: which rows are allowed to render on the live site, which
are held, and which are hidden — with a validator that enforces the rules
and a local preview route that shows the resulting buckets.

This is a strictly local-only sprint. The site's production data and routes
are unchanged.

---

## Counts at this commit

| Bucket | File | Rows | Display lane |
|---|---|---:|---|
| Clinical USCE eligible | `display_eligible_clinical_usce.json` | **170** | Clinical USCE |
| Research eligible | `display_eligible_research.json` | **9** | Research |
| Outreach hold | `display_hold_outreach.json` | 3 | (held) |
| Research reverify hold | `display_hold_research_reverify.json` | 7 | (held) |
| Manual-browser hold | `display_hold_manual_browser.json` | 3 | (held) |
| Hidden / removed | `display_hidden_or_removed.json` | 14 | (none) |
| Archive (negative info) | `display_archive_negative_info.json` | 1 | (archive only) |
| **Sum** | | **207** | |

- True USCE display count: **170**
- Research display count: **9**
- Hidden count: **14**
- Hold count: **13** (outreach 3 + research-reverify 7 + manual-browser 3)
- Archive (negative info): **1**
- Sum equals total data.js rows (207). ✓

---

## Clinical USCE badge distribution

The clinical USCE bucket is sub-classified by source-classification badge.
The badge tells the front-end how confident the row is and whether to show
a "verified live in browser" hint.

| Badge | Count | Meaning |
|---|---:|---|
| DIRECT | 105 | URL is the exact direct USCE page |
| REORIENTED | 63 | URL moved from generic/homepage to a verified direct page |
| PROTECTED | 2 | URL is live in a real browser; WebFetch/Node blocked (Hopkins precedent) |

---

## Unresolved (held) rows — what they are and what they need

### Outreach hold (3 rows) — needs phone call

- **Jamaica Hospital Medical Center** (data.js entry #1, `https://jamaicahospital.org/graduate-medical-education/`) — call Department of Medical Education.
- **Jamaica Hospital Medical Center** (data.js entry #2, `https://www.jamaicahospital.org/`) — same institution; phone call resolves both.
- **Richmond University Medical Center** (`https://www.rumcsi.org/`) — call GME office at 844-934-2273.

### Research-reverify hold (7 rows) — needs operator-supplied deeper URL

- Mayo Clinic — Research Fellowship (`college.mayo.edu/`)
- Mount Sinai — Postdoctoral Research (`icahn.mssm.edu/`)
- University of Pittsburgh — Postdoctoral Research (`postdoc.pitt.edu/`)
- Fred Hutchinson Cancer Center (`fredhutch.org/`)
- Baylor College of Medicine — Postdoctoral Research (`bcm.edu/`)
- Northwestern Feinberg — Postdoctoral Research (`feinberg.northwestern.edu/`)
- Albert Einstein College of Medicine — Research Fellowship (`einsteinmed.edu/`)

### Manual-browser hold (3 rows) — needs in-browser visual check

- Beth Israel Deaconess Medical Center (`bidmc.org/medical-education/graduate-medical-education`)
- Advocate Christ Medical Center (×2 data.js entries) (`advocatehealth.com/`)

---

## What this branch did

Files added/changed (versus parent `f658b43`):

| Path | Kind | Reason |
|---|---|---|
| `docs/platform-v2/local/usce-discovery-command-center/p102/P102_FINAL_LINK_TRUTH_RECONCILIATION.md` | doc | Single-source-of-truth bucket rules, what counts as true USCE, what should not display |
| `docs/platform-v2/local/usce-discovery-command-center/p102/P102_DISPLAY_READINESS_REPORT.md` | doc | This report |
| `docs/platform-v2/local/usce-discovery-command-center/p102/exports/display_eligible_clinical_usce.json` | data | 170-row clinical USCE bucket |
| `docs/platform-v2/local/usce-discovery-command-center/p102/exports/display_eligible_research.json` | data | 9-row research bucket |
| `docs/platform-v2/local/usce-discovery-command-center/p102/exports/display_hold_outreach.json` | data | 3-row outreach hold |
| `docs/platform-v2/local/usce-discovery-command-center/p102/exports/display_hold_research_reverify.json` | data | 7-row research-reverify hold |
| `docs/platform-v2/local/usce-discovery-command-center/p102/exports/display_hold_manual_browser.json` | data | 3-row manual-browser hold |
| `docs/platform-v2/local/usce-discovery-command-center/p102/exports/display_hidden_or_removed.json` | data | 14-row hidden bucket |
| `docs/platform-v2/local/usce-discovery-command-center/p102/exports/display_archive_negative_info.json` | data | 1-row archive (Cook County) |
| `docs/platform-v2/local/usce-discovery-command-center/p102/exports/display_eligibility_summary.md` | doc | Human-readable counts |
| `scripts/p102-build-display-eligibility-export.ts` | script | Builds the seven bucket files from classifier output + verified-links + hidelist |
| `scripts/p102-validate-display-eligibility-export.ts` | script | 38 invariants — verifies no leakage between buckets and that counts match the classifier |
| `src/app/usce/verified-preview/display-readiness/page.tsx` | preview UI | New `/usce/verified-preview/display-readiness` route — internal-only diagnostic, noindex, reads the 7 JSON exports |

Nothing in `prisma/`, the seed, the schema, or any production route was
modified. The new preview route is additive — it does not change
`/usce/verified-preview`, `/browse`, `/`, sitemap, robots, or metadata
anywhere else.

---

## QA results

| Check | Result |
|---|---|
| `scripts/p102-build-display-eligibility-export.ts` | OK — 207 rows bucketed; sum equals total |
| `scripts/p102-validate-display-eligibility-export.ts` | PASS — 38 checks pass, 0 failures |
| `scripts/p102-classify-live-listings-per-type.ts` | OK — 105 direct + 63 reoriented + 2 protected + 9 research-valid + 7 research-reverify + 14 hidden + 3 borderline + 3 broken + 1 negative |
| `scripts/p102-validate-exact-seed-rows.ts` | PASS |
| `scripts/p102-validate-intelligent-opportunity-rows.ts` | PASS |
| `scripts/validate-no-secrets.ts` | PASS (6463 files scanned, 0 findings) |
| `tsc --noEmit` | clean (0 errors) |
| `npm run build` | exit 0 — `/usce/verified-preview/display-readiness` registered as Dynamic route |

Pre-existing failure documented but not addressed in this sprint:
`p102-validate-approved-public-safe-export` — 6 decision-CSV issues with
`APPROVE_PUBLIC_SAFE` rows missing reviewer / `decisionReason`. Confirmed
pre-existing at parent commit `f658b43` (see batch-7 commit message); not
introduced by this sprint and unrelated to display readiness.

---

## Recommendation (operator next-step ranking)

**A. Phone outreach** for Jamaica Hospital (×2) + Richmond University Medical Center.
Resolves 3 borderline rows into either MOVED_REORIENTED (with new URL) or
NO_PROGRAM_FOUND_HIDE. Highest leverage per minute.

**B. Operator-supplied research URLs** for the 7 RESEARCH_TOO_GENERIC_REVERIFY
rows. Each needs a deeper institutional URL (postdoctoral office / T32
portal / specific program landing). Brings research display from 9 to up to
16 rows. Medium-effort, high-quality.

**C. Local preview QA / screenshots** of the new `/usce/verified-preview/
display-readiness` route. Confirm the counts visually match this report,
review the clinical-USCE sample, decide if any bucket needs UI refinement.

**D. Prepare DB / seed integration plan** (NO mutation) — design how the
seven exports map into the live Prisma `listing` table for a future
controlled cutover. Document the migration shape, the cutover order, and
the rollback plan. Do not execute.

**E. Resume discovery** — only after A + B + C land. The wedge that
matters right now is trustworthy display of the 170 verified true-USCE
listings, not net-new institutions.

**Recommended path: A + B + C before D.** Don't begin DB/seed integration
until phone outreach has settled the 3 borderline rows and the operator has
either confirmed the 7 research-reverify URLs or accepted the smaller
research bucket. Otherwise we'd be designing the seed shape around moving
targets.

---

## Confirmation of constraints

- No push performed.
- No deploy performed.
- No PR opened.
- No production database mutation.
- No schema migration authored or run.
- No `prisma db push` / `prisma migrate dev` executed.
- No production seed run.
- No `data.js` mutation (the source-of-truth sibling repo at
  `/Users/shelly/usmle-observerships/data.js` is read-only this sprint).
- No homepage change, no `/browse` change, no SEO change, no sitemap /
  robots / metadata change.
- The new `/usce/verified-preview/display-readiness` route is `noindex`
  via metadata.

Branch `local/p102-final-reconciliation-display-readiness` is local-only.
Commit (Phase H) will be local-only.
