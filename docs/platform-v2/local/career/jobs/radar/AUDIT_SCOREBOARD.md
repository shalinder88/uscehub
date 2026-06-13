# Visa Job Radar — Audit Scoreboard
Run: 2026-06-13-1610  |  Audited: 2026-06-13
Note: Full-CDN run. wd1 + wd5 CDN recovered. 23 active connectors (22 prior + jsonld-miami).
Gold: 15/15 pass. Next tier: enable 5 disabled connectors (urmc/rochestergeneral/roswellpark/ahn/bostonmedical) when ready.

## Overall counts
| Bucket | Count |
|--------|-------|
| PUBLISH (non-fixture) | 26 |
| SPONSOR_LEAD | 681 |
| Total surfaced (PUBLISH + SL) | 707 |
| REJECT | 93 |

## Dimension 1 — Quote accuracy (verbatim char-offset)
**✅ PASS** — 38 quotes verified, 0 mismatches

## Dimension 2 — PUBLISH denial-language leakage
**✅ PASS** — no PUBLISH job should contain an explicit denial phrase

## Dimension 3 — SPONSOR_LEAD denial-language leakage
**✅ PASS**

## Dimension 4 — Coverage per connector (run 2026-06-13-1610, full CDN)
| Source | PUBLISH | SPONSOR_LEAD | Total |
|--------|---------|--------------|-------|
| atom-uky | 0 | 200 | 200 |
| findly-upmc | 0 | 5 | 5 |
| jibe-emory | 0 | 2 | 2 |
| jibe-maimonides | 0 | 6 | 6 |
| jibe-osf | 1 | 39 | 40 |
| jibe-ynhhs | 0 | 3 | 3 |
| jsonld-miami | 0 | 40 | 40 |
| jsonld-umms | 1 | 38 | 39 |
| jsonld-wellstar | 2 | 37 | 39 |
| workday-adventhealth | 0 | 6 | 6 |
| workday-altamed | 0 | 24 | 24 |
| workday-brownhealth | 0 | 27 | 27 |
| workday-geisinger | 0 | 40 | 40 |
| workday-jeffersonhealth | 0 | 40 | 40 |
| workday-kumc | 0 | 11 | 11 |
| workday-lvhn | 0 | 18 | 18 |
| workday-mcw | 0 | 30 | 30 |
| workday-mgb | 0 | 21 | 21 |
| workday-montefiore | 0 | 19 | 19 |
| workday-msk | 0 | 6 | 6 |
| workday-musc | 0 | 20 | 20 |
| workday-ochsner | 2 | 13 | 15 |
| workday-presbyterianhealthcare | 4 | 35 | 39 |
| workday-sanford | 16 | 2 | 18 |

## Dimension 5 — NOT_PHYSICIAN gate false-filter scan
**✅ CLEAN** — physician-keyword titles rejected by gate

## Dimension 6 — Quote specificity
**✅ ALL RICH** — 38 rich, 0 bare

Bare = quote contains no H-1B/J-1/waiver/cap-exempt — weaker evidence.

## Dimension 7 — PUBLISH posting age
Avg age: **24.0 days**  |  Max age: **80 days**  |  Stale threshold: 120 days

## PUBLISH job inventory (non-fixture)
| Employer | Title | State | Labels | Quote |
|----------|-------|-------|--------|-------|
| Sanford Health | Physician - Orthopedic Spine Surgery | WI | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Psychiatry | WI | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Anesthesiology | WI | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Orthopedic Surgery | WI | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - General Surgery | WI | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Pulmonology & Critical Care | WI | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Radiology, Interventional | WI | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Family Medicine | WI | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Emergency Medicine | WI | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Emergency Medicine (Nights) | WI | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Ophthalmology - Retina | WI | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Medical Oncology | WI | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Obstetrics & Gynecology Laborist | WI | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Ophthalmology | WI | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Neurology - Stroke Non-Interventional | SD | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Anesthesiology (J1) | WI | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Ochsner Health | Physician - Anesthesiologist - Academic | LA | EXPLICIT_VISA_SPONSORSHIP, EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visa sponsorship"; "J1/H1B" |
| Ochsner Health | Physician - PRN Interventional Cardiology | LA | EXPLICIT_J1_WAIVER | "Open to J-1 visa" |
| Presbyterian Healthcare Services | MD - Internal Medicine - Santa Fe - St. Michaels | NM | EXPLICIT_J1_WAIVER, EXPLICIT_CAP_EXEMPT | "J1 waiver"; "Cap Exempt" |
| Presbyterian Healthcare Services | Pediatric Endocrinologist MD/DO | NM | EXPLICIT_H1B | "H1b sponsorship" |
| Presbyterian Healthcare Services | Pediatric Oncologist MD/DO - Hematology and Oncology | NM | EXPLICIT_H1B | "H1b sponsorship" |
| Presbyterian Healthcare Services | Pediatric Endocrinologist MD/DO | NM | EXPLICIT_H1B | "H1b sponsorship" |
| University of Maryland Medical System | Nephrologist - Physician | MD | EXPLICIT_J1_WAIVER | "J1 waiver" |
| University of Maryland Medical System | Gastroenterologist | MD | EXPLICIT_J1_WAIVER | "J1 waiver" |

