# P101 — Enhanced Packet Schema v2 (schemaVersion: "p101-1")

Adopted: 2026-05-11. Forward-only — existing 40 `p101-0` packets remain valid; all P101-3 and later packets MUST use `p101-1`.

The v1 (p101-0) schema captured: institution identity, search process, candidate findings (with one shortQuote per finding), negative evidence, classification, tier, drift check. It proved discipline. It did not capture enough field-level evidence to power filterable user-facing listing pages, change detection, or rich comparisons.

The v2 (p101-1) schema adds: field-level quote map, normalized opportunity tags, artifact manifest references, user-facing summary draft, change-detection metadata. It does not change the classification enum or the verbatim-quote-or-no-claim discipline.

## Required JSON shape (p101-1)

```json
{
  "schemaVersion": "p101-1",

  "institutionIdentity": {
    "canonicalInstitutionName": "string",
    "aliases": ["string"],
    "hospitalName": "string",
    "medicalSchoolName": "string",
    "healthSystemName": "string",
    "city": "string",
    "state": "2-letter abbr",
    "officialDomains": ["string"],
    "campusOrSiteNames": ["string"],
    "institutionType": "academic_medical_center | community_teaching_hospital | community_hospital | childrens_hospital | va_affiliate | public_hospital | medical_school | health_system | clinic | other",
    "sourceOfIdentity": "what document/queue/source named this institution"
  },

  "sourceEvidence": [
    {
      "sourceUrl": "absolute URL",
      "finalUrl": "URL after redirects (if different)",
      "pageTitle": "page <title> or H1",
      "sourcePageType": "INSTITUTION_HUB | DEPARTMENT_PAGE | FEE_SCHEDULE | HANDBOOK_PDF | FAQ | APPLICATION_FORM | OTHER",
      "sourceScope": "INSTITUTION_SPECIFIC | SCHOOL_LEVEL_SOURCE | SYSTEM_LEVEL_SOURCE | DEPARTMENT_LEVEL_SOURCE | PDF_SOURCE | AGENCY_SOURCED_LEAD_ONLY | UNKNOWN_SOURCE_SCOPE | NO_SOURCE_FOUND",
      "accessedAt": "ISO 8601 timestamp",
      "httpStatus": 200,
      "robotsOrAccessNotes": "bot blocks, CAPTCHA, rate-limit, JS-only render, paywall, redirects",
      "sourceLastUpdatedIfShown": "footer date if the page exposes one, else empty",
      "cleanedTextHash": "SHA-256 of stripped/normalized page text (lowercase hex)",
      "rawHtmlSaved": false,
      "cleanedTextPath": "relative path under T7 or docs/artifact-manifests, or empty",
      "screenshotPath": "relative path under T7 or empty",
      "screenshotStatus": "CAPTURED | PENDING | NOT_APPLICABLE | FAILED",
      "pdfPath": "relative path or empty",
      "pdfExtractionStatus": "EXTRACTED | NOT_APPLICABLE | FAILED_MANUAL_RETRY | DEFERRED",
      "artifactManifestPath": "docs/platform-v2/local/usce-discovery-command-center/p101_artifact_manifest.csv (row reference)",
      "notes": "free text"
    }
  ],

  "fieldQuoteMap": [
    {
      "fieldName": "audience_us_md",
      "value": "ELIGIBLE_EXPLICIT | EXCLUDED_EXPLICIT | NOT_STATED_ON_SOURCE | CONDITIONAL | UNKNOWN",
      "quote": "verbatim ≤ 240 chars from the source page",
      "quoteUrl": "the sourceUrl backing this claim",
      "quoteSourcePageTitle": "page title for citation",
      "confidence": "HIGH | MEDIUM | LOW",
      "caveat": "any narrowing condition",
      "notStatedOnSource": false
    }
  ],

  "opportunityTags": {
    "audience": ["US_MD", "US_DO", "INTERNATIONAL_MS", "..."],
    "application": ["VSLO", "DIRECT_APPLICATION", "..."],
    "experienceType": ["CLINICAL_ELECTIVE", "OBSERVERSHIP", "..."],
    "cost": ["FREE", "COST_STATED", "..."],
    "visa": ["B1_B2_MENTIONED", "J1_MENTIONED", "..."],
    "source": ["INSTITUTION_SPECIFIC", "SCREENSHOT_CAPTURED", "..."]
  },

  "userFacingSummaryDraft": {
    "oneSentenceSummary": "≤ 180 chars; safe-for-display draft only — not auto-published",
    "whoThisIsFor": "who the lane accepts based on verbatim source",
    "whoThisIsNotFor": "who is explicitly excluded per source",
    "howToApply": "verbatim application pathway summary",
    "estimatedCostSummary": "verbatim cost summary or 'cost not stated by source'",
    "keyCaveats": ["caveat string"],
    "whyWeClassifiedItThisWay": "1-2 sentences pointing at the determining quotes",
    "sourceTransparencyNote": "explicit source URL + last verified date for user-facing 'how we know this' panel"
  },

  "negativeEvidence": {
    "noPublicLaneReason": "string — required when finalClassification = NO_PUBLIC_USCE_LANE_FOUND",
    "searchedTerms": ["term1", "term2"],
    "pagesOpened": ["url1", "url2"],
    "rejectedPages": [{"url": "string", "title": "string", "reason": "rejected-page-reason enum"}],
    "rejectedReasons": ["RESIDENCY_ONLY", "..."],
    "whetherNegativeEvidenceStrong": "STRONG | WEAK | NONE",
    "futureRetrySuggestion": "what to try next sprint"
  },

  "changeDetectionPrep": {
    "sourceHash": "SHA-256 of canonical source page (the primary source URL among sourceEvidence entries)",
    "cleanedTextPath": "relative path or empty",
    "screenshotPath": "relative path or empty",
    "firstCapturedAt": "ISO 8601 timestamp of first packet write",
    "nextRecheckDue": "ISO 8601 — usually firstCapturedAt + 90 days",
    "fieldsLikelyToChange": ["cost", "application_window", "deadlines"],
    "changeRisk": "LOW | MEDIUM | HIGH"
  },

  "finalClassification": "(unchanged from p101-0 enum)",
  "finalTier": "(unchanged from p101-0 enum)",
  "driftCheck": "one sentence: this advanced national USCE discovery because [reason]"
}
```

