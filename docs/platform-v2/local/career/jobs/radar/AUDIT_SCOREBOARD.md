# Visa Job Radar — Audit Scoreboard
Run: 2026-06-12-1419  |  Audited: 2026-06-12

## Overall counts
| Bucket | Count |
|--------|-------|
| PUBLISH (non-fixture) | 13 |
| SPONSOR_LEAD | 96 |
| Total surfaced (PUBLISH + SL) | 109 |
| REJECT | 717 |

## Dimension 1 — Quote accuracy (verbatim char-offset)
**✅ PASS** — 14 quotes verified, 0 mismatches

## Dimension 2 — PUBLISH denial-language leakage
**✅ PASS** — no PUBLISH job should contain an explicit denial phrase

## Dimension 3 — SPONSOR_LEAD denial-language leakage
**✅ PASS**

## Dimension 4 — Coverage per connector
| Source | PUBLISH | SPONSOR_LEAD | Total |
|--------|---------|--------------|-------|
| jsonld-umms-1391155584 | 1 | 0 | 1 |
| workday-altamed-JR4547 | 0 | 1 | 1 |
| workday-altamed-JR6151 | 0 | 1 | 1 |
| workday-altamed-JR7139 | 0 | 1 | 1 |
| workday-altamed-JR7176 | 0 | 1 | 1 |
| workday-altamed-JR7944 | 0 | 1 | 1 |
| workday-altamed-JR7983 | 0 | 1 | 1 |
| workday-altamed-JR8037 | 0 | 1 | 1 |
| workday-altamed-JR8142 | 0 | 1 | 1 |
| workday-altamed-JR8155 | 0 | 1 | 1 |
| workday-altamed-JR8458 | 0 | 1 | 1 |
| workday-altamed-JR8653 | 0 | 1 | 1 |
| workday-altamed-JR8807 | 0 | 1 | 1 |
| workday-altamed-JR8827 | 0 | 1 | 1 |
| workday-altamed-JR8949 | 0 | 1 | 1 |
| workday-altamed-JR8951 | 0 | 1 | 1 |
| workday-altamed-JR9032 | 0 | 1 | 1 |
| workday-altamed-JR9075 | 0 | 1 | 1 |
| workday-altamed-JR9102 | 0 | 1 | 1 |
| workday-altamed-JR9103 | 0 | 1 | 1 |
| workday-altamed-JR9213 | 0 | 1 | 1 |
| workday-altamed-JR9236 | 0 | 1 | 1 |
| workday-altamed-JR9237 | 0 | 1 | 1 |
| workday-altamed-JR9278 | 0 | 1 | 1 |
| workday-altamed-JR9281 | 0 | 1 | 1 |
| workday-altamed-JR9500 | 0 | 1 | 1 |
| workday-montefiore-JR226338 | 0 | 1 | 1 |
| workday-montefiore-JR226746 | 0 | 1 | 1 |
| workday-montefiore-JR227367 | 0 | 1 | 1 |
| workday-montefiore-JR229133 | 0 | 1 | 1 |
| workday-montefiore-JR229147 | 0 | 1 | 1 |
| workday-montefiore-JR229730 | 0 | 1 | 1 |
| workday-montefiore-JR229732 | 0 | 1 | 1 |
| workday-montefiore-JR229779 | 0 | 1 | 1 |
| workday-montefiore-JR229814 | 0 | 1 | 1 |
| workday-montefiore-JR229978 | 0 | 1 | 1 |
| workday-montefiore-JR230082 | 0 | 1 | 1 |
| workday-montefiore-JR230109 | 0 | 1 | 1 |
| workday-montefiore-JR230402 | 0 | 1 | 1 |
| workday-montefiore-JR230589 | 0 | 1 | 1 |
| workday-montefiore-JR230590 | 0 | 1 | 1 |
| workday-msk-90962 | 0 | 1 | 1 |
| workday-msk-93926 | 0 | 1 | 1 |
| workday-msk-94491 | 0 | 1 | 1 |
| workday-msk-97534 | 0 | 1 | 1 |
| workday-msk-98459 | 0 | 1 | 1 |
| workday-msk-99733 | 0 | 1 | 1 |
| workday-ochsner-REQ_00125516 | 0 | 1 | 1 |
| workday-ochsner-REQ_00176212 | 0 | 1 | 1 |
| workday-ochsner-REQ_00183130 | 1 | 0 | 1 |
| workday-ochsner-REQ_00190716 | 0 | 1 | 1 |
| workday-ochsner-REQ_00204331 | 0 | 1 | 1 |
| workday-ochsner-REQ_00205127 | 0 | 1 | 1 |
| workday-ochsner-REQ_00224171 | 0 | 1 | 1 |
| workday-ochsner-REQ_00238791 | 0 | 1 | 1 |
| workday-ochsner-REQ_00242859 | 0 | 1 | 1 |
| workday-ochsner-REQ_00247499 | 0 | 1 | 1 |
| workday-ochsner-REQ_00265823 | 0 | 1 | 1 |
| workday-ochsner-REQ_00265825 | 0 | 1 | 1 |
| workday-ochsner-REQ_00265962 | 0 | 1 | 1 |
| workday-ochsner-REQ_00266041 | 0 | 1 | 1 |
| workday-ochsner-REQ_00266048 | 0 | 1 | 1 |
| workday-ochsner-REQ_00266050 | 0 | 1 | 1 |
| workday-ochsner-REQ_00266115 | 0 | 1 | 1 |
| workday-ochsner-REQ_00266388 | 0 | 1 | 1 |
| workday-ochsner-REQ_00266406 | 0 | 1 | 1 |
| workday-ochsner-REQ_00266519 | 0 | 1 | 1 |
| workday-ochsner-REQ_00266728 | 0 | 1 | 1 |
| workday-presbyterianhealthcare-2019 | 0 | 1 | 1 |
| workday-presbyterianhealthcare-2023 | 0 | 1 | 1 |
| workday-presbyterianhealthcare-2024 | 1 | 1 | 2 |
| workday-presbyterianhealthcare-2025 | 1 | 7 | 8 |
| workday-presbyterianhealthcare-R | 2 | 17 | 19 |
| workday-sanford-R | 7 | 1 | 8 |
| workday-vumc-R | 0 | 2 | 2 |

