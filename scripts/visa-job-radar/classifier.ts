// Visa Job Radar — the single AI step (interface only in R1).
//
// The deterministic engine owns ground truth. This optional classifier exists
// to label genuinely ambiguous bounded text (e.g. unusual sponsorship wording
// the lexicon misses) and its every claim is re-checked by the deterministic
// validator before it can affect a publish decision. It is never an autonomous
// agent. In R1 it is not invoked: getAiClassifier returns null unless an API
// key is present, and the body is wired in Phase 2 following the P102 pattern
// (claude-opus-4-7, adaptive thinking, cached system prompt, schema output,
// char-offset quote validation).

import type { CleanedJob, Quote, VisaLabel } from "./types";

export interface AiVerdict {
  visaLabels: VisaLabel[];
  hasAffirmative: boolean;
  hasDenied: boolean;
  quotes: Quote[]; // offsets MUST index into cleanedText; validator re-checks
  rationale: string;
}

export interface AiClassifier {
  classify(job: CleanedJob): Promise<AiVerdict>;
}

export function getAiClassifier(): AiClassifier | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  // Phase 2 wires the bounded single-pass call here. Returning null in R1 keeps
  // the engine fully deterministic and offline-verifiable.
  return null;
}
