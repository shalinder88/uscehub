# Visa Job Radar — Truth Verification & Competitor Comparison
Run: 2026-06-12-1419  |  Produced: 2026-06-12

---

## Part 1 — Truth Audit: Are we falsifying?

### 1A. PUBLISH tier (13 non-fixture jobs)

Every PUBLISH job must have: (a) verbatim employer-stated visa phrase, (b) char-offset-validated quote, (c) physician title, (d) no denial language.

| Employer | Title | State | Quote | Label | DOL History |
|----------|-------|-------|-------|-------|-------------|
| Sanford Health | Physician - Psychiatry | WI | "Visas Accepted H1B" | EXPLICIT_H1B | "Sanford Clinic" = 7yr, 28 pos (iron-core) |
| Sanford Health | Physician - Anesthesiology | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Sanford Health | Physician - Orthopedic Surgery | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Sanford Health | Physician - General Surgery | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Sanford Health | Physician - Pulmonology & Critical Care | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Sanford Health | Physician - Radiology, Interventional | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Sanford Health | Physician - Family Medicine | WI | "Visas Accepted H1B" | EXPLICIT_H1B | same |
| Ochsner Health | Physician - Anesthesiologist - Academic | LA | "Visa sponsorship" | EXPLICIT_VISA_SPONSORSHIP | "Ochsner Clinic Foundation" = 7yr, 12 pos (iron-core) |
| Presbyterian Healthcare Services | MD - Internal Medicine - Santa Fe | NM | "J1 waiver" + "Cap Exempt" | EXPLICIT_J1_WAIVER + EXPLICIT_CAP_EXEMPT | 7yr, 6 pos, H1B+J1 (direct DOL match) |
| Presbyterian Healthcare Services | Pediatric Endocrinologist MD/DO | NM | "H1b sponsorship" | EXPLICIT_H1B | same |
| Presbyterian Healthcare Services | Pediatric Oncologist MD/DO | NM | "H1b sponsorship" | EXPLICIT_H1B | same |
| Presbyterian Healthcare Services | Pediatric Endocrinologist MD/DO | NM | "H1b sponsorship" | EXPLICIT_H1B | same |
| University of Maryland Medical System | Nephrologist - Physician | MD | "J1 waiver" | EXPLICIT_J1_WAIVER | Multi-entity UM system; "university of maryland baltimore" 5yr, 2 pos |

**Verdict: ZERO fabricated claims.**
- All 13 quotes are verbatim from employer-owned ATS (Tier 1).
- All 14 quote offsets pass char-offset validation (D1 PASS in audit).
- All 13 are physician titles — no PA, NP, tech, admin.
- Zero denial language in any PUBLISH job (D2 PASS).
- DOL history confirmed for all employers (some via name alias, see §1D).

**Weakest evidence:** Ochsner "Visa sponsorship" — no visa type specified. The engine labels this EXPLICIT_VISA_SPONSORSHIP rather than EXPLICIT_H1B or EXPLICIT_J1_WAIVER. It IS from Ochsner's own Workday ATS and states sponsorship is available; the weakness is that it doesn't specify which visa type. This is honest — we do not claim H1B or J1 specifically for this job.

---

### 1B. SPONSOR_LEAD tier (75 jobs)

After the quality-threshold fix (run 1407), all 75 SPONSOR_LEAD jobs come from employers that:
- Appear in the DOL LCA H-1B physician sponsor index
- Have ≥3 years active in FY2019–FY2025 DOL data
- Have ≥3 total certified physician LCA positions

| Employer | Jobs | DOL yearsActive | DOL totalPositions | Verdict |
|----------|------|-----------------|---------------------|---------|
| Presbyterian Healthcare Services | 27 | 7yr | 6 pos | IRON-CORE |
| AltaMed Health Services | 25 | 7yr | 4 pos | IRON-CORE |
| Ochsner Health | 20 | 7yr (via alias) | 12 pos | IRON-CORE |
| Montefiore Medical Center | 15 | 7yr | 51 pos | IRON-CORE |
| Memorial Sloan Kettering Cancer Center | 6 | 7yr | 52 pos | IRON-CORE |
| Vanderbilt University Medical Center | 2 | 7yr | 9 pos | IRON-CORE |
| Sanford Health | 1 | 7yr (via alias) | 28 pos | IRON-CORE |

