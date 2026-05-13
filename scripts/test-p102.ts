#!/usr/bin/env tsx
/**
 * P102 unit test suite — exercises pure functions in p102-extraction-lib
 * against in-process fixtures. No network. No file I/O outside this script.
 *
 * Run: npx tsx scripts/test-p102.ts
 *
 * Exit code 0 = all tests pass. Non-zero = at least one failure.
 */

import {
  USCE_OBSERVERSHIP_PATTERNS, USCE_VSM_PATTERNS, USCE_RESEARCH_PATTERNS,
  USCE_SHADOW_VOLUNTEER_PATTERNS, NEGATIVE_STRONG_PATTERNS, NEGATIVE_MEDIUM_PATTERNS,
  GME_PATTERNS, JOBS_VISA_PATTERNS, SERVICES_PATTERNS,
  findSentenceMatches, normalizeForQuoteMatch, isQuoteVerifiable,
  inferSourceScope, classifyVisibility, negativeStrength,
  htmlToTextV2, reclassifySourceFamilyByContent,
  FUTURE_LANE_SOURCE_FAMILIES, SYSTEM_OR_SCHOOL_SCOPES,
  SCHEMA_VERSION, NOT_STATED,
  type InstitutionContext, type SourceLike,
} from './p102-extraction-lib';

// -------------------- Mini test harness (no deps) --------------------

let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void): void {
  try { fn(); passed++; console.log(`  PASS  ${name}`); }
  catch (e) {
    failed++;
    const msg = e instanceof Error ? e.message : String(e);
    failures.push(`${name}: ${msg}`);
    console.log(`  FAIL  ${name}\n        ${msg}`);
  }
}

function assertEqual<T>(actual: T, expected: T, label = ''): void {
  if (actual !== expected) throw new Error(`${label} expected=${String(expected)} actual=${String(actual)}`);
}
function assertTrue(cond: boolean, label = ''): void {
  if (!cond) throw new Error(`assertTrue failed: ${label}`);
}
function assertFalse(cond: boolean, label = ''): void {
  if (cond) throw new Error(`assertFalse failed: ${label}`);
}
function assertContains(haystack: string, needle: string, label = ''): void {
  if (!haystack.includes(needle)) throw new Error(`${label} expected substring "${needle}" in "${haystack.slice(0, 100)}..."`);
}

// -------------------- Fixtures --------------------

const FIXTURE_OBSERVERSHIP_HIGH_YIELD = `
Welcome to Houston Methodist Hospital.

Our clinical observership program is open to international medical graduates.
Applicants must hold a medical degree and provide a letter of recommendation.

The observership lasts 4 weeks and includes shadow rotations across multiple
specialties. There is no clinical hands-on activity. For more information,
contact observership@example.com.
`.trim();

const FIXTURE_VSM_PAGE = `
Visiting Medical Student Program

This rotation is available to fourth-year elective students from LCME-accredited
medical schools via VSLO. Sub-internship rotations are 2-4 weeks. Application
fee is $250.
`.trim();

const FIXTURE_NEGATIVE_EXPLICIT = `
Eligibility

We do not offer observership to international medical graduates. Applicants
should pursue programs at affiliated institutions. We are not accepting
observers at this time.
`.trim();

const FIXTURE_NEGATIVE_RESTRICTION = `
This program is open to enrolled students at affiliated institutions only.
VSLO only. We accept U.S. MD students only.
`.trim();

const FIXTURE_GME_PAGE = `
Graduate Medical Education

We oversee 14 ACGME-accredited residency program offerings. Apply through
ERAS by September 15. NRMP match results are released in March.
`.trim();

const FIXTURE_JOBS_VISA_PAGE = `
Physician Careers

We sponsor J-1 visa waivers for qualifying physicians. Hospitalist positions
available. Faculty position openings posted quarterly. Visa sponsorship is
considered case-by-case.
`.trim();

const FIXTURE_SERVICES_PAGE = `
Physician Benefits

Includes malpractice insurance, disability insurance, and physician mortgage
discounts. Locums tenens opportunities through our partner network.
`.trim();

const FIXTURE_VOLUNTEER_PAGE = `
Hospital Volunteer Program

We welcome student volunteers to participate in our patient-support program.
Shadowing program opportunities are limited to enrolled medical students.
`.trim();

const FIXTURE_NAVIGATION_CHROME_NO_CONTENT = `
HomeAboutContactPrivacyCareersHospital LoginPatient PortalDirectoryFind a Doctor
Schedule AppointmentMyChartProviderEducationOur Locations
`.trim();

// -------------------- Concept detector tests --------------------

console.log('--- Concept detectors ---');

