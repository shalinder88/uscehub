/**
 * P96-2 / P96-3 — listing screenshot audit using Playwright.
 *
 * Discovers listings by reading the local dev server's /browse page
 * (no DB connection — dev server's Prisma pool stays untouched).
 * For each listing:
 *   1. Captures USCEHub listing detail (local).
 *   2. Extracts the apply-CTA href via DOM.
 *   3. Captures the official source URL (live external).
 * Runs the pure content classifier on URL + status.
 * Writes per-listing JSON sidecar + summary CSV + Markdown audit.
 *
 * No DB mutation. No login. 12 s page timeout. 1.2 s per-host gap.
 *
 * Run from repo root with the dev server up at localhost:3000:
 *   npx tsx scripts/p96-2-listing-audit.ts [--n 25]
 *
 * Flags:
 *   --n <int>             — sample size (default 25)
 *   --output-prefix <s>   — prefix for output filenames + subfolder
 *                           (default `p96_2_25_listing_sample`).
 *                           Use `p96_3_full_304_listing` for P96-3.
 *   --skip-existing       — skip listings whose USCEHub screenshot
 *                           already exists. Lets a long run resume.
 *   --delay-ms <int>      — per-host gap (default 1200).
 *   --timeout-ms <int>    — per-page timeout (default 12000).
 *   --subfolder <s>       — screenshot subfolder under
 *                           docs/platform-v2/local/screenshots/p96-existing-listings/.
 *                           Default empty (top-level). Use `full-304`
 *                           for P96-3.
 */

import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium, type Page } from "playwright";
import { classifyContent } from "../src/lib/content-classifier";

const LOCAL_BASE = "http://localhost:3000";
const SCREENSHOTS_ROOT_BASE = "docs/platform-v2/local/screenshots/p96-existing-listings";
const VIEWPORT = { width: 1440, height: 900 };

function readArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name);
  if (idx < 0 || idx + 1 >= process.argv.length) return fallback;
  return process.argv[idx + 1];
}
function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

async function ensureDir(p: string) {
  await mkdir(dirname(p), { recursive: true });
}
async function ensureFolder(p: string) {
  await mkdir(p, { recursive: true });
}

interface SampleListing {
  id: string;
  title: string;
  href: string;
  category: string;
}

async function discoverSample(
  page: Page,
  n: number,
  pageTimeout: number
): Promise<SampleListing[]> {
  await page.goto(`${LOCAL_BASE}/browse`, {
    waitUntil: "domcontentloaded",
    timeout: pageTimeout,
  });
  await page.waitForTimeout(1500);
  // Read every listing link on /browse and stride-sample.
  const all = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/listing/"]'));
    return anchors.map((a) => {
      const href = a.getAttribute("href") || "";
      const id = href.split("/listing/")[1] || "";
      // The first badge text is the listingType-display value.
      const badge = a.querySelector(".bg-blue-50, .bg-green-50, .bg-violet-50, .bg-amber-50, .bg-rose-50, .bg-slate-100, [class*='Badge'], span[class*='bg-']")?.textContent?.trim() || "";
      const title = a.querySelector("h3")?.textContent?.trim() || "";
      return { id, href, title, category: badge };
    }).filter((r) => r.id);
  });
  // Dedupe by id (browse may render the same listing twice if filters reuse it).
  const seen = new Set<string>();
  const unique = all.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
  // Stride-sample to spread across the page.
  const stride = Math.max(1, Math.floor(unique.length / n));
  const picks: SampleListing[] = [];
  for (let i = 0; i < unique.length && picks.length < n; i += stride) {
    picks.push(unique[i]);
  }
  return picks;
}

interface CaptureResult {
  ok: boolean;
  path: string | null;
  finalUrl: string | null;
  httpStatus: number | null;
  errorMessage: string | null;
  captureMs: number;
}

