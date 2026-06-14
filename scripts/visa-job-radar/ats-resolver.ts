// Visa Job Radar — ATS resolver (Phase C of the >=90% coverage strategy).
//
// Given a sponsoring employer's own careers page, (1) detect which ATS it runs
// and how its postings are reachable, and (2) read the postings employer-direct.
//
// Key real-world finding (probed 2026-06-10 across top physician H-1B sponsors):
// the BIG sponsors run iCIMS / Oracle HCM / Taleo — which have NO clean public
// JSON API. Only some run Workday/Greenhouse (which do). So the UNIVERSAL reader
// is schema.org JobPosting JSON-LD, which every Google-for-Jobs-indexed career
// page emits on its posting detail pages. This module provides both paths.
//
// This is connector I/O (not the engine's no-regex intelligence layer), so light
// regex for script-tag / URL extraction is fine. Everything stays employer-direct
// — no board hosts are ever fetched here.

import type { RawCandidate } from "./types";
import { stripHtml } from "./connectors";

export type AtsType =
  | "workday"
  | "greenhouse"
  | "lever"
  | "ashby"
  | "icims"
  | "oracle_hcm"
  | "taleo"
  | "successfactors"
  | "phenom"
  | "unknown";

// How a given ATS's postings can be read employer-direct.
export type Reach = "json-api" | "json-ld" | "none";

export interface AtsDetection {
  type: AtsType;
  reach: Reach;
  handle?: string; // e.g. Workday "tenant/dc/site", Greenhouse token, iCIMS subdomain
}

const REACH_BY_ATS: Record<AtsType, Reach> = {
  workday: "json-api",
  greenhouse: "json-api",
  lever: "json-api",
  ashby: "json-api",
  icims: "json-ld",
  oracle_hcm: "json-ld",
  taleo: "json-ld",
  successfactors: "json-ld",
  phenom: "json-ld",
  unknown: "none",
};

function firstMatch(s: string, re: RegExp): string | undefined {
  const m = s.match(re);
  return m ? m[0] : undefined;
}

// Detect the ATS from a fetched careers page (its HTML + the URL it resolved to).
export function detectAts(html: string, finalUrl: string): AtsDetection {
  const hay = (finalUrl + " " + html).toLowerCase();

  // Workday — extract the tenant.dc.myworkdayjobs.com/site triple for the CXS API.
  const wd = firstMatch(hay, /([a-z0-9-]+)\.(wd[0-9]+)\.myworkdayjobs\.com\/(?:[a-z-]+\/)?([a-z0-9_]+)/i);
  if (wd) {
    const m = wd.match(/([a-z0-9-]+)\.(wd[0-9]+)\.myworkdayjobs\.com\/(?:[a-z-]+\/)?([a-z0-9_]+)/i);
    if (m) return { type: "workday", reach: "json-api", handle: m[1] + "/" + m[2] + "/" + m[3] };
  }
  // Greenhouse — board token.
  const gh = firstMatch(hay, /boards\.greenhouse\.io\/([a-z0-9_]+)/i) || firstMatch(hay, /([a-z0-9_]+)\.greenhouse\.io/i);
  if (gh) {
    const m = hay.match(/(?:boards\.greenhouse\.io\/|\/\/)([a-z0-9_]+)\.?greenhouse\.io/i) || hay.match(/greenhouse\.io\/([a-z0-9_]+)/i);
    return { type: "greenhouse", reach: "json-api", handle: m ? m[1] : undefined };
  }
  if (/jobs\.lever\.co\/([a-z0-9-]+)/i.test(hay)) {
    const m = hay.match(/jobs\.lever\.co\/([a-z0-9-]+)/i);
    return { type: "lever", reach: "json-api", handle: m ? m[1] : undefined };
  }
  if (/jobs\.ashbyhq\.com\/([a-z0-9-]+)/i.test(hay)) {
    const m = hay.match(/jobs\.ashbyhq\.com\/([a-z0-9-]+)/i);
    return { type: "ashby", reach: "json-api", handle: m ? m[1] : undefined };
  }
  if (/([a-z0-9-]+)\.icims\.com/i.test(hay) || /icims\.com\/jobs/i.test(hay)) {
    const m = hay.match(/([a-z0-9-]+)\.icims\.com/i);
    return { type: "icims", reach: "json-ld", handle: m ? m[1] : undefined };
  }
  if (/taleo\.net/i.test(hay)) return { type: "taleo", reach: "json-ld" };
  if (/successfactors|sapsf/i.test(hay)) return { type: "successfactors", reach: "json-ld" };
  if (/phenompeople|phenom/i.test(hay)) return { type: "phenom", reach: "json-ld" };
  if (/oraclecloud\.com|\/hcmui\/|fa-[a-z]+-saasfaprod/i.test(hay)) return { type: "oracle_hcm", reach: "json-ld" };

  return { type: "unknown", reach: REACH_BY_ATS.unknown };
}

