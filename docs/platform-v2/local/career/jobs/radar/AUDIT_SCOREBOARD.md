# Visa Job Radar — Audit Scoreboard
Run: 2026-06-12-1906  |  Audited: 2026-06-12

## Overall counts
| Bucket | Count |
|--------|-------|
| PUBLISH (non-fixture) | 16 |
| SPONSOR_LEAD | 249 |
| Total surfaced (PUBLISH + SL) | 265 |
| REJECT | 86 |

## Dimension 1 — Quote accuracy (verbatim char-offset)
**✅ PASS** — 22 quotes verified, 0 mismatches

## Dimension 2 — PUBLISH denial-language leakage
**✅ PASS** — no PUBLISH job should contain an explicit denial phrase

## Dimension 3 — SPONSOR_LEAD denial-language leakage
**✅ PASS**

## Dimension 4 — Coverage per connector
| Source | PUBLISH | SPONSOR_LEAD | Total |
|--------|---------|--------------|-------|
| jibe-emory | 0 | 38 | 38 |
| jsonld-umms | 3 | 36 | 39 |
| workday-altamed | 0 | 24 | 24 |
| workday-geisinger | 0 | 40 | 40 |
| workday-jeffersonhealth | 0 | 40 | 40 |
| workday-kumc | 0 | 11 | 11 |
| workday-montefiore | 0 | 14 | 14 |
| workday-msk | 0 | 6 | 6 |
| workday-ochsner | 2 | 13 | 15 |
| workday-presbyterianhealthcare | 4 | 27 | 31 |
| workday-sanford | 7 | 0 | 7 |

## Dimension 5 — NOT_PHYSICIAN gate false-filter scan
**✅ CLEAN** — physician-keyword titles rejected by gate

## Dimension 6 — Quote specificity
**✅ ALL RICH** — 22 rich, 0 bare

Bare = quote contains no H-1B/J-1/waiver/cap-exempt — weaker evidence.

## Dimension 7 — PUBLISH posting age
Avg age: **25.1 days**  |  Max age: **80 days**  |  Stale threshold: 120 days

## PUBLISH job inventory (non-fixture)
| Employer | Title | State | Age | Labels | Quote |
|----------|-------|-------|-----|--------|-------|
| Sanford Health | Physician - Psychiatry | WI | 1d | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Anesthesiology | WI | 2d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Orthopedic Surgery | WI | 5d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - General Surgery | WI | 5d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Pulmonology & Critical Care | WI | 12d | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Radiology, Interventional | WI | 16d | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Sanford Health | Physician - Family Medicine | WI | 17d | EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visas Accepted H1B"; "H1B or J1" |
| Ochsner Health | Physician - Anesthesiologist - Academic | ? | 2d | EXPLICIT_VISA_SPONSORSHIP, EXPLICIT_H1B, EXPLICIT_J1_WAIVER | "Visa sponsorship"; "J1/H1B" |
| Ochsner Health | Physician - PRN Interventional Cardiology | ? | 9d | EXPLICIT_J1_WAIVER | "Open to J-1 visa" |
| Presbyterian Healthcare Services | MD - Internal Medicine - Santa Fe - St. Michaels | ? | 38d | EXPLICIT_J1_WAIVER, EXPLICIT_CAP_EXEMPT | "J1 waiver"; "Cap Exempt" |
| Presbyterian Healthcare Services | Pediatric Endocrinologist MD/DO | ? | 72d | EXPLICIT_H1B | "H1b sponsorship" |
| Presbyterian Healthcare Services | Pediatric Oncologist MD/DO - Hematology and Oncolo | ? | 74d | EXPLICIT_H1B | "H1b sponsorship" |
| Presbyterian Healthcare Services | Pediatric Endocrinologist MD/DO | ? | 80d | EXPLICIT_H1B | "H1b sponsorship" |
| University of Maryland Medical System | Nephrologist - Physician | MD | 24d | EXPLICIT_J1_WAIVER | "J1 waiver" |
| University of Maryland Medical System | Gastroenterologist | MD | 24d | EXPLICIT_J1_WAIVER | "J1 waiver" |
| University of Maryland Medical System | Pediatrician - Outpatient - Chestertown, MD | MD | 24d | EXPLICIT_VISA_SPONSORSHIP | "sponsorship available" |

## Known coverage gaps (iron-core employers not yet wired)
These are DOL 7-year iron-core sponsors with no active connector:

