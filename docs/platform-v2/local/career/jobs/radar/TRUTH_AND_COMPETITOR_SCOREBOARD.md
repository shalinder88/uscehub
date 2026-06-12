# Visa Job Radar — Truth Verification & Competitor Comparison
Run: 2026-06-12-1840  |  Produced: 2026-06-12

---

## Part 1 — Truth Audit: Are we falsifying?

### 1A. PUBLISH tier (14 non-fixture jobs)

Every PUBLISH job must have: (a) verbatim employer-stated visa phrase, (b) char-offset-validated quote, (c) physician title, (d) no denial language.

| Employer | Title | State | Quote | Label | DOL History |
|----------|-------|-------|-------|-------|-------------|
| Sanford Health | Physician - Psychiatry | WI | "Visas Accepted H1B" + "H1B or J1" | EXPLICIT_H1B + EXPLICIT_J1_WAIVER | "Sanford Clinic" = 7yr, 28 pos (iron-core) |
| Sanford Health | Physician - Anesthesiology | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Sanford Health | Physician - Orthopedic Surgery | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Sanford Health | Physician - General Surgery | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Sanford Health | Physician - Pulmonology & Critical Care | WI | "Visas Accepted H1B" + "H1B or J1" | EXPLICIT_H1B + EXPLICIT_J1_WAIVER | same |
| Sanford Health | Physician - Radiology, Interventional | WI | "Visas Accepted H1B" + "H1B or J1" | EXPLICIT_H1B + EXPLICIT_J1_WAIVER | same |
| Sanford Health | Physician - Family Medicine | WI | "Visas Accepted H1B" + "H1B or J1" | EXPLICIT_H1B + EXPLICIT_J1_WAIVER | same |
| Ochsner Health | Physician - Anesthesiologist - Academic | LA | "Visa sponsorship" + "J1/H1B" | EXPLICIT_VISA_SPONSORSHIP + EXPLICIT_H1B + EXPLICIT_J1_WAIVER | "Ochsner Clinic Foundation" = 7yr, 12 pos (iron-core) |
| Ochsner Health | Physician - PRN Interventional Cardiology | LA | "Open to J-1 visa" | EXPLICIT_J1_WAIVER | same |
| Presbyterian Healthcare Services | MD - Internal Medicine - Santa Fe | NM | "J1 waiver" + "Cap Exempt" | EXPLICIT_J1_WAIVER + EXPLICIT_CAP_EXEMPT | 7yr, 6 pos, H1B+J1 (direct DOL match) |
| Presbyterian Healthcare Services | Pediatric Endocrinologist MD/DO | NM | "H1b sponsorship" | EXPLICIT_H1B | same |
| Presbyterian Healthcare Services | Pediatric Oncologist MD/DO | NM | "H1b sponsorship" | EXPLICIT_H1B | same |
| Presbyterian Healthcare Services | Pediatric Endocrinologist MD/DO | NM | "H1b sponsorship" | EXPLICIT_H1B | same |
| University of Maryland Medical System | Nephrologist - Physician | MD | "J1 waiver" | EXPLICIT_J1_WAIVER | Multi-entity UM system; "university of maryland baltimore" 5yr, 2 pos |

**Verdict: ZERO fabricated claims.**
- All 14 quotes are verbatim from employer-owned ATS (Tier 1).
- All 20 quote offsets pass char-offset validation (D1 PASS in audit).
- All 14 are physician titles — no PA, NP, tech, admin.
- Zero denial language in any PUBLISH job (D2 PASS).
- DOL history confirmed for all employers (some via name alias, see §1D).
- D6: ALL 20 quotes are RICH (contain specific visa type: H1B/J1/waiver/cap-exempt). Zero bare quotes.

**Prior weak evidence resolved:** Ochsner "Visa sponsorship" (run 1419) was bare. In run 1532, the new J1/H1B combo LEXICON entry catches "J1/H1B" in the same posting → upgraded to EXPLICIT_VISA_SPONSORSHIP + EXPLICIT_H1B + EXPLICIT_J1_WAIVER. Ochsner PRN Interventional Cardiology was SPONSOR_LEAD in run 1419; "Open to J-1 visa" LEXICON addition promoted it to PUBLISH.

