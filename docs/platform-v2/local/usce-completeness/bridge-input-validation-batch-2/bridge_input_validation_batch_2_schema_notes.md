# Bridge Input Validation Batch 2 — Schema Notes

**Date:** 2026-05-09
**Sprint:** P99-P97-BRIDGE-INPUT-VALIDATION-BATCH-2
**Validator:** `scripts/validate-p99-p97-bridge-input.ts` (322 lines)

---

## 1. Provenance

The validator was **ported from T7 read-only** at:
`/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/08_ACTIVE_ON_SHIELD_LATER/uscehub-active-2026-05-02/scripts/validate-p99-p97-bridge-input.ts`

The port is **byte-identical** to the T7 source. No modifications were made to the validator logic or enum vocabulary. Reasoning:

1. The T7 validator already encodes the canonical bridge schema for this exact pipeline (the same schema used to validate the existing approved bridge rows for Morristown, Overlook, CCF Mercy, CC Hillcrest, Highland on the T7 lane).
2. Authoring a divergent validator on Mac-local would create a schema fork — the same DRAFT row could pass on one lane and fail on another, defeating the cross-lane joinability that motivated the queue reconciliation in the prior sprint.
3. The DRAFT instead was rewritten to align with the canonical T7 enum vocabulary (Phase F below). All caveats preserved; only field-format vocabulary changed.

## 2. Required columns (54)

`bridge_row_id, candidate_rank, institution_name, campus_name, city, state, country, source_system, source_queue, opportunity_title, opportunity_type, specialty, clinical_exposure_level, current_wedge_fit, future_lane_fit, public_pilot_category, audience_detail, audience_restriction_summary, accepts_us_md, accepts_us_do, accepts_img, accepts_international_students, accepts_caribbean, audience_confidence, audience_public_caveat, visa_policy, visa_tags, visa_public_caveat, h1b_supported, j1_supported, b1_b2_supported, visa_confidence, official_source_url, application_url, archive_url, screenshot_path, source_quote_under_280, source_status, last_reviewed, evidence_status, evidence_triple_complete, public_summary_draft, public_limitations, must_not_claim, correction_contact_visible, report_issue_enabled, hospital_safe_wording_reviewed, p97_readiness_status, bridge_review_status, allowed_next_workflow, not_allowed_actions, human_reviewer_required, reviewer_notes, created_at, updated_at`

## 3. Hard-fail rules (validator triggers)

| Rule | Description |
|------|-------------|
| MISSING_COLUMN | A required column is absent from the CSV header |
| INVALID_ENUM | Field value not in declared enum set |
| EMPTY_REQUIRED_FIELD | Required field is blank (allowed-empty: campus_name, city, application_url, future_lane_fit, reviewer_notes) |
| BAD_CANDIDATE_RANK | Not a positive integer |
| BAD_STATE | Not a US two-letter code |
| AUDIENCE_DETAIL_MISSING_KEYS | audience_detail must contain `us_md_do, international_student, img_graduate, caribbean_student` |
| AUDIENCE_DETAIL_VALUES_INSUFFICIENT | audience_detail must contain ≥4 status tokens from `[ELIGIBLE_EXPLICIT, EXCLUDED_EXPLICIT, UNKNOWN_NOT_STATED, ONLY_IF_AFFILIATED, ONLY_IF_LCME_COCA]` |
| BAD_OFFICIAL_SOURCE_URL | Not http(s):// shaped |
| BAD_APPLICATION_URL | Not http(s):// shaped (and not empty) |
| BAD_ARCHIVE_URL | Does not start with `https://web.archive.org/` |
| SCREENSHOT_NOT_FOUND_ON_DISK | `screenshot_path` does not resolve to an existing file |
| EMPTY_SOURCE_QUOTE | source_quote_under_280 is empty |
| SOURCE_QUOTE_TOO_LONG | >280 chars |
| INVALID_P97_READINESS_STATUS | Not exactly `HUMAN_REVIEW_READY` |
| FORBIDDEN_STATUS_TOKEN | `IMPORT_READY`, `PUBLIC_NOW`, `BRIDGE_READY_TO_RUNTIME`, `APPROVED_FOR_PUBLICATION` appear in any field — except prefixed `NO_<token>` in `not_allowed_actions / must_not_claim / public_limitations / reviewer_notes / allowed_next_workflow` |
| H1B_CLAIM_VS_CAVEAT_CONFLICT | `h1b_supported=TRUE` but `visa_public_caveat` says H-1B not verified |
| H1B_CLAIM_VS_TAG_CONFLICT | `h1b_supported=TRUE` but `visa_tags` includes `NO_H1B_VERIFIED` or `NO_H1B_SUPPORT` |
| MISSING_REQUIRED_NOT_ALLOWED_ACTION | `not_allowed_actions` missing any of `NO_IMPORT_READY, NO_PUBLIC_NOW, NO_RUNTIME_MUTATION, NO_INDEXED_PUBLICATION` |
| VALIDATED_WITHOUT_EVIDENCE_TRIPLE | `bridge_review_status=VALIDATED_BRIDGE_INPUT` requires `evidence_triple_complete=true` |
| FORBIDDEN_RUNTIME_SUBSTRING | Public-facing field contains `npi, ccn, cms, nppes, aamc, nrmp, acgme, nucc, completeness_score, max_possible_score, identity_status, unknown_fields` |

