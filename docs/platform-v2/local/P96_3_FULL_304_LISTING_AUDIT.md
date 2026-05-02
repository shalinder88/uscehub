# P96-3 — full 304-listing screenshot audit

Generated: 2026-05-02
Sample size: 304 (full live `/browse` listing set)

Pipeline: Playwright headless captures of (a) local USCEHub listing
detail and (b) the apply CTA's external URL → pure content classifier
on URL+status → JSON sidecar + CSV + this doc. No DB connection.
Sample discovered by reading the running dev server's /browse page.

Local-only artifacts. No DB mutation, no production cron, no deploy.

## Outputs

- `docs/platform-v2/local/p96_3_full_304_listing_audit.csv` — one row per listing, augmented with target-fit columns by `scripts/p96-3-target-fit.ts`.
- `docs/platform-v2/local/p96_3_full_304_listing_screenshot_manifest.csv` — file paths for every USCEHub + source PNG and JSON sidecar.
- `docs/platform-v2/local/p96_3_discarded_or_non_target_links.csv` — every row flagged `MAYBE_TARGET_MANUAL_REVIEW` or `NON_TARGET_*`, with reversibility metadata (`canReconsiderLater`, `futureLaneCandidate`).
- `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/` — 600 PNGs (gitignored).
- `docs/platform-v2/local/review-workbench/review-data.json` — 181 questionable rows surfaced for human review.

## Verdict distribution

| Verdict | Count |
| --- | --- |
| PATH_HINTS_PROGRAM | 130 |
| GENERIC_HOMEPAGE | 106 |
| DEEP_PATH_NO_HINT | 62 |
| LIKELY_WRONG_PAGE | 3 |
| UNKNOWN | 3 |

## Recommended-action distribution

| Action | Count |
| --- | --- |
| KEEP_SOURCE | 129 |
| NEEDS_BETTER_SOURCE | 104 |
| MANUAL_REVIEW | 64 |
| SOURCE_DEAD_REVIEW | 4 |
| WRONG_PAGE_REPLACE | 3 |

## Target-fit distribution

| Target fit | Count |
| --- | --- |
| TARGET_USCE_MATCH | 281 |
| MAYBE_TARGET_MANUAL_REVIEW | 23 |

No `NON_TARGET_*` rows in the existing 304 (curated set). All
ambiguous rows preserved with `canReconsiderLater=true` per P97
reversibility doctrine.

## Worst findings

- **3 LIKELY_WRONG_PAGE** rows — source URL contains a wrong-page hint (e.g. `consulting/advisory-services`). Highest priority for admin re-link.
- **106 GENERIC_HOMEPAGE** rows — source URL points at a generic institution homepage with no program-specific path. Re-link candidates.
- **62 DEEP_PATH_NO_HINT** rows — deep URL paths with no program-keyword match. Visual review needed; some may be valid program pages with non-matching slugs.
- **4 SOURCE_DEAD_REVIEW** rows — source did not capture (PDF, HTTP error, navigation timeout). Per P97 doctrine, institution-hosted PDFs are valid sources but need a non-PDF browser landing page where possible.
- **23 MAYBE_TARGET_MANUAL_REVIEW** rows — title/URL keywords ambiguous (e.g. "visiting scholars", "research fellow"); needs human read of the official page.

## Review workbench

The local-only review workbench surfaces all 181 questionable rows
(any row that is not `PATH_HINTS_PROGRAM` + `KEEP_SOURCE` +
`TARGET_USCE_MATCH`).

```bash
cd /Users/shelly/usmle-platform
python3 -m http.server 8766
# open http://localhost:8766/docs/platform-v2/local/review-workbench/
```

Per-row controls: 5 decision buttons (`KEEP`, `KEEP_WITH_CAVEATS`,
`MODIFY`, `DISCARD`, `NEEDS_MORE_RESEARCH`); 12 quick templates
(keep_ok, modify_source, modify_apply, fix_description,
fit_unclear, specialist_only, basic_science, discard_wedge,
needs_better, needs_search, etc.); copy-source-URL,
copy-application-URL, copy-summary, open-all-evidence (USCEHub +
official source + JSON sidecar), and mark-reviewed-→-next
buttons. Sidebar dashboard (13 clickable counter tiles) and sort
options (severity, target-fit severity, institution, verdict,
undecided-first).

Decisions persist in `localStorage` under `p96-4a-decisions-v1`.
Export schema (JSON or CSV): itemId, listingIdOrSlug, title,
institution, sourceUrl, applicationUrl, sourceVerdict, targetFit,
originalRecommendedAction, userDecision, newSourceUrl,
newApplicationUrl, modifyInstructions, caveatText, discardReason,
futureLaneCandidate, canReconsiderLater, priority,
needsFutureRecheckDate, researchQuestion, suspectedCorrectSource,
reviewerNotes, decidedAt.

## Recommendation before any DB edit

The workbench writes nothing. The next pipeline step (P96-4B) is
to consume the exported decisions JSON into an actionable admin
queue. No DB mutation should occur until decisions are exported,
reviewed by hand, and explicitly approved per row.

## Per-listing detail

### Northwell Health System

- id: `cmn2111jv001esb1197ufjp8u`
- USCEHub URL: http://localhost:3000/listing/cmn2111jv001esb1197ufjp8u
- source URL: https://international.northwell.edu/consulting-advisory-services
- content verdict: **LIKELY_WRONG_PAGE** (wrong_page_hints:consulting,advisory services)
- source HTTP status: 200
- source final URL: https://international.northwell.edu/consulting-advisory-services
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111jv001esb1197ufjp8u-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111jv001esb1197ufjp8u-20260502.png`
- recommended action: Source URL contains wrong-page hint; admin re-link.

### UW Medicine Seattle Visiting Students Program

- id: `cmo34f4ey001h1nxx722orcxh`
- USCEHub URL: http://localhost:3000/listing/cmo34f4ey001h1nxx722orcxh
- source URL: https://www.uwmedicine.org/school-of-medicine/visiting-students-program/visiting-us-canada
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 403
- source final URL: https://www.uwmedicine.org/school-of-medicine/visiting-students-program/visiting-us-canada
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4ey001h1nxx722orcxh-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4ey001h1nxx722orcxh-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### VCU Health / MCV Hospitals

- id: `cmn2113fn005usb11jprkbjsa`
- USCEHub URL: http://localhost:3000/listing/cmn2113fn005usb11jprkbjsa
- source URL: https://www.vcuhealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.vcuhealth.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113fn005usb11jprkbjsa-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113fn005usb11jprkbjsa-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UT Health San Antonio

- id: `cmn2112fx003isb11x5b08yua`
- USCEHub URL: http://localhost:3000/listing/cmn2112fx003isb11x5b08yua
- source URL: https://www.uthscsa.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://uthscsa.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112fx003isb11x5b08yua-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112fx003isb11x5b08yua-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Mount Sinai Morningside / West

- id: `cmn211162000isb11ch7hhgdh`
- USCEHub URL: http://localhost:3000/listing/cmn211162000isb11ch7hhgdh
- source URL: https://www.mountsinai.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.mountsinai.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211162000isb11ch7hhgdh-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211162000isb11ch7hhgdh-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Emory University SOM Visiting Student / Clinical Observership

- id: `cmo3385r8001l1ny9zaacztke`
- USCEHub URL: http://localhost:3000/listing/cmo3385r8001l1ny9zaacztke
- source URL: https://med.emory.edu/education/admissions/visiting/index.html
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://med.emory.edu/education/admissions/visiting/index.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385r8001l1ny9zaacztke-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385r8001l1ny9zaacztke-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### MedStar Georgetown University Hospital

- id: `cmn2112790030sb11lgcyjgkr`
- USCEHub URL: http://localhost:3000/listing/cmn2112790030sb11lgcyjgkr
- source URL: https://www.medstarhealth.org/education
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.medstarhealth.org/education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112790030sb11lgcyjgkr-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112790030sb11lgcyjgkr-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Baylor College of Medicine — Postdoctoral Research

- id: `cmn21145j007gsb11ba86v05m`
- USCEHub URL: http://localhost:3000/listing/cmn21145j007gsb11ba86v05m
- source URL: https://www.bcm.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.bcm.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21145j007gsb11ba86v05m-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21145j007gsb11ba86v05m-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Wyckoff Heights Medical Center

- id: `cmn2111el0016sb11s4ch7y7z`
- USCEHub URL: http://localhost:3000/listing/cmn2111el0016sb11s4ch7y7z
- source URL: https://www.wyckoffhospital.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://whmcny.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111el0016sb11s4ch7y7z-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111el0016sb11s4ch7y7z-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Cleveland Clinic Elective Program

- id: `cmo34f3k1000d1nxx22bee6we`
- USCEHub URL: http://localhost:3000/listing/cmo34f3k1000d1nxx22bee6we
- source URL: https://my.clevelandclinic.org/departments/elective-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:elective)
- source HTTP status: 200
- source final URL: https://my.clevelandclinic.org/departments/elective-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3k1000d1nxx22bee6we-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3k1000d1nxx22bee6we-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### SUNY Downstate Medical Center

- id: `cmn2111kl001gsb118m3doyxd`
- USCEHub URL: http://localhost:3000/listing/cmn2111kl001gsb118m3doyxd
- source URL: https://www.downstate.edu/education-training/graduate-medical-education/index.html
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.downstate.edu/education-training/graduate-medical-education/index.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111kl001gsb118m3doyxd-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111kl001gsb118m3doyxd-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Mayo Clinic

- id: `cmn21128p0034sb11bh6ix3xv`
- USCEHub URL: http://localhost:3000/listing/cmn21128p0034sb11bh6ix3xv
- source URL: https://college.mayo.edu/academics/visiting-medical-student-clerkships/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting medical student,clerkship)
- source HTTP status: 200
- source final URL: https://college.mayo.edu/academics/visiting-medical-student-clerkships/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21128p0034sb11bh6ix3xv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21128p0034sb11bh6ix3xv-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Drexel University / Hahnemann (Tower Health)

- id: `cmn2112nm0042sb119q64hx5i`
- USCEHub URL: http://localhost:3000/listing/cmn2112nm0042sb119q64hx5i
- source URL: https://drexel.edu/medicine/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://drexel.edu/medicine/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112nm0042sb119q64hx5i-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112nm0042sb119q64hx5i-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Geisinger Medical Center

- id: `cmn2115qt00b8sb11lj2ug8jv`
- USCEHub URL: http://localhost:3000/listing/cmn2115qt00b8sb11lj2ug8jv
- source URL: https://www.geisinger.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=3168ab46-976e-495d-8e52-dedc86664262&ssb=64178205942&ssc=https%3A%2F%2Fwww.geisinger.org%2F&ssi=3ca61201-d5ku-4868-b3d2-bf69c9e7cbf7&ssk=botmanager_support@radware.com&ssm=86144468761726748106665883008657&ssn=a483aadf4e4bb1775085e5e8db804bffd64c5e26001c-ef84-4d47-8ba1c2&sso=ac416aff-210acf11818d8cf8911a34d5fb9bf06f752396c075ee4f75&ssp=75102647661777668067177765895283450&ssq=79398069140697569073091406654256397474448&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJfX3V6bWYiOiI3ZjkwMDA1ZTI2MDAxYy1lZjg0LTRkNDctOGFmZi0yMTBhY2YxMTgxOGQxLTE3Nzc2OTE0MDYyMDEwLTAwMzg4OWQ2N2YxMzhkZTgzMWMxMCIsInJkIjoiZ2Vpc2luZ2VyLm9yZyIsInV6bXgiOiI3ZjkwMDA3YmU1NzgyYS1iY2RiLTQyNWQtYjA1Zi05NmIxMWE4OGYzNTAxLTE3Nzc2OTE0MDYyMDEwLTc2M2VmYmZmYTEwMDhkMWYxMCJ9
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115qt00b8sb11lj2ug8jv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115qt00b8sb11lj2ug8jv-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Stony Brook University Hospital

- id: `cmn2111lb001isb11fb37azrf`
- USCEHub URL: http://localhost:3000/listing/cmn2111lb001isb11fb37azrf
- source URL: https://renaissance.stonybrookmedicine.edu/gme
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://renaissance.stonybrookmedicine.edu/gme
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111lb001isb11fb37azrf-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111lb001isb11fb37azrf-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Duke University Hospital

- id: `cmn2112qu0044sb11m7wwscho`
- USCEHub URL: http://localhost:3000/listing/cmn2112qu0044sb11m7wwscho
- source URL: https://medschool.duke.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://medschool.duke.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112qu0044sb11m7wwscho-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112qu0044sb11m7wwscho-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Yale School of Medicine — Postdoctoral Research

- id: `cmn21144u007esb11pfjw2mj2`
- USCEHub URL: http://localhost:3000/listing/cmn21144u007esb11pfjw2mj2
- source URL: https://postdocs.yale.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://postdocs.yale.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21144u007esb11pfjw2mj2-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21144u007esb11pfjw2mj2-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Newark Beth Israel Medical Center

- id: `cmn21130x004wsb112pfkq89t`
- USCEHub URL: http://localhost:3000/listing/cmn21130x004wsb112pfkq89t
- source URL: https://www.rwjbh.org/newark-beth-israel-medical-center/education/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.rwjbh.org/newark-beth-israel-medical-center/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21130x004wsb112pfkq89t-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21130x004wsb112pfkq89t-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UC Irvine Medical Center

- id: `cmn2111qh001wsb111gq2cngn`
- USCEHub URL: http://localhost:3000/listing/cmn2111qh001wsb111gq2cngn
- source URL: https://www.ucihealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: page.screenshot: Timeout 30000ms exceeded.
Call log:
  - taking page screenshot
  - waiting for fonts to load...

- source final URL: (none)
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111qh001wsb111gq2cngn-20260502.png`
- source screenshot: (failed: page.screenshot: Timeout 30000ms exceeded.
Call log:
  - taking page screenshot
  - waiting for fonts to load...
)
- recommended action: Screenshot capture failed: page.screenshot: Timeout 30000ms exceeded.
Call log:
  - taking page screenshot
  - waiting for fonts to load...
.

### Loma Linda University Medical Center

- id: `cmn2111r6001ysb11czxooaqe`
- USCEHub URL: http://localhost:3000/listing/cmn2111r6001ysb11czxooaqe
- source URL: https://lluh.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://lluh.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111r6001ysb11czxooaqe-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111r6001ysb11czxooaqe-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Mercy Hospital St. Louis

- id: `cmn2112yq004qsb11hveu7mqi`
- USCEHub URL: http://localhost:3000/listing/cmn2112yq004qsb11hveu7mqi
- source URL: https://www.mercy.net/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.mercy.net/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112yq004qsb11hveu7mqi-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112yq004qsb11hveu7mqi-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Flushing Hospital Medical Center

- id: `cmn2114xq009csb115qvu2i90`
- USCEHub URL: http://localhost:3000/listing/cmn2114xq009csb115qvu2i90
- source URL: https://www.flushinghospital.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://flushinghospital.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114xq009csb115qvu2i90-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114xq009csb115qvu2i90-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UW Madison International Observership in Urology

- id: `cmo33870x003b1ny994cg6cjp`
- USCEHub URL: http://localhost:3000/listing/cmo33870x003b1ny994cg6cjp
- source URL: https://urology.wisc.edu/education-and-training/international-observership-in-urology/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://urology.wisc.edu/education-and-training/international-observership-in-urology/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33870x003b1ny994cg6cjp-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33870x003b1ny994cg6cjp-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Utah Moran Eye International Observership

- id: `cmo3386to00311ny9vjdxoefc`
- USCEHub URL: http://localhost:3000/listing/cmo3386to00311ny9vjdxoefc
- source URL: https://prod.ophthalmology.medicine.utah.edu/ophthalmology/education/fellowship/international-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://prod.ophthalmology.medicine.utah.edu/ophthalmology/education/fellowship/international-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386to00311ny9vjdxoefc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386to00311ny9vjdxoefc-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Minnesota Pathology Observership

- id: `cmo33867o00271ny9ovpq1r1c`
- USCEHub URL: http://localhost:3000/listing/cmo33867o00271ny9ovpq1r1c
- source URL: https://med.umn.edu/pathology/education-training/residency/observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.umn.edu/pathology/education-training/residency/observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33867o00271ny9ovpq1r1c-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33867o00271ny9ovpq1r1c-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Chicago Pritzker Visiting Students Program

- id: `cmo34f3ta000p1nxxugaetc8m`
- USCEHub URL: http://localhost:3000/listing/cmo34f3ta000p1nxxugaetc8m
- source URL: https://pritzker.uchicago.edu/academics/visiting-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://pritzker.uchicago.edu/academics/visiting-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3ta000p1nxxugaetc8m-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3ta000p1nxxugaetc8m-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Orlando Health Pediatric Neurosurgery Clinical Observership

- id: `cmo3385o6001h1ny9z7gkibwc`
- USCEHub URL: http://localhost:3000/listing/cmo3385o6001h1ny9z7gkibwc
- source URL: https://www.orlandohealth.com/services-and-specialties/childrens-neuroscience-institute/education/pediatric-neurosurgery-clinical-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.orlandohealth.com/services-and-specialties/childrens-neuroscience-institute/education/pediatric-neurosurgery-clinical-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385o6001h1ny9z7gkibwc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385o6001h1ny9z7gkibwc-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Penn Dermatopathology International Observership

- id: `cmo3386jd002n1ny9fvhszodk`
- USCEHub URL: http://localhost:3000/listing/cmo3386jd002n1ny9fvhszodk
- source URL: https://dermatology.upenn.edu/education/fellowship-training/dermatopathology-international-observership/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://dermatology.upenn.edu/education/fellowship-training/dermatopathology-international-observership/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386jd002n1ny9fvhszodk-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386jd002n1ny9fvhszodk-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Boston Children's Hospital — Observership

