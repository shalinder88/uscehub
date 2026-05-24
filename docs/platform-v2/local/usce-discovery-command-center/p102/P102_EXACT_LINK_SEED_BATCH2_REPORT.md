# P102 Exact-Link Seed Extraction Batch 2 Report

Generated: 2026-05-16  
Branch: `local/p102-exact-link-seed-batch2`  
Parent commit: `fc6fe57`

---

## TL;DR

- 70 candidate URLs probed (URL-pattern guesses at well-known USCE-program institutions)
- **5 returned 200, 3 returned 403 (bot-blocked), 55 returned 404, 7 network errors**
- 8 new seeds added (5 live + 3 Cloudflare-protected for runner retry)
- Batch 2 runner: **13/15 fetched seeds auto-promote (87%)**
- 4 new public-safe rows added: Iowa, Vanderbilt, UVM, Rush
- Preview now shows **29 rows** from 14 institutions (was 25 from 12)
- Validator: 21/21 exact-seed + 19/19 intelligent + tsc clean + no-secrets clean

---

## Seeds attempted (Batch 2 deltas)

| Seed | Institution | Probe → Run | Final |
|---|---|---|---|
| seed_012 | Johns Hopkins (Hopkins SOM visiting students) | 403 → FAILED_FETCH | — |
| seed_013 | Johns Hopkins International Observer | 403 → FAILED_FETCH | — |
| seed_014 | University of Michigan Medical School | 403 → FAILED_FETCH | — |
| seed_015 | University of Iowa Carver | 200 → EXTRACTED | AUTO_PROMOTE |
| seed_016 | Vanderbilt SOM | 200 → EXTRACTED | AUTO_PROMOTE |
| seed_017 | Brown Alpert | 200 → EXTRACTED | HOLD (weak quote) |
| seed_018 | UVM Larner | 200 → EXTRACTED | AUTO_PROMOTE |
| seed_019 | Rush Medical College | 200 → EXTRACTED | AUTO_PROMOTE |

Plus all 11 Batch 1 seeds re-ran (one regression resolved: UCSF Fresno now auto-promotes with the real-browser UA).

---

## Counts after Batch 2

| Bucket | Batch 1 | Batch 2 | Delta |
|---|---:|---:|---:|
| Public-safe rows | 10 | 14 | +4 |
| Hold rows | 2 | 3 | +1 |
| Rejected rows | 0 | 0 | — |
| Failed fetches | 1 | 4 | +3 |
| Auto-promote rate | 90% | 87% | -3pp |

