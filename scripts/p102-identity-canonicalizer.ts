/**
 * P102 identity canonicalizer — pure functions to infer parent_system
 * and known aliases from a canonical name + official domain.
 *
 * Uses a small hand-curated registry of multi-campus health systems
 * known to be relevant for USCE discovery. Conservative: when in doubt,
 * returns null.
 *
 * No network. No file I/O. Pure transforms.
 */

export interface IdentityInference {
  parentSystem: string | null;
  parentSystemDomain: string | null;
  aliases: string[];
  isStandalone: boolean;
  evidence: string;
  campusName: string | null;
}

/**
 * Known multi-campus health systems. Each entry maps the SYSTEM canonical
 * name to its system-level domain and a list of campus-name hints.
 *
 * Keep this list short and high-confidence. The framework leans toward
 * INSTITUTION_SPECIFIC defaults; a wrong entry here would cause false
 * system-level inference. Only add a system when:
 *   - It has ≥3 named hospital campuses, AND
 *   - Its primary website is the system domain (campuses don't have
 *     their own primary domains).
 */
const SYSTEM_REGISTRY: Array<{
  systemName: string;
  systemDomain: string;
  domainTokens: string[];
  knownCampusKeywords: string[];
  knownStandaloneAliases?: string[];
}> = [
  {
    systemName: 'AdventHealth',
    systemDomain: 'adventhealth.com',
    domainTokens: ['adventhealth'],
    knownCampusKeywords: ['orlando', 'tampa', 'celebration', 'altamonte', 'ocala', 'shawnee', 'avista'],
  },
  {
    systemName: 'HCA Healthcare',
    systemDomain: 'hcahealthcare.com',
    domainTokens: ['hca', 'hcahealthcare'],
    knownCampusKeywords: ['florida', 'denver', 'houston', 'kansas', 'mountainstar'],
  },
  {
    systemName: 'Hartford HealthCare',
    systemDomain: 'hartfordhealthcare.org',
    domainTokens: ['hartfordhealthcare'],
    knownCampusKeywords: ['hartford hospital', 'st. vincent', 'backus', 'midstate', 'windham'],
  },
  {
    systemName: 'Northwell Health',
    systemDomain: 'northwell.edu',
    domainTokens: ['northwell'],
    knownCampusKeywords: ['staten island', 'long island jewish', 'north shore', 'lenox hill', 'cohen'],
  },
  {
    systemName: 'Memorial Healthcare System',
    systemDomain: 'mhs.net',
    domainTokens: ['mhs'],
    knownCampusKeywords: ['memorial regional', 'memorial hollywood', 'memorial west', 'memorial miramar'],
  },
  {
    systemName: 'Cleveland Clinic',
    systemDomain: 'my.clevelandclinic.org',
    domainTokens: ['clevelandclinic'],
    knownCampusKeywords: ['florida', 'akron', 'mercy', 'martin', 'weston', 'london', 'abu dhabi'],
  },
  {
    systemName: 'Mayo Clinic',
    systemDomain: 'mayoclinic.org',
    domainTokens: ['mayoclinic'],
    knownCampusKeywords: ['rochester', 'florida', 'arizona', 'jacksonville', 'scottsdale'],
  },
  {
    systemName: 'Mass General Brigham',
    systemDomain: 'massgeneralbrigham.org',
    domainTokens: ['massgeneralbrigham', 'mgb'],
    knownCampusKeywords: ['mass general', 'massachusetts general', 'brigham', "brigham and women", 'mclean', 'salem', 'newton-wellesley'],
  },
  {
    systemName: 'Yale New Haven Health',
    systemDomain: 'ynhhs.org',
    domainTokens: ['ynhhs', 'yalemedicine'],
    knownCampusKeywords: ['yale new haven', 'bridgeport', 'greenwich', 'lawrence + memorial', 'westerly'],
  },
  {
    systemName: 'University of Florida Health',
    systemDomain: 'ufhealth.org',
    domainTokens: ['ufhealth'],
    knownCampusKeywords: ['shands', 'jacksonville', 'leesburg', 'central florida'],
  },
  {
    systemName: 'Atrium Health',
    systemDomain: 'atriumhealth.org',
    domainTokens: ['atriumhealth'],
    knownCampusKeywords: ['carolinas medical', 'pineville', 'mercy', 'university city', 'cabarrus', 'wake forest'],
  },
  {
    systemName: 'Banner Health',
    systemDomain: 'bannerhealth.com',
    domainTokens: ['bannerhealth'],
    knownCampusKeywords: ['phoenix', 'tucson', 'gateway', 'desert', 'estrella', 'thunderbird', 'casa grande'],
  },
  {
    systemName: 'Kaiser Permanente',
    systemDomain: 'kaiserpermanente.org',
    domainTokens: ['kaiserpermanente', 'kp'],
    knownCampusKeywords: ['northern california', 'southern california', 'colorado', 'georgia', 'hawaii', 'mid-atlantic', 'northwest', 'washington', 'oakland', 'los angeles'],
  },
  {
    systemName: 'Sutter Health',
    systemDomain: 'sutterhealth.org',
    domainTokens: ['sutterhealth'],
    knownCampusKeywords: ['sacramento', 'palo alto', 'cpmc', 'santa rosa', 'davis', 'eden'],
  },
  {
    systemName: 'Tenet Healthcare',
    systemDomain: 'tenethealth.com',
    domainTokens: ['tenethealth'],
    knownCampusKeywords: ['detroit', 'dallas', 'el paso', 'palmetto', 'desert regional', 'st mary'],
  },
  {
    systemName: 'CommonSpirit Health',
    systemDomain: 'commonspirit.org',
    domainTokens: ['commonspirit', 'catholichealth', 'dignityhealth'],
    knownCampusKeywords: ['mercy', 'st joseph', 'st rose', 'sequoia', 'redwood', 'french hospital'],
  },
  {
    systemName: 'Providence',
    systemDomain: 'providence.org',
    domainTokens: ['providence'],
    knownCampusKeywords: ['st joseph', 'portland', 'olympia', 'spokane', 'mission', 'tarzana', 'little company of mary'],
  },
  {
    systemName: 'Ascension',
    systemDomain: 'ascension.org',
    domainTokens: ['ascension'],
    knownCampusKeywords: ['st vincent', 'sacred heart', 'seton', 'borgess', 'genesys', 'st thomas'],
  },
  {
    systemName: 'Trinity Health',
    systemDomain: 'trinity-health.org',
    domainTokens: ['trinity-health', 'trinityhealth'],
    knownCampusKeywords: ['st joseph', 'mercy health', 'st francis', 'loyola', 'st marys', 'holy cross'],
  },
  {
    systemName: 'UPMC',
    systemDomain: 'upmc.com',
    domainTokens: ['upmc'],
    knownCampusKeywords: ['presbyterian', 'shadyside', 'mercy', 'magee', 'mckeesport', 'st margaret', 'east'],
  },
  {
    systemName: 'Geisinger',
    systemDomain: 'geisinger.org',
    domainTokens: ['geisinger'],
    knownCampusKeywords: ['danville', 'wilkes-barre', 'scranton', 'lewistown', 'jersey shore', 'south wilkes-barre'],
  },
  {
    systemName: 'Sentara Healthcare',
    systemDomain: 'sentara.com',
    domainTokens: ['sentara'],
    knownCampusKeywords: ['norfolk general', 'leigh', 'princess anne', 'careplex', 'martha jefferson', 'rockingham'],
  },
  {
    systemName: 'Inova Health System',
    systemDomain: 'inova.org',
    domainTokens: ['inova'],
    knownCampusKeywords: ['fairfax', 'alexandria', 'loudoun', 'mount vernon', 'franconia', 'tysons'],
  },
  {
    systemName: 'BJC HealthCare',
    systemDomain: 'bjc.org',
    domainTokens: ['bjc'],
    knownCampusKeywords: ['barnes-jewish', 'christian', 'memorial', 'progress west', 'parkland', 'alton memorial'],
  },
  {
    systemName: 'Henry Ford Health',
    systemDomain: 'henryford.com',
    domainTokens: ['henryford'],
    knownCampusKeywords: ['detroit', 'macomb', 'west bloomfield', 'wyandotte', 'allegiance', 'kingswood'],
  },
  {
    systemName: 'Corewell Health',
    systemDomain: 'corewellhealth.org',
    domainTokens: ['corewellhealth', 'spectrumhealth', 'beaumonthealth'],
    knownCampusKeywords: ['grand rapids', 'butterworth', 'royal oak', 'troy', 'farmington hills', 'dearborn'],
  },
  {
    systemName: 'Stanford Health Care',
    systemDomain: 'stanfordhealthcare.org',
    domainTokens: ['stanfordhealthcare'],
    knownCampusKeywords: ['palo alto', 'tri-valley', 'valleycare', 'south bay'],
  },
  {
    systemName: 'UCSF Health',
    systemDomain: 'ucsfhealth.org',
    domainTokens: ['ucsfhealth', 'ucsf'],
    knownCampusKeywords: ['parnassus', 'mission bay', 'mount zion', 'benioff', 'st marys', 'st francis'],
  },
  {
    systemName: 'UCLA Health',
    systemDomain: 'uclahealth.org',
    domainTokens: ['uclahealth', 'ucla'],
    knownCampusKeywords: ['ronald reagan', 'santa monica', 'resnick', 'mattel', 'westwood'],
  },
  {
    systemName: 'Memorial Hermann',
    systemDomain: 'memorialhermann.org',
    domainTokens: ['memorialhermann'],
    knownCampusKeywords: ['tmc', 'texas medical center', 'sugar land', 'katy', 'pearland', 'cypress', 'northeast'],
  },
  {
    systemName: 'Texas Health Resources',
    systemDomain: 'texashealth.org',
    domainTokens: ['texashealth'],
    knownCampusKeywords: ['presbyterian', 'arlington memorial', 'fort worth', 'plano', 'denton', 'azle'],
  },
  {
    systemName: 'Wellstar Health System',
    systemDomain: 'wellstar.org',
    domainTokens: ['wellstar'],
    knownCampusKeywords: ['kennestone', 'cobb', 'douglas', 'paulding', 'spalding', 'windy hill'],
  },
  {
    systemName: 'Piedmont Healthcare',
    systemDomain: 'piedmont.org',
    domainTokens: ['piedmont'],
    knownCampusKeywords: ['atlanta', 'fayette', 'henry', 'newnan', 'mountainside', 'columbus', 'rockdale'],
  },
];

