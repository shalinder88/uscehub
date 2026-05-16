# P102 Public-Safe Review Queue — Summary

Generated: 2026-05-16
Branch: `local/p102-reviewer-workflow`

## Cumulative counts

- Total review-queue entries: **46**
- Total auto-approved opportunity rows (already public-safe): **14**
- Institutions in review queue: **18**
- Source domains: **18**

## By visibility lane

| Lane | Count |
|---|---:|
| HUMAN_REVIEW_REQUIRED | 25 |
| CAUTION_SAFE_INTERNAL_REVIEW | 21 |

## By source scope

| Scope | Count |
|---|---:|
| HEALTH_SYSTEM_LEVEL | 23 |
| INSTITUTION_SPECIFIC | 19 |
| DEPARTMENT_LEVEL | 4 |

## By deep source family (top 15)

| Deep family | Count |
|---|---:|
| VISITING_STUDENT | 18 |
| MEDICAL_EDUCATION | 15 |
| OBSERVERSHIP | 4 |
| ELECTIVE | 3 |
| SUB_INTERNSHIP | 2 |
| UNDERGRADUATE_MEDICAL_EDUCATION | 2 |
| UME_VISITING_STUDENTS | 1 |
| VISITING_STUDENT_PAGE | 1 |

## Top 10 institutions by priority score

Reviewers should consider these first — they have at least one entry with the highest priority score and the most reviewable entries overall.

| # | Institution | City, State | Top score | Entry count |
|---|---|---|---:|---:|
| 1 | Houston Methodist Hospital | Houston, TX | 16 | 2 |
| 2 | David Geffen School of Medicine at UCLA | Los Angeles, CA | 15 | 6 |
| 3 | UCSF School of Medicine | San Francisco, CA | 15 | 4 |
| 4 | Keck School of Medicine at USC | Los Angeles, CA | 15 | 2 |
| 5 | UCSF Fresno | Fresno, CA | 14 | 6 |
| 6 | Orlando Health Orlando Regional Medical Center | Orlando, FL | 14 | 3 |
| 7 | Mayo Clinic | Rochester, MN | 14 | 1 |
| 8 | Emory University Hospital | Atlanta, GA | 14 | 1 |
| 9 | Cleveland Clinic Florida | Weston, FL | 13 | 2 |
| 10 | AdventHealth Orlando | Orlando, FL | 13 | 1 |

## Top 50 review-queue entries (machine-prioritized)

See `public_safe_review_queue_top50.csv` for the full machine-readable starter file.
All top-50 rows default to `reviewerDecision=KEEP_HUMAN_REVIEW`. The reviewer must explicitly change this per row.