## 4. Enum vocabulary (key fields)

- `opportunity_type`: `VISITING_ELECTIVE | SUB_INTERNSHIP | EXTERNSHIP | OBSERVERSHIP | RESIDENCY | RESIDENCY_SUPPORTING_SOURCE`
- `clinical_exposure_level`: `DIRECT_PATIENT_CARE | OBSERVATION_ONLY | NOT_DOCUMENTED`
- `current_wedge_fit`: `IN_PILOT_WEDGE | OUT_OF_WEDGE | DEFER`
- `public_pilot_category`: `READY_PUBLIC_IMG_RELEVANT_CANDIDATE | READY_PUBLIC_US_STUDENT_ONLY_CANDIDATE | NOT_PUBLIC_PILOT_CANDIDATE`
- `accepts_*`: `YES | NO | UNKNOWN_NOT_STATED | ONLY_IF_AFFILIATED` (+ `ONLY_IF_NAMED_PARTNER` for caribbean)
- `audience_confidence / visa_confidence`: `HIGH | MEDIUM | LOW`
- `visa_policy`: `J1_ECFMG_ONLY | J1_AND_H1B | NO_SPONSORSHIP | NOT_MENTIONED | APPLICANT_OBTAINED_B1_B2 | OTHER`
- `h1b_supported / j1_supported`: `TRUE | FALSE | UNKNOWN_NOT_STATED`
- `b1_b2_supported`: `TRUE | FALSE | UNKNOWN_NOT_STATED | APPLICANT_OBTAINED`
- `source_status`: `OFFICIAL_SOURCE_ARCHIVED | OFFICIAL_SOURCE_NOT_ARCHIVED | SOURCE_CHANGED | SOURCE_NOT_FOUND`
- `evidence_status`: `EVIDENCE_TRIPLE_COMPLETE | EVIDENCE_TRIPLE_PENDING | EVIDENCE_INSUFFICIENT`
- `evidence_triple_complete`: `true | false`
- `correction_contact_visible`: `TRUE | FALSE | REQUIRED_BEFORE_PUBLICATION`
- `p97_readiness_status`: `HUMAN_REVIEW_READY` (only)
- `bridge_review_status`: `DRAFT_FROM_P97 | VALIDATED_BRIDGE_INPUT | NEEDS_HUMAN_COPY_REVIEW | NEEDS_SOURCE_REVIEW | KEEP_INTERNAL | REJECT_PUBLIC`
- `allowed_next_workflow`: `P99_PILOT_INPUT_REVIEW | P99_RUNTIME_GENERATION_CANDIDATE | NONE_BLOCKED`
- `human_reviewer_required`: `true` (only)

## 5. DRAFT corrections applied (Phase F)

Initial run: 58 failures (2 rows × 29 enum/format issues each, plus shared `audience_detail` / `not_allowed_actions` / `forbidden_status_token` failures).

**No safety violations among the 58.** Every failure was a vocabulary mismatch where the DRAFT used English-prose enum values; the validator required canonical T7 enum tokens.

Mapping applied (small, traceable, caveat-preserving):

