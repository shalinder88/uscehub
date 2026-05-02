# P96-2 — listing screenshot audit

Generated: 2026-05-02T02:10:59.903Z
Sample size: 25

Pipeline: Playwright headless captures of (a) local USCEHub listing
detail and (b) the apply CTA's external URL → pure content classifier
on URL+status → JSON sidecar + CSV + this doc. No DB connection.
Sample discovered by reading the running dev server's /browse page.

## Verdict distribution

| Verdict | Count |
| --- | --- |
| PATH_HINTS_PROGRAM | 11 |
| DEEP_PATH_NO_HINT | 7 |
| GENERIC_HOMEPAGE | 6 |
| LIKELY_WRONG_PAGE | 1 |

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

### Drexel University / Hahnemann (Tower Health)

- id: `cmn2112nm0042sb119q64hx5i`
- USCEHub URL: http://localhost:3000/listing/cmn2112nm0042sb119q64hx5i
- source URL: https://drexel.edu/medicine/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://drexel.edu/medicine/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2112nm0042sb119q64hx5i-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2112nm0042sb119q64hx5i-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### University of Minnesota Pathology Observership

- id: `cmo33867o00271ny9ovpq1r1c`
- USCEHub URL: http://localhost:3000/listing/cmo33867o00271ny9ovpq1r1c
- source URL: https://med.umn.edu/pathology/education-training/residency/observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://med.umn.edu/pathology/education-training/residency/observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo33867o00271ny9ovpq1r1c-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo33867o00271ny9ovpq1r1c-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Metropolitan Hospital Center

- id: `cmn2111ce0010sb11kh0qbbxa`
- USCEHub URL: http://localhost:3000/listing/cmn2111ce0010sb11kh0qbbxa
- source URL: https://www.nychealthandhospitals.org/metropolitan/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://validate.perfdrive.com/?ssa=63be8d4a-0523-4785-869c-c51fe73ae3a4&ssb=56956261810&ssc=https%3A%2F%2Fwww.nychealthandhospitals.org%2Fmetropolitan%2F&ssi=db3b3b63-c6hb-4c44-bfd3-d13492637ed5&ssk=botmanager_support@radware.com&ssm=84694968657071295108420922956560&ssn=52288673eba14e41bd762b80a6c9cec2c8fa3d877d87-521e-4e3f-bada42&sso=6ceb06e2-6f9680ee29c1ec643a94c505f31692fba474fed05555edb9&ssp=66745208991777688554177762064803860&ssq=89040048777365754114287773445371391920027&ssr=NTAuMjUuMjQuMjI1&sst=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20HeadlessChrome/147.0.7727.15%20Safari/537.36&ssu=&ssv=&ssw=&ssx=eyJ1em14IjoiN2Y5MDAwMzYzOGIzZDctYjJmMC00NzlmLTk1ZjYtYmE0NjkzOGQ4MTNmMS0xNzc3Njg3NzczMzA5MC04YTBiNjJmODcwNjJjZGNkMTAiLCJyZCI6Im55Y2hlYWx0aGFuZGhvc3BpdGFscy5vcmciLCJfX3V6bWYiOiI3ZjkwMDAzZDg3N2Q4Ny01MjFlLTRlM2YtYjZlMi02Zjk2ODBlZTI5YzExLTE3Nzc2ODc3NzMzMDkwLTAwMzZjZDE2MmQ2MjUxNGY5YTQxMCJ9
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2111ce0010sb11kh0qbbxa-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2111ce0010sb11kh0qbbxa-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### University of Wisconsin–Madison Visiting Medical Student Program

- id: `cmo34f3we000t1nxx1ifvu2zl`
- USCEHub URL: http://localhost:3000/listing/cmo34f3we000t1nxx1ifvu2zl
- source URL: https://www.med.wisc.edu/education/md-program/visiting-students/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://www.med.wisc.edu/education/md-program/visiting-students/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo34f3we000t1nxx1ifvu2zl-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo34f3we000t1nxx1ifvu2zl-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

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

### St. John's Episcopal Hospital