| # | Score | Institution | Lane | Family | Source URL | Quote (truncated) |
|---|---:|---|---|---|---|---|
| 1 | 16 | Houston Methodist Hospital | CAUTION_SAFE_INTERNAL_REVIEW | MEDICAL_EDUCATION | `https://houstonmethodist.org/academic-institute/education/me…` | Medical student rotations at Houston Methodist give residents the proper amount … |
| 2 | 16 | Houston Methodist Hospital | CAUTION_SAFE_INTERNAL_REVIEW | OBSERVERSHIP | `https://houstonmethodist.org/academic-institute/education/me…` | Medical student rotations and observerships at Houston Methodist give residents … |
| 3 | 15 | Keck School of Medicine at USC | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://keck.usc.edu/md-program/visiting-student-clerkships` | Students in good academic standing in their senior year at US schools of medicin… |
| 4 | 15 | UCSF School of Medicine | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://meded.ucsf.edu/current-students/visiting-student-pro…` | The UCSF School of Medicine uses the AAMC Visiting Student Application Service (… |
| 5 | 15 | David Geffen School of Medicine at UCLA | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://medschool.ucla.edu/education/md-education/visiting-s…` | The David Geffen School of Medicine at UCLA is uses the AAMC's Visiting Student … |
| 6 | 15 | David Geffen School of Medicine at UCLA | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://medschool.ucla.edu/education/md-education/visiting-s…` | The David Geffen School of Medicine (DGSOM) at UCLA uses the AAMC Visiting Stude… |
| 7 | 14 | Mayo Clinic | CAUTION_SAFE_INTERNAL_REVIEW | VISITING_STUDENT | `https://mayoclinic.org/education` | Visiting medical student clerkships Elective clinical rotations for visiting med… |
| 8 | 14 | Emory University Hospital | CAUTION_SAFE_INTERNAL_REVIEW | MEDICAL_EDUCATION | `https://med.emory.edu/education` | Sub linkVisiting Medical StudentsSub linkInternational Students… |
| 9 | 14 | Orlando Health Orlando Regional Medical Center | CAUTION_SAFE_INTERNAL_REVIEW | VISITING_STUDENT | `https://orlandohealth.com/residency` | Academic AffiliationsConferences and Other CurriculaFellowshipsM4 Away Rotations… |
| 10 | 14 | Orlando Health Orlando Regional Medical Center | CAUTION_SAFE_INTERNAL_REVIEW | VISITING_STUDENT | `https://orlandohealth.com/fellowship` | M4 Away Rotations… |
| 11 | 14 | UCSF Fresno | CAUTION_SAFE_INTERNAL_REVIEW | ELECTIVE | `https://fresno.ucsf.edu/education` | We are a branch campus and major teaching site of the University of California, … |
| 12 | 14 | UCSF Fresno | CAUTION_SAFE_INTERNAL_REVIEW | MEDICAL_EDUCATION | `https://fresno.ucsf.edu/education/undergraduate-medical-educ…` | Undergraduate Medical EducationSJV PRIMEResources for StudentsUME ContactsVisiti… |
| 13 | 14 | UCSF Fresno | CAUTION_SAFE_INTERNAL_REVIEW | MEDICAL_EDUCATION | `https://fresno.ucsf.edu/education/medical-students` | Undergraduate Medical EducationSJV PRIMEResources for StudentsUME ContactsVisiti… |
| 14 | 14 | UCSF Fresno | CAUTION_SAFE_INTERNAL_REVIEW | VISITING_STUDENT | `https://fresno.ucsf.edu/education/visiting-medical-students` | Undergraduate Medical EducationSJV PRIMEResources for StudentsUME ContactsVisiti… |
| 15 | 14 | UCSF Fresno | CAUTION_SAFE_INTERNAL_REVIEW | VISITING_STUDENT | `https://fresno.ucsf.edu/education/medical-student-electives` | Undergraduate Medical EducationSJV PRIMEResources for StudentsUME ContactsVisiti… |
| 16 | 13 | AdventHealth Orlando | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://www.adventhealth.com/adventhealth-graduate-medical-e…` | At AdventHealth Redmond, we welcome medical students who are eager to learn the … |
| 17 | 13 | Baptist Hospital of Miami | HUMAN_REVIEW_REQUIRED | OBSERVERSHIP | `https://baptisthealth.net/international-services/internation…` | Baptist Health is unable to sponsor visas for participants of this program.… |
| 18 | 13 | Cleveland Clinic Florida | HUMAN_REVIEW_REQUIRED | ELECTIVE | `https://my.clevelandclinic.org/departments/elective-program` | Are you interested in the clinical elective program at Cleveland Clinic? Learn m… |
| 19 | 13 | Cleveland Clinic Florida | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://my.clevelandclinic.org/departments/international-med…` | Travel & HousingGet all the information you need about traveling to Cleveland.… |
| 20 | 13 | Keck School of Medicine at USC | HUMAN_REVIEW_REQUIRED | MEDICAL_EDUCATION | `https://keck.usc.edu/md-program` | The Keck School of Medicine of USC medical education program is accredited by th… |
| 21 | 11 | David Geffen School of Medicine at UCLA | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://medschool.ucla.edu/research` | MD EducationAdmissionsLCME AccreditationCareer DevelopmentCurriculumCurrent Stud… |
| 22 | 10 | Nicklaus Children's Hospital | HUMAN_REVIEW_REQUIRED | MEDICAL_EDUCATION | `https://nicklauschildrens.org/medical-education` | Nicklaus Children's Health System extends its medical education impact beyond Fl… |
| 23 | 10 | Nicklaus Children's Hospital | HUMAN_REVIEW_REQUIRED | MEDICAL_EDUCATION | `https://nicklauschildrens.org/medical-professionals` | Nicklaus Children's Hospital is committed to its role as a teaching hospital pro… |
| 24 | 10 | Memorial Healthcare System - Memorial Regional Hollywood | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://mhs.net/education/undergraduate-medical-education/re…` | Students accepted for rotations with Memorial Healthcare System must complete th… |
| 25 | 9 | Tampa General Hospital | CAUTION_SAFE_INTERNAL_REVIEW | OBSERVERSHIP | `https://tgh.org/health-professionals` | Physician-to-Physician Observer Application Request at TGH Main… |
| 26 | 9 | Boston Medical Center | CAUTION_SAFE_INTERNAL_REVIEW | SUB_INTERNSHIP | `https://bmc.org/residency` | ClerkshipsSub-InternshipUltrasound Elective… |
| 27 | 9 | Boston Medical Center | CAUTION_SAFE_INTERNAL_REVIEW | VISITING_STUDENT | `https://www.bmc.org/otolaryngology-head-neck-surgery/residen…` | BenefitsVisiting Medical StudentsAlumniBU Frontline Medicine… |
| 28 | 9 | Memorial Sloan Kettering Cancer Center | CAUTION_SAFE_INTERNAL_REVIEW | ELECTIVE | `https://mskcc.org/medical-students` | Medical Student Elective Program: How to Apply… |
| 29 | 9 | Hospital for Special Surgery | CAUTION_SAFE_INTERNAL_REVIEW | MEDICAL_EDUCATION | `https://hss.edu/education` | The mission of the HSS Education Institute is to be a source for outstanding ini… |
| 30 | 9 | Hospital for Special Surgery | CAUTION_SAFE_INTERNAL_REVIEW | MEDICAL_EDUCATION | `https://hss.edu/education-institute` | Academic Visitor Program… |
| 31 | 9 | UAB Hospital | CAUTION_SAFE_INTERNAL_REVIEW | MEDICAL_EDUCATION | `https://uab.edu/medicine/international` | Interested in visiting the United States for medical training or research?… |
| 32 | 9 | UAB Hospital | CAUTION_SAFE_INTERNAL_REVIEW | VISITING_STUDENT | `https://uab.edu/medicine/international/international-program…` | Our international programs include:International Visiting Medical Students… |
| 33 | 8 | UCSF School of Medicine | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://meded.ucsf.edu/current-students` | Anti-Oppression Curriculum InitiativeCourse and Schedule InformationEmergency Co… |
| 34 | 8 | UCSF School of Medicine | HUMAN_REVIEW_REQUIRED | MEDICAL_EDUCATION | `https://meded.ucsf.edu/md-program` | Visiting Student Program… |
| 35 | 8 | UCSF School of Medicine | HUMAN_REVIEW_REQUIRED | MEDICAL_EDUCATION | `http://meded.ucsf.edu/about-us/guidelines-policies/medical-s…` | Visiting Student ProgramAdvising and Career Development… |
| 36 | 8 | David Geffen School of Medicine at UCLA | HUMAN_REVIEW_REQUIRED | MEDICAL_EDUCATION | `https://medschool.ucla.edu/education` | Financial Aid & ScholarshipsResearch OpportunitiesStudent Life & EventsVisiting … |
| 37 | 8 | David Geffen School of Medicine at UCLA | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://medschool.ucla.edu/education/md-education` | Visiting StudentsExpand Visiting Students submenuVSLO… |
| 38 | 8 | David Geffen School of Medicine at UCLA | HUMAN_REVIEW_REQUIRED | VISITING_STUDENT | `https://medschool.ucla.edu/gme` | Visiting StudentsExpand Visiting Students submenuVSLO… |
| 39 | 8 | Orlando Health Orlando Regional Medical Center | HUMAN_REVIEW_REQUIRED | MEDICAL_EDUCATION | `https://orlandohealth.com/medical-professionals` | Graduate Medical EducationOverviewClerkship ProgramsFellowship Programs… |
| 40 | 8 | Memorial Healthcare System - Memorial Regional Hollywood | HUMAN_REVIEW_REQUIRED | UNDERGRADUATE_MEDICAL_EDUCATION | `https://mhs.net/education/undergraduate-medical-education` | Memorial Healthcare System provides clinical training to medical students in a d… |
| 41 | 8 | UCSF Fresno | CAUTION_SAFE_INTERNAL_REVIEW | UME_VISITING_STUDENTS | `https://fresno.ucsf.edu/research` | Undergraduate Medical EducationSJV PRIMEResources for StudentsUME ContactsVisiti… |
| 42 | 6 | Memorial Healthcare System - Memorial Regional Hollywood | HUMAN_REVIEW_REQUIRED | MEDICAL_EDUCATION | `https://mhs.net/education` | Undergraduate Medical EducationToggle Undergraduate Medical Education sectionReq… |
| 43 | 4 | Boston Medical Center | HUMAN_REVIEW_REQUIRED | SUB_INTERNSHIP | `https://www.bmc.org/ear-nose-and-throat-department/residency…` | NOT_STATED_ON_SOURCE… |
| 44 | 4 | Hospital for Special Surgery | HUMAN_REVIEW_REQUIRED | OBSERVERSHIP | `https://hss.edu/education-institute/academic-visitor-program` | NOT_STATED_ON_SOURCE… |
| 45 | 3 | Boston Medical Center | CAUTION_SAFE_INTERNAL_REVIEW | VISITING_STUDENT_PAGE | `https://bmc.org/benefits` | Information for ApplicantsBenefitsVisiting Medical StudentsAlumniBU Frontline Me… |
| 46 | 3 | Memorial Healthcare System - Memorial Regional Hollywood | HUMAN_REVIEW_REQUIRED | UNDERGRADUATE_MEDICAL_EDUCATION | `https://mhs.net/medical-professionals` | Medical Education OpportunitiesContinuing Medical Education (CME)Graduate Medica… |