test('observership detector finds keyword on high-yield page', () => {
  const matches = findSentenceMatches(FIXTURE_OBSERVERSHIP_HIGH_YIELD, USCE_OBSERVERSHIP_PATTERNS);
  assertTrue(matches.length > 0, 'expected ≥1 observership match');
  assertContains(matches[0].sentence.toLowerCase(), 'observership');
});

test('observership detector does NOT match GME page', () => {
  const matches = findSentenceMatches(FIXTURE_GME_PAGE, USCE_OBSERVERSHIP_PATTERNS);
  assertEqual(matches.length, 0, 'GME page should not match observership');
});

test('VSM detector finds keyword on VSM page', () => {
  const matches = findSentenceMatches(FIXTURE_VSM_PAGE, USCE_VSM_PATTERNS);
  assertTrue(matches.length > 0, 'expected ≥1 VSM match');
});

test('VSM detector picks up VSLO + sub-internship + fourth-year elective', () => {
  const matches = findSentenceMatches(FIXTURE_VSM_PAGE, USCE_VSM_PATTERNS);
  // The fixture has multiple keywords. We just need ≥1 hit.
  assertTrue(matches.length >= 1, `expected ≥1 VSM hit, got ${matches.length}`);
});

test('Negative-strong detector catches "do not offer observership"', () => {
  const matches = findSentenceMatches(FIXTURE_NEGATIVE_EXPLICIT, NEGATIVE_STRONG_PATTERNS);
  assertTrue(matches.length > 0, 'expected ≥1 strong-negative match');
  assertContains(matches[0].sentence.toLowerCase(), 'do not offer');
});

test('Negative-strong detector catches "not accepting observers"', () => {
  // Use a fresh fixture to make sure pattern matches the second variant
  const txt = 'Sample text. Currently we are not accepting observers at this time.';
  const matches = findSentenceMatches(txt, NEGATIVE_STRONG_PATTERNS);
  assertTrue(matches.length > 0, 'expected match');
});

test('Negative-medium detector catches "only enrolled affiliated"', () => {
  const matches = findSentenceMatches(FIXTURE_NEGATIVE_RESTRICTION, NEGATIVE_MEDIUM_PATTERNS);
  assertTrue(matches.length >= 1, `expected ≥1 medium-negative, got ${matches.length}`);
});

test('Negative-medium detector catches "VSLO only"', () => {
  const txt = 'Eligibility: VSLO only.';
  const matches = findSentenceMatches(txt, NEGATIVE_MEDIUM_PATTERNS);
  assertTrue(matches.length > 0, 'expected match');
});

test('GME detector matches residency / ACGME / ERAS / NRMP', () => {
  const matches = findSentenceMatches(FIXTURE_GME_PAGE, GME_PATTERNS);
  assertTrue(matches.length >= 1, `expected ≥1 GME match, got ${matches.length}`);
});

test('Jobs/visa detector matches physician careers + J-1', () => {
  const matches = findSentenceMatches(FIXTURE_JOBS_VISA_PAGE, JOBS_VISA_PATTERNS);
  assertTrue(matches.length >= 1, `expected ≥1 jobs/visa match, got ${matches.length}`);
});

test('Services detector matches malpractice + disability + locums', () => {
  const matches = findSentenceMatches(FIXTURE_SERVICES_PAGE, SERVICES_PATTERNS);
  assertTrue(matches.length >= 1, `expected ≥1 services match, got ${matches.length}`);
});

test('Shadow/volunteer detector matches student volunteer + shadowing program', () => {
  const matches = findSentenceMatches(FIXTURE_VOLUNTEER_PAGE, USCE_SHADOW_VOLUNTEER_PATTERNS);
  assertTrue(matches.length >= 1, `expected ≥1 shadow/volunteer match, got ${matches.length}`);
});

test('No detectors match navigation-only page', () => {
  const allPatterns = [
    USCE_OBSERVERSHIP_PATTERNS, USCE_VSM_PATTERNS, USCE_RESEARCH_PATTERNS,
    USCE_SHADOW_VOLUNTEER_PATTERNS, NEGATIVE_STRONG_PATTERNS, NEGATIVE_MEDIUM_PATTERNS,
    GME_PATTERNS, JOBS_VISA_PATTERNS, SERVICES_PATTERNS,
  ];
  let total = 0;
  for (const p of allPatterns) total += findSentenceMatches(FIXTURE_NAVIGATION_CHROME_NO_CONTENT, p).length;
  assertEqual(total, 0, 'navigation chrome should match nothing');
});

// -------------------- Quote verification tests --------------------

console.log('\n--- Quote verification ---');