- id: `cmn2114z5009gsb11laxdyyfc`
- USCEHub URL: http://localhost:3000/listing/cmn2114z5009gsb11laxdyyfc
- source URL: https://www.ehs.org/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://ehs.org/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2114z5009gsb11laxdyyfc-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2114z5009gsb11laxdyyfc-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Texas Tech HSC Internal Medicine IMG Observership

- id: `cmo3386pc002v1ny92dflv0b9`
- USCEHub URL: http://localhost:3000/listing/cmo3386pc002v1ny92dflv0b9
- source URL: https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo3386pc002v1ny92dflv0b9-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo3386pc002v1ny92dflv0b9-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Stanford Visiting Clerkship Program

- id: `cmo34f48p00191nxxa638xyp8`
- USCEHub URL: http://localhost:3000/listing/cmo34f48p00191nxxa638xyp8
- source URL: https://med.stanford.edu/visiting-clerkships/visitingclerkships.html
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:clerkship)
- source HTTP status: 200
- source final URL: https://med.stanford.edu/visiting-clerkships/visitingclerkships.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo34f48p00191nxxa638xyp8-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo34f48p00191nxxa638xyp8-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Mass General Brigham Emergency Medicine Clerkship (HMS)

- id: `cmo34f3fe00071nxxtgp8zt29`
- USCEHub URL: http://localhost:3000/listing/cmo34f3fe00071nxxtgp8zt29
- source URL: https://haemr.org/visiting-students/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:visiting student,visiting students)
- source HTTP status: 200
- source final URL: https://haemr.org/visiting-students/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo34f3fe00071nxxtgp8zt29-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo34f3fe00071nxxtgp8zt29-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

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

### Orlando Health Medical Staff Services Observership

- id: `cmo3385mo001f1ny9t1ilrqd7`
- USCEHub URL: http://localhost:3000/listing/cmo3385mo001f1ny9t1ilrqd7
- source URL: https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: page.goto: Download is starting
Call log:
  - navigating to "https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf", waiting until "domcontentlo
- source final URL: (none)
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo3385mo001f1ny9t1ilrqd7-20260502.png`
- source screenshot: (failed: page.goto: Download is starting
Call log:
  - navigating to "https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf", waiting until "domcontentlo)
- recommended action: Screenshot capture failed: page.goto: Download is starting
Call log:
  - navigating to "https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf", waiting until "domcontentlo.

### Columbia Psychiatry Observerships

- id: `cmo3384we000h1ny9zqofrhm4`
- USCEHub URL: http://localhost:3000/listing/cmo3384we000h1ny9zqofrhm4
- source URL: https://www.columbiapsychiatry.org/education-and-training/psychiatry-observerships
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.columbiapsychiatry.org/education-and-training/psychiatry-observerships
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo3384we000h1ny9zqofrhm4-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo3384we000h1ny9zqofrhm4-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Texas Tech University HSC — Observership

- id: `cmn2114no008qsb11x1fjuo28`
- USCEHub URL: http://localhost:3000/listing/cmn2114no008qsb11x1fjuo28
- source URL: https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.ttuhsc.edu/medicine/internal/observership/observership.aspx
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2114no008qsb11x1fjuo28-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2114no008qsb11x1fjuo28-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### Mount Sinai Medical Center — Miami Beach

- id: `cmn2114eg0080sb11z6bzsocz`
- USCEHub URL: http://localhost:3000/listing/cmn2114eg0080sb11z6bzsocz
- source URL: https://www.msmc.com/education/educational-courses-and-events/international-observership-courses/
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 200
- source final URL: https://www.msmc.com/education/educational-courses-and-events/international-observership-courses/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2114eg0080sb11z6bzsocz-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2114eg0080sb11z6bzsocz-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

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

### Jackson Health System Observership Program

- id: `cmo3385gq00171ny9bm6z8i3h`
- USCEHub URL: http://localhost:3000/listing/cmo3385gq00171ny9bm6z8i3h
- source URL: https://jacksonhealth.org/observership
- content verdict: **PATH_HINTS_PROGRAM** (path_keywords:observership,observer)
- source HTTP status: 403
- source final URL: https://jacksonhealth.org/observership
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmo3385gq00171ny9bm6z8i3h-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmo3385gq00171ny9bm6z8i3h-20260502.png`
- recommended action: Source URL path matches program keyword; visual confirmation still needed.

