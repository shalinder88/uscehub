/**
 * P102 Operator Review — shared types + constants.
 *
 * Pure module: no Node-only imports. Safe to import from client
 * components. The file-IO implementation lives in
 * `p102-operator-review-decisions.ts` (server-only).
 */

export const DECISION_TYPES = [
  "UNDECIDED",
  "OBSERVERSHIP",
  "VISITING_STUDENT_ELECTIVE",
  "VISITING_STUDENT_CLERKSHIP",
  "SUB_INTERNSHIP",
  "EXTERNSHIP",
  "INTERNATIONAL_VISITING_STUDENT",
  "RESEARCH_POSTDOC",
  "MULTI_SITE",
  "NOT_USCE",
  "OTHER",
] as const;
export type DecisionType = (typeof DECISION_TYPES)[number];

export const DECISION_STATUSES = [
  "UNDECIDED",
  "VERIFIED_LIVE",
  "LINK_DEAD",
  "NOT_USCE",
  "HIDE",
  "KEEP_VERIFY",
  "DEFER",
] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export interface OperatorDecision {
  programName: string;
  decisionType: DecisionType;
  decisionStatus: DecisionStatus;
  note: string;
  decidedAt: string; // ISO timestamp
}

export interface OperatorDecisionStore {
  byProgramName: Record<string, OperatorDecision>;
  updatedAt: string;
}