async function capture(
  page: Page,
  url: string,
  outPath: string,
  timeoutMs: number
): Promise<CaptureResult> {
  const start = Date.now();
  try {
    const resp = await page.goto(url, {
      timeout: timeoutMs,
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(800);
    await ensureDir(outPath);
    await page.screenshot({ path: outPath, fullPage: false });
    return {
      ok: true,
      path: outPath,
      finalUrl: resp?.url() ?? null,
      httpStatus: resp?.status() ?? null,
      errorMessage: null,
      captureMs: Date.now() - start,
    };
  } catch (e) {
    return {
      ok: false,
      path: null,
      finalUrl: null,
      httpStatus: null,
      errorMessage: e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200),
      captureMs: Date.now() - start,
    };
  }
}

async function main() {
  const argN = parseInt(readArg("--n", "25"), 10);
  const outputPrefix = readArg("--output-prefix", "p96_2_25_listing_sample");
  const skipExisting = hasFlag("--skip-existing");
  const perHostGap = parseInt(readArg("--delay-ms", "1200"), 10);
  const pageTimeout = parseInt(readArg("--timeout-ms", "12000"), 10);
  const subfolder = readArg("--subfolder", "");
  const SCREENSHOTS_ROOT = subfolder
    ? `${SCREENSHOTS_ROOT_BASE}/${subfolder}`
    : SCREENSHOTS_ROOT_BASE;
  const stamp = todayStamp();

  await ensureFolder(`${SCREENSHOTS_ROOT}/uscehub-listings`);
  await ensureFolder(`${SCREENSHOTS_ROOT}/official-sources`);
  await ensureFolder(`${SCREENSHOTS_ROOT}/application-pages`);
  await ensureFolder(`${SCREENSHOTS_ROOT}/mismatches`);
  await ensureFolder(`${SCREENSHOTS_ROOT}/failures`);

  async function fileExists(p: string): Promise<boolean> {
    try { await stat(p); return true; } catch { return false; }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(pageTimeout);

  const sample = await discoverSample(page, argN, pageTimeout);
  console.log(`Sample size: ${sample.length}`);

  const lastPerHost: Record<string, number> = {};
  async function throttleHost(url: string) {
    try {
      const host = new URL(url).hostname.toLowerCase();
      const last = lastPerHost[host] || 0;
      const wait = perHostGap - (Date.now() - last);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      lastPerHost[host] = Date.now();
    } catch {
      /* invalid URL — skip throttle */
    }
  }

  const results: Array<{
    listing: SampleListing;
    uscehub: CaptureResult;
    source: CaptureResult;
    sourceUrl: string;
    contentVerdict: string;
    contentReason: string | null;
    note: string;
    recommendedAction: string;
  }> = [];

  for (const l of sample) {
    const uscehubOut = `${SCREENSHOTS_ROOT}/uscehub-listings/${l.id}-${stamp}.png`;
    const sourceOut = `${SCREENSHOTS_ROOT}/official-sources/${l.id}-${stamp}.png`;

    // --skip-existing: if both screenshots already exist for this
    // listing+stamp, skip the network round-trips and synthesize
    // fast-path CaptureResults from the cached files. Lets a
    // long --n 304 run resume after an interrupt.
    if (skipExisting && (await fileExists(uscehubOut)) && (await fileExists(sourceOut))) {
      results.push({
        listing: l,
        uscehub: { ok: true, path: uscehubOut, finalUrl: null, httpStatus: null, errorMessage: null, captureMs: 0 },
        source: { ok: true, path: sourceOut, finalUrl: null, httpStatus: null, errorMessage: null, captureMs: 0 },
        sourceUrl: "",
        contentVerdict: "UNKNOWN",
        contentReason: "skip_existing_cached",
        note: "Skipped: both screenshots already on disk.",
        recommendedAction: "MANUAL_REVIEW",
      });
      console.log(`[${l.id}] ${l.title.slice(0, 50)} → SKIP (cached)`);
      continue;
    }

    const uscehubUrl = `${LOCAL_BASE}/listing/${l.id}`;
    const uscehub = await capture(page, uscehubUrl, uscehubOut, pageTimeout);

    // Extract apply CTA href from the just-loaded listing page.
    const sourceUrl = uscehub.ok
      ? await page.evaluate(() => {
          const ext = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"][href]'));
          return ext[0]?.getAttribute("href") ?? null;
        })
      : null;

    let source: CaptureResult = {
      ok: false,
      path: null,
      finalUrl: null,
      httpStatus: null,
      errorMessage: "no_source_url_extracted",
      captureMs: 0,
    };
    if (sourceUrl) {
      await throttleHost(sourceUrl);
      source = await capture(page, sourceUrl, sourceOut, pageTimeout);
    }

    const verdict = classifyContent({
      url: sourceUrl ?? "",
      httpStatus: source.httpStatus,
      finalUrl: source.finalUrl,
    });

    let note = "";
    let recommendedAction: string;
    if (verdict.classification === "GENERIC_HOMEPAGE") {
      note = "Source URL points at a generic homepage; re-link candidate.";
      recommendedAction = "NEEDS_BETTER_SOURCE";
    } else if (verdict.classification === "LIKELY_WRONG_PAGE") {
      note = "Source URL contains wrong-page hint; admin re-link.";
      recommendedAction = "WRONG_PAGE_REPLACE";
    } else if (verdict.classification === "PATH_HINTS_PROGRAM") {
      note = "Source URL path matches program keyword; visual confirmation still needed.";
      recommendedAction = "KEEP_SOURCE";
    } else if (verdict.classification === "DEEP_PATH_NO_HINT") {
      note = "Deep path with no keyword hit; review page text manually.";
      recommendedAction = "MANUAL_REVIEW";
    } else if (verdict.classification === "SOURCE_DEAD") {
      note = "Source did not respond.";
      recommendedAction = "SOURCE_DEAD_REVIEW";
    } else if (verdict.classification === "LOGIN_REQUIRED") {
      note = "Source requires login; cannot programmatically verify.";
      recommendedAction = "MANUAL_REVIEW";
    } else {
      note = "No URL or unparseable source.";
      recommendedAction = "MANUAL_REVIEW";
    }
    if (!source.ok && sourceUrl) {
      note = `Screenshot capture failed: ${source.errorMessage ?? "unknown"}.`;
      recommendedAction = "SOURCE_DEAD_REVIEW";
    }

    results.push({
      listing: l,
      uscehub,
      source,
      sourceUrl: sourceUrl ?? "",
      contentVerdict: verdict.classification,
      contentReason: verdict.reason,
      note,
      recommendedAction,
    });

    console.log(
      `[${l.id}] ${l.title.slice(0, 50)} → ${verdict.classification}` +
        ` (uscehub ${uscehub.ok ? "OK" : "FAIL"}, source ${source.ok ? "OK" : "FAIL"})`
    );
  }

  await browser.close();

  // CSV + markdown roll-ups.
  const csvRows: string[] = [];
  csvRows.push(
    "id,title,sourceUrl,contentVerdict,contentReason,sourceHttpStatus,sourceFinalUrl,recommendedAction,uscehubScreenshot,sourceScreenshot,jsonSidecar,note"
  );

  // Separate manifest of just the screenshot + sidecar paths, easy
  // to grep against the disk inventory.
  const manifestRows: string[] = [];
  manifestRows.push(
    "listingId,title,sourceUrl,uscehubScreenshotPath,officialSourceScreenshotPath,applicationScreenshotPath,jsonSidecarPath,verdict,recommendedAction,capturedAt,errorIfAny"
  );

  const md: string[] = [];
  md.push("# P96-2 — listing screenshot audit");
  md.push("");
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push(`Sample size: ${results.length}`);
  md.push("");
  md.push("Pipeline: Playwright headless captures of (a) local USCEHub listing");
  md.push("detail and (b) the apply CTA's external URL → pure content classifier");
  md.push("on URL+status → JSON sidecar + CSV + this doc. No DB connection.");
  md.push("Sample discovered by reading the running dev server's /browse page.");
  md.push("");

  const buckets: Record<string, number> = {};
  for (const r of results) buckets[r.contentVerdict] = (buckets[r.contentVerdict] || 0) + 1;
  md.push("## Verdict distribution");
  md.push("");
  md.push("| Verdict | Count |");
  md.push("| --- | --- |");
  for (const [k, v] of Object.entries(buckets).sort(([, a], [, b]) => b - a)) {
    md.push(`| ${k} | ${v} |`);
  }
  md.push("");

  md.push("## Per-listing detail");
  md.push("");
  for (const r of results) {
    md.push(`### ${r.listing.title || "(no title)"}`);
    md.push("");
    md.push(`- id: \`${r.listing.id}\``);
    md.push(`- USCEHub URL: ${LOCAL_BASE}/listing/${r.listing.id}`);
    md.push(`- source URL: ${r.sourceUrl || "(none extracted)"}`);
    md.push(`- content verdict: **${r.contentVerdict}** (${r.contentReason ?? ""})`);
    md.push(`- source HTTP status: ${r.source.httpStatus ?? r.source.errorMessage ?? "(no probe)"}`);
    md.push(`- source final URL: ${r.source.finalUrl ?? "(none)"}`);
    md.push(`- USCEHub screenshot: ${r.uscehub.path ? `\`${r.uscehub.path}\`` : `(failed: ${r.uscehub.errorMessage})`}`);
    md.push(`- source screenshot: ${r.source.path ? `\`${r.source.path}\`` : `(failed: ${r.source.errorMessage})`}`);
    if (r.note) md.push(`- recommended action: ${r.note}`);
    md.push("");

    const sidecarPath = `${SCREENSHOTS_ROOT}/uscehub-listings/${r.listing.id}-${stamp}.json`;
    csvRows.push([
      r.listing.id,
      JSON.stringify(r.listing.title || ""),
      JSON.stringify(r.sourceUrl),
      r.contentVerdict,
      JSON.stringify(r.contentReason ?? ""),
      String(r.source.httpStatus ?? ""),
      JSON.stringify(r.source.finalUrl ?? ""),
      r.recommendedAction,
      r.uscehub.path ? r.uscehub.path : "(fail)",
      r.source.path ? r.source.path : "(fail)",
      sidecarPath,
      JSON.stringify(r.note),
    ].join(","));

    manifestRows.push([
      r.listing.id,
      JSON.stringify(r.listing.title || ""),
      JSON.stringify(r.sourceUrl),
      r.uscehub.path ?? "",
      r.source.path ?? "",
      "", // applicationScreenshotPath — not separately captured in this run
      sidecarPath,
      r.contentVerdict,
      r.recommendedAction,
      new Date().toISOString(),
      r.source.ok ? "" : (r.source.errorMessage ?? ""),
    ].join(","));
    await writeFile(
      sidecarPath,
      JSON.stringify(
        {
          listingId: r.listing.id,
          title: r.listing.title,
          capturedAt: new Date().toISOString(),
          actor: "p96-2-audit",
          uscehubUrl: `${LOCAL_BASE}/listing/${r.listing.id}`,
          sourceUrl: r.sourceUrl,
          contentVerdict: r.contentVerdict,
          contentReason: r.contentReason,
          httpStatus: r.source.httpStatus,
          finalUrl: r.source.finalUrl,
          uscehubScreenshotPath: r.uscehub.path,
          sourceScreenshotPath: r.source.path,
          note: r.note,
        },
        null,
        2
      ),
      "utf8"
    );
  }

  md.push("## Hard rules");
  md.push("");
  md.push("- No DB connection.");
  md.push("- One request per host with a 1.2 s gap.");
  md.push("- 12 s per-page timeout; failures recorded, no retries.");
  md.push("- No login attempts. No credentialed access.");
  md.push("- Screenshots are local-only; the screenshots folder is gitignored.");

  // Output filenames keyed off --output-prefix so P96-2 sample and
  // P96-3 full run don't overwrite each other.
  const mdPath = `docs/platform-v2/local/${outputPrefix.toUpperCase()}_AUDIT.md`;
  const csvPath = `docs/platform-v2/local/${outputPrefix}_audit.csv`;
  const manifestPath = `docs/platform-v2/local/${outputPrefix}_screenshot_manifest.csv`;
  await writeFile(mdPath, md.join("\n"), "utf8");
  await writeFile(csvPath, csvRows.join("\n"), "utf8");
  await writeFile(manifestPath, manifestRows.join("\n"), "utf8");
  console.log(`\nWrote ${mdPath}`);
  console.log(`Wrote ${csvPath}`);
  console.log(`Wrote ${manifestPath}`);
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
