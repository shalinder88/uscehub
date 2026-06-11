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
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
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