- id: `cmn2114m6008msb11ihsjqovc`
- USCEHub URL: http://localhost:3000/listing/cmn2114m6008msb11ihsjqovc
- source URL: https://bchapps.childrenshospital.org/observership/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://bchapps.childrenshospital.org/observership/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114m6008msb11ihsjqovc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114m6008msb11ihsjqovc-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Arizona Tucson Visiting Medical Students

- id: `cmo34f4je001n1nxx7e913b78`
- USCEHub URL: http://localhost:3000/listing/cmo34f4je001n1nxx7e913b78
- source URL: https://medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting medical student)
- source HTTP status: 200
- source final URL: https://medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4je001n1nxx7e913b78-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4je001n1nxx7e913b78-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### NYU Langone Visiting International Physicians Program — Orthopedic Surgery

- id: `cmo3384p200071ny9poe15otq`
- USCEHub URL: http://localhost:3000/listing/cmo3384p200071ny9poe15otq
- source URL: https://med.nyu.edu/departments-institutes/orthopedic-surgery/education/visiting-international-physicians-program
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/departments-institutes/orthopedic-surgery/education/visiting-international-physicians-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384p200071ny9poe15otq-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384p200071ny9poe15otq-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UT Southwestern Plastic Surgery Observership

- id: `cmo3386sa002z1ny9arnxr27u`
- USCEHub URL: http://localhost:3000/listing/cmo3386sa002z1ny9arnxr27u
- source URL: https://www.utsouthwestern.edu/departments/plastic-surgery/education-training/observerships.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.utsouthwestern.edu/departments/plastic-surgery/education-training/observerships.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386sa002z1ny9arnxr27u-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386sa002z1ny9arnxr27u-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Baptist Health International Observerships

- id: `cmo3385jq001b1ny9gnvp324l`
- USCEHub URL: http://localhost:3000/listing/cmo3385jq001b1ny9gnvp324l
- source URL: https://baptisthealth.net/international-services/international-healthcare-professionals/international-observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://baptisthealth.net/international-services/international-healthcare-professionals/international-observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385jq001b1ny9gnvp324l-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385jq001b1ny9gnvp324l-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University Hospitals Cleveland Visiting Medical Student Program

- id: `cmo34f3lj000f1nxxjw8zcxuz`
- USCEHub URL: http://localhost:3000/listing/cmo34f3lj000f1nxxjw8zcxuz
- source URL: https://www.uhhospitals.org/medical-education/undergraduate-medical-education/visiting-medical-student-program/visiting-medical-student-program-clevel
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting medical student)
- source HTTP status: 200
- source final URL: https://www.uhhospitals.org/medical-education/undergraduate-medical-education/visiting-medical-student-program/visiting-medical-student-program-clevel
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3lj000f1nxxjw8zcxuz-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3lj000f1nxxjw8zcxuz-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UCSF Neuropathology Visiting Scholars Program

- id: `cmo33857o000v1ny9ekt4l5sp`
- USCEHub URL: http://localhost:3000/listing/cmo33857o000v1ny9ekt4l5sp
- source URL: https://pathology.ucsf.edu/clinical/ap/neuropath/visiting-scholars
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://pathology.ucsf.edu/clinical/ap/neuropath/visiting-scholars
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33857o000v1ny9ekt4l5sp-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33857o000v1ny9ekt4l5sp-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University of Florida College of Medicine International Visiting Student

- id: `cmo34f4r7001x1nxxtn64ibij`
- USCEHub URL: http://localhost:3000/listing/cmo34f4r7001x1nxxtn64ibij
- source URL: https://osa.med.ufl.edu/students/visiting-medical-student-clerkships/international-visiting-student-program/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting medical student)
- source HTTP status: 200
- source final URL: https://osa.med.ufl.edu/students/visiting-medical-student-clerkships/international-visiting-student-program/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4r7001x1nxxtn64ibij-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4r7001x1nxxtn64ibij-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Metropolitan Hospital Center

- id: `cmn2111ce0010sb11kh0qbbxa`
- USCEHub URL: http://localhost:3000/listing/cmn2111ce0010sb11kh0qbbxa
- source URL: https://www.nychealthandhospitals.org/metropolitan/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=7e0625da-4ed1-44ef-a628-9cccabebbfd2&ssb=07132240586&ssc=https%3A%2F%2Fwww.nychealthandhospitals.org%2Fmetropolitan%2F&ssi=60aa5b1f-c6hb-49d7-979f-e4f38f027f2b&ssk=botmanager_support@radware.com&ssm=79454808817966009101434813070456&ssn=09afddb078a1eb526cc36df37a148aab4832ccb1a0ce-3a16-4e73-a074b8&sso=f94c2e47-361d578313b66b62f7ca9defa8434c678cfd253b452e608b&ssp=54941524811777604522177766438468643&ssq=72430789154688413487091546664795759659658&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJfX3V6bWYiOiI3ZjkwMDBjY2IxYTBjZS0zYTE2LTRlNzMtYWU0Ny0zNjFkNTc4MzEzYjYxLTE3Nzc2OTE1NDYyMDQwLTAwMzM0ZWVmZWY2ZGU5ODUxMzUxMCIsInV6bXgiOiI3ZjkwMDBiMjRjYTQ2Mi1mYWY4LTQyNzAtYjI5Zi00ODkyZTA0YWMyMWExLTE3Nzc2OTE1NDYyMDQwLTI0NDI5NzYyMmMyMjA3N2IxMCIsInJkIjoibnljaGVhbHRoYW5kaG9zcGl0YWxzLm9yZyJ9
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111ce0010sb11kh0qbbxa-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111ce0010sb11kh0qbbxa-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### International Trainee Pediatric Observership — CU Anschutz / Children's Colorado

- id: `cmo33859c000x1ny947bcqylf`
- USCEHub URL: http://localhost:3000/listing/cmo33859c000x1ny947bcqylf
- source URL: https://medschool.cuanschutz.edu/pediatrics/education/international-trainee-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://medschool.cuanschutz.edu/pediatrics/education/international-trainee-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33859c000x1ny947bcqylf-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33859c000x1ny947bcqylf-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Crozer-Chester Medical Center

- id: `cmn211569009usb119spp0t4q`
- USCEHub URL: http://localhost:3000/listing/cmn211569009usb119spp0t4q
- source URL: https://www.crozerhealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.crozerhealth.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211569009usb119spp0t4q-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211569009usb119spp0t4q-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### NYU Langone International Observership — Hair Disorders

- id: `cmo3384nl00051ny9g1m51n91`
- USCEHub URL: http://localhost:3000/listing/cmo3384nl00051ny9g1m51n91
- source URL: https://med.nyu.edu/departments-institutes/dermatology/education/international-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/departments-institutes/dermatology/education/international-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384nl00051ny9g1m51n91-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384nl00051ny9g1m51n91-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Cincinnati Medical Center

- id: `cmn2115al00a6sb11rw5ecehe`
- USCEHub URL: http://localhost:3000/listing/cmn2115al00a6sb11rw5ecehe
- source URL: https://www.uchealth.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://www.uchealth.com/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115al00a6sb11rw5ecehe-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115al00a6sb11rw5ecehe-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Flushing Hospital Medical Center

- id: `cmn2111d40012sb11t82kblsc`
- USCEHub URL: http://localhost:3000/listing/cmn2111d40012sb11t82kblsc
- source URL: https://www.flushinghospital.org/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://flushinghospital.org/graduate-medical-education/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111d40012sb11t82kblsc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111d40012sb11t82kblsc-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Banner University Medical Center — Tucson

- id: `cmn2115m900awsb11prycio5n`
- USCEHub URL: http://localhost:3000/listing/cmn2115m900awsb11prycio5n
- source URL: https://www.bannerhealth.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.bannerhealth.com/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115m900awsb11prycio5n-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115m900awsb11prycio5n-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Jamaica Hospital Medical Center

- id: `cmn2111dv0014sb11q1i4fjzo`
- USCEHub URL: http://localhost:3000/listing/cmn2111dv0014sb11q1i4fjzo
- source URL: https://jamaicahospital.org/graduate-medical-education/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://jamaicahospital.org/graduate-medical-education/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111dv0014sb11q1i4fjzo-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111dv0014sb11q1i4fjzo-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### St. Barnabas Hospital

- id: `cmn2111fx001asb114hiofz1l`
- USCEHub URL: http://localhost:3000/listing/cmn2111fx001asb114hiofz1l
- source URL: https://www.sbhny.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.sbhny.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111fx001asb114hiofz1l-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111fx001asb114hiofz1l-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UW Madison Pathology Observership

- id: `cmo3386zg00391ny9g217zaap`
- USCEHub URL: http://localhost:3000/listing/cmo3386zg00391ny9g217zaap
- source URL: https://residency.pathology.wisc.edu/applying-for-observership/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://residency.pathology.wisc.edu/applying-for-observership/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386zg00391ny9g217zaap-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386zg00391ny9g217zaap-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Summa Health System — Akron

- id: `cmn21158f00a0sb11x9a5ozzf`
- USCEHub URL: http://localhost:3000/listing/cmn21158f00a0sb11x9a5ozzf
- source URL: https://www.summahealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.summahealth.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21158f00a0sb11x9a5ozzf-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21158f00a0sb11x9a5ozzf-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### JPS Health Network

- id: `cmn2115c200aasb110ul4c1ce`
- USCEHub URL: http://localhost:3000/listing/cmn2115c200aasb110ul4c1ce
- source URL: https://www.jpshealthnet.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.jpshealthnet.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115c200aasb110ul4c1ce-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115c200aasb110ul4c1ce-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Wisconsin–Madison Visiting Medical Student Program

- id: `cmo34f3we000t1nxx1ifvu2zl`
- USCEHub URL: http://localhost:3000/listing/cmo34f3we000t1nxx1ifvu2zl
- source URL: https://www.med.wisc.edu/education/md-program/visiting-students/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://www.med.wisc.edu/education/md-program/visiting-students/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3we000t1nxx1ifvu2zl-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3we000t1nxx1ifvu2zl-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UofL Health Medical Observership Program (MOP)

- id: `cmo33861v001z1ny9s6rtx8j6`
- USCEHub URL: http://localhost:3000/listing/cmo33861v001z1ny9s6rtx8j6
- source URL: https://uoflhealth.org/careers/medical-observership-program-mop/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://uoflhealth.org/careers/medical-observership-program-mop/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33861v001z1ny9s6rtx8j6-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33861v001z1ny9s6rtx8j6-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Jackson Memorial Hospital (UMiami)

- id: `cmn2112gq003ksb11sxakpgty`
- USCEHub URL: http://localhost:3000/listing/cmn2112gq003ksb11sxakpgty
- source URL: https://med.miami.edu/centers-and-institutes/international-medicine-institute/education-and-training/global-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.miami.edu/centers-and-institutes/international-medicine-institute/education-and-training/global-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112gq003ksb11sxakpgty-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112gq003ksb11sxakpgty-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UNMC International Neurology Observership

- id: `cmo3386c3002d1ny9p2c7c806`
- USCEHub URL: http://localhost:3000/listing/cmo3386c3002d1ny9p2c7c806
- source URL: https://www.unmc.edu/neurologicalsciences/education/international-observership.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.unmc.edu/neurologicalsciences/education/international-observership.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386c3002d1ny9p2c7c806-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386c3002d1ny9p2c7c806-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Vanderbilt University Medical Center

- id: `cmn2115gi00amsb11qs31gctb`
- USCEHub URL: http://localhost:3000/listing/cmn2115gi00amsb11qs31gctb
- source URL: https://www.vumc.org/observational-services/welcome-vanderbilt-observational-experience-voe-program
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.vumc.org/observational-services/welcome-vanderbilt-observational-experience-voe-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115gi00amsb11qs31gctb-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115gi00amsb11qs31gctb-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UVA Breast Imaging International Visiting Scholars

- id: `cmo3386v300331ny9u212xhza`
- USCEHub URL: http://localhost:3000/listing/cmo3386v300331ny9u212xhza
- source URL: https://med.virginia.edu/radiology/education/mini-fellowships/breast-imaging-international-visiting-scholars/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://med.virginia.edu/radiology/education/mini-fellowships/breast-imaging-international-visiting-scholars/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386v300331ny9u212xhza-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386v300331ny9u212xhza-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Memorial Sloan Kettering International Observership

- id: `cmo3384uz000f1ny9exy8wa7l`
- USCEHub URL: http://localhost:3000/listing/cmo3384uz000f1ny9exy8wa7l
- source URL: https://www.mskcc.org/hcp-education-training/international/observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.mskcc.org/hcp-education-training/international/observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384uz000f1ny9exy8wa7l-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384uz000f1ny9exy8wa7l-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Baylor College of Medicine Visiting Student Rotations

- id: `cmo34f4d7001f1nxxff5dvsyd`
- USCEHub URL: http://localhost:3000/listing/cmo34f4d7001f1nxxff5dvsyd
- source URL: https://www.bcm.edu/education/school-of-medicine/m-d-program/curriculum/elective-program/visiting-medical-student
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:elective,visiting medical student)
- source HTTP status: 200
- source final URL: https://www.bcm.edu/education/school-of-medicine/m-d-program/curriculum/elective-program/visiting-medical-student
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4d7001f1nxxff5dvsyd-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4d7001f1nxxff5dvsyd-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### NYU Langone Academic Observership — Otolaryngology (ENT)

- id: `cmo3384qk00091ny9oclnpm1z`
- USCEHub URL: http://localhost:3000/listing/cmo3384qk00091ny9oclnpm1z
- source URL: https://med.nyu.edu/departments-institutes/otolaryngology-head-neck-surgery/education/academic-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/departments-institutes/otolaryngology-head-neck-surgery/education/academic-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384qk00091ny9oclnpm1z-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384qk00091ny9oclnpm1z-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### NewYork-Presbyterian / Columbia

- id: `cmn21111q000csb1163kfm97r`
- USCEHub URL: http://localhost:3000/listing/cmn21111q000csb1163kfm97r
- source URL: https://www.nyp.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.nyp.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21111q000csb1163kfm97r-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21111q000csb1163kfm97r-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Oregon Health & Science University (OHSU)

- id: `cmn2115h800aosb11kx2c04ei`
- USCEHub URL: http://localhost:3000/listing/cmn2115h800aosb11kx2c04ei
- source URL: https://www.ohsu.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.ohsu.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115h800aosb11kx2c04ei-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115h800aosb11kx2c04ei-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Jacobi Medical Center

- id: `cmn211184000osb11lxan6nl7`
- USCEHub URL: http://localhost:3000/listing/cmn211184000osb11lxan6nl7
- source URL: https://www.nychealthandhospitals.org/jacobi/graduate-medical-education/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=80cc9cde-62b4-4f1f-9d16-a2246bf8b722&ssb=84281294019&ssc=https%3A%2F%2Fwww.nychealthandhospitals.org%2Fjacobi%2Fgraduate-medical-education%2F&ssi=dafe6896-c6hb-4952-8e10-3f627943c31f&ssk=botmanager_support@radware.com&ssm=73758951536764203135283210608617&ssn=0eb2d294b70985057d15f2d4d01184205172ccb1a0ce-3a16-4e73-a58e2a&sso=9e59ee47-361d578313b6e19d076dca4dbf2df3ace80f51170e5f41ed&ssp=48213149081777659925177763375184301&ssq=34472659169392241915991546015792680554651&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJfX3V6bWYiOiI3ZjkwMDBjY2IxYTBjZS0zYTE2LTRlNzMtYWU0Ny0zNjFkNTc4MzEzYjYxLTE3Nzc2OTE1NDYyMDQxNDc2MzEtMDAzZTk5YWY3ZWJiMDIyOTY4YjEzIiwidXpteCI6IjdmOTAwMGIyNGNhNDYyLWZhZjgtNDI3MC1iMjlmLTQ4OTJlMDRhYzIxYTEtMTc3NzY5MTU0NjIwNDE0NzYzMS1iNDU2NzVlMTgzMmE4Zjk4MTMiLCJyZCI6Im55Y2hlYWx0aGFuZGhvc3BpdGFscy5vcmcifQ==
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211184000osb11lxan6nl7-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211184000osb11lxan6nl7-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Weill Cornell Visiting International Medical Students Program

- id: `cmo34f3ii000b1nxxbgalsak9`
- USCEHub URL: http://localhost:3000/listing/cmo34f3ii000b1nxxbgalsak9
- source URL: https://international.weill.cornell.edu/visiting-international-students
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://international.weill.cornell.edu/visiting-international-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3ii000b1nxxbgalsak9-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3ii000b1nxxbgalsak9-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Montefiore / Albert Einstein

- id: `cmn2111090008sb1118f8yxgv`
- USCEHub URL: http://localhost:3000/listing/cmn2111090008sb1118f8yxgv
- source URL: https://montefioreeinstein.org/education/gme
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://montefioreeinstein.org/education/gme
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111090008sb1118f8yxgv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111090008sb1118f8yxgv-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### MSK Medical Student Summer Research Fellowship

- id: `cmo34f42o00111nxxn1hjvuqv`
- USCEHub URL: http://localhost:3000/listing/cmo34f42o00111nxxn1hjvuqv
- source URL: https://www.mskcc.org/hcp-education-training/medical-students/summer-fellowship
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:summer fellowship)
- source HTTP status: 200
- source final URL: https://www.mskcc.org/hcp-education-training/medical-students/summer-fellowship
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f42o00111nxxn1hjvuqv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f42o00111nxxn1hjvuqv-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Elmhurst Hospital Center