---

### 1B. SPONSOR_LEAD tier (259 jobs)

All 219 SPONSOR_LEAD jobs come from employers that:
- Appear in the DOL LCA H-1B physician sponsor index
- Have ≥3 years active in FY2019–FY2025 DOL data
- Have ≥3 recent certified physician LCA positions (gate uses recentYearPositions ?? totalPositions)

| Employer | Jobs | DOL yearsActive | DOL recentYearPositions | Verdict |
|----------|------|-----------------|---------------------|---------|
| Emory University | 40 | 7yr | 40 pos | IRON-CORE (jibe connector) |
| Geisinger Clinic | 40 | 7yr | 78 pos | IRON-CORE (new: workday-geisinger run 1814) |
| Thomas Jefferson University Hospitals | 40 | 4yr (via alias → "thomas jefferson university hospital") | 28 pos | PASSES GATE (run 1759 alias fix) |
| University of Maryland Medical System | 39 | 5yr (via alias → "university of maryland baltimore") | 5 pos | PASSES GATE (run 1747 gate fix) |
| Presbyterian Healthcare Services | 27 | 7yr | 6 pos | IRON-CORE |
| AltaMed Health Services | 24 | 7yr | 4 pos | IRON-CORE |
| Ochsner Health | 15 | 7yr (via alias) | 12 pos | IRON-CORE |
| Montefiore Medical Center | 15 | 7yr | 51 pos | IRON-CORE |
| University of Kansas Medical Center | 11 | 7yr | 18 pos | IRON-CORE (new: workday kumc-jobs) |
| Memorial Sloan Kettering Cancer Center | 6 | 7yr | 52 pos | IRON-CORE |
| Sanford Health | 1 | 7yr (via alias) | 28 pos | IRON-CORE |

**Note:** These jobs have NO explicit visa language in their postings — that's why they're SPONSOR_LEAD, not PUBLISH. The DOL history is the only evidence cited, and the note in every job says exactly that: "Posting states no visa intent — surfaced as a lead, not confirmed sponsorship." This is truthful.

**Emory expansion (run 1625):** 40 Emory University physician faculty jobs surfaced via new Jibe/iCIMS connector (`careers.emory.edu/api/jobs`). All are visa-silent → SPONSOR_LEAD. Emory is a 7yr/40pos iron-core sponsor; the lead is DOL-backed.

**KUMC expansion (run 1648):** 11 University of Kansas Medical Center physician jobs added via Workday connector (`kumc/wd5/kumc-jobs`). Correct site name required hyphen (`kumc-jobs`); initial probe used `kumc` → 404. KUMC is 7yr/18pos iron-core. No physician jobFamilyGroup facets in Workday; keyword fallback returns 23 results, 11 pass isPhysician().

**Ochsner reduction (20→15):** 4 Ochsner jobs moved to SPONSORSHIP_DENIED (denial phrases added). 1 moved to PUBLISH ("Open to J-1 visa" added to LEXICON).

**UMMS expansion (run 1747, +39):** 39 University of Maryland Medical System physician jobs promoted from NO_VISA_MENTION to SPONSOR_LEAD. Root cause: `sponsorEnrich` quality gate used `totalPositions` from SPONSOR_DATA static snapshot (p=2) which failed the ≥3 threshold; `recentYearPositions=5` (from 7-year DOL persistence) was being ignored. Fix: gate now uses `recentYearPositions ?? totalPositions`, matching `sponsorScore()` logic. UMMS uses alias `"university of maryland medical system"` → `"university of maryland baltimore"` (5yr active, recentYearPos=5).

