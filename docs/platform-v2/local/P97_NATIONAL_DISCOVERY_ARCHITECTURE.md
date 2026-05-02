# P97 — national county-by-county USCE discovery (architecture)

Local-only, append-only, resumable, county-by-county discovery
system for finding USCE-relevant opportunities not yet in USCEHub.
**No DB mutation. No import. No production route. No push. No
deploy.** Outputs are CSV ledgers + per-state markdown reports;
they feed a future human-review queue, never the live DB.

## 1. Purpose

Replace ad-hoc browsing with a deterministic, geographically
ordered, evidence-logged process that:
- never duplicates work,
- never silently discards a lead,
- never relies on third-party directories as source of truth,
- never imports anything automatically,
- always requires a human-review step before the live `Listing`
  table sees a row.

## 2. Target user

Medical students, IMGs, U.S. medical graduates, old-YOG applicants,
reapplicants, SOAP candidates, visa-dependent applicants, medical
graduates seeking U.S. clinical exposure / Match support.

## 3. Inclusion criteria (TARGET_USCE_MATCH)

- observership / clinical observership / observer program
- IMG observership / international medical graduate observership
- externship / clinical externship
- elective / clinical elective / visiting student elective /
  visiting medical student / international visiting medical student
- away rotation / visiting rotation
- clerkship if open to visiting students/graduates
- shadowing if medical-student/graduate/IMG relevant
- clinical research for medical students / graduates / IMGs
  (Match-relevant, not basic-science postdoc)
- research observership if clinical and Match-relevant
- B-1 / B-2 observer pathway when an official page supports it

## 4. Exclusion criteria (rejected, not silently)

These are **logged in the rejected/non-target CSV**, not deleted:

- attending-only observerships
- specialist-only / faculty-only / fellow-only programs
- postdoctoral / basic-science / PhD-only research
- genetics / molecular / wet-lab / bench research framed as
  laboratory science (not clinical USCE)
- consulting / advisory services
- patient-appointment pages
- general volunteer programs not medical-trainee-relevant
- non-clinical research-assistant jobs
- industry research
- paid third-party placement pages without an official source

Note: research is **not automatically excluded.** Clinical
research with explicit medical-student / graduate / IMG framing
counts as target-relevant. Basic-science / postdoc / PhD-only is
non-target unless it is explicitly framed as clinical USCE.

## 5. Ambiguous / manual-review (MAYBE_TARGET_MANUAL_REVIEW)

- title or page wording is unclear about IMG eligibility
- specialty restriction unclear
- official page exists but USCE language is implicit
- third-party directory mentions a real-looking program that
  needs an institutional source confirmation

## 6. State / county progress model