/**
 * Institutions known to have no parent system, despite naming patterns that
 * might otherwise suggest one. (Hartford Hospital is NOT here — it has
 * Hartford HealthCare as parent; see Hartford special case below.)
 */
/**
 * Truly independent institutions (no parent system in any registry).
 * Membership here means inferIdentity returns isStandalone=true without
 * consulting SYSTEM_REGISTRY.
 *
 * IMPORTANT: only add an institution here if you are confident it has
 * NO parent system that's in SYSTEM_REGISTRY. Otherwise the wrong
 * lookup result will block scope discipline.
 */
const KNOWN_STANDALONES = new Set<string>([
  'houston methodist hospital',
  'the brooklyn hospital center',
  'brooklyn hospital center',
  'memorial sloan kettering cancer center',
  'hospital for special surgery',
  'cook county health',
  'boston medical center',
  'tampa general hospital',
  'cedars-sinai medical center',
  'cedars-sinai',
  'childrens hospital of philadelphia',
  "children's hospital of philadelphia",
  'chop',
  'boston childrens hospital',
  "boston children's hospital",
  'cincinnati childrens hospital medical center',
  "cincinnati children's hospital medical center",
  'texas childrens hospital',
  "texas children's hospital",
  'rush university medical center',
]);

// Mass General Brigham member campuses that should NOT match the
// SYSTEM_REGISTRY entry because they have their own domains.
// (The MGB systemDomain match requires the campus name OR system name
// in the canonical; these don't include 'Mass General Brigham' in the
// canonical so they fall through. We don't classify them as standalone
// because they DO belong to MGB; the gold-set spec handles them via
// the BWH+HMS scope-conflict test in Gold 7.)