## Known coverage gaps (iron-core employers not yet wired)
These are DOL 7-year iron-core sponsors with no active connector:

| Employer | Reason blocked | Action |
|----------|----------------|--------|
| Northwell Health | WordPress custom portal — no ATS API | Need iCIMS or direct API |
| NYC Health + Hospitals | Bot-block / perfdrive CDN (HTTP 403) | No bypass — revisit |
| BronxCare Health System | Connection refused | No bypass |
| MedStar Health | Connection refused | No bypass |
| Hartford HealthCare | Connection refused | No bypass |
| Cleveland Clinic Foundation | Workday confirmed (ccf.wd1/ClevelandClinicCareers) BUT keyword "physician" returns 0 physician titles (matches descriptions only); actual titles use specialty names (radiologist 75, surgeon 110, attending 15, cardiologist 9); no physician job-family facets exposed; multi-keyword search needed — architectural blocker | Need multi-keyword connector variant |
| OHSU | iCIMS sitemap 403 | No bypass |
| Mount Sinai | Taleo SSO-gated | No bypass |
| UT Southwestern | Taleo SSO-gated | No bypass |
| Mayo Clinic | TalentBrew SPA — no sitemap API | No bypass |
| Johns Hopkins | HTTP 403 | No bypass |
| UAB Medicine | uabmedicine.icims.com SSO-gated (redirects to login) | No bypass |
| Froedtert Health | Infor CloudSuite 403 | No bypass |
| Mercy Health | careers.mercy.com has no MD/DO attending jobs (only support staff) | Disabled — revisit if physician portal added |
| Vanderbilt University Medical Center | vumccareers Workday portal has no attending/faculty physician postings (244 keyword hits = NP/PA + support staff only) | Disabled — VUMC physician faculty likely recruited via Vanderbilt University academic HR |
| Boston Children's Hospital | Phenom People SPA (`jobs.bostonchildrens.org`, `_XC_CONFIG={org:"bostonchildrens"}`) — no public JSON API | No bypass |
| Corewell Health | Phenom People SPA (careers.corewellhealth.org) — no public JSON API | No bypass |
| MetroHealth | Infor CloudSuite SPA — no accessible API | No bypass |
| Henry Ford Health | Infor CloudSuite HCM (confirmed 2026-06-13 from page source, same architecture as MetroHealth) — no accessible API | 7yr, 71 pos |
| WellSpan Health | Oracle HCM (joinwellspan.org marketing site; "Log into Oracle" link confirms backend) — inaccessible without SSO | 7yr, 22 pos |
| Dartmouth Health | Prolucent/LiquidCompass SPA (`careers.dartmouth-health.org`; backend `partner-tenants.ats.liquidcompass.com/dartmouth-health/`) — all API endpoints return 404 HTML | 7yr, 18 pos |
| University of Florida / UF Health | Jibe portal `jobs.ufhealth.org` confirmed — default keyword=physician pins non-physician results at every offset; zero MD/DO attending jobs in first 100 unique results. UF faculty likely on separate UF academic HR portal. | 6yr, 90 pos |
| Guthrie Medical Group | Oracle Fusion HCM (`fa-ext.us.oracle.com` in page source at careers.guthrie.org) — inaccessible without SSO; same architecture as WellSpan | 7yr, 34 pos |
| Bassett Healthcare Network | Custom KontactIntelligence HTML portal (`careers.bassett.org`; no JSON API; all API-like endpoints return same HTML; physician jobs listed as anchor links on home page) | 7yr, 34 pos |
| URMC / University of Rochester | **In registry** as `workday-urmc` (handle `rochester/wd5/UR_Staff`), DISABLED pending wd5 CDN recovery. Handle confirmed from urmc.rochester.edu page source. Also covers Unity Hospital of Rochester (7yr/24pos). | 6yr, 35 pos |
| Baystate Health | Workday confirmed (`baystatehealthjobs.com`); Workday CDN degraded 2026-06-13 — retry when Workday recovers | 7yr, 49 pos |
| UW Medicine | Workday confirmed (uwmedicine.org/jobs page source); Workday CDN degraded 2026-06-13 — retry when Workday recovers | 7yr, 33 pos |
| Advocate Aurora Health | Workday confirmed (`careers.aah.org`); Workday CDN degraded 2026-06-13 — retry. Aurora Medical Group (WI) 7yr/33pos DOL entity. | 7yr, 33 pos |
| Eastern Maine Medical Center / MaineHealth | Infor CloudSuite (mainehealth.org/careers-job-opportunities) — same architecture as MetroHealth | 7yr, 48 pos |
| UVM Health Network Medical Group | Infor CloudSuite (`uvmhealthcareers.org`) — same architecture as MetroHealth | 7yr, 34 pos |
| University of Utah Health | Infor CloudSuite (`employment.utah.edu/organization/university-of-utah-health`) — same architecture as MetroHealth | 5yr, 41 pos |
| NYU Langone / NYU Grossman School of Medicine | Infor CloudSuite (nyulangone.org/careers redirect) — same architecture as MetroHealth | 6yr, 37 pos |
| VCU Health System Authority | Phenom People SPA (`careers.vcuhealth.org/us/en`) — same architecture as BCH/Corewell | 6yr, 36 pos |
| USA Healthcare Management (Univ South Alabama Health) | Jibe portal `careers.usahealthsystem.com` confirmed — severely pinned (same 10 results at all offsets); no Physicians tag (tags=Physicians returns 0); physician keyword returns non-physician support staff with specialty names in dept context | 7yr, 37 pos |
| Rochester General Hospital (RRHS) | **In registry** as `workday-rochestergeneral` (handle `rrhs/wd5/RRH`), DISABLED pending wd5 CDN recovery. Handle confirmed from careers.rochesterregional.org page source. Also covers Rochester Regional Health System umbrella. | 7yr, 110 pos |
| MedStar Health | **In registry** as `jibe-medstar` (DISABLED). Jibe portal `careers.medstarhealth.org` confirmed but severely pinned — 1067 results at all keywords, same first title on all pages; only 2 unique physician-titled jobs found (both duplicated across pages). No tags=Physicians category. MedStar Medical Group (7yr/60pos) + MedStar Georgetown (7yr/55pos). | 7yr, 115 pos combined |
| Northwell Health | Phenom People SPA (`jobs.northwell.edu`, `_xc_config` confirmed 2026-06-13) — same architecture as BCH/Corewell/VCU Health | 7yr, 121 pos |
| Mayo Clinic | Infor CloudSuite HCM (jobs.mayoclinic.org, confirmed 2026-06-13) — same architecture as MetroHealth | 7yr, 249 pos |
| Indiana University Health Care Associates | Infor CloudSuite HCM (jobs.iuhealth.org, confirmed 2026-06-13) — same architecture as MetroHealth | 5yr, 106 pos |
| SUNY Upstate Medical University | Infor CloudSuite HCM (careers.upstate.edu, confirmed 2026-06-13) — same architecture as MetroHealth | 6yr, 64 pos |
| UAB Medicine | iCIMS native portal (careers.uabmedicine.org/us/en → careers-uabmedicine.icims.com); non-Jibe iCIMS requires SSO | 7yr, 93 pos |
| OHSU | Jibe portal confirmed (jobs.ohsu.edu) but severely pinned — 533 results at keyword=physician, same APP/NP title repeats across all pages; only 1 unique genuine physician title (Faculty Physician BMT, duplicated). tags=Physicians=0. | 7yr, 57 pos |
| Banner University Medical Group | Workday wd1 tenant `banner` confirmed (422 from CXS, not 404). Site path unverified due to CDN degradation — enable when wd1 recovers and site path confirmed. | 7yr, 60+44=104 pos combined |
| Baystate Medical Practices | Workday wd1 tenant `baystatehealth` confirmed (422 from CXS, not 404). Site path unverified due to CDN degradation. | 7yr, 49 pos |
| Boston Medical Center | **In registry** as `workday-bostonmedical` (handle `bmc/wd1/BMC`), DISABLED pending wd1 CDN recovery. Handle confirmed 2026-06-13 from careers.bmc.org page source (bmc.wd1.myworkdayjobs.com/en-US/BMC). Safety-net academic medical center, Boston MA. | 7yr, 24 pos |
| Roswell Park Cancer Institute | **In registry** as `workday-roswellpark` (handle `roswellpark/wd5/ExternalCareers`), DISABLED pending wd5 CDN recovery. Handle confirmed 2026-06-13 from roswellpark.org/careers page source. NY state cancer center, Buffalo NY. | 7yr, 45 pos |
| Penn Medicine / UPHS | Workday wd1 tenant `uphs` confirmed (browse URL returns 500 WD error page, NOT 404 — tenant exists). Site path unverified: `uphs/wd1/External` and `uphs/wd1/UPHS` both return 500. CDN degraded — re-probe when wd1 recovers. DOL entity: University of Pennsylvania Health System. | 6yr, 45+ pos est |
| Allegheny Health Network (AHN) | **In registry** as `workday-ahn` (handle `highmarkhealth/wd1/highmark`), DISABLED pending wd1 CDN recovery. Handle confirmed 2026-06-13 from ahn.org/careers redirect to careers.highmarkhealth.org (Highmark Health parent). EMPLOYER_ALIAS added: "allegheny health network" → "allegheny clinic". | 7yr, 31 pos |
| Medical College of Wisconsin / Froedtert | **ACTIVE** as `workday-mcw` (wd503, LIVE). 31 SPONSOR_LEAD confirmed run 0725. wd503 is a new functional Workday DC. Also covers MCW Affiliated Hospitals (7yr/21pos) via same portal. | 6yr, 39 pos |
| USACS Medical Group | ATS is Herefish (physician recruitment CRM) + usacs.com/api/v2/careers (self-hosted). iCIMS portal (usacs.icims.com) is decommissioned (410 Gone). Workday tenant `usacs` exists on wd12/wd108 but is back-office HR only; physician recruiting is NOT on Workday. NOT WIREBLE. | 7yr, 91 pos |
| Sound Physicians | TalentBrew SPA (tbcdn.talentbrew.com confirmed from careers.soundphysicians.com 2026-06-13) — same architecture as Mayo Clinic. No public JSON API. NOT WIREBLE. | 7yr, 38+ pos combined |
| Children's National Medical Center | Workday tenant `childrensnational` confirmed on wd5, wd12 (422). Site path unverified (tried: External, Public_Careers, CNMC, CNMCCareers, ChildrensNational, PublicCareers). Static careers page doesn't expose Workday URL. Re-probe when CDN stabilizes. | 7yr, 28 pos |
| PAGNY (Physician Affiliate Group of NY) | Custom CMS job board at pagny.org/careers/specialties/[specialty] — no standard JSON API. No Workday/Jibe/iCIMS ATS markers. Specialty pages are static or server-rendered HTML with embedded job listings. No accessible connector path. NYC H+H physician staffing org. | 6yr, 66 pos |
| NYC Health + Hospitals | Radware WAF bot-block on nychealthandhospitals.org (HTTP 403 → perfdrive.com CAPTCHA). jobs.nychealthandhospitals.org returns Chrome SSL error. cityjobs.nyc.gov dataset (DCAS "Jobs NYC Postings") only covers City agencies, NOT H+H (public benefit corporation). No accessible path. | 7yr, 132+ pos |
| BronxCare Health System | TIMEOUT on bronxcare.org/careers (heavy page). Likely Infor CloudSuite or custom ATS. Re-probe with Chrome MCP when needed. | 7yr, 118 pos |
| One Brooklyn Health / Brookdale Hospital | Jibe portal at careers.onebrooklynhealth.org confirmed — severely pinned (183 results at all keywords; first titles are RN/admin). tags=Physicians=0. Workday tenant `brookdalehospital` also confirmed on wd12 (422, site path unknown). | 7yr, 162 pos |
| INTEGRIS Health | Oracle HCM (`ertr.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_3001`, confirmed 2026-06-13 via Chrome MCP). Pure SPA — no JSON-LD served server-side (og:meta only). 479 total jobs, ~52 physician openings on the site UI. Sitemap public at `/sitemaps/jobpostings` (479 numeric-ID-only URLs, no title slugs — no server-side filter possible). Individual job pages return og:title + 80-char og:description only; no structured fields. Not wireble with current connector types. Workday tenant `integris` on wd12 likely back-office HR only (same pattern as USACS). NOT WIREBLE. | 7yr, 30 pos |
| CHI Health / Alegent Creighton Clinic | Physician recruiting via CommonSpirit Health provider portal (`providers.commonspirit.careers`, confirmed 2026-06-13). ATS = TalentBrew SPA (tbcdn.talentbrew.com, company 35300) + iCIMS backend (`providers-commonspirit.icims.com`). 868 system-wide positions across all CommonSpirit ministries (CHI NE/IA is subset). TalentBrew API 404 on all known endpoints. NOT WIREBLE — same architecture as Sound Physicians + Mayo Clinic. Workday tenant `chihealth` on wd12 likely back-office HR only. NOT WIREBLE. | 7yr, 29 pos |
| University of Miami / UHealth | **WIRED 2026-06-13** as `jsonld-miami`. Phenom-hosted ATS (`careers.miami.edu`, tenant UOMUOMUS). Sitemap at `careers.miami.edu/sitemap.xml` → sitemapindex with 4 sub-sitemaps (2013 total job URLs, ~380 physician-slug pre-filter). Individual job pages serve `@type:JobPosting` JSON-LD server-side to pipeline UA (same as Wellstar). EMPLOYER_ALIAS `"uomuomus"→"university of miami"` added. DOL 7yr/36pos; occupationalCategory=`Faculty & Physicians`. Backend ATS is Workday (umiami tenant per job description). | 7yr, 36 pos |
| VIDANT Medical Group / ECU Health | Phenom People SPA (`careers.ecuhealth.org/us/en`, confirmed 2026-06-13 — Vidant rebranded to ECU Health). Flat sitemap (168KB, 379 URLs) contains informational CMS pages only, no `/job/` URLs. Actual job data served via Phenom client-side JS only. NOT wireble. | 7yr, 32 pos |
| VCU Health System | Phenom-hosted (`careers.vcuhealth.org/us/en`). Flat sitemap (103KB) has 335 job URLs (e.g. `/us/en/job/R42363/...`) but no physician-title slugs — all titles are RN, coordinator, technician, support staff. Physician jobs either have non-physician slugs or are not posted on this portal. NOT wireble via slug filter. | 6yr, 36 pos |
| Piedmont Healthcare | iCIMS backend (`employees-piedmont.icims.com` — employee/SSO portal) + Appcast CPC WordPress overlay at `piedmontcareers.org`. Physician physician search at `piedmontcareers.org/careers/physicians-app/` uses `refreshJobs()` JS function with iCIMS Appcast integration; no public REST API accessible. NOT wireble. | 7yr, 37 pos (Piedmont Athens) |
| PeaceHealth | Talemetry career site (`careers.peacehealth.org/pack/talemetry_careersites/`) with Jobvite backend (`apply.app.jobvite.com`). Public `/api/jobs` endpoint exists but Cloudflare managed challenge blocks all non-browser UAs. RSS/sitemap return 403. Jobvite API key `Ltrd3Uxsy0nzWT8kGrIIGc` embedded in config but `api.jobvite.com` returns 401 (API key = write key, not public read). NOT wireble. | 7yr, 27 pos |