## Core quality law (unchanged)

**VERBATIM QUOTE OR NO CLAIM.**

Every `fieldQuoteMap` entry with `value` other than `NOT_STATED_ON_SOURCE` must have a non-empty `quote` ≤ 240 chars from the page named by `quoteUrl`. If the source does not state the field, set `value = "NOT_STATED_ON_SOURCE"`, `quote = ""`, `notStatedOnSource = true`. **Do not infer. Do not "probably". Do not broaden audience.**

## Required `fieldQuoteMap` field names

These field names are the canonical set the validator checks. Not every packet must populate every field — but every field listed below must appear in `fieldQuoteMap` with either a verbatim quote or `notStatedOnSource: true`.

| Group | Field name |
|---|---|
| audience | `audience_us_md`, `audience_us_do`, `audience_international_ms`, `audience_img_graduate`, `audience_caribbean`, `audience_pre_med`, `year_required`, `graduation_status` |
| eligibility | `usmle_or_comlex_required`, `english_or_toefl_required` |
| application | `application_pathway`, `application_url`, `application_window`, `deadline` |
| cost | `cost_application_fee`, `cost_tuition_or_program_fee`, `cost_malpractice`, `cost_housing`, `cost_other` |
| program | `duration`, `specialties_offered`, `hands_on_vs_observer`, `lor_or_certificate` |
| visa | `visa_b1_b2`, `visa_j1`, `visa_h1b`, `visa_not_mentioned` |
| requirements | `affiliation_agreement_required`, `immunization_required`, `background_check_required`, `malpractice_required` |
| logistics | `coordinator_contact`, `housing`, `cancellation_policy`, `required_documents` |

## Tag taxonomy

See `p101_tag_taxonomy.md` for full enum lists. The packet's `opportunityTags` block must reference only the canonical tag strings defined there.

## Artifact manifest

Every `sourceEvidence` entry that has an associated artifact (cleaned text, raw HTML, PDF, screenshot) must also have a row in `docs/platform-v2/local/usce-discovery-command-center/p101_artifact_manifest.csv`. See `p101_artifact_capture_policy.md` and `p101_t7_artifact_storage.md` for capture rules and storage paths.

## What this schema does NOT change

- Classification enum (13 values) — unchanged from p101-0.
- Tier enum (5 values) — unchanged.
- Source-scope enum — unchanged (now lives under `sourceEvidence[].sourceScope` AND `opportunityTags.source`).
- Stop-condition enum — unchanged.
- Rejected-page reason enum — unchanged.

## Forbidden behaviors (unchanged)

- Faking pages opened, search terms, quotes, screenshots, PDFs.
- Bypassing CAPTCHA / login / paywall.
- Submitting institutional forms.
- Sending real coordinator emails in a discovery sprint.
- Scraping AAMC / ACGME / FREIDA / NRMP.
- Treating agency leads as official.
- Inferring audience from non-USCE boilerplate.
- Claiming any `*_CONFIRMED` classification without `sourceUrl` + verbatim quote in `fieldQuoteMap`.

## Migration policy

- The existing 40 P101-0 packets are not retroactively rewritten in this sprint. They remain valid as historical evidence.
- Any P101-3 (or later) sprint MUST use `schemaVersion: "p101-1"` for every new packet.
- If a P101-0 packet needs an update (e.g., manual retry for Howard PDF, Michigan bot-block retry), the update SHOULD migrate the packet to `p101-1` — but the migration is itself a packet write, not bulk.
