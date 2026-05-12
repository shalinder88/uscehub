# P102 A1/A2 Reader Prompt (for future model-driven extraction)

schemaVersion: p102-0r-1
status: captured for future use; P102-0C uses deterministic pattern matching, not this prompt

## Purpose

When a real model A1/A2 reader is later wired into the runner (post-P102-0C), it should be invoked with the prompt below. The prompt assumes the model receives one cleaned text file per invocation and emits a strict JSON array of claim candidates. The runner then writes those claims to `13_source_claims.json` after structural validation + quote verification.

## Invariants the model must obey

1. **Read only the provided cleaned text.** No web access. No memory of other sources.
2. **No invented facts.** Every claim must be backed by an exact quote that the model can copy verbatim from the cleaned text.
3. **NOT_STATED_ON_SOURCE is the correct answer when the field is absent.** Do not infer eligibility, fees, or dates that aren't stated.
4. **Conservative classification.** When uncertain, emit `CAUTION_SAFE_INTERNAL_REVIEW` rather than `PUBLIC_SAFE_USCE`.
5. **Future-lane separation.** Residency / fellowship / careers / visa / services content is `FUTURE_LANE_ONLY`, never `PUBLIC_SAFE_USCE`.
6. **Negative evidence is first-class.** An explicit "we do not offer X" sentence becomes an `EXPLICIT_NEGATIVE_QUOTE` claim. Absence after reading the page is NOT a negative claim; just emit no positive claim.

## Input contract

The model is given:
- `sourceUrl` (string)
- `sourceFamily` (one of: OBSERVERSHIP_PAGE, VISITING_STUDENT_PAGE, GME_PAGE, RESIDENCY_PAGE, FELLOWSHIP_PAGE, CAREERS_PAGE, VOLUNTEER_PAGE, RESEARCH_PAGE, PDF_HANDBOOK, JSON_LD, SITEMAP, ROBOTS, HOMEPAGE, OTHER)
- `sourceScope` (one of: INSTITUTION_SPECIFIC, CAMPUS_SPECIFIC, HEALTH_SYSTEM_LEVEL, MEDICAL_SCHOOL_LEVEL, DEPARTMENT_LEVEL, PDF_SOURCE, CAREERS_PORTAL, THIRD_PARTY_LEAD_ONLY, UNKNOWN_SCOPE)
- `cleanedText` (string, the page text)
- `institutionContext`: `{ institutionId, canonicalName, officialDomain, parentSystem? }`

## Output contract

Return a JSON array of claim candidates. Each:

```json
{
  "claimType": "OFFERS_OBSERVERSHIP" | "OFFERS_VSLO" | "ELIGIBILITY_REQUIREMENT" | "APPLICATION_FEE" | "DURATION" | "CONTACT_EMAIL" | "NEGATIVE_NO_OBSERVERSHIP" | "NEGATIVE_AFFILIATED_ONLY" | "FUTURE_LANE_RESIDENCY" | "FUTURE_LANE_FELLOWSHIP" | "FUTURE_LANE_GME_GENERAL" | "FUTURE_LANE_JOB" | "FUTURE_LANE_VISA" | "SCOPE_CONFLICT" | "MISSING_FIELD",
  "lane": "IMG_OBSERVERSHIP" | "VISITING_MEDICAL_STUDENT" | "CLINICAL_ELECTIVE" | "RESEARCH_OPPORTUNITY" | "RESIDENCY_PROGRAM_INFO" | "FELLOWSHIP_PROGRAM_INFO" | "CAREERS_PAGE" | "PHYSICIAN_SERVICES" | "NO_PUBLIC_OPPORTUNITY_FOUND",
  "quote": "exact substring of cleanedText, ≤ 500 chars",
  "fieldName": "lane.OBSERVERSHIP.handsOnStatus" | "...",
  "visibility": "PUBLIC_SAFE_USCE" | "CAUTION_SAFE_INTERNAL_REVIEW" | "FUTURE_LANE_ONLY" | "HIDDEN_REJECTED" | "PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY" | "NO_PUBLIC_OPPORTUNITY_FOUND" | "HUMAN_REVIEW_REQUIRED",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "notPublicReason": "string | null"
}
```

If no claims exist, return `[]`.

## Rules for assigning visibility