## What to fix next (priority order)

1. **Bare quotes** — CLEAN — all 22 PUBLISH quotes are RICH (H1B/J1/waiver/cap-exempt)
2. **Iron-core coverage** — probe remaining blocked employers; Emory (jibe) + KUMC (workday) added run 1648; UPMC (findly) + UK Healthcare (atom) added runs 0500/0507; LVHN (workday) added run 0532; YNHHS (jibe-ynhhs) +3 SL added; OSF HealthCare (jibe-osf, tags=Physicians filter) +39 SL added run 0631; BCH/Corewell/MetroHealth/Henry Ford/WellSpan/Dartmouth all blocked; OSF now FIXED via Jibe public API
3. **iCIMS / Jibe portals** — UAB Medicine iCIMS is SSO-gated; Maimonides portal unknown; OHSU iCIMS 403; no bypass for any
4. **State distribution** — current PUBLISH is WI/NM/MD/LA/GA; TX/CA/FL/IL/NY under-represented; blocked by bot-protection on major NY/TX employers
5. **Stanford Health Care** — FIXED: alias "stanford health care" → "leland stanford jr university" (6yr/44pos DOL) added; 3 prior Stanford keyword-match results were isPhysician false positives (NP/PA, Nursing Professional, Quality Consultant) — also fixed via new NONPHYS_TOKENS. Real physician postings will promote to SPONSOR_LEAD when they appear.
6. **Jefferson Health** — FIXED run 1759: "thomas jefferson university hospitals" (ATS, plural) → "thomas jefferson university hospital" (DOL, singular, 4yr/28pos) alias added. Prior analysis incorrectly concluded 0 DOL positions; entity exists under singular form. 40 physician jobs promoted from NO_VISA_MENTION → SPONSOR_LEAD.
7. **UAMS denial watch** — UAMS is iron-core (7yr, 52 pos). Raw text shows sidebar key-value: "Sponsorship Available:         No   Institution Name:" (extra whitespace = HTML-stripped Workday table row, NOT free-text body copy). Workday defaults this field to "No" when HR hasn't explicitly set it. Human verification required; correctly held SPONSORSHIP_DENIED until confirmed.
8. **UMMS quality gate** — FIXED run 1747: sponsorEnrich gate now uses recentYearPositions ?? totalPositions (mirrors sponsorScore). SPONSOR_DATA had UMMS at p=2 (stale static snapshot); persistence shows recentYearPositions=5, yearsActive=5 — gate now passes. 39 UMMS physician jobs promoted from NO_VISA_MENTION → SPONSOR_LEAD.
9. **Mercy Health** — DISABLED run 1814: careers.mercy.com posts no MD/DO attending jobs. Full sitemap scan (1,163 URLs) found zero physician attending titles; every "physician" URL slug is support staff or a department name. DOL iron-core (7yr/138pos) is real but this ATS surface doesn't carry physician openings.
10. **VUMC false SPONSOR_LEAD + disable** — FIXED run 1829: "Pediatric Cardiac Sonographer II" was classified as physician (false positive on "pediatric" PHYS token). Root cause: "sonographer" missing from NONPHYS_TOKENS. Fixed in engine.ts. Separately: full scan shows vumccareers Workday has no attending/faculty physician postings (244 keyword hits = NP/PA + support staff); connector disabled. DOL iron-core (7yr) — VUMC physician faculty likely recruited via Vanderbilt University academic HR portal.
11. **AdventHealth Workday connector + batch NONPHYS hardening** — FIXED run 1943: workday-adventhealth connector added (adventhealth/wd12/AH_External_Career_Site). EMPLOYER_ALIAS "adventhealth"→"adventist health system sunbelt" (6yr/107pos). Five NONPHYS_TOKENS additions from scan: "arnp" (Cardiology ARNP = ARNP variant of APRN not caught by "aprn" substring), "app " (APP prefix = Advanced Practice Provider roles like "APP Hospitalist"), "physician relations" (Sr Physician Relations Specialist), "coder" (Physician Enterprise Coder — "physician coder" substring misses when "enterprise" intervenes), "physician informatics" (Physician Informatics Advocate — non-MD informaticist). D5 overrides updated. 6 clean SPONSOR_LEAD: OBGYN Physician, OB Hospitalist, Lead Hospitalist, Hematology Oncology Physician, Primary Care Physician, Physician Advisor.