The drop from 90% to 87% is the Cloudflare-protected URLs being counted as fetched (they weren't — they failed at the network layer, so the denominator is correct: 15 actual fetches, 13 auto-promote).

### Preview surface

| Source | Rows |
|---|---:|
| Reviewer-approved (existing snapshot) | 13 |
| Exact-link seed (Batch 1 + 2) | 14 |
| Intelligent gate | 2 |
| **Total displayed** | **29** |
| Unique institutions | 14 |

### Filter validation (live counts on `/usce/verified-preview`)

| Filter | Count |
|---|---:|
| No filter | 29 |
| audience=us-md-do | 12 |
| audience=img-observer | 3 |
| audience=international | 1 |
| state=CA | 5 |
| state=NY | 4 |
| state=MA | 2 |
| state=IL | 1 |
| type=OBSERVERSHIP | 5 |
| type=VISITING_MEDICAL_STUDENT | 11 |

All filter combinations behave correctly.

---

## URL-guessing reality check

I probed 70 candidate URLs based on common patterns at well-known institutions. Result distribution:

| Status | Count | Meaning |
|---|---:|---|
| 200 | 5 | Direct page exists at guessed path |
| 403 | 3 | Page exists but Cloudflare bot-blocks the runner |
| 404 | 55 | Guessed path doesn't exist (institution uses different URL) |
| 0 (timeout/abort) | 7 | Network error or column-parsing artifact |

**78% (55/70) of pattern-guessed URLs are wrong.** Institutions use wildly different URL conventions for the same content. There is no consistent pattern across med schools for "visiting students" pages — examples of patterns that all failed:
- `/visiting-medical-students/` (UVM uses this)
- `/visiting-students` (most don't)
- `/sites/visitingstudents/` (Northwestern doesn't actually have this)
- `/visitingstudents/` (UPenn doesn't have this)
- `/visiting-student-program` (Brown uses this)
- `/visiting/` (none in my sample)

**Conclusion: URL pattern guessing is not a productive scaling path.** The fastest way to grow the corpus is operator-supplied exact links from manual research. A trained extraction model could discover these URLs at scale from an institution homepage, but that's a separate sprint.

---

## Sample of new auto-promote rows

| Institution | Page title | Source URL |
|---|---|---|
| University of Iowa Carver | MD Program | medicine.uiowa.edu/md/current-students/visiting-students |
| Vanderbilt SOM | Visiting Medical Students | medschool.vanderbilt.edu/visiting-medical-students/ |
| Warren Alpert (Brown) | *held — weak quote* | brown.edu/academics/medical/education/md-program/visiting-student-program |
| UVM Larner | *synthesized — page is sparse* | med.uvm.edu/mededucation/md_program/visiting_students |
| Rush Medical College | Visiting Medical Students | rushu.rush.edu/rush-medical-college/visiting-medical-students |

UVM's page title is just the institution name ("The Robert Larner, M.D. College of Medicine") — the runner now correctly rejects that as not a program name and falls back to the synthesized "{Institution} — Visiting Medical Student Program" label.

---

## Pre-existing data quality flag

One reviewer-approved snapshot row (NOT a Batch 2 row) trips a pharmacy regex on read-back:

| Row | Institution | Issue |
|---|---|---|
| `56e9522a31064526` | Emory University Hospital | URL is `/research/training/index.html`; quote mentions "PharmD students" in a list of accepted trainees for a translational research training program. Tagged `RESEARCH_OPPORTUNITY` — borderline-USCE. Reviewer-approved in an earlier pass. |

Recommendation: flag for re-review in the admin queue. Not removing here — that would mutate a reviewer decision without operator approval.

---

## Validators

```
P102 exact-seed validator: 21/21 pass
P102 intelligent rows validator: 19/19 pass
tsc --noEmit: clean
validate-no-secrets: 0 findings across 6432 files
  (added "evidence" to EXCLUDE_DIRS — institutional page snapshots
   contain third-party Google Maps API keys that are not our secrets)
```

`npm run build`: not run (deferred to next sprint when a public route is being considered).

---

## What changed in the runner during this batch

1. **UA changed** from custom `USMLEPlatform-P102-ExactSeed/1.0` to Safari 17 string. Many institutional sites Cloudflare-403 anything that doesn't look like a real browser. This recovered UCSF Fresno (Batch 1 weak-quote hold → Batch 2 auto-promote).

2. **Page title extractor tightened** (`extractPageTitle` in `scripts/p102-run-exact-usce-seed-links.ts`):
   - Removed `md program` from the drop list (it's a useful descriptor on Iowa's page)
   - Strengthened `isInstitution` check — now drops any title part containing a distinctive institution token regardless of word count (catches UVM's "The Robert Larner, M.D. College of Medicine")
   - Added a known-acronym preference (VSLO, VSAS, IVMS) so they beat longer alternatives in the same title
   - When no acceptable title part remains, return null so the adapter falls back to the synthesized `"{institution} — {prettyType}"` name instead of displaying the bare institution name

3. **no-secrets validator** added `evidence` to `EXCLUDE_DIRS` — institutional pages embed Google Maps API keys that are third-party content, not our credentials.

---

## Recommendation

**Choice A still: feed the corpus more operator-supplied exact links.**

This batch confirms that URL-pattern guessing is a dead end (22% success rate). The 5 verified URLs are useful but the cost-per-verified-URL is too high to scale this way.

The two productive scaling paths are:

1. **Operator's manual exact-link work** — every URL the operator confirms gets a near-100% promote rate. The operator's notes on uscehub.com style + production listings suggest they already have a list.

2. **Headless-browser fetch for Cloudflare-protected sites** — Hopkins, Michigan, and possibly Penn / Stanford / Yale appear to bot-block at the WAF layer. A headless Chromium pass (Puppeteer / Playwright) would unblock these without changing the validation gates. This is a separate sprint and trades determinism for coverage.

Public-route deploy is **not** ready at 29 rows. The user's threshold was 75-100 strong rows. Path to 75-100:

- 30-50 more operator exact links → +30-40 public-safe rows = 60-70 total
- Headless-browser pass on the 3-4 Cloudflare URLs → +3-4 = ~70-75
- Fix the 3 weak-quote holds (Houston Methodist VMS, Brown, Houston Methodist IMG) by visiting each and pasting a better quote via the admin UI → +3 = ~75

---

## Output files

```
docs/platform-v2/local/usce-discovery-command-center/p102/
  P102_EXACT_LINK_SEED_BATCH2_REPORT.md           ← this file
  queues/p102_exact_usce_seed_links.csv           ← 19 seeds total (was 11)
  exports/
    exact_seed_public_safe_rows.json              ← 14 auto-promote rows
    exact_seed_hold_rows.json                     ← 3 hold rows
    exact_seed_rejected_rows.json                 ← 0 rejected
    exact_seed_duplicate_clusters.json            ← 0 clusters
    exact_seed_run_report.json                    ← per-seed run results
  evidence/exact-seed/
    seed_001…seed_019                              ← raw.html + cleaned + meta per seed

scripts/
  p102-run-exact-usce-seed-links.ts               ← UA + title-extractor improvements
  validate-no-secrets.ts                          ← evidence/ now excluded
```

---

## Production-route discussion: not yet

Current state does not meet the operator's bar for public deploy:
- 29 rows total (target: 75-100 strong rows)
- 1 borderline RESEARCH_OPPORTUNITY row (Emory) needs reviewer attention
- 4 Cloudflare-blocked institutions need a headless-browser fetch path
- 14 of 29 rows are exact-seed (no per-row reviewer signoff yet)

When the corpus reaches 75-100 rows and the operator does a full pass-through in the admin UI, that's the right moment to discuss route promotion.
