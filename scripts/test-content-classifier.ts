/**
 * Unit tests for src/lib/content-classifier.ts.
 *
 * Pure-function tests. No DB. No network.
 *
 * Run from repo root:
 *   npx tsx scripts/test-content-classifier.ts
 */

import { classifyContent } from "../src/lib/content-classifier";

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

// 1. Generic homepage → GENERIC_HOMEPAGE.
expectEqual(
  classifyContent({ url: "https://www.bcm.edu/" }).classification,
  "GENERIC_HOMEPAGE",
  "1: bcm.edu root → GENERIC_HOMEPAGE"
);

expectEqual(
  classifyContent({ url: "https://www.mountsinai.org/" }).classification,
  "GENERIC_HOMEPAGE",
  "2: mountsinai.org root → GENERIC_HOMEPAGE"
);

expectEqual(
  classifyContent({ url: "https://example.org/about" }).classification,
  "GENERIC_HOMEPAGE",
  "3: /about → GENERIC_HOMEPAGE"
);

// 2. Path-keyword positive match.
expectEqual(
  classifyContent({
    url: "https://www.mskcc.org/hcp-education-training/medical-students/summer-fellowship",
  }).classification,
  "PATH_HINTS_PROGRAM",
  "4: MSK summer fellowship path → PATH_HINTS_PROGRAM"
);

expectEqual(
  classifyContent({
    url: "https://www.uwmedicine.org/school-of-medicine/visiting-students-program/visiting-us-canada",
  }).classification,
  "PATH_HINTS_PROGRAM",
  "5: UW visiting-students path → PATH_HINTS_PROGRAM"
);

// 3. Wrong-page hint downgrades a positive match.
expectEqual(
  classifyContent({
    url: "https://international.northwell.edu/consulting-advisory-services",
  }).classification,
  "LIKELY_WRONG_PAGE",
  "6: Northwell consulting-advisory path → LIKELY_WRONG_PAGE"
);

expectEqual(
  classifyContent({
    url: "https://example.org/observership-billing",
  }).classification,
  "LIKELY_WRONG_PAGE",
  "7: path with billing wrong-page hint → LIKELY_WRONG_PAGE"
);

// 4. Deep path with no keyword match → DEEP_PATH_NO_HINT.
expectEqual(
  classifyContent({
    url: "https://example.org/some/random/path/that/has/no/keywords",
  }).classification,
  "DEEP_PATH_NO_HINT",
  "8: deep path no hint → DEEP_PATH_NO_HINT"
);

// 5. Login wall via content snippet.
expectEqual(
  classifyContent({
    url: "https://example.org/observership/apply",
    contentSnippet: 'Please <input type="password" name="password"/> sign in',
  }).classification,
  "LOGIN_REQUIRED",
  "9: login form snippet overrides → LOGIN_REQUIRED"
);

// 6. Probe failure → SOURCE_DEAD only when explicit.
expectEqual(
  classifyContent({
    url: "https://example.org/observership/apply",
    httpStatus: 0,
  }).classification,
  "SOURCE_DEAD",
  "10: httpStatus=0 → SOURCE_DEAD"
);

// 7. Invalid URL → UNKNOWN.
expectEqual(
  classifyContent({ url: "not-a-url" }).classification,
  "UNKNOWN",
  "11: invalid URL → UNKNOWN"
);

// 8. Content snippet upgrades a deep path with no path keyword.
expectEqual(
  classifyContent({
    url: "https://example.org/programs/x42",
    contentSnippet:
      "Our visiting medical student program offers six-week observership rotations.",
  }).classification,
  "PATH_HINTS_PROGRAM",
  "12: content snippet keyword → PATH_HINTS_PROGRAM"
);

// 9. Path is generic but content snippet says it's a program — generic
// path is the stronger negative signal; result stays GENERIC_HOMEPAGE.
expectEqual(
  classifyContent({
    url: "https://example.org/",
    contentSnippet: "Visiting student observership program brochure here.",
  }).classification,
  "GENERIC_HOMEPAGE",
  "13: generic path beats content snippet (conservative)"
);

// 10. wrongPageHints surfaces the matched hint word.
const r14 = classifyContent({
  url: "https://example.org/news/observership-press-release",
});
expectEqual(r14.classification, "LIKELY_WRONG_PAGE", "14a: news page → LIKELY_WRONG_PAGE");
if (!r14.wrongPageHints.includes("press release")) {
  fail++;
  failures.push("14b: wrongPageHints did not include 'press release'");
} else {
  pass++;
}

// 11. Hostname is reported lowercase.
expectEqual(
  classifyContent({ url: "https://WWW.Example.ORG/observership" }).hostname,
  "www.example.org",
  "15: hostname is lowercased"
);

// Summary
const total = pass + fail;
console.log(`\n${pass}/${total} passed.`);
if (fail > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