### University of New Mexico Hospital

- id: `cmn2115n200aysb11lq9efqq3`
- USCEHub URL: http://localhost:3000/listing/cmn2115n200aysb11lq9efqq3
- source URL: https://hospitals.health.unm.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://hospitals.health.unm.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2115n200aysb11lq9efqq3-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2115n200aysb11lq9efqq3-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Albert Einstein College of Medicine — Research Fellowship

- id: `cmn21146x007ksb11nksfya8i`
- USCEHub URL: http://localhost:3000/listing/cmn21146x007ksb11nksfya8i
- source URL: https://einsteinmed.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://einsteinmed.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn21146x007ksb11nksfya8i-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn21146x007ksb11nksfya8i-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Fred Hutchinson Cancer Center

- id: `cmn2113ue006ssb11j9eieieh`
- USCEHub URL: http://localhost:3000/listing/cmn2113ue006ssb11j9eieieh
- source URL: https://www.fredhutch.org/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.fredhutch.org/en.html
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2113ue006ssb11j9eieieh-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2113ue006ssb11j9eieieh-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

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

### Medical College of Wisconsin / Froedtert Hospital

- id: `cmn21137m0058sb11p08zo591`
- USCEHub URL: http://localhost:3000/listing/cmn21137m0058sb11p08zo591
- source URL: https://www.mcw.edu/education/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.mcw.edu/education/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn21137m0058sb11p08zo591-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn21137m0058sb11p08zo591-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Augusta University Medical Center (MCG)

- id: `cmn2112uj004esb119x368xuh`
- USCEHub URL: http://localhost:3000/listing/cmn2112uj004esb119x368xuh
- source URL: https://www.augusta.edu/mcg/
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.augusta.edu/mcg/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2112uj004esb119x368xuh-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2112uj004esb119x368xuh-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

### Baylor College of Medicine

- id: `cmn2112d0003asb11odo3emfn`
- USCEHub URL: http://localhost:3000/listing/cmn2112d0003asb11odo3emfn
- source URL: https://www.bcm.edu/
- content verdict: **GENERIC_HOMEPAGE** (path_is_generic)
- source HTTP status: 200
- source final URL: https://www.bcm.edu/
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2112d0003asb11odo3emfn-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2112d0003asb11odo3emfn-20260502.png`
- recommended action: Source URL points at a generic homepage; re-link candidate.

### Tufts Medical Center

- id: `cmn2111uv0028sb11o4hirnws`
- USCEHub URL: http://localhost:3000/listing/cmn2111uv0028sb11o4hirnws
- source URL: https://www.tuftsmedicalcenter.org/graduate-medical-education
- content verdict: **DEEP_PATH_NO_HINT** (no_keyword_match)
- source HTTP status: 200
- source final URL: https://www.tuftsmedicine.org/medical-professionals-trainees/training-education/graduate-medical-education
- USCEHub screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/uscehub-listings/cmn2111uv0028sb11o4hirnws-20260502.png`
- source screenshot: `docs/platform-v2/local/screenshots/p96-existing-listings/official-sources/cmn2111uv0028sb11o4hirnws-20260502.png`
- recommended action: Deep path with no keyword hit; review page text manually.

## Worst findings requiring manual review

The seven highest-priority rows from the 25-listing sample, from
worst (wrong-page) downward. Each has a persisted USCEHub
screenshot AND a persisted source-page screenshot (or a logged
capture failure). All listings here were already tagged
`linkVerificationStatus = VERIFIED` by the existing cron because
the URL responded 2xx — illustrating exactly why URL-only HTTP
verification is insufficient.

### 1. Northwell Health System — `LIKELY_WRONG_PAGE`

- id: `cmn2111jv001esb1197ufjp8u`
- source URL: `https://international.northwell.edu/consulting-advisory-services`
- screenshots: `…/uscehub-listings/cmn2111jv001esb1197ufjp8u-20260502.png`,
  `…/official-sources/cmn2111jv001esb1197ufjp8u-20260502.png`