/**
 * Infer parent_system + aliases for an institution by name + domain.
 */
export function inferIdentity(canonicalName: string, officialDomain: string): IdentityInference {
  const nameLower = canonicalName.toLowerCase().trim();
  const domainLower = officialDomain.replace(/^www\./, '').toLowerCase();

  // Try system registry
  for (const sys of SYSTEM_REGISTRY) {
    const domainMatches = sys.domainTokens.some(t => domainLower.includes(t));
    const nameHasCampusKw = sys.knownCampusKeywords.some(kw => nameLower.includes(kw.toLowerCase()));
    const nameHasSystemName = nameLower.includes(sys.systemName.toLowerCase());

    if (domainMatches && (nameHasCampusKw || nameHasSystemName)) {
      // Detect the campus
      const matchedKw = sys.knownCampusKeywords.find(kw => nameLower.includes(kw.toLowerCase()));
      return {
        parentSystem: sys.systemName,
        parentSystemDomain: sys.systemDomain,
        aliases: nameHasCampusKw && matchedKw ? [matchedKw] : [],
        isStandalone: false,
        evidence: `domain ${officialDomain} matches ${sys.systemName} (${sys.domainTokens.join('|')}); name token match: ${matchedKw ?? 'system-name-direct'}`,
        campusName: matchedKw ?? null,
      };
    }
    if (nameHasSystemName && nameHasCampusKw && !domainMatches) {
      // System-named institution on a different domain (e.g., Hartford Hospital is on hartfordhospital.org,
      // not on hartfordhealthcare.org) — still a system member but the domain is hospital-specific.
      const matchedKw = sys.knownCampusKeywords.find(kw => nameLower.includes(kw.toLowerCase()));
      return {
        parentSystem: sys.systemName,
        parentSystemDomain: sys.systemDomain,
        aliases: [],
        isStandalone: false,
        evidence: `name "${canonicalName}" contains both ${sys.systemName} and a known campus token; domain ${officialDomain} is campus-level`,
        campusName: matchedKw ?? null,
      };
    }
  }

  // Check known standalones
  if (KNOWN_STANDALONES.has(nameLower)) {
    return {
      parentSystem: null,
      parentSystemDomain: null,
      aliases: [],
      isStandalone: true,
      evidence: `${canonicalName} is a known standalone in KNOWN_STANDALONES`,
      campusName: null,
    };
  }

  // Hartford Hospital special case (it IS in the Hartford HealthCare system per public info,
  // even though it's listed in KNOWN_STANDALONES above with that meaning explicit). Re-check.
  if (nameLower === 'hartford hospital') {
    return {
      parentSystem: 'Hartford HealthCare',
      parentSystemDomain: 'hartfordhealthcare.org',
      aliases: ['Hartford HealthCare Hartford Hospital'],
      isStandalone: false,
      evidence: 'Hartford Hospital is part of Hartford HealthCare system; its own domain hartfordhospital.org is hospital-level',
      campusName: 'Hartford',
    };
  }

  // Default: no inference
  return {
    parentSystem: null,
    parentSystemDomain: null,
    aliases: [],
    isStandalone: true,
    evidence: 'no SYSTEM_REGISTRY match; assumed standalone',
    campusName: null,
  };
}

