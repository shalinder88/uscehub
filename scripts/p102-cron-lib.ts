export function hasAcceptablePath(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  const segments = parsed.pathname.split('/').filter(Boolean);
  return segments.length >= 1;
}

export type UsceCategory = 'VSLO' | 'CLERKSHIP' | 'OBSERVERSHIP' | 'RESEARCH';

const LANE_MAP: Record<string, UsceCategory> = {
  VISITING_MEDICAL_STUDENT: 'VSLO',
  VISITING_STUDENT: 'VSLO',
  CLINICAL_ELECTIVE: 'CLERKSHIP',
  SUB_INTERNSHIP: 'CLERKSHIP',
  AWAY_ROTATION: 'CLERKSHIP',
  CLERKSHIP: 'CLERKSHIP',
  OBSERVERSHIP: 'OBSERVERSHIP',
  IMG_OBSERVERSHIP: 'OBSERVERSHIP',
  INTERNATIONAL_VISITING_STUDENT: 'OBSERVERSHIP',
  INTERNATIONAL_MEDICAL_STUDENT: 'OBSERVERSHIP',
  EXTERNSHIP: 'OBSERVERSHIP',
  RESEARCH_OPPORTUNITY: 'RESEARCH',
  RESEARCH: 'RESEARCH',
  RESEARCH_ROTATION: 'RESEARCH',
};

export function laneToCategory(lane: string | undefined | null): UsceCategory | null {
  if (lane == null) return null;
  return LANE_MAP[lane.toUpperCase()] ?? null;
}

export type RunRating = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';

export interface RunRatingResult {
  rating: RunRating;
  rationale: string;
  categoriesFound: UsceCategory[];
  acceptedClaimsCount: number;
  filteredGenericCount: number;
}

interface RawClaimForRating {
  lane?: string | null;
  sourceUrl?: string | null;
  visibility?: string | null;
  quoteVerified?: boolean | null;
}

export function computeRating(claims: RawClaimForRating[]): RunRatingResult {
  const publicSafeAll = claims.filter(
    (c) => c.visibility === 'PUBLIC_SAFE_USCE' && c.quoteVerified === true,
  );

  const accepted = publicSafeAll.filter(
    (c) => c.sourceUrl != null && hasAcceptablePath(c.sourceUrl),
  );

  const filteredGeneric = publicSafeAll.filter(
    (c) => c.sourceUrl == null || !hasAcceptablePath(c.sourceUrl),
  );

  const categorySet = new Set<UsceCategory>();
  for (const c of accepted) {
    const cat = laneToCategory(c.lane);
    if (cat !== null) categorySet.add(cat);
  }
  const categoriesFound = Array.from(categorySet);

  const humanReviewWithCategory = claims.filter(
    (c) =>
      c.visibility === 'HUMAN_REVIEW_REQUIRED' && laneToCategory(c.lane) !== null,
  );

  let rating: RunRating;
  let rationale: string;

  if (categoriesFound.length >= 2) {
    rating = 'EXCELLENT';
    rationale = `${categoriesFound.length} distinct USCE categories found with specific paths and verified quotes.`;
  } else if (categoriesFound.length >= 1) {
    rating = 'GOOD';
    rationale = `1 USCE category found (${categoriesFound[0]}) with specific path and verified quote.`;
  } else if (filteredGeneric.length > 0 || humanReviewWithCategory.length > 0) {
    rating = 'AVERAGE';
    rationale =
      `No accepted specific-path claims, but ${filteredGeneric.length} generic-path and ` +
      `${humanReviewWithCategory.length} human-review claims with known categories.`;
  } else {
    rating = 'POOR';
    rationale = 'No public-safe verified claims with acceptable paths or relevant categories.';
  }

  return {
    rating,
    rationale,
    categoriesFound,
    acceptedClaimsCount: accepted.length,
    filteredGenericCount: filteredGeneric.length,
  };
}

export const NATIONAL_QUEUE_HEADER =
  'schema_version,queue_id,scope_type,scope_value,rank,institution_id,canonical_name,state,county,city,official_domain,target_lanes,priority,why_included,status,assigned_run_id,locked_at,completed_at,next_action,notes,attempt_count,last_run_rating,next_recheck_after';

export type NationalQueueStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'CRON_COMPLETED'
  | 'EXHAUSTED_NO_USCE';

export const RECHECK_DAYS: Record<RunRating, number> = {
  EXCELLENT: 90,
  GOOD: 90,
  AVERAGE: 45,
  POOR: 180,
};

export function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}