// Pull every schema.org JobPosting object out of a page's JSON-LD blocks. Handles
// single objects, arrays, and @graph wrappers — the three shapes ATSs emit.
export function extractJobPostingJsonLd(html: string): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  // Matches application/ld+json with literal + or HTML-encoded &#x2B; / &#43;
  const re = /<script[^>]+type=["']application\/ld(?:\+|&#x2[Bb];|&#43;)json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    collectJobPostings(parsed, out);
  }
  return out;
}

function collectJobPostings(node: unknown, out: Array<Record<string, unknown>>): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const n of node) collectJobPostings(n, out);
    return;
  }
  const obj = node as Record<string, unknown>;
  const t = obj["@type"];
  const isJob = t === "JobPosting" || (Array.isArray(t) && t.includes("JobPosting"));
  if (isJob) out.push(obj);
  if (Array.isArray(obj["@graph"])) collectJobPostings(obj["@graph"], out);
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

// Map a schema.org JobPosting into the engine's RawCandidate. The description is
// HTML-stripped; location is read from jobLocation.address. The posting URL is the
// employer-origin evidence URL the quote-offset gate will hold against.
export function jobPostingToRawCandidate(
  posting: Record<string, unknown>,
  sourceIdBase: string,
  employerFallback: string,
  fetchedAt: string,
  postingUrl: string,
): RawCandidate | null {
  const title = asString(posting["title"]);
  if (!title) return null;

  const org = posting["hiringOrganization"];
  let employer = employerFallback;
  if (org && typeof org === "object" && !Array.isArray(org)) {
    employer = asString((org as Record<string, unknown>)["name"]) ?? employerFallback;
  }

  let city: string | undefined;
  let state: string | undefined;
  const loc = posting["jobLocation"];
  const firstLoc = Array.isArray(loc) ? loc[0] : loc;
  if (firstLoc && typeof firstLoc === "object") {
    const addr = (firstLoc as Record<string, unknown>)["address"];
    if (addr && typeof addr === "object") {
      city = asString((addr as Record<string, unknown>)["addressLocality"]);
      state = asString((addr as Record<string, unknown>)["addressRegion"]);
    }
  }

  const rawDesc = asString(posting["description"]) ?? "";
  const body = rawDesc ? stripHtml(rawDesc) : "";
  const idTail = asString(posting["identifier"] && typeof posting["identifier"] === "object"
    ? (posting["identifier"] as Record<string, unknown>)["value"]
    : posting["identifier"]) ?? String(out_hash(postingUrl));

  return {
    sourceId: sourceIdBase + "-" + idTail,
    sourceTier: 1,
    sourceUrl: asString(posting["url"]) ?? postingUrl,
    fetchedAt,
    title,
    employer,
    city,
    state,
    postedDate: asString(posting["datePosted"]),
    rawText: [title, body].filter((s) => s.length > 0).join(". "),
    isFixture: false,
  };
}

// Tiny stable hash for a fallback id when a posting carries no identifier.
function out_hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── JSON-LD career-page reader ───────────────────────────────────────────────
//
// Fetches a physician-keyword search results page from a json-ld ATS (iCIMS,
// Phenom, Oracle HCM, Taleo, SuccessFactors), extracts individual posting URLs,
// fetches each detail page, extracts schema.org JobPosting JSON-LD, and maps
// to RawCandidate. The employer + sourceIdBase come from the source-registry
// entry. This is the correct place for this code (not connectors.ts) because
// connectors.ts imports stripHtml from here — the reverse would be circular.
//
// SPA fallback: modern Phenom / iCIMS / Oracle sites render their search pages
// as full React SPAs that return no job hrefs in the initial HTML. When the
// search page yields 0 hrefs, fetchJsonLd falls back to sitemap enumeration:
// it fetches {origin}/sitemap.xml (handling sitemap index → sub-sitemaps),
// extracts /job/ URLs, and filters by physician keywords in the URL slug.
// This is proven to work for Tufts Medical Center, Mercy Health, and UMMS
// which all use Phenom with sitemap indexes containing individual posting URLs.

