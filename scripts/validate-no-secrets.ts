/**
 * validate-no-secrets.ts
 *
 * Deterministic local validator that scans the repository working tree for
 * common credential patterns (Google API keys, AWS access keys, Slack tokens,
 * GitHub tokens, Stripe keys, private key headers).
 *
 * Output is path + line + redacted token type only. The matched secret
 * value is never printed.
 *
 * Exits 1 if any secret-like pattern is found, 0 otherwise.
 *
 * Usage:
 *   npx tsx scripts/validate-no-secrets.ts
 *
 * Excluded paths: .git, node_modules, .next, build artifacts, this script
 * itself (so the patterns inside this file do not trigger a false positive).
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { extname, join, relative, resolve } from "path";

type Pattern = {
  id: string;
  label: string;
  re: RegExp;
};

const PATTERNS: Pattern[] = [
  { id: "GOOGLE_API_KEY", label: "Google API key", re: /AIza[0-9A-Za-z_\-]{20,}/g },
  { id: "AWS_ACCESS_KEY", label: "AWS access key id", re: /AKIA[A-Z0-9]{16}/g },
  { id: "GITHUB_PAT", label: "GitHub personal access token", re: /ghp_[A-Za-z0-9]{20,}/g },
  { id: "GITHUB_OAUTH", label: "GitHub OAuth token", re: /gho_[A-Za-z0-9]{20,}/g },
  { id: "GITHUB_PAT_NEW", label: "GitHub fine-grained PAT", re: /github_pat_[A-Za-z0-9_]{30,}/g },
  { id: "GITHUB_SERVER", label: "GitHub server token", re: /ghs_[A-Za-z0-9]{20,}/g },
  { id: "STRIPE_LIVE", label: "Stripe live secret", re: /sk_live_[A-Za-z0-9]{20,}/g },
  { id: "STRIPE_TEST", label: "Stripe test secret", re: /sk_test_[A-Za-z0-9]{20,}/g },
  { id: "SLACK_TOKEN", label: "Slack token", re: /xox[abp]-[A-Za-z0-9\-]{10,}/g },
  { id: "PRIVATE_KEY", label: "PEM private key header", re: /-----BEGIN [A-Z ]+PRIVATE KEY-----/g },
];

const EXCLUDE_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  ".vercel",
  "out",
  "dist",
  "build",
  ".cache",
  // Snapshots of external institutional web pages (raw.html, cleaned.txt).
  // Third-party content; any API-key-shaped tokens are theirs, not ours.
  "evidence",
]);

const SKIP_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".pdf",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".duckdb",
  ".sqlite",
  ".xlsx",
  ".xls",
  ".zip",
  ".gz",
  ".tar",
]);

const SELF = "scripts/validate-no-secrets.ts";

type Finding = {
  file: string;
  line: number;
  patternId: string;
  label: string;
};

function walk(dir: string, root: string, out: string[]): void {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (EXCLUDE_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full, root, out);
    } else if (st.isFile()) {
      if (SKIP_EXT.has(extname(name).toLowerCase())) continue;
      if (st.size > 5 * 1024 * 1024) continue;
      const rel = relative(root, full);
      if (rel === SELF) continue;
      out.push(rel);
    }
  }
}

function scanFile(absPath: string, relPath: string): Finding[] {
  let text: string;
  try {
    text = readFileSync(absPath, "utf8");
  } catch {
    return [];
  }
  const findings: Finding[] = [];
  for (const p of PATTERNS) {
    p.re.lastIndex = 0;
    if (!p.re.test(text)) continue;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      p.re.lastIndex = 0;
      if (p.re.test(line)) {
        findings.push({ file: relPath, line: i + 1, patternId: p.id, label: p.label });
      }
    }
  }
  return findings;
}

function main(): void {
  const root = resolve(process.cwd());
  const files: string[] = [];
  walk(root, root, files);

  const findings: Finding[] = [];
  for (const rel of files) {
    findings.push(...scanFile(join(root, rel), rel));
  }

  if (findings.length === 0) {
    console.log(`validate-no-secrets: scanned ${files.length} files, 0 findings`);
    process.exit(0);
  }

  console.error(`validate-no-secrets: scanned ${files.length} files, ${findings.length} findings`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  [${f.patternId}] ${f.label}`);
  }
  console.error("");
  console.error("FAIL: secret-like patterns detected. Redact before committing.");
  process.exit(1);
}

main();