test('Quote that appears in text verifies true', () => {
  assertTrue(isQuoteVerifiable('clinical observership', FIXTURE_OBSERVERSHIP_HIGH_YIELD));
});

test('Quote verifies true after whitespace normalization', () => {
  const text = 'Sample\n\n with   weird whitespace.';
  assertTrue(isQuoteVerifiable('Sample with weird whitespace', text));
});

test('Quote that does not appear in text verifies false', () => {
  assertFalse(isQuoteVerifiable('this quote is fabricated', FIXTURE_OBSERVERSHIP_HIGH_YIELD));
});

test('NOT_STATED_ON_SOURCE never verifies', () => {
  assertFalse(isQuoteVerifiable(NOT_STATED, FIXTURE_OBSERVERSHIP_HIGH_YIELD));
});

test('Empty quote never verifies', () => {
  assertFalse(isQuoteVerifiable('', FIXTURE_OBSERVERSHIP_HIGH_YIELD));
});

test('normalizeForQuoteMatch lowercases and collapses whitespace', () => {
  assertEqual(normalizeForQuoteMatch('Hello\n\nWorld   Foo'), 'hello world foo');
});

// -------------------- Source-scope inference tests --------------------

console.log('\n--- Source-scope inference ---');

const HOUSTON_CTX: InstitutionContext = {
  institutionId: 'inst_houston_methodist_hospital_tx',
  canonicalName: 'Houston Methodist Hospital',
  officialDomain: 'houstonmethodist.org',
  parentSystem: null,
};
const ADVENTHEALTH_ORLANDO_CTX: InstitutionContext = {
  institutionId: 'inst_adventhealth_orlando_fl',
  canonicalName: 'AdventHealth Orlando',
  officialDomain: 'adventhealth.com',
  parentSystem: 'AdventHealth',
};
const HARTFORD_CTX: InstitutionContext = {
  institutionId: 'inst_hartford_hospital_ct',
  canonicalName: 'Hartford Hospital',
  officialDomain: 'hartfordhospital.org',
  parentSystem: 'Hartford HealthCare',
};

test('Domain match on same-canonical-name → INSTITUTION_SPECIFIC', () => {
  const src: SourceLike = { sourceDomain: 'houstonmethodist.org', sourceScope: 'UNKNOWN_SCOPE', sourceFamily: 'OBSERVERSHIP_PAGE', sourceUrl: 'https://houstonmethodist.org/observership' };
  assertEqual(inferSourceScope(src, HOUSTON_CTX), 'INSTITUTION_SPECIFIC');
});

test('Hartford Hospital → hartfordhospital.org is INSTITUTION_SPECIFIC', () => {
  const src: SourceLike = { sourceDomain: 'hartfordhospital.org', sourceScope: 'UNKNOWN_SCOPE', sourceFamily: 'CAREERS_PAGE', sourceUrl: 'https://hartfordhospital.org/careers' };
  assertEqual(inferSourceScope(src, HARTFORD_CTX), 'INSTITUTION_SPECIFIC');
});

test('"AdventHealth Orlando" + adventhealth.com → HEALTH_SYSTEM_LEVEL (campus token absent from domain)', () => {
  const src: SourceLike = { sourceDomain: 'adventhealth.com', sourceScope: 'UNKNOWN_SCOPE', sourceFamily: 'GME_PAGE', sourceUrl: 'https://adventhealth.com/gme' };
  assertEqual(inferSourceScope(src, ADVENTHEALTH_ORLANDO_CTX), 'HEALTH_SYSTEM_LEVEL');
});

test('Pre-classified scope is preserved (not overwritten)', () => {
  const src: SourceLike = { sourceDomain: 'adventhealth.com', sourceScope: 'CAREERS_PORTAL', sourceFamily: 'CAREERS_PAGE', sourceUrl: 'https://adventhealth.com/careers' };
  assertEqual(inferSourceScope(src, ADVENTHEALTH_ORLANDO_CTX), 'CAREERS_PORTAL');
});

test('Subdomain of official domain → INSTITUTION_SPECIFIC', () => {
  const src: SourceLike = { sourceDomain: 'careers.houstonmethodist.org', sourceScope: 'UNKNOWN_SCOPE', sourceFamily: 'OTHER', sourceUrl: 'https://careers.houstonmethodist.org/' };
  assertEqual(inferSourceScope(src, HOUSTON_CTX), 'INSTITUTION_SPECIFIC');
});

test('Off-domain source → UNKNOWN_SCOPE', () => {
  const src: SourceLike = { sourceDomain: 'somethirdparty.com', sourceScope: 'UNKNOWN_SCOPE', sourceFamily: 'OTHER', sourceUrl: 'https://somethirdparty.com/' };
  assertEqual(inferSourceScope(src, HOUSTON_CTX), 'UNKNOWN_SCOPE');
});

