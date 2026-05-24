# P97 — Discovery Integrity Doctrine

**Status:** BINDING. Validator-enforced. No agent may declare completion in prose.

**Branch this was created on:** `local/p97-discovery-integrity-guardrails`

## 1. Why this exists

Previous P97-2 work claimed multiple states "complete" while:
- searching only the flagship medical school per state
- bulk-classifying mid-tier and rural hospitals as "umbrella sub-locations"
  without opening their education page trees
- using one search per institution instead of the multi-page traversal
  that found 21 candidates in Maine
- relying on prose declarations ("Maryland complete (24/24 counties)") rather
  than evidence rows

When this was caught, all non-Maine work was reverted (HEAD reset to
`10d8354`). This doctrine exists so the same failure mode cannot recur.

**The core rule:** completion is evidence-driven, not narrative-driven. The
agent cannot declare a county or state complete; only the validator can,
and only if the required evidence rows and packets exist.

## 2. Forbidden shortcuts

The following are validator failures, not stylistic preferences:

- **Umbrella-only completion.** A health system's flagship cannot stand in
  for its sub-locations. Each hospital named in a county still gets its
  own institution packet that proves whether the system-wide opportunity
  applies to that location.
- **One-search hospital completion.** A single web search is not a
  searched institution. The packet must record GME / UME / medical-student
  / visiting-student / observership / electives / department / residency
  page checks (or document why each was absent).
- **Flagship-only state completion.** A state with one academic medical
  center does not get a free pass. Every named teaching hospital,
  community hospital, and VA-affiliated site in every county still gets
  a packet.
- **"No results found" without a search log.** If an institution yields
  no candidate, the packet records exactly which pages were opened and
  which terms were tried.
- **Silently skipped counties / hospitals.** Any institution mentioned in
  the county institution inventory but lacking a packet fails county
  validation. There is no way to skip without recording.
- **Third-party sources as truth.** Search-result blog spam, Doximity
  directories, AMA observership listings, FREIDA — these are leads, not
  source of truth. Final candidate URLs must be on official institution
  domains.
- **Candidate import without human review.** This file system stages
  candidates for review; nothing here writes to the live `Listing` table.

## 3. Institution packet requirement

Every institution that exists in a county gets a packet at:

```
docs/platform-v2/local/p97-institution-packets/<STATE>/<COUNTY>/<institution-slug>.json
```

`<institution-slug>` is lowercase kebab-case of the institution name with
parent-system disambiguation if needed (e.g.
`maine-medical-center-mainehealth.json`).

If a packet does not exist, the institution was not searched. There is
no other interpretation.

## 4. Required institution packet fields

```json
{
  "state": "ME",
  "county": "Cumberland",
  "institutionName": "Maine Medical Center",
  "institutionType": "academic_medical_center",
  "officialWebsite": "https://www.mainehealth.org/maine-medical-center",
  "healthSystem": "MaineHealth",
  "parentSystemIfAny": "MaineHealth",
  "countyInstitutionIndex": 1,
  "startedAt": "2026-05-02T...",
  "completedAt": "2026-05-02T...",
  "searchStatus": "SEARCHED_CANDIDATES_FOUND",
  "pagesOpened": ["url1", "url2", ...],
  "internalSearchUsed": true,
  "internalSearchAbsentReason": "",
  "siteSearchUsed": true,
  "searchTermsTried": ["observership", "visiting medical student", ...],
  "educationTreePagesOpened": ["/education-research"],
  "gmePagesOpened": ["/education-research/graduate-medical-education"],
  "gmeAbsentReason": "",
  "umePagesOpened": ["/education-research/undergraduate-medical-education"],
  "umeAbsentReason": "",
  "visitingStudentPagesOpened": ["/visiting-medical-student-electives"],
  "medicalStudentPagesOpened": ["/students-residents-fellows/medical-students"],
  "departmentPagesOpened": ["/general-surgery/rotations-electives", ...],
  "residencyProgramPagesOpened": ["/residency-programs"],
  "internationalOfficePagesOpened": [],
  "clinicalEducationPagesOpened": [],
  "candidateUrlsFound": ["url..."],
  "rejectedUrlsLogged": [],
  "duplicateUrlsLogged": [],
  "notFoundLogged": false,
  "blockedLogged": false,
  "umbrellaEvidenceUrl": "",
  "subLocationApplicabilityChecked": false,
  "targetFitConcerns": [],
  "noOpportunityReason": "",
  "nextResumeStep": "",
  "evidenceSummary": "...",
  "reviewerSelfAudit": "Confirmed: every required field captured."
}
```

A packet is **complete** if every required field has a value (empty array
or empty string is acceptable when explicitly meaningful, e.g. for a
hospital with no GME). A packet is **incomplete** if any required field
is missing.

## 5. Minimum search standard per institution

For every institution, the packet must record at minimum:

1. **Official homepage opened.** Capture URL.
2. **Education / medical-education hub searched.** If absent, set
   `*PagesAbsentReason` to explain.
3. **GME page searched** (or `gmeAbsentReason` documented).
4. **UME / medical-student page searched** (or `umeAbsentReason`).
5. **Visiting-student / elective / observership / clerkship / shadowing
   keywords tried** in `searchTermsTried`.
6. **Department / residency program pages searched** for any teaching
   hospital with named ACGME residencies.
