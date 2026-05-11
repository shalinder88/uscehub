# P101 — Institution Packet Schema (schemaVersion: p101-0)

Every searched institution writes exactly one packet at:

```
docs/platform-v2/local/usce-discovery-command-center/institution-packets/<STATE>/<institution-slug>.json
```

`<STATE>` is the 2-letter abbreviation. `<institution-slug>` is lowercase-hyphenated.

## Required JSON shape

```json
{
  "schemaVersion": "p101-0",
  "institution": {
    "name": "string — official institution name",
    "aliases": ["other commonly-used names"],
    "city": "string",
    "state": "2-letter abbr",
    "officialDomain": "primary canonical domain",
    "institutionType": "academic_medical_center | community_teaching_hospital | community_hospital | childrens_hospital | va_affiliate | public_hospital | medical_school | health_system | clinic | other",
    "healthSystem": "parent system if any, else empty",
    "sourceOfIdentity": "what document/queue/source named this institution"
  },
  "searchProcess": {
    "searchedAt": "ISO 8601 timestamp",
    "searchMode": "ONE_INSTITUTION_ONE_WEBSITE",
    "officialDomainsChecked": ["domain1", "domain2"],
    "searchTermsTried": ["term1", "term2"],
    "pagesOpened": ["url1", "url2"],
    "rejectedPages": [
      {
        "url": "string",
        "title": "string",
        "reason": "one of the rejected-page-reason enum"
      }
    ],
    "robotsOrAccessNotes": "string — bot blocks, CAPTCHA, rate-limit, JS-only render, paywall",
    "stopCondition": "one of the stop-condition enum"
  },
  "candidateFindings": [
    {
      "sourceUrl": "absolute URL — the page that supports the claim",
      "pageTitle": "the page <title> or H1",
      "sourcePageType": "INSTITUTION_HUB | DEPARTMENT_PAGE | FEE_SCHEDULE | HANDBOOK_PDF | FAQ | APPLICATION_FORM | OTHER",
      "shortQuote": "verbatim ≤ 240 chars from the page — the receipt for the claims below",
      "quoteSupports": ["audience" or "cost" or "visa" or "application" or "duration" or "specialty" or "sourceScope"],
      "audienceDecision": "one of the audience-decision enum",
      "applicationDecision": "one of the application-decision enum",
      "costDecision": "one of the cost-decision enum",
      "visaDecision": "one of the visa-decision enum",
      "durationDecision": "free text from source OR NOT_STATED_ON_SOURCE",
      "specialtyDecision": "free text from source OR NOT_STATED_ON_SOURCE",
      "sourceScopeDecision": "one of the source-scope-decision enum",
      "confidenceTier": "one of the confidence-tier enum",
      "classification": "one of the classification enum",
      "caveats": ["any source-scope or audience caveat tokens"]
    }
  ],
  "negativeEvidence": {
    "noPublicUsceLaneReason": "string — required when finalClassification = NO_PUBLIC_USCE_LANE_FOUND",
    "searchedTermsCount": 0,
    "openedPagesCount": 0,
    "strongNegativeEvidence": "string — explicit exclusion language found",
    "weakNegativeEvidence": "string — absence of relevant page after documented search"
  },
  "finalClassification": "one of the classification enum",
  "finalTier": "one of the confidence-tier enum",
  "nextAction": "string — what should happen next for this institution",
  "plainEnglishSummary": "1-3 sentences a non-expert can read",
  "driftCheck": "one sentence: this advanced national USCE discovery because [reason]"
}
```

## Core quality law

**VERBATIM QUOTE OR NO CLAIM.**

If a `candidateFindings` entry asserts an `audienceDecision` other than `NOT_STATED_ON_SOURCE`, `quoteSupports` must include `"audience"` AND `shortQuote` must contain the supporting language. Same for cost, visa, application, duration, specialty.

If the source does not state it, write `NOT_STATED_ON_SOURCE`. **Do not infer. Do not "probably". Do not broaden audience. Do not label IMG/international/Caribbean/graduate eligible unless the source explicitly says so.**