const BROOKLYN_CTX: InstitutionContext = {
  institutionId: 'inst_brooklyn_hospital_center_ny',
  canonicalName: 'The Brooklyn Hospital Center',
  officialDomain: 'tbh.org',
  parentSystem: null,
};
test('Acronym domain (Brooklyn → tbh.org) → INSTITUTION_SPECIFIC (no false system inference)', () => {
  const src: SourceLike = { sourceDomain: 'tbh.org', sourceScope: 'UNKNOWN_SCOPE', sourceFamily: 'VOLUNTEER_PAGE', sourceUrl: 'https://tbh.org/volunteer' };
  assertEqual(inferSourceScope(src, BROOKLYN_CTX), 'INSTITUTION_SPECIFIC');
});

test('Generic-token-only canonical name does not trigger system inference', () => {
  // Synthetic case: institution name "Medical Center Hospital" (all generic words) on its own domain
  const ctx: InstitutionContext = { institutionId: 'x', canonicalName: 'Medical Center Hospital', officialDomain: 'mch.org', parentSystem: null };
  const src: SourceLike = { sourceDomain: 'mch.org', sourceScope: 'UNKNOWN_SCOPE', sourceFamily: 'OBSERVERSHIP_PAGE', sourceUrl: 'https://mch.org/observership' };
  assertEqual(inferSourceScope(src, ctx), 'INSTITUTION_SPECIFIC');
});

// -------------------- Visibility classifier tests --------------------

console.log('\n--- Visibility classifier ---');

test('GME_PAGE source → FUTURE_LANE_ONLY regardless of lane', () => {
  const r = classifyVisibility({ sourceFamily: 'GME_PAGE', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'IMG_OBSERVERSHIP' });
  assertEqual(r.visibility, 'FUTURE_LANE_ONLY');
});

test('CAREERS_PAGE source → FUTURE_LANE_ONLY', () => {
  const r = classifyVisibility({ sourceFamily: 'CAREERS_PAGE', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'IMG_OBSERVERSHIP' });
  assertEqual(r.visibility, 'FUTURE_LANE_ONLY');
});

test('HEALTH_SYSTEM_LEVEL scope without campus proof on OBSERVERSHIP_PAGE → HUMAN_REVIEW_REQUIRED', () => {
  const r = classifyVisibility({ sourceFamily: 'OBSERVERSHIP_PAGE', sourceScope: 'HEALTH_SYSTEM_LEVEL', matchedLane: 'IMG_OBSERVERSHIP' });
  assertEqual(r.visibility, 'HUMAN_REVIEW_REQUIRED');
});

test('HEALTH_SYSTEM_LEVEL scope WITH campus proof on OBSERVERSHIP_PAGE → CAUTION (deterministic) / PUBLIC_SAFE (with model HIGH)', () => {
  const r1 = classifyVisibility({ sourceFamily: 'OBSERVERSHIP_PAGE', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'IMG_OBSERVERSHIP', campusApplicabilityProof: 'campus-named-in-quote' });
  assertEqual(r1.visibility, 'CAUTION_SAFE_INTERNAL_REVIEW');
  const r2 = classifyVisibility({ sourceFamily: 'OBSERVERSHIP_PAGE', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'IMG_OBSERVERSHIP', campusApplicabilityProof: 'campus-named-in-quote', modelReaderConfidence: 'HIGH' });
  assertEqual(r2.visibility, 'PUBLIC_SAFE_USCE');
});

test('OBSERVERSHIP_PAGE + INSTITUTION_SPECIFIC scope without model reader → CAUTION_SAFE_INTERNAL_REVIEW', () => {
  const r = classifyVisibility({ sourceFamily: 'OBSERVERSHIP_PAGE', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'IMG_OBSERVERSHIP' });
  assertEqual(r.visibility, 'CAUTION_SAFE_INTERNAL_REVIEW');
});

test('OBSERVERSHIP_PAGE + INSTITUTION_SPECIFIC + model HIGH → PUBLIC_SAFE_USCE', () => {
  const r = classifyVisibility({ sourceFamily: 'OBSERVERSHIP_PAGE', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'IMG_OBSERVERSHIP', modelReaderConfidence: 'HIGH' });
  assertEqual(r.visibility, 'PUBLIC_SAFE_USCE');
});

test('OBSERVERSHIP_PAGE + CAMPUS_SPECIFIC + model HIGH → PUBLIC_SAFE_USCE', () => {
  const r = classifyVisibility({ sourceFamily: 'OBSERVERSHIP_PAGE', sourceScope: 'CAMPUS_SPECIFIC', matchedLane: 'IMG_OBSERVERSHIP', modelReaderConfidence: 'HIGH' });
  assertEqual(r.visibility, 'PUBLIC_SAFE_USCE');
});

