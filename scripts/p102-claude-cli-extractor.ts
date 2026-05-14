#!/usr/bin/env tsx
/**
 * P102-0E Claude CLI claim-extractor orchestrator.
 *
 * For each P102 institution run, for each accepted source, invokes the local
 * `claude` CLI (Claude Code) in headless mode (`-p`) with a strict JSON schema
 * for each of A1 (broad reader) and A2 (depth reader). After both per-source
 * phases complete, invokes A3 (hostile gate) once at the run level over the
 * merged claim ledger.
 *
 * No API key required. The CLI uses the operator's already-authenticated
 * Claude Code session. No `@anthropic-ai/sdk` dependency. No Agent / subagent
 * during inference; tools are disabled via `--tools ""`.
 *
 * After each model phase, the script:
 *   1. Validates exit code 0 + parseable JSON (CLI --json-schema also enforces).
 *   2. Quote-verifies every claim against the cleaned text file (whitespace-
 *      normalized substring match via `isQuoteVerifiable`).
 *   3. Re-classifies visibility via `classifyVisibility` (script authoritative;
 *      model output advisory).
 *   4. Writes per-run artifacts (A1/A2/A3 JSON + reports + merged claims +
 *      rejected claims + log files).
 *
 * Usage:
 *   npx tsx scripts/p102-claude-cli-extractor.ts --run-id p102-1-trial-2-run-1
 *   npx tsx scripts/p102-claude-cli-extractor.ts --all-existing-p102-runs --max-runs 4
 *   npx tsx scripts/p102-claude-cli-extractor.ts --all-existing-p102-runs --dry-run
 *   npx tsx scripts/p102-claude-cli-extractor.ts --run-id <id> --phase A1
 *   npx tsx scripts/p102-claude-cli-extractor.ts --run-id <id> --max-sources-per-run 1
 *
 * Flags:
 *   --run-id <id>                  process one run
 *   --all-existing-p102-runs       process every run whose folder exists under p102/runs/
 *   --max-runs N                   cap on number of runs (with --all-existing-...)
 *   --max-sources-per-run N        cap on accepted sources per run (testing)
 *   --phase A1|A2|A3|ALL           default ALL
 *   --dry-run                      print prompt-packet shapes; no CLI calls
 *   --max-budget-usd N             pass through to `claude --max-budget-usd`
 *   --model <id>                   default claude-opus-4-7
 *   --quiet                        less stdout chatter
 *
 * Hard guarantees:
 *   - No network during inference (CLI tools disabled).
 *   - No Agent / subagent (CLI tools disabled).
 *   - No public-safe claim escapes without quote-verified + scope-checked status.
 *   - On any single-run failure, other runs continue (best-effort across the batch).
 */

import { spawn } from 'node:child_process';
import {
  existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync,
} from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import {
  isQuoteVerifiable,
  classifyVisibility,
  type Visibility,
  type InstitutionContext as LibInstitutionContext,
} from './p102-extraction-lib';

// -------------------- Paths --------------------

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102');
const PROMPTS_DIR = path.join(DOCS_ROOT, 'prompts');
const RUNS_DIR = path.join(DOCS_ROOT, 'runs');
const T7_LOGS_ROOT = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/logs';

const A1_PROMPT_FILE = path.join(PROMPTS_DIR, 'P102_A1_CLAUDE_CLI_READER_PROMPT.md');
const A2_PROMPT_FILE = path.join(PROMPTS_DIR, 'P102_A2_CLAUDE_CLI_DEPTH_PROMPT.md');
const A3_PROMPT_FILE = path.join(PROMPTS_DIR, 'P102_A3_CLAUDE_CLI_GATE_PROMPT.md');

const CLI_SCHEMA_VERSION = 'p102-cli-0e-1';
const CLEANED_TEXT_MAX_CHARS = 60_000;

// -------------------- Types --------------------

type Phase = 'A1' | 'A2' | 'A3' | 'ALL';

interface CliOptions {
  runIds: string[];
  maxRuns: number | null;
  maxSourcesPerRun: number | null;
  phase: Phase;
  dryRun: boolean;
  maxBudgetUsd: number | null;
  model: string;
  quiet: boolean;
  rebuildLedgerFromDisk: boolean;
}

interface SourceRecord {
  sourceId: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string | null;
  sourceFamily: string;
  sourceScope: string;
  acceptedForExtraction: boolean;
  cleanedTextPath: string | null;
  rawHtmlPath: string | null;
  sourceHash: string | null;
  capturedAt: string | null;
}

interface SourceMap {
  schemaVersion: string;
  runId: string;
  sources: SourceRecord[];
}

interface CanonicalInstitution {
  schemaVersion: string;
  institutionId: string;
  canonicalName: string;
  officialDomains: string[];
  parentSystem: string | null;
}

interface ModelClaimCandidate {
  claimId: string;
  claimType: string;
  lane: string;
  sourceUrl: string;
  sourceHash: string;
  cleanedTextPath: string;
  sourceScope: string;
  quote: string;
  normalizedField: string | null;
  claimText: string;
  visibilityLaneSuggestedByModel: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  limitations: string | null;
  whyA1Missed?: string;
}

interface VerifiedClaim extends ModelClaimCandidate {
  schemaVersion: string;
  runId: string;
  institutionId: string;
  sourceFamily: string;
  visibility: Visibility;
  visibilityRationale: string | null;
  quoteVerified: true;
  phaseProducedBy: 'A1' | 'A2';
}

interface RejectedClaim extends ModelClaimCandidate {
  schemaVersion: string;
  runId: string;
  institutionId: string;
  sourceFamily: string;
  quoteVerified: boolean;
  rejectionReason: string;
  phaseProducedBy: 'A1' | 'A2';
}

interface A1OutputJson {
  schemaVersion: string;
  runId: string;
  institutionId: string;
  institutionName: string;
  networkUsed: boolean;
  agentUsed: boolean;
  claims: ModelClaimCandidate[];
  opportunities: ModelClaimCandidate[];
  negativeEvidenceClaims: ModelClaimCandidate[];
  futureLaneSignals: ModelClaimCandidate[];
  sourceScopeConflicts: ModelClaimCandidate[];
  unresolveds: string[];
  recommendedA2Focus: string[];
}

interface A2OutputJson {
  schemaVersion: string;
  runId: string;
  institutionId: string;
  institutionName: string;
  networkUsed: boolean;
  agentUsed: boolean;
  phase: 'A2';
  newClaims: ModelClaimCandidate[];
  a1ClaimsToRefine: { a1ClaimId: string; refinementReason: string; explanation: string }[];
  additionalUnresolveds: string[];
  recommendedA3Focus: string[];
}

interface A3OutputJson {
  schemaVersion: string;
  runId: string;
  institutionId: string;
  institutionName: string;
  networkUsed: boolean;
  agentUsed: boolean;
  phase: 'A3';
  verdict: string;
  verdictSummary: string;
  publicSafetyFailures: unknown[];
  claimsToDowngrade: unknown[];
  scopeConflicts: unknown[];
  duplicates: unknown[];
  unresolveds: string[];
  attestations: { networkUsed: boolean; agentUsed: boolean; readOnlyRunFolder: boolean; everyPublicSafeClaimQuoteVerified: boolean; everyPublicSafeClaimSourceFamilyChecked: boolean; everyPublicSafeClaimSourceScopeChecked: boolean };
  metadata: Record<string, number>;
}

