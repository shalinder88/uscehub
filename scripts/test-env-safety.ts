/**
 * Env-safety regression script (cleanup PR3).
 *
 * No test framework — assertions are inline like
 * scripts/test-cleanup-helpers.ts. Run with:
 *
 *   npx tsx scripts/test-env-safety.ts
 *
 * Exits 0 on success, 1 on the first failed assertion. Tests:
 *  - requiredServerEnv throws MissingEnvError with a helpful message
 *  - optionalServerEnv returns undefined for unset / empty
 *  - getCronSecret production semantics throw when missing
 *  - getResendConfig defaults
 *  - getSeedAdminCredentials throws when missing
 *  - the hardcoded "admin2026" admin password is no longer in
 *    runnable source (audit P0-1 regression check)
 */

import * as fs from "fs";
import * as path from "path";

import {
  requiredServerEnv,
  optionalServerEnv,
  MissingEnvError,
  getCronSecret,
  getResendConfig,
  getSiteUrlFromEnv,
  getSeedAdminCredentials,
} from "@/lib/env";

let failed = 0;

function assert(condition: unknown, label: string): void {
  if (condition) {
    console.log(`  ok  ${label}`);
  } else {
    console.error(`  FAIL ${label}`);
    failed++;
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

const RANDOM = `__USCEHUB_TEST_${Date.now()}_${Math.random().toString(36).slice(2)}__`;

function withEnv(name: string, value: string | undefined, fn: () => void) {
  const prev = process.env[name];
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env[name];
    else process.env[name] = prev;
  }
}

// ─── requiredServerEnv ────────────────────────────────────────
section("requiredServerEnv: throws clearly when missing");
{
  let thrown: unknown = null;
  withEnv(RANDOM, undefined, () => {
    try {
      requiredServerEnv(RANDOM, "test hint");
    } catch (e) {
      thrown = e;
    }
  });
  assert(thrown instanceof MissingEnvError, "throws MissingEnvError instance");
  assert(
    thrown instanceof Error && thrown.message.includes(RANDOM),
    "error message names the missing variable",
  );
  assert(
    thrown instanceof Error && thrown.message.includes("test hint"),
    "error message includes the hint",
  );
  assert(
    thrown instanceof Error && thrown.message.includes(".env.example"),
    "error message points to .env.example",
  );
}

section("requiredServerEnv: returns string when present");
{
  withEnv(RANDOM, "value-present", () => {
    assert(requiredServerEnv(RANDOM) === "value-present", "returns the env value");
  });
}

section("requiredServerEnv: empty string treated as missing");
{
  let thrown: unknown = null;
  withEnv(RANDOM, "", () => {
    try {
      requiredServerEnv(RANDOM);
    } catch (e) {
      thrown = e;
    }
  });
  assert(thrown instanceof MissingEnvError, "empty string -> MissingEnvError");
}

// ─── optionalServerEnv ────────────────────────────────────────
section("optionalServerEnv: returns undefined for unset");
{
  withEnv(RANDOM, undefined, () => {
    assert(optionalServerEnv(RANDOM) === undefined, "unset -> undefined");
  });
}

section("optionalServerEnv: returns undefined for empty string");
{
  withEnv(RANDOM, "", () => {
    assert(
      optionalServerEnv(RANDOM) === undefined,
      "empty string -> undefined (avoids the empty-string footgun)",
    );
  });
}

section("optionalServerEnv: returns string when present");
{
  withEnv(RANDOM, "ok", () => {
    assert(optionalServerEnv(RANDOM) === "ok", "returns env value");
  });
}

// ─── getCronSecret ───────────────────────────────────────────
section("getCronSecret: production + missing -> throws");
{
  let thrown: unknown = null;
  withEnv("NODE_ENV", "production", () => {
    withEnv("CRON_SECRET", undefined, () => {
      try {
        getCronSecret();
      } catch (e) {
        thrown = e;
      }
    });
  });
  assert(thrown instanceof MissingEnvError, "production+missing -> MissingEnvError");
  assert(
    thrown instanceof Error && thrown.message.includes("CRON_SECRET"),
    "error names CRON_SECRET",
  );
}

section("getCronSecret: production + present -> value");
{
  let result: string | undefined;
  withEnv("NODE_ENV", "production", () => {
    withEnv("CRON_SECRET", "real-secret", () => {
      result = getCronSecret();
    });
  });
  assert(result === "real-secret", "production+present -> secret value");
}

section("getCronSecret: development + missing -> undefined (no throw)");
{
  let result: string | undefined;
  let threw = false;
  withEnv("NODE_ENV", "development", () => {
    withEnv("CRON_SECRET", undefined, () => {
      try {
        result = getCronSecret();
      } catch {
        threw = true;
      }
    });
  });
  assert(!threw, "development+missing does not throw");
  assert(result === undefined, "development+missing -> undefined");
}

// ─── getResendConfig ─────────────────────────────────────────
section("getResendConfig: defaults are graceful");
{
  let cfg: ReturnType<typeof getResendConfig> | null = null;
  withEnv("RESEND_API_KEY", undefined, () => {
    withEnv("RESEND_FROM", undefined, () => {
      withEnv("NOTIFY_TO", undefined, () => {
        cfg = getResendConfig();
      });
    });
  });
  // Type narrowing: cfg is non-null after the IIFE above.
  const c = cfg!;
  assert(c.apiKey === undefined, "missing apiKey -> undefined (email no-ops)");
  assert(c.notifyTo === undefined, "missing notifyTo -> undefined (email no-ops)");
  assert(
    typeof c.from === "string" && c.from.includes("onboarding@resend.dev"),
    "missing from -> defaults to Resend test domain",
  );
}

section("getResendConfig: real values pass through");
{
  let cfg: ReturnType<typeof getResendConfig> | null = null;
  withEnv("RESEND_API_KEY", "re_test", () => {
    withEnv("RESEND_FROM", "USCEHub <noreply@example.com>", () => {
      withEnv("NOTIFY_TO", "ops@example.com", () => {
        cfg = getResendConfig();
      });
    });
  });
  const c = cfg!;
  assert(c.apiKey === "re_test", "real apiKey passes through");
  assert(c.from === "USCEHub <noreply@example.com>", "real from passes through");
  assert(c.notifyTo === "ops@example.com", "real notifyTo passes through");
}

// ─── getSiteUrlFromEnv ───────────────────────────────────────
section("getSiteUrlFromEnv: env wins, fallback otherwise");
{
  withEnv("NEXTAUTH_URL", "https://staging.example.com", () => {
    assert(
      getSiteUrlFromEnv("https://uscehub.com") === "https://staging.example.com",
      "env value wins over fallback",
    );
  });
  withEnv("NEXTAUTH_URL", undefined, () => {
    assert(
      getSiteUrlFromEnv("https://uscehub.com") === "https://uscehub.com",
      "fallback used when env is unset",
    );
  });
}

// ─── getSeedAdminCredentials ─────────────────────────────────
section("getSeedAdminCredentials: both required, throws clearly");
{
  let thrown: unknown = null;
  withEnv("SEED_ADMIN_EMAIL", undefined, () => {
    withEnv("SEED_ADMIN_PASSWORD", undefined, () => {
      try {
        getSeedAdminCredentials();
      } catch (e) {
        thrown = e;
      }
    });
  });
  assert(thrown instanceof MissingEnvError, "missing creds -> MissingEnvError");
  assert(
    thrown instanceof Error && thrown.message.includes("SEED_ADMIN_EMAIL"),
    "error names SEED_ADMIN_EMAIL when missing first",
  );
}

section("getSeedAdminCredentials: returns when both present");
{
  let result: ReturnType<typeof getSeedAdminCredentials> | null = null;
  withEnv("SEED_ADMIN_EMAIL", "admin@example.com", () => {
    withEnv("SEED_ADMIN_PASSWORD", "long-random-string", () => {
      result = getSeedAdminCredentials();
    });
  });
  const r = result!;
  assert(r.email === "admin@example.com", "returns email");
  assert(r.password === "long-random-string", "returns password");
}

// ─── admin2026 regression check ──────────────────────────────
section("admin2026: removed from runnable source (audit P0-1)");
{
  const REPO_ROOT = path.resolve(__dirname, "..");
  const SCAN_DIRS = ["src", "scripts", "prisma"];
  const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".vercel"]);
  const SKIP_FILES = new Set([
    // This very test file references the literal as test data — exempt.
    path.relative(REPO_ROOT, __filename),
  ]);

  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else if (entry.isFile()) out.push(full);
    }
    return out;
  }

  const findings: string[] = [];
  for (const d of SCAN_DIRS) {
    const abs = path.join(REPO_ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const rel = path.relative(REPO_ROOT, file);
      if (SKIP_FILES.has(rel)) continue;
      // Only scan text files; cheap heuristic by extension.
      if (!/\.(ts|tsx|js|jsx|json|md|mjs|cjs|prisma)$/i.test(file)) continue;
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("admin2026")) {
        findings.push(rel);
      }
    }
  }

  assert(
    findings.length === 0,
    findings.length === 0
      ? "no 'admin2026' in src/, scripts/, prisma/ (P0-1 fixed)"
      : `'admin2026' still appears in: ${findings.join(", ")}`,
  );
}

// ─── result ───────────────────────────────────────────────────
console.log(`\n${failed === 0 ? "ALL CHECKS PASSED" : `FAILED: ${failed} assertion(s) failed`}`);
process.exit(failed === 0 ? 0 : 1);
