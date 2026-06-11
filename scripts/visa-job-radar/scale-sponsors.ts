// Measure the actual inventory: batch-resolve the head of the sponsor universe to
// their own ATS and COUNT the physician openings reachable employer-direct. This
// answers "what will our data be / how many J-1+H-1B physician jobs can we surface
// that the boards do not tag as such".
//   npx tsx scripts/visa-job-radar/scale-sponsors.ts
//
// Every employer here is a KNOWN DOL physician H-1B sponsor. Each opening at a
// sponsor is a sponsor-backed J-1/H-1B lead — findable as a visa job even though
// the posting is silent and no board tags it. json-api (Workday/Greenhouse) are
// probed for a live count; iCIMS/Oracle (json-ld) are reported as reachable-via-
// JSON-LD (the fetch path is the next build).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { detectAts, type AtsType, type Reach } from "./ats-resolver";

// Curated careers pages for top DOL physician sponsors (their OWN domains).
const SEED: Array<{ employer: string; url: string }> = [
  { employer: "Cleveland Clinic", url: "https://jobs.clevelandclinic.org" },
  { employer: "University of Arkansas for Medical Sciences", url: "https://jobs.uams.edu" },
  { employer: "Memorial Sloan Kettering", url: "https://careers.mskcc.org" },
  { employer: "Mayo Clinic", url: "https://jobs.mayoclinic.org" },
  { employer: "Icahn School of Medicine at Mount Sinai", url: "https://careers.mountsinai.org" },
  { employer: "Emory University", url: "https://careers.emory.edu" },
  { employer: "Banner Health", url: "https://www.bannerhealth.com/careers" },
  { employer: "Montefiore Medical Center", url: "https://jobs.montefiore.org" },
  { employer: "University of Iowa", url: "https://jobs.uiowa.edu" },
  { employer: "Mass General Brigham", url: "https://careers.massgeneralbrigham.org" },
  { employer: "UPMC", url: "https://careers.upmc.com" },
  { employer: "Duke University", url: "https://careers.duke.edu" },
  { employer: "Yale New Haven Health", url: "https://careers.ynhhs.org" },
  { employer: "University of Michigan", url: "https://careers.umich.edu" },
  { employer: "Henry Ford Health", url: "https://careers.henryford.com" },
  { employer: "Baylor College of Medicine", url: "https://jobs.bcm.edu" },
  { employer: "Northwestern Medicine", url: "https://jobs.nm.org" },
  { employer: "Stanford Health Care", url: "https://careers.stanfordhealthcare.org" },
  { employer: "UCSF", url: "https://careers.ucsf.edu" },
  { employer: "Johns Hopkins Medicine", url: "https://jobs.hopkinsmedicine.org" },
  { employer: "Penn Medicine", url: "https://careers.pennmedicine.org" },
  { employer: "Vanderbilt University Medical Center", url: "https://careers.vumc.org" },
  { employer: "Geisinger", url: "https://careers.geisinger.org" },
  { employer: "Ochsner Health", url: "https://careers.ochsner.org" },
  { employer: "Houston Methodist", url: "https://jobs.houstonmethodist.org" },
  { employer: "Indiana University", url: "https://careers.iu.edu" },
  { employer: "University of Florida", url: "https://explore.jobs.ufl.edu" },
  { employer: "Rochester Regional Health", url: "https://rochesterregional.org/careers" },
  { employer: "Maimonides Medical Center", url: "https://www.maimonidesmed.org/careers" },
  { employer: "Rush University Medical Center", url: "https://jobs.rush.edu" },
  { employer: "University of Maryland Medical System", url: "https://careers.umms.org" },
  { employer: "Wayne State University", url: "https://jobs.wayne.edu" },
  { employer: "University of Texas Medical Branch", url: "https://jobs.utmb.edu" },
  { employer: "SUNY Upstate Medical University", url: "https://www.upstate.edu/hr/jobs" },
  { employer: "University of Kentucky", url: "https://ukjobs.uky.edu" },
  { employer: "Tufts Medical Center", url: "https://careers.tuftsmedicine.org" },
];

const UA = "Mozilla/5.0 (compatible; USCEHub-visa-job-radar/1.0; sponsor-resolve)";
const OUT_DIR = join(process.cwd(), "docs/platform-v2/local/career/jobs/radar/sponsor-universe");

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url: string, ms: number): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), ms);
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: ctrl.signal });
    clearTimeout(to);
    const html = await res.text();
    return { html, finalUrl: res.url || url };
  } catch {
    return null;
  }
}

// Lightweight live count probes (read totals only; do not pull every detail).
async function workdayCount(handle: string): Promise<number | null> {
  const [tenant, dc, site] = handle.split("/");
  if (!tenant || !dc || !site) return null;
  const url = "https://" + tenant + "." + dc + ".myworkdayjobs.com/wday/cxs/" + tenant + "/" + site + "/jobs";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ appliedFacets: {}, limit: 1, offset: 0, searchText: "physician" }),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { total?: number };
    return typeof d.total === "number" ? d.total : null;
  } catch {
    return null;
  }
}