**Jefferson expansion (run 1759, +40):** 40 Thomas Jefferson University Hospitals physician jobs promoted from NO_VISA_MENTION to SPONSOR_LEAD. Root cause: ATS normKey `"thomas jefferson university hospitals"` (plural) did not match DOL entry `"thomas jefferson university hospital"` (singular, 4yr/28pos). Prior scoreboard incorrectly noted "0 DOL positions" — the entity exists under the singular form. Alias added: `"thomas jefferson university hospitals"` → `"thomas jefferson university hospital"`.

**History:** Before run 1407, One Medical false signal fixed by quality threshold. Run 1419: Ochsner + Sanford aliases added. Run 1625: Emory Jibe connector added +40 SPONSOR_LEAD. Run 1648: KUMC Workday added +11 SPONSOR_LEAD. Run 1747: UMMS gate fix +39 SPONSOR_LEAD. Run 1759: Jefferson alias fix +40 SPONSOR_LEAD. Run 1814: Geisinger Workday added +40 SPONSOR_LEAD (7yr/78pos iron-core, PA). Run 1840: VUMC false SPONSOR_LEAD removed (Pediatric Cardiac Sonographer false-positive fixed + VUMC disabled); Mercy disabled (no MD/DO attending jobs on careers.mercy.com); "sonographer" and "radiologist assistant" added to NONPHYS_TOKENS.

---

### 1C. VISA_SIGNAL_ONLY tier (79 jobs)

| Label | Count | What it means |
|-------|-------|---------------|
| FEDERAL_NONCITIZEN_ELIGIBLE | 78 | VA/federal "may appoint a non-citizen" per 38 U.S.C. 7407 — statutory appointment authority, NOT a promise to sponsor H1B or J1. These will never reach PUBLISH. |
| EXPLICIT_CONRAD + EXPLICIT_J1_WAIVER | 1 | Cedar County Rural Health Clinic, Conrad 30 waiver site. J1 sponsorship likely real but via state-program pathway, not direct employer H1B sponsor. |

**Verdict: NOT falsifying.** 78 federal jobs are correctly held at VISA_SIGNAL_ONLY because "may appoint non-citizens" is weaker than explicit sponsorship intent. They do NOT appear in the PUBLISH tier. The 1 Conrad site is a gray zone — likely real but held because the evidence pattern differs from standard H1B/J1 language.

---

### 1D. Name normalization gaps (accuracy risk, not falsification)

Our `normEmployer()` strips punctuation and lowercases. Some PUBLISH employers' DOL entries use different legal names:

| ATS Employer Name | Our normKey | DOL Entity | DOL History |
|-------------------|-------------|------------|-------------|
| Sanford Health | "sanford health" | "sanford clinic" | 7yr, 28 pos — IRON-CORE |
| Ochsner Health | "ochsner health" | "ochsner clinic foundation" | 7yr, 12 pos — IRON-CORE |
| University of Maryland Medical System | "university of maryland medical system" | "university of maryland baltimore" (5yr, recentYearPos=5); SPONSOR_DATA static snapshot had p=2 (stale-low) — gate fixed run 1747 | Split across entities; alias now working |
| Thomas Jefferson University Hospitals | "thomas jefferson university hospitals" | "thomas jefferson university hospital" (4yr, recentYearPos=28); singular/plural mismatch — alias added run 1759 | 40 SPONSOR_LEAD now surfaced |

**Impact:** Sanford and Ochsner aliases were added in run 1419. UMMS alias added in run 1648 but gate failed until run 1747 (SPONSOR_DATA p=2 stale; persistence recentYearPositions=5 now used).

**Status:** All four aliases are working correctly as of run 1759. UMMS 39 + Jefferson 40 SPONSOR_LEAD now surfaced.

---

### 1E. Are any non-J1/H1B postings surfacing?

The VISA_SIGNAL_ONLY federal jobs (78) are NOT H1B or J1 — they're 38 U.S.C. 7407 VA appointments. They are correctly labeled and held at VISA_SIGNAL_ONLY. They do NOT reach the app surface (PUBLISH only). So no: the app does not surface non-J1/H1B jobs.