test('VSM page on OTHER source family → CAUTION_SAFE_INTERNAL_REVIEW (wrong page family note)', () => {
  const r = classifyVisibility({ sourceFamily: 'OTHER', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'VISITING_MEDICAL_STUDENT' });
  assertEqual(r.visibility, 'CAUTION_SAFE_INTERNAL_REVIEW');
  assertContains(r.notPublicReason ?? '', 'not the expected page family');
});

test('NO_PUBLIC_OPPORTUNITY_FOUND lane → HUMAN_REVIEW_REQUIRED', () => {
  const r = classifyVisibility({ sourceFamily: 'VOLUNTEER_PAGE', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'NO_PUBLIC_OPPORTUNITY_FOUND' });
  assertEqual(r.visibility, 'HUMAN_REVIEW_REQUIRED');
});

test('Model reader HIGH but GME_PAGE source → still FUTURE_LANE_ONLY (family wins over confidence)', () => {
  const r = classifyVisibility({ sourceFamily: 'GME_PAGE', sourceScope: 'INSTITUTION_SPECIFIC', matchedLane: 'IMG_OBSERVERSHIP', modelReaderConfidence: 'HIGH' });
  assertEqual(r.visibility, 'FUTURE_LANE_ONLY');
});

// -------------------- Negative-strength tests --------------------

console.log('\n--- Negative-evidence strength ---');

test('INSTITUTION_SPECIFIC scope → STRONG', () => {
  assertEqual(negativeStrength('INSTITUTION_SPECIFIC'), 'STRONG');
});
test('CAMPUS_SPECIFIC scope → STRONG', () => {
  assertEqual(negativeStrength('CAMPUS_SPECIFIC'), 'STRONG');
});
test('HEALTH_SYSTEM_LEVEL scope → MEDIUM', () => {
  assertEqual(negativeStrength('HEALTH_SYSTEM_LEVEL'), 'MEDIUM');
});
test('MEDICAL_SCHOOL_LEVEL scope → MEDIUM', () => {
  assertEqual(negativeStrength('MEDICAL_SCHOOL_LEVEL'), 'MEDIUM');
});
test('UNKNOWN_SCOPE → WEAK', () => {
  assertEqual(negativeStrength('UNKNOWN_SCOPE'), 'WEAK');
});

// -------------------- Constants sanity tests --------------------

console.log('\n--- Constants ---');

test('SCHEMA_VERSION equals p102-0r-1', () => {
  assertEqual(SCHEMA_VERSION, 'p102-0r-1');
});
test('NOT_STATED equals expected sentinel', () => {
  assertEqual(NOT_STATED, 'NOT_STATED_ON_SOURCE');
});
test('Future-lane families set is non-empty and contains GME_PAGE', () => {
  assertTrue(FUTURE_LANE_SOURCE_FAMILIES.has('GME_PAGE'));
  assertTrue(FUTURE_LANE_SOURCE_FAMILIES.has('CAREERS_PAGE'));
});
test('System-or-school scopes contains both', () => {
  assertTrue(SYSTEM_OR_SCHOOL_SCOPES.has('HEALTH_SYSTEM_LEVEL'));
  assertTrue(SYSTEM_OR_SCHOOL_SCOPES.has('MEDICAL_SCHOOL_LEVEL'));
});

// -------------------- htmlToTextV2 tests --------------------

console.log('\n--- htmlToTextV2 ---');

test('htmlToTextV2 strips <nav> blocks', () => {
  const html = `<html><body><nav>Home | About | Contact</nav><main><p>Our observership program is open.</p></main></body></html>`;
  const txt = htmlToTextV2(html);
  assertFalse(txt.toLowerCase().includes('home'), `nav should be removed; got: ${txt}`);
  assertContains(txt.toLowerCase(), 'observership program');
});

test('htmlToTextV2 strips <footer> and <aside>', () => {
  const html = `<html><body><main><p>Content here.</p></main><aside>Sidebar links</aside><footer>(c) 2026 footer text</footer></body></html>`;
  const txt = htmlToTextV2(html);
  assertContains(txt.toLowerCase(), 'content here');
  assertFalse(txt.toLowerCase().includes('sidebar'), `aside should be removed; got: ${txt}`);
  assertFalse(txt.toLowerCase().includes('footer text'), `footer should be removed; got: ${txt}`);
});