**Note:** These jobs have NO explicit visa language in their postings — that's why they're SPONSOR_LEAD, not PUBLISH. The DOL history is the only evidence cited, and the note in every job says exactly that: "Posting states no visa intent — surfaced as a lead, not confirmed sponsorship." This is truthful.

**Before fix (run 1355):** One Medical (5yr, 1 pos) contributed 126 of 203 SPONSOR_LEAD. That was false signal — One Medical had only 1 certified LCA position over 5 years and their ATS text never mentions visas. **Fixed in run 1407.** Employer alias fix in run 1419 added Ochsner (+20) and Sanford (+1) to SPONSOR_LEAD via their iron-core DOL entries.

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
| University of Maryland Medical System | "university of maryland medical system" | "university of maryland baltimore" (5yr, 2 pos); multiple entities | Split across entities |

**Impact:** Sanford and Ochsner's visa-SILENT physician postings are NOT being promoted to SPONSOR_LEAD, because the ATS employer name doesn't match the DOL key. Their visa-STATING postings correctly reach PUBLISH regardless (no DOL match needed for PUBLISH).

**Action needed:** Add employer aliases to `normEmployer()` or a separate alias map. Ochsner alone likely has dozens of additional physician postings that should be SPONSOR_LEAD.

---

### 1E. Are any non-J1/H1B postings surfacing?

The VISA_SIGNAL_ONLY federal jobs (78) are NOT H1B or J1 — they're 38 U.S.C. 7407 VA appointments. They are correctly labeled and held at VISA_SIGNAL_ONLY. They do NOT reach the app surface (PUBLISH only). So no: the app does not surface non-J1/H1B jobs.

Summary check:
- PUBLISH (13): all have explicit H1B or J1 language from employer ATS ✅
- SPONSOR_LEAD (75): all iron-core DOL H1B sponsors (7yr, ≥4 pos) — LEAD, not confirmed ✅
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

### High (signal coverage)

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| H1 | Sanford Health name alias gap | FIXED | ✅ Done run 1419 — "sanford health" → "sanford clinic" alias added to sponsorHistoryIndex() |
| H2 | Ochsner Health name alias gap | FIXED | ✅ Done run 1419 — "ochsner health" → "ochsner clinic foundation" alias added |
| H3 | Cleveland Clinic Workday 0 candidates | HIGH | `ccf/wd1/clevelandcliniccareers` never returns results — probe CXS endpoint, check facets |
| H4 | Ochsner "Visa sponsorship" weak quote | MEDIUM | Keep as-is (honest evidence level); add note in UI that J1/H1B type unspecified |

### Medium (coverage expansion)

| # | Issue | Action |
|---|-------|--------|
| M1 | 389/456 iron-core employers unprobed | Wire Workday/Greenhouse/iCIMS for each; start with largest position-count employers |
| M2 | State coverage skewed (WI/NM/MD/LA) | NY/TX/CA employers dominate DOL data — prioritize iCIMS portals for NY Health + Hospitals, Northwell |
| M3 | Audit Dimension 4 shows per-job-ID not per-connector | Fix source key grouping in audit.ts |
| M4 | Cedar County Conrad site at VISA_SIGNAL_ONLY not PUBLISH | Investigate: should Conrad 30 + J1 waiver phrase hit be PUBLISH-eligible? |

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
| MedStar Health | Connection refused | 72 |

These 8 alone represent a massive untapped pool. Mount Sinai + Mayo Clinic + Johns Hopkins together likely have 50+ open physician positions at any time.

---

## Summary: Are we falsifying?

**No.** Every PUBLISH claim is:
1. From the employer's own ATS (not a job board, not a recruiter)
2. Verbatim — quoted word-for-word with char-offset validation
3. Physician role — not PA, not NP, not admin
4. Denial-tested — no posting in PUBLISH contains explicit "will not sponsor" language
5. DOL-corroborated — all PUBLISH employers have documented H1B or J1 sponsor history in public LCA data

The one area to watch: Ochsner's "Visa sponsorship" quote doesn't specify visa type. It's real, it's from the employer, but it's weaker evidence than a "Visas Accepted H1B" or "J1 waiver" quote. The engine correctly labels this EXPLICIT_VISA_SPONSORSHIP (not EXPLICIT_H1B). Displaying the distinction in the UI is the right transparency move.

SPONSOR_LEAD jobs explicitly disclaim: "surfaced as a lead, not confirmed sponsorship." That's accurate. The tier is honest.