## How to use this

1. Open `public_safe_review_queue_top50.csv` in a spreadsheet.
2. For each row, decide one of: `APPROVE_PUBLIC_SAFE`, `REJECT_NOT_USCE`, `REJECT_SCOPE_MISMATCH`, `REJECT_OFF_DOMAIN_NO_APPLICABILITY`, `KEEP_HUMAN_REVIEW`, `NEEDS_MORE_EVIDENCE`, `FUTURE_LANE_ONLY`, or `DUPLICATE_OF_APPROVED_ROW`.
3. For `APPROVE_PUBLIC_SAFE` on system/school sources, fill `campusApplicabilityProof` with a ≥ 30-char verbatim quote or named-list reference (see `P102_REVIEWER_WORKFLOW_SPEC.md` §7).
4. Fill `decisionReason` (≥ 10 chars, not "TBD"/"TODO").
5. Fill `reviewer` with your name; `reviewedAt` with today's ISO date (YYYY-MM-DD).
6. Save as `public_safe_review_decisions_top50.csv`.
7. Run `npx tsx scripts/p102-build-approved-public-safe-export.ts` to generate the approved export.
8. Run `npx tsx scripts/p102-validate-approved-public-safe-export.ts` to confirm safety gates hold.

No row is auto-approved. The validator rejects fake placeholder values.
