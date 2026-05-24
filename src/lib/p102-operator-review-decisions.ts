/**
 * P102 Operator Review Decisions — local-only persistence.
 *
 * Storage:
 *   docs/platform-v2/local/usce-discovery-command-center/p102/exports/
 *     operator_review_decisions.json
 *
 * Schema:
 *   { byProgramName: { [exact-data.js-name]: OperatorDecision } }
 *
 * Reads are safe at any time. Writes must NEVER run in production —
 * the calling Server Action guards with `assertLocalOnly()`.
 *
 * The decisions captured here do not yet feed back into
 * verified-links.ts / listings-hidelist.ts automatically. They are
 * a structured queue of operator judgments that the next sprint can
 * apply (move to hidelist, flip verified flag, etc.) once reviewed.
 */

// Server-only: this module uses node:fs. Do not import from client components.
// Client-safe constants + types live in `./p102-operator-review-types`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import {
  DECISION_TYPES,
  DECISION_STATUSES,
  type DecisionType,
  type DecisionStatus,
  type OperatorDecision,
  type OperatorDecisionStore,
} from "./p102-operator-review-types";

export {
  DECISION_TYPES,
  DECISION_STATUSES,
  type DecisionType,
  type DecisionStatus,
  type OperatorDecision,
  type OperatorDecisionStore,
};

const STORE_PATH = path.resolve(
  process.cwd(),
  "docs/platform-v2/local/usce-discovery-command-center/p102/exports/operator_review_decisions.json"
);

function emptyStore(): OperatorDecisionStore {
  return { byProgramName: {}, updatedAt: new Date().toISOString() };
}

export function loadDecisions(): OperatorDecisionStore {
  if (!existsSync(STORE_PATH)) return emptyStore();
  try {
    const parsed = JSON.parse(readFileSync(STORE_PATH, "utf8"));
    if (!parsed || typeof parsed !== "object") return emptyStore();
    if (!parsed.byProgramName || typeof parsed.byProgramName !== "object") {
      return emptyStore();
    }
    return parsed as OperatorDecisionStore;
  } catch {
    return emptyStore();
  }
}

function isDecisionType(v: unknown): v is DecisionType {
  return typeof v === "string" && (DECISION_TYPES as readonly string[]).includes(v);
}

function isDecisionStatus(v: unknown): v is DecisionStatus {
  return typeof v === "string" && (DECISION_STATUSES as readonly string[]).includes(v);
}

/**
 * Validate + persist one decision. Caller must already have called
 * assertLocalOnly().
 */
export function saveDecision(input: {
  programName: string;
  decisionType: string;
  decisionStatus: string;
  note: string;
}): { ok: true } | { ok: false; error: string } {
  const programName = (input.programName || "").trim();
  if (!programName) return { ok: false, error: "programName required" };

  if (!isDecisionType(input.decisionType)) {
    return { ok: false, error: `decisionType invalid: ${input.decisionType}` };
  }
  if (!isDecisionStatus(input.decisionStatus)) {
    return { ok: false, error: `decisionStatus invalid: ${input.decisionStatus}` };
  }

  const note = (input.note || "").trim().slice(0, 1000);

  const store = loadDecisions();
  store.byProgramName[programName] = {
    programName,
    decisionType: input.decisionType,
    decisionStatus: input.decisionStatus,
    note,
    decidedAt: new Date().toISOString(),
  };
  store.updatedAt = new Date().toISOString();

  const dir = path.dirname(STORE_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2) + "\n", "utf8");
  return { ok: true };
}

/** Remove a decision for one program name. */
export function clearDecision(programName: string): { ok: boolean } {
  const store = loadDecisions();
  if (!(programName in store.byProgramName)) return { ok: true };
  delete store.byProgramName[programName];
  store.updatedAt = new Date().toISOString();
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2) + "\n", "utf8");
  return { ok: true };
}

/**
 * Aggregate counts across the store for the dashboard banner.
 */
export function getDecisionCounts(): Record<DecisionStatus | "DECIDED" | "TOTAL", number> {
  const store = loadDecisions();
  const decisions = Object.values(store.byProgramName);
  const counts: Record<string, number> = {};
  for (const s of DECISION_STATUSES) counts[s] = 0;
  for (const d of decisions) {
    counts[d.decisionStatus] = (counts[d.decisionStatus] ?? 0) + 1;
  }
  counts["DECIDED"] = decisions.filter((d) => d.decisionStatus !== "UNDECIDED").length;
  counts["TOTAL"] = decisions.length;
  return counts as Record<DecisionStatus | "DECIDED" | "TOTAL", number>;
}