async function greenhouseCount(handle: string): Promise<number | null> {
  try {
    const res = await fetch("https://boards-api.greenhouse.io/v1/boards/" + handle + "/jobs", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { jobs?: Array<{ title?: string }> };
    const jobs = d.jobs ?? [];
    return jobs.filter((j) => (j.title ?? "").toLowerCase().includes("physician")).length;
  } catch {
    return null;
  }
}

interface Row {
  employer: string;
  url: string;
  type: AtsType;
  reach: Reach;
  handle?: string;
  physicianCount?: number;
}

async function resolveOne(s: { employer: string; url: string }): Promise<Row> {
  const got = await fetchText(s.url, 15000);
  if (!got) return { employer: s.employer, url: s.url, type: "unknown", reach: "none" };
  const det = detectAts(got.html, got.finalUrl);
  const row: Row = { employer: s.employer, url: s.url, type: det.type, reach: det.reach, handle: det.handle };
  if (det.type === "workday" && det.handle) row.physicianCount = (await workdayCount(det.handle)) ?? undefined;
  else if (det.type === "greenhouse" && det.handle) row.physicianCount = (await greenhouseCount(det.handle)) ?? undefined;
  return row;
}

async function main(): Promise<void> {
  console.log("Resolving " + SEED.length + " top DOL sponsors to their ATS + counting physician openings...\n");
  const rows: Row[] = [];
  for (let i = 0; i < SEED.length; i += 4) {
    const batch = SEED.slice(i, i + 4);
    rows.push(...(await Promise.all(batch.map(resolveOne))));
    await delay(300);
  }

  const apiResolved = rows.filter((r) => r.reach === "json-api" && r.handle);
  const liveCounted = apiResolved.filter((r) => typeof r.physicianCount === "number");
  const jsonLd = rows.filter((r) => r.reach === "json-ld");
  const totalLive = liveCounted.reduce((s, r) => s + (r.physicianCount ?? 0), 0);

  const lines: string[] = [];
  lines.push("# Sponsor inventory — live count across top DOL sponsors");
  lines.push("");
  lines.push("Each row is a KNOWN DOL physician H-1B sponsor resolved to its own ATS. 'physicianCount' is");
  lines.push("the live count of 'physician' openings at that employer (Workday CXS / Greenhouse), every one");
  lines.push("a sponsor-backed J-1/H-1B lead. iCIMS/Oracle (json-ld) are reachable via the JSON-LD reader.");
  lines.push("");
  lines.push("## Totals");
  lines.push("- Sponsors probed: " + rows.length);
  lines.push("- Resolved to a no-auth JSON API (Workday/Greenhouse): " + apiResolved.length);
  lines.push("- Live-counted: " + liveCounted.length);
  lines.push("- **Physician openings reachable RIGHT NOW (json-api only): " + totalLive + "**");
  lines.push("- Additional sponsors reachable via JSON-LD (iCIMS/Oracle, fetch path = next build): " + jsonLd.length);
  lines.push("");
  lines.push("## Per sponsor");
  lines.push("| Employer | ATS | Reach | Physician openings | Handle |");
  lines.push("|---|---|---|---|---|");
  for (const r of [...rows].sort((a, b) => (b.physicianCount ?? -1) - (a.physicianCount ?? -1))) {
    lines.push("| " + r.employer + " | " + r.type + " | " + r.reach + " | " + (r.physicianCount ?? "") + " | " + (r.handle ?? "") + " |");
  }
  lines.push("");
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "sponsor_inventory.md"), lines.join("\n"), "utf8");

  // Emit registry-ready Workday entries for the live-counted sponsors.
  const registryReady = liveCounted
    .filter((r) => r.type === "workday")
    .map((r) => ({ employer: r.employer, handle: r.handle, physicianCount: r.physicianCount }));
  writeFileSync(join(OUT_DIR, "resolved_workday_sponsors.json"), JSON.stringify(registryReady, null, 2) + "\n", "utf8");

  console.log("Resolved to no-auth JSON API: " + apiResolved.length + " / " + rows.length);
  console.log("PHYSICIAN OPENINGS reachable right now (json-api): " + totalLive);
  console.log("Reachable via JSON-LD (iCIMS/Oracle, next build): " + jsonLd.length + " more sponsors");
  console.log("");
  console.log("Top live-counted sponsors:");
  for (const r of liveCounted.sort((a, b) => (b.physicianCount ?? 0) - (a.physicianCount ?? 0)).slice(0, 12)) {
    console.log("  " + (r.physicianCount ?? 0) + "  " + r.employer + "  [" + r.handle + "]");
  }
  console.log("\n  report: " + join(OUT_DIR, "sponsor_inventory.md"));
}

main();