// -------------------- CLI args --------------------

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    runIds: [],
    maxRuns: null,
    maxSourcesPerRun: null,
    phase: 'ALL',
    dryRun: false,
    maxBudgetUsd: null,
    model: 'claude-opus-4-7',
    quiet: false,
    rebuildLedgerFromDisk: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-id') { opts.runIds.push(argv[++i]); continue; }
    if (a === '--all-existing-p102-runs') {
      if (!existsSync(RUNS_DIR)) throw new Error(`runs dir not found: ${RUNS_DIR}`);
      const entries = readdirSync(RUNS_DIR).filter((e) => {
        const p = path.join(RUNS_DIR, e);
        if (!statSync(p).isDirectory()) return false;
        if (!existsSync(path.join(p, '01_source_map.json'))) return false;
        // Include only runs that have at least one accepted+fetched source.
        try {
          const sm = JSON.parse(readFileSync(path.join(p, '01_source_map.json'), 'utf8')) as { sources?: Array<{ acceptedForExtraction?: boolean; cleanedTextPath?: string | null }> };
          return (sm.sources ?? []).some((s) => s.acceptedForExtraction === true && s.cleanedTextPath);
        } catch {
          return false;
        }
      });
      opts.runIds.push(...entries);
      continue;
    }
    if (a === '--max-runs') { opts.maxRuns = parseInt(argv[++i], 10); continue; }
    if (a === '--max-sources-per-run') { opts.maxSourcesPerRun = parseInt(argv[++i], 10); continue; }
    if (a === '--phase') { opts.phase = argv[++i].toUpperCase() as Phase; continue; }
    if (a === '--dry-run') { opts.dryRun = true; continue; }
    if (a === '--max-budget-usd') { opts.maxBudgetUsd = parseFloat(argv[++i]); continue; }
    if (a === '--model') { opts.model = argv[++i]; continue; }
    if (a === '--quiet') { opts.quiet = true; continue; }
    if (a === '--rebuild-ledger-from-disk') { opts.rebuildLedgerFromDisk = true; continue; }
    if (a === '--help' || a === '-h') { printUsage(); process.exit(0); }
    throw new Error(`unknown flag: ${a}`);
  }
  if (opts.maxRuns != null) opts.runIds = opts.runIds.slice(0, opts.maxRuns);
  if (opts.runIds.length === 0) throw new Error('must pass --run-id <id> or --all-existing-p102-runs');
  return opts;
}

function printUsage(): void {
  console.log('Usage: npx tsx scripts/p102-claude-cli-extractor.ts [flags]');
  console.log('  --run-id <id>                  process one run');
  console.log('  --all-existing-p102-runs       process every existing run folder');
  console.log('  --max-runs N                   cap on number of runs');
  console.log('  --max-sources-per-run N        cap on sources per run (testing)');
  console.log('  --phase A1|A2|A3|ALL           default ALL');
  console.log('  --dry-run                      print packet shapes; no CLI calls');
  console.log('  --max-budget-usd N             pass through to claude');
  console.log('  --model <id>                   default claude-opus-4-7');
  console.log('  --quiet                        less stdout chatter');
}

// -------------------- claude CLI discovery --------------------

function findClaudeCli(): string {
  const candidates = [
    process.env.CLAUDE_CLI_PATH,
    path.join(process.env.HOME || '', '.local/bin/claude'),
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
    'claude',
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    if (p === 'claude') continue;
    if (existsSync(p)) return p;
  }
  // Fall back to PATH lookup.
  return 'claude';
}

// -------------------- File helpers --------------------

function readJson<T>(p: string): T { return JSON.parse(readFileSync(p, 'utf8')) as T; }
function writeJson(p: string, data: unknown): void {
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function writeText(p: string, s: string): void {
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, s, 'utf8');
}

function safeReadCleanedText(srcPath: string): string | null {
  if (!srcPath) return null;
  if (!existsSync(srcPath)) {
    const altRoot = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/artifacts';
    // The path may be valid but T7 disconnected; try as-is and warn.
    if (!existsSync('/Volumes/T7Shield_Code')) return null;
    if (!existsSync(srcPath)) return null;
  }
  const txt = readFileSync(srcPath, 'utf8');
  // Truncate at CLEANED_TEXT_MAX_CHARS to keep token cost in check.
  return txt.length > CLEANED_TEXT_MAX_CHARS ? txt.slice(0, CLEANED_TEXT_MAX_CHARS) : txt;
}

function sha256(s: string): string { return createHash('sha256').update(s, 'utf8').digest('hex'); }

// -------------------- JSON schemas (passed to claude --json-schema) --------------------

const CLAIM_SHAPE = {
  type: 'object',
  required: ['claimId', 'claimType', 'lane', 'sourceUrl', 'sourceHash', 'cleanedTextPath', 'sourceScope', 'quote', 'claimText', 'visibilityLaneSuggestedByModel', 'confidence'],
  properties: {
    claimId: { type: 'string' },
    claimType: { type: 'string' },
    lane: { type: 'string' },
    sourceUrl: { type: 'string' },
    sourceHash: { type: 'string' },
    cleanedTextPath: { type: 'string' },
    sourceScope: { type: 'string' },
    quote: { type: 'string', maxLength: 500 },
    normalizedField: { type: ['string', 'null'] },
    claimText: { type: 'string', maxLength: 400 },
    visibilityLaneSuggestedByModel: { type: 'string' },
    confidence: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
    limitations: { type: ['string', 'null'] },
  },
  additionalProperties: false,
};

const CLAIM_SHAPE_A2 = {
  ...CLAIM_SHAPE,
  required: [...CLAIM_SHAPE.required, 'whyA1Missed'],
  properties: { ...CLAIM_SHAPE.properties, whyA1Missed: { type: 'string', maxLength: 400 } },
};

const A1_SCHEMA = {
  type: 'object',
  required: ['schemaVersion', 'runId', 'institutionId', 'institutionName', 'networkUsed', 'agentUsed', 'claims', 'opportunities', 'negativeEvidenceClaims', 'futureLaneSignals', 'sourceScopeConflicts', 'unresolveds', 'recommendedA2Focus'],
  properties: {
    schemaVersion: { type: 'string', const: CLI_SCHEMA_VERSION },
    runId: { type: 'string' },
    institutionId: { type: 'string' },
    institutionName: { type: 'string' },
    networkUsed: { type: 'boolean', const: false },
    agentUsed: { type: 'boolean', const: false },
    claims: { type: 'array', items: CLAIM_SHAPE },
    opportunities: { type: 'array', items: CLAIM_SHAPE },
    negativeEvidenceClaims: { type: 'array', items: CLAIM_SHAPE },
    futureLaneSignals: { type: 'array', items: CLAIM_SHAPE },
    sourceScopeConflicts: { type: 'array', items: CLAIM_SHAPE },
    unresolveds: { type: 'array', items: { type: 'string' } },
    recommendedA2Focus: { type: 'array', items: { type: 'string' } },
  },
  additionalProperties: false,
};