const JSONLD_UA = "Mozilla/5.0 (compatible; USCEHub-visa-job-radar/1.0; +contact via repo)";
const JSONLD_MAX_POSTINGS = 40;     // detail-page ceiling per source
const JSONLD_PAGE_TIMEOUT_MS = 15000;
const JSONLD_DELAY_MS = 300;        // polite inter-request pause

// URL-slug keywords that suggest a physician (MD/DO) role, not APP/admin.
// Used only for sitemap enumeration pre-filter; engine.isPhysician does the
// real classification on fetched body text.
// "radiolog" without the suffix matches "radiological-technologist", so use
// the full specialty name. Same for other -olog truncations.
const PHYSICIAN_SLUG_RE = /physician|hospitalist|internist|attending|neurologist|cardiologist|oncologist|intensivist|nephrologist|pulmonologist|gastroenterologist|endocrinologist|urologist|radiologist|psychiatrist|obstetrician|gynecologist|pediatrician|surgeon|dermatologist/i;

// URL-slug patterns that clearly indicate a support or mid-level role — excluded
// BEFORE the JSONLD_MAX_POSTINGS cap so physician slots aren't wasted.
// Observed false-positive sources (2026-06-13):
//   UMMS Oracle HCM: "...-Physician-Assistant-PA-..." — NP/PA combined titles
//   Mercy Phenom: "...-LPN-...", "...Family-Physicians-of-...", "...-Physician-Office"
// engine.isPhysician() catches everything that slips through; this is a quota guard.
const NONPHYS_SLUG_RE = /physician-assistant|physician-office|physician-practice|physician-extender|-lpn-|family-physicians/i;

function jsonldDelay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function jsonldGet(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), JSONLD_PAGE_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: {
        "User-Agent": JSONLD_UA,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return { html: await res.text(), finalUrl: res.url || url };
  } catch {
    return null;
  }
}

// Returns true when a URL path looks like an individual job posting detail page
// (not a search/list/apply page). Covers iCIMS, Phenom, Oracle HCM, Taleo, SF.
function isJobDetailPath(path: string): boolean {
  const p = path.toLowerCase();
  // iCIMS: /jobs/{id}/{slug}/job
  if (/\/jobs\/\d+\/[^/]+\/job$/.test(p)) return true;
  // Phenom / generic: /jobs/{id} or /jobs/{id}-{slug} (not /jobs/search or bare /jobs)
  if (/\/jobs\/[a-z0-9][a-z0-9_-]*$/.test(p) && !/\/jobs\/search/.test(p) && p !== "/jobs") return true;
  // Oracle HCM: /requisitions/{id} anywhere in path
  if (/\/requisitions\/\d+/.test(p)) return true;
  // Taleo: .ftl job detail
  if (/jobdetail\.ftl/.test(p)) return true;
  // SuccessFactors / Avature / Phenom alternate: /career-detail, /job-invite/{id}, /job/{id}
  if (/career-detail/.test(p) || /\/job-invite\/\d+/.test(p) || /\/job\/\d+$/.test(p)) return true;
  // TalentBrew: /job/{city}/{slug}/{company_id}/{job_id} — last two segments are numeric
  if (/\/job\/[^/]+\/[^/]+\/\d+\/\d+$/.test(p)) return true;
  // Custom CMS with req_ requisition IDs: /career-opportunities/req_{id}/{slug}/
  if (/\/career-opportunities\/req_/.test(p)) return true;
  return false;
}