- why concerning: listing is "Northwell observership program" but
  the apply URL is Northwell's **consulting-advisory** page —
  unrelated content on the same domain. Returns 200, so the
  HEAD-only cron classifies as `VERIFIED`. The screenshot proves
  the page is for hospital consulting services, not observership.
- recommended action: **WRONG_PAGE_REPLACE.** Find Northwell's
  actual visiting-physician / observership page (if one exists
  publicly) and re-link.

### 2. Metropolitan Hospital Center — `GENERIC_HOMEPAGE` (with bot-block redirect)

- id: `cmn2111ce0010sb11kh0qbbxa`
- source URL: `https://www.nychealthandhospitals.org/metropolitan/`
- final URL after redirect: `https://validate.perfdrive.com/?ssa=…` (Radware bot challenge)
- screenshots present
- why concerning: source URL is the hospital's hub page (no
  observership path), AND the host returns a Radware bot challenge
  to Playwright's headless Chromium. The screenshot shows the bot
  challenge, not real content. Even if a human-browser visit would
  resolve, the cron has no programmatic way to classify the actual
  program page.
- recommended action: **NEEDS_BETTER_SOURCE.** Re-link to a
  metropolitan-specific observership / training URL if one exists.
  Note in `adminNotes` that the host bot-blocks automated probes.

### 3. St. John's Episcopal Hospital — `GENERIC_HOMEPAGE`

- id: `cmn2114z5009gsb11laxdyyfc`
- source URL: `https://www.ehs.org/` (Episcopal Health Services root)
- screenshots present
- why concerning: source is the parent system root, no path to a
  program. Listing title says "St. John's Episcopal" but URL
  doesn't disambiguate.
- recommended action: **NEEDS_BETTER_SOURCE.**

### 4. University of New Mexico Hospital — `GENERIC_HOMEPAGE`

- id: `cmn2115n200aysb11lq9efqq3`
- source URL: `https://hospitals.health.unm.edu/`
- screenshots present
- recommended action: **NEEDS_BETTER_SOURCE.** Find UNM Med
  School's visiting-student / observership page.

### 5. Albert Einstein College of Medicine — Research Fellowship — `GENERIC_HOMEPAGE`

- id: `cmn21146x007ksb11nksfya8i`
- source URL: `https://einsteinmed.edu/`
- screenshots present
- why concerning: listing is specifically a "Research Fellowship"
  but the URL is the medical school root.
- recommended action: **NEEDS_BETTER_SOURCE.**

### 6. Baylor College of Medicine — `GENERIC_HOMEPAGE`

- id: `cmn2112d0003asb11odo3emfn`
- source URL: `https://www.bcm.edu/`
- screenshots present
- recommended action: **NEEDS_BETTER_SOURCE.** Same pattern as the
  P96-0 dry run finding for Baylor's separate Postdoctoral Research
  listing.

### 7. Orlando Health Medical Staff Services Observership — `PATH_HINTS_PROGRAM` (capture failed)

- id: `cmo3385mo001f1ny9t1ilrqd7`
- source URL: `https://www.orlandohealth.com/-/media/files/orlando-health/medical-professionals/observership-application.pdf`
- screenshots: USCEHub OK, source FAILED (Playwright cannot
  screenshot a direct-download PDF response)
- why concerning: classifier returned `PATH_HINTS_PROGRAM` based on
  the URL path, but the screenshot pipeline cannot capture a PDF.
  Per P97 doctrine §3, institution-hosted PDF application packets
  ARE acceptable as source-of-truth. The capture-failure here is a
  tooling limitation, not a data problem.