const A2_SCHEMA = {
  type: 'object',
  required: ['schemaVersion', 'runId', 'institutionId', 'institutionName', 'networkUsed', 'agentUsed', 'phase', 'newClaims', 'a1ClaimsToRefine', 'additionalUnresolveds', 'recommendedA3Focus'],
  properties: {
    schemaVersion: { type: 'string', const: CLI_SCHEMA_VERSION },
    runId: { type: 'string' },
    institutionId: { type: 'string' },
    institutionName: { type: 'string' },
    networkUsed: { type: 'boolean', const: false },
    agentUsed: { type: 'boolean', const: false },
    phase: { type: 'string', const: 'A2' },
    newClaims: { type: 'array', items: CLAIM_SHAPE_A2 },
    a1ClaimsToRefine: {
      type: 'array',
      items: {
        type: 'object',
        required: ['a1ClaimId', 'refinementReason', 'explanation'],
        properties: {
          a1ClaimId: { type: 'string' },
          refinementReason: { type: 'string' },
          explanation: { type: 'string', maxLength: 400 },
        },
        additionalProperties: false,
      },
    },
    additionalUnresolveds: { type: 'array', items: { type: 'string' } },
    recommendedA3Focus: { type: 'array', items: { type: 'string' } },
  },
  additionalProperties: false,
};

const A3_SCHEMA = {
  type: 'object',
  required: ['schemaVersion', 'runId', 'institutionId', 'institutionName', 'networkUsed', 'agentUsed', 'phase', 'verdict', 'verdictSummary', 'publicSafetyFailures', 'claimsToDowngrade', 'scopeConflicts', 'duplicates', 'unresolveds', 'attestations', 'metadata'],
  properties: {
    schemaVersion: { type: 'string', const: CLI_SCHEMA_VERSION },
    runId: { type: 'string' },
    institutionId: { type: 'string' },
    institutionName: { type: 'string' },
    networkUsed: { type: 'boolean', const: false },
    agentUsed: { type: 'boolean', const: false },
    phase: { type: 'string', const: 'A3' },
    verdict: { type: 'string', enum: ['PASS_PUBLISH_READY', 'PASS_WITH_DOWNGRADES', 'FAIL_PUBLIC_SAFETY', 'FAIL_REVIEW_REQUIRED'] },
    verdictSummary: { type: 'string', maxLength: 800 },
    publicSafetyFailures: { type: 'array' },
    claimsToDowngrade: { type: 'array' },
    scopeConflicts: { type: 'array' },
    duplicates: { type: 'array' },
    unresolveds: { type: 'array', items: { type: 'string' } },
    attestations: {
      type: 'object',
      required: ['networkUsed', 'agentUsed', 'readOnlyRunFolder', 'everyPublicSafeClaimQuoteVerified', 'everyPublicSafeClaimSourceFamilyChecked', 'everyPublicSafeClaimSourceScopeChecked'],
      properties: {
        networkUsed: { type: 'boolean', const: false },
        agentUsed: { type: 'boolean', const: false },
        readOnlyRunFolder: { type: 'boolean' },
        everyPublicSafeClaimQuoteVerified: { type: 'boolean' },
        everyPublicSafeClaimSourceFamilyChecked: { type: 'boolean' },
        everyPublicSafeClaimSourceScopeChecked: { type: 'boolean' },
      },
    },
    metadata: { type: 'object' },
  },
  additionalProperties: false,
};

// -------------------- Prompt-packet builders --------------------

function buildA1Packet(args: {
  runId: string;
  institutionId: string;
  institutionName: string;
  source: SourceRecord;
  cleanedText: string;
}): string {
  return JSON.stringify({
    runId: args.runId,
    institutionId: args.institutionId,
    institutionName: args.institutionName,
    networkUsed: false,
    agentUsed: false,
    source: {
      sourceId: args.source.sourceId,
      sourceUrl: args.source.sourceUrl,
      sourceDomain: args.source.sourceDomain,
      sourceTitle: args.source.sourceTitle,
      sourceFamily: args.source.sourceFamily,
      sourceScope: args.source.sourceScope,
      sourceHash: args.source.sourceHash,
      cleanedTextPath: args.source.cleanedTextPath,
    },
    cleanedText: args.cleanedText,
    instructions: 'Read the cleaned text. Emit strict JSON conforming to the A1 schema. Verbatim quotes only. NOT_STATED_ON_SOURCE if absent.',
  });
}

function buildA2Packet(args: {
  runId: string;
  institutionId: string;
  institutionName: string;
  source: SourceRecord;
  cleanedText: string;
  a1Output: A1OutputJson;
  a1ClaimsForThisSource: ModelClaimCandidate[];
}): string {
  return JSON.stringify({
    runId: args.runId,
    institutionId: args.institutionId,
    institutionName: args.institutionName,
    networkUsed: false,
    agentUsed: false,
    source: {
      sourceId: args.source.sourceId,
      sourceUrl: args.source.sourceUrl,
      sourceDomain: args.source.sourceDomain,
      sourceTitle: args.source.sourceTitle,
      sourceFamily: args.source.sourceFamily,
      sourceScope: args.source.sourceScope,
      sourceHash: args.source.sourceHash,
      cleanedTextPath: args.source.cleanedTextPath,
    },
    a1ClaimsForThisSource: args.a1ClaimsForThisSource,
    a1Unresolveds: args.a1Output.unresolveds,
    a1RecommendedA2Focus: args.a1Output.recommendedA2Focus,
    cleanedText: args.cleanedText,
    instructions: 'Emit additive new claims only — do not duplicate A1. Flag A1 claims to refine in a1ClaimsToRefine.',
  });
}

function buildA3Packet(args: {
  runId: string;
  institutionId: string;
  institutionName: string;
  institutionDomain: string;
  sources: SourceRecord[];
  mergedVerified: VerifiedClaim[];
  mergedRejected: RejectedClaim[];
}): string {
  return JSON.stringify({
    runId: args.runId,
    institutionId: args.institutionId,
    institutionName: args.institutionName,
    institutionDomain: args.institutionDomain,
    networkUsed: false,
    agentUsed: false,
    sources: args.sources.map((s) => ({
      sourceId: s.sourceId,
      sourceUrl: s.sourceUrl,
      sourceDomain: s.sourceDomain,
      sourceTitle: s.sourceTitle,
      sourceFamily: s.sourceFamily,
      sourceScope: s.sourceScope,
      sourceHash: s.sourceHash,
    })),
    mergedClaimLedger: args.mergedVerified.map((c) => ({
      claimId: c.claimId,
      claimType: c.claimType,
      lane: c.lane,
      sourceUrl: c.sourceUrl,
      sourceFamily: c.sourceFamily,
      sourceScope: c.sourceScope,
      quote: c.quote,
      claimText: c.claimText,
      visibilityModelSuggested: c.visibilityLaneSuggestedByModel,
      finalVisibility: c.visibility,
      confidence: c.confidence,
      phaseProducedBy: c.phaseProducedBy,
    })),
    rejectedClaimsCount: args.mergedRejected.length,
    instructions: 'Adversarial review. Identify unsupported claims, scope conflicts, public-safety failures, duplicates. Verdict + per-claim recommendations.',
  });
}

// -------------------- claude CLI invocation --------------------

interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function invokeClaudeCli(args: {
  cliPath: string;
  systemPromptFile: string;
  userMessage: string;
  jsonSchema: object;
  model: string;
  maxBudgetUsd: number | null;
  addDir: string;
  logStdoutPath: string;
  logStderrPath: string;
}): Promise<CliResult> {
  return new Promise((resolveP) => {
    const flags = [
      '-p',
      '--output-format', 'json',
      '--system-prompt-file', args.systemPromptFile,
      '--json-schema', JSON.stringify(args.jsonSchema),
      '--tools', '',
      '--model', args.model,
      '--no-session-persistence',
      '--add-dir', args.addDir,
    ];
    if (args.maxBudgetUsd != null) {
      flags.push('--max-budget-usd', String(args.maxBudgetUsd));
    }
    const child = spawn(args.cliPath, flags, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      mkdirSync(path.dirname(args.logStdoutPath), { recursive: true });
      writeFileSync(args.logStdoutPath, stdout, 'utf8');
      writeFileSync(args.logStderrPath, stderr, 'utf8');
      resolveP({ exitCode: code ?? -1, stdout, stderr });
    });
    child.on('error', (err) => {
      stderr += `\n[spawn-error] ${err.message}`;
      resolveP({ exitCode: -1, stdout, stderr });
    });
    // Pipe user message via stdin.
    child.stdin.write(args.userMessage);
    child.stdin.end();
  });
}

/**
 * Parse the JSON result from `claude --output-format json --json-schema ...`.
 *
 * Observed shape from `claude -p --output-format json --json-schema ...`:
 *   {
 *     "type": "result", "subtype": "success", "is_error": false,
 *     "result": "...",                  // may be empty when --json-schema is used
 *     "structured_output": { ... },     // the schema-validated object
 *     "usage": { ... }, "modelUsage": { ... }, ...
 *   }
 *
 * We prefer `structured_output` (schema-enforced). Fall back to a JSON-parsed
 * `result` string, then to a top-level object that looks like the schema.
 */
function parseCliJsonResult(stdout: string): { ok: true; data: unknown } | { ok: false; error: string } {
  const trimmed = stdout.trim();
  if (!trimmed) return { ok: false, error: 'empty stdout' };
  try {
    const top = JSON.parse(trimmed);
    if (typeof top === 'object' && top !== null) {
      const obj = top as Record<string, unknown>;
      if ('is_error' in obj && obj.is_error === true) {
        const msg = typeof obj.result === 'string' ? obj.result : JSON.stringify(obj.result ?? '');
        return { ok: false, error: `CLI is_error=true: ${msg.slice(0, 400)}` };
      }
      if ('structured_output' in obj && typeof obj.structured_output === 'object' && obj.structured_output !== null) {
        return { ok: true, data: obj.structured_output };
      }
      if ('result' in obj && typeof obj.result === 'string' && obj.result.trim().length > 0) {
        try { return { ok: true, data: JSON.parse(obj.result) }; } catch { /* fall through */ }
      }
      if ('result' in obj && typeof obj.result === 'object' && obj.result !== null) {
        return { ok: true, data: obj.result };
      }
      if ('schemaVersion' in obj) return { ok: true, data: obj };
    }
    return { ok: true, data: top };
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (fenced) {
      try { return { ok: true, data: JSON.parse(fenced[1]) }; } catch (e) { return { ok: false, error: `fenced JSON parse failed: ${(e as Error).message}` }; }
    }
    return { ok: false, error: 'top-level JSON parse failed' };
  }
}

// -------------------- Quote verify + visibility reclassify --------------------

function verifyAndReclassify(args: {
  candidates: ModelClaimCandidate[];
  cleanedTextBySource: Map<string, string>;
  sourcesByUrl: Map<string, SourceRecord>;
  runId: string;
  institutionId: string;
  phaseProducedBy: 'A1' | 'A2';
}): { verified: VerifiedClaim[]; rejected: RejectedClaim[] } {
  const verified: VerifiedClaim[] = [];
  const rejected: RejectedClaim[] = [];

  for (const c of args.candidates) {
    const src = args.sourcesByUrl.get(c.sourceUrl);
    if (!src) {
      rejected.push({
        ...c,
        schemaVersion: CLI_SCHEMA_VERSION, runId: args.runId, institutionId: args.institutionId,
        sourceFamily: 'UNKNOWN',
        quoteVerified: false, rejectionReason: `unknown_source_url: ${c.sourceUrl}`,
        phaseProducedBy: args.phaseProducedBy,
      });
      continue;
    }

    const text = args.cleanedTextBySource.get(src.sourceUrl) ?? '';
    const quoteOk = c.quote === 'NOT_STATED_ON_SOURCE' || isQuoteVerifiable(c.quote, text);

    if (!quoteOk) {
      rejected.push({
        ...c,
        schemaVersion: CLI_SCHEMA_VERSION, runId: args.runId, institutionId: args.institutionId,
        sourceFamily: src.sourceFamily,
        quoteVerified: false, rejectionReason: 'quote_not_in_cleaned_text',
        phaseProducedBy: args.phaseProducedBy,
      });
      continue;
    }

    // Map the model's lane to the classifier's matchedLane.
    const matchedLane = mapLaneToClassifierInput(c.lane);

    const result = classifyVisibility({
      sourceFamily: src.sourceFamily,
      sourceScope: src.sourceScope === 'UNKNOWN_SCOPE' ? c.sourceScope : src.sourceScope,
      matchedLane,
      campusApplicabilityProof: null,
      modelReaderConfidence: c.confidence,
    });

    verified.push({
      ...c,
      schemaVersion: CLI_SCHEMA_VERSION,
      runId: args.runId,
      institutionId: args.institutionId,
      sourceFamily: src.sourceFamily,
      visibility: result.visibility,
      visibilityRationale: result.notPublicReason,
      quoteVerified: true,
      phaseProducedBy: args.phaseProducedBy,
    });
  }

  return { verified, rejected };
}

function mapLaneToClassifierInput(lane: string): 'IMG_OBSERVERSHIP' | 'VISITING_MEDICAL_STUDENT' | 'RESEARCH_OPPORTUNITY' | 'NO_PUBLIC_OPPORTUNITY_FOUND' | 'CAREERS_PAGE' | 'RESIDENCY_PROGRAM_INFO' | 'FELLOWSHIP_PROGRAM_INFO' | 'PHYSICIAN_SERVICES' {
  switch (lane) {
    case 'IMG_OBSERVERSHIP': return 'IMG_OBSERVERSHIP';
    case 'VISITING_MEDICAL_STUDENT': return 'VISITING_MEDICAL_STUDENT';
    case 'INTERNATIONAL_MEDICAL_STUDENT': return 'VISITING_MEDICAL_STUDENT';
    case 'CLINICAL_ELECTIVE': return 'VISITING_MEDICAL_STUDENT';
    case 'AWAY_ROTATION': return 'VISITING_MEDICAL_STUDENT';
    case 'SUB_INTERNSHIP': return 'VISITING_MEDICAL_STUDENT';
    case 'RESEARCH_OPPORTUNITY': return 'RESEARCH_OPPORTUNITY';
    case 'RESIDENCY_PROGRAM_INFO': return 'RESIDENCY_PROGRAM_INFO';
    case 'FELLOWSHIP_PROGRAM_INFO': return 'FELLOWSHIP_PROGRAM_INFO';
    case 'ADVANCED_FELLOWSHIP': return 'FELLOWSHIP_PROGRAM_INFO';
    case 'CAREERS_PAGE': return 'CAREERS_PAGE';
    case 'PHYSICIAN_SERVICES': return 'PHYSICIAN_SERVICES';
    case 'NO_PUBLIC_OPPORTUNITY_FOUND': return 'NO_PUBLIC_OPPORTUNITY_FOUND';
    default: return 'NO_PUBLIC_OPPORTUNITY_FOUND';
  }
}

