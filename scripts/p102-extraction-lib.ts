/**
 * P102 extraction library — pure functions extracted from
 * p102-extract-claims-from-run.ts so they can be exercised by tests
 * without spawning subprocesses or fetching files.
 *
 * No network. No Agent. No file I/O. Pure transforms over strings.
 */

export const SCHEMA_VERSION = 'p102-0r-1';
export const NOT_STATED = 'NOT_STATED_ON_SOURCE';

export const FUTURE_LANE_SOURCE_FAMILIES = new Set<string>([
  'GME_PAGE', 'RESIDENCY_PAGE', 'FELLOWSHIP_PAGE',
  'CAREERS_PAGE', 'JOBS_PAGE',
]);

export const SYSTEM_OR_SCHOOL_SCOPES = new Set<string>([
  'HEALTH_SYSTEM_LEVEL', 'MEDICAL_SCHOOL_LEVEL',
]);

// -------------------- Concept-detector patterns --------------------

export const USCE_OBSERVERSHIP_PATTERNS: RegExp[] = [
  /\bobservership\b/i,
  /\bobservership\s+program\b/i,
  /\bclinical\s+observership\b/i,
  /\bclinical\s+observer\s+program\b/i,
  /\bphysician\s+observer\b/i,
];

export const USCE_VSM_PATTERNS: RegExp[] = [
  /\bvisiting\s+medical\s+student/i,
  /\bvisiting\s+student/i,
  /\baway\s+rotation/i,
  /\bclinical\s+elective/i,
  /\bfourth[-\s]year\s+elective/i,
  /\bsenior\s+elective/i,
  /\bsub[-\s]?internship/i,
  /\bacting\s+internship/i,
  /\bVSLO\b/,
  /\bVSAS\b/,
];

export const USCE_RESEARCH_PATTERNS: RegExp[] = [
  /\bmedical\s+student\s+research/i,
  /\bstudent\s+research\s+(program|opportunity|fellowship)/i,
];

export const USCE_SHADOW_VOLUNTEER_PATTERNS: RegExp[] = [
  /\bshadowing\s+(program|opportunity)\b/i,
  /\bstudent\s+volunteer/i,
  /\bclinical\s+shadow/i,
];

export const NEGATIVE_STRONG_PATTERNS: RegExp[] = [
  /\bdo\s+not\s+(offer|accept|sponsor|host)\s+observership/i,
  /\bdo\s+not\s+offer\s+clinical\s+observership/i,
  /\bnot\s+accepting\s+observers/i,
  /\bno\s+observership\s+(program|opportunity)/i,
  /\bno\s+shadowing\s+(program|opportunity)/i,
  /\bwe\s+do\s+not\s+offer\s+(visiting|clinical)\s+elective/i,
  /\bnot\s+available\s+to\s+international\s+(medical\s+)?(students|graduates)/i,
];

export const NEGATIVE_MEDIUM_PATTERNS: RegExp[] = [
  /\bonly\s+(enrolled\s+)?(at\s+)?affiliated\s+(institutions|schools)/i,
  /\bonly\s+(LCME|COCA)\b/i,
  /\bVSLO\s+only/i,
  /\bU\.?S\.?\s+(MD|DO)\s+(students\s+)?only/i,
];

export const GME_PATTERNS: RegExp[] = [
  /\b(residency\s+program|fellowship\s+program)\b/i,
  /\bgraduate\s+medical\s+education\b/i,
  /\bACGME[-\s]accredited\b/i,
  /\bERAS\b/,
  /\bNRMP\b/,
];

export const JOBS_VISA_PATTERNS: RegExp[] = [
  /\bphysician\s+careers?\b/i,
  /\bprovider\s+careers?\b/i,
  /\bfaculty\s+position/i,
  /\bhospitalist\s+(position|job)/i,
  /\bJ-1\s+(visa|waiver|sponsorship)/i,
  /\bH-1B\s+(visa|sponsorship)/i,
  /\bvisa\s+sponsorship\b/i,
];

export const SERVICES_PATTERNS: RegExp[] = [
  /\bmalpractice\s+insurance/i,
  /\bdisability\s+(insurance|coverage)\b/i,
  /\bphysician\s+mortgage/i,
  /\blocums?\s+tenens?/i,
];

// -------------------- Sentence matching --------------------

export interface DetectorMatch { sentence: string; matched: string }

export function findSentenceMatches(text: string, patterns: RegExp[]): DetectorMatch[] {
  const out: DetectorMatch[] = [];
  const sentences = text.split(/(?<=[.!?])\s+|\n\n+/).map(s => s.trim()).filter(Boolean);
  for (const s of sentences) {
    for (const pat of patterns) {
      const m = s.match(pat);
      if (m) { out.push({ sentence: s.slice(0, 500), matched: m[0] }); break; }
    }
  }
  return out;
}

