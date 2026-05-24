# P101-5 — Checkpoint After 5 Institutions

**Date:** 2026-05-11
**Sprint:** P101-5 — Enhanced 20-Institution Continuation Block (paused at #5 per operator scope discipline)
**Pre-sprint HEAD:** `b2a6686` · **Production main:** `739ab1e` — UNCHANGED

---

## Sprint framing

P101-5 continues the intended P101-4 25-packet block. P101-4 was stopped after 5 enhanced packets (a calibrated checkpoint, not drift). This sprint extends to packets 6–10 of the intended 25-block (P101-5 numbering 1–5) and then pauses again at the after-5 checkpoint to push and report. The remaining 15 packets (P101-5 ranks 6–20 of this sprint, corresponding to intended P101-4 packets 11–25) roll into P101-6 with the same born-enhanced doctrine.

## Institutions 1–5 (intended P101-4 packets 6–10)

| # | Intended #4# | Institution | State | Source URL(s) | SHA-256 first 16 | Classification | Tier |
|---|---|---|---|---|---|---|---|
| 1 | 6 | Hartford Hospital | CT | hartfordhospital.org/health-professionals | `c71835f3e6d348a8` | NO_PUBLIC_USCE_LANE_FOUND | NO_TIER_NO_CANDIDATE |
| 2 | 7 | Yale-New Haven St Raphael Campus | CT | medicine.yale.edu/md-program/visiting-students/ (reused upstream) | `204e437518d93f7a` | VSLO_US_MD_DO_ONLY | TIER_A_PUBLIC_SAFE |
| 3 | 8 | UF Health Shands Hospital | FL | education.med.ufl.edu/medical-students/programs/ | `f3bb6722188dc7af` | NO_PUBLIC_USCE_LANE_FOUND | NO_TIER_NO_CANDIDATE |
| 4 | 9 | UMiami Miller SOM / UHealth | FL | med.miami.edu/.../observerships + .../externships-services | `457353a2e7835ed0` + `9d81691b0d5136d9` | INTERNATIONAL_STUDENT_CONFIRMED | TIER_A_PUBLIC_SAFE |
| 5 | 10 | Tampa General Hospital | FL | health.usf.edu/medicine/mdprogram/eduprograms | `02d7967b41fe7fc4` | NO_PUBLIC_USCE_LANE_FOUND | NO_TIER_NO_CANDIDATE |

## Counts

| Metric | Count |
|---|---|
| Institutions searched | 5 |
| Enhanced packets created | 5 |
| Source URLs captured to T7 (new) | 6 (5 primary + 1 UMiami externships secondary) |
| Cleaned-text files saved (new) | 6 |
| Raw HTML files saved (new) | 6 |
| Fetch metadata JSON saved (new) | 6 |
| Real SHA-256 hashes captured (new) | 6 |
| Yale-SOM cleaned-text reused for St Raphael Campus | 1 (same upstream hash) |
| Screenshots captured | 0 (5 still PENDING) |
| PDFs saved/extracted | 0 |
| FieldQuoteMap entries written | 175 (35 fields × 5 packets) |
| Canonical T7 path compliance | 100% |
| Packets carrying PENDING_T7_BACKFILL | 0 |
| Packets carrying fake artifact paths | 0 |
| States touched (new this sprint) | FL (new, 3 packets); CT depth (2 packets added) |

## Classification distribution (this 5)

| Classification | Count |
|---|---|
| INTERNATIONAL_STUDENT_CONFIRMED | 1 (UMiami Miller) |
| VSLO_US_MD_DO_ONLY | 1 (Yale St Raphael) |
| NO_PUBLIC_USCE_LANE_FOUND | 3 (Hartford, UF Shands, Tampa General) |

1 of 5 packets carries an IMG-relevant pathway (UMiami's 3-month observership for foreign nationals + VSLO externship for US MD/DO). The other 3 NO_PUBLIC_LANE classifications are honest absence findings on the hospital's own public navigation.

## Quality checks

| Check | Result |
|---|---|
| Every packet has institutionIdentity with canonicalInstitutionName + sourceOfIdentity | ✅ |
| Every packet has sourceEvidence with real hash | ✅ |
| Every packet has fieldQuoteMap with all 35 canonical fields | ✅ |
| Every packet has opportunityTags using canonical taxonomy | ✅ |
| Every packet has userFacingSummaryDraft (11 fields incl. keyCaveats array) | ✅ |
| Every packet has negativeEvidence with numeric searchedTermsCount + openedPagesCount | ✅ |
| Every packet has changeDetectionPrep with real sourceHash | ✅ |
| Every packet has finalClassification + finalTier from canonical enums | ✅ |
| Every packet has driftCheck as string | ✅ |
| Every T7 path uses canonical root | ✅ |
| No PENDING_T7_BACKFILL placeholders | ✅ |
| No legacy `/Volumes/T7Shield_Code/USCEHubEvidence/` paths in any new packet | ✅ |
| No fake screenshots | ✅ all `screenshotStatus: PENDING` |
| No fake hashes | ✅ all 6 hashes are real shasum -a 256 of cleaned text on T7 |
| No large files committed to git | ✅ |
| enhancedEvidenceVersion = "p101-5" on every new packet | ✅ |
| intendedP1014PacketNumber field present on every P101-5 packet | ✅ |

## Failures and reasons

| Item | Reason | Resolution |
|---|---|---|
| Hartford Hospital — UConn SOM visiting-student page | Network timeouts on medicine.uchc.edu visiting-student URLs | Queued for retry with longer fetch timeout; documented in packet rejectedPages with TIMEOUT_NEEDS_RETRY |
| UF Shands — UF COM visiting-student page | Three expected URL patterns 404'd; Global Health sub-page under construction | Queued for VSLO catalog check + 352-273-7925 institutional inquiry |
| Tampa General — USF Morsani visiting-student page | Two expected URL patterns 404'd | Queued for VSLO catalog check + 813-396-9459 institutional inquiry |
| All 5 screenshots | Curl-based fetcher; preview MCP not invoked | Future sprint adds optional headless-Chrome screenshot or preview MCP capture |

## Combined P101-4 partial + P101-5 partial (vs intended 25-block)

| Block stat | Value |
|---|---|
| Intended block size | 25 |
| P101-4 partial packets | 5 (intended #1–5: Brooklyn Hospital Center, Northwell SIUH, MSKCC, HSS, Yale-New Haven Children's) |
| P101-5 partial packets (this sprint) | 5 (intended #6–10: Hartford, Yale St Raphael, UF Shands, UMiami Miller, Tampa General) |
| Combined enhanced packets | 10 / 25 (40% of intended block complete) |
| Remaining for P101-6 | 15 (intended #11–25: AdventHealth Orlando, Memorial Regional Hollywood, Orlando Health, Texas Children's, Houston Methodist, Memorial Hermann TMC, Baylor Dallas, UTSW Clements, UMC New Orleans, Ochsner, Augusta U/MCG, Cleveland Clinic FL, Cleveland Clinic Akron, Atrium Carolinas, Wake Forest Baptist) |

## Cumulative P101 counts after this 5

- Total P101 packets: **50** (was 45 after P101-4 partial)
- Enhanced packets: **20** (P101-3 retrofit 10 + P101-4 partial 5 + P101-5 partial 5)
- Real artifact-backed packets: **20**
- Canonical-root-backed packets: **20**
- States touched: **17** (FL added; AL AR CA CT DC GA IL IN MA MI MO NY PA TN TX WA + FL)
- Classification: 13 INTERNATIONAL_STUDENT_CONFIRMED · 30 VSLO_US_MD_DO_ONLY · 1 IMG_GRAD_OBSERVERSHIP_CONFIRMED · 4 NO_PUBLIC_USCE_LANE_FOUND · 1 BOT_BLOCKED_MANUAL_RETRY · 1 POSSIBLE_USCE_NEEDS_REVIEW

## Whether to continue to #6

**No — paused at #5 of P101-5 per the same operator-validated calibrated-stop pattern from P101-4.** P101-6 picks up at packet #6 of this sprint (AdventHealth Orlando, intended P101-4 packet #11) and continues queue 4 ranks 80–94.

## Drift check

| Drift signal | Status |
|---|---|
| DB / schema / migrations | Not touched ✅ |
| Noindex / staged runtime / contact mapping | Not touched ✅ |
| Homepage / UI / SEO | Not touched ✅ |
| Push to main | Not done ✅ |
| Legacy T7 root used for any new artifact | No ✅ |
| Thin packet bar lowered | No ✅ |
| Fake artifacts | No ✅ |

## Plain English

Five more institutions worked. UMiami Miller has a real international observership (3 months, foreign nationals explicit, sponsor required) plus a VSLO externship for US MD/DO post-Step 1+2. Yale St Raphael Campus inherits the Yale SOM VSLO lane already captured for the Children's packet. Three institutions (Hartford, UF Shands, Tampa General) honestly have no publicly-discoverable visiting-student lane on their own hospital or SOM sites; the lanes may exist via VSLO catalog or institutional inquiry, both queued for future retry.

The combined P101-4 + P101-5 partial blocks complete 10 of the intended 25-packet block. Remaining 15 institutions roll forward to P101-6 with the same born-enhanced doctrine.

## Sprint status (partial)

**PASS for P101-5 institutions 1–5.** Combined P101-4 + P101-5 blocks total 10 enhanced packets, all with canonical-T7 evidence and real SHA-256 hashes.