## Dimension 5 — NOT_PHYSICIAN gate false-filter scan
**⚠️ REVIEW (10 suspicious)** — physician-keyword titles rejected by gate

- [One Medical] Expanded Care Family Nurse Practitioner or Physician Assistant (All Ages) (Sign-on Bonus Available)
- [One Medical] Expanded Care Family Nurse Practitioner or Physician Assistant (All Ages) (Sign-on Bonus Available)
- [One Medical] Expanded Care Nurse Practitioner or Physician Assistant (Ages 18+) (Sign-on Bonus Available)
- [One Medical] Expanded Care (Urgent Care) Family Nurse Practitioner or Physician Assistant 
- [One Medical] Expanded Care (Urgent Care) Nurse Practitioner or Physician Assistant 
- [One Medical] Family Nurse Practitioner or Physician Assistant
- [One Medical] Family Nurse Practitioner or Physician Assistant
- [One Medical] Family Nurse Practitioner or Physician Assistant
- [One Medical] Family Nurse Practitioner or Physician Assistant
- [One Medical] Family Nurse Practitioner or Physician Assistant

## Dimension 6 — Quote specificity
**✅ ALL RICH** — 14 rich, 0 bare

Bare = quote contains no H-1B/J-1/waiver/cap-exempt — weaker evidence.

## Dimension 7 — PUBLISH posting age
Avg age: **26.4 days**  |  Max age: **80 days**  |  Stale threshold: 120 days

## PUBLISH job inventory (non-fixture)
| Employer | Title | State | Age | Labels | Quote |
|----------|-------|-------|-----|--------|-------|
| Sanford Health | Physician - Psychiatry | WI | 1d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Anesthesiology | WI | 2d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Orthopedic Surgery | WI | 5d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - General Surgery | WI | 5d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Pulmonology & Critical Care | WI | 12d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Radiology, Interventional | WI | 16d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Sanford Health | Physician - Family Medicine | WI | 17d | EXPLICIT_H1B | "Visas Accepted H1B" |
| Ochsner Health | Physician - Anesthesiologist - Academic | ? | 2d | EXPLICIT_VISA_SPONSORSHIP | "Visa sponsorship" |
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
| Maimonides Medical Center | 404 — portal URL unknown | Research correct URL |
| OHSU | iCIMS sitemap 403 | No bypass |
| Mount Sinai | Taleo SSO-gated | No bypass |
| UT Southwestern | Taleo SSO-gated | No bypass |
| Mayo Clinic | TalentBrew SPA — no sitemap API | No bypass |
| Johns Hopkins | HTTP 403 | No bypass |
| UAB Medicine | iCIMS portal URL unknown | Research correct URL |
| Froedtert Health | Infor CloudSuite 403 | No bypass |

## What to fix next (priority order)

1. **Bare quotes** — 0 PUBLISH jobs have weak evidence (no visa type in quote); engine needs richer phrase capture
2. **One Medical / Greenhouse NO_VISA_MENTION** — 201 SPONSOR_LEAD from One Medical have zero visa words; if One Medical truly sponsors, we need explicit text
3. **Iron-core coverage** — 389 of 456 iron-core employers still unprobed (only 11 Workday + 3 Phenom wired)
4. **iCIMS direct portals** — probe `{employer}.icims.com/jobs/search?ss=1&searchKeyword=physician` for remaining blocked employers
5. **State distribution** — verify geographic spread; current PUBLISH is NY/NM/MD/LA — are we missing TX/CA/FL/IL?