12. **Mass General Brigham Workday connector + "physican" PHYS_TOKEN** — FIXED run 0217: workday-mgb connector added (massgeneralbrigham/wd1/MGBExternal). 6yr/73pos iron-core; direct DOL normKey match ("mass general brigham"), no alias needed. "physican" (missing 'i') added to PHYS_TOKENS — MGB consistently uses this typo in ATS job titles (e.g. "Physican Urology", "Physican-Pediatrics"); 8-char substring ≠ 9-char "physician", so these were being silently dropped. 21 clean SPONSOR_LEAD surfaced (Physician Scientist, Physician Internal Medicine, Physician Urology, Infectious Disease Physician, Physican-Pediatrics, and 16 more attending-level roles). No new false-positives found in MGB sample.

14. **Maimonides Jibe connector + raw sourceId dedup fix + "nursing" NONPHYS_TOKEN** — FIXED run 0421: Three issues. (A) jibe-maimonides connector added (careers.maimo.org/api/jobs). Maimonides Medical Center 7yr/191pos iron-core; normKey "maimonides medical center" matches persistence_index directly — no alias. Jibe confirmed (cid:"maimo", jasession cookie, JSON content-type). 6 clean SPONSOR_LEAD: Director of Radiation Oncology, Psychiatrist, Attending Physician-Pediatric Endocrinology, Physician, Unit Director Psychiatry, Assistant Vice President of Psychiatry. (B) Raw sourceId dedup added to run.ts (line ~504): Jibe (and similar connectors) can return the same physician-titled job at offset=0 AND offset=100 due to API pinning. The canonical dedupe() pass skips REJECT-bucket jobs; since NO_VISA_MENTION jobs start as REJECT before sponsorEnrich() promotes them, both occurrences survived dedup and were double-promoted. Fix: first-wins by sourceId on raw candidates before buildRadarJobs(). (C) "nursing" NONPHYS_TOKEN added — "Asst Director Nursing" false-positived on "pediatric" PHYS match; "nurse" substring ≠ "nursing" (pos-4 char differs), so "nurse" token didn't catch it. ALSO: Emory (jibe-emory) dropped from 38→2 this run — NOT a regression; 36 Emory physician positions from run 0324 naturally closed (verified live: careers.emory.edu/api/jobs still 200/1852 results, but physician-titled jobs reduced to Spine Physician + General Urologist).

