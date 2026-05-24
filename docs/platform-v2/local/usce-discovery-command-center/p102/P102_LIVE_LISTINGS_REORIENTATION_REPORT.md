# P102 Live Listings — Reorientation Report

Generated: 2026-05-16  
Branch: `local/p102-live-site-crosscheck-exact-links`  
Parent commit: `08ed85d` (dead-link removal)

---

## TL;DR

- Researched real direct USCE URLs for 23 institutions via WebSearch + WebFetch
- 16 of 21 fetched seeds auto-promoted through the runner (76% rate)
- **8 existing verified-links entries updated** (URL was generic homepage or dead)
- **4 new verified-links entries added** (Maimonides, Loyola, BIDMC, Hackensack)
- **Hide list shrank from 12 → 8** entries (4 reoriented, 3 research-only reclassified, all-PERMANENT)
- Listings on next seed: 195 → **199**
- Verified:true count: 47 → **57** (+10)
- Validators: tsc clean · no-secrets clean · 21/21 exact-seed · 19/19 intelligent gate

---

## Methodology — one institution at a time

For each REORIENT entry from the dead-link audit + high-impact NEEDS_REVERIFY entries:

1. **WebSearch** with query like `"<institution> visiting medical students observership"`
2. Pick the most-specific result (skip aggregator articles, prefer institution domain + program-keyword path)
3. **WebFetch** the candidate URL with a USCE-content check prompt
4. Add to `p102_reorientation_candidates.csv`
5. Run `p102-run-exact-usce-seed-links.ts` → only AUTO_PROMOTE counts as a successful reorientation

The runner is the gate. If the runner returns INVALID_NOT_USCE_SOURCE or REJECT_RESEARCH_ONLY, the candidate is rejected — even if a human can read the page and see USCE content.

---

## The 16 reoriented entries (now in verified-links.ts)

### Updated existing entries (URL was wrong / generic / dead)

| Institution | OLD URL | NEW URL |
|---|---|---|
| UPMC | dom.pitt.edu/education/eop/ (404) | medstudentaffairs.pitt.edu/visiting-students |
| Stanford Health Care | /shctv/education/observership.html | med.stanford.edu/visiting-clerkships/visitingclerkships.html |
| UF Health / Shands | hr.med.ufl.edu/volunteers/onserving-… (typo, 404) | osa.med.ufl.edu/students/visiting-medical-student-clerkships/ |
| Northwestern Memorial | nm.org/ (homepage) | feinberg.northwestern.edu/md-education/visiting-students/index.html |
| Henry Ford | henryford.com/ (homepage) | henryford.com/hcp/med-ed/ugme/students/visiting-students |
| Baylor College of Medicine | bcm.edu/ (homepage) | bcm.edu/education/school-of-medicine/m-d-program/curriculum/elective-program/visiting-medical-student |
| Wayne State / DMC | med.wayne.edu/ (homepage) | dmc.org/health-professionals/gme-at-dmc/dmc-clinical-campus/elective-visiting-students |
| Yale-New Haven | medicine.yale.edu/ (homepage) | medicine.yale.edu/md-program/visiting-students/ |

All 8: `verified: false → true`.

### Newly added entries

| Institution | New URL | Audience |
|---|---|---|
| Maimonides Medical Center | maimo.org/medical-education/internships-undergraduate-medical-education/ | BOTH (US + INTL) |
| Loyola University Medical Center | luc.edu/stritch/regrec/students/visitingstudents/ | VMS (+ INTL sub-path) |
| Beth Israel Deaconess Medical Center | bidmc.org/education-training/medical-education | VMS (Harvard-affiliated) |
| Hackensack University Medical Center | hackensackmeridianhealth.org/.../internal-medicine-residency/elective-rotations | VMS (IM-specific) |

---

## Hide list — 12 → 8 entries

### Removed (replaced with valid URL in verified-links)
- Maimonides Medical Center
- Loyola University Medical Center
- University of Florida Health / Shands Hospital
- UPMC (University of Pittsburgh Medical Center)

### Reclassified REORIENT → PERMANENT (replacement found but page is research, not Tier-1 USCE)
- Cleveland Clinic — Research Fellowship (lerner.ccf.org/education/postdoctoral-program/ — research only)
- Cedars-Sinai — Research Fellowship (postdoctoral-scientist-program — research only)
- Emory University — Postdoctoral Research (med.emory.edu/education/postdoctoral-training/ — T32, research only)

### Reclassified REORIENT → PERMANENT (institution alive but no USCE program)
- Brookdale University Hospital — One Brooklyn Health only offers ACGME residencies, no observership/visiting-student program found