// -------------------- A1 / A2 / A3 gate functions --------------------

function gateA1Output(data: unknown, runId: string): { ok: true; data: A1OutputJson } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'A1 output is not an object' };
  const o = data as Partial<A1OutputJson>;
  const missing: string[] = [];
  for (const k of ['schemaVersion', 'runId', 'institutionId', 'institutionName', 'networkUsed', 'agentUsed', 'claims']) {
    if (!(k in o)) missing.push(k);
  }
  if (missing.length > 0) return { ok: false, error: `A1 missing keys: ${missing.join(', ')}` };
  if (o.networkUsed !== false) return { ok: false, error: 'A1 networkUsed must be false' };
  if (o.agentUsed !== false) return { ok: false, error: 'A1 agentUsed must be false' };
  if (o.runId !== runId) return { ok: false, error: `A1 runId mismatch: got "${o.runId}", expected "${runId}"` };
  return { ok: true, data: o as A1OutputJson };
}

function gateA2Output(data: unknown, runId: string): { ok: true; data: A2OutputJson } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'A2 output is not an object' };
  const o = data as Partial<A2OutputJson>;
  for (const k of ['schemaVersion', 'runId', 'institutionId', 'networkUsed', 'agentUsed', 'phase', 'newClaims', 'a1ClaimsToRefine']) {
    if (!(k in o)) return { ok: false, error: `A2 missing key: ${k}` };
  }
  if (o.phase !== 'A2') return { ok: false, error: 'A2 phase must be "A2"' };
  if (o.networkUsed !== false) return { ok: false, error: 'A2 networkUsed must be false' };
  if (o.agentUsed !== false) return { ok: false, error: 'A2 agentUsed must be false' };
  if (o.runId !== runId) return { ok: false, error: `A2 runId mismatch: got "${o.runId}", expected "${runId}"` };
  return { ok: true, data: o as A2OutputJson };
}

function gateA3Output(data: unknown, runId: string): { ok: true; data: A3OutputJson } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'A3 output is not an object' };
  const o = data as Partial<A3OutputJson>;
  for (const k of ['schemaVersion', 'runId', 'institutionId', 'networkUsed', 'agentUsed', 'phase', 'verdict', 'attestations']) {
    if (!(k in o)) return { ok: false, error: `A3 missing key: ${k}` };
  }
  if (o.phase !== 'A3') return { ok: false, error: 'A3 phase must be "A3"' };
  if (o.networkUsed !== false) return { ok: false, error: 'A3 networkUsed must be false' };
  if (o.agentUsed !== false) return { ok: false, error: 'A3 agentUsed must be false' };
  if (o.runId !== runId) return { ok: false, error: `A3 runId mismatch: got "${o.runId}", expected "${runId}"` };
  const valid = ['PASS_PUBLISH_READY', 'PASS_WITH_DOWNGRADES', 'FAIL_PUBLIC_SAFETY', 'FAIL_REVIEW_REQUIRED'];
  if (!valid.includes(o.verdict as string)) return { ok: false, error: `A3 verdict invalid: ${o.verdict}` };
  return { ok: true, data: o as A3OutputJson };
}

// -------------------- Per-source phase runners --------------------

async function runPhaseA1ForSource(args: {
  cliPath: string;
  runId: string;
  runDir: string;
  institutionId: string;
  institutionName: string;
  source: SourceRecord;
  cleanedText: string;
  opts: CliOptions;
}): Promise<{ ok: boolean; output: A1OutputJson | null; error: string | null }> {
  const packet = buildA1Packet({
    runId: args.runId,
    institutionId: args.institutionId,
    institutionName: args.institutionName,
    source: args.source,
    cleanedText: args.cleanedText,
  });

  if (args.opts.dryRun) {
    if (!args.opts.quiet) {
      console.log(`[dry-run A1] ${args.runId}/${args.source.sourceId} ${args.source.sourceUrl}`);
      console.log(`  system prompt: ${A1_PROMPT_FILE}`);
      console.log(`  packet bytes:  ${packet.length}`);
      console.log(`  cleaned text:  ${args.cleanedText.length} chars`);
    }
    return { ok: true, output: null, error: null };
  }

  const logStdoutPath = path.join(args.runDir, 'logs', `A1.${args.source.sourceId}.stdout.log`);
  const logStderrPath = path.join(args.runDir, 'logs', `A1.${args.source.sourceId}.stderr.log`);

  const result = await invokeClaudeCli({
    cliPath: args.cliPath,
    systemPromptFile: A1_PROMPT_FILE,
    userMessage: packet,
    jsonSchema: A1_SCHEMA,
    model: args.opts.model,
    maxBudgetUsd: args.opts.maxBudgetUsd,
    addDir: REPO_ROOT,
    logStdoutPath,
    logStderrPath,
  });

  if (result.exitCode !== 0) {
    return { ok: false, output: null, error: `A1 claude exit ${result.exitCode}: ${result.stderr.slice(0, 300)}` };
  }

  const parsed = parseCliJsonResult(result.stdout);
  if (parsed.ok === false) {
    return { ok: false, output: null, error: `A1 parse failed: ${parsed.error}` };
  }

  const gated = gateA1Output(parsed.data, args.runId);
  if (gated.ok === false) {
    return { ok: false, output: null, error: gated.error };
  }

  return { ok: true, output: gated.data, error: null };
}

async function runPhaseA2ForSource(args: {
  cliPath: string;
  runId: string;
  runDir: string;
  institutionId: string;
  institutionName: string;
  source: SourceRecord;
  cleanedText: string;
  a1Output: A1OutputJson;
  a1ClaimsForThisSource: ModelClaimCandidate[];
  opts: CliOptions;
}): Promise<{ ok: boolean; output: A2OutputJson | null; error: string | null }> {
  const packet = buildA2Packet({
    runId: args.runId,
    institutionId: args.institutionId,
    institutionName: args.institutionName,
    source: args.source,
    cleanedText: args.cleanedText,
    a1Output: args.a1Output,
    a1ClaimsForThisSource: args.a1ClaimsForThisSource,
  });

  if (args.opts.dryRun) {
    if (!args.opts.quiet) {
      console.log(`[dry-run A2] ${args.runId}/${args.source.sourceId} ${args.source.sourceUrl}`);
      console.log(`  system prompt: ${A2_PROMPT_FILE}`);
      console.log(`  packet bytes:  ${packet.length}`);
      console.log(`  a1 claims included: ${args.a1ClaimsForThisSource.length}`);
    }
    return { ok: true, output: null, error: null };
  }

  const logStdoutPath = path.join(args.runDir, 'logs', `A2.${args.source.sourceId}.stdout.log`);
  const logStderrPath = path.join(args.runDir, 'logs', `A2.${args.source.sourceId}.stderr.log`);

  const result = await invokeClaudeCli({
    cliPath: args.cliPath,
    systemPromptFile: A2_PROMPT_FILE,
    userMessage: packet,
    jsonSchema: A2_SCHEMA,
    model: args.opts.model,
    maxBudgetUsd: args.opts.maxBudgetUsd,
    addDir: REPO_ROOT,
    logStdoutPath,
    logStderrPath,
  });

  if (result.exitCode !== 0) return { ok: false, output: null, error: `A2 claude exit ${result.exitCode}: ${result.stderr.slice(0, 300)}` };
  const parsed = parseCliJsonResult(result.stdout);
  if (parsed.ok === false) return { ok: false, output: null, error: `A2 parse failed: ${parsed.error}` };
  const gated = gateA2Output(parsed.data, args.runId);
  if (gated.ok === false) return { ok: false, output: null, error: gated.error };
  return { ok: true, output: gated.data, error: null };
}