7. **Internal site search used** (or `internalSearchAbsentReason`).
8. **`site:<domain>` search performed** for required terms.
9. **Every lead logged** in candidate / rejected / duplicate / not-found
   / blocked CSV.

A packet that cannot honestly fill these fields **cannot be marked
complete**. The county containing such a packet **cannot be validated**.

## 6. Health-system umbrella rule

A system-wide visiting-student program (e.g. MaineHealth, Yale-New Haven
Health, Johns Hopkins Medicine) may apply to multiple hospitals across
multiple counties. The umbrella does not exempt sub-locations from
having packets.

For a sub-location packet to claim umbrella coverage:

- `umbrellaEvidenceUrl` must point to a page on the umbrella domain that
  explicitly lists the sub-location as a participating site, OR the
  sub-location's own page must redirect / link to the umbrella program.
- `subLocationApplicabilityChecked = true`.
- The packet's `evidenceSummary` must state which umbrella program
  applies and why.

If the sub-location has no umbrella evidence, the packet must record
that the sub-location was searched independently (institution-level pages
opened, terms tried).

Forbidden language in any packet's `evidenceSummary`:
- "umbrella sub-location"
- "rolls up"
- "parent covers"
- "system-wide assumed"

unless paired with `umbrellaEvidenceUrl` AND
`subLocationApplicabilityChecked = true`.

## 7. County completion gate

A county may be set to `VALIDATED_COMPLETE` only if the validator
confirms:

1. `institutionsIdentified > 0` OR `notFoundCount > 0` with an explicit
   row in the not-found CSV stating "no relevant institutions in county"
   (e.g. Essex County, Vermont).
2. Every institution row in `p97_institution_search_progress.csv` for
   that county has a corresponding packet file at the expected path.
3. Every packet is complete per §4 / §5.
4. Every institution either has at least one row in
   `p97_candidate_opportunities.csv`, OR a row in
   `p97_rejected_or_non_target_candidates.csv`, OR a row in
   `p97_duplicate_candidates.csv`, OR a row in
   `p97_not_found_after_search.csv`, OR a row in
   `p97_blocked_or_login_required.csv`.
5. No packet contains a forbidden umbrella shortcut without the required
   evidence.
6. The validator returns PASS for the county.

## 8. State completion gate

A state may be set to `VALIDATED_COMPLETE` only if:

1. Every county in the state's seed list is `VALIDATED_COMPLETE`.
2. A state report exists at
   `docs/platform-v2/local/p97-states/P97_<STATE>_DISCOVERY_REPORT.md`.
3. The national rollup at
   `docs/platform-v2/local/P97_NATIONAL_DISCOVERY_ROLLUP.md` lists the
   state with its validator output, not a prose claim.
4. The validator returns PASS for the state.

## 9. Allowed status labels

Only these values may appear in `countyStatus` /
`p97_state_county_progress.validationStatus`:

- `NOT_STARTED`
- `IN_PROGRESS`
- `PARTIAL_NEEDS_RESUME` — context ran out mid-county; next institution
  documented in `nextRequiredAction`
- `VALIDATED_COMPLETE` — only set by the validator
- `INVALIDATED_REDO` — set when a county was previously claimed complete
  but failed validation; must be redone from scratch
- `BLOCKED_NEEDS_USER_REVIEW` — institution blocked by login wall, paywall,
  or other non-bypassable obstacle; user decision needed before continuing

`COMPLETE` (without `VALIDATED_` prefix) is **forbidden** and triggers
validator failure.

## 10. Forbidden language

The agent may not write the following words in P97 deliverables (state
reports, rollups, commit messages, conversation responses about
completion) unless paired with validator output indicating PASS:

- "complete"
- "done"
- "finished"
- "all hospitals searched"
- "all counties searched"
- "state completed"
- "100%"

If validator output says PASS, the prose may quote the validator's
exact label (`VALIDATED_COMPLETE`) but not invent its own.

## 11. Resumability rule

When the agent runs out of context mid-state:

1. The current county is marked `PARTIAL_NEEDS_RESUME`.
2. The state/county progress row's `nextRequiredAction` field records
   the exact next institution slug that needs a packet.
3. The current institution's packet is committed in whatever state it
   reached, with `searchStatus = NOT_STARTED` if no work was done, or
   `IN_PROGRESS` with `nextResumeStep` populated.
4. The agent commits with a message that explicitly states the county
   is `PARTIAL_NEEDS_RESUME`, not `VALIDATED_COMPLETE`.

## 12. Re-validation cadence

The validator is run:
- after every institution packet is written
- before every commit that touches state/county/institution CSVs
- before any state report is created or updated
- before the national rollup is updated

If the validator fails after a packet write, the commit does not happen
and the agent must fix the packet before continuing.

## 13. What gets reverted

Any work that fails validation is moved to `INVALIDATED_REDO` status.
The corresponding institution rows / candidate rows / not-found rows are
not deleted, but the county/state status is downgraded so the work must
be redone with proper packets.

The previous P97-2 work for NH / VT / RI / CT / MA / NJ / PA / DE / MD /
DC was already reverted via `git reset --hard 10d8354`. The current
ledger contains only Maine evidence.

## 14. Bottom line

No validator pass = no completion claim.

The agent may not claim a county or state is "complete" in any prose
output. Only `npx tsx scripts/p97-validate-discovery.ts --state <STATE>`
(or `--county`, or `--all`) may emit the label `VALIDATED_COMPLETE`. The
agent quotes that label; the agent does not invent it.
