// Visa Job Radar — Tier 1 connectors.
//
// All network calls are gated on environment keys and wrapped so an offline
// run (no keys) simply yields zero live candidates. Parsers are pure and are
// exercised directly by fixtures, so connector logic is verifiable without
// hitting any network.

import type { RawCandidate, SourceTier } from "./types";

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