| Employer | Reason blocked | Action |
|----------|----------------|--------|
| Northwell Health | WordPress custom portal — no ATS API | Need iCIMS or direct API |
| NYC Health + Hospitals | Bot-block / perfdrive CDN (HTTP 403) | No bypass — revisit |
| BronxCare Health System | Connection refused | No bypass |
| MedStar Health | Connection refused | No bypass |
| Hartford HealthCare | Connection refused | No bypass |
| Maimonides Medical Center | ATS unknown (maimonidesmed.icims.com 404, no Workday/Greenhouse detected) | Research correct portal |
| OHSU | iCIMS sitemap 403 | No bypass |
| Mount Sinai | Taleo SSO-gated | No bypass |
| UT Southwestern | Taleo SSO-gated | No bypass |
| Mayo Clinic | TalentBrew SPA — no sitemap API | No bypass |
| Johns Hopkins | HTTP 403 | No bypass |
| UAB Medicine | uabmedicine.icims.com SSO-gated (redirects to login) | No bypass |
| Froedtert Health | Infor CloudSuite 403 | No bypass |
| Mercy Health | careers.mercy.com has no MD/DO attending jobs (only support staff) | Disabled — revisit if physician portal added |
| Vanderbilt University Medical Center | vumccareers Workday portal has no attending/faculty physician postings (244 keyword hits = NP/PA + support staff only) | Disabled — VUMC physician faculty likely recruited via Vanderbilt University academic HR |

## What to fix next (priority order)

1. **Bare quotes** — CLEAN — all 22 PUBLISH quotes are RICH (H1B/J1/waiver/cap-exempt)
2. **Iron-core coverage** — probe remaining blocked employers; Emory (jibe) + KUMC (workday) added run 1648; Northwell/Mount Sinai/Hopkins/Mayo all blocked
3. **iCIMS / Jibe portals** — UAB Medicine iCIMS is SSO-gated; Maimonides portal unknown; OHSU iCIMS 403; no bypass for any
4. **State distribution** — current PUBLISH is WI/NM/MD/LA/GA; TX/CA/FL/IL/NY under-represented; blocked by bot-protection on major NY/TX employers
5. **Stanford Health Care** — FIXED: alias "stanford health care" → "leland stanford jr university" (6yr/44pos DOL) added; 3 prior Stanford keyword-match results were isPhysician false positives (NP/PA, Nursing Professional, Quality Consultant) — also fixed via new NONPHYS_TOKENS. Real physician postings will promote to SPONSOR_LEAD when they appear.
6. **Jefferson Health** — FIXED run 1759: "thomas jefferson university hospitals" (ATS, plural) → "thomas jefferson university hospital" (DOL, singular, 4yr/28pos) alias added. Prior analysis incorrectly concluded 0 DOL positions; entity exists under singular form. 40 physician jobs promoted from NO_VISA_MENTION → SPONSOR_LEAD.
7. **UAMS denial watch** — UAMS is iron-core (7yr, 52 pos). Raw text shows sidebar key-value: "Sponsorship Available:         No   Institution Name:" (extra whitespace = HTML-stripped Workday table row, NOT free-text body copy). Workday defaults this field to "No" when HR hasn't explicitly set it. Human verification required; correctly held SPONSORSHIP_DENIED until confirmed.
8. **UMMS quality gate** — FIXED run 1747: sponsorEnrich gate now uses recentYearPositions ?? totalPositions (mirrors sponsorScore). SPONSOR_DATA had UMMS at p=2 (stale static snapshot); persistence shows recentYearPositions=5, yearsActive=5 — gate now passes. 39 UMMS physician jobs promoted from NO_VISA_MENTION → SPONSOR_LEAD.
9. **Mercy Health** — DISABLED run 1814: careers.mercy.com posts no MD/DO attending jobs. Full sitemap scan (1,163 URLs) found zero physician attending titles; every "physician" URL slug is support staff or a department name. DOL iron-core (7yr/138pos) is real but this ATS surface doesn't carry physician openings.
10. **VUMC false SPONSOR_LEAD + disable** — FIXED run 1829: "Pediatric Cardiac Sonographer II" was classified as physician (false positive on "pediatric" PHYS token). Root cause: "sonographer" missing from NONPHYS_TOKENS. Fixed in engine.ts. Separately: full scan shows vumccareers Workday has no attending/faculty physician postings (244 keyword hits = NP/PA + support staff); connector disabled. DOL iron-core (7yr) — VUMC physician faculty likely recruited via Vanderbilt University academic HR portal.
