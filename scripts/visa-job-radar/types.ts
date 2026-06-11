// Visa Job Radar — shared type contract.
//
// The engine is built like a diagnostic test: high-sensitivity intake,
// high-specificity publish gate, and a held middle that is reviewed, never
// silently deleted. Deterministic code owns I/O and ground truth; the single
// AI step only classifies bounded text and every AI claim is re-checked
// against source by the deterministic validator.

export type Polarity = "AFFIRMATIVE" | "DENIED" | "BOILERPLATE";

export type JobStatus =
  | "PUBLISH"
  | "HOLD_REVIEW"
  | "VISA_SIGNAL_ONLY"
  // A physician opening at an employer that is a KNOWN H-1B physician sponsor in
  // public DOL LCA data, where the posting itself states no visa intent. Two cited
  // facts (employer-direct posting + government sponsor history), neither a
  // fabricated visa claim — surfaced as a lead, never as confirmed sponsorship.
  | "SPONSOR_LEAD"
  | "REJECT";

export type RejectReason =
  | "NO_VISA_MENTION"
  | "SPONSORSHIP_DENIED"
  | "NOT_PHYSICIAN"
  | "RECRUITER_ONLY"
  | "STALE"
  | "DUPLICATE"
  | "SOURCE_NOT_ALLOWED";

export type VisaLabel =
  | "EXPLICIT_J1_WAIVER"
  | "EXPLICIT_H1B"
  | "EXPLICIT_CONRAD"
  | "EXPLICIT_HHS_WAIVER"
  | "EXPLICIT_VISA_SPONSORSHIP"
  | "EXPLICIT_CAP_EXEMPT"
  // Statutory federal eligibility to APPOINT a non-citizen (e.g. 38 U.S.C. 7407
  // at the VA) — "employer may sponsor", a strictly weaker signal than the
  // EXPLICIT_* labels above ("employer will sponsor"). Caps at VISA_SIGNAL_ONLY.
  | "FEDERAL_NONCITIZEN_ELIGIBLE";

export type SourceTier = 1 | 2 | 3;

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface RawCandidate {
  sourceId: string;
  sourceTier: SourceTier;
  sourceUrl: string;
  fetchedAt: string; // ISO timestamp
  title: string;
  employer: string;
  facility?: string;
  city?: string;
  state?: string;
  postedDate?: string; // ISO date when known
  rawText: string;
  isFixture: boolean;
}

// cleanedText is canonical: every char offset in PhraseHit / Quote indexes
// into it, so quote display and validator slicing stay consistent even when
// normalization changes string length (e.g. an ellipsis char becomes "...").
export interface CleanedJob {
  raw: RawCandidate;
  cleanedText: string;
}

export interface PhraseHit {
  canonical: string;
  matchedText: string; // exact substring of cleanedText
  start: number;
  end: number;
  polarity: Polarity;
  labels: VisaLabel[];
}

export interface Quote {
  text: string;
  start: number;
  end: number;
}

export interface Classification {
  status: JobStatus;
  rejectReason?: RejectReason;
  visaLabels: VisaLabel[];
  quotes: Quote[];
  isPhysician: boolean;
  hasAffirmative: boolean;
  hasDenied: boolean;
  confidence: Confidence;
  notes: string[];
}

export interface RadarJob {
  raw: RawCandidate;
  cleanedText: string;
  phraseHits: PhraseHit[];
  classification: Classification;
  canonicalKey: string;
}

export interface RunReport {
  runId: string;
  startedAt: string;
  finishedAt: string;
  live: boolean;
  candidateCount: number;
  publishCount: number;
  holdCount: number;
  signalCount: number;
  sponsorLeadCount: number;
  rejectCount: number;
  rejectByReason: Record<RejectReason, number>;
  quoteValidationFailures: number;
  duplicatesDropped: number;
  manualReviewPct: number;
}
