# P102 — Data Contracts

schemaVersion: p102-0r-1
status: P102-0R initial contracts (will iterate)

All P102 JSON files include a top-level `schemaVersion: "p102-0r-1"`. All P102 CSV files include a `schema_version` column with value `p102-0r-1`.

## 1. institution_identity.schema

JSON. One per institution.

```json
{
  "schemaVersion": "p102-0r-1",
  "institutionId": "string (stable canonical id, e.g. inst_central_maine_medical_center)",
  "canonicalName": "string",
  "aliases": ["string"],
  "state": "string (2-letter)",
  "county": "string | null",
  "city": "string",
  "zip": "string | null",
  "address": "string | null",
  "parentSystem": "string | null",
  "officialDomains": ["string"],
  "medicalSchoolAffiliations": ["string"],
  "campusType": "STANDALONE | HEALTH_SYSTEM_FLAGSHIP | HEALTH_SYSTEM_CAMPUS | ACADEMIC_MEDICAL_CENTER | TEACHING_HOSPITAL | OTHER",
  "sourceOfIdentity": "string (where this identity was bootstrapped from)",
  "duplicateOf": "string | null",
  "doNotMergeReason": "string | null",
  "existingP97Packet": "string | null",
  "existingP101Packet": "string | null",
  "existingLiveListing": "string | null",
  "status": "ACTIVE | DEPRECATED | DO_NOT_USE"
}
```

## 2. queue.schema.csv

CSV. Queue rows pointing to institutions.

Columns:
- `schema_version` — always `p102-0r-1`
- `queue_id` — queue identifier (e.g. `p102_dry_run_1`)
- `scope_type` — `NATIONAL | STATE | COUNTY | CITY | METRO | INSTITUTION`
- `scope_value` — value matching scope_type
- `rank` — integer order within queue
- `institution_id`
- `canonical_name`
- `state`
- `county`
- `city`
- `official_domain` — primary domain for fetching
- `target_lanes` — pipe-separated list (e.g. `IMG_OBSERVERSHIP|VISITING_MEDICAL_STUDENT`)
- `priority` — `HIGH | MEDIUM | LOW`
- `why_included` — short rationale
- `status` — `NOT_STARTED | IN_PROGRESS | COMPLETED | FAILED | BOT_BLOCKED | NEEDS_REVIEW`
- `assigned_run_id`
- `locked_at` — ISO timestamp or empty
- `completed_at` — ISO timestamp or empty
- `next_action`
- `notes`

## 3. run_manifest.schema

JSON. One per run.

```json
{
  "schemaVersion": "p102-0r-1",
  "runId": "string (e.g. p102-0r-dry-run-1)",
  "institutionId": "string",
  "canonicalName": "string",
  "startedAt": "ISO-8601",
  "completedAt": "ISO-8601 | null",
  "status": "INITIALIZED | A0_RUNNING | A0_COMPLETE | A1_RUNNING | A1_COMPLETE | A1_5_RUNNING | A1_5_COMPLETE | A2_RUNNING | A2_COMPLETE | A2_5_RUNNING | A2_5_COMPLETE | A3_RUNNING | A3_COMPLETE | A4_RUNNING | A4_COMPLETE | COMPLETE | FAILED",
  "queueId": "string",
  "currentStage": "A0 | A1 | A1.5 | A2 | A2.5 | A3 | A4 | A5 | DONE",
  "artifactRoot": "string (T7 path)",
  "repoRunFolder": "string (repo path)",
  "sourceFamilies": ["string"],
  "scores": {
    "searchCompletenessScore": "number 0-100 | null",
    "sourceConfidenceScore": "number 0-100 | null",
    "artifactCompletenessScore": "number 0-100 | null",
    "publicReadinessScore": "number 0-100 | null",
    "futureLaneValueScore": "number 0-100 | null",
    "hallucinationRiskScore": "number 0-100 | null"
  },
  "validators": {
    "validateP102": "PASS | FAIL | NOT_RUN",
    "validateNoSecrets": "PASS | FAIL | NOT_RUN",
    "tsc": "PASS | FAIL | NOT_RUN"
  },
  "nextAction": "string"
}
```

## 4. source_map.schema

JSON. Lives in `01_source_map.md` companion JSON (`01_source_map.json`) or inline within run files.