- id: `cmn21118u000qsb11lbgouwbn`
- USCEHub URL: http://localhost:3000/listing/cmn21118u000qsb11lbgouwbn
- source URL: https://www.nychealthandhospitals.org/elmhurst/graduate-medical-education/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=733b7836-714d-4da6-99b0-8cb75afd0234&ssb=16781288722&ssc=https%3A%2F%2Fwww.nychealthandhospitals.org%2Felmhurst%2Fgraduate-medical-education%2F&ssi=6e06bc4b-c6hb-44eb-a4dd-64b32942799f&ssk=botmanager_support@radware.com&ssm=39894988291595878167520232395173&ssn=cef8eb3121fecd9e56854a7126cfe31307b2ccb1a0ce-3a16-4e73-a0809b&sso=ba3fce47-361d578313b64a370af2522e70edd584ffb775cb17b11a0d&ssp=86966172051777621186177765454237276&ssq=71770909171409802319591546955406759019894&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJfX3V6bWYiOiI3ZjkwMDBjY2IxYTBjZS0zYTE2LTRlNzMtYWU0Ny0zNjFkNTc4MzEzYjYxLTE3Nzc2OTE1NDYyMDQxNjgwMjEtMDAzZDM0ZTk5ZGU5Y2FhNjQ3ZDE2IiwidXpteCI6IjdmOTAwMGIyNGNhNDYyLWZhZjgtNDI3MC1iMjlmLTQ4OTJlMDRhYzIxYTEtMTc3NzY5MTU0NjIwNDE2ODAyMS1lMzFjMTQ5ODJhNmE4Y2UwMTYiLCJyZCI6Im55Y2hlYWx0aGFuZGhvc3BpdGFscy5vcmcifQ==
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21118u000qsb11lbgouwbn-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21118u000qsb11lbgouwbn-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Mount Sinai Beth Israel

- id: `cmn21115b000gsb11b9n7mmxx`
- USCEHub URL: http://localhost:3000/listing/cmn21115b000gsb11b9n7mmxx
- source URL: https://www.mountsinai.org/locations/beth-israel/education/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.mountsinai.org/locations/msbi
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21115b000gsb11b9n7mmxx-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21115b000gsb11b9n7mmxx-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### NYU Langone Health

- id: `cmn21110z000asb11hg2qwrua`
- USCEHub URL: http://localhost:3000/listing/cmn21110z000asb11hg2qwrua
- source URL: https://med.nyu.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21110z000asb11hg2qwrua-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21110z000asb11hg2qwrua-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### NewYork-Presbyterian / Weill Cornell

- id: `cmn21114k000esb11q4zw3i16`
- USCEHub URL: http://localhost:3000/listing/cmn21114k000esb11q4zw3i16
- source URL: https://www.nyp.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.nyp.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21114k000esb11q4zw3i16-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21114k000esb11q4zw3i16-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Metro Health — Case Western Reserve

- id: `cmn21157p009ysb11lhl9d9fe`
- USCEHub URL: http://localhost:3000/listing/cmn21157p009ysb11lhl9d9fe
- source URL: https://www.metrohealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.metrohealth.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21157p009ysb11lhl9d9fe-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21157p009ysb11lhl9d9fe-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Texas Medical Branch (UTMB)

- id: `cmn2115cs00acsb11onyobib8`
- USCEHub URL: http://localhost:3000/listing/cmn2115cs00acsb11onyobib8
- source URL: https://www.utmb.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.utmb.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115cs00acsb11onyobib8-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115cs00acsb11onyobib8-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Carolinas Medical Center — Atrium Health

- id: `cmn2115fs00aksb110p1hkkvn`
- USCEHub URL: http://localhost:3000/listing/cmn2115fs00aksb110p1hkkvn
- source URL: https://atriumhealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://atriumhealth.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115fs00aksb110p1hkkvn-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115fs00aksb110p1hkkvn-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Montefiore Einstein Anesthesiology — Observerships & Visiting Clerkship

- id: `cmo3384zl000l1ny9lhsjj0ib`
- USCEHub URL: http://localhost:3000/listing/cmo3384zl000l1ny9lhsjj0ib
- source URL: https://montefioreeinstein.org/patient-care/services/anesthesiology/education/observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://montefioreeinstein.org/patient-care/services/anesthesiology/education/observerships-for-medical-students-external-residents
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384zl000l1ny9lhsjj0ib-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384zl000l1ny9lhsjj0ib-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Newark Beth Israel Medical Center

- id: `cmn21151v009osb11livoez3d`
- USCEHub URL: http://localhost:3000/listing/cmn21151v009osb11livoez3d
- source URL: https://www.rwjbh.org/newark-beth-israel-medical-center/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.rwjbh.org/newark-beth-israel-medical-center/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21151v009osb11livoez3d-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21151v009osb11livoez3d-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### St. John's Episcopal Hospital

- id: `cmn2114z5009gsb11laxdyyfc`
- USCEHub URL: http://localhost:3000/listing/cmn2114z5009gsb11laxdyyfc
- source URL: https://www.ehs.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://ehs.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114z5009gsb11laxdyyfc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114z5009gsb11laxdyyfc-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UT Southwestern Medical Center

- id: `cmn2115bd00a8sb115h6bhehv`
- USCEHub URL: http://localhost:3000/listing/cmn2115bd00a8sb115h6bhehv
- source URL: https://www.utsouthwestern.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.utsouthwestern.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115bd00a8sb115h6bhehv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115bd00a8sb115h6bhehv-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Indiana University Health

- id: `cmn21136u0056sb11aydkbtjz`
- USCEHub URL: http://localhost:3000/listing/cmn21136u0056sb11aydkbtjz
- source URL: https://medicine.iu.edu/gme
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.iu.edu/gme
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21136u0056sb11aydkbtjz-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21136u0056sb11aydkbtjz-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Ochsner Health System

- id: `cmn2115f200aisb110lqohi4y`
- USCEHub URL: http://localhost:3000/listing/cmn2115f200aisb110lqohi4y
- source URL: https://www.ochsner.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.ochsner.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115f200aisb110lqohi4y-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115f200aisb110lqohi4y-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Baptist Health South Florida

- id: `cmn2115dj00aesb115q0wh0yc`
- USCEHub URL: http://localhost:3000/listing/cmn2115dj00aesb115q0wh0yc
- source URL: https://baptisthealth.net/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://baptisthealth.net/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115dj00aesb115q0wh0yc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115dj00aesb115q0wh0yc-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Richmond University Medical Center

- id: `cmn21150f009ksb11e35rot4t`
- USCEHub URL: http://localhost:3000/listing/cmn21150f009ksb11e35rot4t
- source URL: https://www.rumcsi.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://rumcsi.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21150f009ksb11e35rot4t-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21150f009ksb11e35rot4t-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Wyckoff Heights Medical Center

- id: `cmn2114zu009isb116spgam3g`
- USCEHub URL: http://localhost:3000/listing/cmn2114zu009isb116spgam3g
- source URL: https://www.wyckoffhospital.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://whmcny.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114zu009isb116spgam3g-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114zu009isb116spgam3g-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Jamaica Hospital Medical Center

- id: `cmn2114x0009asb11vqhrdugf`
- USCEHub URL: http://localhost:3000/listing/cmn2114x0009asb11vqhrdugf
- source URL: https://www.jamaicahospital.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://jamaicahospital.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114x0009asb11vqhrdugf-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114x0009asb11vqhrdugf-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UNC Chapel Hill Visiting Student Program

- id: `cmo34f4bp001d1nxxvqahi0gb`
- USCEHub URL: http://localhost:3000/listing/cmo34f4bp001d1nxxvqahi0gb
- source URL: https://www.med.unc.edu/ome/studentaffairs/visiting-student-program/program-requirements/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.med.unc.edu/md/student-affairs/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4bp001d1nxxvqahi0gb-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4bp001d1nxxvqahi0gb-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Jersey City Medical Center

- id: `cmn211516009msb111n1uwpre`
- USCEHub URL: http://localhost:3000/listing/cmn211516009msb111n1uwpre
- source URL: https://www.rwjbh.org/jersey-city-medical-center/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.rwjbh.org/jersey-city-medical-center/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211516009msb111n1uwpre-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211516009msb111n1uwpre-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Abington Hospital — Jefferson Health

- id: `cmn21153a009ssb11aleu4i2b`
- USCEHub URL: http://localhost:3000/listing/cmn21153a009ssb11aleu4i2b
- source URL: https://www.jeffersonhealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.jeffersonhealth.org/home
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21153a009ssb11aleu4i2b-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21153a009ssb11aleu4i2b-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Henry Ford Health Visiting Medical Student Electives

- id: `cmo34f3zf000x1nxxc704757w`
- USCEHub URL: http://localhost:3000/listing/cmo34f3zf000x1nxxc704757w
- source URL: https://www.henryford.com/hcp/med-ed/ugme/students/visiting-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 403
- source final URL: https://www.henryford.com/hcp/med-ed/ugme/students/visiting-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3zf000x1nxxc704757w-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3zf000x1nxxc704757w-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Texas Tech HSC Internal Medicine IMG Observership

- id: `cmo3386pc002v1ny92dflv0b9`
- USCEHub URL: http://localhost:3000/listing/cmo3386pc002v1ny92dflv0b9
- source URL: https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386pc002v1ny92dflv0b9-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386pc002v1ny92dflv0b9-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Kentucky Neurology Observership

- id: `cmo3385yw001v1ny9ibvbnki5`
- USCEHub URL: http://localhost:3000/listing/cmo3385yw001v1ny9ibvbnki5
- source URL: https://medicine.uky.edu/departments/neurology/observerships-and-shadowing
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://medicine.uky.edu/departments/neurology/observerships-and-shadowing
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385yw001v1ny9ibvbnki5-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385yw001v1ny9ibvbnki5-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### CHOP International Observership Program

- id: `cmo3386ez002h1ny9yiriql6d`
- USCEHub URL: http://localhost:3000/listing/cmo3386ez002h1ny9yiriql6d
- source URL: https://www.chop.edu/services/international-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.chop.edu/services/international-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386ez002h1ny9yiriql6d-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386ez002h1ny9yiriql6d-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Cedars-Sinai Pre-Med Volunteer Shadowing Program

- id: `cmo34f4uc00211nxxekoi2e8e`
- USCEHub URL: http://localhost:3000/listing/cmo34f4uc00211nxxekoi2e8e
- source URL: https://www.cedars-sinai.org/volunteer-services/pre-med.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:volunteer)
- source HTTP status: 200
- source final URL: https://www.cedars-sinai.org/volunteer-services/pre-med.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4uc00211nxxekoi2e8e-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4uc00211nxxekoi2e8e-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### OU Health College of Medicine Visiting Student Program

- id: `cmo34f4sq001z1nxxbwazydug`
- USCEHub URL: http://localhost:3000/listing/cmo34f4sq001z1nxxbwazydug
- source URL: https://medicine.ouhsc.edu/current-learners/md-program-okc/vslo-and-visiting-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://medicine.ouhsc.edu/current-learners/md-program-okc/vslo-and-visiting-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4sq001z1nxxbwazydug-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4sq001z1nxxbwazydug-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UTHSC Memphis Visiting Medicine Students Program

- id: `cmo34f4pf001v1nxx6b1x1i60`
- USCEHub URL: http://localhost:3000/listing/cmo34f4pf001v1nxx6b1x1i60
- source URL: https://www.uthsc.edu/medicine/visiting-students.php
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://www.uthsc.edu/medicine/visiting-students.php
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4pf001v1nxx6b1x1i60-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4pf001v1nxx6b1x1i60-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### U Utah Spencer Fox Eccles Visiting Student Program

- id: `cmo34f4nt001t1nxxd5adsmg1`
- USCEHub URL: http://localhost:3000/listing/cmo34f4nt001t1nxxd5adsmg1
- source URL: https://medicine.utah.edu/students/visiting
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.utah.edu/students/visiting
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4nt001t1nxxd5adsmg1-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4nt001t1nxxd5adsmg1-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UC San Diego Visiting Senior Medical Student Program

- id: `cmo34f4m9001r1nxxaili4bwg`
- USCEHub URL: http://localhost:3000/listing/cmo34f4m9001r1nxxaili4bwg
- source URL: https://medschool.ucsd.edu/education/md-combined/curriculum/visiting-4th-year-students/index.html
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medschool.ucsd.edu/education/md-combined/curriculum/visiting-4th-year-students/index.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4m9001r1nxxaili4bwg-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4m9001r1nxxaili4bwg-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UNM School of Medicine Visiting Student Program

- id: `cmo34f4kr001p1nxxwzkgvggk`
- USCEHub URL: http://localhost:3000/listing/cmo34f4kr001p1nxxwzkgvggk
- source URL: https://hsc.unm.edu/medicine/education/md/student-affairs/visiting-medical-students/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting medical student)
- source HTTP status: 200
- source final URL: https://hsc.unm.edu/medicine/education/md/student-affairs/visiting-medical-students/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4kr001p1nxxwzkgvggk-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4kr001p1nxxwzkgvggk-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### OHSU Visiting Student Rotations

- id: `cmo34f4hx001l1nxx2oizozk4`
- USCEHub URL: http://localhost:3000/listing/cmo34f4hx001l1nxx2oizozk4
- source URL: https://www.ohsu.edu/school-of-medicine/md-program/visiting-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://www.ohsu.edu/school-of-medicine/md-program/visiting-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4hx001l1nxx2oizozk4-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4hx001l1nxx2oizozk4-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### CU Anschutz Extern Visiting Student Program

- id: `cmo34f4gh001j1nxx3hlp2elt`
- USCEHub URL: http://localhost:3000/listing/cmo34f4gh001j1nxx3hlp2elt
- source URL: https://medschool.cuanschutz.edu/education/current-students/support-for-students/extern-visiting-student
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student)
- source HTTP status: 200
- source final URL: https://medschool.cuanschutz.edu/education/current-students/support-for-students/extern-visiting-student
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4gh001j1nxx3hlp2elt-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4gh001j1nxx3hlp2elt-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Wake Forest Visiting Medical Student Program

- id: `cmo34f4a9001b1nxx7z6m9qck`
- USCEHub URL: http://localhost:3000/listing/cmo34f4a9001b1nxx7z6m9qck
- source URL: https://school.wakehealth.edu/education-and-training/md-program/visiting-medical-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting medical student)
- source HTTP status: 200
- source final URL: https://school.wakehealth.edu/education-and-training/md-program/visiting-medical-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f4a9001b1nxx7z6m9qck-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f4a9001b1nxx7z6m9qck-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Stanford Visiting Clerkship Program

- id: `cmo34f48p00191nxxa638xyp8`
- USCEHub URL: http://localhost:3000/listing/cmo34f48p00191nxxa638xyp8
- source URL: https://med.stanford.edu/visiting-clerkships/visitingclerkships.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:clerkship)
- source HTTP status: 200
- source final URL: https://med.stanford.edu/visiting-clerkships/visitingclerkships.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f48p00191nxxa638xyp8-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f48p00191nxxa638xyp8-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UAB Heersink Visiting Student VSLO Program

- id: `cmo34f47700171nxxp8wwl771`
- USCEHub URL: http://localhost:3000/listing/cmo34f47700171nxxp8wwl771
- source URL: https://www.uab.edu/medicine/home/current-students/scheduling/away-electives
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:elective)
- source HTTP status: 200
- source final URL: https://www.uab.edu/medicine/home/current-students/scheduling/away-electives
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f47700171nxxp8wwl771-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f47700171nxxp8wwl771-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Duke Visiting Student Electives

- id: `cmo34f45p00151nxxoycjv68y`
- USCEHub URL: http://localhost:3000/listing/cmo34f45p00151nxxoycjv68y
- source URL: https://medschool.duke.edu/education/health-professions-education-programs/student-services/office-registrar/visiting-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://medschool.duke.edu/education/health-professions-education-programs/student-services/office-registrar/visiting-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f45p00151nxxoycjv68y-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f45p00151nxxoycjv68y-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Vanderbilt Visiting Medical Student Program

- id: `cmo34f44700131nxxskn5dalj`
- USCEHub URL: http://localhost:3000/listing/cmo34f44700131nxxskn5dalj
- source URL: https://medschool.vanderbilt.edu/md-admissions/visiting-students/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://medschool.vanderbilt.edu/md/visiting-students/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f44700131nxxskn5dalj-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f44700131nxxskn5dalj-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### NIH Medical Student Summer Opportunities to Advance Research (M-SOAR)

- id: `cmo34f411000z1nxxrwp250gf`
- USCEHub URL: http://localhost:3000/listing/cmo34f411000z1nxxrwp250gf
- source URL: https://www.training.nih.gov/research-training/grads/summer-internship-program-sip/m-soar/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 403
- source final URL: https://www.training.nih.gov/research-training/grads/summer-internship-program-sip/m-soar/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f411000z1nxxrwp250gf-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f411000z1nxxrwp250gf-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University of Iowa Carver College of Medicine Visiting Students

- id: `cmo34f3xw000v1nxxpufo9qjo`
- USCEHub URL: http://localhost:3000/listing/cmo34f3xw000v1nxxpufo9qjo
- source URL: https://md.medicine.uiowa.edu/student-and-program-resources/visiting-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://md.medicine.uiowa.edu/student-and-program-resources/visiting-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3xw000v1nxxpufo9qjo-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3xw000v1nxxpufo9qjo-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Washington University St. Louis Visiting Medical Student Electives

