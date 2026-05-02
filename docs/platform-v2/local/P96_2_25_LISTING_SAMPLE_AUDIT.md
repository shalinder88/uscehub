# P96-2 — listing screenshot audit

Generated: 2026-05-02T01:58:32.273Z
Sample size: 10

Pipeline: Playwright headless captures of (a) local USCEHub listing
detail and (b) the apply CTA's external URL → pure content classifier
on URL+status → JSON sidecar + CSV + this doc. No DB connection.
Sample discovered by reading the running dev server's /browse page.

## Verdict distribution

| Verdict | Count |
| --- | --- |
| DEEP_PATH_NO_HINT | 5 |
| GENERIC_HOMEPAGE | 3 |
| LIKELY_WRONG_PAGE | 1 |
| PATH_HINTS_PROGRAM | 1 |

## Per-listing detail

### Northwell Health System

- id: `cmn2111jv001esb1197ufjp8u`
- USCEHub URL: http://localhost:3000/listing/cmn2111jv001esb1197ufjp8u
- source URL: https://international.northwell.edu/consulting-advisory-services
- content verdict: **LIKELY_WRONG_PAGE** (wrong_page_hints:consulting,advisory services)
- source HTTP status: 200
- source final URL: https://international.northwell.edu/consulting-advisory-services
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2111jv001esb1197ufjp8u-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2111jv001esb1197ufjp8u-20260502.png`
- recommended action: Source URL contains wrong-page hint; admin re-link.

### NYU Langone Visiting International Physicians Program — Orthopedic Surgery

- id: `cmo3384p200071ny9poe15otq`
- USCEHub URL: http://localhost:3000/listing/cmo3384p200071ny9poe15otq
- source URL: https://med.nyu.edu/departments-institutes/orthopedic-surgery/education/visiting-international-physicians-program
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://med.nyu.edu/departments-institutes/orthopedic-surgery/education/visiting-international-physicians-program
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo3384p200071ny9poe15otq-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo3384p200071ny9poe15otq-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Weill Cornell Visiting International Medical Students Program

- id: `cmo34f3ii000b1nxxbgalsak9`
- USCEHub URL: http://localhost:3000/listing/cmo34f3ii000b1nxxbgalsak9
- source URL: https://international.weill.cornell.edu/visiting-international-students
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://international.weill.cornell.edu/visiting-international-students
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo34f3ii000b1nxxbgalsak9-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo34f3ii000b1nxxbgalsak9-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### U Utah Spencer Fox Eccles Visiting Student Program

- id: `cmo34f4nt001t1nxxd5adsmg1`
- USCEHub URL: http://localhost:3000/listing/cmo34f4nt001t1nxxd5adsmg1
- source URL: https://medicine.utah.edu/students/visiting
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.utah.edu/students/visiting
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo34f4nt001t1nxxd5adsmg1-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo34f4nt001t1nxxd5adsmg1-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Ohio State Wexner International Visiting Scholars Program

- id: `cmo3386di002f1ny99zepgb4w`
- USCEHub URL: http://localhost:3000/listing/cmo3386di002f1ny99zepgb4w
- source URL: https://medicine.osu.edu/departments/office-of-global-health/international-visiting-scholars
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.osu.edu/departments/office-of-global-health/international-visiting-scholars
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo3386di002f1ny99zepgb4w-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo3386di002f1ny99zepgb4w-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### UCSD — Bridge to Residency Program

- id: `cmn2114vr0096sb11tmv3xquq`
- USCEHub URL: http://localhost:3000/listing/cmn2114vr0096sb11tmv3xquq
- source URL: https://hsi.ucsd.edu/education/physicians/bridge-to-residency-program-for-physicians
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://vchs.ucsd.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2114vr0096sb11tmv3xquq-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2114vr0096sb11tmv3xquq-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Florida Health / Shands Hospital

- id: `cmn2112ix003qsb1178t0rg6k`
- USCEHub URL: http://localhost:3000/listing/cmn2112ix003qsb1178t0rg6k
- source URL: https://hr.med.ufl.edu/volunteers/onserving-shadowing-application-process/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:volunteer,shadowing)
- source HTTP status: 200
- source final URL: https://hr.med.ufl.edu/volunteers/onserving-shadowing-application-process/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2112ix003qsb1178t0rg6k-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2112ix003qsb1178t0rg6k-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Henry Ford Hospital

- id: `cmn21159400a2sb11la8ong4t`
- USCEHub URL: http://localhost:3000/listing/cmn21159400a2sb11la8ong4t
- source URL: https://www.henryford.com/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 403
- source final URL: https://www.henryford.com/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn21159400a2sb11la8ong4t-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn21159400a2sb11la8ong4t-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Iowa Hospitals & Clinics

- id: `cmn2113jz0060sb11qa6zlypu`
- USCEHub URL: http://localhost:3000/listing/cmn2113jz0060sb11qa6zlypu
- source URL: https://medicine.uiowa.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://medicine.uiowa.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2113jz0060sb11qa6zlypu-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2113jz0060sb11qa6zlypu-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Temple University Hospital

- id: `cmn2112m0003ysb11rxj0haiv`
- USCEHub URL: http://localhost:3000/listing/cmn2112m0003ysb11rxj0haiv
- source URL: https://medicine.temple.edu/education/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://medicine.temple.edu/education/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2112m0003ysb11rxj0haiv-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2112m0003ysb11rxj0haiv-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

## Hard rules

- No DB connection.
- One request per host with a 1.2 s gap.
- 12 s per-page timeout; failures recorded, no retries.
- No login attempts. No credentialed access.
- Screenshots are local-only; the screenshots folder is gitignored.