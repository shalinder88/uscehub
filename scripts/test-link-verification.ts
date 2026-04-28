/**
 * Pure-function unit tests for `src/lib/link-verification.ts`.
 *
 * No network calls, no DB calls, no Prisma client init. Runnable via:
 *   cd /Users/shelly/usmle-platform && npx tsx scripts/test-link-verification.ts
 *
 * Every row of the classification table in
 * `docs/codebase-audit/PHASE_3_3_VERIFICATION_CRON_DESIGN.md` has a
 * corresponding test below. If you change the table, update both.
 *
 * Exit code 0 on all-pass; 1 on any failure.
 */

import {
  classifyProbeOutcome,
  pickProbeUrl,
  type ProbeOutcome,
} from "../src/lib/link-verification";

let pass = 0;
let fail = 0;

function probe(httpStatus: number, errorKind: ProbeOutcome["errorKind"] = "none"): ProbeOutcome {
  return { httpStatus, redirected: false, finalUrl: null, errorKind };
}

function expectClassification(
  label: string,
  outcome: ProbeOutcome,
  expectedStatus: string,
  expectedReason: string | null,
): void {
  const got = classifyProbeOutcome(outcome);
  if (got.status === expectedStatus && got.reason === expectedReason) {
    pass++;
    console.log(`  ok    ${label}`);
  } else {
    fail++;
    console.log(
      `  FAIL  ${label}\n          expected: ${expectedStatus} / ${expectedReason}\n          got:      ${got.status} / ${got.reason}`,
    );
  }
}

function expectPick(
  label: string,
  urls: { sourceUrl: string | null; applicationUrl: string | null; websiteUrl: string | null },
  expected: string | null,
): void {
  const got = pickProbeUrl(urls);
  if (got === expected) {
    pass++;
    console.log(`  ok    ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}  expected ${expected}, got ${got}`);
  }
}

console.log("=== Phase 3.3 link verification — pure-function tests ===\n");

console.log("Verified outcomes (2xx):");
expectClassification("200 OK → VERIFIED", probe(200), "VERIFIED", null);
expectClassification("204 No Content → VERIFIED", probe(204), "VERIFIED", null);
expectClassification("299 boundary → VERIFIED", probe(299), "VERIFIED", null);

console.log("\n405 Method Not Allowed — PR 3.3a contract:");
// Route-level probeUrl performs HEAD→GET fallback when HEAD returns 405.
// classifyProbeOutcome only ever sees the post-fallback HTTP status, so
// any 405 reaching this function means GET also returned 405 (genuinely
// unusual). It surfaces to the human queue rather than being silently
// treated as live.
expectClassification(
  "405 (HEAD-GET fallback exhausted; GET also 405) → NEEDS_MANUAL_REVIEW",
  probe(405),
  "NEEDS_MANUAL_REVIEW",
  "http_4xx_405",
);

console.log("\nUnresolved redirects (would only land here if fetch failed to resolve):");
expectClassification(
  "301 unresolved → NEEDS_MANUAL_REVIEW",
  probe(301),
  "NEEDS_MANUAL_REVIEW",
  "http_3xx_301_unresolved_redirect",
);
expectClassification(
  "308 unresolved → NEEDS_MANUAL_REVIEW",
  probe(308),
  "NEEDS_MANUAL_REVIEW",
  "http_3xx_308_unresolved_redirect",
);

console.log("\nAuth / permission walls:");
expectClassification(
  "401 Unauthorized → NEEDS_MANUAL_REVIEW",
  probe(401),
  "NEEDS_MANUAL_REVIEW",
  "http_401_unauthorized",
);
expectClassification(
  "403 Forbidden → NEEDS_MANUAL_REVIEW",
  probe(403),
  "NEEDS_MANUAL_REVIEW",
  "http_403_forbidden",
);

console.log("\nMissing-resource — NOT auto-routed to SOURCE_DEAD (PR 3.3 contract):");
expectClassification(
  "404 Not Found → NEEDS_MANUAL_REVIEW (NOT SOURCE_DEAD)",
  probe(404),
  "NEEDS_MANUAL_REVIEW",
  "http_404_not_found",
);
expectClassification(
  "410 Gone → NEEDS_MANUAL_REVIEW (NOT SOURCE_DEAD)",
  probe(410),
  "NEEDS_MANUAL_REVIEW",
  "http_410_gone",
);

console.log("\nTransient — REVERIFYING (try again next day):");
expectClassification(
  "408 Request Timeout (from upstream) → REVERIFYING",
  probe(408),
  "REVERIFYING",
  "http_408_transient",
);
expectClassification(
  "429 Too Many Requests → REVERIFYING",
  probe(429),
  "REVERIFYING",
  "http_429_transient",
);
expectClassification(
  "500 Internal Server Error → REVERIFYING",
  probe(500),
  "REVERIFYING",
  "http_5xx_500",
);
expectClassification(
  "502 Bad Gateway → REVERIFYING",
  probe(502),
  "REVERIFYING",
  "http_5xx_502",
);
expectClassification(
  "503 Service Unavailable → REVERIFYING",
  probe(503),
  "REVERIFYING",
  "http_5xx_503",
);
expectClassification(
  "504 Gateway Timeout → REVERIFYING",
  probe(504),
  "REVERIFYING",
  "http_5xx_504",
);

console.log("\nLocal failures (timeout / network error):");
expectClassification(
  "fetch aborted by 10s timeout → REVERIFYING",
  probe(408, "timeout"),
  "REVERIFYING",
  "timeout_10s",
);
expectClassification(
  "DNS / connection refused → REVERIFYING",
  probe(0, "network"),
  "REVERIFYING",
  "network_error",
);

console.log("\nUnusual 4xx — surface to human queue:");
expectClassification(
  "451 Unavailable for Legal Reasons → NEEDS_MANUAL_REVIEW",
  probe(451),
  "NEEDS_MANUAL_REVIEW",
  "http_4xx_451",
);
expectClassification(
  "418 I'm a teapot → NEEDS_MANUAL_REVIEW",
  probe(418),
  "NEEDS_MANUAL_REVIEW",
  "http_4xx_418",
);

console.log("\nUnknown / unexpected:");
expectClassification(
  "999 (off-spec) → NEEDS_MANUAL_REVIEW",
  probe(999),
  "NEEDS_MANUAL_REVIEW",
  "http_unexpected_999",
);

console.log("\nURL picker priority (sourceUrl > applicationUrl > websiteUrl):");
expectPick(
  "sourceUrl wins when present",
  { sourceUrl: "https://a.example", applicationUrl: "https://b.example", websiteUrl: "https://c.example" },
  "https://a.example",
);
expectPick(
  "applicationUrl when no sourceUrl",
  { sourceUrl: null, applicationUrl: "https://b.example", websiteUrl: "https://c.example" },
  "https://b.example",
);
expectPick(
  "websiteUrl as last fallback",
  { sourceUrl: null, applicationUrl: null, websiteUrl: "https://c.example" },
  "https://c.example",
);
expectPick("all null → null", { sourceUrl: null, applicationUrl: null, websiteUrl: null }, null);
expectPick(
  "empty strings ignored",
  { sourceUrl: "", applicationUrl: "   ", websiteUrl: "https://c.example" },
  "https://c.example",
);

console.log("");
console.log(`Total: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