15. **UPMC Findly/Google CTS connector** — FIXED run 0500: `findly-upmc` connector added using new `fetchFindly()` function. UPMC careers front-end is Findly CWS (Ceridian/Dayforce), backed by Google Cloud Talent Solution (CTS). Public JSONP endpoint at `jobsapi-google.m-cloud.io/api/job/search`; company ID `companies/4c0b87d3-a9b3-4243-b9c7-2ad12c533ab3` sourced from `cws_opts.org_id` in page JS; `customAttributeFilter=primary_category="Physicians"` narrows server-side to ~7 jobs. JSONP response stripped by slicing `{`…`}`. DOL iron-core 7yr/89pos; normKey "university of pittsburgh physicians" = direct match. 5 clean SPONSOR_LEAD: Transplant Nephrologist, Pediatric Neurologist, Family Medicine Physician, Molecular Genomic Pathologist, Hospitalist. Medical Director and Certified Nurse Midwife correctly rejected (no PHYS_TOKEN / NONPHYS_TOKEN "nurse"). Underlying ATS is Taleo — Findly only surfaces jobs explicitly categorized as "Physicians" so full UPMC volume may be higher.

16. **University of Kentucky PeopleAdmin Atom connector** — FIXED run 0507: `atom-uky` connector added using new `fetchAtom()` function. ATS is PeopleAdmin at `ukjobs.uky.edu`; `/postings/all_jobs.atom` returns all 805 open positions (no auth, no pagination cap). XML parsed with `fast-xml-parser`; full HTML job descriptions in `<content>` element stripped via `stripHtml()` before isPhysician() filtering. DOL iron-core 7yr/48pos; normKey "university of kentucky" = direct match. 204 physician candidates → all SPONSOR_LEAD (no explicit visa language in ATS postings). Two J-1 explicit jobs confirmed in feed (Pediatric Radiologist, Vascular & Interventional Radiologist).

