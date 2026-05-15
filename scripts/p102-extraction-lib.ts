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
  /\binternational\s+observer/i,
  /\bvisiting\s+observer/i,
  /\bclinical\s+observer/i,
  /\bobserver\s+(role|opportunity|application)/i,
  /\bIMG\s+observership/i,
];

export const USCE_VSM_PATTERNS: RegExp[] = [
  /\bvisiting\s+medical\s+student/i,
  /\bvisiting\s+student/i,
  /\baway\s+rotation/i,
  /\bclinical\s+elective/i,
  /\bfourth[-\s]year\s+elective/i,
  /\bsenior\s+elective/i,
  /\bsub[-\s]?internship/i,
  /\bsub[-\s]?I\b/i,
  /\bacting\s+internship/i,
  /\bacting\s+intern\b/i,
  /\bVSLO\b/,
  /\bVSAS\b/,
  /\binternational\s+(medical\s+)?(student|exchange)\s+program/i,
  /\bISP\b/,
  /\bvisiting\s+clerkship/i,
  /\baudition\s+rotation/i,
  /\baway\s+elective/i,
  // P102-FIX: positive-control evidence-derived patterns. MSK uses "Medical
  // Student Elective Program", Orlando uses "clerkship programs", Houston
  // Methodist uses "medical student rotations". Each phrase is required to
  // contain "medical student" + an opportunity word, OR "clerkship program",
  // to keep specificity high. Bare "elective" or "rotation" are intentionally
  // NOT added — they would over-promote GME/fellowship content.
  /\bmedical\s+student\s+elective/i,
  /\belective\s+for\s+medical\s+student/i,
  /\bmedical\s+student\s+rotation/i,
  /\bclerkship\s+program/i,
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
  /\bwe\s+do\s+not\s+(host|accept|sponsor)\s+(visiting|international)\s+(students|graduates)/i,
  /\bdoes\s+not\s+(offer|host)\s+(observerships?|visiting\s+student)/i,
  /\bobservership\s+(program\s+)?(is|are)\s+(no\s+longer|not\s+currently)\s+(offered|available|accepting)/i,
  /\bunable\s+to\s+(host|accept|accommodate)\s+(observers|visiting)/i,
  /\bwe\s+have\s+(closed|suspended|paused)\s+our\s+observership/i,
];

export const NEGATIVE_MEDIUM_PATTERNS: RegExp[] = [
  /\bonly\s+(enrolled\s+)?(at\s+)?affiliated\s+(institutions|schools)/i,
  /\bonly\s+(LCME|COCA)\b/i,
  /\bVSLO\s+only/i,
  /\bU\.?S\.?\s+(MD|DO)\s+(students\s+)?only/i,
  /\bstudents\s+(enrolled\s+)?at\s+LCME\b/i,
  /\bcurrently\s+enrolled\s+(US|U\.?S\.?|American)/i,
  /\bonly\s+available\s+to\s+(students\s+)?(from|at)\s+affiliated/i,
  /\brestricted\s+to\s+(students\s+)?(enrolled|affiliated)/i,
  /\b(no|not)\s+IMG\s+(observership|elective|rotation)/i,
];

export const GME_PATTERNS: RegExp[] = [
  /\b(residency\s+program|fellowship\s+program)\b/i,
  /\bgraduate\s+medical\s+education\b/i,
  /\bACGME[-\s]accredited\b/i,
  /\bACGME\b/,
  /\bERAS\b/,
  /\bNRMP\b/,
  /\bresidency\s+training/i,
  /\bfellowship\s+training/i,
  /\bPGY[-\s]?[12345]\b/i,
  /\b(internal\s+medicine|emergency\s+medicine|pediatrics|surgery|family\s+medicine|psychiatry|radiology|anesthesiology)\s+residency/i,
];

