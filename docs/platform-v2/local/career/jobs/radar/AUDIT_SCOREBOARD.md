# Visa Job Radar — Audit Scoreboard
Run: 2026-06-13-0532  |  Audited: 2026-06-13

## Overall counts
| Bucket | Count |
|--------|-------|
| PUBLISH (non-fixture) | 24 |
| SPONSOR_LEAD | 534 |
| Total surfaced (PUBLISH + SL) | 558 |
| REJECT | 92 |

## Dimension 1 — Quote accuracy (verbatim char-offset)
**✅ PASS** — 38 quotes verified, 0 mismatches

## Dimension 2 — PUBLISH denial-language leakage
**✅ PASS** — no PUBLISH job should contain an explicit denial phrase

## Dimension 3 — SPONSOR_LEAD denial-language leakage
**✅ PASS**

## Dimension 4 — Coverage per connector
| Source | PUBLISH | SPONSOR_LEAD | Total |
|--------|---------|--------------|-------|
| jibe-emory | 0 | 2 | 2 |
| jibe-maimonides | 0 | 6 | 6 |
| jsonld-umms | 2 | 35 | 37 |
| workday-adventhealth | 0 | 6 | 6 |
| workday-altamed | 0 | 24 | 24 |
| workday-brownhealth | 0 | 27 | 27 |
| workday-geisinger | 0 | 40 | 40 |
| workday-jeffersonhealth | 0 | 40 | 40 |
| workday-kumc | 0 | 11 | 11 |
| workday-mgb | 0 | 21 | 21 |
| workday-montefiore | 0 | 19 | 19 |
| workday-msk | 0 | 6 | 6 |
| workday-musc | 0 | 20 | 20 |
| workday-ochsner | 2 | 13 | 15 |
| workday-presbyterianhealthcare | 4 | 35 | 39 |
| workday-sanford | 16 | 2 | 18 |
| findly-upmc | 0 | 5 | 5 |
| atom-uky | 0 | 204 | 204 |
| workday-lvhn | 0 | 18 | 18 |

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
| Henry Ford Health | ATS unknown; Workday wd1 tenant maintenance; iCIMS probes 404; no API accessible | 7yr, 27 pos |
| WellSpan Health | Oracle HCM (joinwellspan.org marketing site; "Log into Oracle" link confirms backend) — inaccessible without SSO | 7yr, 22 pos |
| Dartmouth Health | Prolucent/LiquidCompass SPA (`careers.dartmouth-health.org`; backend `partner-tenants.ats.liquidcompass.com/dartmouth-health/`) — all API endpoints return 404 HTML | 7yr, 18 pos |

## What to fix next (priority order)

1. **Bare quotes** — CLEAN — all 22 PUBLISH quotes are RICH (H1B/J1/waiver/cap-exempt)
2. **Iron-core coverage** — probe remaining blocked employers; Emory (jibe) + KUMC (workday) added run 1648; UPMC (findly) + UK Healthcare (atom) added runs 0500/0507; LVHN (workday) added run 0532; BCH/Corewell/MetroHealth/Henry Ford/WellSpan/Dartmouth all blocked
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

13. **Brown Health Workday connector + "physician liaison" NONPHYS_TOKEN + Workday "provider" facet fix** — FIXED run 0324: Three separate issues resolved. (A) workday-brownhealth connector added (brownhealth/wd12/External_Careers). Brown Health = formerly Lifespan Health System, rebranded ~2023. EMPLOYER_ALIAS "brown health" → "lifespan physician" (7yr/48pos iron-core; no normKey collision). (B) "physician liaison" added to NONPHYS_TOKENS — Brown Health uses "Sr. Physician Liaison" title for non-MD outreach/recruitment staff; this was a false positive. (C) Workday `physicianFacetIds()` had "provider" in its match terms — Brown Health exposes an "Advanced Practice Provider" job family with `d.includes("provider")` match. The facet probe selected it (54 NP/PA/APP jobs), used it as the filter, and returned 0 real physicians — keyword fallback never activated. Fix: removed "provider" from `physicianFacetIds` matching (audited all 14 active Workday connectors; none uses a "provider" job family for physician jobs — they all fall through to keyword+isPhysician filtering or use "faculty"/"physician" facets). 27 clean SPONSOR_LEAD surfaced: physician, Physician, MG Physician, Physician PD, Staff Physician, Hospitalist, Pediatrician, Physician Gen Cardiology, Physician - Primary Care, Staff Physician Emergency Medicine, etc.