- recommended action: **SOURCE_DEAD_REVIEW** (queued by the
  script's failure path). On admin review, this should likely be
  reclassified to **KEEP_SOURCE** with a `pdf_source_no_screenshot`
  note. A future small enhancement: detect `.pdf` URLs ahead of
  time and use Playwright's download event or a fetch+SHA256 hash
  as evidence instead of `goto` + screenshot.

## Implications for existing-listing cleanup

From the 25-row sample (sample is small; rates are indicative, not
final):

| Bucket | Count | % of sample |
| --- | --- | --- |
| `PATH_HINTS_PROGRAM` (likely keep source) | 11 | 44 % |
| `DEEP_PATH_NO_HINT` (manual review) | 7 | 28 % |
| `GENERIC_HOMEPAGE` (re-link) | 6 | 24 % |
| `LIKELY_WRONG_PAGE` (re-link) | 1 | 4 % |
| Capture failure (PDF) | 1 (overlaps PATH_HINTS_PROGRAM) | n/a |

Implications:

- **Roughly 28 %** of approved listings probably need a better
  source URL (`GENERIC_HOMEPAGE` + `LIKELY_WRONG_PAGE`). Across
  the full 304-listing directory that's ~85 listings — a real
  cleanup queue, not a handful.
- **Roughly 28 %** sit in the manual-review zone
  (`DEEP_PATH_NO_HINT`). For these the cron's HEAD probe is OK and
  the URL has a non-trivial path, but URL-only classification
  can't promote them. They need either (a) a content-keyword check
  via body fetch (deferred — would be P96-1C), or (b) a
  30-second human glance per row at the persisted screenshot.
- **Roughly 44 %** look strong on URL pattern alone. These should
  stay verified pending content-keyword confirmation.
- **Recommended pre-304-audit step:** **build a one-page admin
  re-link UI** that takes a `LIKELY_WRONG_PAGE` /
  `GENERIC_HOMEPAGE` row and lets an admin paste a replacement
  URL, triggering re-verification. Without that, manually editing
  85 rows in the admin queue is friction.

## Implications for card / detail redesign

- **Listings with `GENERIC_HOMEPAGE` source** should not display
  the same `Verified link` badge as listings with
  `PATH_HINTS_PROGRAM` source. The current 4-tier badge component
  (`Verified link`, `Official source on file`, `Source needs
  review`, `Source not yet verified`) already supports the
  demotion; it just doesn't use the content-classifier verdict yet
  because P96-1B chose to keep the public surface unchanged. A
  future PR can map `content_verdict = GENERIC_HOMEPAGE` to the
  `verified-on-file` tier on display.
- **Descriptions** that confidently state cost / duration /
  eligibility for a listing whose source is a generic homepage are
  overclaiming. Until the source supports those claims, cards
  should soften to `Cost not listed` / `Duration not listed` etc.,
  or surface a small "source under review" hint on the listing
  detail.
- **Card affordances** should expose a one-click "Suggest a better
  source URL" path (already wired via
  `/contact-admin?category=source_update` in P95-A) — promote it
  visually on listings flagged `GENERIC_HOMEPAGE` so applicants
  and coordinators can help fix the database.
- **No public copy change should ship from this report alone.**
  The classifier's verdict is internal until P96-1C wires content
  classification to the public badge tier and an admin re-link
  pass has reduced the `GENERIC_HOMEPAGE` queue to a baseline.

## Implications for P97 new discovery

- Every P97 candidate must produce the same evidence pair: an
  official-source screenshot AND a JSON sidecar with verdict +
  reason. P96-2 demonstrates this works; P97 reuses the same
  Playwright + classifier toolchain.
- The Radware bot-block on `nychealthandhospitals.org` is a real
  signal for P97: some institution sites will block automated
  probes. P97 must (a) record the bot-block in the candidate JSON
  and (b) defer to manual review rather than rejecting the lead.
  Bot-blocked hosts may still be the source of truth for a real
  program; humans can confirm.
- Direct-PDF source URLs are common (Orlando Health). The P97
  pipeline must handle PDF responses without throwing — either
  download + record SHA256 hash as evidence, or skip the
  screenshot step and write a sidecar tagged
  `evidence_format=pdf_only`.
- Generic-homepage URLs from third-party leads (the 24 % rate
  observed here) should auto-reject the lead. Per P97 doctrine §3
  the institution's program-specific page is the only acceptable
  source of truth.
- Duplicate detection in P97 should run against `Listing.websiteUrl`
  AND `Listing.sourceUrl` AND `Listing.applicationUrl`, plus a
  fuzzy title+state match, to avoid re-importing existing rows
  with cosmetically different URLs.

## Hard rules

- No DB connection.
- One request per host with a 1.2 s gap.
- 12 s per-page timeout; failures recorded, no retries.
- No login attempts. No credentialed access.
- Screenshots are local-only; the screenshots folder is gitignored.