- id: `cmo34f3ut000r1nxxih2be7f5`
- USCEHub URL: http://localhost:3000/listing/cmo34f3ut000r1nxxih2be7f5
- source URL: https://md.wustl.edu/academics/visiting-students/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://md.wustl.edu/curriculum/visiting-students/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3ut000r1nxxih2be7f5-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3ut000r1nxxih2be7f5-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Northwestern Feinberg Visiting Students Program

- id: `cmo34f3rq000n1nxxjk4wylyd`
- USCEHub URL: http://localhost:3000/listing/cmo34f3rq000n1nxxjk4wylyd
- source URL: https://www.feinberg.northwestern.edu/md-education/visiting-students/index.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://www.feinberg.northwestern.edu/md-education/visiting-students/index.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3rq000n1nxxjk4wylyd-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3rq000n1nxxjk4wylyd-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Pittsburgh Visiting Medical Student Program

- id: `cmo34f3q3000l1nxxv4eup51y`
- USCEHub URL: http://localhost:3000/listing/cmo34f3q3000l1nxxv4eup51y
- source URL: https://www.medstudentaffairs.pitt.edu/visiting-students
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://www.medstudentaffairs.pitt.edu/visiting-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3q3000l1nxxv4eup51y-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3q3000l1nxxv4eup51y-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Michigan Visiting Medical Student Program

- id: `cmo34f3og000j1nxxkiw66iml`
- USCEHub URL: http://localhost:3000/listing/cmo34f3og000j1nxxkiw66iml
- source URL: https://medschool.umich.edu/programs-admissions/visiting-md-students
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 403
- source final URL: https://medschool.umich.edu/programs-admissions/visiting-md-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3og000j1nxxkiw66iml-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3og000j1nxxkiw66iml-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Mayo Clinic Visiting Medical Student Clerkship

- id: `cmo34f3mz000h1nxxas85c5rw`
- USCEHub URL: http://localhost:3000/listing/cmo34f3mz000h1nxxas85c5rw
- source URL: https://college.mayo.edu/academics/visiting-medical-student-clerkships/application-process/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting medical student,clerkship)
- source HTTP status: 200
- source final URL: https://college.mayo.edu/academics/visiting-medical-student-clerkships/application-process/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3mz000h1nxxas85c5rw-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3mz000h1nxxas85c5rw-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Harvard Visiting Clerkship Scholars Program (VCSP)

- id: `cmo34f3gw00091nxxsafrpxab`
- USCEHub URL: http://localhost:3000/listing/cmo34f3gw00091nxxsafrpxab
- source URL: https://occe.hms.harvard.edu/paths-opportunity/visiting-clerkship-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:clerkship)
- source HTTP status: 403
- source final URL: https://occe.hms.harvard.edu/paths-opportunity/visiting-clerkship-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3gw00091nxxsafrpxab-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3gw00091nxxsafrpxab-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Mass General Brigham Emergency Medicine Clerkship (HMS)

- id: `cmo34f3fe00071nxxtgp8zt29`
- USCEHub URL: http://localhost:3000/listing/cmo34f3fe00071nxxtgp8zt29
- source URL: https://haemr.org/visiting-students/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://haemr.org/visiting-students/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3fe00071nxxtgp8zt29-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3fe00071nxxtgp8zt29-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Harvard Medical School Visiting Students Program

- id: `cmo34f3du00051nxx50q3y8h6`
- USCEHub URL: http://localhost:3000/listing/cmo34f3du00051nxx50q3y8h6
- source URL: https://hms.harvard.edu/departments/office-registrar/visiting-students-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://hms.harvard.edu/departments/office-registrar/visiting-students-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3du00051nxx50q3y8h6-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3du00051nxx50q3y8h6-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Yale Visiting International Student Elective Program

- id: `cmo34f3c800031nxxnx78ooru`
- USCEHub URL: http://localhost:3000/listing/cmo34f3c800031nxxnx78ooru
- source URL: https://medicine.yale.edu/md-program/visiting-students/international/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://medicine.yale.edu/md-program/visiting-students/international/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f3c800031nxxnx78ooru-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f3c800031nxxnx78ooru-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Johns Hopkins Visiting Medical Student Clerkship

- id: `cmo34f39e00011nxx957icy6t`
- USCEHub URL: http://localhost:3000/listing/cmo34f39e00011nxx957icy6t
- source URL: https://www.hopkinsmedicine.org/som/offices/registrars/visiting-md
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 403
- source final URL: https://www.hopkinsmedicine.org/som/offices/registrars/visiting-md
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo34f39e00011nxx957icy6t-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo34f39e00011nxx957icy6t-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UW DLMP Global Observership (Pathology)

- id: `cmo3386xy00371ny93hmww5rk`
- USCEHub URL: http://localhost:3000/listing/cmo3386xy00371ny93hmww5rk
- source URL: https://dlmp.uw.edu/education/global-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://dlmp.uw.edu/education/global-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386xy00371ny93hmww5rk-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386xy00371ny93hmww5rk-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Panamerican Trauma / VCU International Observership

- id: `cmo3386wi00351ny94kwf2o4t`
- USCEHub URL: http://localhost:3000/listing/cmo3386wi00351ny94kwf2o4t
- source URL: https://www.panamtrauma.org/International-Observership-Program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.panamtrauma.org/International-Observership-Program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386wi00351ny94kwf2o4t-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386wi00351ny94kwf2o4t-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### MD Anderson Cancer Center Observer Program

- id: `cmo3386qs002x1ny9aa6w1ub0`
- USCEHub URL: http://localhost:3000/listing/cmo3386qs002x1ny9aa6w1ub0
- source URL: https://www.mdanderson.org/education-training/outreach-programs/observer-programs.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://www.mdanderson.org/education-training/outreach-programs/observer-programs.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386qs002x1ny9aa6w1ub0-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386qs002x1ny9aa6w1ub0-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Trinity Health Nazareth Clinical Observership Program

- id: `cmo3386nu002t1ny9gfh312th`
- USCEHub URL: http://localhost:3000/listing/cmo3386nu002t1ny9gfh312th
- source URL: https://www.trinityhealthma.org/healthcare-professionals/gme/nazareth/clinical-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.trinityhealthma.org/healthcare-professionals/gme/nazareth/clinical-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386nu002t1ny9gfh312th-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386nu002t1ny9gfh312th-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Trinity Health St. Mary Clinical Observership Program

- id: `cmo3386mb002r1ny9nugcfgsb`
- USCEHub URL: http://localhost:3000/listing/cmo3386mb002r1ny9nugcfgsb
- source URL: https://www.trinityhealthma.org/healthcare-professionals/gme/st-mary/clinical-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.trinityhealthma.org/healthcare-professionals/gme/st-mary/clinical-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386mb002r1ny9nugcfgsb-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386mb002r1ny9nugcfgsb-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Thomas Jefferson University Clinical Observerships

- id: `cmo3386kw002p1ny9qwtup7hf`
- USCEHub URL: http://localhost:3000/listing/cmo3386kw002p1ny9qwtup7hf
- source URL: https://www.jefferson.edu/international-services/visa-categories/short-term-visitors/clinical-observerships.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.jefferson.edu/international-services/visa-categories/short-term-visitors/clinical-observerships.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386kw002p1ny9qwtup7hf-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386kw002p1ny9qwtup7hf-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Penn Radiology Visiting Observers Program

- id: `cmo3386hw002l1ny9kse61pal`
- USCEHub URL: http://localhost:3000/listing/cmo3386hw002l1ny9kse61pal
- source URL: https://www3.pennmedicine.org/departments-and-centers/department-of-radiology/education-and-training/visiting-observers-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://www3.pennmedicine.org/departments-and-centers/department-of-radiology/education-and-training/visiting-observers-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386hw002l1ny9kse61pal-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386hw002l1ny9kse61pal-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Penn ENT International Visiting Physician Program

- id: `cmo3386gf002j1ny9aryqa9ie`
- USCEHub URL: http://localhost:3000/listing/cmo3386gf002j1ny9aryqa9ie
- source URL: https://oto.med.upenn.edu/education/international-visiting-physician-program/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://oto.med.upenn.edu/international-visiting-physician-program/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386gf002j1ny9aryqa9ie-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386gf002j1ny9aryqa9ie-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Ohio State Wexner International Visiting Scholars Program

- id: `cmo3386di002f1ny99zepgb4w`
- USCEHub URL: http://localhost:3000/listing/cmo3386di002f1ny99zepgb4w
- source URL: https://medicine.osu.edu/departments/office-of-global-health/international-visiting-scholars
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.osu.edu/departments/office-of-global-health/international-visiting-scholars
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386di002f1ny99zepgb4w-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386di002f1ny99zepgb4w-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Saint Louis University Otolaryngology Observership

- id: `cmo3386ak002b1ny9wd106l2u`
- USCEHub URL: http://localhost:3000/listing/cmo3386ak002b1ny9wd106l2u
- source URL: https://www.slu.edu/medicine/otolaryngology/residency/observership-program.php
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.slu.edu/medicine/otolaryngology/residency/observership-program.php
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3386ak002b1ny9wd106l2u-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3386ak002b1ny9wd106l2u-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### WashU International Physician Observer — Head & Neck Surgery

- id: `cmo33869400291ny9mllmvndb`
- USCEHub URL: http://localhost:3000/listing/cmo33869400291ny9mllmvndb
- source URL: https://oto.wustl.edu/patient-care/head-and-neck-cancer/international-physician-observer-program-head-neck/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://oto.wustl.edu/patient-care/head-and-neck-cancer/international-physician-observer-program-head-neck/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33869400291ny9mllmvndb-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33869400291ny9mllmvndb-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### BIDMC Interventional Radiology Visiting Observership

- id: `cmo33866700251ny9khuwiv34`
- USCEHub URL: http://localhost:3000/listing/cmo33866700251ny9khuwiv34
- source URL: https://bidmc.org/education-training/continuing-education/interventional-radiology-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://bidmc.org/education-training/continuing-education/interventional-radiology-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33866700251ny9khuwiv34-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33866700251ny9khuwiv34-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Brigham & Women's Global Emergency Medicine & Critical Care Training

- id: `cmo33864p00231ny906n8z8bp`
- USCEHub URL: http://localhost:3000/listing/cmo33864p00231ny906n8z8bp
- source URL: https://www.brighamandwomens.org/emergency-medicine/critical-care/global-training-program
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.brighamandwomens.org/emergency-medicine/critical-care/global-training-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33864p00231ny906n8z8bp-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33864p00231ny906n8z8bp-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Ochsner Health International Observership Program

- id: `cmo33863c00211ny929gdhki0`
- USCEHub URL: http://localhost:3000/listing/cmo33863c00211ny929gdhki0
- source URL: https://education.ochsner.org/clined/global-is-local/ochsner-international-observership-program/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://education.ochsner.org/clined/global-is-local/ochsner-international-observership-program/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33863c00211ny929gdhki0-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33863c00211ny929gdhki0-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Kentucky Radiology Observership

- id: `cmo33860d001x1ny9apdtjfk2`
- USCEHub URL: http://localhost:3000/listing/cmo33860d001x1ny9apdtjfk2
- source URL: https://medicine.uky.edu/departments/radiology/observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://medicine.uky.edu/departments/radiology/observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33860d001x1ny9apdtjfk2-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33860d001x1ny9apdtjfk2-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Kansas Medical Center International Observership

- id: `cmo3385xg001t1ny9192er9ah`
- USCEHub URL: http://localhost:3000/listing/cmo3385xg001t1ny9192er9ah
- source URL: https://www.kumc.edu/academic-and-student-affairs/departments/office-of-international-programs/inbound-programs/information-for-irsd-observers-and-visitors/international-observership-program.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.kumc.edu/academic-and-student-affairs/departments/office-of-international-programs/inbound-programs/information-for-irsd-observers-and-visitors/international-observership-program.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385xg001t1ny9192er9ah-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385xg001t1ny9192er9ah-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Indiana University SOM Global Outreach Pathology Observership

- id: `cmo3385vx001r1ny9pr80drpu`
- USCEHub URL: http://localhost:3000/listing/cmo3385vx001r1ny9pr80drpu
- source URL: https://medicine.iu.edu/pathology/education/observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://medicine.iu.edu/pathology/education/observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385vx001r1ny9pr80drpu-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385vx001r1ny9pr80drpu-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### MCG Anesthesiology Clinical Observership (Currently Paused)

- id: `cmo3385uf001p1ny9k908uu2x`
- USCEHub URL: http://localhost:3000/listing/cmo3385uf001p1ny9k908uu2x
- source URL: https://www.augusta.edu/mcg/anes/observership.php
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.augusta.edu/mcg/anes/observership.php
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385uf001p1ny9k908uu2x-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385uf001p1ny9k908uu2x-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Grady Health System Medical Education Observership

- id: `cmo3385sw001n1ny9o3yksehw`
- USCEHub URL: http://localhost:3000/listing/cmo3385sw001n1ny9o3yksehw
- source URL: https://collaboration.acemapp.org/e-content/grady-health-system/content/9783
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://collaboration.acemapp.org/e-content/grady-health-system/content/9783
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385sw001n1ny9o3yksehw-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385sw001n1ny9o3yksehw-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### USF Health Neurosurgery Observer Program

- id: `cmo3385pp001j1ny9hs1j83c9`
- USCEHub URL: http://localhost:3000/listing/cmo3385pp001j1ny9hs1j83c9
- source URL: https://health.usf.edu/medicine/neurosurgery/education/observer-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://health.usf.edu/medicine/neurosurgery/education/observer-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385pp001j1ny9hs1j83c9-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385pp001j1ny9hs1j83c9-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Orlando Health Medical Staff Services Observership

- id: `cmo3385mo001f1ny9t1ilrqd7`
- USCEHub URL: http://localhost:3000/listing/cmo3385mo001f1ny9t1ilrqd7
- source URL: https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: page.goto: Download is starting
Call log:
  - navigating to "https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf", waiting until "domcontentlo
- source final URL: (none)
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385mo001f1ny9t1ilrqd7-20260502.png`
- source screenshot: (failed: page.goto: Download is starting
Call log:
  - navigating to "https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf", waiting until "domcontentlo)
- recommended action: Screenshot capture failed: page.goto: Download is starting
Call log:
  - navigating to "https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf", waiting until "domcontentlo.

### Mount Sinai Miami International Postgraduate Observership

- id: `cmo3385l6001d1ny9s790tg8i`
- USCEHub URL: http://localhost:3000/listing/cmo3385l6001d1ny9s790tg8i
- source URL: https://www.msmc.com/education/educational-courses-and-events/international-observership-courses/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.msmc.com/education/educational-courses-and-events/international-observership-courses/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385l6001d1ny9s790tg8i-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385l6001d1ny9s790tg8i-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Baptist Health South Florida Visiting Physician Program

- id: `cmo3385i800191ny9aevwvc26`
- USCEHub URL: http://localhost:3000/listing/cmo3385i800191ny9aevwvc26
- source URL: https://baptisthealth.net/academics/student-and-visitor-programs/job-shadowing-and-externships/visiting-physician-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:externship,shadowing)
- source HTTP status: 200
- source final URL: https://baptisthealth.net/academics/student-and-visitor-programs/job-shadowing-and-externships/visiting-physician-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385i800191ny9aevwvc26-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385i800191ny9aevwvc26-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Harrington Global Observership — University of Miami Miller SOM

- id: `cmo3385fb00151ny937df7vod`
- USCEHub URL: http://localhost:3000/listing/cmo3385fb00151ny937df7vod
- source URL: https://med.miami.edu/centers-and-institutes/international-medicine-institute/education-and-training/global-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.miami.edu/centers-and-institutes/international-medicine-institute/education-and-training/global-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385fb00151ny937df7vod-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385fb00151ny937df7vod-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UHealth Clinical Observership Program — University of Miami

- id: `cmo3385du00131ny92anyfao4`
- USCEHub URL: http://localhost:3000/listing/cmo3385du00131ny92anyfao4
- source URL: https://umiami.vsyslive.com/pages/app/observer
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://umiami.vsyslive.com/pages/app/observer
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385du00131ny92anyfao4-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385du00131ny92anyfao4-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### USF Morsani International Medical Trainee (IMT) Observership

- id: `cmo3385cf00111ny9csmoq699`
- USCEHub URL: http://localhost:3000/listing/cmo3385cf00111ny9csmoq699
- source URL: https://health.usf.edu/medicine/ia/international-training-programs
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://health.usf.edu/medicine/ia/international-training-programs
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385cf00111ny9csmoq699-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385cf00111ny9csmoq699-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Griffin Hospital (Yale-affiliated) Clinical Observership

- id: `cmo3385aw000z1ny9oleinkzo`
- USCEHub URL: http://localhost:3000/listing/cmo3385aw000z1ny9oleinkzo
- source URL: https://meded.griffinhealth.org/clinical-observership/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://meded.griffinhealth.org/clinical-observership/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385aw000z1ny9oleinkzo-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385aw000z1ny9oleinkzo-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UCLA Health International Physician Observership

- id: `cmo33855r000t1ny9mcguc1mn`
- USCEHub URL: http://localhost:3000/listing/cmo33855r000t1ny9mcguc1mn
- source URL: https://www.uclahealth.org/international-services/consulting-education-services/medical-education-training/physicians/physician-observerships
- content verdict: **LIKELY_WRONG_PAGE** (wrong_page_hints:consulting)
- source HTTP status: 200
- source final URL: https://www.uclahealth.org/international-services/consulting-education-services/medical-education-training/physicians/physician-observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33855r000t1ny9mcguc1mn-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33855r000t1ny9mcguc1mn-20260502.png`
- recommended action: Source URL contains wrong-page hint; admin re-link.

