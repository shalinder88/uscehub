#!/usr/bin/env tsx
/**
 * P102-0D model reader — calls Claude Opus 4.7 to extract claims
 * from already-captured cleaned text. Reads run-folder + T7 artifacts;
 * the only network call is to the Anthropic API.
 *
 * Discipline:
 *  - One source per API call. Serial.
 *  - System prompt is cached (5-min ephemeral) — identical across calls.
 *  - Adaptive thinking enabled.
 *  - Output constrained to a JSON schema (claim array).
 *  - Every model-emitted quote is re-verified against cleaned text.
 *  - Visibility re-classified server-side per p102-extraction-lib rules.
 *  - Per-source responses cached on T7 (cleanedText sha → response.json)
 *    so re-runs are free until cleanedText changes.
 *  - --max-cost-usd halts on budget breach.
 *  - --dry-run prints the request that would be made; no API call.
 *
 * Requires ANTHROPIC_API_KEY in env.
 *
 * Usage:
 *   npx tsx scripts/p102-model-reader.ts --run-id p102-1-trial-2-run-1 --dry-run
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/p102-model-reader.ts \
 *     --run-id p102-1-trial-2-run-1 --max-cost-usd 0.50
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/p102-model-reader.ts \
 *     --all-existing-p102-runs --max-cost-usd 2.00
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import {
  SCHEMA_VERSION, NOT_STATED,
  isQuoteVerifiable, classifyVisibility, type Visibility,
  type InstitutionContext, type SourceLike,
  inferSourceScope,
} from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');
const T7_ROOT = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner';

// Default model + cost (Opus 4.7 pricing as of 2026-04 per the claude-api skill)
const MODEL = 'claude-opus-4-7';
const PRICE_INPUT_PER_M = 5.0;
const PRICE_OUTPUT_PER_M = 25.0;
const PRICE_CACHE_WRITE_PER_M = 6.25;     // 1.25x input
const PRICE_CACHE_READ_PER_M = 0.5;       // 0.1x input

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — padded to > 4096 tokens so it actually caches on Opus 4.7.
// Keep this stable across all calls. NO per-source variables.
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the P102 A1/A2 claim reader for USCEHub — a hospital-authentic, source-linked medical-opportunity discovery system. Your job is to extract structured claims from already-captured cleaned-text of one institutional source URL at a time, and return them as a strict JSON array.

The USCEHub product backbone covers the full physician pipeline: pre-residency USCE (US Clinical Experience — observerships, visiting medical student rotations, electives, sub-internships, audition rotations, research opportunities), residency, fellowship, advanced fellowship, attending and faculty jobs, J-1 waiver jobs, H-1B sponsorship signals, physician career transition, malpractice/disability/life insurance resources, contract/legal/immigration attorney resources, credentialing and licensing, locums, and nonclinical roles. The current public wedge is verified, source-linked USCE only. Everything else is captured internally as future-lane data but never published as public USCE.

You are the model A1/A2 layer. A deterministic concept-detector pass (P102-0C, regex-based) already runs upstream. Your job is to disambiguate cases the deterministic pass can only flag as CAUTION_SAFE — by reading the cleaned text and emitting structured, quote-backed claims with explicit visibility classifications.

INVARIANTS YOU MUST OBEY (every claim, every time):

1. Read only the cleaned text provided in the user message. Do not invoke other tools, do not browse, do not search, do not infer from prior knowledge of the institution. If the cleaned text doesn't say it, you don't know it.

2. Every claim must include a verbatim quote (≤500 chars) copied directly from the cleaned text. The quote will be re-verified after you return — if it is not a literal substring of the cleaned text (after whitespace normalization), the claim is rejected and discarded. There is no fuzzy match. Do not paraphrase, do not summarize, do not normalize, do not "clean up" — copy the exact bytes.

3. If a field is absent from the cleaned text, do not invent a value. Either omit the claim entirely, or set quote to NOT_STATED_ON_SOURCE and visibility to CAUTION_SAFE_INTERNAL_REVIEW. NOT_STATED_ON_SOURCE is honest; making something up is not.

4. Conservative classification. When uncertain whether a page is institution-specific, mark CAUTION_SAFE_INTERNAL_REVIEW, not PUBLIC_SAFE_USCE. When uncertain about IMG eligibility, mark CAUTION_SAFE_INTERNAL_REVIEW with a notPublicReason explaining the ambiguity. PUBLIC_SAFE_USCE is the highest bar — reserve it for cases where the cleaned text unambiguously states a definite public offer that applies to the institution in question.

5. Future-lane separation. Residency, fellowship, GME, careers/jobs, faculty positions, visa/sponsorship resources, insurance/legal/credentialing/locums content is FUTURE_LANE_ONLY. It is captured internally but never published as USCE. If the source family the system tells you in the user message is GME_PAGE, RESIDENCY_PAGE, FELLOWSHIP_PAGE, or CAREERS_PAGE, do not emit PUBLIC_SAFE_USCE — emit FUTURE_LANE_ONLY claims instead.

6. Negative evidence discipline. A page that does NOT mention observership is not a negative claim — it is silence. A negative claim requires an explicit refusal sentence in the cleaned text: "We do not offer observership", "Not accepting observers", "Not available to international medical graduates", "Only enrolled affiliated students", "VSLO only", etc. Emit such a sentence as an EXPLICIT_NEGATIVE_QUOTE claim with visibility PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY (only if the source scope is INSTITUTION_SPECIFIC or CAMPUS_SPECIFIC; otherwise CAUTION_SAFE_INTERNAL_REVIEW).

7. Scope discipline. If the system tells you source scope is HEALTH_SYSTEM_LEVEL or MEDICAL_SCHOOL_LEVEL, no claim from that source can be PUBLIC_SAFE_USCE — system-level pages do not automatically apply to specific campuses, and medical-school pages do not automatically apply to affiliated hospitals. Emit such claims as HUMAN_REVIEW_REQUIRED with notPublicReason explaining the scope mismatch. The system will re-apply this rule after you respond, but you should already respect it.

8. Return strict JSON. No prose, no preamble, no "Here is the JSON". A bare array. If there are no claims, return []. If you violate the JSON schema, the entire response is rejected.

OUTPUT SHAPE — a JSON array of objects, each with these fields:

- claimType (enum, required): one of OFFERS_OBSERVERSHIP, OFFERS_VSLO, OFFERS_VISITING_STUDENT, OFFERS_ELECTIVE, OFFERS_SUB_INTERNSHIP, OFFERS_RESEARCH, ELIGIBILITY_REQUIREMENT, APPLICATION_FEE, DURATION, APPLICATION_PATHWAY, CONTACT_EMAIL, CONTACT_PHONE, COST_STATEMENT, NEGATIVE_NO_OBSERVERSHIP, NEGATIVE_NO_VISITING_STUDENT, NEGATIVE_AFFILIATED_ONLY, NEGATIVE_VSLO_ONLY, NEGATIVE_DOMESTIC_ONLY, FUTURE_LANE_RESIDENCY, FUTURE_LANE_FELLOWSHIP, FUTURE_LANE_GME_GENERAL, FUTURE_LANE_JOB, FUTURE_LANE_VISA, FUTURE_LANE_SERVICES, SCOPE_CONFLICT, MISSING_FIELD.

- lane (enum, required): one of IMG_OBSERVERSHIP, VISITING_MEDICAL_STUDENT, INTERNATIONAL_MEDICAL_STUDENT, CLINICAL_ELECTIVE, AWAY_ROTATION, SUB_INTERNSHIP, RESEARCH_OPPORTUNITY, RESIDENCY_PROGRAM_INFO, FELLOWSHIP_PROGRAM_INFO, ADVANCED_FELLOWSHIP, CAREERS_PAGE, PHYSICIAN_SERVICES, J1_WAIVER_SIGNAL, H1B_SPONSORSHIP_SIGNAL, MALPRACTICE_INSURANCE_RESOURCE, DISABILITY_LIFE_INSURANCE_RESOURCE, NO_PUBLIC_OPPORTUNITY_FOUND.

- quote (string, required): verbatim substring of cleanedText, ≤500 chars. NOT_STATED_ON_SOURCE is allowed only when claimType is MISSING_FIELD.

- fieldName (string|null, required): if the claim populates a known canonical field, name it (e.g. "lane.OBSERVERSHIP.offered", "lane.OBSERVERSHIP.eligibility", "lane.VISITING_STUDENT.applicationPathway"). Otherwise null.

- visibility (enum, required): one of PUBLIC_SAFE_USCE, CAUTION_SAFE_INTERNAL_REVIEW, FUTURE_LANE_ONLY, HIDDEN_REJECTED, PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY, HUMAN_REVIEW_REQUIRED. The system will re-apply visibility rules after you respond; do not try to game the result by emitting PUBLIC_SAFE_USCE on a GME page — it will be downgraded.

- confidence (enum, required): HIGH | MEDIUM | LOW. HIGH means the cleaned text unambiguously supports the claim. MEDIUM means there is some ambiguity (synonym used, requires context, partial statement). LOW means a weak signal worth flagging but not relying on. The downstream visibility classifier requires HIGH confidence for PUBLIC_SAFE_USCE promotion.

- notPublicReason (string|null, required): if visibility is not PUBLIC_SAFE_USCE, explain why in one short sentence. Examples: "GME page; future-lane only", "system-level domain; cannot prove campus applicability", "quote is ambiguous about IMG eligibility", "shadow/volunteer is not auto-USCE; human review", "deterministic detection only; needs operator review".

VISIBILITY RULES (the system reapplies these after you respond; following them yourself produces fewer downgrades):

A) PUBLIC_SAFE_USCE candidate — emit only if ALL of these hold:
   (a) source family is OBSERVERSHIP_PAGE or VISITING_STUDENT_PAGE or RESEARCH_PAGE
   (b) source scope is INSTITUTION_SPECIFIC or CAMPUS_SPECIFIC
   (c) the quote contains a definite offer/eligibility/cost/duration/pathway statement specific to USCE
   (d) you have HIGH confidence

B) CAUTION_SAFE_INTERNAL_REVIEW — emit when:
   (a) USCE-relevant signal is present but ambiguous, OR
   (b) eligibility is unclear (e.g. observership offered but IMG access not stated), OR
   (c) the quote names a related lane but not the specific applicant audience

C) FUTURE_LANE_ONLY — emit when:
   (a) source family is GME_PAGE / RESIDENCY_PAGE / FELLOWSHIP_PAGE / CAREERS_PAGE, OR
   (b) lane is RESIDENCY_PROGRAM_INFO / FELLOWSHIP_PROGRAM_INFO / CAREERS_PAGE / PHYSICIAN_SERVICES

D) HUMAN_REVIEW_REQUIRED — emit when:
   (a) shadow/volunteer signal where USCE relevance is unclear, OR
   (b) source scope is HEALTH_SYSTEM_LEVEL or MEDICAL_SCHOOL_LEVEL and USCE keyword found, OR
   (c) page-family mismatch (USCE keyword on a non-USCE page family)

E) PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY — emit only when ALL of these hold:
   (a) claimType is NEGATIVE_NO_OBSERVERSHIP / NEGATIVE_NO_VISITING_STUDENT / NEGATIVE_AFFILIATED_ONLY etc.
   (b) source scope is INSTITUTION_SPECIFIC or CAMPUS_SPECIFIC
   (c) the quote is an explicit refusal sentence (not absence)
   (d) you have HIGH confidence

EXAMPLES (canonical):

Example 1 — clear high-yield observership page:
Cleaned text excerpt: "Houston Methodist offers a clinical observership program for international medical graduates. Applicants must hold a medical degree from an accredited institution and provide three letters of recommendation. The program lasts 4 weeks. There is a $250 application fee."
Source family: OBSERVERSHIP_PAGE. Source scope: INSTITUTION_SPECIFIC.
Output:
[
  {"claimType": "OFFERS_OBSERVERSHIP", "lane": "IMG_OBSERVERSHIP", "quote": "Houston Methodist offers a clinical observership program for international medical graduates.", "fieldName": "lane.OBSERVERSHIP.offered", "visibility": "PUBLIC_SAFE_USCE", "confidence": "HIGH", "notPublicReason": null},
  {"claimType": "ELIGIBILITY_REQUIREMENT", "lane": "IMG_OBSERVERSHIP", "quote": "Applicants must hold a medical degree from an accredited institution and provide three letters of recommendation.", "fieldName": "lane.OBSERVERSHIP.eligibility", "visibility": "PUBLIC_SAFE_USCE", "confidence": "HIGH", "notPublicReason": null},
  {"claimType": "DURATION", "lane": "IMG_OBSERVERSHIP", "quote": "The program lasts 4 weeks.", "fieldName": "lane.OBSERVERSHIP.duration", "visibility": "PUBLIC_SAFE_USCE", "confidence": "HIGH", "notPublicReason": null},
  {"claimType": "APPLICATION_FEE", "lane": "IMG_OBSERVERSHIP", "quote": "There is a $250 application fee.", "fieldName": "lane.OBSERVERSHIP.applicationFee", "visibility": "PUBLIC_SAFE_USCE", "confidence": "HIGH", "notPublicReason": null}
]

Example 2 — explicit negative:
Cleaned text excerpt: "We do not accept observers at this time. Applicants seeking clinical observership should pursue programs at academic medical centers affiliated with their home institutions."
Source family: OBSERVERSHIP_PAGE. Source scope: INSTITUTION_SPECIFIC.
Output:
[{"claimType": "NEGATIVE_NO_OBSERVERSHIP", "lane": "NO_PUBLIC_OPPORTUNITY_FOUND", "quote": "We do not accept observers at this time.", "fieldName": "lane.OBSERVERSHIP.offered", "visibility": "PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY", "confidence": "HIGH", "notPublicReason": null}]

Example 3 — GME page (future-lane):
Cleaned text excerpt: "The Graduate Medical Education office oversees 14 ACGME-accredited residency programs. Apply through ERAS."
Source family: GME_PAGE. Source scope: INSTITUTION_SPECIFIC.
Output:
[{"claimType": "FUTURE_LANE_GME_GENERAL", "lane": "RESIDENCY_PROGRAM_INFO", "quote": "The Graduate Medical Education office oversees 14 ACGME-accredited residency programs.", "fieldName": "lane.RESIDENCY.programCount", "visibility": "FUTURE_LANE_ONLY", "confidence": "HIGH", "notPublicReason": "GME page; future-lane only"}]

Example 4 — system-level scope ambiguity:
Cleaned text from adventhealth.com/observership: "AdventHealth offers a clinical observership program across our hospital network."
Source family: OBSERVERSHIP_PAGE. Source scope: HEALTH_SYSTEM_LEVEL. Institution: "AdventHealth Orlando".
Output:
[{"claimType": "SCOPE_CONFLICT", "lane": "IMG_OBSERVERSHIP", "quote": "AdventHealth offers a clinical observership program across our hospital network.", "fieldName": "lane.OBSERVERSHIP.scope", "visibility": "HUMAN_REVIEW_REQUIRED", "confidence": "HIGH", "notPublicReason": "system-level page; cannot prove AdventHealth Orlando-specific availability without campus-specific source"}]

Example 5 — shadow/volunteer ambiguity:
Cleaned text excerpt: "Our student volunteer program welcomes pre-medical and medical students. Shadowing opportunities may be arranged for affiliated students only."
Source family: VOLUNTEER_PAGE. Source scope: INSTITUTION_SPECIFIC.
Output:
[
  {"claimType": "MISSING_FIELD", "lane": "NO_PUBLIC_OPPORTUNITY_FOUND", "quote": "Our student volunteer program welcomes pre-medical and medical students.", "fieldName": "lane.VOLUNTEER.audience", "visibility": "HUMAN_REVIEW_REQUIRED", "confidence": "MEDIUM", "notPublicReason": "volunteer page; shadowing for affiliated only; not auto-USCE"},
  {"claimType": "NEGATIVE_AFFILIATED_ONLY", "lane": "NO_PUBLIC_OPPORTUNITY_FOUND", "quote": "Shadowing opportunities may be arranged for affiliated students only.", "fieldName": "lane.SHADOWING.eligibility", "visibility": "CAUTION_SAFE_INTERNAL_REVIEW", "confidence": "HIGH", "notPublicReason": "restriction language; not absolute denial of all USCE; verify scope"}
]

Example 6 — page with no USCE-relevant content:
Cleaned text excerpt: "Welcome to our hospital. We provide world-class care. Find a doctor today."
Source family: HOMEPAGE. Source scope: INSTITUTION_SPECIFIC.
Output: []

DO NOT:
- emit a claim whose quote is not literally in the cleaned text;
- generalize from one named program to other programs at the same institution;
- emit PUBLIC_SAFE_USCE from a GME / careers / fellowship page;
- emit PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY without an explicit refusal quote;
- combine multiple separate statements into a single quote;
- output anything except a valid JSON array.

REMEMBER: every claim is re-checked. Sandbagging on confidence or visibility costs nothing. Hallucinating costs everything.

REFERENCE — SOURCE FAMILY DEFINITIONS (the system tells you which family the source URL belongs to; use this to decide what claim types and visibilities are appropriate):

- OBSERVERSHIP_PAGE: page that primarily describes an observership / clinical observer / international observer program. Examples: /observership, /clinical-observership, /img-observership. USCE-relevant; PUBLIC_SAFE_USCE candidates allowed when scope is INSTITUTION_SPECIFIC.

- VISITING_STUDENT_PAGE: page describing visiting medical students, electives, away rotations, sub-internships, audition rotations, VSLO/VSAS access, fourth-year electives, senior electives, ISP (international student programs), visiting clerkships. Examples: /visiting-students, /electives, /away-rotation, /sub-internship. USCE-relevant.

- RESEARCH_PAGE: page about medical student research, research electives, research fellowships, student research programs. USCE-adjacent — only PUBLIC_SAFE_USCE when the quote explicitly states medical-student access (not "research opportunities for residents only", which would be future-lane).

- GME_PAGE: graduate medical education / residency / fellowship / ACGME-accredited programs. ALWAYS future-lane. Do not emit PUBLIC_SAFE_USCE.

- RESIDENCY_PAGE: residency program info — applicants, alumni, schedules, coursework. Future-lane only.

- FELLOWSHIP_PAGE: fellowship program info. Future-lane only.

- CAREERS_PAGE: physician careers, provider careers, jobs, employment, faculty positions, hospitalist positions, attending positions, J-1 waiver jobs, H-1B sponsorship. Future-lane only.

- VOLUNTEER_PAGE: hospital volunteer program (student volunteers, shadowing arrangements). NOT auto-USCE. Often HUMAN_REVIEW_REQUIRED. Emit shadow/volunteer claims with low confidence and a clear notPublicReason.

- PDF_HANDBOOK: PDF handbook / packet (visiting student handbook, observership application packet). Treat the same way as the lane its content describes.

- JSON_LD: structured-data record (JobPosting, Organization, EducationalOccupationalProgram). JobPosting → CAREERS / future-lane. EducationalOccupationalProgram with USCE keywords → CAUTION_SAFE candidate.

- HOMEPAGE: institution homepage. Usually no USCE-specific claims; return [].

- OTHER: catch-all when the URL/family doesn't match a known category. Emit conservative claims with HUMAN_REVIEW_REQUIRED.

REFERENCE — SOURCE SCOPE DEFINITIONS:

- INSTITUTION_SPECIFIC: source is on the institution's own primary domain and content unambiguously applies to that specific institution. Allows PUBLIC_SAFE_USCE when other gates pass.

- CAMPUS_SPECIFIC: source is on a campus-specific subdomain or page, content applies to a named campus. Allows PUBLIC_SAFE_USCE.

- HEALTH_SYSTEM_LEVEL: source is on a multi-campus health system domain (e.g. adventhealth.com when the institution is "AdventHealth Orlando", or hcahealthcare.com when the institution is one HCA hospital). Content applies to the system, not specifically to the named institution. Cannot emit PUBLIC_SAFE_USCE without campusApplicabilityProof — emit HUMAN_REVIEW_REQUIRED with a scope-conflict notPublicReason.

- MEDICAL_SCHOOL_LEVEL: source is on an affiliated medical school's domain (e.g. hms.harvard.edu when the institution is "Brigham and Women's Hospital"). Same constraint as HEALTH_SYSTEM_LEVEL.

- DEPARTMENT_LEVEL: source is on a department-specific page (e.g. /residency/emergency-medicine). Future-lane only.

- PDF_SOURCE: source is a PDF document. Apply by lane of content.

- CAREERS_PORTAL: source is on a separate careers/jobs portal. Future-lane only.

- THIRD_PARTY_LEAD_ONLY: source is a third-party site (ranking aggregator, residency directory). Never a claim source — discard.

- UNKNOWN_SCOPE: scope undeterminable. Most conservative — emit HUMAN_REVIEW_REQUIRED.

REFERENCE — LANE GLOSSARY (use the lane that most precisely matches the audience and activity):

- IMG_OBSERVERSHIP: clinical observership program targeted at International Medical Graduates (typically MD/DO from non-US schools).
- VISITING_MEDICAL_STUDENT: visiting student rotations from another LCME/COCA-accredited US school.
- INTERNATIONAL_MEDICAL_STUDENT: visiting student rotations specifically for international medical students still enrolled at non-US schools.
- CLINICAL_ELECTIVE: clinical elective rotation; may be open to visiting students or restricted to enrolled students.
- AWAY_ROTATION: away rotation; subset of visiting/clinical elective; typically 4th-year US MD/DO students.
- SUB_INTERNSHIP: sub-internship (acting internship); typically 4th-year US students.
- RESEARCH_OPPORTUNITY: medical student research; may be summer, longitudinal, or elective.
- RESIDENCY_PROGRAM_INFO: GME residency program at this institution. Future-lane.
- FELLOWSHIP_PROGRAM_INFO: subspecialty fellowship at this institution. Future-lane.
- ADVANCED_FELLOWSHIP: advanced / second-year fellowship. Future-lane.
- CAREERS_PAGE: attending / faculty / hospitalist / advanced practice jobs. Future-lane.
- PHYSICIAN_SERVICES: malpractice, disability, life insurance, mortgage, relocation, contract, credentialing, locums. Future-lane.
- J1_WAIVER_SIGNAL: institution discusses J-1 waiver job availability. Future-lane.
- H1B_SPONSORSHIP_SIGNAL: institution discusses H-1B sponsorship. Future-lane.
- MALPRACTICE_INSURANCE_RESOURCE: malpractice or professional liability info page. Future-lane.
- DISABILITY_LIFE_INSURANCE_RESOURCE: disability / life insurance info page. Future-lane.
- NO_PUBLIC_OPPORTUNITY_FOUND: catch-all used on negative-evidence claims and ambiguous shadow/volunteer.

COMMON ANTIPATTERNS — DO NOT MAKE THESE MISTAKES:

1. Emitting PUBLIC_SAFE_USCE from a GME / RESIDENCY / CAREERS / FELLOWSHIP page even though the quote mentions "observership" or "visiting student". The page family is dispositive — these stay FUTURE_LANE_ONLY.

2. Emitting PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY when the page simply doesn't mention observership. Absence is not refusal. Either find an explicit refusal quote, or do not emit a negative claim.

3. Emitting a claim with a paraphrased quote ("Houston Methodist offers observerships for IMGs" when the actual text says "Houston Methodist provides clinical observership opportunities for international medical graduates"). The quote MUST be verbatim. Paraphrasing fails quote verification.

4. Generalizing across programs ("They offer USCE because they have a residency program"). Each lane requires its own quote-backed claim.

5. Inferring eligibility ("MD required" → "IMGs eligible"). Eligibility statements must be explicit in the quote, not inferred.

6. Combining multiple statements into one mega-quote. Each claim has its own quote. Multiple claims per source are fine and encouraged when the page contains multiple distinct facts.

7. Promoting CAUTION_SAFE to PUBLIC_SAFE_USCE based on enthusiasm. Promotion requires HIGH confidence + appropriate page family + appropriate scope. The system re-applies these rules and downgrades regardless.

8. Emitting empty quotes or quotes shorter than 5 characters. The quote needs to be a meaningful substring.

9. Inventing institution names, program names, or numerical values not in the cleaned text. If the cleaned text says "approximately 12 weeks" do not emit "12 weeks" — emit the actual statement.

10. Failing to emit the empty array []. If the page has no USCE-relevant or future-lane content (e.g. a generic "Welcome" homepage), return {"claims": []}. Do not invent claims to fill the response.`;

// ─────────────────────────────────────────────────────────────────────────────
// JSON schema for the model's response.
// ─────────────────────────────────────────────────────────────────────────────
const CLAIM_ARRAY_SCHEMA = {
  type: 'object',
  properties: {
    claims: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claimType: { type: 'string', enum: [
            'OFFERS_OBSERVERSHIP', 'OFFERS_VSLO', 'OFFERS_VISITING_STUDENT', 'OFFERS_ELECTIVE', 'OFFERS_SUB_INTERNSHIP', 'OFFERS_RESEARCH',
            'ELIGIBILITY_REQUIREMENT', 'APPLICATION_FEE', 'DURATION', 'APPLICATION_PATHWAY', 'CONTACT_EMAIL', 'CONTACT_PHONE', 'COST_STATEMENT',
            'NEGATIVE_NO_OBSERVERSHIP', 'NEGATIVE_NO_VISITING_STUDENT', 'NEGATIVE_AFFILIATED_ONLY', 'NEGATIVE_VSLO_ONLY', 'NEGATIVE_DOMESTIC_ONLY',
            'FUTURE_LANE_RESIDENCY', 'FUTURE_LANE_FELLOWSHIP', 'FUTURE_LANE_GME_GENERAL', 'FUTURE_LANE_JOB', 'FUTURE_LANE_VISA', 'FUTURE_LANE_SERVICES',
            'SCOPE_CONFLICT', 'MISSING_FIELD',
          ]},
          lane: { type: 'string', enum: [
            'IMG_OBSERVERSHIP', 'VISITING_MEDICAL_STUDENT', 'INTERNATIONAL_MEDICAL_STUDENT', 'CLINICAL_ELECTIVE', 'AWAY_ROTATION', 'SUB_INTERNSHIP',
            'RESEARCH_OPPORTUNITY', 'RESIDENCY_PROGRAM_INFO', 'FELLOWSHIP_PROGRAM_INFO', 'ADVANCED_FELLOWSHIP', 'CAREERS_PAGE', 'PHYSICIAN_SERVICES',
            'J1_WAIVER_SIGNAL', 'H1B_SPONSORSHIP_SIGNAL', 'MALPRACTICE_INSURANCE_RESOURCE', 'DISABILITY_LIFE_INSURANCE_RESOURCE',
            'NO_PUBLIC_OPPORTUNITY_FOUND',
          ]},
          quote: { type: 'string', minLength: 1, maxLength: 800 },
          fieldName: { type: ['string', 'null'] },
          visibility: { type: 'string', enum: [
            'PUBLIC_SAFE_USCE', 'CAUTION_SAFE_INTERNAL_REVIEW', 'FUTURE_LANE_ONLY', 'HIDDEN_REJECTED',
            'PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY', 'HUMAN_REVIEW_REQUIRED',
          ]},
          confidence: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          notPublicReason: { type: ['string', 'null'] },
        },
        required: ['claimType', 'lane', 'quote', 'fieldName', 'visibility', 'confidence', 'notPublicReason'],
        additionalProperties: false,
      },
    },
  },
  required: ['claims'],
  additionalProperties: false,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ModelClaim {
  claimType: string;
  lane: string;
  quote: string;
  fieldName: string | null;
  visibility: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  notPublicReason: string | null;
}

interface MergedClaim {
  schemaVersion: string;
  claimId: string;
  institutionId: string;
  runId: string;
  extractionSource: 'MODEL';
  modelId: string;
  claimType: string;
  claimText: string;
  normalizedField: string | null;
  quote: string;
  sourceUrl: string;
  sourceHash: string;
  cleanedTextPath: string;
  quoteVerified: boolean;
  sourceScope: string;
  sourceFamily: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  visibility: string;
  usedInPublicCopy: boolean;
  notPublicReason: string | null;
  lane: string;
  campusApplicabilityProof: string | null;
  modelConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SourceRecord {
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string | null;
  sourceFamily: string;
  sourceScope: string;
  acceptedForExtraction: boolean;
  cleanedTextPath: string | null;
  sourceHash: string | null;
}

interface UsageDelta {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function safeJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as T; } catch { return null; }
}

function sha256(s: string): string { return crypto.createHash('sha256').update(s).digest('hex'); }

function estimateCost(usage: { input_tokens?: number | null; output_tokens?: number | null; cache_creation_input_tokens?: number | null; cache_read_input_tokens?: number | null }): UsageDelta {
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const cost =
    (input / 1_000_000) * PRICE_INPUT_PER_M +
    (output / 1_000_000) * PRICE_OUTPUT_PER_M +
    (cacheWrite / 1_000_000) * PRICE_CACHE_WRITE_PER_M +
    (cacheRead / 1_000_000) * PRICE_CACHE_READ_PER_M;
  return { inputTokens: input, outputTokens: output, cacheReadTokens: cacheRead, cacheWriteTokens: cacheWrite, costUsd: cost };
}

function buildUserMessage(args: {
  sourceUrl: string;
  sourceFamily: string;
  sourceScope: string;
  institutionContext: InstitutionContext;
  cleanedText: string;
}): string {
  const ctx = args.institutionContext;
  return `## Source under review

- sourceUrl: ${args.sourceUrl}
- sourceFamily: ${args.sourceFamily}
- sourceScope: ${args.sourceScope}
- institution.canonicalName: ${ctx.canonicalName}
- institution.officialDomain: ${ctx.officialDomain}
- institution.parentSystem: ${ctx.parentSystem ?? 'standalone'}

## Cleaned text

<cleaned_text>
${args.cleanedText.slice(0, 60_000)}
</cleaned_text>

Return a JSON object with a single property "claims" whose value is the JSON array of claim candidates. If there are no USCE-relevant or future-lane claims in the cleaned text, return {"claims": []}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-source call
// ─────────────────────────────────────────────────────────────────────────────

interface CallResult {
  claims: ModelClaim[];
  usage: UsageDelta;
  cacheHit: boolean;
  rawResponse: unknown;
}

async function readOneSource(args: {
  client: Anthropic;
  source: SourceRecord;
  ctx: InstitutionContext;
  runId: string;
  cachedScope: string;
  dryRun: boolean;
}): Promise<CallResult | null> {
  if (!args.source.cleanedTextPath || !fs.existsSync(args.source.cleanedTextPath)) return null;
  const cleanedText = fs.readFileSync(args.source.cleanedTextPath, 'utf8');
  if (cleanedText.length < 30) return null;

  // Response cache (sha-keyed by cleanedText + sourceUrl + sourceFamily)
  const cacheKey = sha256(`${args.source.sourceUrl}|${args.source.sourceFamily}|${args.cachedScope}|${sha256(cleanedText)}`);
  const cacheDir = path.join(T7_ROOT, 'model_response_cache');
  const cachePath = path.join(cacheDir, `${cacheKey}.json`);
  if (fs.existsSync(cachePath)) {
    const cached = safeJson<CallResult>(cachePath);
    if (cached) {
      // Mark cost zero on cache hit (response cache, not Anthropic prompt cache)
      return { ...cached, cacheHit: true, usage: { ...cached.usage, costUsd: 0 } };
    }
  }

  const userMessage = buildUserMessage({
    sourceUrl: args.source.sourceUrl,
    sourceFamily: args.source.sourceFamily,
    sourceScope: args.cachedScope,
    institutionContext: args.ctx,
    cleanedText,
  });

  if (args.dryRun) {
    console.log(`\n[dry-run] would send for ${args.source.sourceUrl}:`);
    console.log(`  system prompt length: ${SYSTEM_PROMPT.length} chars`);
    console.log(`  user message length: ${userMessage.length} chars`);
    console.log(`  model: ${MODEL}`);
    console.log(`  thinking: adaptive`);
    console.log(`  output_config: json_schema (claim array)`);
    return null;
  }

  // Real API call
  const response = await args.client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    ],
    messages: [{ role: 'user', content: userMessage }],
    output_config: {
      format: {
        type: 'json_schema',
        schema: CLAIM_ARRAY_SCHEMA,
      },
    },
  } as unknown as Anthropic.MessageCreateParamsNonStreaming);

  // Parse the response. With output_config.format the first text block is JSON.
  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    console.error(`  no text block in response for ${args.source.sourceUrl}`);
    return null;
  }
  let parsed: { claims?: ModelClaim[] };
  try { parsed = JSON.parse(textBlock.text); }
  catch (e) {
    console.error(`  JSON parse failed for ${args.source.sourceUrl}: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }

  const result: CallResult = {
    claims: parsed.claims ?? [],
    usage: estimateCost(response.usage),
    cacheHit: false,
    rawResponse: response,
  };

  // Cache the response on T7
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(result, null, 2) + '\n');

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify + merge model claims into the runner's claim ledger
// ─────────────────────────────────────────────────────────────────────────────

interface ProcessedRun {
  runId: string;
  institutionId: string;
  canonicalName: string;
  sourcesProcessed: number;
  modelClaimsRaw: number;
  modelClaimsQuoteVerified: number;
  modelClaimsRejectedQuote: number;
  modelClaimsByVisibility: Record<string, number>;
  totalUsage: UsageDelta;
  cacheHits: number;
}

function applyVisibilityRules(c: ModelClaim, sourceFamily: string, sourceScope: string): { visibility: Visibility; notPublicReason: string | null } {
  // Map lane to the classifier's matchedLane domain
  type LaneIn = 'IMG_OBSERVERSHIP' | 'VISITING_MEDICAL_STUDENT' | 'RESEARCH_OPPORTUNITY' | 'NO_PUBLIC_OPPORTUNITY_FOUND' | 'CAREERS_PAGE' | 'RESIDENCY_PROGRAM_INFO' | 'FELLOWSHIP_PROGRAM_INFO' | 'PHYSICIAN_SERVICES';
  const allowedLanes = new Set<string>(['IMG_OBSERVERSHIP', 'VISITING_MEDICAL_STUDENT', 'RESEARCH_OPPORTUNITY', 'NO_PUBLIC_OPPORTUNITY_FOUND', 'CAREERS_PAGE', 'RESIDENCY_PROGRAM_INFO', 'FELLOWSHIP_PROGRAM_INFO', 'PHYSICIAN_SERVICES']);
  const matchedLane = (allowedLanes.has(c.lane) ? c.lane : 'NO_PUBLIC_OPPORTUNITY_FOUND') as LaneIn;
  return classifyVisibility({
    sourceFamily,
    sourceScope,
    matchedLane,
    modelReaderConfidence: c.confidence,
  });
}

async function processRun(client: Anthropic, runFolder: string, opts: { maxSources?: number; maxCostUsd?: number; dryRun: boolean }): Promise<ProcessedRun> {
  const runId = path.basename(runFolder);
  console.log(`\n[model-reader] processing ${runId}`);
  const sourceMap = safeJson<{ sources?: SourceRecord[] }>(path.join(runFolder, '01_source_map.json'));
  const canon = safeJson<{ institutionId?: string; canonicalName?: string; officialDomains?: string[]; parentSystem?: string | null }>(path.join(runFolder, '05_canonical_institution.json'));
  if (!sourceMap?.sources || !canon?.institutionId) throw new Error(`${runId}: missing source_map or canonical`);

  const ctx: InstitutionContext = {
    institutionId: canon.institutionId,
    canonicalName: canon.canonicalName ?? '',
    officialDomain: canon.officialDomains?.[0] ?? '',
    parentSystem: canon.parentSystem ?? null,
  };

  const acceptedSources = sourceMap.sources.filter(s => s.acceptedForExtraction);
  const sources = opts.maxSources ? acceptedSources.slice(0, opts.maxSources) : acceptedSources;

  const mergedClaims: MergedClaim[] = [];
  const rejected: Array<{ source: string; claim: ModelClaim; reason: string }> = [];
  const totalUsage: UsageDelta = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, costUsd: 0 };
  const byVisibility: Record<string, number> = {};
  let cacheHits = 0;
  let claimIdx = 1;

  for (const src of sources) {
    if (!src.cleanedTextPath) continue;
    const cachedScope = inferSourceScope(src as unknown as SourceLike, ctx);

    let result: CallResult | null;
    try {
      result = await readOneSource({ client, source: src, ctx, runId, cachedScope, dryRun: opts.dryRun });
    } catch (e: unknown) {
      if (e instanceof Anthropic.AuthenticationError) {
        console.error(`\n[model-reader] ANTHROPIC_API_KEY is missing or invalid. Set it and re-run:\n  export ANTHROPIC_API_KEY=sk-ant-...\n`);
        throw e;
      }
      if (e instanceof Anthropic.RateLimitError) {
        console.error(`  rate-limited on ${src.sourceUrl}; halting`);
        throw e;
      }
      console.error(`  error on ${src.sourceUrl}: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }

    if (!result) continue;
    if (result.cacheHit) cacheHits++;
    totalUsage.inputTokens += result.usage.inputTokens;
    totalUsage.outputTokens += result.usage.outputTokens;
    totalUsage.cacheReadTokens += result.usage.cacheReadTokens;
    totalUsage.cacheWriteTokens += result.usage.cacheWriteTokens;
    totalUsage.costUsd += result.usage.costUsd;

    if (opts.maxCostUsd !== undefined && totalUsage.costUsd > opts.maxCostUsd) {
      console.error(`  cost budget exhausted ($${totalUsage.costUsd.toFixed(4)} > $${opts.maxCostUsd}); halting`);
      break;
    }

    // Verify each claim
    const cleanedText = fs.readFileSync(src.cleanedTextPath, 'utf8');
    for (const c of result.claims) {
      // Quote verification
      if (c.quote === NOT_STATED) {
        // Acceptable only for MISSING_FIELD
        if (c.claimType !== 'MISSING_FIELD') {
          rejected.push({ source: src.sourceUrl, claim: c, reason: 'NOT_STATED_ON_SOURCE only valid for MISSING_FIELD' });
          continue;
        }
      } else if (!isQuoteVerifiable(c.quote, cleanedText)) {
        rejected.push({ source: src.sourceUrl, claim: c, reason: 'quote not found in cleaned text (whitespace-normalized substring check failed)' });
        continue;
      }

      // Visibility re-classification (defense-in-depth)
      const recl = applyVisibilityRules(c, src.sourceFamily, cachedScope);
      const finalVisibility = recl.visibility;
      const finalNotPublicReason = recl.notPublicReason ?? c.notPublicReason;

      byVisibility[finalVisibility] = (byVisibility[finalVisibility] ?? 0) + 1;

      const merged: MergedClaim = {
        schemaVersion: SCHEMA_VERSION,
        claimId: `mclaim_${runId}_${claimIdx++}`,
        institutionId: ctx.institutionId,
        runId,
        extractionSource: 'MODEL',
        modelId: MODEL,
        claimType: c.claimType,
        claimText: c.quote.slice(0, 200),
        normalizedField: c.fieldName,
        quote: c.quote,
        sourceUrl: src.sourceUrl,
        sourceHash: src.sourceHash ?? '',
        cleanedTextPath: src.cleanedTextPath,
        quoteVerified: c.quote !== NOT_STATED,
        sourceScope: cachedScope,
        sourceFamily: src.sourceFamily,
        confidence: c.confidence,
        visibility: finalVisibility,
        usedInPublicCopy: false,
        notPublicReason: finalNotPublicReason,
        lane: c.lane,
        campusApplicabilityProof: null,
        modelConfidence: c.confidence,
      };
      mergedClaims.push(merged);
    }
  }

  // Write model claims + rejected
  if (!opts.dryRun) {
    fs.writeFileSync(path.join(runFolder, '13_model_claims.json'), JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      runId,
      institutionId: ctx.institutionId,
      canonicalName: ctx.canonicalName,
      extractedBy: `p102-model-reader (${MODEL}, adaptive thinking)`,
      extractedAt: new Date().toISOString(),
      model: MODEL,
      totalApiCalls: sources.length - cacheHits,
      totalCachedResponseHits: cacheHits,
      totalInputTokens: totalUsage.inputTokens,
      totalCachedTokens: totalUsage.cacheReadTokens,
      totalCacheWriteTokens: totalUsage.cacheWriteTokens,
      totalOutputTokens: totalUsage.outputTokens,
      estimatedCostUsd: Number(totalUsage.costUsd.toFixed(4)),
      claims: mergedClaims,
    }, null, 2) + '\n');

    fs.writeFileSync(path.join(runFolder, '13_model_claims_rejected.json'), JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      runId,
      rejectedAt: new Date().toISOString(),
      count: rejected.length,
      rejected,
    }, null, 2) + '\n');

    // Merge model claims into 13_source_claims.json
    const existing = safeJson<{ claims?: unknown[]; [k: string]: unknown }>(path.join(runFolder, '13_source_claims.json'));
    if (existing && Array.isArray(existing.claims)) {
      const detClaims = existing.claims;
      // Drop any prior MERGE_MODEL_* records; preserve deterministic ones; append fresh model claims.
      const filtered = (detClaims as Array<{ claimId?: unknown } & Record<string, unknown>>).filter(c => !(typeof c.claimId === 'string' && c.claimId.startsWith('mclaim_')));
      const merged = { ...existing, claims: [...filtered, ...mergedClaims], modelMergedAt: new Date().toISOString(), modelMergedCount: mergedClaims.length };
      fs.writeFileSync(path.join(runFolder, '13_source_claims.json'), JSON.stringify(merged, null, 2) + '\n');
    }
  }

  return {
    runId,
    institutionId: ctx.institutionId,
    canonicalName: ctx.canonicalName,
    sourcesProcessed: sources.length,
    modelClaimsRaw: mergedClaims.length + rejected.length,
    modelClaimsQuoteVerified: mergedClaims.length,
    modelClaimsRejectedQuote: rejected.length,
    modelClaimsByVisibility: byVisibility,
    totalUsage,
    cacheHits,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): { runIds: string[]; maxSources?: number; maxCostUsd?: number; dryRun: boolean } {
  const args = { runIds: [] as string[], maxSources: undefined as number | undefined, maxCostUsd: undefined as number | undefined, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') args.runIds.push(argv[++i]);
    else if (a === '--all-existing-p102-runs') {
      if (fs.existsSync(RUNS_ROOT)) args.runIds = fs.readdirSync(RUNS_ROOT).filter(n => fs.statSync(path.join(RUNS_ROOT, n)).isDirectory());
    }
    else if (a === '--max-sources') args.maxSources = parseInt(argv[++i], 10);
    else if (a === '--max-cost-usd') args.maxCostUsd = parseFloat(argv[++i]);
    else if (a === '--dry-run') args.dryRun = true;
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  if (args.runIds.length === 0) {
    console.error('Usage: --run-id <id> [--max-sources N] [--max-cost-usd N] [--dry-run]');
    console.error('   or: --all-existing-p102-runs [--max-cost-usd N] [--dry-run]');
    process.exit(2);
  }
  if (!args.dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set. Set it before running:\n  export ANTHROPIC_API_KEY=sk-ant-...\nThen re-run, or use --dry-run to inspect the request shape without calling the API.');
    process.exit(2);
  }

  const client = new Anthropic();
  console.log(`[model-reader] starting (${args.runIds.length} runs, dry-run=${args.dryRun}, maxSources=${args.maxSources ?? '∞'}, maxCostUsd=${args.maxCostUsd ?? '∞'})`);
  console.log(`[model-reader] model: ${MODEL}`);

  const results: ProcessedRun[] = [];
  let totalCost = 0;
  for (const runId of args.runIds) {
    const runFolder = path.join(RUNS_ROOT, runId);
    if (!fs.existsSync(runFolder)) { console.error(`[model-reader] missing: ${runFolder}`); continue; }
    const r = await processRun(client, runFolder, { maxSources: args.maxSources, maxCostUsd: args.maxCostUsd === undefined ? undefined : args.maxCostUsd - totalCost, dryRun: args.dryRun });
    results.push(r);
    totalCost += r.totalUsage.costUsd;
    if (args.maxCostUsd !== undefined && totalCost > args.maxCostUsd) {
      console.error(`[model-reader] global cost cap hit ($${totalCost.toFixed(4)})`);
      break;
    }
  }

  console.log('\n[model-reader] summary:');
  for (const r of results) {
    console.log(`  ${r.runId} (${r.canonicalName}): ${r.sourcesProcessed} sources processed, ${r.cacheHits} response-cache hits`);
    console.log(`    claims: ${r.modelClaimsQuoteVerified} verified, ${r.modelClaimsRejectedQuote} rejected (quote unverified)`);
    console.log(`    by visibility: ${Object.entries(r.modelClaimsByVisibility).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`);
    console.log(`    usage: input=${r.totalUsage.inputTokens}, cacheRead=${r.totalUsage.cacheReadTokens}, cacheWrite=${r.totalUsage.cacheWriteTokens}, output=${r.totalUsage.outputTokens}, cost=$${r.totalUsage.costUsd.toFixed(4)}`);
  }
  console.log(`\n[model-reader] total estimated cost: $${totalCost.toFixed(4)}`);
}

main().catch(e => {
  console.error('[model-reader] fatal:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