- `PUBLIC_SAFE_USCE`: only if (a) source family is OBSERVERSHIP_PAGE / VISITING_STUDENT_PAGE / RESEARCH_PAGE, (b) source scope is INSTITUTION_SPECIFIC or CAMPUS_SPECIFIC, (c) the quote literally states a definite offer or eligibility statement, (d) you have HIGH confidence.
- `CAUTION_SAFE_INTERNAL_REVIEW`: a candidate that needs human review (e.g., quote is ambiguous about IMG eligibility).
- `FUTURE_LANE_ONLY`: residency / fellowship / GME / careers / visa / services content.
- `PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY`: only if the quote is an explicit negative statement AND scope matches the institution.
- `NO_PUBLIC_OPPORTUNITY_FOUND`: don't emit this from the model; the runner emits it when the model returns an empty array on a USCE-relevant source.

## Examples (for the model's reference)

### Example 1 — high-yield observership page
Input: cleanedText excerpt from `/observership`:
> "Houston Methodist offers a clinical observership program for international medical graduates. Applicants must hold a medical degree and provide a letter of recommendation."

Output:
```json
[
  {
    "claimType": "OFFERS_OBSERVERSHIP",
    "lane": "IMG_OBSERVERSHIP",
    "quote": "Houston Methodist offers a clinical observership program for international medical graduates.",
    "fieldName": "lane.OBSERVERSHIP.offered",
    "visibility": "PUBLIC_SAFE_USCE",
    "confidence": "HIGH",
    "notPublicReason": null
  },
  {
    "claimType": "ELIGIBILITY_REQUIREMENT",
    "lane": "IMG_OBSERVERSHIP",
    "quote": "Applicants must hold a medical degree and provide a letter of recommendation.",
    "fieldName": "lane.OBSERVERSHIP.eligibility",
    "visibility": "CAUTION_SAFE_INTERNAL_REVIEW",
    "confidence": "MEDIUM",
    "notPublicReason": "eligibility quoted but does not state IMG-specific requirements"
  }
]
```

### Example 2 — explicit negative
Input: cleanedText excerpt:
> "We do not accept observers at this time. Applicants should pursue programs at affiliated institutions."

Output:
```json
[
  {
    "claimType": "NEGATIVE_NO_OBSERVERSHIP",
    "lane": "NO_PUBLIC_OPPORTUNITY_FOUND",
    "quote": "We do not accept observers at this time.",
    "fieldName": "lane.OBSERVERSHIP.offered",
    "visibility": "PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY",
    "confidence": "HIGH",
    "notPublicReason": null
  }
]
```

### Example 3 — GME page (future-lane)
Input: cleanedText excerpt from `/gme`:
> "The Graduate Medical Education office oversees 12 ACGME-accredited residency programs."

Output:
```json
[
  {
    "claimType": "FUTURE_LANE_GME_GENERAL",
    "lane": "RESIDENCY_PROGRAM_INFO",
    "quote": "The Graduate Medical Education office oversees 12 ACGME-accredited residency programs.",
    "fieldName": "lane.RESIDENCY.programCount",
    "visibility": "FUTURE_LANE_ONLY",
    "confidence": "HIGH",
    "notPublicReason": "GME page; future-lane only, not public USCE"
  }
]
```

### Example 4 — system-level page → scope conflict
Input: cleanedText from `adventhealth.com/observership` (system domain), institutionContext is "AdventHealth Orlando":

If observership content exists:
```json
[
  {
    "claimType": "SCOPE_CONFLICT",
    "lane": "IMG_OBSERVERSHIP",
    "quote": "AdventHealth offers a clinical observership program across our hospital network.",
    "fieldName": "lane.OBSERVERSHIP.scope",
    "visibility": "HUMAN_REVIEW_REQUIRED",
    "confidence": "HIGH",
    "notPublicReason": "system-level page cannot prove AdventHealth Orlando-specific availability; needs campus-specific source"
  }
]
```

## Why P102-0C does NOT use this prompt

P102-0C uses deterministic pattern matching as a first pass. Deterministic detectors are auditable, cheap, and produce no hallucination — at the cost of recall. They find the obvious cases (a page titled "Observership" containing the word "observership" is correctly classified) and miss the subtle ones (a page that talks about visiting students without using the words "visiting student").

The actual model A1/A2 pass — using the prompt above — is queued for a later sprint (P102-0D or P102-1-deeper) once the deterministic baseline has produced its first claims and validators confirm the discipline holds.