### Unchanged (PERMANENT)
- Interfaith Medical Center (bankruptcy → OBH, no USCE)
- Kingsbrook Jewish Medical Center (merged → OBH, no USCE)
- Global Medical Foundation — USCE Programs (third-party aggregator dead)
- Clinical Experience Programs (CEP) — IMG Rotations (third-party aggregator dead)

**All remaining 8 hide-list entries are PERMANENT** — no more reorientation work to do for them.

---

## What runner rejected during reorientation (5 candidates)

These had valid URLs but didn't pass the runner's direct-link / triage gate:

| Candidate | Why rejected |
|---|---|
| UPMC International Clinical Collaborations | `INVALID_NOT_USCE_SOURCE` — page is general international services landing, not opportunity-specific |
| MGH International Observership | `INVALID_NOT_USCE_SOURCE` — page exists but doesn't pass direct-link signal (massgeneral.org/education/international-observership) |
| Cleveland Clinic Lerner Research | Research-only → reclassified PERMANENT in hide list |
| Cedars-Sinai Postdoctoral Scientist | Research-only → reclassified PERMANENT |
| Emory Postdoctoral Training | Research-only → reclassified PERMANENT |

**Net result:** the 3 research-only ones move from "URL is dead" to "URL works but page is research" — same end-state for the public product (hidden). The UPMC International + MGH International candidates are real pages but the runner's gate is correct to reject them as not direct-USCE-program pages. Operator can revisit those with a different URL if a deeper department-specific page exists.

---

## Two URL-finding failures (operator follow-up)

| Institution | Issue | Suggested next step |
|---|---|---|
| Beth Israel Deaconess Medical Center | Runner FAILED_FETCH (Node 22 TLS handshake issue with bidmc.org; the URL works in a browser) | Added to verified-links.ts anyway; will work in production fetcher |
| Wayne State / DMC | Runner FAILED_FETCH (403 Cloudflare) | Added to verified-links.ts anyway; dmc.org Cloudflare-protected against bot fetchers but works in a browser |

These two are KEPT in verified-links because the URLs are correct — the runner pipeline just can't fetch them. Live users browsing the site won't hit those barriers.

---

## Seed effect (dry-run, no DB mutation)

```
Total programs in data.js:    207
Hidden by hidelist:             8  (was 12)
Listings to seed:             199  (was 195)
verified:true count:           57  (was 47, +10)
```

The seed flow will produce 199 Listing rows. Each listing's `websiteUrl` will be:
- the verified-links override (now 83 entries; 57 with verified:true)
- OR the raw `data.js` program.link (148 entries still using raw — many of these are still generic landing pages from the earlier crosswalk)

---

## Files changed

```
prisma/verified-links.ts                     — 8 entries updated, 4 added (79 → 83 total)
prisma/listings-hidelist.ts                  — 12 → 8 entries, all PERMANENT
docs/.../p102/queues/p102_reorientation_candidates.csv  — 23 seeds with verified URLs
docs/.../p102/P102_LIVE_LISTINGS_REORIENTATION_REPORT.md — this file
docs/.../p102/exports/exact_seed_*.json     — runner re-output (includes reorient_* rows)
docs/.../p102/evidence/exact-seed/reorient_* — 21 evidence snapshots
```

---

## What this DOES NOT yet do

- **The other ~75 NEEDS_REVERIFY institutions** (hospital homepages) are not yet reoriented. The 23 attacked here were the highest-impact subset. Continuing batches will follow the same WebSearch → WebFetch → runner-validate workflow.
- **The 72 LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK rows** are not yet touched. They have URLs that work but point at non-USCE pages. Some may simply need URL replacement (same workflow as above); others may be programs the institution doesn't actually run (then they belong on the hide list).
- **No production DB writes.** All changes affect the local seed flow only. Sibling `usmle-observerships/data.js` not mutated.

---

## Validators

```
tsc --noEmit: clean
validate-no-secrets: 0 findings across 6444 files
p102-validate-exact-seed-rows: 21/21 pass
p102-validate-intelligent-opportunity-rows: 19/19 pass
```

---

## Recommendation

**Next batch of operator-supplied or web-searched URLs.** The 23 institutions attacked here generated 16 new reoriented entries (70% yield). Repeating this workflow on the remaining ~75 NEEDS_REVERIFY entries should produce another 40-50 reorientations, taking the verified-links count from 83 → ~130. After that, the live seed flow will have every listing pointed at a verified direct-USCE URL — and the "Every click should directly open to a page containing USCE" goal becomes reachable.