| Field | DRAFT (before) | Corrected (T7-compatible) |
|-------|----------------|---------------------------|
| `opportunity_type` | "Visiting elective" / "Visiting elective (system-level) plus Lincoln EM site-specific MS3/4 rotation" | `VISITING_ELECTIVE` |
| `clinical_exposure_level` | prose | `DIRECT_PATIENT_CARE` |
| `current_wedge_fit` | `3A_VSLO_REMAINING` / `3C_IMG_CARIBBEAN_GME` (these belong to a different schema column) | `IN_PILOT_WEDGE` |
| `public_pilot_category` | UPMC: long descriptive string · Lincoln: `READY_PUBLIC_US_ONLY_WITH_SYSTEM_PAGE_PILL` | UPMC: `READY_PUBLIC_IMG_RELEVANT_CANDIDATE` · Lincoln: `READY_PUBLIC_US_STUDENT_ONLY_CANDIDATE` |
| `accepts_us_md / accepts_us_do` | `true` | `YES` |
| `accepts_img` (UPMC) | prose | `ONLY_IF_AFFILIATED` |
| `accepts_international_students` (UPMC) | prose | `ONLY_IF_AFFILIATED` |
| `accepts_caribbean` (UPMC) | prose ("not specified on source") | `UNKNOWN_NOT_STATED` |
| `accepts_*` (Lincoln IMG/intl/Caribbean) | `false` | `NO` |
| `visa_policy` (UPMC) | prose | `APPLICANT_OBTAINED_B1_B2` |
| `visa_policy` (Lincoln) | prose | `NOT_MENTIONED` |
| `h1b_supported / j1_supported` | `false` | `FALSE` |
| `b1_b2_supported` (UPMC) | `true` | `APPLICANT_OBTAINED` |
| `b1_b2_supported` (Lincoln) | `false` | `UNKNOWN_NOT_STATED` |
| `source_status` | `ARCHIVED_VERIFIED` / `ARCHIVED_VERIFIED_PRIOR_SNAPSHOT_2026_04_12` | `OFFICIAL_SOURCE_ARCHIVED` |
| `evidence_status` | long descriptive string | `EVIDENCE_TRIPLE_PENDING` |
| `evidence_triple_complete` | `partial_no_PNG_runtime_limitation` | `false` |
| `correction_contact_visible` | `true` | `TRUE` |
| `p97_readiness_status` | `DRAFT_BRIDGE_INPUT_PENDING_PNG_DECISION` | `HUMAN_REVIEW_READY` |
| `bridge_review_status` | `APPROVED_WITH_PUBLIC_COPY_CARVEOUT_PNG_WAIVED_FOR_DRAFT_NOT_FOR_RUNTIME` | `NEEDS_HUMAN_COPY_REVIEW` |
| `allowed_next_workflow` | prose | `P99_PILOT_INPUT_REVIEW` |
| `not_allowed_actions` | `RUNTIME_GENERATION \| PUBLIC_NOW \| IMPORT_READY \| PNG_BYPASS_AT_RUNTIME` (forbidden tokens without `NO_` prefix) | `NO_IMPORT_READY;NO_PUBLIC_NOW;NO_RUNTIME_MUTATION;NO_INDEXED_PUBLICATION;NO_PNG_BYPASS_AT_RUNTIME` |
| `audience_detail` | prose | JSON with required 4 keys + 4 enum tokens |
| `visa_tags` | `VISA_APPLICANT_OBTAINED_B1 \| NO_J1_SPONSORSHIP_STATED \| NO_H1B_SPONSORSHIP_STATED` | `VISA_APPLICANT_OBTAINED_B1 \| NO_J1_VERIFIED \| NO_H1B_VERIFIED` (UPMC); `NOT_MENTIONED_US_ONLY_AUDIENCE \| NO_J1_VERIFIED \| NO_H1B_VERIFIED` (Lincoln) — aligned with validator's H-1B-claim guard regex |

**Caveats preserved verbatim** in `audience_public_caveat`, `visa_public_caveat`, `public_limitations`, `must_not_claim`, `reviewer_notes`. The DRAFT's behavioral promises and human-readable safety language are unchanged; only the machine-checked enum values now match the canonical T7 vocabulary.

## 6. Re-run result

```
Overall: PASSED
  2 row(s) passed all bridge-input gates.
  No runtime mutation. No public promotion. No import.
```

Both `pilot-011` and `pilot-012` clear all 16 hard-fail rules. The DRAFT carries `evidence_triple_complete=false` (PNG missing) and `bridge_review_status=NEEDS_HUMAN_COPY_REVIEW` — these are accurate and consistent with the curator's DRAFT-only PNG waiver. Promotion to `VALIDATED_BRIDGE_INPUT` is BLOCKED until PNG lands (validator enforces `evidence_triple_complete=true` for that status).

## 7. What the validator does NOT check

- Does NOT verify Wayback URLs return HTTP 200 (network-free check).
- Does NOT inspect HTML snapshot content for verbatim quote presence (out of scope; manual curator step).
- Does NOT decide curator policy on whether `NEEDS_HUMAN_COPY_REVIEW` may advance to `VALIDATED_BRIDGE_INPUT` once PNG is captured (curator decision).
- Does NOT enforce a row-level cross-check between `accepts_caribbean=NO` and `audience_detail.caribbean_student=EXCLUDED_EXPLICIT` (advisory consistency only — the validator currently treats them as independent).

These are gaps to consider for a future validator hardening sprint but are NOT blockers for the current DRAFT.