Summary check:
- PUBLISH (14): all have explicit H1B or J1 language from employer ATS ✅
- SPONSOR_LEAD (258): all DOL H1B sponsors (≥3yr, ≥3 recent pos) — LEAD, not confirmed ✅
- VISA_SIGNAL_ONLY (79): federal appointment authority or Conrad waiver — correctly held ✅
- REJECT: dropped; never surfaces ✅

---

## Part 2 — Competitor Comparison

**Methodology note:** We do not scrape competitors. This comparison uses publicly observable facts, the user's direct experience, and domain knowledge of the physician job market.

### 2A. 3RNET

| Dimension | 3RNET | USCEHub |
|-----------|-------|---------|
| Jobs at any given time | ~1–2 per user report | 13 PUBLISH + 75 SPONSOR_LEAD = 88 surfaced |
| Visa verification method | Self-reported by employers; no proof cited | Verbatim employer ATS quote, char-offset validated |
| H1B vs J1 distinction | Listed but not systematically enforced | Engine separates EXPLICIT_H1B / EXPLICIT_J1_WAIVER / EXPLICIT_CONRAD / EXPLICIT_CAP_EXEMPT |
| DOL history fusion | None (no public indicator of sponsor track record) | 456 iron-core sponsors, 7yr FY2019–2025 DOL LCA data |
| Denial detection | None (if employer posts, it's there) | SPONSORSHIP_DENIED bucket: "will not sponsor", "no sponsorship" flagged and removed |
| Source type | Employer self-post (paid listing model) | Employer-direct ATS only (Workday, Greenhouse, json-ld) — no recruiter noise |
| State coverage | Rural-skewed (HPSA-focus) | WI, NM, MD, LA current PUBLISH; SPONSOR_LEAD adds CA, NY, TN, NM |

**Verdict:** We have more surfaced jobs than 3RNET by a large margin. Critically, our evidence standard is higher — every PUBLISH job cites the employer's own words, not a self-report field on a job board.

---

### 2B. IMGCareers / VisaFriendlyJobs (generic IMG boards)

These are manual listing boards where employers pay to post. There is no systematic:
- Verification of claims (no verbatim evidence cited)
- DOL history cross-check
- Denial detection (a "no sponsorship" employer can post without being flagged)
- Tier distinction (recruiter ads and direct employer ads mixed)

Our engine removes ALL of these failure modes by design.

---

### 2C. Commercial boards (PracticeLink, DocCafe, PracticeMatch, Doximity Jobs)

Not apples-to-apples: these are general physician job boards, not visa-truth layers. They have:
- No visa-specific filter that distinguishes H1B from "we're open to discussing"
- Recruiter-intermediary postings (we exclude these via `RECRUITER_ONLY` reject)
- Self-reported visa fields with no enforcement
- No DOL cross-reference

Our product answers a different question: "who WILL sponsor, with proof?" vs their question: "here are physician jobs that exist."

---

### 2D. Government sources (HRSA NHSC, Conrad 30 state lists)

These are ground truth for J1 waiver sites, but they are:
- Updated manually, often months stale
- Not real-time job postings (they list approved waiver slots, not open positions)
- Not queryable by specialty or location programmatically

We consume USAJobs as a pipeline source (0602 series, VHA) and capture Conrad mentions. Future work: NHSC job board direct feed.

---

## Part 3 — Scoreboard: What to fix

### Critical (truth accuracy)

| # | Issue | Severity | Status | Fix |
|---|-------|----------|--------|-----|
| C1 | One Medical/Lowell General false SPONSOR_LEAD | FIXED | ✅ Done run 1407 | Quality threshold: yearsActive ≥ 3 AND totalPositions ≥ 3 |
| C2 | Silent connector failures not logged | FIXED | ✅ Done run 1407 | Per-connector try/catch + stderr log + run_report section |
| C3 | Ochsner denial jobs reaching SPONSOR_LEAD | FIXED | ✅ Done run 1532 | 4 denial patterns added to DENIAL_PHRASES |
| C4 | One Medical/Oscar 536 wasted fetches/run with 0 useful signal | FIXED | ✅ Done run 1532 | Both connectors disabled |
| C5 | UMMS alias working but 39 jobs not promoting — gate used stale SPONSOR_DATA p=2 | FIXED | ✅ Done run 1747 | Gate now uses recentYearPositions ?? totalPositions; 39 UMMS jobs now SPONSOR_LEAD |
| C6 | Jefferson Health 40 jobs stuck NO_VISA_MENTION — plural/singular normKey mismatch | FIXED | ✅ Done run 1759 | Alias "thomas jefferson university hospitals" → "thomas jefferson university hospital"; 40 jobs now SPONSOR_LEAD |
| C7 | VUMC Pediatric Cardiac Sonographer II false SPONSOR_LEAD — "sonographer" missing from NONPHYS_TOKENS | FIXED | ✅ Done run 1840 | "sonographer" added to NONPHYS_TOKENS; VUMC disabled (vumccareers has no attending physician postings) |
| C8 | MSK Radiologist Assistant, Interventional false-positive — "radiologist assistant" not blocked | FIXED | ✅ Done run 1840 | "radiologist assistant" added to NONPHYS_TOKENS; RA = allied health imaging provider, not physician |

### High (signal coverage)

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| H1 | Sanford Health name alias gap | FIXED | ✅ Done run 1419 — "sanford health" → "sanford clinic" alias |
| H2 | Ochsner Health name alias gap | FIXED | ✅ Done run 1419 — "ochsner health" → "ochsner clinic foundation" alias |
| H3 | Cleveland Clinic Workday connector | FIXED | ✅ Done run 1532 — DISABLED: portal is for non-physician staff only (postdocs). Physician careers at jobs.clevelandclinic.org (WordPress); needs separate probe. |
| H4 | Ochsner "Visa sponsorship" bare quote | FIXED | ✅ Done run 1532 — "J1/H1B" combo LEXICON entry added; Ochsner job now EXPLICIT_VISA_SPONSORSHIP + EXPLICIT_H1B + EXPLICIT_J1_WAIVER |
| H5 | isPhysician() false positives (Surgical Tech, Genetic Counselor) | FIXED | ✅ Done run 1532 — added to NONPHYS_TOKENS |
| H6 | Ochsner PRN Interventional Cardiology at SPONSOR_LEAD not PUBLISH | FIXED | ✅ Done run 1532 — "Open to J-1 visa" added to LEXICON → promoted to PUBLISH |

### Medium (coverage expansion + watch items)

| # | Issue | Action |
|---|-------|--------|
| M1 | Coverage expansion | Emory (run 1625, +40 SL) + KUMC (run 1648, +11 SL) added. Remaining 4 iron-core employers probed: OSF (iCIMS SPA-blocked), Baystate (Workday connected, 0 physician titles), Henry Ford (ATS unknown), Hartford HealthCare (ATS unknown). All 4 moved to Known Gaps. No further wirable iron-core employers identified. |
| M2 | State coverage skewed (WI/NM/MD/LA/GA/KS) | NY/TX/CA employers dominate DOL data — Northwell/Mount Sinai/Mayo/Hopkins all blocked; next best: Hartford CT, OSF IL, Henry Ford MI |
| M3 | Cleveland Clinic physician portal | CLOSED — jobs.clevelandclinic.org confirmed as blog/employer-brand WordPress site, NOT a physician job database. No wirable physician ATS found; remove from probe list. |
| M4 | Jefferson Health alias gap | FIXED run 1759 — "Thomas Jefferson University Hospitals" (ATS, plural) → "thomas jefferson university hospital" (DOL, singular, 4yr/28pos). Prior analysis had checked the wrong normKey (plural form → no DOL match). Alias added; 40 physician jobs now SPONSOR_LEAD. |
| M5 | UAMS denial watch | Iron-core (7yr, 52 pos). Workday structured field `Sponsorship Available:         No` (key-value metadata, extra whitespace = HTML-stripped table row) triggers SPONSORSHIP_DENIED. The field is NOT free-text body copy — it's a sidebar template field Workday defaults to "No" when not explicitly set. Human verification required: is UAMS HR explicitly setting this, or is it an unfilled template default? Until confirmed, correctly held as SPONSORSHIP_DENIED. |
| M6 | KUMC Workday site ID | FIXED run 1648 — kumc/wd5/kumc → 404 resolved to kumc/wd5/kumc-jobs (hyphenated); ATS resolver regex updated; 11 SL now surfaced. |

### Known gaps (blocked, no bypass)

| Employer | Block reason | Iron-core score |
|----------|-------------|-----------------|
| Northwell Health | WordPress custom portal | 90 (7yr, 28 pos) |
| NYC Health + Hospitals | Bot-block / CDN 403 | 82 |
| Johns Hopkins | HTTP 403 | 82 |
| Mount Sinai | Taleo SSO-gated | 88 |
| UT Southwestern | Taleo SSO-gated | 82 |
| Mayo Clinic | TalentBrew SPA | 90 |
| OHSU | iCIMS 403 | 82 |
| OSF Multi-Specialty | iCIMS SPA-blocked (`osfhealthcare.icims.com` → redirects to root, no JSON API) | 7yr, 29 pos |
| UAB Medicine | iCIMS SSO-gated (login redirect) | 7yr, ~20 pos |
| MedStar Health | Connection refused | 72 |
| Henry Ford Health | ATS unknown; wd1 tenant under maintenance; iCIMS 404; no API accessible | 7yr, 27 pos |
| Hartford HealthCare | ATS unknown; no careers page responding; Workday 422 | 7yr, 22 pos |
| Baystate Health | Workday `baystatehealth/wd12/External_Careers` — 390 jobs, zero physician titles | 7yr, 9 pos (low volume — likely recruits physicians via referral) |
| Vanderbilt University Medical Center | vumccareers Workday — 244 "physician" keyword hits, all NP/PA/support staff; no attending/faculty MD postings; faculty likely in Vanderbilt University academic HR | 7yr, 9 pos |
| Mercy Health | careers.mercy.com Phenom — 1,163 sitemap URLs, zero MD/DO attending titles; "physician" slug matches are all support staff or department name context | 7yr, 138 pos |

These gaps represent the largest untapped pool. Mount Sinai + Mayo Clinic + Johns Hopkins together likely have 50+ open physician positions at any time. OSF (29 pos) and Henry Ford (27 pos) are now confirmed inaccessible via API.

---

## Summary: Are we falsifying?

**No.** Every PUBLISH claim is:
1. From the employer's own ATS (not a job board, not a recruiter)
2. Verbatim — quoted word-for-word with char-offset validation
3. Physician role — not PA, not NP, not admin
4. Denial-tested — no posting in PUBLISH contains explicit "will not sponsor" language
5. DOL-corroborated — all PUBLISH employers have documented H1B or J1 sponsor history in public LCA data
6. **All 20 quotes are RICH** — every quote specifies a concrete visa type (H1B, J1, waiver, or cap-exempt). Zero bare/vague quotes (D6 PASS).

SPONSOR_LEAD jobs explicitly disclaim: "surfaced as a lead, not confirmed sponsorship." That's accurate. The tier is honest.

**Run 2026-06-12-1840 final state:**
- 14 PUBLISH + 258 SPONSOR_LEAD = 272 total surfaced
- Fetch volume: 442 candidates (10 active connectors; VUMC + Mercy disabled)
- NOT_PHYSICIAN rejects: 2
- Audit D1-D7: **ALL PASS / CLEAN**
- Changes run 1829→1840: VUMC false SPONSOR_LEAD removed (Sonographer false-positive); Mercy + VUMC connectors disabled (no MD/DO attending jobs on those ATS portals); "sonographer" + "radiologist assistant" added to NONPHYS_TOKENS