### NAMC Internal Medicine Observership

- id: `cmo338546000r1ny9tkkpwjm3`
- USCEHub URL: http://localhost:3000/listing/cmo338546000r1ny9tkkpwjm3
- source URL: https://www.namccares.com/observership-opportunities
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.namccares.com/observership-opportunities
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo338546000r1ny9tkkpwjm3-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo338546000r1ny9tkkpwjm3-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UAB International Visiting Medical Observership

- id: `cmo33852p000p1ny92siexq0s`
- USCEHub URL: http://localhost:3000/listing/cmo33852p000p1ny92siexq0s
- source URL: https://www.uab.edu/medicine/international/international-programs/observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.uab.edu/medicine/international/international-programs/observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo33852p000p1ny92siexq0s-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo33852p000p1ny92siexq0s-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Stony Brook Renaissance School of Medicine Clinical Observer Program

- id: `cmo338514000n1ny9qxfsnf1g`
- USCEHub URL: http://localhost:3000/listing/cmo338514000n1ny9qxfsnf1g
- source URL: https://renaissance.stonybrookmedicine.edu/Clinical-Observer-Program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://renaissance.stonybrookmedicine.edu/Clinical-Observer-Program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo338514000n1ny9qxfsnf1g-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo338514000n1ny9qxfsnf1g-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Columbia Neurology Visiting Physicians and Scientists — Clinical Observership

- id: `cmo3384xv000j1ny9hdyst91b`
- USCEHub URL: http://localhost:3000/listing/cmo3384xv000j1ny9hdyst91b
- source URL: https://www.neurology.columbia.edu/education/additional-educational-programs/visiting-physicians-and-scientists/clinical-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.neurology.columbia.edu/education/additional-educational-programs/observership-program-clinical
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384xv000j1ny9hdyst91b-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384xv000j1ny9hdyst91b-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Columbia Psychiatry Observerships

- id: `cmo3384we000h1ny9zqofrhm4`
- USCEHub URL: http://localhost:3000/listing/cmo3384we000h1ny9zqofrhm4
- source URL: https://www.columbiapsychiatry.org/education-and-training/psychiatry-observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.columbiapsychiatry.org/education-and-training/psychiatry-observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384we000h1ny9zqofrhm4-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384we000h1ny9zqofrhm4-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### NYU Rusk Rehabilitation Physician Observership

- id: `cmo3384tk000d1ny9x7i24jqk`
- USCEHub URL: http://localhost:3000/listing/cmo3384tk000d1ny9x7i24jqk
- source URL: https://med.nyu.edu/departments-institutes/rusk-rehabilitation/education/observership-training-volunteer-opportunities
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/departments-institutes/rusk-rehabilitation/education/observership-training-volunteer-opportunities
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384tk000d1ny9x7i24jqk-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384tk000d1ny9x7i24jqk-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### NYU Langone Observer Program — Plastic Surgery

- id: `cmo3384s1000b1ny964ctodhv`
- USCEHub URL: http://localhost:3000/listing/cmo3384s1000b1ny964ctodhv
- source URL: https://med.nyu.edu/departments-institutes/plastic-surgery/education/observer-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/departments-institutes/plastic-surgery/education/observer-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384s1000b1ny964ctodhv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384s1000b1ny964ctodhv-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### NYU Langone International Observership — Dermatologic Surgery and Cosmetics

- id: `cmo3384ly00031ny9sa5xpokk`
- USCEHub URL: http://localhost:3000/listing/cmo3384ly00031ny9sa5xpokk
- source URL: https://med.nyu.edu/departments-institutes/dermatology/education/international-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/departments-institutes/dermatology/education/international-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384ly00031ny9sa5xpokk-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384ly00031ny9sa5xpokk-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### NYU Langone International Observership — General and Medical Dermatology

- id: `cmo3384is00011ny9qqoitdnl`
- USCEHub URL: http://localhost:3000/listing/cmo3384is00011ny9qqoitdnl
- source URL: https://med.nyu.edu/departments-institutes/dermatology/education/international-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/departments-institutes/dermatology/education/international-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3384is00011ny9qqoitdnl-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3384is00011ny9qqoitdnl-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### MSK MSO — Observership (San Diego)

- id: `cmn2114we0098sb11v3g08rht`
- USCEHub URL: http://localhost:3000/listing/cmn2114we0098sb11v3g08rht
- source URL: https://www.musculoskeletalmso.com/education/observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.musculoskeletalmso.com/education/observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114we0098sb11v3g08rht-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114we0098sb11v3g08rht-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UCSD — Bridge to Residency Program

- id: `cmn2114vr0096sb11tmv3xquq`
- USCEHub URL: http://localhost:3000/listing/cmn2114vr0096sb11tmv3xquq
- source URL: https://hsi.ucsd.edu/education/physicians/bridge-to-residency-program-for-physicians
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://vchs.ucsd.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114vr0096sb11tmv3xquq-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114vr0096sb11tmv3xquq-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UW Pathology — Global Observership (PAID STIPEND)

- id: `cmn2114v20094sb11ucq2qs48`
- USCEHub URL: http://localhost:3000/listing/cmn2114v20094sb11ucq2qs48
- source URL: https://dlmp.uw.edu/education/global-observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://dlmp.uw.edu/education/global-observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114v20094sb11ucq2qs48-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114v20094sb11ucq2qs48-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Georgetown / Ruesch Center — International GI Observership

- id: `cmn2114ue0092sb11ad5zl106`
- USCEHub URL: http://localhost:3000/listing/cmn2114ue0092sb11ad5zl106
- source URL: https://ruesch.georgetown.edu/internationalobservership/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://ruesch.georgetown.edu/internationalobservership/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114ue0092sb11ad5zl106-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114ue0092sb11ad5zl106-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### SAMS — Clinical Observership (Nonprofit)

- id: `cmn2114sb008wsb11jwl3hilh`
- USCEHub URL: http://localhost:3000/listing/cmn2114sb008wsb11jwl3hilh
- source URL: https://society.sams-usa.net/observership-program/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://society.sams-usa.net/observership-program/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114sb008wsb11jwl3hilh-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114sb008wsb11jwl3hilh-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UTHealth Houston — Observer Program

- id: `cmn2114rn008usb11fgymplru`
- USCEHub URL: http://localhost:3000/listing/cmn2114rn008usb11fgymplru
- source URL: https://med.uth.edu/gme/trainee-resources/visiting-trainees/observers/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://med.uth.edu/gme/trainee-resources/visiting-trainees/observers/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114rn008usb11fgymplru-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114rn008usb11fgymplru-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Louisville — Medical Observership Program

- id: `cmn2114oe008ssb110xfqwdfv`
- USCEHub URL: http://localhost:3000/listing/cmn2114oe008ssb110xfqwdfv
- source URL: https://uoflhealth.org/careers/medical-observership-program-mop/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://uoflhealth.org/careers/medical-observership-program-mop/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114oe008ssb110xfqwdfv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114oe008ssb110xfqwdfv-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Texas Tech University HSC — Observership

- id: `cmn2114no008qsb11x1fjuo28`
- USCEHub URL: http://localhost:3000/listing/cmn2114no008qsb11x1fjuo28
- source URL: https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114no008qsb11x1fjuo28-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114no008qsb11x1fjuo28-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Cincinnati Children's Hospital — International Visitor Program

- id: `cmn2114mz008osb114617lwli`
- USCEHub URL: http://localhost:3000/listing/cmn2114mz008osb114617lwli
- source URL: https://www.cincinnatichildrens.org/professional/resources/international-visitor-program
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.cincinnatichildrens.org/professional/resources/international-visitor-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114mz008osb114617lwli-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114mz008osb114617lwli-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### MSU Institute for Global Health — Observership

- id: `cmn2114lg008ksb11hva3gw88`
- USCEHub URL: http://localhost:3000/listing/cmn2114lg008ksb11hva3gw88
- source URL: https://ighealth.msu.edu/education/global-externship-program/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://ghi.msu.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114lg008ksb11hva3gw88-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114lg008ksb11hva3gw88-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Providence Swedish Medical Center — Observer Program

- id: `cmn2114kr008isb1130q3lxp0`
- USCEHub URL: http://localhost:3000/listing/cmn2114kr008isb1130q3lxp0
- source URL: https://gme.providence.org/washington/puget-sound/for-observers/observers-international-invited-guests/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://gme.providence.org/washington/puget-sound/for-observers/observers-international-invited-guests/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114kr008isb1130q3lxp0-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114kr008isb1130q3lxp0-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Ochsner Health — International Observership

- id: `cmn2114k2008gsb11w9oeuiqz`
- USCEHub URL: http://localhost:3000/listing/cmn2114k2008gsb11w9oeuiqz
- source URL: https://education.ochsner.org/clined/global-is-local/ochsner-international-observership-program/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://education.ochsner.org/clined/global-is-local/ochsner-international-observership-program/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114k2008gsb11w9oeuiqz-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114k2008gsb11w9oeuiqz-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Hurley Medical Center (MSU) — Observership

- id: `cmn2114jc008esb11skue0jrq`
- USCEHub URL: http://localhost:3000/listing/cmn2114jc008esb11skue0jrq
- source URL: https://education.hurleymc.com/gme/residencies-and-fellowships/combined-internal-medicine-pediatrics/observerships/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://education.hurleymc.com/gme/residencies-and-fellowships/combined-internal-medicine-pediatrics/observerships/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114jc008esb11skue0jrq-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114jc008esb11skue0jrq-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Mobile Infirmary — Observer Program

- id: `cmn2114ik008csb11xcyn3wpg`
- USCEHub URL: http://localhost:3000/listing/cmn2114ik008csb11xcyn3wpg
- source URL: https://www.infirmaryhealth.org/careers/graduate-education/mobile-infirmary-internal-medicine-residency/visiting-observer-learning-opportunity-program/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://www.infirmaryhealth.org/careers/graduate-education/mobile-infirmary-internal-medicine-residency/visiting-observer-learning-opportunity-program/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114ik008csb11xcyn3wpg-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114ik008csb11xcyn3wpg-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UC San Diego — ACE Program

- id: `cmn2114hw008asb1171avairi`
- USCEHub URL: http://localhost:3000/listing/cmn2114hw008asb1171avairi
- source URL: https://hsi.ucsd.edu/education/physicians/enhanced-clinical-skills
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://vchs.ucsd.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114hw008asb1171avairi-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114hw008asb1171avairi-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Mercy Catholic Medical Center — Observership

- id: `cmn2114h80088sb11srnvkt92`
- USCEHub URL: http://localhost:3000/listing/cmn2114h80088sb11srnvkt92
- source URL: https://www.trinityhealthma.org/healthcare-professionals/gme/mcmc/clinical-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.trinityhealthma.org/healthcare-professionals/gme/mcmc/clinical-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114h80088sb11srnvkt92-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114h80088sb11srnvkt92-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Nazareth Hospital (Trinity Health) — Observership

- id: `cmn2114gi0086sb11cajt72c6`
- USCEHub URL: http://localhost:3000/listing/cmn2114gi0086sb11cajt72c6
- source URL: https://www.trinityhealthma.org/healthcare-professionals/gme/nazareth/clinical-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.trinityhealthma.org/healthcare-professionals/gme/nazareth/clinical-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114gi0086sb11cajt72c6-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114gi0086sb11cajt72c6-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Drexel University — International Observership

- id: `cmn2114fs0084sb11a383lpwp`
- USCEHub URL: http://localhost:3000/listing/cmn2114fs0084sb11a383lpwp
- source URL: https://drexel.edu/medicine/academics/continuing-education/physician-refresher-re-entry-program/for-prospective-students/international-students-observerships/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://drexel.edu/medicine/academics/continuing-education/physician-refresher-re-entry-program/for-prospective-students/international-students-observerships/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114fs0084sb11a383lpwp-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114fs0084sb11a383lpwp-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Allegheny Health Network — Observership

- id: `cmn2114f30082sb1134o4wrsi`
- USCEHub URL: http://localhost:3000/listing/cmn2114f30082sb1134o4wrsi
- source URL: https://www.alleghenyinternational.org/observerships.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.alleghenyinternational.org/observerships.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114f30082sb1134o4wrsi-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114f30082sb1134o4wrsi-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Mount Sinai Medical Center — Miami Beach

- id: `cmn2114eg0080sb11z6bzsocz`
- USCEHub URL: http://localhost:3000/listing/cmn2114eg0080sb11z6bzsocz
- source URL: https://www.msmc.com/education/educational-courses-and-events/international-observership-courses/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.msmc.com/education/educational-courses-and-events/international-observership-courses/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114eg0080sb11z6bzsocz-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114eg0080sb11z6bzsocz-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### USF Health — International Training

- id: `cmn2114dq007ysb119e2itzp9`
- USCEHub URL: http://localhost:3000/listing/cmn2114dq007ysb119e2itzp9
- source URL: https://health.usf.edu/medicine/ia/international-training-programs
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://health.usf.edu/medicine/ia/international-training-programs
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114dq007ysb119e2itzp9-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114dq007ysb119e2itzp9-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UC Davis Health — International Observership

- id: `cmn2114d2007wsb11wb06bo60`
- USCEHub URL: http://localhost:3000/listing/cmn2114d2007wsb11wb06bo60
- source URL: https://health.ucdavis.edu/international-affiliations/observerships/index.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://health.ucdavis.edu/international-affiliations/observerships/index.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114d2007wsb11wb06bo60-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114d2007wsb11wb06bo60-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### St. Mary Medical Center (Trinity Health)

- id: `cmn2114a9007usb11epq7tsc9`
- USCEHub URL: http://localhost:3000/listing/cmn2114a9007usb11epq7tsc9
- source URL: https://www.trinityhealthma.org/healthcare-professionals/gme/st-mary/clinical-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.trinityhealthma.org/healthcare-professionals/gme/st-mary/clinical-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114a9007usb11epq7tsc9-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114a9007usb11epq7tsc9-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Griffin Hospital

- id: `cmn21149k007ssb110xnkk74f`
- USCEHub URL: http://localhost:3000/listing/cmn21149k007ssb110xnkk74f
- source URL: https://meded.griffinhealth.org/clinical-observership/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://meded.griffinhealth.org/clinical-observership/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21149k007ssb110xnkk74f-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21149k007ssb110xnkk74f-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Children's Hospital of Philadelphia (CHOP)

- id: `cmn21148x007qsb1199j7n8yn`
- USCEHub URL: http://localhost:3000/listing/cmn21148x007qsb1199j7n8yn
- source URL: https://www.chop.edu/services/international-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.chop.edu/services/international-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21148x007qsb1199j7n8yn-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21148x007qsb1199j7n8yn-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UAB Hospital — International Medical Observers

- id: `cmn21148c007osb11lakxty40`
- USCEHub URL: http://localhost:3000/listing/cmn21148c007osb11lakxty40
- source URL: https://www.uab.edu/medicine/international/international-programs/observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.uab.edu/medicine/international/international-programs/observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21148c007osb11lakxty40-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21148c007osb11lakxty40-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Kansas Medical Center (KUMC)

- id: `cmn21147m007msb11gq7xaz4y`
- USCEHub URL: http://localhost:3000/listing/cmn21147m007msb11gq7xaz4y
- source URL: https://www.kumc.edu/academic-and-student-affairs/departments/office-of-international-programs/inbound-programs/information-for-irsd-observers-and-visitors/international-observership-program.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.kumc.edu/academic-and-student-affairs/departments/office-of-international-programs/inbound-programs/information-for-irsd-observers-and-visitors/international-observership-program.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21147m007msb11gq7xaz4y-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21147m007msb11gq7xaz4y-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### MD Anderson Cancer Center — Observer Program

- id: `cmn2113of006csb1109gg133k`
- USCEHub URL: http://localhost:3000/listing/cmn2113of006csb1109gg133k
- source URL: https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113of006csb1109gg133k-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113of006csb1109gg133k-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Memorial Sloan Kettering — Observership

- id: `cmn2113nm006asb11p69ala2j`
- USCEHub URL: http://localhost:3000/listing/cmn2113nm006asb11p69ala2j
- source URL: https://www.mskcc.org/hcp-education-training/international/observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.mskcc.org/hcp-education-training/international/observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113nm006asb11p69ala2j-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113nm006asb11p69ala2j-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Colorado Hospital

- id: `cmn21138c005asb11o29sxbw4`
- USCEHub URL: http://localhost:3000/listing/cmn21138c005asb11o29sxbw4
- source URL: https://medschool.cuanschutz.edu/pediatrics/education/international-trainee-observership-program
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://medschool.cuanschutz.edu/pediatrics/education/international-trainee-observership-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21138c005asb11o29sxbw4-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21138c005asb11o29sxbw4-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Thomas Jefferson University Hospital

- id: `cmn2112la003wsb113l7xdzlo`
- USCEHub URL: http://localhost:3000/listing/cmn2112la003wsb113l7xdzlo
- source URL: https://www.jefferson.edu/international-services/visa-categories/short-term-visitors/clinical-observerships.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.jefferson.edu/international-services/visa-categories/short-term-visitors/clinical-observerships.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112la003wsb113l7xdzlo-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112la003wsb113l7xdzlo-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Florida Health / Shands Hospital

- id: `cmn2112ix003qsb1178t0rg6k`
- USCEHub URL: http://localhost:3000/listing/cmn2112ix003qsb1178t0rg6k
- source URL: https://hr.med.ufl.edu/volunteers/onserving-shadowing-application-process/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:volunteer,shadowing)
- source HTTP status: 200
- source final URL: https://hr.med.ufl.edu/volunteers/onserving-shadowing-application-process/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112ix003qsb1178t0rg6k-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112ix003qsb1178t0rg6k-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Cleveland Clinic Florida

