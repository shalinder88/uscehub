// Temporary probe script — run once to verify json-ld source URLs return
// physician candidates before enabling them in source-registry.ts.
// Usage: npx tsx scripts/visa-job-radar/probe-jsonld.ts
import { fetchJsonLd } from "./ats-resolver";

const PROBES: Array<{ id: string; url: string; employer: string }> = [
  { id: "jsonld-tufts", url: "https://careers.tuftsmedicine.org/us/en/search-results?keywords=physician", employer: "Tufts Medical Center" },
  { id: "jsonld-mercy", url: "https://careers.mercy.com/us/en/search-results?keywords=physician",        employer: "Mercy Health" },
  { id: "jsonld-umms",  url: "https://careers.umms.org/us/en/search-results?keywords=physician",         employer: "University of Maryland Medical System" },
];

async function main(): Promise<void> {
  for (const p of PROBES) {
    console.log("\nProbing " + p.id + " ...");
    try {
      const results = await fetchJsonLd(p.url, p.employer, p.id);
      console.log("  => " + results.length + " candidates");
      for (const r of results.slice(0, 3)) {
        console.log("     [" + r.sourceId + "] " + r.title + " | " + (r.city ?? "?") + ", " + (r.state ?? "?"));
      }
      if (results.length === 0) console.log("     (no candidates — URL may be wrong or SPA-rendered)");
    } catch (e) {
      console.log("  => ERROR: " + String(e));
    }
  }
}

main();