17. **Lehigh Valley Health Network Workday connector** — FIXED run 0532: `workday-lvhn` connector added (`lvhn.wd1.myworkdayjobs.com/LVHN`). Workday CXS API (`wday/cxs/lvhn/wd1/LVHN/jobs`), confirmed via curl 200 (715 total physician-keyword results). No jobFamilyGroup facets exposed (8 facets, all empty value strings) → keyword+isPhysician fallback. DOL iron-core 7yr/33pos FY2025; source.employer="Lehigh Valley Hospital" → normKey "lehigh valley hospital" = direct persistence_index match (DOL legal name "Lehigh Valley Hospital INC."; "inc" stripped by normEmployer). All 18 candidates are clean attending physician titles (Endocrinologist, Gastroenterologist, Family Medicine Physician x10, Hospice Medicine Physician, Sports Medicine Physician, Occupational Medicine Physician, Physiatry, Pediatric Sleep Medicine). PA-based (Allentown, Stroudsburg, Hazleton service area). Zero false positives confirmed.

18. **Yale New Haven Health System Jibe connector + 6 NONPHYS_TOKEN fixes** — FIXED runs post-0532: `jibe-ynhhs` connector added (`jobs.ynhhs.org/api/jobs`). YNHHS is 7yr/62pos iron-core DOL sponsor. ATS = Jibe (iCIMS wrapper; ng-app="jibeapply" confirmed). careers.ynhh.org has expired SSL; jobs.ynhhs.org is the accessible public API. Default keyword=physician returns pinned top results; only 3 genuine physician titles across all offsets (OBGYN Physician, OB/GYN Per Diem Greenwich, Hospice Physician). source.employer="Yale-New Haven Hospital" → normKey "yale new haven hospital" = direct persistence_index match. 6 NONPHYS_TOKENS added to fix false positives from YNHHS Jibe scan: " lpc " (Licensed Professional Counselor), " lmsw " (Licensed Master Social Worker), " mgr " (Manager abbreviation), "radiology tech" (Radiology Tech abbreviated), "polysomnograph" (Polysomnographic Tech), " huc " (Health Unit Coordinator). All 6 also added to audit.ts NOT_PHYSICIAN_OVERRIDES. Gold self-check still 15/15 after additions. Net: 3 clean SPONSOR_LEAD per run (CT-based; Yale YSM academic faculty recruited separately).