- id: `cmn2112hf003msb111pyw2jaa`
- USCEHub URL: http://localhost:3000/listing/cmn2112hf003msb111pyw2jaa
- source URL: https://my.clevelandclinic.org/florida/medical-professionals/education/observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://my.clevelandclinic.org/florida/medical-professionals/education/observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112hf003msb111pyw2jaa-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112hf003msb111pyw2jaa-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### MD Anderson Cancer Center

- id: `cmn2112ei003esb1173ooktb0`
- USCEHub URL: http://localhost:3000/listing/cmn2112ei003esb1173ooktb0
- source URL: https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.mdanderson.org/education-training/outreach-programs/observer-programs/other-observership-opportunities-at-md-anderson.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112ei003esb1173ooktb0-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112ei003esb1173ooktb0-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Houston Methodist Hospital

- id: `cmn2112ca0038sb11j2c6bv0t`
- USCEHub URL: http://localhost:3000/listing/cmn2112ca0038sb11j2c6bv0t
- source URL: https://www.houstonmethodist.org/for-health-professionals/global-health-care-services/global-health-care-education/observerships/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.houstonmethodist.org/for-health-professionals/global-health-care-services/global-health-care-education/observerships/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112ca0038sb11j2c6bv0t-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112ca0038sb11j2c6bv0t-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Johns Hopkins Hospital

- id: `cmn21125u002wsb11oliaiwmt`
- USCEHub URL: http://localhost:3000/listing/cmn21125u002wsb11oliaiwmt
- source URL: https://www.hopkinsmedicine.org/volunteer-services/observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 403
- source final URL: https://www.hopkinsmedicine.org/volunteer-services/observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21125u002wsb11oliaiwmt-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21125u002wsb11oliaiwmt-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Cleveland Clinic

- id: `cmn21122v002osb11pdpyrjab`
- USCEHub URL: http://localhost:3000/listing/cmn21122v002osb11pdpyrjab
- source URL: https://my.clevelandclinic.org/departments/international-medical-education/international-programs/physician-observer
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://my.clevelandclinic.org/departments/international-medical-education/international-programs/physician-observer
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21122v002osb11pdpyrjab-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21122v002osb11pdpyrjab-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Illinois at Chicago (UIC)

- id: `cmn21120p002isb11jqbf2z81`
- USCEHub URL: http://localhost:3000/listing/cmn21120p002isb11jqbf2z81
- source URL: https://medicine.uic.edu/education/international-education/observership-program/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://medicine.uic.edu/education/international-education/observership-program/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21120p002isb11jqbf2z81-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21120p002isb11jqbf2z81-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Chicago Medicine

- id: `cmn2111xq002asb11vcg045uc`
- USCEHub URL: http://localhost:3000/listing/cmn2111xq002asb11vcg045uc
- source URL: https://www.uchicagomedicine.org/international/international-collaboration/education-and-training
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.uchicagomedicine.org/international/international-collaboration/education-and-training
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111xq002asb11vcg045uc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111xq002asb11vcg045uc-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### USC Keck Medical Center

- id: `cmn2111oz001ssb111wz1ddv5`
- USCEHub URL: http://localhost:3000/listing/cmn2111oz001ssb111wz1ddv5
- source URL: https://sites.usc.edu/healthcare-edu/observership/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://sites.usc.edu/healthcare-edu/observership/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111oz001ssb111wz1ddv5-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111oz001ssb111wz1ddv5-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UCLA Medical Center

- id: `cmn2111mt001msb11fzpzozyu`
- USCEHub URL: http://localhost:3000/listing/cmn2111mt001msb11fzpzozyu
- source URL: https://www.uclahealth.org/international-services/medical-education-training/physicians/physician-observerships
- content verdict: **LIKELY_WRONG_PAGE** (wrong_page_hints:consulting)
- source HTTP status: 200
- source final URL: https://www.uclahealth.org/international-services/consulting-education-services/medical-education-training/physicians/physician-observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111mt001msb11fzpzozyu-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111mt001msb11fzpzozyu-20260502.png`
- recommended action: Source URL contains wrong-page hint; admin re-link.

### Stanford Health Care

- id: `cmn2111m1001ksb112erf1286`
- USCEHub URL: http://localhost:3000/listing/cmn2111m1001ksb112erf1286
- source URL: https://med.stanford.edu/shctv/education/observership.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.stanford.edu/shctv/education/observership.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111m1001ksb112erf1286-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111m1001ksb112erf1286-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### BronxCare Health System

- id: `cmn2111fa0018sb11v9x51s6a`
- USCEHub URL: http://localhost:3000/listing/cmn2111fa0018sb11v9x51s6a
- source URL: https://www.bronxcare.org/our-services/psychiatry/residency-program/volunteer-and-observership-opportunities
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.bronxcare.org/our-services/psychiatry/residency-program/volunteer-and-observership-opportunities
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111fa0018sb11v9x51s6a-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111fa0018sb11v9x51s6a-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Jackson Health System Observership Program

- id: `cmo3385gq00171ny9bm6z8i3h`
- USCEHub URL: http://localhost:3000/listing/cmo3385gq00171ny9bm6z8i3h
- source URL: https://jacksonhealth.org/observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 403
- source final URL: https://jacksonhealth.org/observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmo3385gq00171ny9bm6z8i3h-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmo3385gq00171ny9bm6z8i3h-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Mississippi Medical Center

- id: `cmn2115vt00bmsb11oodepaa9`
- USCEHub URL: http://localhost:3000/listing/cmn2115vt00bmsb11oodepaa9
- source URL: https://www.umc.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.umc.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115vt00bmsb11oodepaa9-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115vt00bmsb11oodepaa9-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Arkansas for Medical Sciences (UAMS)

- id: `cmn2115v300bksb11ngyv1xao`
- USCEHub URL: http://localhost:3000/listing/cmn2115v300bksb11ngyv1xao
- source URL: https://www.uams.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.uams.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115v300bksb11ngyv1xao-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115v300bksb11ngyv1xao-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Kansas Medical Center

- id: `cmn2115ud00bisb11k3wltm6f`
- USCEHub URL: http://localhost:3000/listing/cmn2115ud00bisb11k3wltm6f
- source URL: https://www.kumc.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.kumc.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115ud00bisb11k3wltm6f-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115ud00bisb11k3wltm6f-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Medical University of South Carolina (MUSC)

- id: `cmn2115to00bgsb111aw38w0l`
- USCEHub URL: http://localhost:3000/listing/cmn2115to00bgsb111aw38w0l
- source URL: https://web.musc.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.musc.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115to00bgsb111aw38w0l-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115to00bgsb111aw38w0l-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Hennepin Healthcare — Minneapolis

- id: `cmn2115sy00besb11mu9l8ndk`
- USCEHub URL: http://localhost:3000/listing/cmn2115sy00besb11mu9l8ndk
- source URL: https://www.hennepinhealthcare.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://www.hennepinhealthcare.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115sy00besb11mu9l8ndk-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115sy00besb11mu9l8ndk-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Mercy Hospital — St. Louis

- id: `cmn2115s900bcsb11io2z2cl3`
- USCEHub URL: http://localhost:3000/listing/cmn2115s900bcsb11io2z2cl3
- source URL: https://www.mercy.net/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.mercy.net/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115s900bcsb11io2z2cl3-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115s900bcsb11io2z2cl3-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Reading Hospital — Tower Health

- id: `cmn2115rj00basb112a50c40u`
- USCEHub URL: http://localhost:3000/listing/cmn2115rj00basb112a50c40u
- source URL: https://www.towerhealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://towerhealth.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115rj00basb112a50c40u-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115rj00basb112a50c40u-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Conemaugh Memorial Medical Center

- id: `cmn2115q200b6sb115fxbi2gx`
- USCEHub URL: http://localhost:3000/listing/cmn2115q200b6sb115fxbi2gx
- source URL: https://www.conemaugh.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.conemaugh.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115q200b6sb115fxbi2gx-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115q200b6sb115fxbi2gx-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Clinical Experience Programs — Multi-Site

- id: `cmn2115pb00b4sb11t4pwrgjh`
- USCEHub URL: http://localhost:3000/listing/cmn2115pb00b4sb11t4pwrgjh
- source URL: #
- content verdict: **UNKNOWN** (invalid_url)
- source HTTP status: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "#", waiting until "domcontentloaded"

- source final URL: (none)
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115pb00b4sb11t4pwrgjh-20260502.png`
- source screenshot: (failed: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "#", waiting until "domcontentloaded"
)
- recommended action: Screenshot capture failed: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "#", waiting until "domcontentloaded"
.

### Brooklyn USCE — Clinical Rotations

- id: `cmn2115ok00b2sb11uo7vd4v7`
- USCEHub URL: http://localhost:3000/listing/cmn2115ok00b2sb11uo7vd4v7
- source URL: https://brooklynusce.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://brooklynusce.com/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115ok00b2sb11uo7vd4v7-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115ok00b2sb11uo7vd4v7-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Utah Health

- id: `cmn2115nu00b0sb11bnr4d3ru`
- USCEHub URL: http://localhost:3000/listing/cmn2115nu00b0sb11bnr4d3ru
- source URL: https://healthcare.utah.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://healthcare.utah.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115nu00b0sb11bnr4d3ru-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115nu00b0sb11bnr4d3ru-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of New Mexico Hospital

- id: `cmn2115n200aysb11lq9efqq3`
- USCEHub URL: http://localhost:3000/listing/cmn2115n200aysb11lq9efqq3
- source URL: https://hospitals.health.unm.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://hospitals.health.unm.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115n200aysb11lq9efqq3-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115n200aysb11lq9efqq3-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Loma Linda University Medical Center

- id: `cmn2115lj00ausb11hvghc4u6`
- USCEHub URL: http://localhost:3000/listing/cmn2115lj00ausb11hvghc4u6
- source URL: https://lluh.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://lluh.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115lj00ausb11hvghc4u6-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115lj00ausb11hvghc4u6-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Olive View-UCLA Medical Center

- id: `cmn2115ks00assb11r7e4ti9c`
- USCEHub URL: http://localhost:3000/listing/cmn2115ks00assb11r7e4ti9c
- source URL: https://dhs.lacounty.gov/olive-view-ucla/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://dhs.lacounty.gov/olive-view-ucla-celebrates-lgbtq-pride-month/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115ks00assb11r7e4ti9c-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115ks00assb11r7e4ti9c-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Harbor-UCLA Medical Center

- id: `cmn2115hy00aqsb11fcg85u3r`
- USCEHub URL: http://localhost:3000/listing/cmn2115hy00aqsb11fcg85u3r
- source URL: https://dhs.lacounty.gov/harbor-ucla/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://dhs.lacounty.gov/harbor-ucla-breaks-ground-on-new-hospital/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115hy00aqsb11fcg85u3r-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115hy00aqsb11fcg85u3r-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Memorial Healthcare System

- id: `cmn2115eb00agsb119if7wq66`
- USCEHub URL: http://localhost:3000/listing/cmn2115eb00agsb119if7wq66
- source URL: https://www.mhs.net/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.mhs.net/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2115eb00agsb119if7wq66-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2115eb00agsb119if7wq66-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Beaumont Hospital — Royal Oak

- id: `cmn21159u00a4sb11kzzrh8a0`
- USCEHub URL: http://localhost:3000/listing/cmn21159u00a4sb11kzzrh8a0
- source URL: https://www.beaumont.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://www.beaumont.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21159u00a4sb11kzzrh8a0-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21159u00a4sb11kzzrh8a0-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Henry Ford Hospital

- id: `cmn21159400a2sb11la8ong4t`
- USCEHub URL: http://localhost:3000/listing/cmn21159400a2sb11la8ong4t
- source URL: https://www.henryford.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://www.henryford.com/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21159400a2sb11la8ong4t-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21159400a2sb11la8ong4t-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Advocate Christ Medical Center

- id: `cmn21156y009wsb11c201596e`
- USCEHub URL: http://localhost:3000/listing/cmn21156y009wsb11c201596e
- source URL: https://www.advocatehealth.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://www.advocatehealth.com/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21156y009wsb11c201596e-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21156y009wsb11c201596e-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Hackensack University Medical Center

- id: `cmn21152l009qsb11ui0oia7r`
- USCEHub URL: http://localhost:3000/listing/cmn21152l009qsb11ui0oia7r
- source URL: https://www.hackensackmeridianhealth.org/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.hackensackmeridianhealth.org/en
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21152l009qsb11ui0oia7r-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21152l009qsb11ui0oia7r-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Kingsbrook Jewish Medical Center

- id: `cmn2114yf009esb11j10sd1ub`
- USCEHub URL: http://localhost:3000/listing/cmn2114yf009esb11j10sd1ub
- source URL: https://www.ecfmg.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.ecfmg.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114yf009esb11j10sd1ub-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114yf009esb11j10sd1ub-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### MedStar Health — International Observer Program

- id: `cmn2114tp0090sb11hh3inaul`
- USCEHub URL: http://localhost:3000/listing/cmn2114tp0090sb11hh3inaul
- source URL: https://www.medstarhealth.org/education
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.medstarhealth.org/education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114tp0090sb11hh3inaul-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114tp0090sb11hh3inaul-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### CommonSpirit Health International — Clinical Observation

- id: `cmn2114sz008ysb114tl0vvdr`
- USCEHub URL: http://localhost:3000/listing/cmn2114sz008ysb114tl0vvdr
- source URL: https://commonspiritinternational.org/education-programs/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://commonspiritinternational.org/education-programs/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114sz008ysb114tl0vvdr-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2114sz008ysb114tl0vvdr-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Albert Einstein College of Medicine — Research Fellowship

- id: `cmn21146x007ksb11nksfya8i`
- USCEHub URL: http://localhost:3000/listing/cmn21146x007ksb11nksfya8i
- source URL: https://einsteinmed.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://einsteinmed.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21146x007ksb11nksfya8i-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21146x007ksb11nksfya8i-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Northwestern Feinberg — Postdoctoral Research

- id: `cmn211468007isb11z63xyocy`
- USCEHub URL: http://localhost:3000/listing/cmn211468007isb11z63xyocy
- source URL: https://www.feinberg.northwestern.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.feinberg.northwestern.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211468007isb11z63xyocy-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211468007isb11z63xyocy-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Penn Medicine — Postdoctoral Research

- id: `cmn211445007csb111xcgh8v0`
- USCEHub URL: http://localhost:3000/listing/cmn211445007csb111xcgh8v0
- source URL: https://www.med.upenn.edu/postdoc/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:postdoc)
- source HTTP status: 200
- source final URL: https://www.med.upenn.edu/postdoc/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211445007csb111xcgh8v0-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211445007csb111xcgh8v0-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UCSF — Postdoctoral Research

- id: `cmn21143g007asb11c77awbh2`
- USCEHub URL: http://localhost:3000/listing/cmn21143g007asb11c77awbh2
- source URL: https://postdocs.ucsf.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://postdocs.ucsf.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21143g007asb11c77awbh2-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21143g007asb11c77awbh2-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### ValueMD Clinical Rotations

- id: `cmn21142r0078sb11yqmf995v`
- USCEHub URL: http://localhost:3000/listing/cmn21142r0078sb11yqmf995v
- source URL: https://www.valuemd.com/clinical-rotations/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:clinical rotation)
- source HTTP status: 401
- source final URL: https://www.valuemd.com/clinical-rotations/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21142r0078sb11yqmf995v-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21142r0078sb11yqmf995v-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Clinical Experience Programs (CEP) — IMG Rotations

- id: `cmn2114240076sb11zfiteqrx`
- USCEHub URL: http://localhost:3000/listing/cmn2114240076sb11zfiteqrx
- source URL: https://clinicalexperienceprograms.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: page.goto: net::ERR_NAME_NOT_RESOLVED at https://clinicalexperienceprograms.com/
Call log:
  - navigating to "https://clinicalexperienceprograms.com/", waiting until "domcontentloaded"

- source final URL: (none)
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2114240076sb11zfiteqrx-20260502.png`
- source screenshot: (failed: page.goto: net::ERR_NAME_NOT_RESOLVED at https://clinicalexperienceprograms.com/
Call log:
  - navigating to "https://clinicalexperienceprograms.com/", waiting until "domcontentloaded"
)
- recommended action: Screenshot capture failed: page.goto: net::ERR_NAME_NOT_RESOLVED at https://clinicalexperienceprograms.com/
Call log:
  - navigating to "https://clinicalexperienceprograms.com/", waiting until "domcontentloaded"
.

### Global Medical Foundation — USCE Programs