## No packet = no claim. No quote = no claim.

A packet must exist on disk before institution N+1's Mode-2 search begins.

## Enums

### `finalClassification` (13 values)

| Value | Meaning |
|---|---|
| `CURRENT_USCE_CONFIRMED` | Official source clearly supports current USCE / visiting medical student elective / observership / sub-I / clinical elective / away rotation. |
| `POSSIBLE_USCE_NEEDS_REVIEW` | Official source suggests USCE but audience, scope, or application is unclear. |
| `VSLO_US_MD_DO_ONLY` | Source supports VSLO visiting students appearing limited to US LCME/AOA/COCA students. |
| `INTERNATIONAL_STUDENT_CONFIRMED` | Source explicitly supports international visiting medical students. |
| `IMG_GRAD_OBSERVERSHIP_CONFIRMED` | Source explicitly supports IMG graduate observership / externship / clinical experience. |
| `RESEARCH_ONLY` | Source supports research but not clinical USCE. |
| `FUTURE_LANE_ONLY` | Useful for residency/fellowship/career platform; not current USCE. |
| `AFFILIATED_ONLY` | Only for affiliated/home-school students; no public visiting pathway. |
| `RESIDENCY_ONLY` | GME/residency/fellowship page only. |
| `NO_PUBLIC_USCE_LANE_FOUND` | Reasonable official-source search found no public USCE pathway. Must document search terms + pages opened. |
| `BOT_BLOCKED_MANUAL_RETRY` | Likely-relevant source blocked automation; no bypass attempted. |
| `SOURCE_DEAD` | Official source unreachable. |
| `UNKNOWN_NEEDS_RETRY` | Could not complete search enough to classify. |

Do NOT classify as `CURRENT_USCE_CONFIRMED` without `sourceUrl` + `shortQuote`.

### `confidenceTier` (5 values)

| Value | Meaning |
|---|---|
| `TIER_A_PUBLIC_SAFE` | Official source URL + quote + audience clear + application method clear + source scope clear + caveats clear. |
| `TIER_B_CAUTION_SAFE` | Official source + ≥1 caveat (school-level source, system-level source, cost missing, visa not mentioned). |
| `TIER_C_NEEDS_REVIEW` | Possible USCE but too unclear for public card. |
| `TIER_D_REJECT_OR_HIDE` | Not USCE / wrong page / affiliated-only / residency-only / source dead. |
| `NO_TIER_NO_CANDIDATE` | No candidate source found. |

No tier-A row is promoted to public/staged/runtime in P101-0 or P101-1.

### `sourceScopeDecision` (8 values)

| Value | Meaning |
|---|---|
| `INSTITUTION_SPECIFIC` | Source names the institution directly. |
| `SCHOOL_LEVEL_SOURCE` | Source is the affiliated SOM, not the hospital. |
| `SYSTEM_LEVEL_SOURCE` | Source is the parent health system, hospital not separately enumerated. |
| `DEPARTMENT_LEVEL_SOURCE` | Source is a specific department's page within the institution. |
| `PDF_SOURCE` | Source is a PDF handbook / fee schedule. |
| `AGENCY_SOURCED_LEAD_ONLY` | Third-party agency (AMO, FMG Portal, MedClerkships, USCEHQ); not official evidence. |
| `UNKNOWN_SOURCE_SCOPE` | Cannot determine scope. |
| `NO_SOURCE_FOUND` | No source identified. |

SCHOOL_LEVEL_SOURCE and SYSTEM_LEVEL_SOURCE require an explicit caveat in `caveats[]`.
Agency sources are leads only and are never `INSTITUTION_SPECIFIC`.

### `stopCondition` (6 values)

| Value | Meaning |
|---|---|
| `SOURCE_FOUND_AND_CLASSIFIED` | Candidate page found, classified, packet complete. |
| `NO_SIGNAL_AFTER_DOCUMENTED_SEARCH` | Multiple search terms tried, pages opened, no USCE signal. |
| `BOT_BLOCKED_RETRY_MANUAL` | Page known/likely relevant but blocked. |
| `SOURCE_DEAD_OR_UNREACHABLE` | Domain or page unreachable. |
| `UNCLEAR_NEEDS_RETRY` | Search incomplete; queue for re-attempt. |
| `NON_TARGET_CONFIRMED` | Institution confirmed not in USCE-pathway scope (e.g., residency-only, affiliated-only). |