20. **New disabled connectors + probe sweep (2026-06-13)**: Six new disabled entries added to registry: `workday-urmc` (rochester/wd5/UR_Staff, 35pos + Unity Hospital 24pos), `workday-rochestergeneral` (rrhs/wd5/RRH, 110pos), `workday-roswellpark` (roswellpark/wd5/ExternalCareers, 45pos), `workday-bostonmedical` (bmc/wd1/BMC, 24pos), `jibe-ufhealth` (pinned, 90pos), `jibe-medstar` (pinned, 115pos combined). All four Workday entries disabled pending CDN recovery; Jibe entries disabled (pinned, no physician category). Penn Medicine (`uphs/wd1`) tenant confirmed — site path unverified pending wd1 recovery. Broad iron-core ATS sweep (25+ employers): Mayo/Henry Ford/IU Health/SUNY Upstate/Northwell/UAB all blocked (Infor/Phenom/iCIMS); OHSU/MedStar Jibe portals pinned; Oracle HCM blocks Guthrie/WellSpan/Mount Sinai; no new enabled connectors added this sweep.

22. **Wellstar Medical Group Phenom JSON-LD connector + "5000" prefix alias** — FIXED run 0806: `jsonld-wellstar` connector added (`careers.wellstar.org`, Phenom tenant WHWWHSUS). Sitemap enumeration fallback; sitemap_index.xml → 3 sub-sitemaps (sitemap2.xml: 384 jobs, sitemap3.xml: 86 jobs, ~66 physician-slug matches). Root cause of sponsorEnrich miss: Phenom sets `hiringOrganization.name = "5000 Wellstar Medical Group, LLC"` (cost-center prefix). `normEmployer` strips "llc" and "group" (both CORP_SUFFIXES) but not "5000" → produces "5000 wellstar medical" ≠ PI normKey "wellstar medical". Fixed with `EMPLOYER_ALIAS "5000 wellstar medical" → "wellstar medical"` in sponsor-universe.ts. Run results: 37 SPONSOR_LEAD + 2 PUBLISH (39 total). GA-based regional health system. Expected 37–39 SPONSOR_LEAD per run. Total pipeline SL: 416 (degraded run) / 645 (expected full Workday recovery). ATS probe sweep 2026-06-13: USACS = Herefish physician CRM + internal API (not Workday-facing); Cook County Health = Taleo classic; INTEGRIS = Cloudflare 403; CHI Health = wd12 tenant confirmed but site path unresolved (SPA); Sound Physicians = TalentBrew SPA; BronxCare = timeout; NYC H+H = Radware WAF bot-block; PAGNY = custom CMS; One Brooklyn = Jibe pinned (confirmed prior); NYU Grossman/MetroHealth/St. Barnabas = all ERR/ECONNREFUSED.

21. **Medical College of Wisconsin Workday connector (wd503)** — FIXED run 0725: `workday-mcw` connector added (`mcw/wd503/ExternalCareers`). MCW = academic AMC in Milwaukee, WI; part of Froedtert & the Medical College of Wisconsin Health Network (Froedtert itself is blocked via Infor CloudSuite). New Workday DC `wd503` discovered and confirmed functional (HTTP 200 JSON). DOL iron-core: 'medical college of wisconsin' 6yr/39pos FY2025 = direct normKey match; also covers 'medical college of wisconsin affiliated hospitals' 7yr/21pos under same portal. jobFamilyGroup facets: Faculty (165 jobs) selected by physicianFacetIds() via d.includes('faculty'). Run results: 31 SPONSOR_LEAD, 0 false positives, 0 rejected — all physician faculty titles (Glaucoma Specialist, Cardiothoracic Surgeon, Cardiologist, Gastroenterologist, Endocrinologist, Orthopedic Surgeon, Pediatric Pathologist, Oncologist, etc.). WI-based; many positions at Froedtert-MCW hospital network sites (Froedtert campus + community sites). Expected SPONSOR_LEAD: 30-35 per run.