- id: `cmn21141e0074sb11knt886rr`
- USCEHub URL: http://localhost:3000/listing/cmn21141e0074sb11knt886rr
- source URL: (none extracted)
- content verdict: **UNKNOWN** (invalid_url)
- source HTTP status: no_source_url_extracted
- source final URL: (none)
- USCEHub screenshot: (failed: page.goto: Navigation to "http://localhost:3000/listing/cmn21141e0074sb11knt886rr" is interrupted by another navigation to "chrome-error://chromewebdata/"
Call log:
  - navigating to "http://localhost)
- source screenshot: (failed: no_source_url_extracted)
- recommended action: No URL or unparseable source.

### AMG Medical Group — Clinical Rotations

- id: `cmn21140m0072sb11ez341w0z`
- USCEHub URL: http://localhost:3000/listing/cmn21140m0072sb11ez341w0z
- source URL: (none extracted)
- content verdict: **UNKNOWN** (invalid_url)
- source HTTP status: no_source_url_extracted
- source final URL: (none)
- USCEHub screenshot: (failed: page.goto: Navigation to "http://localhost:3000/listing/cmn21140m0072sb11ez341w0z" is interrupted by another navigation to "http://localhost:3000/listing/cmn21141e0074sb11knt886rr"
Call log:
  - navig)
- source screenshot: (failed: no_source_url_extracted)
- recommended action: No URL or unparseable source.

### Duke University — Postdoctoral Research

- id: `cmn2113zw0070sb116oho28en`
- USCEHub URL: http://localhost:3000/listing/cmn2113zw0070sb116oho28en
- source URL: https://postdoc.duke.edu/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:postdoc)
- source HTTP status: 200
- source final URL: https://research.duke.edu/postdoc/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113zw0070sb116oho28en-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113zw0070sb116oho28en-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Michigan — Research Fellowship

- id: `cmn2113z5006ysb11a69rap0h`
- USCEHub URL: http://localhost:3000/listing/cmn2113z5006ysb11a69rap0h
- source URL: https://medicine.umich.edu/medschool/research/postdoctoral
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://medschool.umich.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113z5006ysb11a69rap0h-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113z5006ysb11a69rap0h-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Emory University — Postdoctoral Research

- id: `cmn2113vx006wsb11k7c4vies`
- USCEHub URL: http://localhost:3000/listing/cmn2113vx006wsb11k7c4vies
- source URL: https://www.ecfmg.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.ecfmg.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113vx006wsb11k7c4vies-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113vx006wsb11k7c4vies-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Cedars-Sinai — Research Fellowship

- id: `cmn2113v5006usb11977nd3ud`
- USCEHub URL: http://localhost:3000/listing/cmn2113v5006usb11977nd3ud
- source URL: https://www.cedars-sinai.edu/research/training/postdoctoral.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:postdoctoral,postdoc)
- source HTTP status: 404
- source final URL: https://www.cedars-sinai.edu/research/training/postdoctoral.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113v5006usb11977nd3ud-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113v5006usb11977nd3ud-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Fred Hutchinson Cancer Center

- id: `cmn2113ue006ssb11j9eieieh`
- USCEHub URL: http://localhost:3000/listing/cmn2113ue006ssb11j9eieieh
- source URL: https://www.fredhutch.org/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.fredhutch.org/en.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113ue006ssb11j9eieieh-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113ue006ssb11j9eieieh-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University of Pittsburgh — Postdoctoral Research

- id: `cmn2113to006qsb11m64ge9a7`
- USCEHub URL: http://localhost:3000/listing/cmn2113to006qsb11m64ge9a7
- source URL: https://www.postdoc.pitt.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.postdoc.pitt.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113to006qsb11m64ge9a7-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113to006qsb11m64ge9a7-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Mount Sinai — Postdoctoral Research

- id: `cmn2113sx006osb11loir1mwy`
- USCEHub URL: http://localhost:3000/listing/cmn2113sx006osb11loir1mwy
- source URL: https://icahn.mssm.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://icahn.mssm.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113sx006osb11loir1mwy-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113sx006osb11loir1mwy-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Stanford Medicine — Postdoctoral Research

- id: `cmn2113s6006msb118hgahh1o`
- USCEHub URL: http://localhost:3000/listing/cmn2113s6006msb118hgahh1o
- source URL: https://postdocs.stanford.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://postdocs.stanford.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113s6006msb118hgahh1o-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113s6006msb118hgahh1o-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Johns Hopkins — Postdoctoral Research

- id: `cmn2113rd006ksb11qnyjkqvk`
- USCEHub URL: http://localhost:3000/listing/cmn2113rd006ksb11qnyjkqvk
- source URL: https://www.hopkinsmedicine.org/research/resources/postdoctoral
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:postdoctoral,postdoc)
- source HTTP status: 403
- source final URL: https://www.hopkinsmedicine.org/research/resources/postdoctoral
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113rd006ksb11qnyjkqvk-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113rd006ksb11qnyjkqvk-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Harvard Medical School — Research Fellowship

- id: `cmn2113qn006isb11ed3rrmyv`
- USCEHub URL: http://localhost:3000/listing/cmn2113qn006isb11ed3rrmyv
- source URL: https://postdoc.hms.harvard.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://postdoc.hms.harvard.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113qn006isb11ed3rrmyv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113qn006isb11ed3rrmyv-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Mayo Clinic — Research Fellowship

- id: `cmn2113pw006gsb115grg3340`
- USCEHub URL: http://localhost:3000/listing/cmn2113pw006gsb115grg3340
- source URL: https://college.mayo.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://college.mayo.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113pw006gsb115grg3340-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113pw006gsb115grg3340-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Cleveland Clinic — Research Fellowship

- id: `cmn2113p5006esb11skojaztp`
- USCEHub URL: http://localhost:3000/listing/cmn2113p5006esb11skojaztp
- source URL: https://my.clevelandclinic.org/departments/research-education/postdoctoral-programs
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 404
- source final URL: https://my.clevelandclinic.org/sitecore/service/notfound.aspx?item=%2fdepartments%2fresearch-education%2fpostdoctoral-programs&user=extranet%5cAnonymous&site=website
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113p5006esb11skojaztp-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113p5006esb11skojaztp-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### NIH Clinical Center — Postdoctoral Research

- id: `cmn2113mw0068sb111h3z42an`
- USCEHub URL: http://localhost:3000/listing/cmn2113mw0068sb111h3z42an
- source URL: https://www.training.nih.gov/programs/postdoctoral_irta
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:postdoctoral,postdoc)
- source HTTP status: 403
- source final URL: https://www.training.nih.gov/programs/postdoctoral_irta
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113mw0068sb111h3z42an-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113mw0068sb111h3z42an-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### UAB Hospital (University of Alabama at Birmingham)

- id: `cmn2113m50066sb11sbr4jq4d`
- USCEHub URL: http://localhost:3000/listing/cmn2113m50066sb11sbr4jq4d
- source URL: https://www.uab.edu/medicine/gme/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.uab.edu/medicine/cme/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113m50066sb11sbr4jq4d-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113m50066sb11sbr4jq4d-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University of Utah Health

- id: `cmn2113le0064sb11a5urgvow`
- USCEHub URL: http://localhost:3000/listing/cmn2113le0064sb11a5urgvow
- source URL: https://medicine.utah.edu/gme/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.utah.edu/gme
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113le0064sb11a5urgvow-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113le0064sb11a5urgvow-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University of Nebraska Medical Center

- id: `cmn2113kp0062sb11wyre9lqr`
- USCEHub URL: http://localhost:3000/listing/cmn2113kp0062sb11wyre9lqr
- source URL: https://www.unmc.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.unmc.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113kp0062sb11wyre9lqr-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113kp0062sb11wyre9lqr-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Iowa Hospitals & Clinics

- id: `cmn2113jz0060sb11qa6zlypu`
- USCEHub URL: http://localhost:3000/listing/cmn2113jz0060sb11qa6zlypu
- source URL: https://medicine.uiowa.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://medicine.uiowa.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113jz0060sb11qa6zlypu-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113jz0060sb11qa6zlypu-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Kentucky Medical Center

- id: `cmn2113h5005ysb11u6inmy50`
- USCEHub URL: http://localhost:3000/listing/cmn2113h5005ysb11u6inmy50
- source URL: https://medicine.uky.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://medicine.uky.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113h5005ysb11u6inmy50-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113h5005ysb11u6inmy50-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Medical University of South Carolina (MUSC)

- id: `cmn2113gf005wsb11f05bfy8c`
- USCEHub URL: http://localhost:3000/listing/cmn2113gf005wsb11f05bfy8c
- source URL: https://web.musc.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.musc.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113gf005wsb11f05bfy8c-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113gf005wsb11f05bfy8c-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Virginia Health System

- id: `cmn2113ex005ssb11z7kp129f`
- USCEHub URL: http://localhost:3000/listing/cmn2113ex005ssb11z7kp129f
- source URL: https://med.virginia.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://med.virginia.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113ex005ssb11z7kp129f-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113ex005ssb11z7kp129f-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UT Health Memphis / Regional One Health

- id: `cmn2113e6005qsb114hstszfc`
- USCEHub URL: http://localhost:3000/listing/cmn2113e6005qsb114hstszfc
- source URL: https://uthsc.edu/graduate-medical-education/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://uthsc.edu/graduate-medical-education/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113e6005qsb114hstszfc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113e6005qsb114hstszfc-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Vanderbilt University Medical Center

- id: `cmn2113dh005osb11qdk4antb`
- USCEHub URL: http://localhost:3000/listing/cmn2113dh005osb11qdk4antb
- source URL: https://www.vumc.org/observational-services/welcome-vanderbilt-observational-experience-voe-program
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.vumc.org/observational-services/welcome-vanderbilt-observational-experience-voe-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113dh005osb11qdk4antb-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113dh005osb11qdk4antb-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### LSU Health New Orleans / University Medical Center

- id: `cmn2113cs005msb11f4e79jnf`
- USCEHub URL: http://localhost:3000/listing/cmn2113cs005msb11f4e79jnf
- source URL: https://www.medschool.lsuhsc.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.medschool.lsuhsc.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113cs005msb11f4e79jnf-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113cs005msb11f4e79jnf-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Tulane Medical Center

- id: `cmn2113c1005ksb11e54msb6c`
- USCEHub URL: http://localhost:3000/listing/cmn2113c1005ksb11e54msb6c
- source URL: https://medicine.tulane.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://medicine.tulane.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113c1005ksb11e54msb6c-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113c1005ksb11e54msb6c-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Banner University Medical Center / University of Arizona

- id: `cmn2113bb005isb111uzkdkk6`
- USCEHub URL: http://localhost:3000/listing/cmn2113bb005isb111uzkdkk6
- source URL: https://medicine.arizona.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://medicine.arizona.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113bb005isb111uzkdkk6-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113bb005isb111uzkdkk6-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Mayo Clinic Scottsdale

- id: `cmn2113al005gsb11qwosqzv5`
- USCEHub URL: http://localhost:3000/listing/cmn2113al005gsb11qwosqzv5
- source URL: https://college.mayo.edu/academics/visiting-medical-student-clerkships/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting medical student,clerkship)
- source HTTP status: 200
- source final URL: https://college.mayo.edu/academics/visiting-medical-student-clerkships/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113al005gsb11qwosqzv5-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113al005gsb11qwosqzv5-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Oregon Health & Science University (OHSU)

- id: `cmn21139u005esb116b21poq8`
- USCEHub URL: http://localhost:3000/listing/cmn21139u005esb116b21poq8
- source URL: https://www.ohsu.edu/school-of-medicine/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.ohsu.edu/school-of-medicine/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21139u005esb116b21poq8-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21139u005esb116b21poq8-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University of Washington Medical Center

- id: `cmn211393005csb11zeemcrog`
- USCEHub URL: http://localhost:3000/listing/cmn211393005csb11zeemcrog
- source URL: https://medicine.uw.edu/education/observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://medicine.uw.edu/education/observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211393005csb11zeemcrog-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211393005csb11zeemcrog-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Medical College of Wisconsin / Froedtert Hospital

- id: `cmn21137m0058sb11p08zo591`
- USCEHub URL: http://localhost:3000/listing/cmn21137m0058sb11p08zo591
- source URL: https://www.mcw.edu/education/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.mcw.edu/education/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21137m0058sb11p08zo591-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21137m0058sb11p08zo591-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Hartford Hospital

- id: `cmn2113650054sb11ap9qm6ho`
- USCEHub URL: http://localhost:3000/listing/cmn2113650054sb11ap9qm6ho
- source URL: https://hartfordhospital.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://hartfordhospital.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2113650054sb11ap9qm6ho-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2113650054sb11ap9qm6ho-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Yale-New Haven Hospital

- id: `cmn21135e0052sb11ny77telu`
- USCEHub URL: http://localhost:3000/listing/cmn21135e0052sb11ny77telu
- source URL: https://medicine.yale.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://medicine.yale.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21135e0052sb11ny77telu-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21135e0052sb11ny77telu-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Jersey Shore University Medical Center

- id: `cmn21132h0050sb11rp8j7cny`
- USCEHub URL: http://localhost:3000/listing/cmn21132h0050sb11rp8j7cny
- source URL: https://www.hackensackmeridianhealth.org/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.hackensackmeridianhealth.org/en
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21132h0050sb11rp8j7cny-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21132h0050sb11rp8j7cny-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Hackensack University Medical Center

- id: `cmn21131r004ysb11ksi9mk82`
- USCEHub URL: http://localhost:3000/listing/cmn21131r004ysb11ksi9mk82
- source URL: https://www.hackensackmeridianhealth.org/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.hackensackmeridianhealth.org/en
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21131r004ysb11ksi9mk82-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21131r004ysb11ksi9mk82-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Robert Wood Johnson University Hospital

- id: `cmn211307004usb11g6ij63lj`
- USCEHub URL: http://localhost:3000/listing/cmn211307004usb11g6ij63lj
- source URL: https://rwjms.rutgers.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://rwjms.rutgers.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211307004usb11g6ij63lj-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211307004usb11g6ij63lj-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Missouri Health Care

- id: `cmn2112zg004ssb11ibc3ebim`
- USCEHub URL: http://localhost:3000/listing/cmn2112zg004ssb11ibc3ebim
- source URL: https://medicine.missouri.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://medicine.missouri.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112zg004ssb11ibc3ebim-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112zg004ssb11ibc3ebim-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Barnes-Jewish Hospital (WashU)

- id: `cmn2112y0004osb11wjh4xkrv`
- USCEHub URL: http://localhost:3000/listing/cmn2112y0004osb11wjh4xkrv
- source URL: https://gme.wustl.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://gme.wustl.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112y0004osb11wjh4xkrv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112y0004osb11wjh4xkrv-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Wayne State University / Detroit Medical Center

- id: `cmn2112xb004msb11lxcsbuqj`
- USCEHub URL: http://localhost:3000/listing/cmn2112xb004msb11lxcsbuqj
- source URL: https://www.med.wayne.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.med.wayne.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112xb004msb11lxcsbuqj-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112xb004msb11lxcsbuqj-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Beaumont Hospital (Corewell Health)

- id: `cmn2112wn004ksb119xp19fdc`
- USCEHub URL: http://localhost:3000/listing/cmn2112wn004ksb119xp19fdc
- source URL: https://www.beaumont.org/medical-education/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 403
- source final URL: https://www.beaumont.org/medical-education/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112wn004ksb119xp19fdc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112wn004ksb119xp19fdc-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Henry Ford Hospital

- id: `cmn2112vy004isb11z0ai7uk5`
- USCEHub URL: http://localhost:3000/listing/cmn2112vy004isb11z0ai7uk5
- source URL: https://www.henryford.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://www.henryford.com/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112vy004isb11z0ai7uk5-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112vy004isb11z0ai7uk5-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Michigan Health

- id: `cmn2112v6004gsb11vhhinr8a`
- USCEHub URL: http://localhost:3000/listing/cmn2112v6004gsb11vhhinr8a
- source URL: https://medicine.umich.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://medschool.umich.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112v6004gsb11vhhinr8a-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112v6004gsb11vhhinr8a-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Augusta University Medical Center (MCG)

- id: `cmn2112uj004esb119x368xuh`
- USCEHub URL: http://localhost:3000/listing/cmn2112uj004esb119x368xuh
- source URL: https://www.augusta.edu/mcg/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.augusta.edu/mcg/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112uj004esb119x368xuh-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112uj004esb119x368xuh-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Grady Memorial Hospital

- id: `cmn2112tr004csb11exwui0cw`
- USCEHub URL: http://localhost:3000/listing/cmn2112tr004csb11exwui0cw
- source URL: https://www.gradyhealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.gradyhealth.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112tr004csb11exwui0cw-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112tr004csb11exwui0cw-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Emory University Hospital

- id: `cmn2112t1004asb11yfn2d06l`
- USCEHub URL: http://localhost:3000/listing/cmn2112t1004asb11yfn2d06l
- source URL: https://med.emory.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://med.emory.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112t1004asb11yfn2d06l-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112t1004asb11yfn2d06l-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Wake Forest Baptist Medical Center

- id: `cmn2112sb0048sb11hdvon18l`
- USCEHub URL: http://localhost:3000/listing/cmn2112sb0048sb11hdvon18l
- source URL: https://school.wakehealth.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://school.wakehealth.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112sb0048sb11hdvon18l-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112sb0048sb11hdvon18l-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UNC Hospitals

- id: `cmn2112rm0046sb11vospyk2p`
- USCEHub URL: http://localhost:3000/listing/cmn2112rm0046sb11vospyk2p
- source URL: https://www.med.unc.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.med.unc.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112rm0046sb11vospyk2p-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112rm0046sb11vospyk2p-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UPMC (University of Pittsburgh Medical Center)

- id: `cmn2112mt0040sb115rkbqj9q`
- USCEHub URL: http://localhost:3000/listing/cmn2112mt0040sb115rkbqj9q
- source URL: https://dom.pitt.edu/education/eop/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 404
- source final URL: https://dom.pitt.edu/education/eop/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112mt0040sb115rkbqj9q-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112mt0040sb115rkbqj9q-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Temple University Hospital

- id: `cmn2112m0003ysb11rxj0haiv`
- USCEHub URL: http://localhost:3000/listing/cmn2112m0003ysb11rxj0haiv
- source URL: https://medicine.temple.edu/education/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.temple.edu/education/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112m0003ysb11rxj0haiv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112m0003ysb11rxj0haiv-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Penn Medicine (UPenn)