### `rejectedPageReason` (13 values)

`RESIDENCY_ONLY`, `FELLOWSHIP_ONLY`, `EMPLOYMENT_PAGE`, `PATIENT_SERVICE_PAGE`, `GENERIC_EDUCATION_PAGE`, `AFFILIATED_ONLY`, `DEAD_LINK`, `BOT_BLOCKED`, `THIRD_PARTY_LEAD_ONLY`, `NOT_USCE`, `DUPLICATE`, `WRONG_CAMPUS`, `FUTURE_LANE_ONLY`.

### `audienceDecision` enum

`US_MD_ELIGIBLE_EXPLICIT`, `US_DO_ELIGIBLE_EXPLICIT`, `INTERNATIONAL_STUDENT_ELIGIBLE_EXPLICIT`, `IMG_GRADUATE_ELIGIBLE_EXPLICIT`, `CARIBBEAN_STUDENT_ELIGIBLE_EXPLICIT`, `US_LCME_AOA_ONLY_EXPLICIT`, `NOT_STATED_ON_SOURCE`, `EXCLUDED_EXPLICIT_FOR_AUDIENCE_X`.

### `applicationDecision` enum

`VSLO_REQUIRED_EXPLICIT`, `INSTITUTIONAL_FORM`, `COORDINATOR_EMAIL_ONLY`, `AGENCY_GATED`, `AFFILIATION_AGREEMENT_REQUIRED`, `NOT_STATED_ON_SOURCE`, `BY_DEPARTMENT_VARIES`.

### `costDecision` enum

`STATED_VERBATIM_NUMBER`, `RANGE_STATED`, `NOT_STATED_ON_SOURCE`, `BY_COORDINATOR_ONLY`, `NO_FEE_STATED_EXPLICIT`.

If `STATED_VERBATIM_NUMBER` or `RANGE_STATED`, `shortQuote` must include the cost figure.

### `visaDecision` enum

`MENTIONED_AS_REQUIRED`, `MENTIONED_AS_ACCEPTED`, `NOT_MENTIONED_US_ONLY_AUDIENCE`, `NOT_MENTIONED_AMBIGUOUS`, `B1_B2_LANGUAGE_PRESENT`, `J1_LANGUAGE_PRESENT`, `H1B_LANGUAGE_PRESENT`, `F1_OPT_LANGUAGE_PRESENT`.

## Official-source rule

Official / public sources count:
- Hospital website (the institution's own canonical domain)
- Medical school website
- Health system website (with `SYSTEM_LEVEL_SOURCE` caveat)
- Department page within the official domain
- Official PDF / handbook hosted on the official domain
- Official registrar / UME / Medical Education / Visiting Student page
- Official public VSLO host page

Third-party sources may only be **leads**, never evidence:
- AMOpportunities, FMG Portal, MedClerkships, USCEHQ, ObservershipsUSA
- Reddit, Twitter/X, forums, blogs
- Random third-party PDFs
- Scraped directories

Third-party leads tagged `AGENCY_SOURCED_LEAD_ONLY` or `THIRD_PARTY_LEAD_NOT_EVIDENCE`. Never treated as official.

## Forbidden behaviors

- Faking pages opened.
- Faking search terms tried.
- Faking quotes (paraphrasing as "quote").
- Faking screenshots.
- Bypassing CAPTCHA / login / paywall.
- Submitting institutional forms.
- Sending real emails to coordinators in this sprint.
- Scraping AAMC / ACGME / FREIDA / NRMP.
- Treating agency leads as official.
- Inferring audience from "we welcome international physicians" boilerplate without explicit USCE eligibility language.
- Claiming `CURRENT_USCE_CONFIRMED` without source URL + verbatim quote.