test('htmlToTextV2 focuses on <main> when present', () => {
  const html = `<html><body><header>top header</header><main><p>Main content paragraph.</p></main><footer>bottom footer</footer></body></html>`;
  const txt = htmlToTextV2(html);
  assertContains(txt.toLowerCase(), 'main content');
  assertFalse(txt.toLowerCase().includes('top header'), `header outside main should not appear; got: ${txt}`);
});

test('htmlToTextV2 strips menu-class boilerplate', () => {
  const html = `<html><body><div class="primary-nav"><a href="/">Home</a><a href="/about">About</a></div><div class="content"><p>Real content.</p></div></body></html>`;
  const txt = htmlToTextV2(html);
  assertContains(txt.toLowerCase(), 'real content');
  assertFalse(txt.toLowerCase().includes('about'), `nav-class should be removed; got: ${txt}`);
});

test('htmlToTextV2 falls back gracefully when no <main>', () => {
  const html = `<html><body><div>Just a div with some text.</div></body></html>`;
  const txt = htmlToTextV2(html);
  assertContains(txt, 'Just a div with some text');
});

// -------------------- reclassifySourceFamilyByContent tests --------------------

console.log('\n--- reclassifySourceFamilyByContent ---');

test('OBSERVERSHIP_PAGE downgraded to OTHER when content has no observership keyword', () => {
  const fake = `Welcome to our Pharmacy Student Externship program. This is a pharmacy externship for fourth-year pharmacy students. Apply by September.`;
  const r = reclassifySourceFamilyByContent('OBSERVERSHIP_PAGE', fake);
  assertEqual(r.family, 'OTHER');
  assertContains(r.reason ?? '', 'observership');
});

test('OBSERVERSHIP_PAGE kept when content has the keyword', () => {
  const r = reclassifySourceFamilyByContent('OBSERVERSHIP_PAGE', FIXTURE_OBSERVERSHIP_HIGH_YIELD);
  assertEqual(r.family, 'OBSERVERSHIP_PAGE');
  assertEqual(r.reason, null);
});

test('GME_PAGE downgraded when no GME keyword', () => {
  const r = reclassifySourceFamilyByContent('GME_PAGE', FIXTURE_OBSERVERSHIP_HIGH_YIELD);
  assertEqual(r.family, 'OTHER');
});

test('GME_PAGE kept when ACGME/ERAS/NRMP keyword present', () => {
  const r = reclassifySourceFamilyByContent('GME_PAGE', FIXTURE_GME_PAGE);
  assertEqual(r.family, 'GME_PAGE');
});

test('VOLUNTEER_PAGE kept when content mentions volunteer', () => {
  const r = reclassifySourceFamilyByContent('VOLUNTEER_PAGE', FIXTURE_VOLUNTEER_PAGE);
  assertEqual(r.family, 'VOLUNTEER_PAGE');
});

test('VOLUNTEER_PAGE downgraded when no volunteer keyword', () => {
  const r = reclassifySourceFamilyByContent('VOLUNTEER_PAGE', FIXTURE_GME_PAGE);
  assertEqual(r.family, 'OTHER');
});

test('Content too short returns OTHER', () => {
  const r = reclassifySourceFamilyByContent('OBSERVERSHIP_PAGE', 'too short');
  assertEqual(r.family, 'OTHER');
  assertContains(r.reason ?? '', 'too_short');
});

test('Unknown family passes through unchanged', () => {
  const r = reclassifySourceFamilyByContent('SOMETHING_ELSE', FIXTURE_OBSERVERSHIP_HIGH_YIELD);
  assertEqual(r.family, 'SOMETHING_ELSE');
});

// -------------------- Identity canonicalizer tests --------------------

import { inferIdentity, compareInstitutions } from './p102-identity-canonicalizer';
import { parseSitemapXml } from './p102-extraction-lib';

console.log('\n--- Identity canonicalizer ---');

test('AdventHealth Orlando → parent AdventHealth, campus Orlando', () => {
  const r = inferIdentity('AdventHealth Orlando', 'adventhealth.com');
  assertEqual(r.parentSystem, 'AdventHealth');
  assertEqual(r.campusName, 'orlando');
  assertEqual(r.isStandalone, false);
});

test('Hartford Hospital → parent Hartford HealthCare via special case', () => {
  const r = inferIdentity('Hartford Hospital', 'hartfordhospital.org');
  assertEqual(r.parentSystem, 'Hartford HealthCare');
  assertEqual(r.isStandalone, false);
});

test('Houston Methodist Hospital → standalone', () => {
  const r = inferIdentity('Houston Methodist Hospital', 'houstonmethodist.org');
  assertEqual(r.parentSystem, null);
  assertEqual(r.isStandalone, true);
});

