// Visa Job Radar — Tier 1 connectors.
//
// All network calls are gated on environment keys and wrapped so an offline
// run (no keys) simply yields zero live candidates. Parsers are pure and are
// exercised directly by fixtures, so connector logic is verifiable without
// hitting any network.

import type { RawCandidate, SourceTier } from "./types";
import { isPhysician } from "./engine";

// ── shared: no-regex HTML stripping ─────────────────────────────────

const ENTITIES: Array<[string, string]> = [
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", '"'],
  ["&#39;", "'"],
  ["&apos;", "'"],
  ["&nbsp;", " "],
];

// Decode entities first, then strip tags: Greenhouse returns entity-encoded
// HTML (e.g. "&lt;p&gt;"), so the real tags only appear after decoding.
export function stripHtml(html: string): string {
  let s = html;
  for (const [ent, ch] of ENTITIES) s = s.split(ent).join(ch);
  let out = "";
  let inTag = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "<") {
      inTag = true;
      continue;
    }
    if (c === ">") {
      inTag = false;
      out += " ";
      continue;
    }
    if (!inTag) out += c;
  }
  return out;
}

function splitCityState(display?: string): { city?: string; state?: string } {
  if (!display) return {};
  const parts = display.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { city: parts[0] };
  const tail = parts[parts.length - 1];
  const state = tail.length <= 3 ? tail : undefined;
  return { city: parts[0], state };
}

// ── USAJobs (series 0602 = Medical Officer) ─────────────────────────

export interface UsajobsResponse {
  SearchResult?: {
    SearchResultItems?: Array<{
      MatchedObjectDescriptor?: {
        PositionTitle?: string;
        OrganizationName?: string;
        PositionLocationDisplay?: string;
        ApplyURI?: string[];
        PositionURI?: string;
        PublicationStartDate?: string;
        UserArea?: { Details?: { JobSummary?: string } };
      };
    }>;
  };
}

export function parseUsajobs(
  resp: UsajobsResponse,
  sourceId: string,
  fetchedAt: string,
): RawCandidate[] {
  const items = resp.SearchResult?.SearchResultItems ?? [];
  const out: RawCandidate[] = [];
  for (const item of items) {
    const d = item.MatchedObjectDescriptor;
    if (!d) continue;
    const loc = splitCityState(d.PositionLocationDisplay);
    const summary = d.UserArea?.Details?.JobSummary ?? "";
    const title = d.PositionTitle ?? "";
    out.push({
      sourceId,
      sourceTier: 1,
      sourceUrl: d.ApplyURI?.[0] ?? d.PositionURI ?? "",
      fetchedAt,
      title,
      employer: d.OrganizationName ?? "",
      city: loc.city,
      state: loc.state,
      postedDate: d.PublicationStartDate,
      rawText: [title, summary].filter((s) => s.length > 0).join(". "),
      isFixture: false,
    });
  }
  return out;
}