```json
{
  "schemaVersion": "p102-0r-1",
  "sourceId": "string",
  "sourceUrl": "string",
  "sourceDomain": "string",
  "sourceTitle": "string | null",
  "sourceFamily": "VISITING_STUDENT_PAGE | OBSERVERSHIP_PAGE | GME_PAGE | RESIDENCY_PAGE | FELLOWSHIP_PAGE | CAREERS_PAGE | VOLUNTEER_PAGE | RESEARCH_PAGE | PDF_HANDBOOK | JSON_LD | SITEMAP | ROBOTS | HOMEPAGE | OTHER",
  "sourceScope": "INSTITUTION_SPECIFIC | CAMPUS_SPECIFIC | HEALTH_SYSTEM_LEVEL | MEDICAL_SCHOOL_LEVEL | DEPARTMENT_LEVEL | PDF_SOURCE | CAREERS_PORTAL | THIRD_PARTY_LEAD_ONLY | UNKNOWN_SCOPE",
  "deterministicProbeType": "ROBOTS | SITEMAP | FIXED_PATH | JSONLD | LINKED_FROM_PRIOR_FETCH | MANUAL",
  "acceptedForExtraction": "boolean",
  "rejectedReason": "string | null",
  "sourceStatus": "FETCHED_OK | FETCH_404 | FETCH_403 | FETCH_TIMEOUT | FETCH_REDIRECT_LIMIT | FETCH_OTHER_ERROR | NOT_FETCHED",
  "cleanedTextPath": "string (T7 absolute path) | null",
  "rawHtmlPath": "string (T7 absolute path) | null",
  "sourceHash": "string (sha256) | null",
  "screenshotStatus": "CAPTURED | PENDING | NOT_APPLICABLE | UNAVAILABLE",
  "pdfStatus": "NOT_PDF | PDF_TEXT_EXTRACTED | PDF_TEXT_EMPTY_RENDER_PENDING | PDF_OCR_UNAVAILABLE | PDF_FAILED",
  "jsonLdExtracted": "boolean",
  "robotsSitemapContext": "string | null",
  "capturedAt": "ISO-8601 | null"
}
```

## 5. source_claim.schema

JSON. One per positive claim.

```json
{
  "schemaVersion": "p102-0r-1",
  "claimId": "string",
  "institutionId": "string",
  "runId": "string",
  "claimType": "string (e.g. OFFERS_OBSERVERSHIP, OFFERS_VSLO, ELIGIBILITY_REQUIREMENT, APPLICATION_FEE, DURATION, CONTACT_EMAIL)",
  "claimText": "string (normalized claim statement)",
  "normalizedField": "string | null (canonical field name)",
  "quote": "string (exact text from source)",
  "sourceUrl": "string",
  "sourceHash": "string (sha256 of cleaned text)",
  "cleanedTextPath": "string (T7 path)",
  "quoteVerified": "boolean (quote findable in cleaned text)",
  "sourceScope": "string (matches source_map.sourceScope)",
  "confidence": "HIGH | MEDIUM | LOW",
  "visibility": "PUBLIC_SAFE_USCE | CAUTION_SAFE_INTERNAL_REVIEW | FUTURE_LANE_ONLY | HIDDEN_REJECTED | HUMAN_REVIEW_REQUIRED",
  "usedInPublicCopy": "boolean",
  "notPublicReason": "string | null"
}
```

## 6. negative_evidence_claim.schema

JSON. One per negative claim. **Held to the same source/hash/quote-verified standard as positive claims.**

```json
{
  "schemaVersion": "p102-0r-1",
  "claimId": "string",
  "institutionId": "string",
  "runId": "string",
  "negativeEvidenceType": "EXPLICIT_NEGATIVE_QUOTE | ABSENCE_AFTER_BROAD_SEARCH | POLICY_PAGE_RESTRICTS | THIRD_PARTY_RESTRICTION",
  "quote": "string | null (required if EXPLICIT_NEGATIVE_QUOTE)",
  "sourceUrl": "string | null",
  "sourceHash": "string | null",
  "quoteVerified": "boolean",
  "exactStatement": "string (what is being denied — e.g. 'observership for IMGs')",
  "negativeEvidenceStrength": "STRONG | MEDIUM | WEAK",
  "publicSafeNegativeClaim": "boolean (true only if EXPLICIT_NEGATIVE_QUOTE + quoteVerified + STRONG)",
  "sourceScope": "string",
  "limitations": "string (what the negative evidence does NOT cover)",
  "nextAction": "string"
}
```

**Rules:**
- `publicSafeNegativeClaim = true` requires: `negativeEvidenceType = EXPLICIT_NEGATIVE_QUOTE` AND `quoteVerified = true` AND `negativeEvidenceStrength = STRONG`.
- Absence after broad search → `publicSafeNegativeClaim = false`, even if `negativeEvidenceStrength = MEDIUM`.

## 7. opportunity_object.schema

JSON. One per opportunity.

