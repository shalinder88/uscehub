#!/usr/bin/env tsx
/**
 * P102 cross-validator dispatcher — runs every P102 validator in sequence
 * and reports a single PASS / FAIL status with per-validator detail.
 *
 * Useful before every P102 commit. Exit 0 only if all validators pass.
 *
 * Validators run (in order):
 *   1. tsc --noEmit
 *   2. test-p102 (unit tests)
 *   3. validate-p102-discovery-runner (primary run validator)
 *   4. validate-no-secrets
 *   5. p102-anti-drift-validator
 *   6. p102-validate-concept-packs
 *   7. p102-validate-run-integrity
 *   8. p102-validate-identity-registry
 *   9. p102-gold-set-verify (returns PASS if all entries AWAITING_RUN)
 *  10. p102-quote-verify (strict re-check of 13_model_claims_verified.json when present)
 *  11. p102-validate-deep-packet (P102-0F three-tier packet validator, when present)
 *  12. validate-p101-discovery-command-center (no-regression check)
 *
 * No network. No Agent. Just runs sub-scripts and aggregates.
 *
 * Usage:
 *   npx tsx scripts/p102-validate-all.ts
 *   npx tsx scripts/p102-validate-all.ts --fast  (skip slow tsc)
 */

import { execSync } from 'node:child_process';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');

interface ValidatorResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  output: string;
  durationMs: number;
}

function runValidator(name: string, cmd: string): ValidatorResult {
  const start = Date.now();
  try {
    const output = execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { name, status: 'PASS', output, durationMs: Date.now() - start };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return {
      name,
      status: 'FAIL',
      output: (err.stdout ?? '') + (err.stderr ?? ''),
      durationMs: Date.now() - start,
    };
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const fast = args.includes('--fast');

  console.log('='.repeat(70));
  console.log('P102 Cross-Validator Dispatcher');
  console.log('='.repeat(70));

  const validators: Array<{ name: string; cmd: string }> = [
    { name: 'test-p102 (unit tests)', cmd: 'npx tsx scripts/test-p102.ts' },
    { name: 'validate-p102-discovery-runner', cmd: 'npx tsx scripts/validate-p102-discovery-runner.ts' },
    { name: 'validate-no-secrets', cmd: 'npx tsx scripts/validate-no-secrets.ts' },
    { name: 'p102-anti-drift-validator', cmd: 'npx tsx scripts/p102-anti-drift-validator.ts' },
    { name: 'p102-validate-concept-packs', cmd: 'npx tsx scripts/p102-validate-concept-packs.ts' },
    { name: 'p102-validate-run-integrity', cmd: 'npx tsx scripts/p102-validate-run-integrity.ts' },
    { name: 'p102-validate-identity-registry', cmd: 'npx tsx scripts/p102-validate-identity-registry.ts' },
    { name: 'p102-gold-set-verify', cmd: 'npx tsx scripts/p102-gold-set-verify.ts' },
    { name: 'p102-quote-verify (model ledgers)', cmd: 'npx tsx scripts/p102-quote-verify.ts --all-existing-p102-runs --strict --quiet' },
    { name: 'p102-validate-deep-packet (P102-0F)', cmd: 'npx tsx scripts/p102-validate-deep-packet.ts --quiet' },
    { name: 'p102-validate-approved-public-safe-export', cmd: 'npx tsx scripts/p102-validate-approved-public-safe-export.ts' },
    { name: 'validate-p101-discovery-command-center', cmd: 'npx tsx scripts/validate-p101-discovery-command-center.ts' },
  ];
  if (!fast) {
    validators.unshift({ name: 'tsc --noEmit', cmd: 'npx tsc --noEmit' });
  }

  const results: ValidatorResult[] = [];
  for (const v of validators) {
    process.stdout.write(`  Running: ${v.name.padEnd(45)} ... `);
    const r = runValidator(v.name, v.cmd);
    results.push(r);
    console.log(`${r.status} (${r.durationMs}ms)`);
  }

  console.log('-'.repeat(70));
  const fails = results.filter(r => r.status === 'FAIL');
  if (fails.length === 0) {
    const total = results.reduce((s, r) => s + r.durationMs, 0);
    console.log(`Overall: PASSED — ${results.length} validators in ${total}ms (${(total / 1000).toFixed(1)}s total)`);
    process.exit(0);
  } else {
    console.log(`Overall: FAILED — ${fails.length} / ${results.length} validators failed`);
    for (const f of fails) {
      console.log(`\n--- ${f.name} (FAIL) ---`);
      console.log(f.output.slice(-1500));
    }
    process.exit(1);
  }
}

main();