export const JOBS_VISA_PATTERNS: RegExp[] = [
  /\bphysician\s+careers?\b/i,
  /\bprovider\s+careers?\b/i,
  /\bfaculty\s+position/i,
  /\bfaculty\s+(opening|recruitment)/i,
  /\bhospitalist\s+(position|job)/i,
  /\battending\s+(position|opening)/i,
  /\bJ-1\s+(visa|waiver|sponsorship)/i,
  /\bH-1B\s+(visa|sponsorship)/i,
  /\bvisa\s+sponsorship\b/i,
  /\bphysician\s+recruitment/i,
  /\bnonclinical\s+(physician|career)/i,
  /\blocums?\s+tenens?/i,
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

  // P102-FIX: acronym-domain system fallback. When parentSystem is explicitly
  // set AND the source URL is on the institution's official host AND the
  // canonical name has more tokens than the parent name does (campus
  // differentiator), the page is system-level even when the domain is an
  // acronym whose tokens don't match the parent name (e.g., Memorial
  // Healthcare System on mhs.net, Sentara on sentara.com vs canonical
  // "Sentara Norfolk General Hospital"). Without this branch, acronym-domain
  // systems would default to INSTITUTION_SPECIFIC and incorrectly promote
  // system-level visiting-student claims to a specific campus. The trigger
  // is conservative: parentSystem must be set (typically by inferIdentity
  // from a curated registry), the src must match the official host exactly,
  // and the canonical name must contain campus tokens beyond the parent.
  if (ctx.parentSystem && srcHost === officialHost) {
    const parentTokens = ctx.parentSystem.toLowerCase().split(/[\s,-]+/).filter(t => t.length > 3 && !GENERIC_INSTITUTION_TOKENS.has(t));
    const canonicalHasNonParentToken = specificTokens.some(t => !parentTokens.includes(t));
    if (canonicalHasNonParentToken) return 'HEALTH_SYSTEM_LEVEL';
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
  /**
   * P102-FIX: optional content-tagged family emitted by the deep model
   * (A1/A2). `sourceFamily` describes how the page was discovered
   * (`JSON_LD`, `FIXED_PATH`, `SITEMAP`, ...) — it is provenance, not
   * content. `deepSourceFamily` describes what the page actually contains
   * after the model has read it (`ELECTIVE`, `OBSERVERSHIP`,
   * `VISITING_STUDENT`, `GME`, `CAREERS`, ...). When present, the
   * classifier uses both: a Tier 1 deep family + USCE-positive lane +
   * institution-specific scope + HIGH confidence is allowed to promote
   * to PUBLIC_SAFE_USCE even when `sourceFamily` is a discovery-only tag.
   */
  deepSourceFamily?: string | null;
  sourceScope: string;
  matchedLane: 'IMG_OBSERVERSHIP' | 'VISITING_MEDICAL_STUDENT' | 'RESEARCH_OPPORTUNITY' | 'NO_PUBLIC_OPPORTUNITY_FOUND' | 'CAREERS_PAGE' | 'RESIDENCY_PROGRAM_INFO' | 'FELLOWSHIP_PROGRAM_INFO' | 'PHYSICIAN_SERVICES';
  campusApplicabilityProof?: string | null;
  modelReaderConfidence?: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  /**
   * P102-FIX: true when the underlying claim quote is `NOT_STATED_ON_SOURCE`,
   * i.e. the claim is a MISSING_FIELD honest-absence marker rather than a
   * real USCE offer. Such claims must never auto-promote to PUBLIC_SAFE_USCE
   * even when every other gate would allow it.
   */
  quoteIsNotStated?: boolean;
}

/**
 * P102-FIX: content-tagged deep families that signal Tier 1 USCE opportunity.
 * Emitted by the deep model on a per-claim basis. These names match the
 * model's deep-mode tagging vocabulary (see `p102-claude-cli-extractor.ts`
 * deep-mode prompt). Discovery-time families like JSON_LD / SITEMAP /
 * FIXED_PATH / HOMEPAGE_LINK are intentionally NOT in this set — they
 * describe how the URL was found, not what the page contains.
 */
const TIER_1_DEEP_FAMILIES = new Set([
  'ELECTIVE',
  'CLINICAL_ELECTIVE',
  'VISITING_STUDENT',
  'VISITING_MEDICAL_STUDENT',
  'OBSERVERSHIP',
  'EXTERNSHIP',
  'AWAY_ROTATION',
  'SUB_INTERNSHIP',
  'ACTING_INTERNSHIP',
  'MEDICAL_STUDENT_ROTATION',
  'UNDERGRADUATE_MEDICAL_EDUCATION',
  'INTERNATIONAL_VISITING_STUDENT',
  // MEDICAL_EDUCATION is broader (covers UME hub pages); kept here so model
  // can promote when the lane is unambiguously USCE-positive and the
  // scope is INSTITUTION_SPECIFIC, but the lane gate above will catch
  // anything that's actually GME/residency/fellowship/careers content
  // before the family check runs.
  'MEDICAL_EDUCATION',
]);

/**
 * Deterministic visibility assignment.
 *
 * Rules (in evaluation order — first match wins):
 *
 * 1. Future-lane source families (GME/RESIDENCY/FELLOWSHIP/CAREERS) → FUTURE_LANE_ONLY.
 * 2. System/school scope on USCE-positive match → HUMAN_REVIEW_REQUIRED
 *    (unless `campusApplicabilityProof` present).
 * 3. Future-lane lanes (CAREERS_PAGE / RESIDENCY_PROGRAM_INFO /
 *    FELLOWSHIP_PROGRAM_INFO / PHYSICIAN_SERVICES) → FUTURE_LANE_ONLY.
 * 4. NO_PUBLIC_OPPORTUNITY_FOUND lane → HUMAN_REVIEW_REQUIRED.
 * 5. **P102-FIX**: `isAppropriateFamily` is widened to accept any of:
 *    - `sourceFamily` ∈ {OBSERVERSHIP_PAGE, VISITING_STUDENT_PAGE, RESEARCH_PAGE}
 *      (discovery-time A0 classification), OR
 *    - `deepSourceFamily` ∈ TIER_1_DEEP_FAMILIES (model-emitted content
 *      classification — `ELECTIVE`, `OBSERVERSHIP`, `VISITING_STUDENT`, etc.)
 *    If neither holds → CAUTION_SAFE_INTERNAL_REVIEW.
 * 6. USCE-positive + appropriate family + INSTITUTION_SPECIFIC/CAMPUS_SPECIFIC
 *    + model HIGH confidence → PUBLIC_SAFE_USCE.
 * 7. Otherwise → CAUTION_SAFE_INTERNAL_REVIEW.
 *
 * Rationale: `sourceFamily` is discovery method, not content category. A page
 * found via JSON-LD or sitemap can still be a real visiting-student elective
 * page. The model's `deepSourceFamily` field describes the actual content;
 * the classifier consults it as a fallback when the discovery-time
 * `sourceFamily` is a generic tag like JSON_LD / FIXED_PATH / SITEMAP.
 *
 * Safety gates 1-4 remain unchanged — only the family check in step 5 is
 * widened. Existing behavior for GME / careers / system-level / off-domain
 * is preserved.
 */
export function classifyVisibility(input: VisibilityInput): { visibility: Visibility; notPublicReason: string | null } {
  const { sourceFamily, deepSourceFamily, sourceScope, matchedLane, campusApplicabilityProof, modelReaderConfidence, quoteIsNotStated } = input;

  // P102-FIX: NOT_STATED_ON_SOURCE quotes are honest absence markers
  // (MISSING_FIELD claim type). They are quote-verified as "absent" but they
  // do not assert a USCE opportunity exists — they record that a specific
  // detail (duration, fee, contact, ...) was NOT stated on the source page.
  // They must never auto-promote to PUBLIC_SAFE_USCE.
  if (quoteIsNotStated) {
    return { visibility: 'HUMAN_REVIEW_REQUIRED', notPublicReason: 'NOT_STATED_ON_SOURCE absence marker; missing field requires human follow-up' };
  }

  // P102-FIX: when sourceFamily is a future-lane discovery tag (GME_PAGE,
  // RESIDENCY_PAGE, etc.) BUT the model's content tag is a Tier 1 USCE
  // family (VISITING_STUDENT, ELECTIVE, OBSERVERSHIP, ...), the content tag
  // wins. Orlando Health hosts its visiting-medical-student clerkship page
  // at /medical-professionals/graduate-medical-education/clerkship-programs,
  // which the URL-based A0 classifier tags as GME_PAGE but whose actual
  // content is a Tier 1 VISITING_STUDENT page. The discovery tag is a hint,
  // not a verdict — defer to the content tag when the model has read the
  // page and emitted a deep family.
  const isDeepFamilyTier1 = !!deepSourceFamily && TIER_1_DEEP_FAMILIES.has(deepSourceFamily);
  if (FUTURE_LANE_SOURCE_FAMILIES.has(sourceFamily) && !isDeepFamilyTier1) {
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

  // P102-FIX: widen appropriate-family check to include content-tagged deep
  // families. sourceFamily is discovery method (JSON_LD, FIXED_PATH, etc.);
  // deepSourceFamily is content category (ELECTIVE, OBSERVERSHIP, etc.).
  // Either signal is enough to consider the page appropriate for Tier 1
  // promotion, subject to all the other gates above.
  const isSourceFamilyAppropriate =
    sourceFamily === 'OBSERVERSHIP_PAGE' ||
    sourceFamily === 'VISITING_STUDENT_PAGE' ||
    sourceFamily === 'RESEARCH_PAGE';
  const isDeepFamilyAppropriate =
    !!deepSourceFamily && TIER_1_DEEP_FAMILIES.has(deepSourceFamily);
  const isAppropriateFamily = isSourceFamilyAppropriate || isDeepFamilyAppropriate;

  if (!isAppropriateFamily) {
    return { visibility: 'CAUTION_SAFE_INTERNAL_REVIEW', notPublicReason: `USCE keyword detected on ${sourceFamily}${deepSourceFamily ? ` (deepSourceFamily=${deepSourceFamily})` : ''}; not the expected page family — needs review` };
  }

  // P102-FIX: DEPARTMENT_LEVEL is set by the A0 classifier as a conservative
  // placeholder for GME-family URLs. When the model has read the page and
  // confirmed Tier 1 USCE content (deepSourceFamily ∈ TIER_1_DEEP_FAMILIES),
  // a department-specific scope is still a legitimate INSTITUTION_SPECIFIC
  // opportunity — e.g., "Cardiology Visiting Student Program at Orlando
  // Health". The published claim carries the specific specialty context in
  // its quote; the visibility lane simply needs to permit publication.
  const isPromotableScope =
    sourceScope === 'INSTITUTION_SPECIFIC' ||
    sourceScope === 'CAMPUS_SPECIFIC' ||
    (sourceScope === 'DEPARTMENT_LEVEL' && isDeepFamilyTier1);

  if (modelReaderConfidence === 'HIGH' && isPromotableScope) {
    return { visibility: 'PUBLIC_SAFE_USCE', notPublicReason: null };
  }

  return { visibility: 'CAUTION_SAFE_INTERNAL_REVIEW', notPublicReason: 'P102-0C deterministic detection; needs model A1/A2 reader (P102-0D) for PUBLIC_SAFE_USCE promotion' };
}

// -------------------- robots.txt URL filter --------------------

/**
 * Check whether a path is disallowed by robots.txt directives for the
 * default user-agent.
 *
 * Simple implementation:
 *   - For each Disallow line, if the path starts with the disallowed prefix
 *     AND no overriding Allow has a longer matching prefix, the path is disallowed.
 *   - Disallow of "/" is treated as "block everything below" — but a paired
 *     Allow of "/" overrides. (Real robots.txt parsers handle "user-agent: *"
 *     scoping; this simple version assumes the disallows/allows lists were
 *     already filtered for the relevant UA, which the runner's A0 does.)
 */
export function isPathDisallowedByRobots(
  pathToCheck: string,
  disallows: string[],
  allows: string[],
): boolean {
  // Normalize: ensure leading /, no query/fragment
  const p = pathToCheck.replace(/[?#].*$/, '');
  // Empty Disallow ("Disallow:" with no value) means "allow all" — treat as no rule.
  const validDisallows = disallows.filter(d => d && d !== '');
  if (validDisallows.length === 0) return false;

  // Longest matching rule wins (per the de-facto spec).
  let longestDisallow = '';
  for (const d of validDisallows) {
    if (matchesRobotsPrefix(p, d) && d.length > longestDisallow.length) longestDisallow = d;
  }
  if (longestDisallow === '') return false;

  let longestAllow = '';
  for (const a of allows) {
    if (!a || a === '') continue;
    if (matchesRobotsPrefix(p, a) && a.length > longestAllow.length) longestAllow = a;
  }
  // If an Allow exists with longer prefix than the Disallow, the path is allowed.
  if (longestAllow.length > longestDisallow.length) return false;
  return true;
}

/**
 * Match a path against a robots.txt prefix rule. Robots.txt supports:
 *   - prefix matching: "/admin" matches "/admin", "/admin/foo"
 *   - wildcards: "*" matches anything (not implemented here; conservative
 *     enough for our purposes)
 *   - end-of-string: "$" (also not implemented here)
 *
 * We do simple prefix matching only.
 */
function matchesRobotsPrefix(testPath: string, rulePrefix: string): boolean {
  if (rulePrefix === '/') return true;
  return testPath.startsWith(rulePrefix);
}

// -------------------- Sitemap XML parsing --------------------

export interface SitemapParseResult {
  type: 'urlset' | 'sitemapindex' | 'unknown';
  entries: string[];
}

/**
 * Parse a sitemap.xml body. Detects whether it is a sitemapindex (pointing
 * to child sitemaps) or a urlset (pointing to actual URLs).
 *
 * The runner uses this to decide whether to recurse into child sitemaps or
 * treat <loc> entries as candidate URLs directly.
 */
export function parseSitemapXml(body: string): SitemapParseResult {
  // Detect type by root element. Both formats use <loc>; the wrapping element differs.
  const hasSitemapIndex = /<sitemapindex\b[^>]*>/i.test(body);
  const hasUrlset = /<urlset\b[^>]*>/i.test(body);
  const locs = Array.from(body.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)).map(m => m[1]);
  if (hasSitemapIndex && !hasUrlset) return { type: 'sitemapindex', entries: locs };
  if (hasUrlset && !hasSitemapIndex) return { type: 'urlset', entries: locs };
  if (hasSitemapIndex && hasUrlset) return { type: 'sitemapindex', entries: locs }; // ambiguous: prefer index
  if (locs.length > 0) return { type: 'urlset', entries: locs }; // best guess
  return { type: 'unknown', entries: [] };
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

// -------------------- PDF text extraction cascade (P102-0AD) --------------------

/**
 * PDF cascade status string used in source records.
 */
export type PdfStatus =
  | 'NOT_PDF'
  | 'PDF_TEXT_EXTRACTED'
  | 'PDF_TEXT_EMPTY_RENDER_PENDING'
  | 'PDF_OCR_UNAVAILABLE'
  | 'PDF_FAILED'
  | 'PDF_BINARY_NOT_AVAILABLE';

/**
 * Result of a PDF text extraction attempt.
 */
export interface PdfExtractResult {
  status: PdfStatus;
  text: string | null;
  byteSize: number;
  pageCount: number | null;
  errorMessage: string | null;
  toolChainUsed: 'pdftotext' | 'pdftoppm+ocr' | 'none';
}

/**
 * Decide which tool chain to use to extract text from a PDF, given which
 * binaries are available. Pure decision function; doesn't shell out.
 *
 * Returns the toolchain plus a reason.
 */
export function decidePdfToolChain(toolsAvailable: { pdftotext: boolean; pdftoppm: boolean; tesseract: boolean }): { toolChain: 'pdftotext' | 'pdftoppm+ocr' | 'none'; reason: string } {
  if (toolsAvailable.pdftotext) return { toolChain: 'pdftotext', reason: 'pdftotext binary available; direct text extraction' };
  if (toolsAvailable.pdftoppm && toolsAvailable.tesseract) return { toolChain: 'pdftoppm+ocr', reason: 'pdftoppm + tesseract available; render + OCR cascade' };
  if (toolsAvailable.pdftoppm && !toolsAvailable.tesseract) return { toolChain: 'none', reason: 'pdftoppm available but tesseract missing; cannot extract text from image-only PDFs' };
  return { toolChain: 'none', reason: 'no PDF text-extraction tools available' };
}

/**
 * Decide the right PdfStatus given an extraction result.
 */
export function determinePdfStatus(
  extracted: string | null,
  toolChain: 'pdftotext' | 'pdftoppm+ocr' | 'none',
  toolError: string | null,
): PdfStatus {
  if (toolError && !extracted) return 'PDF_FAILED';
  if (toolChain === 'none') return 'PDF_BINARY_NOT_AVAILABLE';
  if (extracted && extracted.trim().length > 50) return 'PDF_TEXT_EXTRACTED';
  if (toolChain === 'pdftotext' && (!extracted || extracted.trim().length < 50)) {
    // pdftotext found nothing meaningful → likely image-only PDF.
    // Need OCR. If we lack tesseract, mark as unavailable.
    return 'PDF_OCR_UNAVAILABLE';
  }
  if (extracted && extracted.trim().length === 0) return 'PDF_TEXT_EMPTY_RENDER_PENDING';
  return 'PDF_FAILED';
}

// -------------------- Source-family registry classifier (P102-0X) --------------------

export interface SourceFamilyRegistryEntry {
  family: string;
  priority: number;
  urlKeywords: string[];
  titleKeywords: string[];
}

export interface SourceFamilyRegistry {
  schemaVersion: string;
  registry: SourceFamilyRegistryEntry[];
}

/**
 * Classify a source URL + title using a registry of family definitions.
 * Returns the family with the lowest priority value among matching entries.
 *
 * The registry is intended to live as JSON at
 * docs/.../p102/specs/p102_source_family_registry.json, loaded by the runner.
 *
 * This function is pure; pass the parsed registry in.
 */
export function classifySourceFamilyFromRegistry(
  url: string,
  title: string | null,
  registry: SourceFamilyRegistry,
): { family: string; matchedEntry: SourceFamilyRegistryEntry | null; matchedOn: 'url' | 'title' | 'none' } {
  const u = url.toLowerCase();
  const t = (title ?? '').toLowerCase();

  let best: { family: string; matchedEntry: SourceFamilyRegistryEntry; matchedOn: 'url' | 'title' } | null = null;
  for (const entry of registry.registry) {
    if (entry.family === 'OTHER') continue;
    const urlMatch = entry.urlKeywords.some(kw => kw && u.includes(kw.toLowerCase()));
    const titleMatch = entry.titleKeywords.some(kw => kw && t.includes(kw.toLowerCase()));
    if (urlMatch || titleMatch) {
      if (best === null || entry.priority < best.matchedEntry.priority) {
        best = { family: entry.family, matchedEntry: entry, matchedOn: urlMatch ? 'url' : 'title' };
      }
    }
  }
  return best ?? { family: 'OTHER', matchedEntry: null, matchedOn: 'none' };
}

// -------------------- Negative-evidence strength --------------------

export function negativeStrength(sourceScope: string): 'STRONG' | 'MEDIUM' | 'WEAK' {
  if (sourceScope === 'INSTITUTION_SPECIFIC' || sourceScope === 'CAMPUS_SPECIFIC') return 'STRONG';
  if (sourceScope === 'HEALTH_SYSTEM_LEVEL' || sourceScope === 'MEDICAL_SCHOOL_LEVEL') return 'MEDIUM';
  return 'WEAK';
}
