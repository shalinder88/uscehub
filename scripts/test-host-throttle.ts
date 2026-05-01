/**
 * Unit tests for src/lib/host-throttle.ts.
 *
 * Pure-function tests. No DB. No network.
 *
 * Run from repo root:
 *   npx tsx scripts/test-host-throttle.ts
 */

import { partitionByHost } from "../src/lib/host-throttle";

let pass = 0;
let fail = 0;
const failures: string[] = [];

function expectEqual<T>(got: T, want: T, label: string) {
  if (JSON.stringify(got) === JSON.stringify(want)) {
    pass++;
  } else {
    fail++;
    failures.push(`${label}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
  }
}

// 1. Empty input → empty result.
const e = partitionByHost([]);
expectEqual(e.toProbe.length, 0, "1a: empty toProbe");
expectEqual(e.deferred.length, 0, "1b: empty deferred");
expectEqual(e.hostnamesSeen, [], "1c: no hostnames seen");

// 2. Default cap is 1 per host. Two listings on the same host → first
// probes, second defers.
const r2 = partitionByHost([
  { id: "a", probeUrl: "https://example.org/foo" },
  { id: "b", probeUrl: "https://example.org/bar" },
]);
expectEqual(r2.toProbe.map((c) => c.id), ["a"], "2a: only first probes");
expectEqual(r2.deferred.map((d) => d.id), ["b"], "2b: second deferred");
expectEqual(r2.deferred[0]?.hostname, "example.org", "2c: deferred hostname recorded");
expectEqual(r2.hostnamesSeen, ["example.org"], "2d: one host seen");

// 3. Different hosts → both probe.
const r3 = partitionByHost([
  { id: "a", probeUrl: "https://example.org/foo" },
  { id: "b", probeUrl: "https://other.com/bar" },
]);
expectEqual(r3.toProbe.length, 2, "3a: both probe");
expectEqual(r3.deferred.length, 0, "3b: nothing deferred");
expectEqual(r3.hostnamesSeen.length, 2, "3c: two hosts seen");

// 4. maxPerHost = 2 → first two on a host probe, third defers.
const r4 = partitionByHost(
  [
    { id: "a", probeUrl: "https://example.org/1" },
    { id: "b", probeUrl: "https://example.org/2" },
    { id: "c", probeUrl: "https://example.org/3" },
  ],
  { maxPerHost: 2 }
);
expectEqual(r4.toProbe.map((c) => c.id), ["a", "b"], "4a: first two probe");
expectEqual(r4.deferred.map((d) => d.id), ["c"], "4b: third deferred");

// 5. maxPerHost = 0 should clamp to 1 (defensive).
const r5 = partitionByHost(
  [{ id: "a", probeUrl: "https://example.org/x" }],
  { maxPerHost: 0 }
);
expectEqual(r5.toProbe.length, 1, "5: maxPerHost=0 clamps to 1");

// 6. Null/empty/invalid URLs pass through unchanged (the cron handles
// them via skip-no-url).
const r6 = partitionByHost([
  { id: "a", probeUrl: null },
  { id: "b", probeUrl: "not-a-url" },
  { id: "c", probeUrl: "" },
  { id: "d", probeUrl: "https://example.org/path" },
]);
expectEqual(r6.toProbe.map((c) => c.id), ["a", "b", "c", "d"], "6a: all four pass through");
expectEqual(r6.deferred.length, 0, "6b: nothing deferred for unparseable URLs");
expectEqual(r6.hostnamesSeen, ["example.org"], "6c: only the parseable host seen");

// 7. Order preservation: input order = toProbe order for kept rows.
const r7 = partitionByHost([
  { id: "first", probeUrl: "https://a.com/x" },
  { id: "second", probeUrl: "https://b.com/x" },
  { id: "third", probeUrl: "https://a.com/y" }, // dup of first host
  { id: "fourth", probeUrl: "https://c.com/x" },
]);
expectEqual(
  r7.toProbe.map((c) => c.id),
  ["first", "second", "fourth"],
  "7a: first occurrence per host wins, order preserved"
);
expectEqual(
  r7.deferred.map((d) => d.id),
  ["third"],
  "7b: second occurrence on a host deferred"
);

// 8. Hostname comparison is case-insensitive.
const r8 = partitionByHost([
  { id: "a", probeUrl: "https://Example.ORG/x" },
  { id: "b", probeUrl: "https://example.org/y" },
]);
expectEqual(r8.toProbe.map((c) => c.id), ["a"], "8a: case-insensitive match");
expectEqual(r8.deferred.map((d) => d.id), ["b"], "8b: case-insensitive defer");

const total = pass + fail;
console.log(`\n${pass}/${total} passed.`);
if (fail > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