```json
{
  "schemaVersion": "p102-0r-1",
  "opportunityId": "string",
  "institutionId": "string",
  "runId": "string",
  "opportunityLane": "string (one of product lanes)",
  "audience": "PRE_MEDICAL | MS1_MS2 | MS3_MS4 | IMG_PRE_MATCH | IMG_POST_MATCH | RESIDENT | FELLOW | ATTENDING | FACULTY | OTHER",
  "applicantStage": "string",
  "handsOnStatus": "HANDS_ON | OBSERVATIONAL_ONLY | RESEARCH_ONLY | UNCLEAR",
  "applicationPathway": "VSLO | INSTITUTION_DIRECT | THIRD_PARTY | EMAIL | UNCLEAR | NOT_APPLICABLE",
  "applicationUrl": "string | null",
  "cost": {
    "amount": "number | null",
    "currency": "string | null",
    "details": "string | null"
  },
  "duration": "string | null",
  "specialties": ["string"],
  "visa": "REQUIRES_VISA | NO_VISA_REQUIRED | UNCLEAR | NOT_APPLICABLE",
  "requirements": ["string"],
  "contact": {
    "email": "string | null",
    "phone": "string | null",
    "name": "string | null"
  },
  "sourceClaimIds": ["string"],
  "visibilityLane": "PUBLIC_SAFE_USCE | PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY | CAUTION_SAFE_INTERNAL_REVIEW | FUTURE_LANE_ONLY | HIDDEN_REJECTED | NO_PUBLIC_OPPORTUNITY_FOUND | BOT_BLOCKED_MANUAL_RETRY | NEEDS_A4_RECOVERY | HUMAN_REVIEW_REQUIRED",
  "classification": "string (lane-specific classification, e.g. INTERNATIONAL_STUDENT_CONFIRMED, VSLO_US_MD_DO_ONLY, IMG_OBSERVERSHIP_CONFIRMED)",
  "confidence": "HIGH | MEDIUM | LOW",
  "notPublicReason": "string | null"
}
```

## 8. artifact_index.schema.csv

CSV. Append-only.

Columns:
- `schema_version`
- `artifact_id`
- `run_id`
- `institution_id`
- `source_url`
- `artifact_type` — `CLEANED_TEXT | RAW_HTML | PDF | SCREENSHOT | JSONLD | OTHER`
- `path` — T7 absolute path
- `sha256`
- `captured_at` — ISO-8601
- `status` — `OK | PENDING | FAILED | NOT_APPLICABLE`
- `failure_reason`

## 9. dedupe_index.schema.csv

CSV. Append-only.

Columns:
- `schema_version`
- `primary_institution_id`
- `duplicate_institution_id`
- `duplicate_type` — `SAME_INSTITUTION | DISTINCT_CAMPUS_SAME_SYSTEM | RENAMED | DBA_VARIANT | DO_NOT_MERGE`
- `confidence` — `HIGH | MEDIUM | LOW`
- `evidence` — short rationale
- `decision` — `MERGED | KEPT_DISTINCT | DEFERRED`
- `reviewer` — `automated | human`
- `notes`

## 10. A2_depth_output.schema

JSON. One per depth-engine pass.

```json
{
  "schemaVersion": "p102-0r-1",
  "depthPass": "USCE | GME_RESIDENCY_FELLOWSHIP | JOBS_VISA | PHYSICIAN_SERVICES | NEGATIVE_EVIDENCE | SOURCE_SCOPE_CONFLICTS",
  "sourceFamiliesReviewed": ["string"],
  "objectsCreated": "number",
  "claimsPromoted": "number",
  "conflictsFound": ["string"],
  "unresolveds": ["string"],
  "recoveryTasks": ["string"],
  "scoreDeltas": {
    "publicReadinessScore": "number",
    "futureLaneValueScore": "number"
  }
}
```

## 11. A3_gate.schema

JSON. Hostile gate output.

```json
{
  "schemaVersion": "p102-0r-1",
  "verdict": "PASS | PASS_WITH_CAVEATS | FAIL_NEEDS_A4 | FAIL_FATAL",
  "networkUsed": "boolean (must be false; validator checks)",
  "agentUsed": "boolean (must be false; validator checks)",
  "publicSafe": "boolean",
  "futureLaneValue": "NONE | LOW | MEDIUM | HIGH",
  "hallucinationRisks": ["string"],
  "unsupportedClaims": ["string (claim ids)"],
  "quoteVerificationFailures": ["string (claim ids)"],
  "sourceScopeConflicts": ["string"],
  "missingCriticalFields": ["string"],
  "negativeEvidenceFindings": ["string (negative claim ids)"],
  "requiredA4Tasks": ["string"],
  "finalRecommendation": "string"
}
```

## Versioning

Schema breakage is forbidden inside a sprint. Schema evolution proceeds by bumping `p102-0r-1` → `p102-0r-2` (compatible) or `p102-0r-2` → `p102-1-1` (new sprint). Past run files keep their original schemaVersion; new runs use the current version. Validators must check `schemaVersion` and emit a clear error on mismatch.