`p97_state_county_progress.csv` tracks every county in every
state. `countyStatus` is one of:

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETE`
- `BLOCKED_NEEDS_REVIEW`
- `PARTIAL`

Each row records institutions identified, institutions searched,
candidates found (broken down by status), and a free-form notes
field for resume context.

## 7. Institution discovery model

Per county, we identify institutions of these types:

- `hospital`
- `health_system`
- `academic_medical_center`
- `medical_school`
- `department`
- `gme_office`
- `ume_office`
- `international_office`
- `visiting_student_office`
- `va_teaching_hospital`
- `clinic_teaching_site`
- `other`

Lead sources for institution discovery (official + reliable):

- official hospital / health-system websites
- medical-school official websites
- VA official pages (for VA-affiliated teaching hospitals)
- state hospital association pages (as leads, not source of truth)
- county health/hospital district pages
- ACGME / AMA / AAMC official pages (as leads only)
- third-party directories (only as leads, never source of truth)

Per institution, we search both institution-level and
department-level pages. Departments to search by default:
internal medicine, family medicine, pediatrics, surgery,
neurology, psychiatry, pathology, radiology, emergency medicine,
anesthesiology, cardiology, oncology, nephrology, pulmonary /
critical care.

## 8. Official-source verification model

For every candidate URL, we record:

- `sourceQuality` — one of
  `EXACT_OFFICIAL_PROGRAM_PAGE`,
  `OFFICIAL_APPLICATION_PAGE`,
  `OFFICIAL_POLICY_PAGE`,
  `OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT`,
  `OFFICIAL_GENERIC_PAGE`,
  `THIRD_PARTY_LEAD_ONLY`,
  `WRONG_PAGE`,
  `DEAD_OR_BLOCKED`,
  `LOGIN_REQUIRED`,
  `NO_BETTER_SOURCE_FOUND`.
- `evidenceUrl` — the URL itself
- `evidenceSnippet` — the short relevant text from the page
- `searchTermsThatFoundIt` — the query that surfaced the page

Only `EXACT_OFFICIAL_PROGRAM_PAGE`, `OFFICIAL_APPLICATION_PAGE`,
`OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT` are eligible to become
`APPROVED_FOR_HUMAN_REVIEW`. Everything else stays in a lower
candidate status until verified.

## 9. Duplicate detection model

Before a candidate is logged as new:

1. Check `existingListingMatch` against the live `Listing`
   table's exported title + sourceUrl + institution+specialty
   tuple (read-only export, not a live DB query in this run).
2. Check against `p97_candidate_opportunities.csv` for in-flight
   duplicates from earlier counties / states.
3. If `duplicateCheckResult` is positive, write the row to
   `p97_duplicate_candidates.csv` instead of the candidate file.

## 10. Candidate staging model

`candidateStatus` lifecycle:

- `NEW_LEAD` — surfaced via search, not yet verified
- `OFFICIAL_SOURCE_FOUND` — official institution page confirmed
- `APPLICATION_PAGE_FOUND` — separate application URL also captured
- `DUPLICATE_POSSIBLE` — overlap with existing data suspected
- `NEEDS_MANUAL_REVIEW` — ambiguous fit
- `REJECTED_THIRD_PARTY_ONLY`
- `REJECTED_NO_USCE_CONTENT`
- `REJECTED_NON_TARGET`
- `REJECTED_DEAD_SOURCE`
- `APPROVED_FOR_HUMAN_REVIEW` — passes all gates; eligible for
  the future P97-2 review queue
- `IMPORT_READY_AFTER_REVIEW` — human reviewer has explicitly
  approved (set later, not by this script)
- `IMPORTED_LATER` — the opt-in import script wrote it to the DB
  (set later, not by this script)

## 11. Rejected / blocked / not-found logging model

Every lead ends in **exactly one** of:

- `p97_candidate_opportunities.csv`
- `p97_rejected_or_non_target_candidates.csv`
- `p97_duplicate_candidates.csv`
- `p97_not_found_after_search.csv`
- `p97_blocked_or_login_required.csv`

No silent discards. No mental shortcuts. If a lead isn't worth a
candidate row, it gets a rejected/duplicate/not-found row with
the reason and the search term that surfaced it.

## 12. No-screenshot evidence policy (this run)

For P97-0 / P97-1, evidence = (a) the URL, (b) a short
text snippet from the page, (c) the search query that found the
page. We do **not** capture PNGs in this run. The audit script
is text-only via WebSearch + targeted WebFetch; screenshot capture
is deferred to a later phase if it adds value.

## 13. Future screenshot policy

If a candidate is approved for human review, the reviewer (or a
later automation) MAY decide to capture a fresh screenshot before
import. This is **out of scope for P97-0 / P97-1**. When it
happens, it follows the P96-3 pattern: PNGs land under
`docs/platform-v2/local/screenshots/p97-discovery/` (gitignored).

## 14. Safety / rate-limit policy

- Per-host throttle: at most a handful of fetches per hostname
  per minute.
- Cap pages per institution: ≤ 5 official pages opened per
  institution per pass.
- No login. No CAPTCHA bypass. No credentialed access.
- No paywalled / login-required scraping.
- No aggressive crawling.
- Respect robots.txt-style intent for publicly indexed pages
  (we use WebSearch for indexed leads, not raw crawlers).

## 15. Resume / restart procedure

- The script reads `p97_state_county_progress.csv` first.
- Counties with `countyStatus = COMPLETE` are skipped (unless
  `--force`).
- Counties with `IN_PROGRESS` or `PARTIAL` are picked up where
  the notes field left off.
- Each institution row in `p97_institution_search_progress.csv`
  has a `searchedAt`; institutions searched within the last
  N days (default 60) are not re-queried unless `--force`.
- After every county, the script flushes both progress CSVs.

## 16. Final import policy

**No import without human review.** This file system is the
candidate queue. The future P97-2 step is a small admin UI that
reads `p97_candidate_opportunities.csv`, lets a human approve
each row, and only then runs an explicit import. P97-0 and
P97-1 never write to the `Listing` table.

## 17. Build-then-discover sequence

The user-approved sequence is:

1. **Build the ledger framework** (this doc + 8 CSVs +
   discovery script + 50-state seed) — done in P97-0.
2. **Run Maine in full** as the pilot state — P97-1.
3. Inspect Maine quality: are duplicates being caught? Are
   rejected rows accurate? Are not-found counties believable?
4. Once Maine passes inspection, continue NH → VT → MA → RI →
   CT → NY → NJ → PA → and so on, state by state, with
   resume support.