export async function fetchUsajobs(keyword: string): Promise<RawCandidate[]> {
  const key = process.env.USAJOBS_API_KEY;
  const email = process.env.USAJOBS_USER_AGENT;
  if (!key || !email) return [];
  const fetchedAt = new Date().toISOString();
  try {
    const url =
      "https://data.usajobs.gov/api/search?JobCategoryCode=0602&Keyword=" +
      encodeURIComponent(keyword);
    const res = await fetch(url, {
      headers: {
        Host: "data.usajobs.gov",
        "User-Agent": email,
        "Authorization-Key": key,
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as UsajobsResponse;
    return parseUsajobs(data, "usajobs-0602", fetchedAt);
  } catch {
    return [];
  }
}

// ── Greenhouse job boards ───────────────────────────────────────────

export interface GreenhouseResponse {
  jobs?: Array<{
    title?: string;
    location?: { name?: string };
    content?: string;
    absolute_url?: string;
    updated_at?: string;
  }>;
}

export function parseGreenhouse(
  resp: GreenhouseResponse,
  sourceId: string,
  employer: string,
  fetchedAt: string,
  tier: SourceTier = 1,
): RawCandidate[] {
  const jobs = resp.jobs ?? [];
  const out: RawCandidate[] = [];
  for (const j of jobs) {
    const loc = splitCityState(j.location?.name);
    const title = j.title ?? "";
    const body = j.content ? stripHtml(j.content) : "";
    out.push({
      sourceId,
      sourceTier: tier,
      sourceUrl: j.absolute_url ?? "",
      fetchedAt,
      title,
      employer,
      city: loc.city,
      state: loc.state,
      postedDate: j.updated_at,
      rawText: [title, body].filter((s) => s.length > 0).join(". "),
      isFixture: false,
    });
  }
  return out;
}

export async function fetchGreenhouse(
  boardToken: string,
  employer: string,
): Promise<RawCandidate[]> {
  const fetchedAt = new Date().toISOString();
  try {
    const url =
      "https://boards-api.greenhouse.io/v1/boards/" +
      encodeURIComponent(boardToken) +
      "/jobs?content=true";
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as GreenhouseResponse;
    return parseGreenhouse(data, "greenhouse-" + boardToken, employer, fetchedAt);
  } catch {
    return [];
  }
}

// ── Workday CXS (employer-direct tenants; de-facto, unofficial endpoint) ──
//
// Each source is one employer's OWN Workday tenant (Tier-1 provenance), but the
// /wday/cxs/ endpoint is undocumented, so the fetch is defensive: bounded pages,
// bounded detail fetches, and a fixed inter-request delay. The list payload has
// no description, so visa language requires a per-posting detail GET — and the
// title gate is applied on the list first, purely to bound how many details we
// pull. The authoritative classify() re-applies the same gate downstream.

export interface WorkdayListResponse {
  total?: number;
  jobPostings?: Array<{
    title?: string;
    externalPath?: string;
    locationsText?: string;
    postedOn?: string;
    bulletFields?: string[];
  }>;
}

export interface WorkdayDetailResponse {
  jobPostingInfo?: {
    title?: string;
    jobDescription?: string; // HTML
    location?: string;
    startDate?: string; // ISO date
    externalUrl?: string;
    jobReqId?: string;
  };
}

// Workday location strings are state-first ("ND, Dickinson"), the opposite of
// the city-first order splitCityState assumes, so Workday needs its own split.
function splitWorkdayLocation(display?: string): { city?: string; state?: string } {
  if (!display) return {};
  const parts = display.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { city: parts[0] };
  const head = parts[0];
  if (head.length === 2 && head === head.toUpperCase()) {
    return { state: head, city: parts[1] };
  }
  const tail = parts[parts.length - 1];
  return { city: parts[0], state: tail.length <= 3 ? tail : undefined };
}

export function parseWorkdayDetail(
  detail: WorkdayDetailResponse,
  sourceIdBase: string,
  employer: string,
  fetchedAt: string,
): RawCandidate | null {
  const info = detail.jobPostingInfo;
  if (!info || !info.title) return null;
  const loc = splitWorkdayLocation(info.location);
  const title = info.title;
  const body = info.jobDescription ? stripHtml(info.jobDescription) : "";
  const reqId = info.jobReqId && info.jobReqId.length > 0 ? info.jobReqId : "unknown";
  return {
    sourceId: sourceIdBase + "-" + reqId,
    sourceTier: 1,
    sourceUrl: info.externalUrl ?? "",
    fetchedAt,
    title,
    employer,
    city: loc.city,
    state: loc.state,
    postedDate: info.startDate,
    rawText: [title, body].filter((s) => s.length > 0).join(". "),
    isFixture: false,
  };
}

const WORKDAY_PAGE_SIZE = 20;
const WORKDAY_MAX_PAGES = 25; // list-scan ceiling per site
const WORKDAY_MAX_DETAILS = 40; // detail-GET ceiling per site
const WORKDAY_DELAY_MS = 150; // between every network call

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// handle encodes one tenant as "tenant/datacenter/site"
// (e.g. "sanford/wd5/SanfordHealth").
export async function fetchWorkday(
  handle: string,
  employer: string,
  sourceIdBase: string,
): Promise<RawCandidate[]> {
  const parts = handle.split("/");
  if (parts.length !== 3) return [];
  const [tenant, dc, site] = parts;
  const base =
    "https://" + tenant + "." + dc + ".myworkdayjobs.com/wday/cxs/" + tenant + "/" + site;
  const fetchedAt = new Date().toISOString();
  const out: RawCandidate[] = [];

  const detailPaths: string[] = [];
  const seen = new Set<string>();
  try {
    for (let page = 0; page < WORKDAY_MAX_PAGES; page++) {
      const res = await fetch(base + "/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          appliedFacets: {},
          limit: WORKDAY_PAGE_SIZE,
          offset: page * WORKDAY_PAGE_SIZE,
          searchText: "physician",
        }),
      });
      if (!res.ok) break;
      const data = (await res.json()) as WorkdayListResponse;
      const postings = data.jobPostings ?? [];
      if (postings.length === 0) break;
      for (const p of postings) {
        if (!p.externalPath || !p.title) continue;
        if (seen.has(p.externalPath)) continue;
        if (!isPhysician(p.title)) continue;
        seen.add(p.externalPath);
        detailPaths.push(p.externalPath);
        if (detailPaths.length >= WORKDAY_MAX_DETAILS) break;
      }
      if (detailPaths.length >= WORKDAY_MAX_DETAILS) break;
      const total = data.total ?? 0;
      if ((page + 1) * WORKDAY_PAGE_SIZE >= total) break;
      await delay(WORKDAY_DELAY_MS);
    }
  } catch {
    return out;
  }

  for (const path of detailPaths) {
    await delay(WORKDAY_DELAY_MS);
    try {
      const res = await fetch(base + path, { headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      const detail = (await res.json()) as WorkdayDetailResponse;
      const cand = parseWorkdayDetail(detail, sourceIdBase, employer, fetchedAt);
      if (cand) out.push(cand);
    } catch {
      continue;
    }
  }
  return out;
}