// -------------------- Quote verification --------------------

export function normalizeForQuoteMatch(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

export function isQuoteVerifiable(quote: string, cleanedText: string): boolean {
  if (!quote || quote === NOT_STATED) return false;
  return normalizeForQuoteMatch(cleanedText).includes(normalizeForQuoteMatch(quote));
}

// -------------------- Source-scope inference --------------------

export interface InstitutionContext {
  institutionId: string;
  canonicalName: string;
  officialDomain: string;
  parentSystem: string | null;
}

export interface SourceLike {
  sourceDomain: string;
  sourceScope: string;
  sourceFamily: string;
  sourceUrl: string;
}

/**
 * Generic medical-institution tokens that should NOT be treated as campus
 * identifiers when inferring source scope. "Hospital" appearing in a canonical
 * name like "Houston Methodist Hospital" is not a campus distinguisher — only
 * a place name like "Orlando" or "Brooklyn" is.
 */
const GENERIC_INSTITUTION_TOKENS = new Set<string>([
  'hospital', 'hospitals', 'center', 'centers', 'centre', 'medical', 'health',
  'healthcare', 'university', 'college', 'system', 'systems', 'clinic', 'clinics',
  'group', 'foundation', 'institute', 'school', 'academic',
  // articles / connectors
  'the', 'and', 'of', 'at', 'for',
]);

export function inferSourceScope(source: SourceLike, ctx: InstitutionContext): string {
  if (source.sourceScope && source.sourceScope !== 'UNKNOWN_SCOPE') return source.sourceScope;

  const officialHost = ctx.officialDomain.replace(/^www\./, '');
  const srcHost = (source.sourceDomain ?? '').replace(/^www\./, '');

  // Tokenize canonical name; keep only specific tokens (>3 chars, not generic).
  const rawTokens = ctx.canonicalName.toLowerCase().split(/[\s,-]+/);
  const specificTokens = rawTokens.filter(t => t.length > 3 && !GENERIC_INSTITUTION_TOKENS.has(t));
  const domainTokens = officialHost.toLowerCase().split(/[.-]/);

  // Partition canonical-name tokens by whether they appear (substring either way)
  // in any domain token.
  const inDomain = specificTokens.filter(t => domainTokens.some(d => d.includes(t) || t.includes(d)));
  const notInDomain = specificTokens.filter(t => !domainTokens.some(d => d.includes(t) || t.includes(d)));

  // HEALTH_SYSTEM_LEVEL only when (a) we have positive evidence the domain reflects
  // the parent/system name (at least one canonical token matches the domain) AND
  // (b) we have additional canonical tokens that DON'T match (campus differentiators).
  // E.g., "AdventHealth Orlando" + adventhealth.com → "adventhealth" in domain,
  // "orlando" not → SYSTEM. "Brooklyn Hospital Center" + tbh.org → no tokens in
  // domain at all (acronym) → falls through to default INSTITUTION_SPECIFIC.
  if (inDomain.length >= 1 && notInDomain.length >= 1 && srcHost === officialHost) {
    return 'HEALTH_SYSTEM_LEVEL';
  }

  // parentSystem evidence override: if explicitly set and the domain matches the
  // parent name (not the campus name), treat as HEALTH_SYSTEM_LEVEL.
  if (ctx.parentSystem && srcHost === officialHost) {
    const parentTokens = ctx.parentSystem.toLowerCase().split(/[\s,-]+/).filter(t => t.length > 3 && !GENERIC_INSTITUTION_TOKENS.has(t));
    const parentInDomain = parentTokens.some(p => domainTokens.some(d => d.includes(p) || p.includes(d)));
    const canonicalHasNonParentToken = specificTokens.some(t => !parentTokens.some(p => p === t));
    if (parentInDomain && canonicalHasNonParentToken && notInDomain.length >= 1) return 'HEALTH_SYSTEM_LEVEL';
  }

  if (srcHost === officialHost || srcHost.endsWith('.' + officialHost)) return 'INSTITUTION_SPECIFIC';

  return 'UNKNOWN_SCOPE';
}

// -------------------- Visibility classifier --------------------

export type Visibility =
  | 'PUBLIC_SAFE_USCE'
  | 'CAUTION_SAFE_INTERNAL_REVIEW'
  | 'FUTURE_LANE_ONLY'
  | 'HIDDEN_REJECTED'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY';

export interface VisibilityInput {
  sourceFamily: string;
  sourceScope: string;
  matchedLane: 'IMG_OBSERVERSHIP' | 'VISITING_MEDICAL_STUDENT' | 'RESEARCH_OPPORTUNITY' | 'NO_PUBLIC_OPPORTUNITY_FOUND' | 'CAREERS_PAGE' | 'RESIDENCY_PROGRAM_INFO' | 'FELLOWSHIP_PROGRAM_INFO' | 'PHYSICIAN_SERVICES';
  campusApplicabilityProof?: string | null;
  modelReaderConfidence?: 'HIGH' | 'MEDIUM' | 'LOW' | null;
}

/**
 * Deterministic visibility assignment.
 *
 * Rules:
 * - Future-lane source families (GME/RESIDENCY/FELLOWSHIP/CAREERS) → FUTURE_LANE_ONLY.
 * - System/school scope on USCE-positive match → HUMAN_REVIEW_REQUIRED (unless campusApplicabilityProof present).
 * - USCE-positive on OBSERVERSHIP_PAGE/VISITING_STUDENT_PAGE/RESEARCH_PAGE with INSTITUTION_SPECIFIC scope:
 *   - Without model reader → CAUTION_SAFE_INTERNAL_REVIEW (P102-0C deterministic baseline).
 *   - With model reader HIGH confidence + scope OK → PUBLIC_SAFE_USCE (reserved for P102-0D).
 * - Shadow/volunteer or NO_PUBLIC lane → HUMAN_REVIEW_REQUIRED.
 */
export function classifyVisibility(input: VisibilityInput): { visibility: Visibility; notPublicReason: string | null } {
  const { sourceFamily, sourceScope, matchedLane, campusApplicabilityProof, modelReaderConfidence } = input;

  if (FUTURE_LANE_SOURCE_FAMILIES.has(sourceFamily)) {
    return { visibility: 'FUTURE_LANE_ONLY', notPublicReason: `source family ${sourceFamily} is future-lane only` };
  }

  if (SYSTEM_OR_SCHOOL_SCOPES.has(sourceScope) && !campusApplicabilityProof) {
    return { visibility: 'HUMAN_REVIEW_REQUIRED', notPublicReason: `source scope ${sourceScope} cannot prove campus-specific availability without campusApplicabilityProof` };
  }

  if (matchedLane === 'CAREERS_PAGE' || matchedLane === 'RESIDENCY_PROGRAM_INFO' || matchedLane === 'FELLOWSHIP_PROGRAM_INFO' || matchedLane === 'PHYSICIAN_SERVICES') {
    return { visibility: 'FUTURE_LANE_ONLY', notPublicReason: 'lane is future-lane only' };
  }

  if (matchedLane === 'NO_PUBLIC_OPPORTUNITY_FOUND') {
    return { visibility: 'HUMAN_REVIEW_REQUIRED', notPublicReason: 'shadow/volunteer is not auto-USCE; human review required' };
  }

  // USCE-positive lanes (OBSERVERSHIP, VSM, RESEARCH) on appropriate page families
  const isAppropriateFamily = sourceFamily === 'OBSERVERSHIP_PAGE' || sourceFamily === 'VISITING_STUDENT_PAGE' || sourceFamily === 'RESEARCH_PAGE';
  if (!isAppropriateFamily) {
    return { visibility: 'CAUTION_SAFE_INTERNAL_REVIEW', notPublicReason: `USCE keyword detected on ${sourceFamily}; not the expected page family — needs review` };
  }

  if (modelReaderConfidence === 'HIGH' && (sourceScope === 'INSTITUTION_SPECIFIC' || sourceScope === 'CAMPUS_SPECIFIC')) {
    return { visibility: 'PUBLIC_SAFE_USCE', notPublicReason: null };
  }

  return { visibility: 'CAUTION_SAFE_INTERNAL_REVIEW', notPublicReason: 'P102-0C deterministic detection; needs model A1/A2 reader (P102-0D) for PUBLIC_SAFE_USCE promotion' };
}

// -------------------- HTML → text v2 (strips boilerplate) --------------------

/**
 * Aggressive HTML → text conversion that drops common navigation chrome.
 *
 * Differences from v1 (in p102-discovery-runner.ts):
 *  - Drops <nav>, <header>, <footer>, <aside>, role="navigation" blocks.
 *  - Drops elements with class names matching common nav/menu/footer/sidebar.
 *  - When a <main>, <article>, or role="main" exists, restricts to that subtree.
 *  - Preserves paragraph breaks better.
 */
export function htmlToTextV2(html: string): string {
  let s = html;
  // Remove script/style/noscript/comments first.
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');

  // Try to extract <main>, <article>, or role="main" subtree.
  const mainMatch = s.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)
    ?? s.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)
    ?? s.match(/<[^>]+role=["']main["'][^>]*>([\s\S]*?)<\/[^>]+>/i);
  if (mainMatch) s = mainMatch[1];

  // Remove nav / header / footer / aside elements entirely (block-level).
  s = s.replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ');
  s = s.replace(/<header\b[\s\S]*?<\/header>/gi, ' ');
  s = s.replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ');
  s = s.replace(/<aside\b[\s\S]*?<\/aside>/gi, ' ');
  // Anything with role="navigation" / "banner" / "complementary".
  s = s.replace(/<[^>]+role=["'](navigation|banner|complementary)["'][\s\S]*?<\/[^>]+>/gi, ' ');

  // Strip elements whose class or id strongly indicates boilerplate.
  // Match opening tag → consume innerHTML → closing tag. Conservative pattern;
  // skips if nested.
  const boilerplateClassRe = /<([a-z]+)[^>]*(class|id)=["'][^"']*(menu|navbar|nav-|sidebar|footer|header|breadcrumb|cookie|consent|skip-nav|skip-to-content|social-share|site-search|utility-nav|sub-nav|main-nav|primary-nav)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi;
  // Iterate a few times to clean nested boilerplate.
  for (let i = 0; i < 3; i++) {
    const before = s.length;
    s = s.replace(boilerplateClassRe, ' ');
    if (s.length === before) break;
  }

  // Now apply v1-style conversion to text.
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|li|h[1-6]|tr|article|section)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  // Decode entities (subset)
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\n\s*\n+/g, '\n\n');
  s = s.replace(/^\s+|\s+$/gm, '');
  return s.trim();
}

// -------------------- Source-family re-classification from content --------------------

/**
 * If a URL-based source family looks wrong given the actual content
 * (e.g., URL is /observership but the body is about pharmacy externships),
 * downgrade to OTHER. Conservative: never upgrades.
 */
export function reclassifySourceFamilyByContent(
  urlBasedFamily: string,
  cleanedText: string,
): { family: string; reason: string | null } {
  if (!cleanedText || cleanedText.length < 100) return { family: 'OTHER', reason: 'content_too_short' };
  const lower = cleanedText.toLowerCase();
  const hasObservership = USCE_OBSERVERSHIP_PATTERNS.some(p => p.test(cleanedText));
  const hasVisitingStudent = USCE_VSM_PATTERNS.some(p => p.test(cleanedText));
  const hasGme = GME_PATTERNS.some(p => p.test(cleanedText));
  const hasVolunteer = lower.includes('volunteer');
  const hasCareer = lower.includes('career') || lower.includes('job');

  switch (urlBasedFamily) {
    case 'OBSERVERSHIP_PAGE':
      if (!hasObservership) return { family: 'OTHER', reason: 'url_says_observership_but_content_has_no_observership_keyword' };
      return { family: 'OBSERVERSHIP_PAGE', reason: null };
    case 'VISITING_STUDENT_PAGE':
      if (!hasVisitingStudent && !hasObservership) return { family: 'OTHER', reason: 'url_says_visiting_student_but_content_has_neither_keyword' };
      return { family: 'VISITING_STUDENT_PAGE', reason: null };
    case 'GME_PAGE':
      if (!hasGme) return { family: 'OTHER', reason: 'url_says_gme_but_content_has_no_gme_keyword' };
      return { family: 'GME_PAGE', reason: null };
    case 'VOLUNTEER_PAGE':
      if (!hasVolunteer) return { family: 'OTHER', reason: 'url_says_volunteer_but_content_has_no_volunteer_keyword' };
      return { family: 'VOLUNTEER_PAGE', reason: null };
    case 'CAREERS_PAGE':
      if (!hasCareer) return { family: 'OTHER', reason: 'url_says_careers_but_content_has_no_career_keyword' };
      return { family: 'CAREERS_PAGE', reason: null };
    default:
      return { family: urlBasedFamily, reason: null };
  }
}

// -------------------- Negative-evidence strength --------------------

export function negativeStrength(sourceScope: string): 'STRONG' | 'MEDIUM' | 'WEAK' {
  if (sourceScope === 'INSTITUTION_SPECIFIC' || sourceScope === 'CAMPUS_SPECIFIC') return 'STRONG';
  if (sourceScope === 'HEALTH_SYSTEM_LEVEL' || sourceScope === 'MEDICAL_SCHOOL_LEVEL') return 'MEDIUM';
  return 'WEAK';
}
