# Visa Job Radar — Audit Scoreboard
Run: 2026-06-12-1719  |  Audited: 2026-06-12

## Overall counts
| Bucket | Count |
|--------|-------|
| PUBLISH (non-fixture) | 14 |
| SPONSOR_LEAD | 140 |
| Total surfaced (PUBLISH + SL) | 154 |
| REJECT | 182 |

## Dimension 1 — Quote accuracy (verbatim char-offset)
**✅ PASS** — 20 quotes verified, 0 mismatches

## Dimension 2 — PUBLISH denial-language leakage
**✅ PASS** — no PUBLISH job should contain an explicit denial phrase

## Dimension 3 — SPONSOR_LEAD denial-language leakage
**✅ PASS**

## Dimension 4 — Coverage per connector
| Source | PUBLISH | SPONSOR_LEAD | Total |
|--------|---------|--------------|-------|
| jibe-emory | 0 | 40 | 40 |
| jsonld-umms | 1 | 0 | 1 |
| workday-altamed | 0 | 24 | 24 |
| workday-kumc | 0 | 11 | 11 |
| workday-montefiore | 0 | 15 | 15 |
| workday-msk | 0 | 6 | 6 |
| workday-ochsner | 2 | 15 | 17 |
| workday-presbyterianhealthcare | 4 | 27 | 31 |
| workday-sanford | 7 | 1 | 8 |
| workday-vumc | 0 | 1 | 1 |

## Dimension 5 — NOT_PHYSICIAN gate false-filter scan
**✅ CLEAN** — physician-keyword titles rejected by gate

## Dimension 6 — Quote specificity
**✅ ALL RICH** — 20 rich, 0 bare

Bare = quote contains no H-1B/J-1/waiver/cap-exempt — weaker evidence.

## Dimension 7 — PUBLISH posting age
Avg age: **25.2 days**  |  Max age: **80 days**  |  Stale threshold: 120 days

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

## What to fix next (priority order)

1. **Bare quotes** — CLEAN — all 20 PUBLISH quotes are RICH (H1B/J1/waiver/cap-exempt)
2. **Iron-core coverage** — probe remaining blocked employers; Emory (jibe) + KUMC (workday) added run 1648; Northwell/Mount Sinai/Hopkins/Mayo all blocked
3. **iCIMS / Jibe portals** — UAB Medicine iCIMS is SSO-gated; Maimonides portal unknown; OHSU iCIMS 403; no bypass for any
4. **State distribution** — current PUBLISH is WI/NM/MD/LA/GA; TX/CA/FL/IL/NY under-represented; blocked by bot-protection on major NY/TX employers
5. **Stanford Health Care** — FIXED: alias "stanford health care" → "leland stanford jr university" (6yr/44pos DOL) added; 3 prior Stanford keyword-match results were isPhysician false positives (NP/PA, Nursing Professional, Quality Consultant) — also fixed via new NONPHYS_TOKENS. Real physician postings will promote to SPONSOR_LEAD when they appear.
6. **Jefferson Health** — 40 physician postings/run all NO_VISA_MENTION; DOL entity has 0 certified positions; no alias will fix this — correctly held as REJECT
7. **UAMS denial watch** — UAMS is iron-core (7yr, 52 pos). Raw text shows sidebar key-value: "Sponsorship Available:         No   Institution Name:" (extra whitespace = HTML-stripped Workday table row, NOT free-text body copy). Workday defaults this field to "No" when HR hasn't explicitly set it. Human verification required; correctly held SPONSORSHIP_DENIED until confirmed.