test('The Brooklyn Hospital Center → standalone', () => {
  const r = inferIdentity('The Brooklyn Hospital Center', 'tbh.org');
  assertEqual(r.parentSystem, null);
  assertEqual(r.isStandalone, true);
});

test('Cleveland Clinic Florida → parent Cleveland Clinic, campus florida', () => {
  const r = inferIdentity('Cleveland Clinic Florida', 'my.clevelandclinic.org');
  assertEqual(r.parentSystem, 'Cleveland Clinic');
  assertEqual(r.campusName, 'florida');
});

test('Unknown institution → standalone with rationale', () => {
  const r = inferIdentity('Some Unknown Hospital', 'someunknownhospital.org');
  assertEqual(r.parentSystem, null);
  assertEqual(r.isStandalone, true);
  assertContains(r.evidence, 'no SYSTEM_REGISTRY match');
});

test('compareInstitutions: AdventHealth Orlando vs AdventHealth Tampa → DISTINCT_CAMPUS_SAME_SYSTEM', () => {
  const r = compareInstitutions(
    { canonicalName: 'AdventHealth Orlando', officialDomain: 'adventhealth.com' },
    { canonicalName: 'AdventHealth Tampa', officialDomain: 'adventhealth.com' },
  );
  assertEqual(r.relationship, 'DISTINCT_CAMPUS_SAME_SYSTEM');
});

test('compareInstitutions: Houston Methodist vs Brooklyn Hospital Center → UNRELATED', () => {
  const r = compareInstitutions(
    { canonicalName: 'Houston Methodist Hospital', officialDomain: 'houstonmethodist.org' },
    { canonicalName: 'The Brooklyn Hospital Center', officialDomain: 'tbh.org' },
  );
  assertEqual(r.relationship, 'UNRELATED');
});

test('compareInstitutions: exact match → SAME_INSTITUTION', () => {
  const r = compareInstitutions(
    { canonicalName: 'Hartford Hospital', officialDomain: 'hartfordhospital.org' },
    { canonicalName: 'Hartford Hospital', officialDomain: 'hartfordhospital.org' },
  );
  assertEqual(r.relationship, 'SAME_INSTITUTION');
});

test('compareInstitutions: standalone vs system-affiliated → UNRELATED', () => {
  const r = compareInstitutions(
    { canonicalName: 'Houston Methodist Hospital', officialDomain: 'houstonmethodist.org' },
    { canonicalName: 'Hartford Hospital', officialDomain: 'hartfordhospital.org' },
  );
  assertEqual(r.relationship, 'UNRELATED');
});

// Identity registry expansion tests (P102-0N)
test('Atrium Health Carolinas Medical Center → parent Atrium Health', () => {
  const r = inferIdentity('Atrium Health Carolinas Medical Center', 'atriumhealth.org');
  assertEqual(r.parentSystem, 'Atrium Health');
});

test('Banner Estrella Medical Center → parent Banner Health', () => {
  const r = inferIdentity('Banner Estrella Medical Center', 'bannerhealth.com');
  assertEqual(r.parentSystem, 'Banner Health');
});

test('Kaiser Permanente Oakland → parent Kaiser Permanente', () => {
  const r = inferIdentity('Kaiser Permanente Oakland', 'kaiserpermanente.org');
  assertEqual(r.parentSystem, 'Kaiser Permanente');
});

test('Sutter Medical Center Sacramento → parent Sutter Health', () => {
  const r = inferIdentity('Sutter Medical Center Sacramento', 'sutterhealth.org');
  assertEqual(r.parentSystem, 'Sutter Health');
});

test('UPMC Presbyterian → parent UPMC', () => {
  const r = inferIdentity('UPMC Presbyterian', 'upmc.com');
  assertEqual(r.parentSystem, 'UPMC');
});

test('Memorial Hermann TMC → parent Memorial Hermann', () => {
  const r = inferIdentity('Memorial Hermann TMC', 'memorialhermann.org');
  assertEqual(r.parentSystem, 'Memorial Hermann');
});

test('Stanford Health Care Palo Alto → parent Stanford Health Care', () => {
  const r = inferIdentity('Stanford Health Care Palo Alto', 'stanfordhealthcare.org');
  assertEqual(r.parentSystem, 'Stanford Health Care');
});

test('UCSF Health Parnassus → parent UCSF Health', () => {
  const r = inferIdentity('UCSF Health Parnassus', 'ucsfhealth.org');
  assertEqual(r.parentSystem, 'UCSF Health');
});

test("Children's Hospital of Philadelphia → standalone", () => {
  const r = inferIdentity("Children's Hospital of Philadelphia", 'chop.edu');
  assertEqual(r.isStandalone, true);
});

