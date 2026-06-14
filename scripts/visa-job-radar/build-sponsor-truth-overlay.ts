// Code-gen: reads sponsor_truth.json and writes src/lib/sponsor-truth-overlay.ts
// Run: npx tsx scripts/visa-job-radar/build-sponsor-truth-overlay.ts

import { readFileSync, writeFileSync } from "fs";

const TRUTH_FILE =
  "docs/platform-v2/local/career/jobs/radar/sponsor-universe/sponsor_truth.json";
const OUT_FILE = "src/lib/sponsor-truth-overlay.ts";

interface TruthRecord {
  employer: string;
  normKey: string;
  state: string;
  history: {
    totalCertifiedPositions: number;
    specialties: string[];
    j1Flag: boolean;
    capExempt: boolean;
  };
  liveActivity: {
    physicianNotices: number;
    latestNoticeAt?: string;
    notices: Array<{
      role: string;
      salaryText: string;
      periodText?: string;
      noticeUrl?: string;
      firstSeenAt: string;
    }>;
  };
}

const records: TruthRecord[] = JSON.parse(readFileSync(TRUTH_FILE, "utf8"));

// Live physician notice employers: normKey → { employer, state, notices[] }
const liveEntries: Array<{
  normKey: string;
  employer: string;
  state: string;
  latestNoticeAt: string;
  notices: Array<{
    role: string;
    salaryText: string;
    noticeUrl: string;
    periodText: string;
    firstSeenAt: string;
  }>;
}> = [];

for (const r of records) {
  const physNotices = (r.liveActivity?.notices ?? []).filter(
    (n) => n.noticeUrl
  );
  if (physNotices.length > 0) {
    liveEntries.push({
      normKey: r.normKey,
      employer: r.employer,
      state: r.state,
      latestNoticeAt: r.liveActivity.latestNoticeAt ?? physNotices[0].firstSeenAt,
      notices: physNotices.map((n) => ({
        role: n.role,
        salaryText: n.salaryText,
        noticeUrl: n.noticeUrl!,
        periodText: n.periodText ?? "",
        firstSeenAt: n.firstSeenAt,
      })),
    });
  }
}

// Cap-exempt normKeys
const capExemptKeys: string[] = records
  .filter((r) => r.history?.capExempt)
  .map((r) => r.normKey);

// Write output
const out: string[] = [
  "// Auto-generated — run: npx tsx scripts/visa-job-radar/build-sponsor-truth-overlay.ts",
  `// ${records.length} employers total · ${liveEntries.length} with live physician LCA notices · ${capExemptKeys.length} cap-exempt`,
  "",
  "// Replicates normEmployer() from sponsor-universe.ts for client-side lookup.",
  "const CORP_SUFFIXES = new Set([",
  '  "the","inc","llc","pa","pc","pllc","ltd","corp","corporation",',
  '  "company","co","group","incorporated","associates","association",',
  "]);",
  "",
  "export function normEmployerKey(s: string): string {",
  '  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ")',
  "    .filter((t) => t.length > 0 && !CORP_SUFFIXES.has(t))",
  '    .join(" ").trim();',
  "}",
  "",
  "export interface LiveNotice {",
  "  role: string;",
  "  salaryText: string;",
  "  noticeUrl: string;",
  "  periodText: string;",
  "  firstSeenAt: string;",
  "}",
  "",
  "export interface LiveNoticeEmployer {",
  "  employer: string;",
  "  state: string;",
  "  latestNoticeAt: string;",
  "  notices: LiveNotice[];",
  "}",
  "",
  "// normKey → active physician LCA notice data from the employer's own public page.",
  "// 20 CFR 655.734 requires ~10 business day public posting — this is the freshest",
  "// legal H-1B signal, months ahead of DOL quarterly disclosure files.",
  "export const LIVE_NOTICE_EMPLOYERS = new Map<string, LiveNoticeEmployer>([",
];

for (const e of liveEntries) {
  out.push(`  [${JSON.stringify(e.normKey)}, {`);
  out.push(`    employer: ${JSON.stringify(e.employer)},`);
  out.push(`    state: ${JSON.stringify(e.state)},`);
  out.push(`    latestNoticeAt: ${JSON.stringify(e.latestNoticeAt)},`);
  out.push(`    notices: [`);
  for (const n of e.notices) {
    out.push(
      `      { role: ${JSON.stringify(n.role)}, salaryText: ${JSON.stringify(n.salaryText ?? "")}, noticeUrl: ${JSON.stringify(n.noticeUrl)}, periodText: ${JSON.stringify(n.periodText ?? "")}, firstSeenAt: ${JSON.stringify(n.firstSeenAt)} },`
    );
  }
  out.push(`    ],`);
  out.push(`  }],`);
}

out.push(`]);`);
out.push("");
out.push(
  "// normKeys of cap-exempt employers (H-1B cap does not apply; no annual lottery)."
);
out.push(
  `export const CAP_EXEMPT_KEYS = new Set<string>(${JSON.stringify(capExemptKeys)});`
);
out.push("");

writeFileSync(OUT_FILE, out.join("\n"), "utf8");
console.log(`Wrote ${OUT_FILE}`);
console.log(`  ${liveEntries.length} live notice employers`);
console.log(`  ${capExemptKeys.length} cap-exempt employers`);