23. **University of Miami Phenom JSON-LD connector + UOMUOMUS alias + probe sweep 2026-06-13 (session 2)** — FIXED: `jsonld-miami` connector added (`careers.miami.edu`, Phenom tenant UOMUOMUS). sitemapindex with 4 sub-sitemaps (~380 physician-slug matches pre-filter, JSONLD_MAX_POSTINGS=40 cap). JSON-LD `@type:JobPosting` confirmed server-side for bot UA (same mechanism as Wellstar). EMPLOYER_ALIAS `"uomuomus"→"university of miami"` required (Phenom sets `hiringOrganization.name` to internal org code). DOL 7yr/36pos iron-core FL. Probe sweep findings: INTEGRIS = Oracle HCM (`ertr.fa.us2.oraclecloud.com`, sitemap 479 jobs, no JSON-LD server-side, NOT wireble); CHI Health physician portal = TalentBrew SPA + iCIMS backend via CommonSpirit providers.commonspirit.careers (868 system-wide, no public API, NOT wireble); Piedmont Healthcare = iCIMS + Appcast CPC WordPress overlay, NOT wireble; PeaceHealth = Talemetry/Jobvite with Cloudflare bot-block, NOT wireble; Northeast Medical Group = YNHHS subsidiary via jibe-ynhhs (severely pinned, no separate fix); VCU Health = Phenom-hosted flat sitemap but no physician-slug job titles posted; ECU Health = Phenom-hosted flat sitemap, CMS pages only (no `/job/` URLs); University of Miami = WIREBLE (this item). **Key ATS architecture insight**: Northwell/BCH Phenom are WordPress embeds (client-side SPA widget, no bot JSON-LD); Wellstar/Miami Phenom are Phenom-hosted platforms (server-side JSON-LD served to bots). The hosting model — not the ATS — determines wireability.

19. **OSF HealthCare Jibe connector (tags=Physicians filter)** — FIXED run 0631: `jibe-osf` connector added (`osfcareers.org/api/jobs?keyword=&tags=Physicians`). OSF Multi-Specialty Group 7yr/69pos iron-core (also OSF Healthcare System 6yr/29pos). ATS = Jibe (iCIMS wrapper; ng-app="jibeapply"; client_code="osfhealthcare"). Discovery: default keyword=physician search returns all-staff pinned results (same RN/CNA results at every offset — Jibe pin behavior). Key insight: Jibe API accepts `tags=Physicians` filter parameter that routes to the Physicians category directly. Added optional `query` parameter to `fetchJibe()` (default "keyword=physician") and `jibeQuery` field to `SourceDef` to support per-connector query overrides. totalCount=194 physician-tagged; pagination pins at offset=100 → 40 accessible per run (JIBE_MAX_PHYSICIAN cap). source.employer="OSF Multi-Specialty Group" → normKey "osf multi-specialty group" = direct persistence_index match (no alias). All 40 titles verified clean: Neurohospitalist, Psychiatry Physician, Otolaryngology Physician, Headache Neurologist, PRN Interventional/Telehealth Cardiologist, PRN Radiation Oncologist, Vascular/Breast/General/Colorectal Surgeon, Allergy/Asthma/Immunology Physician, Occupational Medicine, Neurocritical Care, Family Medicine/Primary Care (IL), Internal Medicine (IL), Hematology/Oncology, Emergency Medicine Nocturnist, Pulmonary Critical Care, UICOMP-Peoria academic faculty (Pediatrics, Ophthalmology, Pulmonology, Nephrology), and more. IL-based system (Peoria, Rockford, Bloomington, Galesburg, Ottawa). "Physician Informatics Specialist" correctly rejected by "physician informatics" NONPHYS token. "Attending Hospital Dentist" does not trigger isPhysician() — "attending" is not a PHYS_TOKEN. Zero false positives. Net: 39 SPONSOR_LEAD per run (1 raw dedup dropped). Previously listed in Known Gaps as "iCIMS SPA-blocked" — the osfhealthcare.icims.com portal requires SSO, but the Jibe public API at osfcareers.org is accessible without auth.

13. **Brown Health Workday connector + "physician liaison" NONPHYS_TOKEN + Workday "provider" facet fix** — FIXED run 0324: Three separate issues resolved. (A) workday-brownhealth connector added (brownhealth/wd12/External_Careers). Brown Health = formerly Lifespan Health System, rebranded ~2023. EMPLOYER_ALIAS "brown health" → "lifespan physician" (7yr/48pos iron-core; no normKey collision). (B) "physician liaison" added to NONPHYS_TOKENS — Brown Health uses "Sr. Physician Liaison" title for non-MD outreach/recruitment staff; this was a false positive. (C) Workday `physicianFacetIds()` had "provider" in its match terms — Brown Health exposes an "Advanced Practice Provider" job family with `d.includes("provider")` match. The facet probe selected it (54 NP/PA/APP jobs), used it as the filter, and returned 0 real physicians — keyword fallback never activated. Fix: removed "provider" from `physicianFacetIds` matching (audited all 14 active Workday connectors; none uses a "provider" job family for physician jobs — they all fall through to keyword+isPhysician filtering or use "faculty"/"physician" facets). 27 clean SPONSOR_LEAD surfaced: physician, Physician, MG Physician, Physician PD, Staff Physician, Hospitalist, Pediatrician, Physician Gen Cardiology, Physician - Primary Care, Staff Physician Emergency Medicine, etc.