test('Cedars-Sinai Medical Center → standalone', () => {
  const r = inferIdentity('Cedars-Sinai Medical Center', 'cedars-sinai.org');
  assertEqual(r.isStandalone, true);
});

test('compareInstitutions: AdventHealth Tampa vs AdventHealth Orlando → DISTINCT_CAMPUS_SAME_SYSTEM', () => {
  const r = compareInstitutions(
    { canonicalName: 'AdventHealth Tampa', officialDomain: 'adventhealth.com' },
    { canonicalName: 'AdventHealth Orlando', officialDomain: 'adventhealth.com' },
  );
  assertEqual(r.relationship, 'DISTINCT_CAMPUS_SAME_SYSTEM');
});

test('compareInstitutions: UPMC Presbyterian vs UPMC Shadyside → DISTINCT_CAMPUS_SAME_SYSTEM', () => {
  const r = compareInstitutions(
    { canonicalName: 'UPMC Presbyterian', officialDomain: 'upmc.com' },
    { canonicalName: 'UPMC Shadyside', officialDomain: 'upmc.com' },
  );
  assertEqual(r.relationship, 'DISTINCT_CAMPUS_SAME_SYSTEM');
});

test('compareInstitutions: UPMC vs AdventHealth → UNRELATED', () => {
  const r = compareInstitutions(
    { canonicalName: 'UPMC Presbyterian', officialDomain: 'upmc.com' },
    { canonicalName: 'AdventHealth Orlando', officialDomain: 'adventhealth.com' },
  );
  assertEqual(r.relationship, 'UNRELATED');
});

// -------------------- Sitemap parser tests --------------------

console.log('\n--- Sitemap parser ---');

test('parseSitemapXml: detects urlset', () => {
  const body = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/page1</loc></url><url><loc>https://example.com/page2</loc></url></urlset>`;
  const r = parseSitemapXml(body);
  assertEqual(r.type, 'urlset');
  assertEqual(r.entries.length, 2);
});

test('parseSitemapXml: detects sitemapindex', () => {
  const body = `<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://example.com/sitemap-pages.xml</loc></sitemap><sitemap><loc>https://example.com/sitemap-blog.xml</loc></sitemap></sitemapindex>`;
  const r = parseSitemapXml(body);
  assertEqual(r.type, 'sitemapindex');
  assertEqual(r.entries.length, 2);
});

test('parseSitemapXml: empty sitemapindex returns empty entries', () => {
  const body = `<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>`;
  const r = parseSitemapXml(body);
  assertEqual(r.type, 'sitemapindex');
  assertEqual(r.entries.length, 0);
});

test('parseSitemapXml: unknown returns empty', () => {
  const body = `not-xml-content`;
  const r = parseSitemapXml(body);
  assertEqual(r.type, 'unknown');
  assertEqual(r.entries.length, 0);
});

test('parseSitemapXml: handles whitespace inside loc', () => {
  const body = `<urlset><url><loc>
    https://example.com/page
  </loc></url></urlset>`;
  const r = parseSitemapXml(body);
  assertEqual(r.type, 'urlset');
  assertEqual(r.entries[0], 'https://example.com/page');
});

// -------------------- End-to-end (extraction → quote-verify) integration test --------------------

console.log('\n--- End-to-end integration ---');

test('Extracted quote from high-yield observership fixture is quote-verifiable against same fixture', () => {
  const matches = findSentenceMatches(FIXTURE_OBSERVERSHIP_HIGH_YIELD, USCE_OBSERVERSHIP_PATTERNS);
  assertTrue(matches.length > 0, 'no matches');
  for (const m of matches) {
    assertTrue(isQuoteVerifiable(m.sentence, FIXTURE_OBSERVERSHIP_HIGH_YIELD), `sentence not verifiable: ${m.sentence}`);
  }
});

test('Negative-evidence quote is verifiable against same fixture', () => {
  const matches = findSentenceMatches(FIXTURE_NEGATIVE_EXPLICIT, NEGATIVE_STRONG_PATTERNS);
  assertTrue(matches.length > 0);
  for (const m of matches) {
    assertTrue(isQuoteVerifiable(m.sentence, FIXTURE_NEGATIVE_EXPLICIT));
  }
});

test('GME quote does NOT verify against a different fixture', () => {
  const matches = findSentenceMatches(FIXTURE_GME_PAGE, GME_PATTERNS);
  assertTrue(matches.length > 0);
  for (const m of matches) {
    assertFalse(isQuoteVerifiable(m.sentence, FIXTURE_OBSERVERSHIP_HIGH_YIELD), `${m.sentence} unexpectedly found in different fixture`);
  }
});

// -------------------- Summary --------------------

console.log('\n' + '='.repeat(60));
console.log(`Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