// Extracts job detail hrefs from a search-results page. Stays same-origin;
// strips query+hash for dedup so /jobs/123?apply and /jobs/123 count once.
function extractJobHrefs(html: string, baseUrl: string): string[] {
  let origin: string;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return [];
  }
  const seen = new Set<string>();
  const out: string[] = [];
  // href="..." or href='...'
  const re = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1];
    let resolved: string;
    try {
      const u = new URL(raw, baseUrl);
      if (u.origin !== origin) continue;
      resolved = u.origin + u.pathname; // canonical dedupe key
    } catch {
      continue;
    }
    const path = new URL(resolved).pathname;
    if (!isJobDetailPath(path)) continue;
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    out.push(resolved);
    if (out.length >= JSONLD_MAX_POSTINGS) break;
  }
  return out;
}

// Enumerate physician job posting URLs from a site's XML sitemap.
// Handles both flat sitemaps and sitemap indexes (one level of nesting only).
// Returns URLs whose slugs match PHYSICIAN_SLUG_RE, capped at JSONLD_MAX_POSTINGS.
async function fetchSitemapJobUrls(origin: string): Promise<string[]> {
  const sitemapUrl = origin + "/sitemap.xml";
  const resp = await jsonldGet(sitemapUrl);
  if (!resp) return [];

  const isIndex = /<sitemapindex/i.test(resp.html);
  let allJobUrls: string[] = [];

  if (isIndex) {
    // Extract sub-sitemap URLs (lines like <loc>https://...sitemap1.xml</loc>)
    const subRe = /<loc>([^<]+\.xml)<\/loc>/gi;
    let m: RegExpExecArray | null;
    const subUrls: string[] = [];
    while ((m = subRe.exec(resp.html)) !== null) subUrls.push(m[1]);
    for (const subUrl of subUrls) {
      await jsonldDelay(JSONLD_DELAY_MS);
      const sub = await jsonldGet(subUrl);
      if (!sub) continue;
      const locRe = /<loc>([^<]*\/job\/[^<]+)<\/loc>/gi;
      while ((m = locRe.exec(sub.html)) !== null) allJobUrls.push(m[1]);
    }
  } else {
    // Flat sitemap
    const locRe = /<loc>([^<]*\/job\/[^<]+)<\/loc>/gi;
    let m: RegExpExecArray | null;
    while ((m = locRe.exec(resp.html)) !== null) allJobUrls.push(m[1]);
  }

  return allJobUrls
    .filter((u) => PHYSICIAN_SLUG_RE.test(u) && !NONPHYS_SLUG_RE.test(u))
    .slice(0, JSONLD_MAX_POSTINGS);
}

// Fetch a physician-filtered career search page, walk individual posting URLs,
// extract JSON-LD JobPosting from each, and map to RawCandidate.
// handle = the full physician search URL (stored in source-registry.ts).
// SPA fallback: if the search page returns 0 job hrefs (Phenom/iCIMS React SPA),
// attempts sitemap enumeration before giving up.
export async function fetchJsonLd(
  searchUrl: string,
  employerName: string,
  sourceIdBase: string,
): Promise<RawCandidate[]> {
  const fetchedAt = new Date().toISOString();
  const out: RawCandidate[] = [];

  // Step 1: fetch search results page
  const search = await jsonldGet(searchUrl);
  if (!search) return out;
  await jsonldDelay(JSONLD_DELAY_MS);

  // Step 2: extract individual posting URLs (works for iCIMS direct portals
  // that server-render job links; returns 0 for full SPA sites).
  let postingUrls = extractJobHrefs(search.html, search.finalUrl)
    .filter((u) => !NONPHYS_SLUG_RE.test(u));

  // Step 2b: SPA fallback — try sitemap enumeration when search page is a SPA.
  if (postingUrls.length === 0) {
    let origin: string;
    try {
      origin = new URL(search.finalUrl).origin;
    } catch {
      return out;
    }
    await jsonldDelay(JSONLD_DELAY_MS);
    postingUrls = await fetchSitemapJobUrls(origin);
  }

  if (postingUrls.length === 0) return out;

  // Step 3: fetch each posting and extract JSON-LD
  for (const postingUrl of postingUrls) {
    await jsonldDelay(JSONLD_DELAY_MS);
    const page = await jsonldGet(postingUrl);
    if (!page) continue;
    const postings = extractJobPostingJsonLd(page.html);
    for (const posting of postings) {
      const cand = jobPostingToRawCandidate(
        posting,
        sourceIdBase,
        employerName,
        fetchedAt,
        postingUrl,
      );
      if (cand) out.push(cand);
    }
  }
  return out;
}