/**
 * Determine the relationship between two institutions: same-institution,
 * same-system-different-campus, unrelated.
 */
export type DuplicateRelationship =
  | 'SAME_INSTITUTION'
  | 'DISTINCT_CAMPUS_SAME_SYSTEM'
  | 'UNRELATED'
  | 'CANNOT_DETERMINE';

export function compareInstitutions(
  a: { canonicalName: string; officialDomain: string },
  b: { canonicalName: string; officialDomain: string },
): { relationship: DuplicateRelationship; evidence: string } {
  const aIdent = inferIdentity(a.canonicalName, a.officialDomain);
  const bIdent = inferIdentity(b.canonicalName, b.officialDomain);

  // Same canonical name + same domain → same institution
  if (a.canonicalName.toLowerCase().trim() === b.canonicalName.toLowerCase().trim() &&
      a.officialDomain.toLowerCase() === b.officialDomain.toLowerCase()) {
    return { relationship: 'SAME_INSTITUTION', evidence: 'exact canonical name + domain match' };
  }

  // Different campuses of the same known system
  if (aIdent.parentSystem && bIdent.parentSystem && aIdent.parentSystem === bIdent.parentSystem) {
    if (aIdent.campusName && bIdent.campusName && aIdent.campusName !== bIdent.campusName) {
      return { relationship: 'DISTINCT_CAMPUS_SAME_SYSTEM', evidence: `both under ${aIdent.parentSystem}; campuses ${aIdent.campusName} vs ${bIdent.campusName}` };
    }
    return { relationship: 'SAME_INSTITUTION', evidence: `both under ${aIdent.parentSystem}; same/unknown campus` };
  }

  // Different parent systems → unrelated
  if (aIdent.parentSystem && bIdent.parentSystem && aIdent.parentSystem !== bIdent.parentSystem) {
    return { relationship: 'UNRELATED', evidence: `different parent systems: ${aIdent.parentSystem} vs ${bIdent.parentSystem}` };
  }

  // Both standalone, different names → unrelated
  if (aIdent.isStandalone && bIdent.isStandalone) {
    return { relationship: 'UNRELATED', evidence: 'both standalone, different names' };
  }

  // One standalone, the other in a system → unrelated
  if (aIdent.isStandalone !== bIdent.isStandalone) {
    return { relationship: 'UNRELATED', evidence: `one is standalone (${aIdent.isStandalone ? a.canonicalName : b.canonicalName}); the other is in ${aIdent.parentSystem ?? bIdent.parentSystem}` };
  }

  return { relationship: 'CANNOT_DETERMINE', evidence: 'no registry match; insufficient information' };
}