async function runPhaseA3ForRun(args: {
  cliPath: string;
  runId: string;
  runDir: string;
  institutionId: string;
  institutionName: string;
  institutionDomain: string;
  acceptedSources: SourceRecord[];
  verified: VerifiedClaim[];
  rejected: RejectedClaim[];
  opts: CliOptions;
}): Promise<{ ok: boolean; output: A3OutputJson | null; error: string | null }> {
  const packet = buildA3Packet({
    runId: args.runId,
    institutionId: args.institutionId,
    institutionName: args.institutionName,
    institutionDomain: args.institutionDomain,
    sources: args.acceptedSources,
    mergedVerified: args.verified,
    mergedRejected: args.rejected,
  });

  if (args.opts.dryRun) {
    if (!args.opts.quiet) {
      console.log(`[dry-run A3] ${args.runId}`);
      console.log(`  system prompt: ${A3_PROMPT_FILE}`);
      console.log(`  packet bytes:  ${packet.length}`);
      console.log(`  verified:      ${args.verified.length}`);
      console.log(`  rejected:      ${args.rejected.length}`);
    }
    return { ok: true, output: null, error: null };
  }

  const logStdoutPath = path.join(args.runDir, 'logs', 'A3.stdout.log');
  const logStderrPath = path.join(args.runDir, 'logs', 'A3.stderr.log');

  const result = await invokeClaudeCli({
    cliPath: args.cliPath,
    systemPromptFile: A3_PROMPT_FILE,
    userMessage: packet,
    jsonSchema: A3_SCHEMA,
    model: args.opts.model,
    maxBudgetUsd: args.opts.maxBudgetUsd,
    addDir: REPO_ROOT,
    logStdoutPath,
    logStderrPath,
  });

  if (result.exitCode !== 0) return { ok: false, output: null, error: `A3 claude exit ${result.exitCode}: ${result.stderr.slice(0, 300)}` };
  const parsed = parseCliJsonResult(result.stdout);
  if (parsed.ok === false) return { ok: false, output: null, error: `A3 parse failed: ${parsed.error}` };
  const gated = gateA3Output(parsed.data, args.runId);
  if (gated.ok === false) return { ok: false, output: null, error: gated.error };
  return { ok: true, output: gated.data, error: null };
}

// -------------------- Output writers --------------------

function writeA1Outputs(runDir: string, a1Outputs: { source: SourceRecord; output: A1OutputJson }[]): void {
  const merged = {
    schemaVersion: CLI_SCHEMA_VERSION,
    phase: 'A1',
    perSource: a1Outputs.map((x) => ({ sourceId: x.source.sourceId, sourceUrl: x.source.sourceUrl, output: x.output })),
  };
  writeJson(path.join(runDir, 'A1_model_reader_output.json'), merged);

  const lines: string[] = [];
  lines.push(`# A1 model reader report — ${runDir.split('/').pop()}`);
  lines.push('');
  for (const x of a1Outputs) {
    lines.push(`## ${x.source.sourceId}  ${x.source.sourceUrl}`);
    lines.push(`- claims: ${x.output.claims.length}`);
    lines.push(`- opportunities: ${x.output.opportunities.length}`);
    lines.push(`- negative-evidence: ${x.output.negativeEvidenceClaims.length}`);
    lines.push(`- future-lane signals: ${x.output.futureLaneSignals.length}`);
    lines.push(`- scope conflicts: ${x.output.sourceScopeConflicts.length}`);
    lines.push(`- unresolveds: ${x.output.unresolveds.length}`);
    lines.push('');
  }
  writeText(path.join(runDir, 'A1_model_reader_report.md'), lines.join('\n'));
}

function writeA2Outputs(runDir: string, a2Outputs: { source: SourceRecord; output: A2OutputJson }[]): void {
  const merged = {
    schemaVersion: CLI_SCHEMA_VERSION,
    phase: 'A2',
    perSource: a2Outputs.map((x) => ({ sourceId: x.source.sourceId, sourceUrl: x.source.sourceUrl, output: x.output })),
  };
  writeJson(path.join(runDir, 'A2_model_depth_output.json'), merged);

  const lines: string[] = [];
  lines.push(`# A2 model depth report — ${runDir.split('/').pop()}`);
  lines.push('');
  for (const x of a2Outputs) {
    lines.push(`## ${x.source.sourceId}  ${x.source.sourceUrl}`);
    lines.push(`- newClaims: ${x.output.newClaims.length}`);
    lines.push(`- a1ClaimsToRefine: ${x.output.a1ClaimsToRefine.length}`);
    lines.push(`- additionalUnresolveds: ${x.output.additionalUnresolveds.length}`);
    lines.push('');
  }
  writeText(path.join(runDir, 'A2_model_depth_report.md'), lines.join('\n'));
}

function writeA3Outputs(runDir: string, a3Output: A3OutputJson): void {
  // Distinct from the deterministic regate's A3_gate.json (different schema).
  writeJson(path.join(runDir, 'A3_model_gate.json'), a3Output);
  const lines: string[] = [];
  lines.push(`# A3 model hostile-gate verdict — ${runDir.split('/').pop()}`);
  lines.push('');
  lines.push(`**Verdict:** ${a3Output.verdict}`);
  lines.push('');
  lines.push(a3Output.verdictSummary);
  lines.push('');
  lines.push(`- publicSafetyFailures: ${a3Output.publicSafetyFailures.length}`);
  lines.push(`- claimsToDowngrade:    ${a3Output.claimsToDowngrade.length}`);
  lines.push(`- scopeConflicts:       ${a3Output.scopeConflicts.length}`);
  lines.push(`- duplicates:           ${a3Output.duplicates.length}`);
  lines.push('');
  lines.push('## Attestations');
  for (const [k, v] of Object.entries(a3Output.attestations)) {
    lines.push(`- ${k}: ${v}`);
  }
  lines.push('');
  lines.push('## Metadata');
  for (const [k, v] of Object.entries(a3Output.metadata)) {
    lines.push(`- ${k}: ${v}`);
  }
  writeText(path.join(runDir, 'A3_model_gate_report.md'), lines.join('\n'));
}