- id: `cmn2112ki003usb111wmk4pt8`
- USCEHub URL: http://localhost:3000/listing/cmn2112ki003usb111wmk4pt8
- source URL: https://www.pennmedicine.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.pennmedicine.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112ki003usb111wmk4pt8-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112ki003usb111wmk4pt8-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Tampa General Hospital / USF Health

- id: `cmn2112jp003ssb11zyesyyua`
- USCEHub URL: http://localhost:3000/listing/cmn2112jp003ssb11zyesyyua
- source URL: https://health.usf.edu/medicine/gme
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://health.usf.edu/medicine/gme/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112jp003ssb11zyesyyua-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112jp003ssb11zyesyyua-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Mayo Clinic Jacksonville

- id: `cmn2112ia003osb11ylgme3ij`
- USCEHub URL: http://localhost:3000/listing/cmn2112ia003osb11ylgme3ij
- source URL: https://college.mayo.edu/academics/visiting-medical-student-clerkships/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting medical student,clerkship)
- source HTTP status: 200
- source final URL: https://college.mayo.edu/academics/visiting-medical-student-clerkships/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112ia003osb11ylgme3ij-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112ia003osb11ylgme3ij-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Memorial Hermann Hospital / UTHealth

- id: `cmn2112f7003gsb11qd3fut7i`
- USCEHub URL: http://localhost:3000/listing/cmn2112f7003gsb11qd3fut7i
- source URL: https://med.uth.edu/gme/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://med.uth.edu/gme/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112f7003gsb11qd3fut7i-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112f7003gsb11qd3fut7i-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UT Southwestern Medical Center

- id: `cmn2112ds003csb11nwgawjyr`
- USCEHub URL: http://localhost:3000/listing/cmn2112ds003csb11nwgawjyr
- source URL: https://www.utsouthwestern.edu/education/graduate-medical-education/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://gme.utsouthwestern.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112ds003csb11nwgawjyr-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112ds003csb11nwgawjyr-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Baylor College of Medicine

- id: `cmn2112d0003asb11odo3emfn`
- USCEHub URL: http://localhost:3000/listing/cmn2112d0003asb11odo3emfn
- source URL: https://www.bcm.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.bcm.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2112d0003asb11odo3emfn-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2112d0003asb11odo3emfn-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Minnesota Medical Center

- id: `cmn21129f0036sb11lxype91i`
- USCEHub URL: http://localhost:3000/listing/cmn21129f0036sb11lxype91i
- source URL: https://med.umn.edu/gme
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://med.umn.edu/gme
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21129f0036sb11lxype91i-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21129f0036sb11lxype91i-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### George Washington University Hospital

- id: `cmn21127z0032sb11zu4ltpkg`
- USCEHub URL: http://localhost:3000/listing/cmn21127z0032sb11zu4ltpkg
- source URL: https://imp.smhs.gwu.edu/observer-training-program-not-accepting-applications
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observer)
- source HTTP status: 200
- source final URL: https://imp.smhs.gwu.edu/observer-training-program-not-accepting-applications
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21127z0032sb11zu4ltpkg-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21127z0032sb11zu4ltpkg-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of Maryland Medical Center

- id: `cmn21126j002ysb11e8v08sef`
- USCEHub URL: http://localhost:3000/listing/cmn21126j002ysb11e8v08sef
- source URL: https://www.umm.edu/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.umms.org/ummc
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21126j002ysb11e8v08sef-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21126j002ysb11e8v08sef-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University of Cincinnati Medical Center

- id: `cmn211253002usb11tv4v9ll0`
- USCEHub URL: http://localhost:3000/listing/cmn211253002usb11tv4v9ll0
- source URL: https://med.uc.edu/gme
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://med.uc.edu/education/gme/home
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211253002usb11tv4v9ll0-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211253002usb11tv4v9ll0-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Ohio State University Wexner Medical Center

- id: `cmn21124c002ssb11sr1k6hdt`
- USCEHub URL: http://localhost:3000/listing/cmn21124c002ssb11sr1k6hdt
- source URL: https://medicine.osu.edu/departments/office-of-global-health/international-visiting-scholars
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.osu.edu/departments/office-of-global-health/international-visiting-scholars
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21124c002ssb11sr1k6hdt-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21124c002ssb11sr1k6hdt-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University Hospitals Cleveland

- id: `cmn21123m002qsb116w4i7ktz`
- USCEHub URL: http://localhost:3000/listing/cmn21123m002qsb116w4i7ktz
- source URL: https://www.uhhospitals.org/medical-education/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.uhhospitals.org/medical-education/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21123m002qsb116w4i7ktz-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21123m002qsb116w4i7ktz-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Loyola University Medical Center

- id: `cmn211226002msb11k9kbylwr`
- USCEHub URL: http://localhost:3000/listing/cmn211226002msb11k9kbylwr
- source URL: https://ssom.luc.edu/gme/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 202
- source final URL: https://ssom.luc.edu/gme/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211226002msb11k9kbylwr-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211226002msb11k9kbylwr-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Advocate Christ Medical Center

- id: `cmn21121g002ksb11m3qkwjbv`
- USCEHub URL: http://localhost:3000/listing/cmn21121g002ksb11m3qkwjbv
- source URL: https://www.advocatehealth.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://www.advocatehealth.com/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21121g002ksb11m3qkwjbv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21121g002ksb11m3qkwjbv-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Rush University Medical Center

- id: `cmn211200002gsb116i7cgugp`
- USCEHub URL: http://localhost:3000/listing/cmn211200002gsb116i7cgugp
- source URL: https://www.rushu.rush.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.rushu.rush.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn211200002gsb116i7cgugp-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn211200002gsb116i7cgugp-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Cook County Hospital (Stroger)

- id: `cmn2111z9002esb11gli9r1qb`
- USCEHub URL: http://localhost:3000/listing/cmn2111z9002esb11gli9r1qb
- source URL: https://cookcountyhealth.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://cookcountyhealth.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111z9002esb11gli9r1qb-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111z9002esb11gli9r1qb-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Northwestern Memorial Hospital

- id: `cmn2111yi002csb110xhtoeez`
- USCEHub URL: http://localhost:3000/listing/cmn2111yi002csb110xhtoeez
- source URL: https://www.nm.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.nm.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111yi002csb110xhtoeez-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111yi002csb110xhtoeez-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Tufts Medical Center

- id: `cmn2111uv0028sb11o4hirnws`
- USCEHub URL: http://localhost:3000/listing/cmn2111uv0028sb11o4hirnws
- source URL: https://www.tuftsmedicalcenter.org/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.tuftsmedicine.org/medical-professionals-trainees/training-education/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111uv0028sb11o4hirnws-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111uv0028sb11o4hirnws-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Boston Medical Center

- id: `cmn2111u40026sb11bnhgpkdb`
- USCEHub URL: http://localhost:3000/listing/cmn2111u40026sb11bnhgpkdb
- source URL: https://www.bmc.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.bmc.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111u40026sb11bnhgpkdb-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111u40026sb11bnhgpkdb-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Beth Israel Deaconess Medical Center

- id: `cmn2111te0024sb11mt47ybof`
- USCEHub URL: http://localhost:3000/listing/cmn2111te0024sb11mt47ybof
- source URL: https://www.ecfmg.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.ecfmg.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111te0024sb11mt47ybof-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111te0024sb11mt47ybof-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Brigham and Women's Hospital

- id: `cmn2111sn0022sb11l23h78bo`
- USCEHub URL: http://localhost:3000/listing/cmn2111sn0022sb11l23h78bo
- source URL: https://www.brighamandwomens.org/radiology/education-and-training/observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.brighamandwomens.org/radiology/education-and-training/observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111sn0022sb11l23h78bo-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111sn0022sb11l23h78bo-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Massachusetts General Hospital

- id: `cmn2111rw0020sb112s14bfsn`
- USCEHub URL: http://localhost:3000/listing/cmn2111rw0020sb112s14bfsn
- source URL: https://www.massgeneral.org/education
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.massgeneral.org/education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111rw0020sb112s14bfsn-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111rw0020sb112s14bfsn-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### UC Davis Medical Center

- id: `cmn2111pp001usb11xypzlek1`
- USCEHub URL: http://localhost:3000/listing/cmn2111pp001usb11xypzlek1
- source URL: https://health.ucdavis.edu/gme/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://health.ucdavis.edu/graduate-medical-education/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111pp001usb11xypzlek1-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111pp001usb11xypzlek1-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Cedars-Sinai Medical Center

- id: `cmn2111o8001qsb11j87evr4c`
- USCEHub URL: http://localhost:3000/listing/cmn2111o8001qsb11j87evr4c
- source URL: https://www.cedars-sinai.org/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.cedars-sinai.org/home.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111o8001qsb11j87evr4c-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111o8001qsb11j87evr4c-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UCSF Medical Center

- id: `cmn2111nj001osb1129xg34rr`
- USCEHub URL: http://localhost:3000/listing/cmn2111nj001osb1129xg34rr
- source URL: https://meded.ucsf.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://meded.ucsf.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111nj001osb1129xg34rr-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111nj001osb1129xg34rr-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Brookdale University Hospital

- id: `cmn2111j4001csb113odjp4jt`
- USCEHub URL: http://localhost:3000/listing/cmn2111j4001csb113odjp4jt
- source URL: https://www.ecfmg.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.ecfmg.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111j4001csb113odjp4jt-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111j4001csb113odjp4jt-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Coney Island Hospital

- id: `cmn2111bn000ysb11c73w0mft`
- USCEHub URL: http://localhost:3000/listing/cmn2111bn000ysb11c73w0mft
- source URL: https://www.nychealthandhospitals.org/coneyisland/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=072bb936-0090-40b0-bd99-85f14e2c5622&ssb=62842258051&ssc=https%3A%2F%2Fwww.nychealthandhospitals.org%2Fconeyisland%2F&ssi=27be77a6-c6hb-457f-90cc-2845ceebd3a7&ssk=botmanager_support@radware.com&ssm=67046073359780629190226523516490&ssn=3e998e1f090858b065411a2e97ea665d0fcaccb1a0ce-3a16-4e73-a35dcb&sso=39d0de47-361d578313b693240a7f8249ee1a66b883aab50f7e31fe6a&ssp=27074373861777634022177763225366466&ssq=74118569292862039284691546395279340219730&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJ1em14IjoiN2Y5MDAwYjI0Y2E0NjItZmFmOC00MjcwLWIyOWYtNDg5MmUwNGFjMjFhMS0xNzc3NjkxNTQ2MjA0MTM4MjU1MC0xMWZhNTk0ZTE2ZWNkZWM1MTkiLCJyZCI6Im55Y2hlYWx0aGFuZGhvc3BpdGFscy5vcmciLCJfX3V6bWYiOiI3ZjkwMDBjY2IxYTBjZS0zYTE2LTRlNzMtYWU0Ny0zNjFkNTc4MzEzYjYxLTE3Nzc2OTE1NDYyMDQxMzgyNTUwLTAwMzc4YWU3ZmJkZTdlNGExZGIxOSJ9
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111bn000ysb11c73w0mft-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111bn000ysb11c73w0mft-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Kings County Hospital Center

- id: `cmn2111ay000wsb11a14w9t73`
- USCEHub URL: http://localhost:3000/listing/cmn2111ay000wsb11a14w9t73
- source URL: https://www.nychealthandhospitals.org/kingscounty/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=7360a7a0-674f-4129-bff8-f6879dfcfa9b&ssb=04528229883&ssc=https%3A%2F%2Fwww.nychealthandhospitals.org%2Fkingscounty%2F&ssi=c654ea94-c6hb-4a09-8a31-a982e06e0a48&ssk=botmanager_support@radware.com&ssm=70957699125925318227304462633199&ssn=26b106a05dd3c5a757f7939142c3b2de4c10ccb1a0ce-3a16-4e73-ae3556&sso=9adcee47-361d578313b6a536a74f81e15e71f48d6deda793a0b39b90&ssp=31520236211777661686177769812942970&ssq=68474999293337420583091546934052268135196&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJ1em14IjoiN2Y5MDAwYjI0Y2E0NjItZmFmOC00MjcwLWIyOWYtNDg5MmUwNGFjMjFhMS0xNzc3NjkxNTQ2MjA0MTM4NjkwNS1mMzBiMmFjNWJmYjQzMzEyMjIiLCJyZCI6Im55Y2hlYWx0aGFuZGhvc3BpdGFscy5vcmciLCJfX3V6bWYiOiI3ZjkwMDBjY2IxYTBjZS0zYTE2LTRlNzMtYWU0Ny0zNjFkNTc4MzEzYjYxLTE3Nzc2OTE1NDYyMDQxMzg2OTA1LTAwMzM4NTc2MTBlMGEwN2RmOTYyMiJ9
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111ay000wsb11a14w9t73-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111ay000wsb11a14w9t73-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Harlem Hospital Center

- id: `cmn2111a9000usb11xb7vi1yo`
- USCEHub URL: http://localhost:3000/listing/cmn2111a9000usb11xb7vi1yo
- source URL: https://www.nychealthandhospitals.org/harlem/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=7a4c12c0-29ce-4c10-9bb1-405145da7b4e&ssb=35024283468&ssc=https%3A%2F%2Fwww.nychealthandhospitals.org%2Fharlem%2F&ssi=d5d06e21-c6hb-4e12-88df-652a85f1f670&ssk=botmanager_support@radware.com&ssm=55794061964156467250249236008030&ssn=e5f4dcb0808d2fc6d506653ee0ba63acc07eccb1a0ce-3a16-4e73-a4387b&sso=7a651e47-361d578313b631fc92d72b53daea0d21695999ebefca692f&ssp=84542564731777621995177763792975741&ssq=58924109293633421820991546153428735098084&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJ1em14IjoiN2Y5MDAwYjI0Y2E0NjItZmFmOC00MjcwLWIyOWYtNDg5MmUwNGFjMjFhMS0xNzc3NjkxNTQ2MjA0MTM5MDA0Ni02MGI2YmQ5ODMxNGYzMTZhMjUiLCJyZCI6Im55Y2hlYWx0aGFuZGhvc3BpdGFscy5vcmciLCJfX3V6bWYiOiI3ZjkwMDBjY2IxYTBjZS0zYTE2LTRlNzMtYWU0Ny0zNjFkNTc4MzEzYjYxLTE3Nzc2OTE1NDYyMDQxMzkwMDQ2LTAwM2I3NzgzOWVlNjFkMzRiNDIyNSJ9
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2111a9000usb11xb7vi1yo-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2111a9000usb11xb7vi1yo-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Lincoln Medical Center

- id: `cmn21119k000ssb11aj30itn0`
- USCEHub URL: http://localhost:3000/listing/cmn21119k000ssb11aj30itn0
- source URL: https://www.nychealthandhospitals.org/lincoln/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=950fd07a-7790-432e-9b97-fd827335387f&ssb=02211242959&ssc=https%3A%2F%2Fwww.nychealthandhospitals.org%2Flincoln%2F&ssi=41b89ec2-c6hb-4ebf-8f64-ef2c548c75d1&ssk=botmanager_support@radware.com&ssm=47662330296809591286106572412055&ssn=77de47e4ad93bf281ac9ca7ca582f1b9e369ccb1a0ce-3a16-4e73-a80445&sso=22ae0e47-361d578313b6485c295c4db19214fe1ce4275b98c68994ef&ssp=22354500351777653787177763976902944&ssq=40801259294058882736991546917660000413325&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJ1em14IjoiN2Y5MDAwYjI0Y2E0NjItZmFmOC00MjcwLWIyOWYtNDg5MmUwNGFjMjFhMS0xNzc3NjkxNTQ2MjA0MTM5MzgxNC01NmU5Zjg4MzVhYWFiYzBhMjgiLCJyZCI6Im55Y2hlYWx0aGFuZGhvc3BpdGFscy5vcmciLCJfX3V6bWYiOiI3ZjkwMDBjY2IxYTBjZS0zYTE2LTRlNzMtYWU0Ny0zNjFkNTc4MzEzYjYxLTE3Nzc2OTE1NDYyMDQxMzkzODE0LTAwMzFlMjE0MjI1ZTU1YWZhZWIyOCJ9
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21119k000ssb11aj30itn0-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21119k000ssb11aj30itn0-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Interfaith Medical Center

- id: `cmn21117e000msb11t80jqdux`
- USCEHub URL: http://localhost:3000/listing/cmn21117e000msb11t80jqdux
- source URL: https://www.ecfmg.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.ecfmg.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21117e000msb11t80jqdux-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21117e000msb11t80jqdux-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Maimonides Medical Center

- id: `cmn21116s000ksb11yj4vmreu`
- USCEHub URL: http://localhost:3000/listing/cmn21116s000ksb11yj4vmreu
- source URL: https://www.maimonides.org/gme/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 404
- source final URL: https://www.maimonides.org/gme/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn21116s000ksb11yj4vmreu-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn21116s000ksb11yj4vmreu-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Mount Sinai Hospital

- id: `cmn2110ys0006sb11nja16wow`
- USCEHub URL: http://localhost:3000/listing/cmn2110ys0006sb11nja16wow
- source URL: https://www.mountsinai.org/about/international/programs
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.mountsinai.org/about/international/programs
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/uscehub-listings/cmn2110ys0006sb11nja16wow-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/full-304/official-sources/cmn2110ys0006sb11nja16wow-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

## Hard rules

- No DB connection.
- One request per host with a 1.2 s gap.
- 12 s per-page timeout; failures recorded, no retries.
- No login attempts. No credentialed access.
- Screenshots are local-only; the screenshots folder is gitignored.