# P101 — Opportunity Tag Taxonomy (canonical strings for schemaVersion p101-1)

Every value in a packet's `opportunityTags` block must be drawn from this canonical list. Any non-listed string is a validator failure.

## Audience tags (`opportunityTags.audience`)

| Tag | Use when source explicitly says... |
|---|---|
| `US_MD` | US LCME-accredited MD-program students are eligible |
| `US_DO` | US COCA/AOA-accredited DO-program students are eligible |
| `LCME_ONLY` | Eligibility restricted to LCME (no DO) |
| `COCA_ALLOWED` | DO students explicitly mentioned as eligible |
| `INTERNATIONAL_MS` | International medical school students explicitly eligible |
| `IMG_GRAD` | Post-MD international medical graduates explicitly eligible (observership) |
| `CARIBBEAN` | Caribbean medical school students explicitly addressed (eligible OR excluded — see paired exclusion tag) |
| `FINAL_YEAR_ONLY` | Restricted to final-year MS (MS4 or equivalent) |
| `MS4_ONLY` | Synonym for final year in US system |
| `MS3_ALLOWED` | MS3s explicitly allowed |
| `AFFILIATION_REQUIRED` | Student's home school must have affiliation agreement |
| `EXCHANGE_PARTNER_ONLY` | Only schools on a named exchange partner list |
| `NOT_INTERNATIONAL` | Source explicitly excludes international medical schools |
| `NOT_IMG_GRAD` | Source explicitly excludes IMG graduates / no observer category |

## Application tags (`opportunityTags.application`)

| Tag | Use when |
|---|---|
| `VSLO` | Standard AAMC VSLO application required |
| `VSLO_GLOBAL` | VSLO Global network specifically referenced (for international applicants) |
| `DIRECT_APPLICATION` | Application directly to the institution, not VSLO |
| `EMAIL_COORDINATOR` | Application begins with email to a named coordinator |
| `ONLINE_FORM` | Institution's own web form |
| `PDF_APPLICATION` | Downloadable PDF application |
| `BY_INVITATION_ONLY` | Pre-existing relationship or partner-only |
| `DETAILS_BY_COORDINATOR` | Source states details available only by contacting coordinator |
| `CLOSED_OR_PAUSED` | Lane explicitly closed at time of capture |
| `BOT_BLOCKED` | Source page blocked automation; lane existence inferred but unconfirmed |

## Experience type tags (`opportunityTags.experienceType`)

| Tag | Use when |
|---|---|
| `CLINICAL_ELECTIVE` | Standard clinical elective (most common) |
| `AWAY_ROTATION` | Source uses "away rotation" specifically |
| `SUB_INTERNATIONAL` | Source uses "sub-internship" / "sub-I" |
| `OBSERVERSHIP` | Source uses "observership" — non-hands-on |
| `EXTERNSHIP` | Source uses "externship" |
| `RESEARCH_ONLY` | Research-only program |
| `SHADOWING` | Pure shadowing, no patient interaction |
| `HANDS_ON` | Source explicitly states hands-on patient care |
| `OBSERVER_ONLY` | Source explicitly states observation only |
| `UNCLEAR_HANDS_ON_STATUS` | Source ambiguous on hands-on status |

## Cost tags (`opportunityTags.cost`)

| Tag | Use when |
|---|---|
| `FREE` | Source explicitly states no cost / no tuition |
| `COST_STATED` | At least one dollar amount stated verbatim |
| `COST_NOT_STATED` | Source silent on cost |
| `APPLICATION_FEE` | Application fee explicitly stated |
| `TUITION_FEE` | Program tuition / clerkship fee stated |
| `HIGH_COST` | Aggregate cost ≥ $5,000 per rotation (e.g., UAB IVMS $5,200, Stanford IVS $6,200) |
| `HOUSING_COST_STATED` | Housing fee/range stated |
| `MALPRACTICE_COST_STATED` | Malpractice insurance requirement with cost |

## Visa tags (`opportunityTags.visa`)

| Tag | Use when |
|---|---|
| `B1_B2_MENTIONED` | Source mentions B-1/B-2 visa |
| `J1_MENTIONED` | Source mentions J-1 |
| `H1B_MENTIONED` | Source mentions H-1B |
| `F1_OPT_MENTIONED` | Source mentions F-1 or OPT |
| `VISA_STUDENT_RESPONSIBILITY` | Source explicitly puts visa on student |
| `VISA_NOT_MENTIONED` | Source silent on visa |
| `US_ONLY_AUDIENCE` | Source audience is US-only — visa not applicable |

## Source tags (`opportunityTags.source`)

| Tag | Use when |
|---|---|
| `INSTITUTION_SPECIFIC` | Source page is the institution's own canonical page |
| `SCHOOL_LEVEL_SOURCE` | Source is the affiliated SOM, not the hospital |
| `SYSTEM_LEVEL_SOURCE` | Source is the parent health system |
| `DEPARTMENT_LEVEL_SOURCE` | Source is a department within the institution |
| `PDF_SOURCE` | Primary evidence is a PDF |
| `OFFICIAL_SOURCE` | The source is the institution's own canonical domain |
| `THIRD_PARTY_LEAD_ONLY` | Used a third-party lead but not as evidence |
| `SCREENSHOT_CAPTURED` | Screenshot of the source page exists in artifact manifest |
| `CLEANED_TEXT_SAVED` | Cleaned-text file of source page saved |
| `HASH_CAPTURED` | SHA-256 of cleaned source text recorded in `changeDetectionPrep.sourceHash` |
| `NEEDS_MANUAL_RETRY` | One or more artifact captures failed; queued in manual retry log |

## Validator enforcement

`validate-p101-discovery-command-center.ts` will reject any p101-1 packet that:
- Has an `opportunityTags` value not in the canonical lists above.
- Has a `*_CONFIRMED` classification but no audience tag matching the eligible-audience claim.
- Carries `SCREENSHOT_CAPTURED` source tag without a non-empty `screenshotPath` in any `sourceEvidence` entry.
- Carries `HASH_CAPTURED` source tag without a non-empty `changeDetectionPrep.sourceHash`.

The intent is symmetry: tags exist to support search/filter; the validator enforces that tags are not invented separately from the source-evidence reality.