function writeVerifiedAndRejected(runDir: string, verified: VerifiedClaim[], rejected: RejectedClaim[]): void {
  writeJson(path.join(runDir, '13_model_claims_verified.json'), {
    schemaVersion: CLI_SCHEMA_VERSION,
    count: verified.length,
    claims: verified,
  });
  writeJson(path.join(runDir, '13_model_claims_rejected.json'), {
    schemaVersion: CLI_SCHEMA_VERSION,
    count: rejected.length,
    claims: rejected,
  });
}

function writeA3InputSummary(runDir: string, verified: VerifiedClaim[], rejected: RejectedClaim[], acceptedSources: SourceRecord[]): void {
  writeJson(path.join(runDir, 'A3_model_gate_input_summary.json'), {
    schemaVersion: CLI_SCHEMA_VERSION,
    verifiedCount: verified.length,
    rejectedCount: rejected.length,
    acceptedSourcesCount: acceptedSources.length,
    visibilityBreakdown: countByVisibility(verified),
  });
}

function countByVisibility(claims: VerifiedClaim[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of claims) counts[c.visibility] = (counts[c.visibility] ?? 0) + 1;
  return counts;
}

// -------------------- Per-run orchestrator --------------------

async function runOneInstitution(runId: string, opts: CliOptions, cliPath: string): Promise<{ ok: boolean; summary: string }> {
  const runDir = path.join(RUNS_DIR, runId);
  if (!existsSync(runDir)) return { ok: false, summary: `run dir not found: ${runDir}` };

  const sourceMapPath = path.join(runDir, '01_source_map.json');
  const canonicalPath = path.join(runDir, '05_canonical_institution.json');
  if (!existsSync(sourceMapPath)) return { ok: false, summary: `01_source_map.json missing: ${sourceMapPath}` };
  if (!existsSync(canonicalPath)) return { ok: false, summary: `05_canonical_institution.json missing: ${canonicalPath}` };

  const sourceMap = readJson<SourceMap>(sourceMapPath);
  const canonical = readJson<CanonicalInstitution>(canonicalPath);

  const allAccepted = sourceMap.sources.filter((s) => s.acceptedForExtraction && s.cleanedTextPath);
  const accepted = opts.maxSourcesPerRun != null ? allAccepted.slice(0, opts.maxSourcesPerRun) : allAccepted;

  if (!opts.quiet) {
    console.log(`\n=== ${runId} → ${canonical.canonicalName} (${canonical.institutionId})`);
    console.log(`    accepted sources: ${accepted.length} / ${allAccepted.length}`);
    console.log(`    phase: ${opts.phase}  dry-run: ${opts.dryRun}  model: ${opts.model}`);
  }

  // Read cleaned text for each accepted source.
  const cleanedTextBySource = new Map<string, string>();
  const sourcesByUrl = new Map<string, SourceRecord>();
  const skippedSources: { source: SourceRecord; reason: string }[] = [];
  for (const s of accepted) {
    sourcesByUrl.set(s.sourceUrl, s);
    if (!s.cleanedTextPath) { skippedSources.push({ source: s, reason: 'no cleanedTextPath' }); continue; }
    const txt = safeReadCleanedText(s.cleanedTextPath);
    if (txt === null) { skippedSources.push({ source: s, reason: `cleaned text not readable at ${s.cleanedTextPath}` }); continue; }
    cleanedTextBySource.set(s.sourceUrl, txt);
  }

  if (cleanedTextBySource.size === 0) {
    return { ok: false, summary: `${runId}: no cleaned text readable (T7 disconnected?). skipped=${skippedSources.length}` };
  }

  const a1Outputs: { source: SourceRecord; output: A1OutputJson }[] = [];
  const a2Outputs: { source: SourceRecord; output: A2OutputJson }[] = [];
  let allCandidates: ModelClaimCandidate[] = [];

  // ---- Rebuild-from-disk path: collect candidates from on-disk A1+A2 ----
  // Useful when the ledger was lost or to re-verify against updated cleaned text.
  if (opts.rebuildLedgerFromDisk) {
    const a1Path = path.join(runDir, 'A1_model_reader_output.json');
    if (!existsSync(a1Path)) return { ok: false, summary: `${runId}: --rebuild-ledger-from-disk needs A1_model_reader_output.json` };
    const a1Merged = readJson<{ perSource: { sourceUrl: string; output: A1OutputJson }[] }>(a1Path);
    for (const x of a1Merged.perSource) allCandidates.push(...x.output.claims, ...x.output.opportunities, ...x.output.negativeEvidenceClaims, ...x.output.futureLaneSignals, ...x.output.sourceScopeConflicts);
    const a2Path = path.join(runDir, 'A2_model_depth_output.json');
    if (existsSync(a2Path)) {
      const a2Merged = readJson<{ perSource: { sourceUrl: string; output: A2OutputJson }[] }>(a2Path);
      for (const x of a2Merged.perSource) allCandidates.push(...x.output.newClaims);
    }
    if (!opts.quiet) console.log(`    rebuild-ledger-from-disk: ${allCandidates.length} candidates loaded`);
    // Skip A1/A2 invocation; fall through to verify+write (and A3 if requested).
  }

  // ---- A1 phase ----
  if (!opts.rebuildLedgerFromDisk && (opts.phase === 'A1' || opts.phase === 'ALL')) {
    for (const src of accepted) {
      const text = cleanedTextBySource.get(src.sourceUrl);
      if (!text) continue;
      if (!opts.quiet) console.log(`  [A1] ${src.sourceId} ${src.sourceUrl}`);
      const r = await runPhaseA1ForSource({
        cliPath, runId, runDir, institutionId: canonical.institutionId, institutionName: canonical.canonicalName,
        source: src, cleanedText: text, opts,
      });
      if (!r.ok) { if (!opts.quiet) console.log(`     A1 failed: ${r.error}`); continue; }
      if (r.output) {
        a1Outputs.push({ source: src, output: r.output });
        allCandidates.push(...r.output.claims, ...r.output.opportunities, ...r.output.negativeEvidenceClaims, ...r.output.futureLaneSignals, ...r.output.sourceScopeConflicts);
      }
    }
    if (!opts.dryRun) writeA1Outputs(runDir, a1Outputs);
  }

  // ---- A2 phase ----
  if (!opts.rebuildLedgerFromDisk && (opts.phase === 'A2' || opts.phase === 'ALL')) {
    // If we ran only A2, load A1 from disk.
    let a1ForA2: { source: SourceRecord; output: A1OutputJson }[];
    if (opts.phase === 'A2') {
      const a1Path = path.join(runDir, 'A1_model_reader_output.json');
      if (!existsSync(a1Path)) return { ok: false, summary: `${runId}: cannot run A2 without A1_model_reader_output.json` };
      const a1Merged = readJson<{ perSource: { sourceId: string; sourceUrl: string; output: A1OutputJson }[] }>(a1Path);
      a1ForA2 = a1Merged.perSource.map((x) => {
        const src = sourcesByUrl.get(x.sourceUrl);
        if (!src) throw new Error(`A1-on-disk references unknown source: ${x.sourceUrl}`);
        return { source: src, output: x.output };
      });
      // Re-collect candidates from loaded A1 for downstream verify.
      allCandidates = [];
      for (const item of a1ForA2) allCandidates.push(...item.output.claims, ...item.output.opportunities, ...item.output.negativeEvidenceClaims, ...item.output.futureLaneSignals, ...item.output.sourceScopeConflicts);
    } else {
      a1ForA2 = a1Outputs;
    }

    for (const item of a1ForA2) {
      const text = cleanedTextBySource.get(item.source.sourceUrl);
      if (!text) continue;
      const a1ClaimsForThisSource = [
        ...item.output.claims,
        ...item.output.opportunities,
        ...item.output.negativeEvidenceClaims,
        ...item.output.futureLaneSignals,
        ...item.output.sourceScopeConflicts,
      ].filter((c) => c.sourceUrl === item.source.sourceUrl);

      if (!opts.quiet) console.log(`  [A2] ${item.source.sourceId} ${item.source.sourceUrl}`);
      const r = await runPhaseA2ForSource({
        cliPath, runId, runDir, institutionId: canonical.institutionId, institutionName: canonical.canonicalName,
        source: item.source, cleanedText: text, a1Output: item.output, a1ClaimsForThisSource, opts,
      });
      if (!r.ok) { if (!opts.quiet) console.log(`     A2 failed: ${r.error}`); continue; }
      if (r.output) {
        a2Outputs.push({ source: item.source, output: r.output });
        allCandidates.push(...r.output.newClaims);
      }
    }
    if (!opts.dryRun) writeA2Outputs(runDir, a2Outputs);
  }

  if (opts.dryRun) {
    return { ok: true, summary: `${runId}: dry-run OK (sources=${accepted.length})` };
  }

  // ---- Verify + reclassify (A1 + A2 candidates) ----
  // When phase is A3 standalone, we load the ledger from disk instead of
  // re-deriving from candidates (which would be empty and clobber the file).
  let dedupedVerified: VerifiedClaim[];
  let rejected: RejectedClaim[];

  if (opts.phase === 'A3' && !opts.rebuildLedgerFromDisk) {
    const ledgerPath = path.join(runDir, '13_model_claims_verified.json');
    const rejectedPath = path.join(runDir, '13_model_claims_rejected.json');
    if (!existsSync(ledgerPath)) return { ok: false, summary: `${runId}: cannot run A3 without 13_model_claims_verified.json` };
    const ledger = readJson<{ claims: VerifiedClaim[] }>(ledgerPath);
    dedupedVerified = ledger.claims ?? [];
    rejected = existsSync(rejectedPath) ? (readJson<{ claims: RejectedClaim[] }>(rejectedPath).claims ?? []) : [];
  } else {
    const { verified: a1Verified, rejected: a1Rejected } = verifyAndReclassify({
      candidates: allCandidates.filter((c) => !('whyA1Missed' in c)),
      cleanedTextBySource, sourcesByUrl,
      runId, institutionId: canonical.institutionId, phaseProducedBy: 'A1',
    });
    const { verified: a2Verified, rejected: a2Rejected } = verifyAndReclassify({
      candidates: allCandidates.filter((c) => 'whyA1Missed' in c),
      cleanedTextBySource, sourcesByUrl,
      runId, institutionId: canonical.institutionId, phaseProducedBy: 'A2',
    });

    const verified = [...a1Verified, ...a2Verified];
    rejected = [...a1Rejected, ...a2Rejected];

    const seen = new Set<string>();
    dedupedVerified = [];
    for (const c of verified) {
      const key = `${c.claimType}::${c.normalizedField ?? ''}::${c.sourceUrl}::${sha256(c.quote)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dedupedVerified.push(c);
    }

    writeVerifiedAndRejected(runDir, dedupedVerified, rejected);
    writeA3InputSummary(runDir, dedupedVerified, rejected, accepted);
  }

  // ---- A3 phase ----
  if (opts.phase === 'A3' || opts.phase === 'ALL') {
    if (!opts.quiet) console.log(`  [A3] hostile gate`);
    const a3 = await runPhaseA3ForRun({
      cliPath, runId, runDir,
      institutionId: canonical.institutionId, institutionName: canonical.canonicalName,
      institutionDomain: canonical.officialDomains[0] ?? '',
      acceptedSources: accepted,
      verified: dedupedVerified, rejected, opts,
    });
    if (!a3.ok || !a3.output) {
      return { ok: false, summary: `${runId}: A3 failed: ${a3.error}` };
    }
    writeA3Outputs(runDir, a3.output);

    // Apply downgrades from A3 to the verified ledger.
    if (a3.output.claimsToDowngrade.length > 0) {
      applyA3Downgrades(dedupedVerified, a3.output.claimsToDowngrade as Array<{ claimId: string; toVisibility: Visibility; reason: string }>);
      writeVerifiedAndRejected(runDir, dedupedVerified, rejected);
    }
  }

  return { ok: true, summary: `${runId}: A1=${a1Outputs.length}srcs A2=${a2Outputs.length}srcs verified=${dedupedVerified.length} rejected=${rejected.length}` };
}

function applyA3Downgrades(verified: VerifiedClaim[], downgrades: Array<{ claimId: string; toVisibility: Visibility; reason: string }>): void {
  const byId = new Map(verified.map((c) => [c.claimId, c]));
  for (const d of downgrades) {
    const c = byId.get(d.claimId);
    if (!c) continue;
    c.visibility = d.toVisibility;
    c.visibilityRationale = `A3 downgrade: ${d.reason}`;
  }
}

// -------------------- main --------------------

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));

  // Pre-flight.
  if (!existsSync(A1_PROMPT_FILE)) throw new Error(`A1 prompt missing: ${A1_PROMPT_FILE}`);
  if (!existsSync(A2_PROMPT_FILE)) throw new Error(`A2 prompt missing: ${A2_PROMPT_FILE}`);
  if (!existsSync(A3_PROMPT_FILE)) throw new Error(`A3 prompt missing: ${A3_PROMPT_FILE}`);

  const cliPath = findClaudeCli();
  if (!opts.dryRun) {
    if (cliPath !== 'claude' && !existsSync(cliPath)) {
      throw new Error(`claude CLI not found at ${cliPath} (set CLAUDE_CLI_PATH or install Claude Code)`);
    }
  }

  if (!opts.quiet) {
    console.log(`P102-0E Claude CLI extractor`);
    console.log(`  claude CLI: ${cliPath}`);
    console.log(`  runs to process: ${opts.runIds.length}`);
    console.log(`  dry-run: ${opts.dryRun}`);
  }

  const summaries: { runId: string; ok: boolean; summary: string }[] = [];
  for (const runId of opts.runIds) {
    try {
      const r = await runOneInstitution(runId, opts, cliPath);
      summaries.push({ runId, ok: r.ok, summary: r.summary });
    } catch (err) {
      summaries.push({ runId, ok: false, summary: `exception: ${(err as Error).message}` });
    }
  }

  console.log(`\n=== P102-0E batch summary`);
  for (const s of summaries) console.log(`  [${s.ok ? 'OK' : 'FAIL'}] ${s.summary}`);
  const failCount = summaries.filter((s) => !s.ok).length;
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`fatal: ${err.message}`);
  process.exit(1);
});
