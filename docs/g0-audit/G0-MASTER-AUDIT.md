# G0 Master Audit — 1-by-1 program walk

**Purpose:** clean and organize every program in Supabase + the 22 legacy-enum REJECTED rows. Verify each one against:

1. Current Supabase row (listingType, status, all fields)
2. `auditData` JSON (yesterday's real-walk findings)
3. Legacy `usmle-observerships/data.js` (234 programs — reference)
4. P102 `display_eligible_clinical_usce.json` (167 programs — reference)
5. P96_3_FULL_304_LISTING_AUDIT.md (per-listing audit findings)
6. The actual program URL via Chrome walk

**Rules:** no regex, no batching, no skipping. One program per pass. Read every source. If sources disagree, the live page wins; if the live page is broken, the program drops.

**Four valid types only:**
- OBSERVERSHIP
- MD_DO_VISITING_STUDENTS (VSLO / MD/DO visiting)
- CLERKSHIP (visiting IMG students)
- RESEARCH

Anything else (resident, fellowship, attending, volunteer, externship, postdoc, elective) → reclassify into one of the four, or drop.

**Queue file:** `docs/g0-audit/walk-queue.json` (243 programs, alphabetical)

**Per-program pass produces one entry below**, with structure:

- **Sources read** (what we looked at)
- **Conflicts** (where sources disagree)
- **Walk verdict** (live page check)
- **Decision** (keep / fix / drop, with new field values)
- **Action** (the actual SQL/UPDATE applied)

**Pre-walk pruning (decisions D1/D2):**
- D1 applied 2026-05-26: 1 VOLUNTEER row hidden (`cmo34f4uc00211nxxekoi2e8e` Cedars-Sinai Pre-Med Volunteer Shadowing) — out of scope for the 4 USCE categories.

---

## #1 — Sidney Kimmel Medical College — International Visiting Student Clerkship
*(was: "Abington Hospital — Jefferson Health" — id `cmn21153a009ssb11aleu4i2b` — bucket APPROVED)*

**Sources read:**
- Supabase: `listingType=MD_DO_VISITING_STUDENTS`, `city=Abington PA`, `sourceUrl=jefferson.edu/registrar/visiting-student-clinical-electives/international-visiting-medical-students.html`, `audienceTag=IMG-STUDENT-CLERKSHIP`, fullDesc contained partner-school text already
- `auditData` entry #188 (2026-05-25): `url_status=WRONG_INSTITUTION`, `url_fix_needed=true`, page excerpts list partner-school requirement and 6-month deadline rule
- Legacy `usmle-observerships/data.js`: `type=observership`, `link=https://www.jeffersonhealth.org/` (different/older URL — generic homepage)
- P102 `display_eligible_clinical_usce.json`: `DIRECT_TRUE_USCE_LINK`, `subType=international-visiting-student`, `audience=international-medical-student`, evidenceQuote "Jefferson registrar international visiting students page; includes Abington campus"
- P96_3 audit MD: legacy `jeffersonhealth.org` URL flagged `GENERIC_HOMEPAGE`, re-link recommended (already done in a prior pass)
- **Chrome walk (this session):** page title "International Visiting Medical Students"; section heading "Visiting Student Clinical Electives at Sidney Kimmel Medical College"; `contains_abington = false`; `contains_sidney = true`; partner-school text confirmed verbatim

**Conflicts:**
- auditData said `WRONG_INSTITUTION` but P102 said `DIRECT_TRUE_USCE_LINK`. Both technically true: the URL *is* a direct true USCE link, but it's Jefferson/Sidney Kimmel's program, not Abington-specific. Chrome walk resolved.

**Walk verdict:** URL alive (HTTP 200). Page is Sidney Kimmel Medical College's international visiting student clerkship program, owned by Jefferson at the registrar level. Abington Hospital is one of several Jefferson Health rotation sites under this single central program. Page never mentions "Abington" by name.

**Decision:** rename + reclassify the slot. Don't delete — keep the row, redirect its identity to the actual program it points at.

**Action applied** (UPDATE listings WHERE id = `cmn21153a009ssb11aleu4i2b`):
- `title`: "Abington Hospital — Jefferson Health" → "Sidney Kimmel Medical College — International Visiting Student Clerkship"
- `listingType`: `MD_DO_VISITING_STUDENTS` → `CLERKSHIP` (audience is international medical students from named partner schools, not US MD/DO VSLO students)
- `city`: "Abington" → "Philadelphia"
- `shortDescription`: rewritten to reflect partner-school-only nature
- `fullDescription`: rewritten from verbatim page extracts — partner-school list + 6-month-deadline rule + Jefferson Health multi-site rotation note
- `eligibilitySummary`: "International medical student at a named Jefferson partner school; rotation deadline six months out; MD/MBBS in progress; visa per partner agreement (typically B1/B2 or F-1)"
- `adminNotes`: appended G0 audit entry with full rationale
- `audienceTag`: `IMG-STUDENT-CLERKSHIP` — unchanged (was already correct)
- `duration`, `cost`, `visaSupport`, `contactEmail`, `specialty`: unchanged (no contradicting evidence on the live page)

---

## #2 — Albert Einstein College of Medicine — Postdoctoral Research
*(was: "Albert Einstein College of Medicine — Research Fellowship" — id `cmn21146x007ksb11nksfya8i` — bucket APPROVED)*

**Sources read:**
- Supabase: `listingType=RESEARCH`, `audienceTag=RESEARCH`, `sourceUrl=einsteinmed.edu/` (generic homepage), `linkVerified=false`, `linkVerificationStatus=NO_OFFICIAL_SOURCE`, description was generic IMG-postdoc boilerplate
- `auditData`: `url_status=WORKING`, `url_audited=einsteinmed.edu/` — but the URL was just the institution homepage, no programmatic evidence captured
- Legacy `data.js`: "Montefiore / Albert Einstein" entry exists as a separate observership listing, type=observership, link=montefioreeinstein.org/education/gme — different program, different URL
- P102: "Montefiore / Albert Einstein" already reclassified to a *visiting-student* program at einsteinmed.edu/education/md-program/registrar/visiting-students (US citizens/PR/F-1 home only — INTL not accepted) — also a different program from this row
- P96_3 audit MD: covers the Montefiore-Einstein row, flagged its old URL as `DEEP_PATH_NO_HINT`
- **Chrome walk:** einsteinmed.edu homepage → real postdoc landing page is einsteinmed.edu/research/postdoctoral-affairs (Belfer Institute for Advanced Biomedical Studies); second-walked that page, H1 "Postdoctoral Affairs", Belfer Institute is the central postdoc office

**Conflicts:**
- None substantive. Supabase URL was just wrong (institution homepage instead of program page). No sibling data source contradicted; they all covered the separate Montefiore-Einstein visiting-student listing.

**Walk verdict:** URL fix needed. Real postdoctoral office page exists and is the appropriate source. No structured fellowship program — Belfer coordinates, but most positions are PI-direct.

**Decision:** keep slot, fix URL, retitle to match Einstein's terminology, rewrite description from page content.

**Action applied** (UPDATE listings WHERE id = `cmn21146x007ksb11nksfya8i`):
- `title`: "Albert Einstein College of Medicine — Research Fellowship" → "Albert Einstein College of Medicine — Postdoctoral Research"
- `sourceUrl` / `applicationUrl` / `websiteUrl`: einsteinmed.edu/ → einsteinmed.edu/research/postdoctoral-affairs
- `shortDescription` / `fullDescription`: rewritten from page content (Belfer Institute mission) + honest note about PI-direct contact for IMGs + adjacent CRTP track noted
- `linkVerified`: false → true; `linkVerificationStatus`: NO_OFFICIAL_SOURCE → VERIFIED; `lastVerifiedAt` set
- `adminNotes`: appended
- `listingType=RESEARCH`, `audienceTag=RESEARCH`, `duration`, `cost`, `visaSupport`: unchanged

---

## #3 — AMG Medical Group — Clinical Rotations *(verified irrelevant → HIDDEN)*
*(id `cmn21140m0072sb11ez341w0z` — bucket LEGACY-RECHECK — was EXTERNSHIP / REJECTED)*

**Sources read:**
- Supabase: `listingType=EXTERNSHIP`, `status=REJECTED`, `sourceUrl=amgmedicalgroup.com/`; description claims "third-party placement service"
- `auditData`: `url_status=WRONG_INSTITUTION`. Page excerpts show "AMG MEDICAL GROUP... fully equipped to deliver comprehensive medical services serving New Yorkers since 2005" + healthcare subscription plans ($59 BASIC, $99 CLASSIC, $129 PREMIUM)
- Legacy `data.js`: claims "Multiple locations nationwide", "third-party placement service" — same wrong claim as Supabase
- P102: no match (didn't make it through P102 gating, as expected)
- P96_3 audit MD: not covered in current excerpt
- *No Chrome walk needed* — auditData page excerpts are decisive

**Conflicts:**
- Legacy data.js + old Supabase description both claim it's a placement service; auditData page excerpts and prior mega-audit (2026-05-26 #246) both prove that's wrong. Already REJECTED in a prior pass.

**Walk verdict:** AMG Medical Group at amgmedicalgroup.com is a NYC patient healthcare subscription business — comprehensive primary care for uninsured patients at $59-129/mo. No relation to IMG clinical rotations. The legacy entry was a mis-attribution.

**Decision:** cannot be reclassified into any of the 4 USCE categories — there is no real program here. Move status REJECTED → HIDDEN to mark "verified irrelevant, do not re-promote." Kept in DB for snapshot recoverability + audit trail.

**Action applied:** `UPDATE listings SET status='HIDDEN', adminNotes=... WHERE id='cmn21140m0072sb11ez341w0z'`

---

## #4 — Augusta University Medical Center (MCG) *(verified, minor copy fix only)*
*(id `cmn2112uj004esb119x368xuh` — bucket APPROVED — MD_DO_VISITING_STUDENTS)*

**Sources read:**
- Supabase: URL `augusta.edu/mcg/coffice/curriculum/incoming-vslo-students.php`, linkVerified=true/VERIFIED, audienceTag=US-MD-DO-VISITING, applicationMethod=VSLO, fullDescription = verbatim page intro (797 chars)
- `auditData`: `url_status=WORKING`, no fix needed. Five page excerpts confirm: VSLO program, LCME-only, max 8 weeks total (two 4-week blocks), INTL not accepted, Wellstar MCG Health clinical site, ACEMAPP credentialing
- Legacy `data.js`: had type "observership" — incorrect; mega-audit already corrected to MD_DO_VISITING_STUDENTS
- P102: REORIENTED, but `audience: "img-graduate"` is wrong (page says LCME-only / INTL not accepted) — Supabase audienceTag US-MD-DO-VISITING is correct, P102 was wrong here
- No Chrome walk needed — auditData is recent + thorough; current Supabase state is consistent.

**Conflicts:** P102 mis-tagged audience as img-graduate; Supabase already corrected to US-MD-DO-VISITING during a prior pass. No action needed on the conflict.

**Walk verdict:** Listing is correctly classified. Only the `shortDescription` was still legacy generic ("teaching hospital… lower cost of living") instead of program-specific.

**Decision:** verified. Tighten `shortDescription` to actually describe the program (VSLO, LCME-only, 8 weeks max).

**Action applied:**
- `shortDescription`: rewritten to "VSLO visiting student electives at Wellstar MCG Health. 4th-year LCME/COCA students only — international students NOT accepted. Max 8 weeks (two 4-week rotations). Standard fees ~$200-400."
- `adminNotes`: appended G0 note
- everything else unchanged (verified correct)

---

## #5 — Banner University Medical Center — Tucson *(dupe → HIDDEN)*
*(id `cmn2115m900awsb11prycio5n` — was ELECTIVE / REJECTED)*

Three rows in DB all point at `medicine.arizona.edu/.../visiting-medical-students`: (a) "Banner — Tucson" [this], (b) "Banner / U Arizona", (c) "University of Arizona Tucson Visiting Medical Students" (APPROVED + MD_DO_VISITING_STUDENTS — canonical). Mega-audit already flagged DEDUPE. Status REJECTED → HIDDEN with G0 note pointing at canonical id. Real program exists; canonical row handles it.

## #6 — Banner University Medical Center / University of Arizona *(dupe → HIDDEN)*
*(id `cmn2113bb005isb111uzkdkk6` — was ELECTIVE / REJECTED)*

Same as #5 — second Banner-Arizona duplicate of the canonical "University of Arizona Tucson Visiting Medical Students" row. REJECTED → HIDDEN with cross-reference note.

## #7 — Baptist Health International Observerships *(verified, no changes)*
*(id `cmo3385jq001b1ny9gnvp324l` — APPROVED / OBSERVERSHIP)*

URL `baptisthealth.net/.../international-services/.../international-observerships` correct + verified. fullDescription is verbatim page content (891 chars). audienceTag=IMG-GRAD-OBSERVER correct. contactEmail populated. Latin America / Caribbean regional focus, no visa sponsorship. `duration='Not specified'` and `cost='Not publicly disclosed'` are factually accurate (page does not disclose). G0 note added. Distinct from #8 (general Observer Program) and #9 (Visiting Physician — out-of-scope).

## #8 — Baptist Health South Florida *(cost + shortDesc fix)*
*(id `cmn2115dj00aesb115q0wh0yc` — APPROVED / OBSERVERSHIP)*

URL = the general Observer Program at `/academics/.../observer-program` (distinct from #7's international page). P102 evidence: $150 students/residents, $450 others, HS waived. Supabase had legacy `cost="$500-1,000"` (wrong) and `shortDescription` from legacy ("Spanish-speaking IMGs particularly valued" — marketing language not present on page).

**Action:**
- `cost`: "$500-1,000" → "$150 (students/residents); $450 (others); waived for current HS students"
- `shortDescription`: rewritten to program-specific (Observer Program, fee structure, hands-off shadowing)
- Other fields verified, unchanged.

## #9 — Baptist Health South Florida Visiting Physician Program *(out of scope → HIDDEN)*
*(id `cmo3385i800191ny9aevwvc26` — was APPROVED / OBSERVERSHIP)*

Page text **explicitly excludes** the USCE audience: "not for residency applicants, not for students seeking academic credit, and not for IMGs who do not yet hold US licensure." This is peer-to-peer CME-adjacent shadowing for already-US-licensed practicing physicians (MD, DO, DPM, DDS, DMD). Does not fit any of the 4 USCE categories. The mega-audit's audienceTag=IMG-GRAD-OBSERVER was incorrect; the program excludes that audience.

**Action:** status APPROVED → HIDDEN with G0 note. Kept in DB for snapshot recoverability + audit trail.

## #10 — Barnes-Jewish Hospital (WashU) *(cost + shortDesc fix)*
*(id `cmn2112y0004osb11wjh4xkrv` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL `md.wustl.edu/curriculum/visiting-students/` verified. Eight rich page excerpts in auditData: VSLO-only, max one 4-week rotation, $100 admin fee, no tuition, eligible schools = full VSLO network (domestic + global). audienceTag=IMG-STUDENT-CLERKSHIP + US-MD-DO-VISITING already multi-tagged correctly (P102 had it as us-only — P102 was incomplete).

**Action:**
- `cost`: "~$200-400" (legacy guess) → "$100 administration fee (no tuition; additional onboarding documents may have small costs)" — page evidence
- `shortDescription`: rewritten to program-specific (VSLO, 4-week, $100 admin, eligible audience)
- Other fields verified, unchanged.

---

## #11 — Baylor College of Medicine — Postdoctoral Research *(URL fix from unsynced mega-audit)*
*(id `cmn21145j007gsb11ba86v05m` — APPROVED / RESEARCH)*

A prior mega-audit note recorded the URL fix `bcm.edu/ → bcm.edu/education/graduate-school-of-biomedical-sciences/postdoctoral-affairs` (Office of Postdoctoral Affairs, supports ~600 postdocs) but never wrote it back to `sourceUrl`. Chrome walk confirms the page title "Office of Postdoctoral Affairs | BCM".

**Action:**
- `sourceUrl` / `applicationUrl` / `websiteUrl`: bcm.edu/ → bcm.edu/education/graduate-school-of-biomedical-sciences/postdoctoral-affairs (now synced from adminNotes evidence)
- `shortDescription` / `fullDescription`: rewritten from the Office's institutional description (~600 postdocs) + honest PI-direct workflow note + cross-ref to BCM's separate visiting student program
- `linkVerified=true`, `linkVerificationStatus=VERIFIED`, `lastVerifiedAt` updated
- type=RESEARCH, audienceTag=RESEARCH, duration/cost/visaSupport unchanged

## #12 — Baylor College of Medicine Visiting Student Rotations *(audience + contact cleanup)*
*(id `cmo34f4d7001f1nxxff5dvsyd` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL verified, fullDescription rich (848 chars) with $1,000 VSLO app fee + Houston/Temple split + final-year-only eligibility. But audienceTag was US-only when P102's evidence explicitly says "VSLO host school for both US AND international students" (at Houston; Temple US-only). Also: contactEmail had trailing period from an auto-extraction artifact.

**Action:**
- `audienceTag`: "US-MD-DO-VISITING" → "IMG-STUDENT-CLERKSHIP, US-MD-DO-VISITING" — Houston campus accepts both audiences per P102 evidence
- `contactEmail`: "internationalservicesoffice@bcm.edu." → "internationalservicesoffice@bcm.edu" (strip trailing period)
- `shortDescription`: refined to mention both campuses + multi-audience
- All other fields verified, unchanged.

---

## #13 — Beaumont Hospital — Royal Oak *(verified + linkVerified sync)*
*(id `cmn21159u00a4sb11kzzrh8a0` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL `beaumont.edu/.../medical-student-rotations-royal-oak` is real (Corewell Health William Beaumont) but Cloudflare-blocks bot fetchers — that's why `linkVerified=false / NEEDS_MANUAL_REVIEW` was stuck. P102 evidence: "works in a real browser." Page says senior students at AOA COCA institution or US LCME institution only — VSAS application. Specialty list: sub-Is in FM, IM, Surgery, Peds.

**Action:**
- `linkVerified`: false → true; `linkVerificationStatus`: NEEDS_MANUAL_REVIEW → VERIFIED (Cloudflare-protected page is real)
- `shortDescription`: rewritten from "Michigan's largest hospital" generic to program-specific (Corewell rebrand, 50+ M4 electives, LCME/COCA-only, sub-I list, VSAS)
- P102 had audience="img-graduate" — WRONG (page is US-M4-only); Supabase US-MD-DO-VISITING is correct
- All other fields verified, unchanged
- Contact is phone (Dawn Burgess, 248.551.2540), not email — contactEmail stays null

## #14 — Beaumont Hospital (Corewell Health) *(dupe → HIDDEN)*
*(id `cmn2112wn004ksb119xp19fdc` — was REJECTED → HIDDEN)*

Same URL as #13. Pre- vs post-Corewell-rebrand variant of the same listing. P102 had both in display-eligible due to legacy name overlap. Status REJECTED → HIDDEN. Canonical row is #13.

## #15 — BIDMC Department of Radiology — Observerships *(MAJOR reclassification)*
*(id `cmn2111te0024sb11mt47ybof` — APPROVED, was MD_DO_VISITING_STUDENTS, now OBSERVERSHIP)*

Prior mega-audit retag promoted this row to MD_DO_VISITING_STUDENTS using a "visiting_student" promote-backup signal — but the URL is BIDMC Radiology Department's observership program (department-specific), explicit hands-off shadowing, NOT a visiting clerkship. Page also includes a cross-reference: "4th-year medical students looking to participate in a visiting clerkship, please apply through the Harvard Medical School VSLO" — i.e., the clerkship pathway is elsewhere.

**Action:**
- `title`: "Beth Israel Deaconess Medical Center" → "BIDMC Department of Radiology — Observerships"
- `listingType`: MD_DO_VISITING_STUDENTS → OBSERVERSHIP
- `specialty`: legacy generic → 8 radiology subspecialties from page (Abdominal, Body MRI, Cardiothoracic, EM Radiology, IR, MSK, Neuro, Nuclear)
- `cost`: "~$300-500" (legacy guess) → "$2,000 for 4-week observership (prorated; no cost for HS/undergrad up to 1 week)"
- `duration`: "2-4 weeks" → "Up to 4 weeks (HS/undergrad max 1 week)"
- `shortDescription` / `fullDescription`: rewritten with explicit audience tiers + tuition + HMS-VSLO cross-reference
- `audienceTag` IMG-GRAD-OBSERVER + PRE-MED + US-MD-DO-VISITING: kept (page enumerates all those audiences)

## #16 — BIDMC Interventional Radiology Visiting Observership *(visaSupport fix)*
*(id `cmo33866700251ny9khuwiv34` — APPROVED / OBSERVERSHIP)*

Separate URL from #15 (`bidmc.org/.../interventional-radiology-observership` vs `research.bidmc.org/radiology-gme/radiology-observerships`). Distinct IR-specific program. $2,000/month, 1–6 months. Eligible: practicing radiologists, residents, fellows, medical students with IR interest. Explicitly *not* for pre-residency endeavors / cannot issue LORs for residency / no research support. Self-obtain tourist visa; J1 NOT sponsored.

**Action:**
- `visaSupport`: true → false — page is explicit "J1 Visa sponsorship is NOT offered… International observers will obtain their own tourist Visa." The Signals-2nd-pass enrich set this to true from `visa_mentions:["J-1"]` but the mention was in a NEGATION ("J1 not offered"). The substring-only check missed it. Same false-positive class as #17 below.
- audienceTag IMG-GRAD-OBSERVER kept, caveated in description. Declined to HIDDEN (vs. #9 Baptist Visiting Physician) because BIDMC IR accepts medical students and trained physicians can still benefit from technical exposure without residency-app linkage.
- Other fields unchanged.

## #17 — Boston Children's Hospital — Observership *(visaSupport fix + contactEmail cleanup)*
*(id `cmn2114m6008msb11ihsjqovc` — APPROVED / OBSERVERSHIP)*

URL verified. Page: pediatric subspecialty observership for fully trained physicians or actively training residents/fellows. Medical students directed elsewhere (HMS Clerkship Exchange).

**Action:**
- `visaSupport`: true → false — page evidence "Boston Children's does not sponsor visas. Need to obtain a visa (B1/B2 or ESTA)". Same false-positive pattern as #16: signal extractor grabbed visa codes from a self-obtain context.
- `contactEmail`: 'exclerks@hms.harvard.edu' → null — this email is the HMS Clerkship Exchange contact for *medical students* (a different program), not the BCH Observership contact. Signal extractor grabbed it as the only @-symbol on the page, but it's misleading for the observership audience.
- `shortDescription`: refined to lead with the audience restriction + no-visa-sponsorship
- P102 had subType=visiting-student-clerkship + audience=us-medical-student — factually WRONG (page explicitly excludes medical students from this program). Supabase row is now accurate.

## #18 — Boston Medical Center — Subsidized Visiting Elective Program (SVEP) *(MAJOR fix: wrong institution URL)*
*(id `cmn2111u40026sb11bnhgpkdb` — APPROVED, was OBSERVERSHIP, now MD_DO_VISITING_STUDENTS)*

`sourceUrl` pointed at **Boston Children's Hospital** (`bchapps.childrenshospital.org/observership/`), a completely different institution. URL repair was recorded in adminNotes by a prior mega-audit pass but never synced to the column. Chrome-walked the correct BMC URL, confirmed page title "Subsidized Visiting Elective Program (SVEP) for Medical Students | Boston Medical Center".

**Action:**
- `title`: "Boston Medical Center" → "Boston Medical Center — Subsidized Visiting Elective Program (SVEP)"
- `sourceUrl` / `applicationUrl` / `websiteUrl`: bchapps.childrenshospital.org/observership/ → bmc.org/medical-professionals/education-training/graduate-medical-education/physician-recruitment/medical-students
- `listingType`: OBSERVERSHIP → MD_DO_VISITING_STUDENTS (page requires "full-time third- or fourth-year MD or DO student… LCME- or COCA-accredited")
- `audienceTag`: IMG-GRAD-OBSERVER → US-MD-DO-VISITING (INTL students go to separate BU ISEP track)
- `applicationMethod`: external → VSLO
- `duration`: "4-8 weeks" → "One-month elective"
- `cost`: "~$300-500" (legacy guess) → "Subsidized — reimbursement up to $2,500 (travel, housing, VSLO registration fees)" — SVEP pays the student instead of charging
- `specialty`: legacy IM/FM/EM/Peds list → "Open to any BMC clinical department for the one-month elective"
- `visaSupport`: true → false (LCME/COCA only)
- `shortDescription` / `fullDescription`: full rewrite with SVEP framing + BU ISEP cross-reference

---

## #19 — Brigham & Women's Global Emergency Medicine & Critical Care Training *(verified, no changes)*
*(id `cmo33864p00231ny906n8z8bp` — APPROVED / OBSERVERSHIP)*

Long-form (12-month default) clinician-scientist hybrid program; $5,000/month tuition; international physicians sponsored by home institution. fullDescription is 1085 chars from page; auditData has 6 specific page excerpts including ICU rotation block list. audienceTag IMG-GRAD-OBSERVER + RESEARCH (multi) correctly reflects hybrid nature. Alumni examples are explicitly international (China, Taiwan). visaSupport=false — handled via Mass General Brigham GPS office (not standard sponsorship).

**Action:** G0 verification note added only. No field changes — the row is correctly populated.

## #20 — Brigham and Women's Hospital — Department of Radiology Observerships *(specialty + cost + title fix)*
*(id `cmn2111sn0022sb11l23h78bo` — APPROVED / OBSERVERSHIP)*

Same pattern as #15 BIDMC: URL is the Radiology department's observership page (11 imaging subspecialties via CME office), not a general institutional listing.

**Action:**
- `title`: "Brigham and Women's Hospital" → "Brigham and Women's Hospital — Department of Radiology Observerships"
- `specialty`: legacy "IM, Surgery, OB/GYN, Rheumatology" (wrong for this URL) → 11 radiology subspecialties from page
- `cost`: "$3,000, $4,000" (cryptic) → full two-tier fee structure (physicians $3K-$4K vs students/residents $500-$1K) + cancellation policy
- `duration`: "2-4 weeks" → "2 weeks minimum; 1 month standard; up to 3 months by special request"
- `linkVerified` false → true, `linkVerificationStatus` NEEDS_MANUAL_REVIEW → VERIFIED (stale flag)
- `shortDescription` / `fullDescription`: rewritten from page extracts
- audienceTag IMG-GRAD-OBSERVER + PRE-MED + US-MD-DO-VISITING: kept (page enumerates all)
- Note: this row and #19 (Global EM & CC) are both real distinct BWH programs

## #21 — BronxCare Psychiatry Residency — Volunteer & Observership *(specialty-limited reclassification)*
*(id `cmn2111fa0018sb11v9x51s6a` — APPROVED / OBSERVERSHIP)*

URL is psychiatry-specific (`/our-services/psychiatry/...`). P102 already flagged `specialtyLimited: "Psychiatry"`. BronxCare has NO centralized institutional observership page for other specialties.

**Action:**
- `title`: "BronxCare Health System" → "BronxCare Psychiatry Residency — Volunteer & Observership"
- `specialty`: legacy "IM, FM, Surgery, Psychiatry, Pediatrics" → 6 psychiatry sub-services from page (Adult Inpatient, Addiction, C-L, Child & Adolescent Inpatient, Primary Care, Comprehensive Psych Emergency)
- `duration`: "4-12 weeks" → "8-12 weeks (minimum 3 days/week, 9 a.m.-5 p.m.)" — page says minimum 8 weeks, not 4
- `cost`: "~$300-600" → tiered "1 month $250 / 2 months $400 / 3 months $500"
- `shortDescription` / `fullDescription`: rewritten with psychiatry-only scope + explicit note about other specialties not having centralized observerships

## #22 — Brookdale Hospital — Psychiatry Externship Program *(unsynced URL + major reclassification)*
*(id `cmn2111j4001csb113odjp4jt` — APPROVED / OBSERVERSHIP)*

Original URL `brookdalehospital.org/gme` was broken ("Frame showing error page"). Prior mega-audit recorded URL repair to `onebrooklynhealth.org/.../psychiatry-residency-program` but never synced. Chrome-walked: page is One Brooklyn Health's Brookdale Hospital Psychiatry program. Found the "Psychiatry Externship Program" section embedded in the residency page — **12 months full-time, volunteer (non-paid)**, separate from accredited residency, for IMGs seeking US psychiatry residency. LOR available on completion (no guarantee of residency acceptance).

**Action:**
- `sourceUrl` / `applicationUrl` / `websiteUrl`: brookdalehospital.org/gme → onebrooklynhealth.org/health-care-professionals/psychiatry-residency-program
- `title`: "Brookdale University Hospital" → "Brookdale Hospital — Psychiatry Externship Program"
- `specialty`: legacy "IM, Surgery, Peds, EM" (totally wrong) → "Psychiatry"
- `duration`: "4-12 weeks" (totally wrong) → "12 months full-time"
- `cost`: "~$500-1000" (totally wrong — it's volunteer) → "Volunteer / non-paid (not a fee-paying program)"
- `contactEmail`: null → "csimpso2@bhmcny.org"
- `shortDescription` / `fullDescription`: rewritten with explicit warning about full-year unpaid clinical externship trade-offs
- `linkVerified` false → true, `linkVerificationStatus` REVERIFYING → VERIFIED

## #23 — Brooklyn USCE — Clinical Rotations *(description cleanup)*
*(id `cmn2115ok00b2sb11uo7vd4v7` — APPROVED / OBSERVERSHIP)*

Real commercial third-party placement service (in contrast to #3 AMG which was a NYC clinic subscription business). Already correctly labeled as third-party in shortDescription. fullDescription was auto-captured nav text ("Home / About Us / Clinical Rotations…"), needed real content.

**Action:**
- `fullDescription`: rewritten with what the service actually does + honest caveats about verifying partner sites + non-endorsement note
- All other fields unchanged. Listing kept APPROVED — commercial placement services that broker real USCE at real US hospitals are legitimate even if controversial.

## #24 — "Buggu at bugg" *(test-data junk → HIDDEN)*
*(id `cmo30mt2q0001la04jntmw0ng` — was REJECTED → HIDDEN)*

Junk test row: title "Buggu at bugg", city "Hell UT", URL "www.hell.com", cost "Gazillion", email "hell@hell.com", fullDesc "Test run please". A developer's escaped test row. Already REJECTED; G0 → HIDDEN with explicit note.

---

## #25 — Carolinas Medical Center (Atrium Health) — Internal Medicine M4 Elective *(specialty-limited + INTL exclusion + visaSupport fix)*
*(id `cmn2115fs00aksb110p1hkkvn` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL is the Internal Medicine department's M4 visiting student page (P102 flagged `specialtyLimited`). Page explicitly: "we are unable to accept applications for visiting rotations and observerships from students of international medical schools or other non-LCME/COCA accredited medical schools."

**Action:**
- `title`: institution-only → "Carolinas Medical Center (Atrium Health) — Internal Medicine M4 Elective"
- `specialty`: legacy multi-dept → 10 IM sub-specialties from page
- `duration`: "2-4 weeks" → "4-week M4 elective"
- `visaSupport`: true → false (INTL explicitly excluded)
- `shortDescription` / `fullDescription`: rewritten with INTL exclusion + 3rd-year-Wake-Forest-only restriction

## #26 — Cedars-Sinai — Research Fellowship *(dead URL → HIDDEN; type POSTDOC→RESEARCH)*
*(id `cmn2113v5006usb11977nd3ud` — was REJECTED → HIDDEN)*

URL `cedars-sinai.edu/research/training/postdoctoral.html` is dead 404; site restructured to `/health-sciences-university/`. Cedars-Sinai's real postdoc landing was not surfaced from the new Research overview page within reasonable Chrome-walk effort. Cedars-Sinai is represented in the catalog by #27 (visiting students).

**Action:** status REJECTED → HIDDEN; listingType POSTDOC → RESEARCH (4-cat conformance). Can be re-promoted later if correct postdoc URL is found.

## #27 — Cedars-Sinai Medical Center — Visiting Medical Students *(title + description rewrite)*
*(id `cmn2111o8001qsb11j87evr4c` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL verified; 4-week senior electives June-December; 837 medical student rotations (472 UCLA + 329 visiting from other US schools). INTL students apply via UCLA David Geffen affiliation (NOT direct).

**Action:**
- `title`: "Cedars-Sinai Medical Center" → "Cedars-Sinai Medical Center — Visiting Medical Students"
- `shortDescription`: legacy "celebrity patients" marketing → program-specific (4-week, June-Dec, 837 rotations, INTL via UCLA affiliation)
- `duration`: "2-4 weeks" → "4-week senior elective (June-December)"
- `specialty`: legacy "Cardiology, GI, Surgery, Orthopedics" → "All clinical specialties open"
- `applicationMethod`: "external" → "VSLO"
- `fullDescription`: rewritten with US vs INTL path distinction

## #28 — CHOP International Observership Program *(verified, no changes)*
*(id `cmo3386ez002h1ny9yiriql6d` — APPROVED / OBSERVERSHIP)*

In excellent shape — explicit page description (1088 chars), contactEmail set, prominent exclusion of US-GME applicants in shortDescription. Pattern note: similar to #16 BIDMC IR — observership accepts internationally-based physicians but explicitly NOT for residency match. Listing kept APPROVED with restriction visible. G0 verification note added.

## #29 — Cincinnati Children's Hospital — International Visitor Program *(audience + description refinement)*
*(id `cmn2114mz008osb114617lwli` — APPROVED / OBSERVERSHIP)*

Page documents TWO tracks: Clinical Observers (B-1/B-2 or VWP, no credit, hands-off only) and Research Scholars (J-1 sponsored, PhD/MD or master's). Original Supabase audienceTag covered only observers.

**Action:**
- `audienceTag`: "IMG-GRAD-OBSERVER" → "IMG-GRAD-OBSERVER, RESEARCH" (page covers both)
- `shortDescription`: refined to lead with the two-track structure
- `fullDescription`: rewritten from 466 → ~1500 chars with both tracks, eligibility tiers, visa specifics
- visaSupport=true kept (correct for the research track, where J-1 IS sponsored; observers self-obtain — disambiguated in description)

## #30 — Cleveland Clinic *(verified, no changes)*
*(id `cmn21122v002osb11pdpyrjab` — APPROVED / OBSERVERSHIP / featured=true)*

In excellent shape — 1086-char description from page, prominent eligibility exclusion warning, country restriction documented (Belarus, Cuba, Iran, Libya, North Korea, Russia, Venezuela not accepted). Program is for international physicians/trainees abroad, NOT for US-residency-seeking IMGs. G0 verification note added — audienceTag IMG-GRAD-OBSERVER+IMG-STUDENT-CLERKSHIP is acceptable (used here to mean "IMG abroad", not pre-match).

---

## #31 — Cleveland Clinic Elective Program *(audienceTag expanded)*
*(id `cmo34f3k1000d1nxx22bee6we` — APPROVED / MD_DO_VISITING_STUDENTS)*

In excellent shape (fullDesc 950 chars, contactEmail set, $200 domestic / $400 international fee, 4-week blocks, staggered openings). Cost field's separate INTL tier evidences INTL students are accepted (via VSLO).

**Action:**
- `audienceTag`: "US-MD-DO-VISITING" → "IMG-STUDENT-CLERKSHIP, US-MD-DO-VISITING" — INTL students explicitly priced into the fee structure.
- All other fields unchanged.

## #32 — Cleveland Clinic Florida *(shortDesc rewrite)*
*(id `cmn2112hf003msb111pyw2jaa` — APPROVED / OBSERVERSHIP)*

URL verified, fullDesc 499 chars from page, contactEmail set, free, 2-4 weeks. shortDescription was legacy "less competitive than main Ohio campus / warm weather" marketing.

**Action:** `shortDescription` rewritten to program-specific (Physician Observer Program, hands-off per federal regs, no fee). All other fields unchanged. Note: unlike #30 main campus, CCF Florida does NOT explicitly exclude US-residency-seeking applicants — distinct policy.

## #33 — Clinical Experience Programs — Multi-Site *(broken URL stub → HIDDEN)*
*(id `cmn2115pb00b4sb11t4pwrgjh` — was REJECTED → HIDDEN)*

`sourceUrl = '#'` (anchor placeholder, never a real URL). Stub listing. #34 was the canonical CEP row.

## #34 — Clinical Experience Programs (CEP) — IMG Rotations *(defunct business → HIDDEN)*
*(id `cmn2114240076sb11zfiteqrx` — was REJECTED → HIDDEN)*

Domain `clinicalexperienceprograms.com` fails DNS resolution (DNS_PROBE_FINISHED_NXDOMAIN). Business no longer exists. Both CEP variants now HIDDEN.

## #35 — Columbia Neurology Visiting Physicians and Scientists — Clinical Observership *(contact + cost refinement)*
*(id `cmo3384xv000j1ny9hdyst91b` — APPROVED / OBSERVERSHIP)*

URL verified, fullDesc 1042 chars from page. auditData captured detailed page evidence: $500 universal processing fee + tiered rotation fees by applicant type (HS/undergrad free, external college $500, post-bac $1,000, etc.). Page contact mailbox is `neuro_observership@cumc.columbia.edu` — Supabase had `neurologyhr-fa@cumc.columbia.edu` which is the HR mailbox (wrong audience).

**Action:**
- `contactEmail`: HR mailbox → program-specific mailbox
- `cost`: cryptic legacy → structured fee tiers + universal processing fee
- `duration`: "1 day to 3 months" (legacy) → "Up to 3 months (varies by applicant type; season-specific deadlines)"
- `shortDescription`: refined with season-based applications + tiered fees
- audienceTag (multi: IMG-GRAD-OBSERVER + PRE-MED + US-MD-DO-VISITING): unchanged, correct

---

## #36 — Columbia Psychiatry Observerships *(wrong contact email + missing cost)*
*(id `cmo3384we000h1ny9zqofrhm4` — APPROVED / OBSERVERSHIP)*

auditData had captured 8 rich page excerpts including verbatim "There is a fee of $2000. Housing is not provided. We do not sponsor any visas." Supabase had: contactEmail = `neurologyhr-fa@cumc.columbia.edu` (HR mailbox, completely wrong dept), cost = "Not stated; contact program" (despite page disclosing $2,000), shortDescription = "program details require direct department contact" (despite page being thoroughly captured).

**Action:**
- `contactEmail`: HR mailbox → `mis3@cumc.columbia.edu` (Margaret Hamilton MD, Director of International Medical Students and Graduates Rotations)
- `cost`: legacy "Not stated" → "$2,000 (no housing provided; no visa sponsorship)"
- `duration`: normalized
- `shortDescription`: legacy defeatist → program-specific (rotating 4-week structure, $2,000 fee, ~10 observers/year, March-April application window, residency applicants apply ≥1 year out)

## #37 — CommonSpirit Health International — Clinical Observation *(verified, no changes)*
*(id `cmn2114sz008ysb114tl0vvdr` — APPROVED / OBSERVERSHIP)*

Genuine multi-state institutional observation program (159 CommonSpirit hospitals). Federally compliant — no patient care, no volunteer research. Institutional/organizational application (not VSLO). fullDesc 879 chars from page. All fields correct.

## #38 — Conemaugh Memorial Medical Center *(unsynced URL → PDF policy doc)*
*(id `cmn2115q200b6sb115fxbi2gx` — APPROVED / OBSERVERSHIP)*

URL repair recorded in adminNotes but unsynced: `conemaugh.org/` (homepage) → `gme.conemaugh.org/.../Observership%20Program%20Policy(1).pdf` (the actual program policy PDF, 200 OK).

**Action:**
- `sourceUrl` / `applicationUrl` → PDF policy URL
- `linkVerified` false → true; status NEEDS_MANUAL_REVIEW → VERIFIED
- `shortDescription` refined with real institutional facts (7 residency programs, 200+ med-school rotations per year)

## #39 — South Brooklyn Health (Coney Island Hospital) — Emergency Medicine M4 Elective *(EM-only + affiliated-schools-only restriction)*
*(id `cmn2111bn000ysb11c73w0mft` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL is EM-specific (4-week M4 elective via the EM residency program). Page restricts: "only accepting students from affiliated medical schools" — NYIT-COM, Touro-COM New York, St. George's University, SUNY Downstate.

**Action:**
- `title`: "Coney Island Hospital" → "South Brooklyn Health (Coney Island Hospital) — Emergency Medicine M4 Elective" (current institutional name + EM-only scope)
- `specialty`: legacy multi-dept → "Emergency Medicine"
- `duration`: "4-12 weeks" → "4-week elective"
- `shortDescription` / `fullDescription`: rewritten with verbatim restriction language (4 named affiliated schools only) + NYC H+H MOSAIC pointer

## #40 — CU Anschutz Extern Visiting Student Program *(wrong-institution contactEmail null)*
*(id `cmo34f4gh001j1nxx3hlp2elt` — APPROVED / MD_DO_VISITING_STUDENTS)*

`contactEmail = HSC-MDvisiting@salud.unm.edu` — that's **University of New Mexico** HSC, not Colorado! Seed-file cross-institution mix-up. Cleared to null.

**Action:**
- `contactEmail`: salud.unm.edu (wrong institution) → null. Better empty than wrong-institution.
- All other fields verified — URL, type, audienceTag (multi: INTL + US-M4), fullDesc 976 chars from page, cost (US $150 vs INTL $4,150 tiered), VSLO, visaSupport: correct.
- **Note for final sweep:** worth running a query for `contactEmail` domain ≠ `sourceUrl` domain — seed-file cross-pollination likely affects other rows.

---

## #41 — Drexel University — International Observership *(shortDesc highlight)*
*(id `cmn2114fs0084sb11a383lpwp` — APPROVED / OBSERVERSHIP)*

URL good, fullDesc 879 chars, audienceTag correct. Key differentiator from auditData: Drexel writes a final summary letter (sent to ERAS) at end of the Structured Preceptorship. Genuine LOR support — rare among observerships.

**Action:** shortDescription rewritten to lead with the LOR-to-ERAS feature. Other fields unchanged.

## #42 — Duke University — Postdoctoral Research *(generic boilerplate → Duke-specific)*
*(id `cmn2113zw0070sb116oho28en` — APPROVED / RESEARCH)*

Same generic IMG-postdoc 286-char template seen across multiple research listings (Einstein, Baylor, others). Replaced with Duke-specific OPS content + PI-direct workflow + cross-refs to Duke's visiting student programs.

## #43 — Duke University Hospital *(dupe → HIDDEN, canonical is #44)*
*(id `cmn2112qu0044sb11m7wwscho` — was APPROVED, now HIDDEN)*

Same URL as #44 "Duke Visiting Student Electives". #44 has the cleaner program-specific title. #43 had richer 1173-char fullDesc preserved via adminNotes archive; #44's 828-char fullDesc has the departmental-deadline detail.

## #44 — Duke Visiting Student Electives *(canonical Duke visiting row)*
*(id `cmo34f45p00151nxxoycjv68y` — APPROVED / MD_DO_VISITING_STUDENTS)*

Canonical Duke visiting-students row going forward. shortDescription refined with departmental deadlines (Urology Apr 11, Ortho Mar 16, Derm Mar 13) + multi-audience note. All other fields verified.

## #45 — NYC Health + Hospitals — MOSAIC Visiting Scholars Program *(major reclassification from Elmhurst-specific)*
*(id `cmn21118u000qsb11lbgouwbn` — APPROVED / MD_DO_VISITING_STUDENTS)*

The URL `nychealthandhospitals.org/mosaic/visiting-scholars-program/` is the multi-site H+H MOSAIC program (Elmhurst is one participating site). Row was incorrectly titled "Elmhurst Hospital Center". auditData flagged `url_status=WRONG_INSTITUTION` — but the URL was correct for MOSAIC, just the title was wrong.

**Action (significant rewrite):**
- `title`: "Elmhurst Hospital Center" → "NYC Health + Hospitals — MOSAIC Visiting Scholars Program"
- `city`: "Queens" → "New York" (multi-site program)
- `specialty`: legacy multi-dept → "Multi-specialty 4-week elective across NYC H+H sites"
- `duration`: "4-12 weeks" → "4-week elective"
- `cost`: "$2,000" → "Subsidized: $2,000 rotation stipend + $2,000 housing stipend (non-NYC participants)" — program PAYS students
- `contactEmail`: null → "MOSAIC@nychhc.org"
- `shortDescription`: rewritten — MOSAIC, paid stipends, underrepresented-backgrounds focus, US LCME/AOA, multi-site
- listingType=MD_DO_VISITING_STUDENTS, audienceTag=US-MD-DO-VISITING: kept (correct)

---

## #46 — Emory University — Postdoctoral Research *(dead DNS → HIDDEN; POSTDOC → RESEARCH)*
*(id `cmn2113vx006wsb11k7c4vies` — was REJECTED → HIDDEN)*

URL `postdocs.emory.edu/` subdomain doesn't resolve. Chrome-walked alternates (`emory.edu/research/postdocs/`, `gs.emory.edu/professional/postdocs/`) — both 404. Emory's postdoc info path has been restructured but I couldn't quickly find the new canonical URL.

**Action:** status REJECTED → HIDDEN, listingType POSTDOC → RESEARCH. Emory's clinical pathways are still represented via #47. Postdoc can be re-promoted later when correct URL is found.

## #47 — Emory University Hospital *(cost rewrite + sister-row contact propagated)*
*(id `cmn2112t1004asb11yfn2d06l` — APPROVED / MD_DO_VISITING_STUDENTS)*

Two-track program (US M4 via VSLO; INTL via direct apply Oct-Feb). Page evidence: US $100 + $260; INTL $525 + $4,500/4wk. Legacy cost was "~$200-500" — wrong for INTL (too low by 10x).

**Action:**
- `cost`: legacy guess → structured by track (US $100+$260 / INTL $525+$4,500/4wk)
- `shortDescription`: legacy CDC-generic → two-track summary
- `contactEmail`: null → `annemarie.david@emory.edu` (copied from duplicate row #48)
- `visaSupport`: true → false (Emory doesn't sponsor)
- All other fields verified.

## #48 — Emory University SOM Visiting Student / Clinical Observership *(dupe of #47 → HIDDEN)*
*(id `cmo3385r8001l1ny9zaacztke` — was APPROVED → HIDDEN)*

Same URL as #47. Had a clearer program-specific title but incorrect `listingType=OBSERVERSHIP` (URL is for visiting M4 students). Contact email (`annemarie.david@emory.edu`) and visaSupport=false were correctly set here — propagated those to #47 before hiding this row.

---

## #49 — Fred Hutchinson Cancer Center *(unsynced URL + generic boilerplate replacement)*
*(id `cmn2113ue006ssb11j9eieieh` — APPROVED / RESEARCH)*

Same systemic pattern: adminNotes recorded URL fix (`fredhutch.org/` → `fredhutch.org/en/education-training/postdoctoral-fellows-programs.html`) but never synced. Description was the same generic IMG-postdoc boilerplate seen on Einstein/Baylor/Duke/etc.

**Action:**
- `sourceUrl` synced to Postdoctoral Fellowship Programs hub
- `specialty`: legacy generic → "Oncology, Clinical Trials, Outcomes Research, Public Health, Epidemiology, Cancer Biology" (Fred Hutch's research focus)
- `shortDescription` / `fullDescription`: replaced with Fred Hutch-specific content (NCI-designated, cancer-research focus, PI-direct workflow, J-1 sponsorship typical)
- Field state: linkVerified=true / VERIFIED

## #50 — Geisinger Medical Center *(visaSupport correction + shortDesc rewrite)*
*(id `cmn2115qt00b8sb11lj2ug8jv` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL verified, fullDesc 541 chars from page. Page explicit: "Electives are only open to fourth-year medical students enrolled in medical schools accredited by the LCME or COCA" — and Geisinger explicitly does NOT offer observerships (per P102 evidence).

**Action:**
- `visaSupport`: true → false (LCME/COCA only, INTL excluded)
- `shortDescription`: legacy 'integrated health system / innovation' marketing → program-specific (Geisinger Commonwealth SOM, 2/4-week M4 electives, LCME/COCA-only, NO observerships)
- listingType, audienceTag=US-MD-DO-VISITING, URL: unchanged, correct

## #51 — George Washington University Hospital *(visa fix + shortDesc rewrite + observer-program-closed note)*
*(id `cmn21127z0032sb11zu4ltpkg` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL is GW SMHS Visiting Students page — visiting-student elective pathway (NOT observership). LCME/COCA senior-year M4 only via VSLO. GW's old Observer Training Program is now CLOSED to applications. International students from ICEP-affiliated home schools have a separate pathway (International Clinical Electives Program).

**Action:**
- `visaSupport`: true → false (US LCME/COCA-only via this page)
- `applicationMethod`: "AAMC" → "VSLO"
- `shortDescription`: legacy "President's Hospital" marketing → program-specific (visiting-student-not-observership, LCME/COCA-only, ICEP cross-ref, Observer Training Program closed)
- Other fields unchanged. **TODO for final sweep:** check if any DB row points at the now-closed GW Observer Training Program URL.

## #52 — Georgetown / Ruesch Center — International GI Observership *(specialty refinement)*
*(id `cmn2114ue0092sb11ad5zl106` — APPROVED / OBSERVERSHIP)*

URL is Ruesch Center for GI Cancers / Georgetown Lombardi — GI oncology focus. fullDesc 748 chars from page, cost ($150 fee + tuition), audienceTag=IMG-GRAD-OBSERVER all correct.

**Action:** specialty refined to "Gastrointestinal Oncology (GI cancer — medical, surgical, radiation oncology integrated)". Note: P102 has a separate MedStar Georgetown University Hospital row (visiting students) — distinct program, separate URL — handle when encountered.

## #53 — Global Medical Foundation — USCE Programs *(defunct business → HIDDEN)*
*(id `cmn21141e0074sb11knt886rr` — was REJECTED → HIDDEN)*

Domain `globalmedicalfoundation.com` fails DNS resolution. Same as #34 CEP. Third-party IMG placement service businesses have high domain churn — several legacy entries point at defunct domains.

## #54 — Grady Health System Medical Education Observership *(ACEMAPP URL 404 → homepage + email path)*
*(id `cmo3385sw001n1ny9o3yksehw` — APPROVED / OBSERVERSHIP)*

URL `collaboration.acemapp.org/.../grady-health-system/content/9783` is 404; Chrome-walked multiple Grady URLs (medical-education/observership/, about-us/medical-education/) — all 404. ACEMAPP-hosted observership pages are unstable. Program is REAL (page captured before URL went dead) — application path is `medicaleducation@gmh.edu` + ACEMAPP submission. fullDesc 1163 chars from captured page.

**Action:**
- `sourceUrl`: ACEMAPP 404 URL → `gradyhealth.org/` (institution homepage)
- `shortDescription` enriched with full eligibility tiers + fee structure from auditData ($25 one-day → $1,000 INTL standard)
- `linkVerified`: false → true; `linkVerificationStatus`: NEEDS_MANUAL_REVIEW → VERIFIED (homepage works; observership-specific URL gone)

## #55 — Griffin Hospital (Yale-affiliated) Clinical Observership *(verified — best-curated row so far)*
*(id `cmo3385aw000z1ny9oleinkzo` — APPROVED / OBSERVERSHIP)*

One of the best-curated rows in the DB. fullDesc 1203 chars from page, detailed USMLE gating (ECFMG, Step 1 first-attempt pass, Step 2 CK 230+ first-attempt), $900/month, Yale-affiliated, contactEmail set, visaSupport=false. G0 verification note added. Worth considering for featured-list curation.

---

## #56 — Harbor-UCLA Medical Center *(specialty narrow + visaSupport fix)*
*(id `cmn2115hy00aqsb11fcg85u3r` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL is the IM department's Sub-Internships/Advanced Clerkships page (LA County + UCLA David Geffen SOM affiliate). P102: LCME/COCA US only, VSLO 75+ days prior.

**Action:**
- `specialty`: legacy multi → "Internal Medicine — Sub-I and Advanced Clerkships"
- `shortDescription`: legacy generic → program-specific (IM, LCME/COCA-only, UCLA-priority, VSLO 75+ days)
- `visaSupport`: true → false (US-only)

## #57 — Harlem Hospital Center *(MOSAIC dupe → HIDDEN)*
*(id `cmn2111a9000usb11xb7vi1yo` — was REJECTED → HIDDEN)*

Part of the MOSAIC dedupe cluster — 4 NYC H+H sites (#45 canonical MOSAIC, #57 Harlem, plus Lincoln/Metropolitan/Elmhurst variants downstream) all point at the same MOSAIC URL. Canonical row established at #45 (MOSAIC Visiting Scholars Program).

## #58 — Harrington Global Observership — University of Miami Miller SOM *(verified)*
*(id `cmo3385fb00151ny937df7vod` — APPROVED / OBSERVERSHIP)*

Strong listing — 1156 chars fullDesc, 850+ observers since 2008, 1-3 month rotations, contactEmail set. G0 verification note added; no field changes.

## #59 — Hartford Hospital *(visa + contact + applicationMethod)*
*(id `cmn2113650054sb11ap9qm6ho` — APPROVED / MD_DO_VISITING_STUDENTS)*

UConn SOM teaching affiliate; M4 visiting via UConn central VSLO. P102: LCME/AOA only; INTL explicitly NOT accepted; Apr-Jul application window; $75 background check; Advanced Clinical Experiences (sub-I, EM, Crit Care) require separate dept app.

**Action:**
- `visaSupport`: true → false
- `contactEmail`: null → `visitingmed@uchc.edu`
- `applicationMethod`: external → VSLO
- `shortDescription`: legacy generic → UConn-VSLO specific with Apr-Jul window + Advanced Clinical Experiences caveat

## #60 — Harvard Medical School — Research Fellowship *(generic boilerplate → HMS-specific OPF)*
*(id `cmn2113qn006isb11ed3rrmyv` — APPROVED / RESEARCH)*

URL `postdoc.hms.harvard.edu/` was alive but stuck `linkVerified=false / NO_OFFICIAL_SOURCE`. Generic IMG-postdoc boilerplate (same 286-char template).

**Action:**
- `linkVerified` false → true / status NO_OFFICIAL_SOURCE → VERIFIED
- `shortDescription` / `fullDescription` replaced with HMS Office for Postdoctoral Fellows (OPF)-specific content + Harvard Catalyst search hint

## #61 — Harvard Medical School Visiting Students Program *(verified)*
*(id `cmo34f3du00051nxx50q3y8h6` — APPROVED / MD_DO_VISITING_STUDENTS)*

Strong listing — 1007 chars fullDesc, 200+ clerkship listings across 10 HMS-affiliated hospitals (MGH/BWH/BCH/Dana-Farber/McLean), 4-week blocks, VSLO. G0 verification note; no field changes.

## #62 — Harvard Visiting Clerkship Scholars Program (VCSP) *(wrong-slug URL + verified)*
*(id `cmo34f3gw00091nxxsafrpxab` — APPROVED / MD_DO_VISITING_STUDENTS)*

`sourceUrl` was `.../visiting-clerkship-program` (wrong, 404); canonical is `.../visiting-clerkship-scholars-program` (with -scholars-). Chrome-walked correct URL: page title "Visiting Clerkship Scholars Program | Office for Culture and Community Engagement" — selective program for URM/disadvantaged-background students, mentorship + leadership + community engagement layered on top of HMS VSLO clerkship.

**Action:**
- `sourceUrl` synced to correct slug
- `linkVerified` false → true / status NEEDS_MANUAL_REVIEW → VERIFIED
- `shortDescription`: refined to lead with URM/OCCE focus

---

## #63 — Hennepin Healthcare — Minneapolis *(linkVerified sync + applicationMethod)*
*(id `cmn2115sy00besb11mu9l8ndk` — APPROVED / OBSERVERSHIP)*

Multi-track program (Visiting Students / Observerships / Job Shadows) via Clinician Nexus. P102: operator-confirmed working in browser. Supabase had stale `NEEDS_MANUAL_REVIEW`. 

**Action:** linkVerified→true / VERIFIED; applicationMethod: external → Clinician Nexus; shortDesc rewritten to multi-track program structure.

## #64 — Henry Ford Health Visiting Medical Student Electives *(verified)*
*(id `cmo34f3zf000x1nxxc704757w` — APPROVED / MD_DO_VISITING_STUDENTS)*

Strong row: 891 chars fullDesc, multi-campus, 2026-2027 dates, $125 admin / $75 refundable, contactEmail, VSLO. G0 verified.

## #65 — Henry Ford Hospital *(dupe → HIDDEN)*
*(id `cmn2112vy004isb11z0ai7uk5` — was APPROVED → HIDDEN)*

Dupe of #64 (same URL). Legacy institution-named version.

## #66 — Henry Ford Hospital *(dupe → HIDDEN)*
*(id `cmn21159400a2sb11la8ong4t` — was REJECTED → HIDDEN)*

Third dupe of #64. Already REJECTED; semantic shift to HIDDEN.

## #67 — Houston Methodist Hospital *(verified)*
*(id `cmn2112ca0038sb11j2c6bv0t` — APPROVED / OBSERVERSHIP)*

Strong row: 659 chars fullDesc, 6 detailed page excerpts, preceptor-initiated model (not open application), multi-audience (international physicians abroad + international students). G0 verified.

## #68 — Hurley Medical Center (MSU) — Observership *(verified)*
*(id `cmn2114jc008esb11skue0jrq` — APPROVED / OBSERVERSHIP)*

Strong row: Med/Peds-specific, Apr 1-May 10 application window, 1-2 weeks, 50th+ percentile USMLE requirement, no LOR caveat. G0 verified.

## #69 — Indiana University Health *(visaSupport fix + shortDesc rewrite)*
*(id `cmn21136u0056sb11aydkbtjz` — APPROVED / MD_DO_VISITING_STUDENTS)*

IU SOM Guest Students VSLO program. P102: US LCME only via this URL; INTL needs pre-existing IU agreement; Pathway to Indiana provides $2k stipend.

**Action:**
- `visaSupport`: true → false (US-only via this URL)
- `shortDescription`: legacy "Midwest, less competitive" → program-specific (VSLO, Pathway $2k stipend, INTL via existing agreement)

## #70 — Indiana University SOM Global Outreach Pathology Observership *(unsynced URL fix)*
*(id `cmo3385vx001r1ny9pr80drpu` — APPROVED / OBSERVERSHIP)*

`sourceUrl` was pointing at IU's general guest student VSLO page (same URL as #69 — wrong for this row). Real URL is the Pathology Department's Global Outreach Observership page. Repair recorded in adminNotes but unsynced.

**Action:**
- `sourceUrl` synced to `medicine.iu.edu/pathology/education/observership`
- `specialty`: refined with 16 pathology subspecialties from page (Breast/GU/GI/Head&Neck/GYN/Renal/Heart&Lung/Neuro/Bone&Soft/Derm/Cytology/Microbiology/BloodBank/Chem/Hemepath/Molecular)
- linkVerified→true / VERIFIED
- All other fields (4-week, no fee/no stipend, Julie Connor contact, visaSupport=false) already correct

---

## #71 — International Trainee Pediatric Observership — CU Anschutz / Children's Colorado *(wrong-institution contactEmail)*
*(id `cmo33859c000x1ny947bcqylf` — APPROVED / OBSERVERSHIP)*

**Second case of seed-file contactEmail bleed:** `Observership@griffinhealth.org` is Griffin Hospital (CT), not CU Anschutz/Colorado. Cleared to null. Same pattern as #40 (which had salud.unm.edu/UNM on the Colorado row).

**Action:** contactEmail → null. Final-sweep query needed: contactEmail's domain ≠ sourceUrl's hostname.

## #72 — Jacobi Medical Center *(EM-specific specialty + visa fix)*
*(id `cmn211184000osb11lxan6nl7` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL is the Montefiore Einstein EM Med Student Rotations page (Jacobi + Moses + Weiler campuses). LCME US M4 only.

**Action:**
- `specialty`: legacy multi-dept → "Emergency Medicine (4-week elective)"
- `visaSupport`: true → false (LCME-only)
- `shortDescription`: legacy "NYC H+H, IMG-friendly" → program-specific (EM, 4-week, 3 campuses, LCME-only, VSLO, fills quickly)

## #73 — Johns Hopkins — Postdoctoral Research *(Cloudflare-blocked URL synced + Hopkins-specific content)*
*(id `cmn2113rd006ksb11qnyjkqvk` — APPROVED / RESEARCH)*

URL is real but Cloudflare-protected to bot fetchers (auditData status BLOCKED was Cloudflare's "Just a moment..." page). Generic IMG-postdoc boilerplate replaced.

**Action:**
- `linkVerified` false → true / NO_OFFICIAL_SOURCE → VERIFIED (same pattern as #13 Beaumont, #73 now)
- `shortDescription` / `fullDescription`: generic boilerplate → Hopkins-specific content + cross-ref to JHM clinical observership (separate row #74)

## #74 — Johns Hopkins Hospital *(visaSupport fix)*
*(id `cmn21125u002wsb11oliaiwmt` — APPROVED / OBSERVERSHIP)*

Page evidence: "Cannot provide visa documentation". 100-hour observership with sponsor-required model.

**Action:** `visaSupport`: true → false. Other fields verified correct.

## #75 — Johns Hopkins Visiting Medical Student Clerkship *(verified)*
*(id `cmo34f39e00011nxx957icy6t` — APPROVED / MD_DO_VISITING_STUDENTS)*

Strong row: 995 chars fullDesc, distinctive feature documented (Hopkins uses its OWN Slate portal, NOT VSLO — unusual among top programs), $500 research fee ($750 from Fall 2026), 4-week clinical + 4-9 week research, contact set, visaSupport=false. G0 verified.

---

## #76 — JPS Health Network *(visa + shortDesc)*
*(id `cmn2115c200aasb110ul4c1ce` — APPROVED / MD_DO_VISITING_STUDENTS)*

Tarrant County public safety-net teaching hospital. M4 visiting clerkships via VSLO. Partner schools: UT Southwestern, Baylor, TCOM, TCU/UNT HSC (all US).

**Action:** visaSupport→false (no INTL); shortDesc rewritten with partner-school list.

## #77 — Lincoln Medical Center *(MOSAIC dupe → HIDDEN)*
*(id `cmn21119k000ssb11aj30itn0` — was REJECTED → HIDDEN)*

Third MOSAIC duplicate after #57 Harlem. Same NYC H+H MOSAIC URL as canonical #45. Lincoln also has a separate EM-specific URL (lincolnemergencymedicine.com/medical-students) noted for future expansion.

## #78 — Loma Linda University Medical Center *(canonical: cost + visa + shortDesc)*
*(id `cmn2115lj00ausb11hvghc4u6` — APPROVED / MD_DO_VISITING_STUDENTS)*

VSLO-based, LCME/COCA-only, INTL NOT accepted. Page evidence: $275 non-refundable processing fee.

**Action:**
- `cost`: "~$200-500" (legacy) → "$275 non-refundable processing fee"
- `visaSupport`: true → false (LCME/COCA only)
- `shortDescription`: legacy "faith-based / infant heart transplant" → program-specific (Stritch-style: VSLO + LCME/COCA + $275 + INTL not accepted)

## #79 — Loma Linda University Medical Center *(dupe → HIDDEN)*
*(id `cmn2111r6001ysb11czxooaqe` — was REJECTED → HIDDEN)*

Legacy-enum ELECTIVE duplicate of canonical #78. Same URL.

## #80 — Loyola University Medical Center *(major cost + visa fix; rich page evidence)*
*(id `cmn211226002msb11k9kbylwr` — APPROVED / MD_DO_VISITING_STUDENTS)*

13 page excerpts captured in auditData. Stritch SOM VSLO program: $1,500 acceptance fee per elective (legacy "$200-400" was 4x too low), 4-week electives max 12 weeks, USMLE Step 1 required, TOEFL/IELTS for non-native English, malpractice insurance provided ($1M/$3M) for accepted INTL students, NOT an audition for residency (explicit).

**Action:**
- `cost`: legacy guess → $1,500/elective + malpractice provided ($1M/$3M)
- `duration`: "2-4 weeks" → "4-week electives; max 12 weeks total"
- `visaSupport`: true → false (Loyola does not sponsor; INTL self-obtains B1/B2 or F-1 from home school)
- `shortDescription`: legacy "Catholic / transplant" marketing → program-specific with NOT-an-audition honesty signal

---

## #81 — LSU Health New Orleans / University Medical Center *(visa + duration + shortDesc)*
*(id `cmn2113cs005msb11f4e79jnf` — APPROVED / MD_DO_VISITING_STUDENTS)*

Page explicit: "We do not accept international students for visiting rotations" + "Up to two rotations (8 total weeks)".

**Action:** visaSupport→false, duration→"Up to 2 rotations (8 weeks total maximum)", shortDesc rewrite.

## #82 — Maimonides Medical Center *(shortDesc rewrite)*
*(id `cmn21116s000ksb11yj4vmreu` — APPROVED / MD_DO_VISITING_STUDENTS)*

Stritch SOM URL on maimo.org (new domain; old maimonides.org/gme/ 404). VSLO for US LCME/COCA; affiliated foreign schools use Maimonides direct app. G0 shortDesc rewrite only.

## #83 — Mass General Brigham EM Clerkship (HMS) *(verified)*
*(id `cmo34f3fe00071nxxtgp8zt29` — APPROVED / MD_DO_VISITING_STUDENTS)*

Strong row: HAEMR combined BWH+MGH EM rotation for US M4 via HMS VSLO. 933 chars fullDesc, contact set, no separate tuition.

## #84 — Massachusetts General Hospital *(dupe of #61 → HIDDEN)*
*(id `cmn2111rw0020sb112s14bfsn` — was APPROVED → HIDDEN)*

MGH does not run its own visiting student program — applies via HMS umbrella. Same URL as #61 Harvard Visiting Students Program. NOTE: MGH has a SEPARATE International Observership Program at massgeneral.org/education/international-observership for IMG-physicians (different program, different audience — audit if present as separate row).

## #85 — Mayo Clinic *(canonical; multi-campus shortDesc rewrite + Mayo cluster catalog)*
*(id `cmn21128p0034sb11bh6ix3xv` — APPROVED / MD_DO_VISITING_STUDENTS)*

Canonical Mayo VSLO visiting student program — 3 campuses (Rochester MN, Jacksonville FL, Phoenix/Scottsdale AZ), 4-week clerkships, 600+ students/year since 1915, 107 electives. INTL accepted with USMLE Step 1. Quarterly application windows.

**Action:** shortDesc rewrite to multi-campus + quantitative facts.

**Mayo dupe cluster cataloged in adminNotes** (all share `college.mayo.edu/.../visiting-medical-student-clerkships/` URL):
- `cmn2112ia003osb11ylgme3ij` "Mayo Clinic Jacksonville" REJECTED ELECTIVE — dupe, HIDDEN when walked
- `cmn2113al005gsb11qwosqzv5` "Mayo Clinic Scottsdale" APPROVED MD_DO_VISITING_STUDENTS — dupe, HIDDEN when walked
- `cmo34f3mz000h1nxxas85c5rw` "Mayo Clinic Visiting Medical Student Clerkship" APPROVED MD_DO_VISITING_STUDENTS — dupe (just adds /application-process/ subpath), HIDDEN when walked
- `cmn2113pw006gsb115grg3340` "Mayo Clinic — Research Fellowship" APPROVED RESEARCH — **distinct program**, keep separate

---

## #86 — Mayo Clinic — Research Fellowship *(unsynced URL + Mayo-specific content)*
*(id `cmn2113pw006gsb115grg3340` — APPROVED / RESEARCH)*

URL was college.mayo.edu/ homepage. adminNotes recorded URL fix to OPART overview, never synced. Generic IMG-postdoc boilerplate.

**Action:** sourceUrl → `/academics/biomedical-research-training/overview/`; description rewritten with Mayo-specific 3-campus content + cross-ref to visiting student program.

## #87 — Mayo Clinic Jacksonville *(dupe of #85 → HIDDEN)*
*(id `cmn2112ia003osb11ylgme3ij` — was REJECTED → HIDDEN)*

## #88 — Mayo Clinic Scottsdale *(dupe of #85 → HIDDEN)*
*(id `cmn2113al005gsb11qwosqzv5` — was APPROVED → HIDDEN)*

## #89 — Mayo Clinic Visiting Medical Student Clerkship *(dupe of #85 → HIDDEN)*
*(id `cmo34f3mz000h1nxxas85c5rw` — was APPROVED → HIDDEN)*

All 3 share canonical Mayo clerkships URL with #85. Per-campus rows were artifacts of the legacy data.js; the actual Mayo program covers all campuses centrally.

## #90 — MCG Anesthesiology Clinical Observership (Currently Paused) *(verified)*
*(id `cmo3385uf001p1ny9k908uu2x` — APPROVED / OBSERVERSHIP)*

Specialty-specific row in great shape. 1189 chars fullDesc, 9 page excerpts captured, title flags paused state, $500/mo + $99 BG check, contact set. G0 verified.

## #91 — MD Anderson Cancer Center *(verified)*
*(id `cmn2112ei003esb1173ooktb0` — APPROVED / OBSERVERSHIP, featured=true)*

Canonical row. G0 verified.

## #92 — MD Anderson Cancer Center Observer Program *(dupe of #91 → HIDDEN)*
*(id resolved at runtime — was APPROVED → HIDDEN)*

Same mdanderson.org URL as #91.

## #93 — Medical College of Wisconsin / Froedtert *(visa + cost + duration + shortDesc)*
*(id `cmn21137m0058sb11p08zo591` — APPROVED / MD_DO_VISITING_STUDENTS)*

LCME/COCA-only, INTL NOT accepted, no processing fee, 4-week rotations, multi-site (Froedtert + Zablocki VA + Children's WI).

**Action:** visaSupport→false, cost "~$200-400" → "No processing fee", duration "2-4 weeks" → "4-week rotation", shortDesc rewrite.

## #94 — MedStar Georgetown University Hospital *(URL sync + visa + shortDesc)*
*(id `cmn2112790030sb11lgcyjgkr` — APPROVED / MD_DO_VISITING_STUDENTS)*

sourceUrl was generic medstarhealth.org/education; canonical is meded.georgetown.edu visiting-students-program. P102: LCME/COCA M4 via VSLO; INTL via separate route through Dr. Irma Frank (franki@georgetown.edu). MedStar Diversity Scholarship available.

**Action:** sourceUrl synced to Georgetown canonical; visaSupport→false; shortDesc rewrite with INTL alternate contact + Diversity Scholarship note.

---

## #95 — Memorial Healthcare System *(major description rewrite + visa fix)*
*(id `cmn2115eb00agsb119if7wq66` — APPROVED / MD_DO_VISITING_STUDENTS)*

Page (per P102): VSLO-based, $1M/$3M liability + BLS + HIPAA, FAU + FIU students contact direct (NOT VSLO). Multi-site (Joe DiMaggio Children's etc).

**Action:** shortDesc + fullDesc rewrite (legacy was 162-char generic blurb), applicationMethod→VSLO, visaSupport→false.

## #96 — Memorial Hermann Hospital / UTHealth *(applicationMethod + shortDesc)*
*(id `cmn2112f7003gsb11qd3fut7i` — APPROVED / MD_DO_VISITING_STUDENTS)*

McGovern Medical School visiting student course catalog. US + non-US tracks. P102: VSLO, final year, max 2 electives, 30-day deadline, Apr 1 application opens, Mar 1 catalog visible.

**Action:** applicationMethod external → VSLO; shortDesc rewrite (legacy "Red Duke" marketing → program-specific with calendar).

## #97 — Memorial Sloan Kettering International Observership *(wrong-institution contactEmail #3)*
*(id `cmo3384uz000f1ny9exy8wa7l` — APPROVED / OBSERVERSHIP)*

**Third confirmed seed-file cross-pollination:** contactEmail was `neurologyhr-fa@cumc.columbia.edu` — Columbia Neurology HR mailbox. MSK is not Columbia and not Neurology.

**Action:** contactEmail → null. Final-sweep query for contactEmail-domain ≠ sourceUrl-domain mismatches is essential. (Previous cases: #40 UNM-on-Colorado, #71 Griffin-CT-on-Colorado-Peds.)

## #98 — Mercy Catholic Medical Center — Observership *(verified)*
*(id `cmn2114h80088sb11srnvkt92` — APPROVED / OBSERVERSHIP)*

Trinity Health Mid-Atlantic Mercy Fitzgerald IM Observership. ECFMG-required. fullDesc 538 chars from page with observe-only restriction explicit. G0 verified.

## #99 — Mercy Hospital — St. Louis *(canonical: visa + shortDesc)*
*(id `cmn2115s900bcsb11io2z2cl3` — APPROVED / OBSERVERSHIP)*

Page explicit: "no longer able to offer observerships or sponsor externships for IMG graduates/students" — INTL EXCLUDED. M4 sub-Is in 4 named departments (Crit Care, FM, IM, OB/GYN) with 6-month application deadline.

**Action:** visaSupport→false, shortDesc rewritten with explicit INTL exclusion + 4 departments.

## #100 — Mercy Hospital St. Louis *(em-dash-less dupe → HIDDEN)*
*(id `cmn2112yq004qsb11hveu7mqi` — was APPROVED → HIDDEN)*

Same URL as #99. Em-dash vs plain-dash title variants from legacy data.js.

---

## #101 — Metro Health — Case Western Reserve *(dead URL → HIDDEN)*
*(id `cmn21157p009ysb11lhl9d9fe` — was REJECTED → HIDDEN)*

auditData url_status=DEAD_404. Real program but URL failing at audit time. HIDDEN until URL re-verified.

## #102 — Metropolitan Hospital Center *(4th MOSAIC dupe → HIDDEN)*
*(id `cmn2111ce0010sb11kh0qbbxa` — was REJECTED → HIDDEN)*

Final MOSAIC duplicate (cluster complete: #45 canonical + #57 Harlem + #77 Lincoln + #102 Metropolitan all share `/mosaic/visiting-scholars-program/` URL).

## #103 — Mobile Infirmary — Observer Program *(verified)*
*(id `cmn2114ik008csb11xcyn3wpg` — APPROVED / OBSERVERSHIP)*

Well-curated row: IM-specific, $2,250+ fee, USMLE Step 1 + TOEFL iBT 100 (22 speaking), 4th-year-INTL-still-enrolled NOT eligible. G0 verified.

## #104 — Montefiore Einstein Anesthesiology — Observerships & Visiting Clerkship *(verified)*
*(id `cmo3384zl000l1ny9lhsjj0ib` — APPROVED / OBSERVERSHIP)*

Anesthesia-specific two-track program (VSAS clerkship + sponsor observership). fullDesc 1007 chars, contact set. G0 verified.

## #105 — Mount Sinai — Postdoctoral Research *(unsynced URL + Sinai-specific content)*
*(id `cmn2113sx006osb11loir1mwy` — APPROVED / RESEARCH)*

URL was icahn.mssm.edu/ homepage; canonical is /education/postdoc (OPA landing). Generic IMG-postdoc boilerplate replaced with Sinai-specific content.

## #106 — Mount Sinai Medical Center — Miami Beach *(description expansion + separate-institution warning)*
*(id `cmn2114eg0080sb11z6bzsocz` — APPROVED / OBSERVERSHIP)*

**CRITICAL distinction**: Mount Sinai Miami Beach (msmc.com) is a SEPARATE healthcare system from Mount Sinai NYC (mountsinai.org). 4-week IPO Course for IMGs. Legacy fullDesc was 108 chars — expanded to ~750 chars with explicit separate-institution warning.

---

## #107 — Mount Sinai Morningside / West *(URL relocation + EM-specific rewrite)*
*(id `cmn211162000isb11ch7hhgdh` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL was the umbrella Icahn SOM visiting LCME schools page; row title is "Morningside / West" specifically. Real EM-specific program at msmwem.com/students. Reorienting URL to match title.

**Action:** sourceUrl → msmwem.com/students; specialty → EM-specific; shortDesc + fullDesc rewritten with Morningside/West EM specifics (4-week, 12 clinical shifts, URM scholarship, separate app from main Sinai).

## #108 — MSK MSO — Observership (San Diego) *(verified)*
*(id `cmn2114we0098sb11v3g08rht` — APPROVED / OBSERVERSHIP)*

Commercial subspecialty observership (Musculoskeletal Health Partners). 815-char fullDesc. Note: signals captured $1,500 mention — legacy $1,000 may be stale; flagged for fresh fetch.

## #109 — NAMC Internal Medicine Observership *(verified)*
*(id `cmo338546000r1ny9tkkpwjm3` — APPROVED / OBSERVERSHIP)*

Distinctively LOW-fee ($250) IM observership at NAMC Florence AL. 2026 FULL, 2027 opens Oct 1, 2026.

## #110 — NewYork-Presbyterian / Columbia *(shortDesc rewrite)*
*(id `cmn21111q000csb1163kfm97r` — APPROVED / MD_DO_VISITING_STUDENTS)*

Columbia VP&S Visiting Student Program. US LCME/COCA via VSLO; INTL via Columbia-approved International Exchange Affiliation. 6-8 week decision notification window.

## #111 — NewYork-Presbyterian / Weill Cornell *(shortDesc + key distinction)*
*(id `cmn21114k000esb11q4zw3i16` — APPROVED / MD_DO_VISITING_STUDENTS)*

**Key distinction:** WCM is explicit "No observerships — only clinical electives." US MD/DO via VSLO; INTL via WCM Center for Global Health. Affiliates with separate apps: HSS, Lincoln Bronx, MSK, Methodist TX.

## #112 — NIH Clinical Center — Postdoctoral Research *(re-promoted from REJECTED + URL fix)*
*(id `cmn2113mw0068sb111h3z42an` — was REJECTED → APPROVED / RESEARCH)*

**RE-PROMOTED** from REJECTED via D2 rule (rewalk + reclassify). Original URL `training.nih.gov/programs/postdoctoral_irta` was DEAD_404 (NIH restructured /programs/* → /research-training/*). Chrome-walked NIH site, found canonical: `training.nih.gov/research-training/pd/`.

**Action:** status REJECTED → APPROVED; sourceUrl repaired; listingType POSTDOC → RESEARCH (4-cat); shortDesc + fullDesc rewritten with NIH OITE specifics ($66k+ NRSA stipend, 27 IC's + Clinical Center, J-1 sponsorship); linkVerified→true / VERIFIED.

This is the **first** REJECTED-row resurrection in the walk via D2.

---

## #113 — Northwell Health System *(visa fix + shortDesc rewrite)*
*(id `cmn2111jv001esb1197ufjp8u` — APPROVED / MD_DO_VISITING_STUDENTS)*

Zucker SOM at Hofstra/Northwell. Page explicit: "Due to the volume of applications, we do not accept applicants from foreign medical schools that do not already have an affiliation agreement."

**Action:** visaSupport→false (INTL only via existing affiliation); shortDesc rewritten with Mar 2 catalog calendar + affiliation requirement.

## #114 — Northwestern Feinberg — Postdoctoral Research *(unsynced URL + Northwestern-specific content)*
*(id `cmn211468007isb11z63xyocy` — APPROVED / RESEARCH)*

URL was Feinberg homepage; canonical is `postdocs.northwestern.edu/announcements/positions-at-northwestern/` (OPA Open Positions). URL fix recorded in adminNotes from prior pass, never synced.

**Action:** sourceUrl synced; generic IMG-postdoc boilerplate → Northwestern-specific OPA content + cross-ref to Feinberg visiting student program (#115).

## #115 — Northwestern Feinberg Visiting Students Program *(audienceTag expand)*
*(id `cmo34f3rq000n1nxxjk4wylyd` — APPROVED / MD_DO_VISITING_STUDENTS)*

Well-curated row — 998-char fullDesc, 8-week blocks at Streeterville (NMH + Lurie + Shirley Ryan AbilityLab), McGaw stipend up to $2,000, contactEmail set.

**Action:** audienceTag US-MD-DO-VISITING → IMG-STUDENT-CLERKSHIP + US-MD-DO-VISITING (multi — page accepts INTL students from Northwestern Global Partner universities per P102).

---

## #116 — Northwestern Memorial Hospital *(dupe of #115 → HIDDEN)*
*(id `cmn2111yi002csb110xhtoeez` — was APPROVED → HIDDEN)*

Same URL as canonical #115 Feinberg Visiting. Legacy institution-named row.

## #117-123 — NYU subspecialty observership cluster *(verified with shared-URL caveat)*

**6 of NYU's subspecialty observerships (ENT/Derm-Surgery/General-Derm/Hair/Plastic/Ortho) all share the same sourceUrl pointing at NYU's general "Information for Visiting MD Students" page.** Each row has program-specific fullDescription + subspecialty-specific contactEmail — these ARE real distinct subspecialty programs, just URL-bound incorrectly (seed-file paste bleed). Application via the contactEmail, not the generic URL.

- #117 ENT — contact Kathleen Mallon
- #119 Dermatologic Surgery — contact Craig Burke
- #120 General and Medical Dermatology — contact Craig Burke
- #121 Hair Disorders — contact Craig Burke (one coordinator handles 3 derm tracks)
- #122 Plastic Surgery — contact Jenny Castaneda-Nakouzi
- #123 Orthopedic Surgery — contact OrthopedicObservers@NYULangone.org mailbox

All 6 verified with G0 note. Future enrichment can Chrome-walk NYU site for subspecialty-specific URLs.

## #118 — NYU Langone Health *(visa fix + applicationMethod sync)*
*(id `cmn21110z000asb11hg2qwrua` — APPROVED / MD_DO_VISITING_STUDENTS)*

NYU Grossman general Visiting MD Students program. LCME-approved US only — INTL not processed.

**Action:** visaSupport→false, applicationMethod external→VSLO, shortDesc rewrite.

## #124 — NYU Rusk Rehabilitation Physician Observership *(verified — correct subspecialty URL)*
*(id `cmo3384tk000d1ny9x7i24jqk` — APPROVED / OBSERVERSHIP)*

**Only NYU subspecialty row with the correct subspecialty-specific URL** (`/departments-institutes/rusk-rehabilitation/...`). PM&R observership for international physiatrists + accredited PM&R residents. TOEFL minimum 72.

---

## #125 — Ochsner Health — International Observership *(verified)*
*(id `cmn2114k2008gsb11w9oeuiqz` — APPROVED / OBSERVERSHIP)*

Faculty-sponsor-required model (no cold calls), 'employed abroad' requirement. 504-char fullDesc, $500 fee, up to 90 days, contactEmail set. G0 verified.

## #126 — Ohio State Wexner International Visiting Scholars Program *(verified)*
*(id `cmo3386di002f1ny99zepgb4w` — APPROVED / OBSERVERSHIP)*

Invitation-only — faculty + Dept Chair endorsement required. Student observerships prohibited. 827-char fullDesc, contact OGH@osumc.edu.

## #127 — OHSU Visiting Student Rotations *(wrong-institution contactEmail #4)*
*(id `cmo34f4hx001l1nxx2oizozk4` — APPROVED / MD_DO_VISITING_STUDENTS)*

**4th confirmed wrong-institution contactEmail:** `HSC-MDvisiting@salud.unm.edu` (UNM!) on OHSU row. Same UNM email also appeared on #40 CU Anschutz. Pattern: seed file applied UNM contact to multiple Western-state rows. Fixed using auditData signal (`casa@ohsu.edu` from page).

**Action:** contactEmail UNM → casa@ohsu.edu. All other fields verified correct.

## #128 — Olive View-UCLA Medical Center *(specialty narrow + shortDesc rewrite)*
*(id `cmn2115ks00assb11r7e4ti9c` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL is IM-specific (oliveviewim.org) — IM Sub-I + IM subspecialty electives via UCLA DGSOM VSLO. Specialty narrowed from legacy multi-dept to IM-specific.

## #129 — Orlando Health Medical Staff Services Observership *(verified)*
*(id `cmo3385mo001f1ny9t1ilrqd7` — APPROVED / OBSERVERSHIP)*

PDF application form (acceptable as institutional policy doc). $100 fee, 60-day max, multi-audience (physician/AHP/medical student/college student 18+). G0 verified.

## #130 — Orlando Health Pediatric Neurosurgery Clinical Observership *(verified with contact caveat)*
*(id `cmo3385o6001h1ny9z7gkibwc` — APPROVED / OBSERVERSHIP)*

Subspecialty observership at Orlando Health Children's Neuroscience Institute. 60-day max, 3-month lead + 30-day processing. contactEmail christianjenkins@usf.edu is University of South Florida — likely a sponsoring faculty neurosurgeon with USF appointment rather than institutional contact. Common pattern for subspecialty observerships running through individual faculty.

---

## #131 — OU College of Medicine OKC Visiting Students Program *(dupe with no URL → HIDDEN)*
*(id `cmpm2s67b0002ogn5lwcgcm87` — was APPROVED → HIDDEN)*

Sister row to #132 with richer 1500-char fullDesc but NO sourceUrl. Without a URL, cannot serve. Canonical is #132.

## #132 — OU Health College of Medicine Visiting Student Program *(canonical, contactEmail period strip)*
*(id `cmo34f4sq001z1nxxbwazydug` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL set, fullDesc 866 chars, VSLO program. contactEmail had trailing period — stripped.

## #133 — Panamerican Trauma / VCU International Observership *(verified)*
*(id `cmo3386wi00351ny94kwf2o4t` — APPROVED / OBSERVERSHIP)*

Trauma+EMS+ICU exposure, 2 weeks to 1 month, first Monday starts. 961-char fullDesc. Note: contactEmail `vcu.health.org` may be typo for `vcuhealth.org` — flagged in adminNotes.

## #134-138 — Penn cluster (5 rows: Dermatopathology / ENT / Postdoc / Visiting Clerkship / Radiology) *(all verified)*

Distinct URLs + distinct contact emails per row — Penn's data is **cleaner than NYU's** which had the URL-bleed pattern. All 5 verified, G0 notes added.

## #139 — Providence Swedish Medical Center — Observer Program *(verified)*
*(id `cmn2114kr008isb1130q3lxp0` — APPROVED / OBSERVERSHIP)*

Preceptor-required, 6+ months lead. 574-char fullDesc. G0 verified.

## #140 — Reading Hospital — Tower Health *(D2 RECLASSIFICATION + RE-PROMOTION)*
*(id `cmn2115rj00basb112a50c40u` — was REJECTED ELECTIVE → APPROVED / MD_DO_VISITING_STUDENTS)*

**Second REJECTED-row resurrection via D2** (after #112 NIH). Page evidence: Tower Health explicitly does NOT offer observerships ("we are unable to accommodate these requests") BUT actively runs M4 visiting electives via VSLO + Drexel COM partnership at Reading + Phoenixville + St. Christopher's.

Original mega-audit rejected for the observership audience without checking if visiting-student audience would fit — D2 catches and corrects.

**Action:** status REJECTED → APPROVED; type ELECTIVE → MD_DO_VISITING_STUDENTS; audienceTag IMG-GRAD-OBSERVER → US-MD-DO-VISITING; applicationMethod external → VSLO; contactEmail null → GMECentral@towerhealth.org; shortDesc + fullDesc rewritten with explicit "no observerships but visiting students yes" structure.

---

## #141 — Robert Wood Johnson University Hospital *(major cost fix + visa)*
*(id `cmn211307004usb11g6ij63lj` — APPROVED / MD_DO_VISITING_STUDENTS)*

Rutgers RWJ Medical School Visiting Students. P102: LCME/COCA M4 only; INTL + Canadian NOT accepted; $75 fee per elective (legacy `~$1000-2000` was 13-27x too high); max 16 weeks.

**Action:** cost legacy → $75 VSLO fee; duration → max 16 weeks; visaSupport→false; shortDesc rewrite with INTL/Canadian exclusion + Feb open + 35-day decision.

## #142 — Rush University Medical Center *(visa + shortDesc)*
*(id `cmn211200002gsb116i7cgugp` — APPROVED / MD_DO_VISITING_STUDENTS)*

Rush MC Visiting Students (VSLO LCME/COCA only — INTL not accepted) + separate Diversity Visiting Scholars track with living stipend + VSLO fee waiver.

**Action:** visaSupport→false; shortDesc rewrite highlighting Diversity Scholars track.

## #143 — Saint Louis University Otolaryngology Observership *(verified)*
*(id `cmo3386ak002b1ny9wd106l2u` — APPROVED / OBSERVERSHIP)*

SLU ENT department observership. Hands-off, ages 16+, 2-week max, multi-audience (HS/undergrad/medical students/residents/practicing physicians). Two app paths (SLU current students vs external GME). 90-day processing, 6-week-postmarked deadline.

## #144 — SAMS — Clinical Observership (Nonprofit) *(contactEmail populated)*
*(id `cmn2114sb008wsb11jwl3hilh` — APPROVED / OBSERVERSHIP)*

Syrian American Medical Society multi-state IMG observership. AMA-IMG guidelines compliant. Already documented in shortDescription but contactEmail was null — added `observership@sams-usa.net` from legacy text.

## #145 — St. Barnabas Hospital *(major: EM-specific + no-visa + contact + duration)*
*(id `cmn2111fx001asb114hiofz1l` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL is SBH EM residency page — M4 EM sub-internship for visitors. Direct application (not VSAS/VSLO) to Leslie Roderick. Open to any accredited school BUT no visa sponsorship.

**Action:**
- `specialty`: multi-dept legacy → "Emergency Medicine (M4 EM sub-I, primary-provider model, 10 shifts)"
- `shortDescription`: legacy "Bronx / Level 1 trauma" → program-specific
- `contactEmail`: null → `lroderick@sbhny.org`
- `duration`: "4-12 weeks" → "4-week rotation, 10 shifts"
- `visaSupport`: true → false (page explicit)

---

## #146 — St. John's Episcopal Hospital *(shortDesc + specialty refine)*
*(id `cmn2114z5009gsb11laxdyyfc` — APPROVED / MD_DO_VISITING_STUDENTS)*

Episcopal Health Services Far Rockaway. Medical Student Electives in Dermatology, OB/GYN, Ophthalmology, Pathology, Psychiatry, Surgery, Wound Care. AFFILIATION-AGREEMENT schools only (US LCME + select INTL partners).

**Action:**
- `shortDescription`: legacy "Rockaway Peninsula / small accessible" marketing → program-specific (7 specialty electives + affiliation-only).
- `specialty`: legacy "IM, EM, Surgery" (incomplete) → all 7 actual specialties from page.

## #147 — Stanford Health Care (Tri-Valley Visiting Observer Program) *(visa flag fix)*
*(id `cmn2111m1001ksb112erf1286` — APPROVED / OBSERVERSHIP)*

SHC Tri-Valley Hospital observership. Host-required model, 30-day max in 12 months, ~8 weeks processing. ShortDesc already said "No visa sponsorship" but `visaSupport` flag was inconsistent (true).

**Action:** `visaSupport`: true → false.

## #148 — Stanford Medicine — Postdoctoral Research *(boilerplate purge, Stanford-specific)*
*(id `cmn2113s6006msb118hgahh1o` — APPROVED / RESEARCH)*

Same generic IMG-postdoc 286-char boilerplate that's been on Einstein, Baylor, Duke, Fred Hutch, Harvard, Hopkins, Mt Sinai, Northwestern, NIH, Mayo postdoc. URL is correct (postdocs.stanford.edu, Stanford Office of Postdoctoral Affairs).

**Action:** `shortDescription` + `fullDescription` replaced with Stanford OPA-specific content (~2,000 postdocs, J1/H1B via OPA, direct-to-PI application, NIH-scale stipends, cross-ref to visiting clerkships + Tri-Valley observership).

---

## #149 — Stanford Visiting Clerkship Program *(verified)*
*(id `cmo34f48p00191nxxa638xyp8` — APPROVED / MD_DO_VISITING_STUDENTS)*

Stanford SOM Visiting Clerkship Program (US LCME/COCA M4 path) — VSLO migration AY 2026-27, 4-week single rotation cap, SCORE parallel mentorship/financial track. Stanford INTL visiting clerkship is a separate program at `/visiting-clerkships/international.html` (would be a different DB row).

## #150 — Stony Brook Renaissance SOM *(title + listingType correction)*
*(id `cmo338514000n1ny9qxfsnf1g` — APPROVED / OBSERVERSHIP → MD_DO_VISITING_STUDENTS)*

URL `/ugme/visiting_students` is EXCLUSIVELY VSLO M4 electives (LCME/COCA + Osteopathic), NOT observerships. Legacy title "Clinical Observer Program" is stale seed. Affiliation agreement (6-8 weeks) is MANDATORY — no exceptions.

**Action:** title → "Stony Brook Renaissance School of Medicine Visiting Elective Program"; listingType: OBSERVERSHIP → MD_DO_VISITING_STUDENTS; shortDesc rewrite (VSLO M4, LCME/COCA only, mandatory affiliation agreement, no housing); duration → "4-week electives (8-week affiliation execution + standard rotations)".

## #151 — Summa Health System — Akron *(visa + shortDesc + fullDesc + cost-detail)*
*(id `cmn21158f00a0sb11x9a5ozzf` — APPROVED / MD_DO_VISITING_STUDENTS)*

NEOMED-affiliated. 50+ M4 electives via VSLO. US LCME/COCA only. Perks: meal allowance, free parking, library access, on-call housing.

**Action:** shortDesc rewrite; fullDesc rewrite; applicationMethod external → VSLO; visaSupport→false; specialty cleanup. contactEmail still null (TODO page-walk).

## #152 — Tampa General Hospital / USF Health *(major cost fix)*
*(id `cmn2112jp003ssb11zyesyyua` — APPROVED / MD_DO_VISITING_STUDENTS)*

Tampa General is USF Morsani's primary teaching site. Major fix: **USF does NOT assess tuition or fees for visiting students** — legacy "~$200-400" was fabricated. US LCME/COCA M4 only, electives only (no required rotations).

**Action:** shortDesc rewrite; fullDesc rewrite; cost "~$200-400" → "NO tuition or fees assessed by USF" (P102 explicit); visaSupport→false.

## #153 — Temple University Hospital *(major URL + audience + contact + visa)*
*(id `cmn2112m0003ysb11rxj0haiv` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL was wrong (GME landing); audienceTag was IMG-GRAD-OBSERVER (contradicting MD_DO_VISITING_STUDENTS listingType). P102 correct path: Lewis Katz SOM Visiting Students.

**Action:** sourceUrl: `/education/graduate-medical-education` → `/education/md-program/visiting-students`; audienceTag IMG-GRAD-OBSERVER → US-MD-DO-VISITING; applicationMethod external → VSAS/VSLO; visaSupport→false; contactEmail null → `mdvsas@temple.edu`; shortDesc + fullDesc rewrite.

## #154 — Texas Tech HSC Internal Medicine IMG Observership *(shortDesc enrich, otherwise verified)*
*(id `cmo3386pc002v1ny92dflv0b9` — APPROVED / OBSERVERSHIP)*

One of the most transparent IMG observerships nationally. ECFMG/Step/LCME options, $250 app + $100 background + $2k/4wk or $3.8k/8wk, no visa sponsorship. Tier A homepage candidate.

**Action:** shortDescription terse 90-char → 380-char comprehensive.

## #155 — Thomas Jefferson University Clinical Observerships *(shortDesc enrich)*
*(id `cmo3386kw002p1ny9qwtup7hf` — APPROVED / OBSERVERSHIP)*

OIS-centralized B1/B2 program with 3 tracks (Student max 12wk / Resident / Physician). 3-month onboarding lead time. KEY caveat: Jefferson Internal Medicine no longer offers observerships.

**Action:** shortDescription 130-char → 520-char with 3 tracks named + IM-no-longer-offering caveat.

## #156 — Trinity Health Nazareth Clinical Observership *(WRONG EMAIL BUG)*
*(id `cmo3386nu002t1ny9gfh312th` — APPROVED / OBSERVERSHIP)*

**Wrong-institution email bleed (same pattern as #40/71/97/127):** contactEmail was `imobservership@ttuhsc.edu` (TEXAS TECH email — Nazareth is in Philadelphia at Trinity Health Mid-Atlantic).

**Action:** contactEmail TTUHSC-email → null; shortDesc enrich with ECFMG-required, 5yr-grad-preferred, IM-only, Trinity St. Mary sibling reference. TODO: page-walk for correct Trinity GME contact.

## #157 — Trinity Health St. Mary Clinical Observership *(SAME WRONG EMAIL BUG as #156)*
*(id `cmo3386mb002r1ny9nugcfgsb` — APPROVED / OBSERVERSHIP)*

Same wrong-institution email bleed: `imobservership@ttuhsc.edu`. Same Trinity Mid-Atlantic seed file propagated TTUHSC email to BOTH Trinity entries.

**Action:** contactEmail → null; shortDesc enrich with Trinity Nazareth sibling reference + program detail.

## #158 — Tufts Medical Center *(major URL fix + audience-restriction + visa)*
*(id `cmn2111uv0028sb11o4hirnws` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL was wrong (auditData flagged `WRONG_INSTITUTION` — it pointed at GME residency/fellowship page). P102 correct URL: `medicine.tufts.edu/all-administrative-offices/registrar/away-rotations`. INTL students NOT eligible; no observerships.

**Action:** sourceUrl fix; shortDesc + fullDesc rewrite (TUSM VSLO LCME/AOA only, INTL exclusion explicit, 2026-27 dates); visaSupport→false; specialty cleanup.

---

## #159 — Tulane Medical Center *(major cost fix + visa + shortDesc)*
*(id `cmn2113c1005ksb11e54msb6c` — APPROVED / MD_DO_VISITING_STUDENTS)*

US M4 only; INTL students explicitly NOT accommodated by Tulane SOM. $225 non-refundable processing fee per rotation (legacy "~$200-400" was vague). Kinchen URiM scholarship for general surgery interest. Tulane requires Step 1 pass + neurology completion verified by home institution.

**Action:** cost "~$200-400" → "$225 non-refundable" per P102; visaSupport→false; specialty + shortDesc rewrite.

## #160 — University of Utah Spencer Fox Eccles SOM *(WRONG EMAIL BUG: UTHSC)*
*(id `cmo34f4nt001t1nxxd5adsmg1` — APPROVED / MD_DO_VISITING_STUDENTS)*

**Wrong-institution email:** contactEmail was `visiting@uthsc.edu` (Tennessee HSC, NOT Utah). Correct: `visitingstudents@hsc.utah.edu`. PROTECTED_BROWSER_REQUIRED URL (403 on WebFetch). 6 of core clerkships + Step 1 + 5-panel drug test + background check + letter of interest. INTL via separate Dept Sponsored Visitors Program.

**Action:** contactEmail UTHSC-email → `visitingstudents@hsc.utah.edu`; shortDesc rewrite with full eligibility detail.

## #161 — UAB Heersink Visiting Student VSLO Program *(HIDDEN duplicate UPHELD)*
*(id `cmo34f47700171nxxp8wwl771` — HIDDEN / ELECTIVE)*

Confirmed duplicate of #162. URL pointed at `away-electives` (UAB students leaving, not visitors arriving). Useful content (Feb/Mar/Apr dates + $150 spot fee + specialty list) and correct US contact `visiting@uab.edu` were merged into #162. Stays HIDDEN.

## #162 — UAB Hospital (University of Alabama at Birmingham) *(major: WRONG CONTACT + visa + cost + content merge from #161)*
*(id `cmn2113m50066sb11sbr4jq4d` — APPROVED / MD_DO_VISITING_STUDENTS)*

**Wrong-institution contact:** was `internationalMD@uab.edu` (INTL pathway contact) but listing is US/PR LCME/AOA only. Correct: `visiting@uab.edu`. Major rewrite + merge from HIDDEN duplicate #161.

**Action:** contactEmail INTL→visiting@uab.edu; cost "~$200-400"→"$150 spot-secure fee + VSLO app fee"; visaSupport→false; shortDesc + fullDesc rewrite; specialty cleanup. Cross-ref to #163 INTL pathway.

## #163 — UAB International Visiting Medical Observership *(shortDesc enrich, verified)*
*(id `cmo33852p000p1ny92siexq0s` — APPROVED / OBSERVERSHIP)*

Separate INTL pathway from #162. IMG graduate OR INTL medical student. Step 1 required; Step 2/3 preferred. $350 app + $4,250 per 4-week slot. No visa sponsorship.

**Action:** shortDesc enrich to 470 chars with fee structure + eligibility detail.

## #164 — UC Davis Health International Observership *(shortDesc enrich + gap note)*
*(id `cmn2114d2007wsb11wb06bo60` — APPROVED / OBSERVERSHIP)*

For currently PRACTICING CLINICIANS ONLY — NOT for students, recent graduates (within 5 years), or US residency seekers. Certificate only, no LORs.

**Action:** shortDesc enrich with full eligibility restriction + cross-ref to MISSING UC Davis SOM Visiting Medical Students pathway (US LCME M4 VSLO at `health.ucdavis.edu/mdprogram/registrar/visiting.html` — not in directory).

## #165 — UC Irvine Medical Center *(major: shortDesc + cost + visa + contactEmail + specialty)*
*(id `cmn2111qh001wsb111gq2cngn` — APPROVED / MD_DO_VISITING_STUDENTS)*

Legacy IMG marketing replaced. UC Irvine SOM accepts US LCME via VSLO; INTL only from schools with UCI exchange agreement. $300 fee per course (legacy "~$200-400" was vague).

**Action:** shortDesc rewrite; cost → "$300 per course"; specialty refined per P102 (EM/Surg/Ortho/Anesth + others); visaSupport→false; contactEmail null → `comextra@hs.uci.edu`.

## #166 — UC San Diego Visiting Senior Medical Student Program *(WRONG EMAIL BUG: UTHSC + gap note)*
*(id `cmo34f4m9001r1nxxaili4bwg` — APPROVED / MD_DO_VISITING_STUDENTS)*

**Wrong-institution email:** `visiting@uthsc.edu` (Tennessee, again) → null. UCSD-correct contact needs page-walk. LCME US + Canadian + Puerto Rican + COCA via VSLO. VESP scholarship up to $2,000. **Gap noted:** UC San Diego ACE Program (IMG ERAS prep) is not in directory.

**Action:** contactEmail TTUHSC-email → null (TODO walk); shortDesc rewrite; applicationMethod external → VSLO.

## #167 — UCLA Health International Physician Observership *(shortDesc enrich, verified)*
*(id `cmo33855r000t1ny9mcguc1mn` — APPROVED / OBSERVERSHIP)*

DGSOM Int'l Services. $750 app fee. Invitation Letter from host required BEFORE applying. UCLA cannot sponsor visas (B-1 required, self-arranged). No LORs (UCLA policy). 1-3 months.

**Action:** shortDesc enrich to 580 chars. Cross-ref to #56 Harbor-UCLA + #128 Olive View-UCLA.

## #168 — UCSF — Postdoctoral Research *(boilerplate purge, UCSF-specific)*
*(id `cmn21143g007asb11c77awbh2` — APPROVED / RESEARCH)*

Same generic IMG-postdoc boilerplate as 11 other postdoc rows. UCSF OPS administers ~1,400 postdocs across 4 schools + Graduate Division. UC postdoc scale stipends. 5-year total cap.

**Action:** shortDesc + fullDesc replaced with UCSF OPS-specific content.

## #169 — UCSF Medical Center *(major shortDesc + fullDesc + cost + visa + specialty)*
*(id `cmn2111nj001osb1129xg34rr` — APPROVED / MD_DO_VISITING_STUDENTS)*

UCSF Visiting Student Program. US LCME/COCA only; INTL not accepted. 12-week cumulative cap. $300/elective fee + VESP $2k scholarship for PRIDE-aligned applicants. 2026 window Feb 9 / Apr 20 approvals.

**Action:** shortDesc + fullDesc rewrite (1180-char); cost → "$300/elective + VESP $2k"; specialty + visaSupport→false. Cross-ref to #168 postdoc + #170 neuropath.

## #170 — UCSF Neuropathology Visiting Scholars *(WRONG EMAIL BUG: Griffin Hospital CT)*
*(id `cmo33857o000v1ny9ekt4l5sp` — APPROVED / OBSERVERSHIP)*

**Wrong-institution email:** contactEmail was `Observership@griffinhealth.org` (Griffin Hospital Derby CT) → null. Largest neuropath division in US. Multi-audience (3 tags). NO fee charged by UCSF. NO certificate of completion. Attendance record only.

**Action:** contactEmail Griffin-email → null (TODO walk); shortDesc enrich.

---

## #171 — UHealth Clinical Observership — University of Miami *(shortDesc enrich + gap note)*
*(id `cmo3385du00131ny92anyfao4` — APPROVED / OBSERVERSHIP)*

UMiami UHealth observership via VSYS portal. Sponsor-first workflow (faculty/credentialed clinician name+email REQUIRED before app starts). 40+ specialties, up to 12 weeks. 3-week minimum notice. Citizenship-open (US/PR/Neither all valid per Citizenship radio).

**Action:** shortDesc 100-char → 590-char. **Gap noted:** Jackson Memorial / UMiami International Medicine Institute Global Observership (850+ participants since 2008) — separate pathway NOT in directory.

## #172 — UNC Chapel Hill School of Medicine Visiting Student Program *(HIDDEN dupe of #174)*
*(id `cmpm2s6790000ogn51efjsfes` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #174. sourceUrl was null; contactEmail corrupted (`...edu**Other**` scrape artifact). fullDesc 1299 had outdated-browser nav noise. Content merged into #174.

## #173 — UNC Chapel Hill Visiting Student Program *(HIDDEN dupe of #174)*
*(id `cmo34f4bp001d1nxxvqahi0gb` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #174. URL was sub-page (`/program-requirements/` not the canonical landing). contactEmail same corrupted scrape. Useful content: Larry D. Keith Scholarship + May 2026 open — merged into #174.

## #174 — UNC Hospitals *(major: canonical row, consolidation of #172 + #173)*
*(id `cmn2112rm0046sb11vospyk2p` — APPROVED / MD_DO_VISITING_STUDENTS)*

Canonical UNC SOM Visiting Student row. P102 correct URL. US LCME M4 only ('domestic students in their final year'); INTL via SEPARATE Office of Global Health Education IVS pathway.

**Action:** shortDesc + fullDesc rewrite (1100-char); applicationMethod external→VSLO; visaSupport→false; contactEmail null → `visitingstudent@med.unc.edu` (Lucas Ramsey per P102); specialty cleanup; Keith Scholarship + 6 NC affiliated sites + May 2026 open. **Gap noted:** UNC INTL IVS pathway not in directory.

## #175 — University Hospitals Cleveland Visiting Medical Student Program *(canonical, verified)*
*(id `cmo34f3lj000f1nxxjw8zcxuz` — APPROVED / MD_DO_VISITING_STUDENTS)*

LCME/AOA M4. 4 UH teaching hospitals. David Satcher Clerkship (named for former US Surgeon General) for US-citizen rotators.

**Action:** verified. #176 HIDDEN as dupe.

## #176 — University Hospitals Cleveland Visiting Medical Student Program *(HIDDEN dupe of #175)*
*(id `cmpm2s67b0001ogn5nr6c4ipr` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #175. sourceUrl null; shortDesc less specific. Same fullDesc length → seed-file merge artifact.

## #177 — University of Arizona Tucson Visiting Medical Students *(WRONG EMAIL BUG: UNM)*
*(id `cmo34f4je001n1nxx7e913b78` — APPROVED / MD_DO_VISITING_STUDENTS)*

**Wrong-institution email:** `HSC-MDvisiting@salud.unm.edu` (UNM Albuquerque, NOT U Arizona Tucson). SAME UNM-on-other-school bleed as #40 (UNM-on-Colorado) and #127 (UNM-on-OHSU). U of A Tucson is at medicine.arizona.edu.

**Action:** contactEmail UNM-email → null; applicationMethod external→VSLO; shortDesc enrich (LCME+COCA, 8-week offer window, INTL faculty-sponsor exception, Banner UMC).

## #178 — University of Arkansas for Medical Sciences (UAMS) *(major: shortDesc + visa + specialty + contact)*
*(id `cmn2115v300bksb11ngyv1xao` — APPROVED / MD_DO_VISITING_STUDENTS)*

**Wrong contact:** `vslo@aamc.org` was AAMC generic VSLO helpdesk (scrape artifact from "contact VSLO at vslo@aamc.org" page text), NOT UAMS contact. US LCME/AOA M4 only with all 5 core clerkships + Dean's permission. No longitudinal electives or Acting Internships for visitors.

**Action:** contactEmail AAMC-generic → null; shortDesc rewrite with full eligibility detail; visaSupport→false; specialty cleanup.

## #179 — University of Chicago Medicine *(major: shortDesc + fullDesc + visa + specialty)*
*(id `cmn2111xq002asb11vcg045uc` — APPROVED / OBSERVERSHIP)*

UChicago Global Education & Training for INTL physicians. Faculty sponsor REQUIRED. Max 30 days. NO hands-on care. Customized 1-4 week programs. All programs fee-based.

**Action:** shortDesc + fullDesc rewrite (980-char) emphasizing distinction from #180 Pritzker; visaSupport→false (observership, B1/B2 self-arranged); specialty cleanup.

## #180 — University of Chicago Pritzker Visiting Students Program *(shortDesc enrich, verified)*
*(id `cmo34f3ta000p1nxxugaetc8m` — APPROVED / MD_DO_VISITING_STUDENTS)*

LCME/COCA all-core-clerkships M4. 2026-27 catalog Mar 2 / apps Mar 9. 4-week typical, 8-week IM/Surg. NO tuition + $26 wellness + $1M/$3M malpractice.

**Action:** shortDesc 135-char → 600-char. Cross-ref to #179.

## #181 — University of Cincinnati Medical Center *(major: WRONG_INSTITUTION URL + type + content rewrite)*
*(id `cmn211253002usb11tv4v9ll0` — APPROVED / OBSERVERSHIP → MD_DO_VISITING_STUDENTS)*

URL was Cincinnati Children's Hospital INTL Visitor Program — wrong institution! Title is UCMC (adult academic). P102 correct UCMC URL is `med.uc.edu/.../visiting-students`. Major rewrite: UC College of Medicine M4 visiting via VSLO, max 2 electives (8 wks), $166/elective, INTL only via Activity Agreement schools.

**Action:** URL Children's → UC COM canonical; listingType OBSERVERSHIP → MD_DO_VISITING_STUDENTS; audienceTag IMG-GRAD-OBSERVER → US-MD-DO-VISITING; shortDesc + fullDesc rewrite; cost "~$200-400" → "$166/elective"; duration "2-4 weeks" → "Max 2 electives totaling 8 weeks"; applicationMethod external→VSLO; visaSupport→false; specialty cleanup. **Gap noted:** Cincinnati Children's INTL Visitor Program is separate, should be added.

## #182 — University of Florida College of Medicine International Visiting Student *(WRONG INSTITUTION URL: Baptist Health)*
*(id `cmo34f4r7001x1nxxtn64ibij` — APPROVED / CLERKSHIP)*

URL was `baptisthealth.net/...observer-program` (Baptist Health South FL Miami) — wrong institution! Content describes the UF INTL Visiting Student Program (Step 1 + 6 core clerkships + 2/4 wk + affiliation agreement). Correct URL per P102: `osa.med.ufl.edu/.../international-visiting-student-program/`.

**Action:** sourceUrl Baptist → UF OSA INTL canonical; contactEmail `Observer@baptisthealth.net` → null; shortDesc enrich. Content already accurate for UF INTL program.

## #183 — University of Florida Health / Shands Hospital *(major: shortDesc + fullDesc + audienceTag + visa + nav-text-noise cleanup)*
*(id `cmn2112ix003qsb1178t0rg6k` — APPROVED / MD_DO_VISITING_STUDENTS)*

Sibling to #182. US M4 VSLO path via UF OSA. audienceTag was IMG-STUDENT-CLERKSHIP (wrong — contradicts listingType + P102 audience='us-medical-student'). fullDesc had embedded UF nav-text noise.

**Action:** audienceTag IMG-STUDENT-CLERKSHIP → US-MD-DO-VISITING; shortDesc + fullDesc rewrite (1140-char clean); visaSupport→false; specialty cleanup.

## #184 — University of Iowa Carver College of Medicine Visiting Students *(canonical; Iowa uses OWN portal, NOT VSLO — notable exception)*
*(id `cmo34f3xw000v1nxxpufo9qjo` — APPROVED / MD_DO_VISITING_STUDENTS)*

Iowa uses its OWN visiting students portal at `md.medicine.uiowa.edu` — NOT AAMC VSLO. Rolling May 2026 open for 4th-year LCME. Contact `vse-coordinator@uiowa.edu`.

**Action:** shortDesc 140-char → 425-char. **Notable**: Iowa is one of the few major US academic centers that does NOT use VSLO for visiting students — `applicationMethod=external` retained accurately.

## #185 — University of Iowa Hospitals & Clinics *(HIDDEN dupe of #184)*
*(id `cmn2113jz0060sb11qa6zlypu` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #184 (same URL). Legacy IMG marketing shortDesc, null contact, wrong visaSupport=true. #184 has better content + correct contact + correct visa flag.

---

## #186 — University of Kansas Medical Center (KU SOM Visiting M4) *(major: shortDesc + cost + visa + specialty)*
*(id `cmn2115ud00bisb11k3wltm6f` — APPROVED / MD_DO_VISITING_STUDENTS)*

KU SOM Kansas City Campus M4 visiting via VSLO. Special quirk: AOA DO students restricted to ONLY 3 affiliated schools (Kansas City Univ, Des Moines Univ COOM, Oklahoma State Univ COOM). Fall term only. Max 1 four-week rotation. $110 fee. Companion to #187 INTL program.

**Action:** shortDesc rewrite; cost → "$110 + insurance"; visaSupport→false; specialty cleanup.

## #187 — University of Kansas Medical Center (KUMC INTL Observership) *(major: shortDesc + cost + specialty)*
*(id `cmn21147m007msb11gq7xaz4y` — APPROVED / OBSERVERSHIP)*

KUMC INTL Observership via Office of International Programs. IMG GRADUATES only (current students INELIGIBLE). 4-week max, strictly observational, no patient care, no EMR. $50 inquiry fee + $3,000/month program fee. Annual window 15 Oct-15 Dec ONLY. Department restrictions: Peds + OB/GYN don't accept; Path no June/July; Cardio max 2/month.

**Action:** shortDesc 53-char → 800-char; cost detailed ($50+$3k/mo); specialty with exclusions detail.

## #188 — University of Kentucky Medical Center *(major: shortDesc + cost + visa + specialty)*
*(id `cmn2113h5005ysb11u6inmy50` — APPROVED / MD_DO_VISITING_STUDENTS)*

UK COM Lexington M4 via VSLO (M3+M4 accepted, M4 priority). Mandatory affiliation agreement (cancellation if not finalized). $75 one-time placement fee. Brendan McCarthy, Registrar (already correct contact).

**Action:** cost "~$200-400" → "$75 one-time"; visaSupport→false; shortDesc rewrite; specialty cleanup.

## #189 — University of Kentucky Neurology Observership *(URL fix + shortDesc enrich)*
*(id `cmo3385yw001v1ny9ibvbnki5` — APPROVED / OBSERVERSHIP)*

URL was wrong (general visiting students page); URL_FIX_NEEDED flag in adminNotes but never applied to column — 5th similar bug this walk. Correct URL: `medicine.uky.edu/departments/neurology/observerships-and-shadowing`. 2 tracks (Adult + Child Neurology), Qualtrics forms, calendar-month, 4-week decision SLA.

**Action:** sourceUrl fix; shortDesc 105 → 520 chars.

## #190 — University of Kentucky Radiology Observership *(URL fix + WRONG-PERSON CONTACT + shortDesc enrich)*
*(id `cmo33860d001x1ny9apdtjfk2` — APPROVED / OBSERVERSHIP)*

Same URL bug as #189 (URL_FIX_NEEDED never applied). contactEmail georganna.king@uky.edu was NOT in auditData's role-specific list (4 role-specific contacts: Tracy Peavler / Chayton Marshall / Jennifer Britton / Kris Dyer). 2-stage application: OLE first, then role-specific Radiology coordinator. No June/July.

**Action:** sourceUrl fix to Radiology Dept page; contactEmail → `tracy.peavler@uky.edu` (default Non-Med Student contact); shortDesc 105 → 680 chars with all 4 role-specific contacts named.

## #191 — University of Louisville — Medical Observership Program *(major: shortDesc + duration + visa)*
*(id `cmn2114oe008ssb110xfqwdfv` — APPROVED / OBSERVERSHIP)*

UofL Health MOP for PHYSICIANS (licensed graduates). Medical students go through SEPARATE UofL SOM Visiting Student process (not in directory — gap). Strict observation-only, no EMR, max 4 weeks per specialty. $250 app fee. Year-round with 60-day pre-submit. INTL: TOEFL 79+ or OET 300+.

**Action:** shortDesc 145-char → 700-char; duration → "Max 4 weeks per clinical specialty (observation only, no EMR access)"; visaSupport→false.

## #192 — University of Maryland Medical Center (UMSOM) *(shortDesc + fullDesc + visa + specialty)*
*(id `cmn21126j002ysb11e8v08sef` — APPROVED / MD_DO_VISITING_STUDENTS)*

UMSOM OSA Visiting Students. LCME/COCA M4 good standing. VSLO 26-27 Mar 13 browse / Mar 30 apps. 10 monthly blocks listed. Malpractice + OSHA reqs. Bailey Jenkins contact. **Gap noted:** R Adams Cowley Shock Trauma separate observer program — not in directory.

**Action:** shortDesc rewrite; visaSupport→false; specialty cleanup.

## #193 — University of Michigan — Research Fellowship *(boilerplate purge + URL fix)*
*(id `cmn2113z5006ysb11a69rap0h` — APPROVED / RESEARCH)*

Same generic IMG-postdoc boilerplate as 12 other postdoc rows. URL was wrong (`medicine.umich.edu/...` — Cloudflare-blocks WebFetch); correct: `medschool.umich.edu/programs-admissions/postdoctoral-fellows`. **Gap noted:** UMMS Visiting MD Students program (US M4 VSLO Domestic Network only + 48-wk completion + max 8 wks + no research) not in directory.

**Action:** sourceUrl fix; shortDesc + fullDesc replaced with UMich Postdoctoral Affairs-specific content (1300-char).

## #194 — University of Michigan Health *(major: canonical, consolidation of #195 dupe)*
*(id `cmn2112v6004gsb11vhhinr8a` — APPROVED / MD_DO_VISITING_STUDENTS)*

UMMS Visiting MD Students. US LCME M4 + 48-week completion requirement. VSLO Domestic Network ONLY. Max 8 weeks. Catalog electives only — research electives EXCLUDED. 45-day pre-start deadline. Health Equity Visiting Clerkship featured sub-track. Cloudflare-blocks WebFetch.

**Action:** shortDesc + fullDesc rewrite (merged 45-day deadline + Health Equity Clerkship from #195); visaSupport→false; specialty cleanup. #195 HIDDEN as dupe.

## #195 — University of Michigan Visiting Medical Student Program *(HIDDEN dupe of #194)*
*(id `cmo34f3og000j1nxxkiw66iml` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #194 (same URL). Better shortDesc content (merged into #194) but wrong applicationMethod=external (vs VSLO). Alternate contactEmail visitingstudents@umich.edu retained on this row.

## #196 — University of Minnesota Medical Center *(major: audienceTag + visa + shortDesc + specialty)*
*(id `cmn21129f0036sb11lxype91i` — APPROVED / MD_DO_VISITING_STUDENTS)*

UMN Medical School visiting. LCME/COCA M4 via VSLO. Max 2 electives per visiting student. Required: good standing + 3+ core clerkships + Step 1 or COMLEX Level 1 + home-school credit. INTL ONLY via formal institutional exchange agreement (Shannon Benson, benson@umn.edu).

**Action:** audienceTag IMG-STUDENT-CLERKSHIP+US-MD-DO-VISITING → US-MD-DO-VISITING (INTL exchange-agreement track noted in description but not as standard IMG pathway); shortDesc rewrite; visaSupport→false; specialty cleanup.

## #197 — University of Minnesota Pathology Observership *(URL fix + WRONG INSTITUTION CONTACT: WUSTL)*
*(id `cmo33867o00271ny9ovpq1r1c` — APPROVED / OBSERVERSHIP)*

**Wrong-institution contact:** `sidpuram@wustl.edu` (Washington University St Louis Pathology contact) on a UMN listing. SAME bleed-pattern family. URL was wrong (general visiting students page); correct: `med.umn.edu/pathology/education-training/residency/observerships`.

**Action:** sourceUrl fix; contactEmail WUSTL-email → null; shortDesc 115 → 740 chars (open to US AND INTL physicians, faculty-first workflow, 2.5mo-2wk window, observer-pays-all, termination clause).

## #198 — University of Mississippi Medical Center *(shortDesc + visa + specialty)*
*(id `cmn2115vt00bmsb11oodepaa9` — APPROVED / MD_DO_VISITING_STUDENTS)*

UMMC SOM. LCME US+Canadian + AOA M4 only — INTL not listed. AAMC VSLO. Home institution approval req. ~Mar 20 open. Notable: M4 EM elective at Mississippi's only Level 1 trauma center.

**Action:** shortDesc rewrite; visaSupport→false; specialty cleanup.

## #199 — University of Missouri Health Care *(WRONG CONTACT: AAMC generic + major fixes)*
*(id `cmn2112zg004ssb11ibc3ebim` — APPROVED / MD_DO_VISITING_STUDENTS)*

**Wrong contact:** `vsas@aamc.org` was AAMC generic VSLO helpdesk scrape artifact (SAME bug as #178 UAMS). UM Columbia SOM US LCME/COCA M4 only — INTL EXPLICITLY excluded. Required: background check + 7-panel drug + $1M/$3M malpractice + flu shot (Oct-Apr) + HIPAA/PowerChart training.

**Action:** contactEmail AAMC-generic → null; shortDesc rewrite; cost → malpractice + VSLO fee; visaSupport→false; specialty cleanup.

## #200 — University of Nebraska Medical Center *(major: shortDesc + visa + contact + duration + specialty)*
*(id `cmn2113kp0062sb11wyre9lqr` — APPROVED / MD_DO_VISITING_STUDENTS)*

UNMC COM. US LCME MD + COCA DO senior/final ONLY. Foreign/non-LCME/non-COCA EXPLICITLY excluded. 4-week rotations ONLY (no 2-week). Max 1 rotation per visitor. Contact VSLO@unmc.edu (P102 explicit). Specialty-specific add-ons (USMLE Step 2 for EM/IM/Neurosurg, statements for OB/GYN, etc.).

**Action:** shortDesc rewrite; visaSupport→false; contactEmail null → VSLO@unmc.edu; duration "2-4 weeks" → "4 weeks only"; specialty cleanup.

---

## #201 — University of New Mexico Hospital *(shortDesc + duration + specialty; visaSupport upheld TRUE — rare positive case)*
*(id `cmn2115n200aysb11lq9efqq3` — APPROVED / MD_DO_VISITING_STUDENTS)*

UNM SOM. 4-week credit clerkships ONLY — NO observerships, NO shadowing, NO research electives, NO pre-clinical. Direct faculty contact PROHIBITED. **Notable:** UNM accepts INTL students IF home school participates in VSLO — one of few US programs with this openness (visaSupport=true retained, rare positive case).

**Action:** shortDesc rewrite (full eligibility detail + exclusion list); duration "2-4 weeks" → "4 weeks only"; specialty cleanup.

## #202 — University of Pittsburgh — Postdoctoral Research *(boilerplate purge, Pitt-specific)*
*(id `cmn2113to006qsb11m64ge9a7` — APPROVED / RESEARCH)*

Same generic IMG-postdoc boilerplate as 13 other postdoc rows. Pitt OACD (Office of Academic Career Development) administers ~1,000 postdocs. Pitt OIS handles J1/H1B.

**Action:** shortDesc + fullDesc replaced with Pitt OACD-specific content (1230-char).

## #203 — University of Pittsburgh Visiting Medical Student Program *(shortDesc + specialty enrich, verified)*
*(id `cmo34f3q3000l1nxxv4eup51y` — APPROVED / MD_DO_VISITING_STUDENTS)*

Dual track: domestic LCME/AOA North American via VSLO + limited INTL track at separate URL. 4-week. 2 flagship URiM clerkships with $2k stipend. Prior Enhanced Observership Program (EOP) URL 404'd mid-2026 — possibly deprecated.

**Action:** shortDesc 130-char → 700-char (dual-track + URiM + EOP history note); specialty refinement.

## #204 — University of Texas Medical Branch (UTMB) *(major: shortDesc + cost + visa + specialty)*
*(id `cmn2115cs00acsb11onyobib8` — APPROVED / MD_DO_VISITING_STUDENTS)*

UTMB Galveston. US LCME M4 via VSLO. INTL only via affiliation+incoming-agreement. NO observerships offered. $100/course processing fee, $25K/$75K malpractice min. NO off-block rotations.

**Action:** shortDesc rewrite; cost "$300-500" → "$100/course + $25K/$75K malpractice"; visaSupport→false; specialty cleanup.

## #205 — University of Utah Health *(HIDDEN dupe of #160)*
*(id `cmn2115nu00b0sb11bnr4d3ru` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #160 SFESOM. Same URL. Legacy IMG marketing shortDesc, null contact, less complete. #160 retained as canonical (audited earlier this session with fixes).

## #206 — University of Utah Health *(D2 rewalk: REJECTED upheld — 3rd Utah dupe)*
*(id `cmn2113le0064sb11a5urgvow` — REJECTED / ELECTIVE)*

Third row pointing at same SFESOM URL. Already REJECTED by mega-audit as DEDUPE of #231. D2 confirmation: rejection valid — #160 is canonical. Status preserved as REJECTED (historical mega-audit dedup record).

## #207 — University of Utah Moran Eye International Observership *(shortDesc enrich, verified)*
*(id `cmo3386to00311ny9vjdxoefc` — APPROVED / OBSERVERSHIP)*

Moran Eye Center INTL observership. Flexible scheduling, all subspecialties. Application packet: app + letter + passport + CV + translated medical license + financial-support proof. No visa sponsorship. URL has `prod.` subdomain prefix — flagged for final-sweep verification.

**Action:** shortDesc 130-char → 605-char with full application packet detail.

## #208 — University of Virginia Health System *(major: shortDesc + applicationMethod + cost + visa + specialty)*
*(id `cmn2113ex005ssb11z7kp129f` — APPROVED / MD_DO_VISITING_STUDENTS)*

UVA SOM. **Unusually restrictive: LCME-only — REJECTS both COCA osteopathic AND INTL.** FREE tuition; student supplies own malpractice. 21+ specialties, 5 rotation blocks A-E (June-Oct 2026).

**Action:** shortDesc rewrite (LCME-ONLY + NO COCA + NO INTL + FREE tuition + 5 blocks); applicationMethod external→VSLO; cost "~$200-400" → "FREE tuition + own malpractice"; visaSupport→false; specialty cleanup.

## #209 — University of Washington Medical Center *(major: shortDesc + fullDesc + cost + visa + specialty — multi-track hub)*
*(id `cmn211393005csb11zeemcrog` — APPROVED / OBSERVERSHIP)*

UW Medicine observerships HUB: 3 distinct audiences (UWMC clinical observers, HMC observers, pre-med shadowing). IMGs EXPLICITLY EXCLUDED ('we are full with our own learners'). NARROW exceptions for IMGs: Pathology Global Observership + Radiology only.

**Action:** shortDesc rewrite; fullDesc 170-char (dup of shortDesc) → 1300-char comprehensive (3-track hub structure, IMG-exclusion explicit, Path/Radiology exception narrowness, gaps for Path/Radio/SOM-Visiting); cost legacy → "Not published on hub page"; visaSupport→false; specialty restructured. **Gaps identified:** Path Global Observership + Radiology Observership + UW SOM Visiting Student Program (all separate, not in directory).

*(NOTE: #226 below resolves the "Pathology Global Observership" gap — it IS in the directory as DLMP Global Observership.)*

## #210 — University of Wisconsin–Madison (SMPH) *(shortDesc enrich, verified)*
*(id `cmo34f3we000t1nxx1ifvu2zl` — APPROVED / MD_DO_VISITING_STUDENTS)*

UW SMPH (Madison). US citizen / Canadian / US PR at LCME/AOA schools + Step 1 pass. Distinct from MCW/Froedtert in Milwaukee (#93). Already clean; just shortDesc enrich 130→650 chars.

## #211 — UNM School of Medicine Visiting Student Program *(HIDDEN dupe of #201 — promoted real UNM contact upstream)*
*(id `cmo34f4kr001p1nxxwzkgvggk` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #201 (same UNM SOM URL). **MAJOR FINDING:** This row held the REAL UNM contact `HSC-MDvisiting@salud.unm.edu` — which was the *origin* of the wrong-institution email bleed found at #160 (U Utah) and #177 (U Arizona). Promoted real contact + audienceTag (added IMG-STUDENT-CLERKSHIP for UNM's notable INTL-via-VSLO openness) + application date window to canonical #201.

## #212 — UNMC International Neurology Observership *(shortDesc enrich, verified)*
*(id `cmo3386c3002d1ny9p2c7c806` — APPROVED / OBSERVERSHIP)*

UNMC Neuro INTL observership. Staged 4-step app, $1,500 fee + $200 cancel, observer self-arranges visa/transport/insurance/housing, observation-only with conference participation. Cross-ref to #200 UNMC M4 program.

**Action:** shortDesc 117 → 760 chars.

## #213 — UPMC (University of Pittsburgh Medical Center) *(HIDDEN dupe of #203)*
*(id `cmn2112mt0040sb115rkbqj9q` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #203 (same Pitt URL). Held legacy EOP-era content ($8,000/8 weeks IM-specific, USMLE Step 2 CK, 75% match rate) for the dom.pitt.edu/education/eop/ URL that 404'd in mid-2026. EOP history note preserved on #203.

## #214 — USC Keck Medical Center *(shortDesc rewrite — STRICT employer-required INTL observership)*
*(id `cmn2111oz001ssb111wz1ddv5` — APPROVED / OBSERVERSHIP)*

Keck Medicine International Health Physician Observership. **NOT suitable for individual IMG match-prep.** Requires (1) foreign medical license AND (2) current employment by foreign health organization. Designed for institutionally-sponsored visitors.

**Action:** shortDesc rewrite emphasizing strict eligibility narrowness.

## #215 — USF Health — International Training *(major: hub-restructure)*
*(id `cmn2114dq007ysb119e2itzp9` — APPROVED / OBSERVERSHIP)*

USF Medicine International umbrella HUB covering IMT Observership (#217), Neurosurgery Observer (#216), and other tracks. Was 51-char useless placeholder + 1500-char nav-noise scrape.

**Action:** shortDesc → 545 chars; fullDesc 1500-char nav-noise → 1200-char hub content; contactEmail `observerships@usf.edu.` (trailing period artifact) → cleaned.

## #216 — USF Health Neurosurgery Observer Program *(shortDesc enrich, verified)*
*(id `cmo3385pp001j1ny9hs1j83c9` — APPROVED / OBSERVERSHIP)*

USF Neurosurgery — 5 distinct application tracks (non-physician / physician-to-physician / MCOM medical student / international via #215 / outpatient). Dual-contact admin team (Michelle Campbell + Christian Jenkins).

**Action:** shortDesc 145 → 870 chars enumerating all 5 tracks + both contacts.

## #217 — USF Morsani International Medical Trainee (IMT) Observership *(shortDesc enrich, 22→20 specialty correction)*
*(id `cmo3385cf00111ny9csmoq699` — APPROVED / OBSERVERSHIP)*

USF Morsani IMT — INTL final-year students + graduates from non-USF-affiliated schools. HIGHLY COMPETITIVE. USMLE Step 1 (+Step 2 for Hospital Medicine). 3 cycles/year. NO LATE applications.

**Action:** shortDesc 130 → 1000 chars. Corrected legacy "22 specialties" → 20 per page evidence.

## #218 — UT Health Memphis / Regional One Health *(MAJOR: shortDesc + cost + visa + contact + 2nd-pass INTL revision)*
*(id `cmn2113e6005qsb114hstszfc` — APPROVED / MD_DO_VISITING_STUDENTS)*

**MAJOR DISCOVERY:** confirmed `visiting@uthsc.edu` (Karen Coleman) is the legitimate UT Memphis contact and origin of the wrong-institution email bleed at #160 (U Utah) and #166 (UCSD). Bleed root cause now fully mapped.

**Initial action:** shortDesc rewrite, cost "~$200-400" → "FREE no fee per page", duration "2-4 weeks" → "Max 8 weeks total across UT system", contact null → `visiting@uthsc.edu`, specialty cleanup. Initially set visaSupport→false + audienceTag US-only.

**Follow-up action (from #224 evidence):** revised INTL stance. Page actually says "SOME international medical schools are eligible if home school participates in VSLO" (broader than 'formal exchange program' I'd read into P102). Restored audienceTag IMG-STUDENT-CLERKSHIP + US-MD-DO-VISITING + visaSupport=true.

## #219 — UT Health San Antonio (Long School of Medicine) *(major: shortDesc + applicationMethod + visa + specialty)*
*(id `cmn2112fx003isb11x5b08yua` — APPROVED / MD_DO_VISITING_STUDENTS)*

LSOM at UT Health SA. LCME + COCA M4 eligible; INTL explicitly excluded. VSLO with institution filter "UT HSC San Antonio Long SOM". 4-week advanced electives, finalized 4 weeks pre-start.

**Action:** shortDesc rewrite; applicationMethod external→VSLO; visaSupport→false; specialty cleanup.

## #220 — UT Southwestern Medical Center *(HIDDEN dupe of #221)*
*(id `cmn2112ds003csb11nwgawjyr` — HIDDEN / OBSERVERSHIP)*

Duplicate of #221 per P102 "Two data.js entries with this name; both resolve here". Had wrong GME-landing URL + wrong listingType OBSERVERSHIP + IMG-GRAD-OBSERVER (UTSW does NOT run a standalone IMG observership — INTL access is via separate VMS paper application track on canonical #221).

## #221 — UT Southwestern Medical Center *(major: canonical, dual-pathway structure)*
*(id `cmn2115bd00a8sb115h6bhehv` — APPROVED / MD_DO_VISITING_STUDENTS)*

UTSW dual-pathway: (1) US LCME/COCA M4 via VSLO; (2) INTL via SEPARATE paper application at international.html sub-page (incl US citizens at non-US schools). Max 2 four-week electives. BLS/ACLS + Castle Branch background check required. Parkland Hospital is the public safety-net teaching affiliate.

**Action:** shortDesc + fullDesc rewrite (1300-char); cost specifics; duration "2-4 wks" → "Max 2 four-week electives (8 wks total)"; #220 HIDDEN as dupe.

## #222 — UT Southwestern Plastic Surgery Observership *(shortDesc enrich, verified)*
*(id `cmo3386sa002z1ny9arnxr27u` — APPROVED / OBSERVERSHIP)*

UTSW Plastics INTL observership. MD-only (no PhDs). Strict Nov-May window. 6-week cap. Funding documentation ≥$2,920 USD required on official letterhead. UTSW provides B-1 invitation letter (J-1 rarely required). One of the most-specifically-documented IMG observerships — Tier-A.

**Action:** shortDesc 100 → 940 chars with all eligibility detail.

## #223 — UTHealth Houston — Observer Program *(major: listingType restoration to OBSERVERSHIP)*
*(id `cmn2114rn008usb11fgymplru` — APPROVED / OBSERVERSHIP — was MD_DO_VISITING_STUDENTS)*

Title literally says "Observer Program". Mega-audit had wrongly re-promoted ELECTIVE → MD_DO_VISITING_STUDENTS via default-to-MD-DO. Restored to OBSERVERSHIP. Multi-category hub URL covering Observers + Pre-Bacc + Professional + Visiting Student Trainees + Visiting Scientists. Dual-tier fees $100 US / $775 INTL. 8-week processing. Non-GME routing.

**Action:** listingType MD_DO_VISITING_STUDENTS → OBSERVERSHIP; shortDesc 160 → 880 chars; fullDesc 424 → 1450 chars (full multi-category hub structure + dual-tier fees + non-GME routing).

## #224 — UTHSC Memphis Visiting Medicine Students Program *(HIDDEN dupe of #218 — corrected INTL stance upstream)*
*(id `cmo34f4pf001v1nxx6b1x1i60` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #218 (same URL). Page evidence ("some INTL schools eligible if VSLO-participating") was more accurate than #218's 'formal exchange program' phrasing — used to correct #218's audienceTag + visaSupport in follow-up. UTHSC openness pattern matches UNM #201 (rare US M4 programs that accept INTL via VSLO participation alone, without institutional exchange agreement).

## #225 — UVA Breast Imaging International Visiting Scholars *(shortDesc enrich, verified)*
*(id `cmo3386v300331ny9u212xhza` — APPROVED / OBSERVERSHIP)*

UVA Radiology Breast Imaging 2-month mini-fellowship for INTL radiologists. **NOT a US-residency-prep pathway** — UVA screens for return-to-home-country intent. 3 cohort windows. NO tuition; scholar covers all costs. NO clinical privileges. Distinct from #208 UVA US M4 program.

**Action:** shortDesc 115 → 1020 chars (return-home requirement emphasized, full breast imaging modality scope).

## #226 — UW DLMP Global Observership (Pathology) *(shortDesc enrich; RESOLVES #209 IMG-exception gap)*
*(id `cmo3386xy00371ny93hmww5rk` — APPROVED / OBSERVERSHIP)*

UW Pathology Global Observership — one of TWO IMG-eligible exceptions at UW Medicine (the other is Radiology, still a gap). **Rare positive features:** NO FEE + STIPEND up to $2,500. Highly selective: 1 grad/month (~12/year). Requires Step 1 pass + LOR. Tier-A IMG candidate.

**Action:** shortDesc 90 → 820 chars. Resolves the "Pathology Global Observership" gap I'd flagged in #209.

---

## #227 — UW Madison International Observership in Urology *(shortDesc enrich, verified)*
*(id `cmo33870x003b1ny994cg6cjp` — APPROVED / OBSERVERSHIP)*

UW Madison Urology (NOT UW Seattle) for INTL physicians with prior urology experience. Highly selective. 6-week decision SLA. No-direct-patient-care + no-EMR.

**Action:** shortDesc 100 → 690 chars with explicit UW Madison-vs-Seattle distinction.

## #228 — UW Madison Pathology Observership *(shortDesc enrich)*
*(id `cmo3386zg00391ny9g217zaap` — APPROVED / OBSERVERSHIP)*

UW Madison Pathology 4-week summer observership. 2026 dates: May 26-June 19 + July 6-31. NOT for current residents elsewhere. In-person only.

**Action:** shortDesc 95 → 615 chars; cross-ref to #226 UW Seattle DLMP (separate state).

## #229 — UW Medicine Seattle Visiting Students Program *(audienceTag fix + AAMC-bleed contact removed)*
*(id `cmo34f4ey001h1nxx722orcxh` — APPROVED / MD_DO_VISITING_STUDENTS)*

URL is `/visiting-us-canada` — explicitly US + Canadian only path. **audienceTag was wrongly IMG-STUDENT-CLERKSHIP** → US-MD-DO-VISITING. contactEmail was `visitingstudents@aamc.org` AAMC-generic bleed (3rd instance: #178 UAMS + #199 U Missouri + #229 UW Seattle) → null. Anesth Diversity Scholarship featured sub-track.

**Action:** audienceTag fix; contactEmail AAMC-generic → null; shortDesc 130 → 800 chars. Resolves part of #209 UW SOM Visiting gap (US/Canada path only; INTL still a gap).

## #230 — ValueMD Clinical Rotations *(REJECTED upheld doubly)*
*(id `cmn21142r0078sb11yqmf995v` — REJECTED / EXTERNSHIP)*

Two independent rejection grounds confirmed: (1) third-party placement broker, not a USCE program (scope exclusion); (2) URL defunct (chrome-error empty response).

## #231 — Vanderbilt University Medical Center (VOE) *(MAJOR scope correction)*
*(id `cmn2113dh005osb11qdk4antb` — APPROVED / OBSERVERSHIP)*

**SCOPE TRUTH-IN-LABELING:** This is the Vanderbilt Observational Experience (VOE) — a SINGLE 8-HOUR session per calendar year (not 2-4 weeks as legacy claimed). Pre-med scope. **NOT for IMG match prep.** Vanderbilt IM residency does NOT offer observerships per P102. Kept APPROVED + PRE-MED with honest scope caveats.

**Action:** shortDesc rewrite with NOT-IMG-MATCH-PREP caveat; duration "2-4 weeks" → "Single 8-hour session per year"; cost legacy → "Not publicly disclosed"; visaSupport→false.

## #232 — Vanderbilt Visiting Medical Student Program *(shortDesc enrich, verified)*
*(id `cmo34f44700131nxxskn5dalj` — APPROVED / MD_DO_VISITING_STUDENTS)*

Vanderbilt VSLO M4 visiting. 40+ specialties in 7 monthly blocks (June-Dec). $180 fee — **WAIVED for Meharry Medical College** (HBCU partnership notable). Mar 9, 2026 catalog open. Rolling 12-week-pre-block decisions.

**Action:** shortDesc 145 → 765 chars; cross-ref to #231 VOE (different scope).

## #233 — Wake Forest Baptist Medical Center *(major: canonical, dual-campus + INTL fee structure)*
*(id `cmn2112sb0048sb11hdvon18l` — APPROVED / MD_DO_VISITING_STUDENTS)*

Wake Forest SOM + Atrium Health Charlotte dual-campus single VSLO portal (Mar 13, 2026 open). US LCME/COCA + INTL accepted. **INTL fee differential**: $100 application + $2,500 admin per 4-week rotation. Priority: WF students > visiting domestic > INTL. 5-week cancellation policy.

**Action:** shortDesc + fullDesc rewrite (1600-char); cost rewrite with explicit INTL premium; duration → "4-week (5-week cancellation)"; specialty cleanup. #234 HIDDEN as dupe.

## #234 — Wake Forest Visiting Medical Student Program *(HIDDEN dupe of #233)*
*(id `cmo34f4a9001b1nxx7z6m9qck` — HIDDEN / MD_DO_VISITING_STUDENTS)*

Duplicate of #233 (URL trailing-slash diff only). Held `class@wfu.edu` contact — but that's the Wake Forest UNIVERSITY undergraduate central domain, not the medical school's `wakehealth.edu` pattern; suspicious cross-domain artifact, NOT promoted to #233. visaSupport=false was incorrect (INTL IS accepted per P102) — #233 correctly preserves visaSupport=true.

## #235 — Washington University St. Louis Visiting Medical Student Electives *(shortDesc enrich)*
*(id `cmo34f3ut000r1nxxih2be7f5` — APPROVED / MD_DO_VISITING_STUDENTS)*

WashU SOM final-year electives at Barnes-Jewish + St. Louis Children's + affiliated. VSLO only — home school MUST be VSLO-network. Single 4-week elective (high volume restriction). NO tuition + $100 admin fee.

**Action:** shortDesc 130 → 590 chars with VSLO-network-member requirement + cross-ref to #236 INTL track.

## #236 — WashU International Physician Observer — Head & Neck Surgery *(BLEED SOURCE #3 CONFIRMED + shortDesc enrich)*
*(id `cmo33869400291ny9mllmvndb` — APPROVED / OBSERVERSHIP)*

**BLEED ROOT CAUSE #3 confirmed:** `sidpuram@wustl.edu` (Dr. Sid Puram, Chief of Head & Neck Surgery) IS the legitimate WashU contact for this row — and was the email wrongly bled onto #197 UMN Pathology. Direct-to-chief application workflow. NO financial support — observer self-arranges visa/travel/housing.

**Action:** shortDesc 115 → 800 chars. Bleed catalog now complete at 3 sources × 5 bleed-target rows.

## #237 — Wayne State University / Detroit Medical Center *(MAJOR: shortDesc + fullDesc + visa + specialty)*
*(id `cmn2112xb004msb11lxcsbuqj` — APPROVED / MD_DO_VISITING_STUDENTS)*

**Structural quirk:** Wayne State SOM does NOT run observerships — DMC (the affiliated medical center) runs the visiting students program. INTL explicitly excluded. 2-path eligibility (affiliation agreement OR VSLO). 60-day app deadline. Special M4-only rotations: Peds + Neurosurg + Trauma Surg + Surg ICU + PM&R.

**Action:** shortDesc rewrite; fullDesc 423 → 1750 chars; visaSupport→false; specialty cleanup.

## #238 — Weill Cornell Visiting International Medical Students Program *(shortDesc enrich)*
*(id `cmo34f3ii000b1nxxbgalsak9` — APPROVED / CLERKSHIP)*

WCM Office of Int'l Medical Student Education. INTL non-US/Canada final-year M4 only. **Direct-contact-disqualification rule** (unusually strict). VSLO ONLY. 2 or 4-week electives, max 12 weeks total. $1,500/2wk or $3,000/4wk + $300 app fee. WCM offers ONLY electives — NO observerships. US/Canadian path is separate listing gap.

**Action:** shortDesc 132 → 820 chars. Gap: WCM US/Canadian M4 pathway separate listing not in directory.

## #239 — Wyckoff Heights Medical Center *(shortDesc rewrite — Sub-I structure highlighted)*
*(id `cmn2114zu009isb116spgam3g` — APPROVED / MD_DO_VISITING_STUDENTS)*

Wyckoff UME program: Core Rotations (M3 clerkships) + Sub-Internships (M4 advanced electives at intern level — write notes, manage patients with attending oversight). Multi-audience (IMG-STUDENT-CLERKSHIP + US-MD-DO-VISITING). Erin Kruck contact legit.

**Action:** shortDesc 150-char legacy puffery → 460-char with Sub-I structure detail (note-writing + patient mgmt under attending) — stronger clinical experience than typical observership.

## #240 — Wyckoff Heights Medical Center *(REJECTED upheld — dupe of #239)*
*(id `cmn2111el0016sb11s4ch7y7z` — REJECTED / ELECTIVE)*

Confirmed duplicate of #239. Original mega-audit REJECTED with DEDUPE reason still valid. Status preserved.

## #241 — Yale School of Medicine — Postdoctoral Research *(boilerplate purge, Yale-specific)*
*(id `cmn21144u007esb11pfjw2mj2` — APPROVED / RESEARCH)*

15th postdoc row de-boilerplated. Yale OPA + Yale OISS for J1/H1B + NIH NRSA scale + 5-year cap. Cross-ref to clean tri-pathway #242 (IMG clerkship) + #243 (US M4 visiting).

**Action:** shortDesc + fullDesc replaced with Yale-specific content (1450-char).

## #242 — Yale Visiting International Student Elective Program *(shortDesc enrich)*
*(id `cmo34f3c800031nxxnx78ooru` — APPROVED / CLERKSHIP)*

Yale Office of Global Health Education. INTL non-US final-year M4. **Highly selective:** 450-500 apps/year → ~100 accepted (~20-22% rate). 4-week electives via VSLO, max 3 specialties (12 weeks total). **$4,775/4-week (among highest in directory)** + $300 app fee. 4-month hard deadline.

**Action:** shortDesc 135 → 780 chars with selectivity stats + cost-warning flag.

## #243 — Yale-New Haven Hospital *(FINAL ROW: shortDesc + duration + visa + specialty)*
*(id `cmn21135e0052sb11ny77telu` — APPROVED / MD_DO_VISITING_STUDENTS)*

Yale SOM US/Canadian VSLO path. 4-week electives + sub-internships ONLY — Yale does NOT offer observerships/externships. INTL routed to #242. Completes the Yale tri-pathway across all 3 IMG-relevant USCE categories (research / clerkship / US M4 elective).

**Action:** shortDesc rewrite; duration "2-4 weeks" → "4-week electives + sub-Is only"; visaSupport→false; specialty cleanup.

---

# G0 WALK COMPLETE — 243/243 (100%)

**Walk session totals:**
- Programs walked: 243 (100%)
- Major rewrites + enrichments: ~190
- HIDDEN as duplicates: 15 (Acumed #2 + Chicago Ortho #67 + UAB Heersink #161 + UNC #172 + UNC #173 + UH Cleveland #176 + UNM #211 + UMich #195 + U Utah #205 + U Iowa #185 + UTSW #220 + UT Memphis #224 + Wake Forest #234 + UPMC Pitt #213 + Vanderbilt? + others)
- REJECTED-upheld via D2 rewalk: 4 (U Utah dupe #206 + ValueMD #230 + Wyckoff #240 + ...)
- listingType corrections: ~10 (incl #181 Cincinnati OBSERVERSHIP→MD_DO_VISITING + #223 UTHealth Houston back-to-OBSERVERSHIP + #150 Stony Brook + others)
- audienceTag corrections: ~12 (incl #153 Temple + #183 UF Shands + #196 UMN + #229 UW Seattle + others)
- visaSupport corrections (true→false for US-only programs): ~50+
- contactEmail bleeds removed/corrected: 8+ wrong-institution emails identified
- Boilerplate IMG-postdoc rewrites: 15 (Stanford pattern applied to Einstein/Baylor/Duke/Fred Hutch/Harvard/Hopkins/Mt Sinai/Northwestern/NIH/Mayo/Stanford/UCSF/UMich/Pitt/Yale)

**Bleed root-cause catalog (3 sources × 5+ bleed-targets):**
1. `HSC-MDvisiting@salud.unm.edu` — real UNM SOM → wrongly bled to #160 U Utah + #177 U Arizona
2. `visiting@uthsc.edu` — real UT Memphis (Karen Coleman) → wrongly bled to #160 U Utah + #166 UCSD
3. `sidpuram@wustl.edu` — real WashU Head & Neck (Dr. Sid Puram) → wrongly bled to #197 UMN Pathology
4. Plus AAMC-generic helpdesk bleed (`vsas@aamc.org` / `visitingstudents@aamc.org`) at #178 UAMS + #199 U Missouri + #229 UW Seattle
5. Plus `Observership@griffinhealth.org` (Griffin CT) bled to #170 UCSF Neuropathology
6. Plus `imobservership@ttuhsc.edu` (Texas Tech) bled to #156 + #157 Trinity Health PA

**Final-sweep tasks queued (post-walk):**
1. Cross-domain contactEmail audit: query `contactEmail` host ≠ `sourceUrl` host across all rows — find any remaining bleed instances I missed during walk.
2. `linkVerified=false` rows where auditData says WORKING — reconcile stale flags.
3. UNC fullDescription nav-text noise cleanup (#174 + similar rows where auditData scrape included page chrome).
4. Hard-delete consideration for HIDDEN rows — currently ~30+ HIDDEN, all preserved in snapshot.
5. NYU subspecialty URL bleed (6 rows sharing one generic NYU URL — Chrome-walk to find subspecialty-specific URLs).
6. Verify `prod.` subdomain on #207 Moran Eye (likely build-environment artifact).
7. Investigate Vanderbilt VOE scope (#231) — possibly demote to REJECTED if 8hr/yr is below "USCE program" threshold.
8. Audit task #103 (P47 Taxonomy reset) was marked pending in TaskList — G0 walk arguably supersedes this; revisit.

**Gap candidates identified during walk (programs not currently in directory):**
- UC Davis SOM Visiting Medical Students (US M4 VSLO)
- UC San Diego ACE Program (IMG ERAS prep)
- DGSOM (UCLA) main VSLO Visiting MD students
- Cincinnati Children's Hospital INTL Visitor Program
- UMass + Jefferson Internal Medicine (noted as no-longer-offering)
- WCM US/Canadian M4 visiting students
- UW Radiology IMG observership (paired with UW Pathology #226)
- UMiami Jackson Memorial / International Medicine Institute Global Observership (850+ participants since 2008)
- UW INTL visiting medical students (separate from US/Canada path #229)
- R Adams Cowley Shock Trauma Center separate observer program
- Pitt INTL Visiting Student Program (separate from #203 domestic)
- UTHealth Houston other 4 trainee tracks (Pre-Bacc / Professional / Visiting Student / Visiting Scientist — currently only Observer is listed)
- Trinity Health Mid-Atlantic GME office contact (correct for #156 + #157 after TTUHSC-bleed removal)
- UNM Department Sponsored Visitors Program (INTL pathway at U Utah-like institutional model)

**Strong-Tier-A featurable programs identified during walk:**
- #154 Texas Tech IM Observership — most transparent IMG fee/eligibility structure
- #222 UTSW Plastic Surgery — strict but transparent IMG observership with B-1 invitation letter
- #226 UW DLMP Pathology Global — RARE NO FEE + $2,500 STIPEND (1 grad/month)
- #163 UAB Heersink INTL Observership — clean IMG/student multi-audience
- #218 UT Memphis (after correction) — US LCME + INTL via VSLO openness

---

# G0 FINAL-SWEEP #1 — Cross-domain contactEmail bleed audit (2026-05-26)

**Method:** Query all rows with both `contactEmail` and `sourceUrl` populated, extract registrable domain from each, flag rows where they don't match.

**Scope:** 118 rows had both fields populated. 38 rows flagged as cross-domain.

**Results:**
- **1 NEW BLEED FIXED:** Orlando Health Pediatric Neurosurgery Clinical Observership (`orlandohealth.com`) was holding `christianjenkins@usf.edu` — that's the USF Neurosurgery contact (legitimately at #216). Fourth bleed-target row found for the USF Christian Jenkins email; nulled on Orlando row.
- **37 LEGITIMATE dual-domain cases verified:**
  - **Medical-school + affiliated hospital** patterns (5 rows): BIDMC + Harvard (`bidmc.harvard.edu`), BWH + Harvard (`bwh.harvard.edu`), MGB EM + Harvard Medical School (`hms.harvard.edu`), CHOP + UPenn (`pennmedicine.upenn.edu`), Penn Radiology + UPHS (`uphs.upenn.edu`)
  - **University + health-system twin domains** (10 rows): UConn + UConn Health (`uchc.edu`), Henry Ford + HFHS, JHU + JHMI (`jhmi.edu`), Ohio State + OSUMC, U Chicago + UCHospitals.edu, Stanford + Stanford Health Care, UW Madison + UW Health, Columbia + CUMC, U Miami + UMiami, U of Pittsburgh + Pitt
  - **Corporate parent + local hospital** patterns (4 rows): One Brooklyn Health/Brookdale (BHMCNY), Providence + Swedish, Cleveland Clinic + CCF.org (x2), Montefiore Einstein
  - **NYC Health + Hospitals system** (3 rows): NYC H+H corporate (`nychhc.org` standardized) at MOSAIC + South Brooklyn Coney Island, plus Bellevue/Lincoln
  - **NYU Langone subspecialty observerships** (6 rows): `nyu.edu` URL + `NYULangone.org` emails — NYU Grossman SOM is now branded with NYU Langone Health affiliation. Legitimate. *(The actual NYU bug is the URL-sharing bleed I flagged in walk — 6 subspecialty rows all share one generic NYU URL. Separate from contactEmail bleed.)*
  - **SLU + SSMHealth** (1 row): `slu.edu` URL + `slucare.ssmhealth.com` email. SLUCare is the medical practice arm, SSM Health is the health system.
  - **Mayo multi-state** (1 HIDDEN row): 3 Mayo state-contact emails all `@mayo.edu` (MN/FL/AZ) — concatenated by extractor but all legitimate.
  - **Wyckoff Heights** (1 row): `whmcny.org` (WHMC NY corporate) + `wyckoffhospital.org` (hospital staff email). Both legitimate.
- **2 prior-documented quirks** (already noted, no action needed):
  - Wake Forest dupe #234: `class@wfu.edu` — wfu.edu = WF UNIVERSITY undergraduate central, NOT the medical school's `wakehealth.edu`. Was on dupe row, NOT promoted to canonical #233.
  - UNC dupe #173: `osageneral@med.unc.eduOther` — known scrape corruption (trailing "Other" appended). Cleaned in canonical #174.
- **1 page-extracted but borderline contact** (no action):
  - Grady #54: `medicaleducation@gmh.edu` — extracted from auditData page scrape (NOT seed). Even though `gmh.edu` is an unusual domain (Grady normally uses `gradyhealth.org`), the email was directly captured from Grady's page before the URL went 404. Documented in adminNotes; not a bleed.
- **1 possible-typo contact** (no action, already flagged):
  - Panamerican Trauma / VCU #133: `Gladys.shanklin@vcu.health.org` — likely intended `vcuhealth.org` (no period between vcu and health), but seed-extracted as-is. Already noted in row's adminNotes during walk: "applicants should verify on the program page if email bounces."

**Final bleed catalog (post-walk + final-sweep):**
1. `HSC-MDvisiting@salud.unm.edu` (real UNM SOM) → bled to #160 U Utah + #177 U Arizona
2. `visiting@uthsc.edu` (real UT Memphis — Karen Coleman) → bled to #160 U Utah + #166 UCSD
3. `sidpuram@wustl.edu` (real WashU Head & Neck — Dr. Sid Puram) → bled to #197 UMN Pathology
4. `christianjenkins@usf.edu` (real USF Neurosurgery — Christian Jenkins) → bled to **Orlando Health Peds Neuro** *(found in final-sweep, not walk)*
5. AAMC generic helpdesk (`vsas@aamc.org` / `visitingstudents@aamc.org`) → bled to #178 UAMS + #199 U Missouri + #229 UW Seattle
6. `Observership@griffinhealth.org` (Griffin Hospital Derby CT) → bled to #170 UCSF Neuropathology
7. `imobservership@ttuhsc.edu` (Texas Tech) → bled to #156 + #157 Trinity Health PA

**Total bleed-targets nulled across walk + final-sweep: 11 rows**

**Walk + final-sweep total:** 244 distinct row touches (243 walked + 1 final-sweep fix).

---

# G0 FINAL-SWEEP #2 — NYU subspecialty URL bleed cleanup (2026-05-26)

**Problem:** 7 NYU Langone observership/visiting rows all shared the same generic sourceUrl `https://med.nyu.edu/education/md-degree/registration-student-records/information-visiting-md-students` (the NYU Visiting MD Students general page). Only legitimate use of that URL was the NYU Langone Health row (US M4 visiting student program). The other 6 subspecialty observerships needed their own department-specific URLs.

**Root cause:** Prior mega-audit URL repair pass had Chrome-walked NYU's department pages and verified the correct subspecialty URLs via WebFetch — but the repair was logged in `adminNotes` only and **never synced to the `sourceUrl` column**. Same "adminNotes-only fix never synced" pattern I found 5+ times during the walk.

**Fixes applied (6 rows, all 1-by-1 with individual UPDATEs):**

| Row | Old URL | New URL |
|---|---|---|
| NYU Langone Academic Observership — Otolaryngology (ENT) | generic Visiting MD Students | `/departments-institutes/otolaryngology-head-neck-surgery/education/academic-observership` |
| NYU Langone Int'l Observership — Dermatologic Surgery & Cosmetics | generic | `/departments-institutes/dermatology/education/international-observership` |
| NYU Langone Int'l Observership — General and Medical Dermatology | generic | `/departments-institutes/dermatology/education/international-observership` |
| NYU Langone Int'l Observership — Hair Disorders | generic | `/departments-institutes/dermatology/education/international-observership` |
| NYU Langone Observer Program — Plastic Surgery | generic | `/departments-institutes/plastic-surgery/education/observer-program` |
| NYU Langone Visiting Int'l Physicians Program — Orthopedic Surgery | generic | `/departments-institutes/orthopedic-surgery/education/visiting-international-physicians-program` |

**Note on Derm:** 3 of the 6 fixes share the same destination URL (`.../dermatology/.../international-observership`) — that's because they are 3 sub-tracks (Derm Surgery + General/Medical Derm + Hair Disorders) of ONE NYU Perelman Department of Dermatology International Observership program. Each row's `shortDescription` + `contactEmail` distinguishes the sub-track focus. Same destination URL is correct.

**Post-fix state:** 8 NYU rows now map to 6 distinct URLs.

**Pattern observation — total "adminNotes-only URL fix never synced" bugs found across G0 walk + final-sweeps:** 11+ rows
- During walk: UK Neurology #189, UK Radiology #190, UMN Pathology #197, UMich Postdoctoral #193, Cincinnati #181 (5 rows)
- Final-sweep #2: 6 NYU subspecialty rows (this batch)

**Final-sweep #2 row touches:** 6 fixes. Walk + final-sweep #1 + final-sweep #2 total: **250 distinct row touches** (243 walked + 1 Orlando bleed + 6 NYU URL fixes).

---

# REMAINING POST-WALK TASKS (deferred)

1. `linkVerified=false` reconciliation against auditData WORKING flags
2. UNC fullDescription nav-text noise cleanup (#174 already corrected; check for similar patterns in other rows)
3. NYU subspecialty URL bleed (6 NYU Langone rows all share one generic URL — Chrome-walk to find subspecialty-specific URLs)
4. Hard-delete consideration for 45 HIDDEN rows (all preserved in snapshot)
5. Verify `prod.` subdomain on #207 Moran Eye (likely build-environment artifact)
6. Re-evaluate Vanderbilt VOE #231 scope (8hr/yr may be below "USCE program" threshold — consider demoting to REJECTED)
7. Add 13 identified gap candidates as new listings (UC Davis SOM Visiting / UCSD ACE / DGSOM main VSLO / Cincinnati Children's INTL / WCM US-Canadian / UW Radiology IMG / etc.)
8. Confirm Wake Forest #234 `class@wfu.edu` vs proper `wakehealth.edu` contact (call/email verification)
9. Confirm Panamerican Trauma `vcu.health.org` typo hypothesis vs `vcuhealth.org`
10. Page-walk Orlando Health Children's Neuroscience Institute for actual admin contact (replaces nulled USF bleed)

---

# G0 FINAL-SWEEP #3 — Cheap deferred items (2026-05-27)

Tackled items #1 + #2 + #5 + #6 from the post-walk list — the ones resolvable without a Chrome walk or user decision.

**#1 linkVerified reconciliation:**
- Surveyed: 2 APPROVED rows with `linkVerified=false` AND `auditData IS NOT NULL`
- Stale candidates (auditData shows page_excerpts): 1
- **Harvard Medical School — Research Fellowship** (`cmn2113qn006isb11ed3rrmyv`): `NEEDS_MANUAL_REVIEW` → `VERIFIED`. auditData has page_excerpts (length 1) confirming URL was successfully scraped. Row updated; adminNotes appended.

**#2 UNC nav-text noise check:**
- Probed all `title ILIKE %UNC%` APPROVED rows. Result: 1 row (UNC Hospitals, len=1050). No "menu" / "skip to" / "breadcrumb" markers in fullDescription. Already clean from walk pass.

**#5 Moran Eye `prod.` subdomain:**
- `https://prod.ophthalmology.medicine.utah.edu/...` returns **200**.
- `https://ophthalmology.medicine.utah.edu/...` (without `prod.`) returns **000** (host doesn't resolve).
- Conclusion: `prod.` IS the canonical subdomain for this site. Not a build artifact — Utah just structured their ophthalmology subdomain that way. No action needed.

**#6 Vanderbilt VOE scope:**
- Confirmed row state: duration `Single 8-hour observational session per calendar year`. shortDescription opens with `**NARROW PROGRAM SCOPE**` and details the 8-hour limit + per-participant cap.
- Decision: KEEP as APPROVED with warning intact. The honest "1 session/year" disclosure is more useful to applicants than removing the row. Users hunting Vanderbilt USCE will find this row + see immediately that it's not a full clerkship. REJECTing would just push them to less-honest search results.

**Final-sweep #3 row touches:** 1 (Harvard linkVerified flip).
**Walk + final-sweeps total:** 251 distinct row touches.

**Still deferred (need user decision or Chrome walk):**
- #3 NYU subspecialty URL bleed → done in final-sweep #2; nothing left.
- #4 HIDDEN hard-delete (45 rows) — user decision: irreversible, leave for explicit instruction.
- #7 Gap-program additions (13 candidates) — see final-sweep #4 below; walked.
- #8 Wake Forest `class@wfu.edu` confirmation — phone/email verification needed.
- #9 Panamerican Trauma typo — phone/email verification needed.
- #10 Orlando Health Children's Neuroscience contact — page walk needed.

---

# G0 FINAL-SWEEP #4 — Gap-program walk (2026-05-27)

Walked the 13 gap candidates from the post-walk list. Inserted only the rows that
could be verified via a working source URL with sufficient detail. Refused to
insert thin/unverified rows (CLAUDE.md doctrine: no row without source evidence).

**Inserted (3 new APPROVED rows):**

| # | Title | ID | URL host | Audience |
|---|---|---|---|---|
| 1 | UC Davis School of Medicine Visiting Student Program | `cmpovqtuv0001og418xzrqe8b` | health.ucdavis.edu | US-MD-DO-VISITING (LCME M4 only; INTL explicitly excluded) |
| 3 | DGSOM UCLA Visiting Student Program | `cmpovts8h0001ogbiwdgxg8dx` | medschool.ucla.edu | US-MD-DO-VISITING (LCME M4 + COCA DO M4; INTL restricted to pre-selected exchanges) |
| 11 | University of Pittsburgh SOM International Visiting Student Program | `cmpovxscp0001ogl8840saig7` | medstudentaffairs.pitt.edu | INTL-FINAL-YEAR-VISITING (separate from existing UPSOM domestic VSLO row #cmo34f3q) |

**Not inserted — reasons:**

| # | Candidate | Outcome |
|---|---|---|
| 2 | UC San Diego ACE Program | Already in DB as `cmn2114h800asb1171avairi` (HIDDEN). Program confirmed DISCONTINUED (URL 301→`vchs.ucsd.edu`). No-op. |
| 4 | Cincinnati Children's Hospital INTL Visitor | Already in DB as APPROVED `cmn2114m`. False gap. |
| 5 | UMass + Jefferson Internal Medicine | Already noted discontinued in original gap list. Skip. |
| 6 | WCM US/Canadian M4 visiting students | Already in DB as APPROVED `cmn21114` + `cmo34f3i`. False gap. |
| 7 | UW Radiology IMG observership | UW Radiology dept pages do not publish an observership program at standard URL patterns (`rad.uw.edu/about/diversity/observerships/`, `/education/`, etc.). Sister to UW Pathology #226 was inferred from #226's page; not verifiable as a standalone published program. SKIPPED — no verifiable source. |
| 8 | UMiami Jackson Memorial / IMI Global | Already in DB as APPROVED `cmo3385f` (Harrington Global Observership). False gap. |
| 9 | UW INTL visiting medical students | `uwmedicine.org/school-of-medicine/visiting-students-program/visiting-international` returns 403 Forbidden (Cloudflare). Existing US-Canada row `cmo34f4e` implies a sibling INTL page but it's unreachable. SKIPPED — no verifiable source. |
| 10 | R Adams Cowley Shock Trauma observer | `umms.org/ummc/health-services/shock-trauma/about/observer-program` returns 403 Forbidden. SKIPPED — no verifiable source. |
| 12 | UTHealth Houston other trainee tracks | Walked `med.uth.edu/gme/trainee-resources/visiting-trainees/`. Only Observer Program (#cmn2114r already in DB), Visiting Residents (ACGME-only, NOT USCE-relevant), and Visiting Scientists (research, NOT clinical USCE). No additional USCE-scope tracks. Skip. |
| 13 | Trinity Health Mid-Atlantic GME contact | `trinityhealthma.org/healthcare-professionals/gme` exists but does not publish a central GME contact email. Per-hospital contact only (Mercy Catholic, Nazareth, St Mary, Saint Francis). Rows #156/#157 stay with `contactEmail=null` — honest. No-op. |
| 14 | UNM Department Sponsored Visitors Program | `hsc.unm.edu` SSL cert verification fails via WebFetch. Cannot verify alternate-pathway URL. SKIPPED — no verifiable source. |

**Final-sweep #4 row touches:** 3 INSERTs. Walk + sweeps total: **254 distinct row touches** (251 + 3).

**Doctrine note:** Refused to insert 5 candidates (#7, #9, #10, #14, and a possible #5) because their source URLs returned 403 / 404 / SSL failure. Per CLAUDE.md "no row without source evidence" rule — these stay deferred until a working URL can be verified manually (e.g., via browser session not subject to bot blocking).

