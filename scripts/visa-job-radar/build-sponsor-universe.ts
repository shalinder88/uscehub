// Build the sponsor universe artifact (Phase B runner). Deterministic, no network.
//   npx tsx scripts/visa-job-radar/build-sponsor-universe.ts
// Writes the ranked master sponsor list + a human summary to the run dir. This
// is the TARGETING spine for the employer-direct resolver — never published as jobs.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildSponsorUniverse, type SponsorUniverseEntry } from "./sponsor-universe";

const OUT_DIR = join(
  process.cwd(),
  "docs/platform-v2/local/career/jobs/radar/sponsor-universe",
);

function pct(n: number, d: number): string {
  return d === 0 ? "0%" : Math.round((n / d) * 1000) / 10 + "%";
}

function summarize(u: SponsorUniverseEntry[]): string {
  const total = u.length;
  const j1 = u.filter((e) => e.visaTypes.includes("j1")).length;
  const cap = u.filter((e) => e.capExempt).length;
  const withCity = u.filter((e) => e.state).length;
  const totalPositions = u.reduce((s, e) => s + e.totalPositions, 0);

  // Concentration: what share of total sponsored positions sits in the top N?
  const byPos = [...u].sort((a, b) => b.totalPositions - a.totalPositions);
  const cum = (n: number) =>
    byPos.slice(0, n).reduce((s, e) => s + e.totalPositions, 0);

  const lines: string[] = [];
  lines.push("# Visa Job Radar — Sponsor Universe (Phase B)");
  lines.push("");
  lines.push("Built from the public DOL LCA data in the repo (physician-scoped). LCA = sponsorship");
  lines.push("history/intent, NOT a live opening. This is the employer TARGETING spine for the");
  lines.push("employer-direct resolver — it is never published as jobs.");
  lines.push("");
  lines.push("## Universe");
  lines.push("- Distinct sponsoring employers: **" + total + "**");
  lines.push("- J-1-waiver-eligible (visaTypes includes j1): " + j1 + " (" + pct(j1, total) + ")");
  lines.push("- Cap-exempt (academic/non-profit, sponsors year-round): " + cap + " (" + pct(cap, total) + ")");
  lines.push("- With a resolvable state: " + withCity + " (" + pct(withCity, total) + ")");
  lines.push("- Total certified LCA positions (volume): " + totalPositions);
  lines.push("");
  lines.push("## Concentration (why monitoring the head captures most of the flow)");
  lines.push("- Top 10 employers = " + pct(cum(10), totalPositions) + " of all positions");
  lines.push("- Top 50 employers = " + pct(cum(50), totalPositions) + " of all positions");
  lines.push("- Top 100 employers = " + pct(cum(100), totalPositions) + " of all positions");
  lines.push("- Top 250 employers = " + pct(cum(250), totalPositions) + " of all positions");
  lines.push("");
  // Persistence tier breakdown
  const tiers = [7, 6, 5, 4, 3, 2, 1, 0].map((n) => ({ n, count: u.filter((e) => (e.yearsActive ?? 0) === n).length }));
  lines.push("## Persistence tiers (FY2019-FY2025, 7 full years)");
  lines.push("");
  lines.push("| Yrs active | Employers | Interpretation |");
  lines.push("|-----------|-----------|----------------|");
  const tierLabels: Record<number, string> = {
    7: "Iron core — sponsored every year (highest reliability)",
    6: "Consistent — missed one year (weather or gap year)",
    5: "Regular — strong multi-year track record",
    4: "Moderate — filed most years",
    3: "Occasional — active in about half the years",
    2: "Rare — filed in 2 of 7 years",
    1: "Single-year — one-time filer, lowest reliability",
    0: "Legacy only — in hand-verified data, no DOL LCA record found",
  };
  for (const { n, count } of tiers) {
    if (count > 0) lines.push(`| ${n}/7 | ${count} | ${tierLabels[n] ?? ""} |`);
  }
  lines.push("");

  lines.push("## Top 40 sponsors by Sponsor-History Score");
  lines.push("");
  lines.push("| # | Score | Yrs | FY2025 pos | Employer | State | J1 | CapEx |");
  lines.push("|---|---|---|---|---|---|---|---|");
  u.slice(0, 40).forEach((e, i) => {
    lines.push(
      "| " + (i + 1) +
      " | " + e.score +
      " | " + (e.yearsActive ?? "?") + "/7" +
      " | " + (e.recentYearPositions ?? "-") +
      " | " + e.employer +
      " | " + (e.state ?? "?") +
      " | " + (e.visaTypes.includes("j1") ? "yes" : "-") +
      " | " + (e.capExempt ? "yes" : "-") +
      " |",
    );
  });
  lines.push("");
  return lines.join("\n");
}

function main(): void {
  const u = buildSponsorUniverse();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "sponsor_universe.json"), JSON.stringify(u, null, 2) + "\n", "utf8");
  writeFileSync(join(OUT_DIR, "sponsor_universe_summary.md"), summarize(u), "utf8");

  const j1 = u.filter((e) => e.visaTypes.includes("j1")).length;
  const cap = u.filter((e) => e.capExempt).length;
  console.log("Sponsor universe built:");
  console.log("  distinct employers: " + u.length);
  console.log("  j1-eligible: " + j1 + " | cap-exempt: " + cap);
  console.log("  top 5:");
  for (const e of u.slice(0, 5)) {
    console.log("    [" + e.score + "] " + e.employer + " (" + (e.state ?? "?") + ") pos=" + e.totalPositions + " " + e.visaTypes.join("+"));
  }
  console.log("  artifact: " + join(OUT_DIR, "sponsor_universe.json"));
}

main();
