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
  facets?: Array<{
    facetParameter?: string;
    descriptor?: string;
    values?: Array<{ id?: string; descriptor?: string; count?: number }>;
  }>;
}

// Find the jobFamilyGroup facet value ids that isolate physician/faculty reqs.
// Critical: a keyword search for "physician" returns ~99% non-physician roles
// (Cleveland Clinic: 1,004 keyword hits vs 10 actual physician-family, all
// postdocs). The facet returns the real reqs. Empty result => tenant exposes no
// such facet (caller falls back to a keyword search).
export function physicianFacetIds(facets?: WorkdayListResponse["facets"]): string[] {
  const fg = (facets ?? []).find((f) => f.facetParameter === "jobFamilyGroup");
  if (!fg) return [];
  const ids: string[] = [];
  for (const v of fg.values ?? []) {
    const d = (v.descriptor ?? "").toLowerCase();
    if (
      d.includes("physician") ||
      d.includes("faculty") ||
      d.includes("provider") ||
      d.includes("medical staff")
    ) {
      if (v.id) ids.push(v.id);
    }
  }
  return ids;
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
    // Discover the physician/faculty job-family facet and filter by it. A keyword
    // search for "physician" is ~99% non-physician noise; the facet returns the
    // real reqs. Fall back to keyword only if the tenant exposes no such facet.
    let appliedFacets: Record<string, string[]> = {};
    let searchText = "physician";
    const probe = await fetch(base + "/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ appliedFacets: {}, limit: 1, offset: 0, searchText: "" }),
    });
    if (probe.ok) {
      const pdata = (await probe.json()) as WorkdayListResponse;
      const ids = physicianFacetIds(pdata.facets);
      if (ids.length > 0) {
        appliedFacets = { jobFamilyGroup: ids };
        searchText = "";
      }
    }
    await delay(WORKDAY_DELAY_MS);

    for (let page = 0; page < WORKDAY_MAX_PAGES; page++) {
      const res = await fetch(base + "/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          appliedFacets,
          limit: WORKDAY_PAGE_SIZE,
          offset: page * WORKDAY_PAGE_SIZE,
          searchText,
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

// ── USAJobs HistoricJoa (NO API KEY; series 0602 = Medical Officer) ──
//
// Two public, no-key endpoints on data.usajobs.gov: the metadata list (title,
// agency, state, control number, open date) and the announcement-text list (the
// full job body), joined on usajobsControlNumber. A short rolling open-date
// window keeps the result under the API's ~500-row cap (no pagination token is
// exposed) and keeps postings fresh enough to clear the staleness gate. An
// honest User-Agent is required (Akamai 403s a UA-less client); we never spoof a
// browser. This is distinct from the keyed Search API (fetchUsajobs) which is
// gated on USAJOBS_API_KEY; this one yields with no key at all.

export interface UsajobsHistoricMeta {
  usajobsControlNumber?: number | string;
  positionTitle?: string;
  hiringAgencyName?: string;
  positionOpenDate?: string;
  positionlocations?: Array<{
    positionLocationCity?: string;
    positionLocationState?: string;
  }>;
}

export interface UsajobsHistoricMetaResponse {
  data?: UsajobsHistoricMeta[];
}

export interface UsajobsHistoricText {
  usajobsControlNumber?: number | string;
  summary?: string;
  duties?: string;
  requirements?: string;
  requirementsConditionsOfEmployment?: string;
  requirementsQualifications?: string;
  otherInformation?: string;
}

export interface UsajobsHistoricTextResponse {
  data?: UsajobsHistoricText[];
}

// The 7407 eligibility clause lives in requirements / requirementsQualifications;
// we fold every body field (HTML-stripped) so the anchor is found wherever it sits.
export function joinUsajobsHistoricBody(t: UsajobsHistoricText): string {
  const fields = [
    t.summary,
    t.duties,
    t.requirements,
    t.requirementsConditionsOfEmployment,
    t.requirementsQualifications,
    t.otherInformation,
  ];
  return fields
    .filter((f): f is string => typeof f === "string" && f.length > 0)
    .map(stripHtml)
    .join(" ");
}

export function parseUsajobsHistoric(
  meta: UsajobsHistoricMeta,
  body: string,
  sourceIdBase: string,
  fetchedAt: string,
): RawCandidate | null {
  if (!meta.positionTitle || meta.usajobsControlNumber == null) return null;
  const cn = String(meta.usajobsControlNumber);
  const loc = (meta.positionlocations ?? [])[0];
  const title = meta.positionTitle;
  return {
    sourceId: sourceIdBase + "-" + cn,
    sourceTier: 1,
    sourceUrl: "https://www.usajobs.gov/job/" + cn,
    fetchedAt,
    title,
    employer: meta.hiringAgencyName ?? "",
    city: loc?.positionLocationCity,
    // USAJobs returns full state names ("Oklahoma"); kept as-is — this source is
    // internally consistent so canonicalKey dedupe still holds.
    state: loc?.positionLocationState,
    postedDate: meta.positionOpenDate,
    rawText: [title, body].filter((s) => s.length > 0).join(". "),
    isFixture: false,
  };
}

const USAJOBS_HJ_WINDOW_DAYS = 10;
const USAJOBS_HJ_MAX = 80; // candidate ceiling per run
const USAJOBS_HJ_DELAY_MS = 200;
const USAJOBS_HJ_MS_PER_DAY = 24 * 60 * 60 * 1000;
const USAJOBS_HJ_BASE = "https://data.usajobs.gov/api/historicjoa";

function usajobsHistoricUa(): string {
  return (
    process.env.USAJOBS_USER_AGENT ||
    "USCEHub-visa-job-radar (+contact via repo owner)"
  );
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// handle encodes "series/hiringAgencyCode" (e.g. "0602/VATA" = physicians at VHA).
export async function fetchUsajobsHistoricJoa(
  handle: string,
  employer: string,
  sourceIdBase: string,
): Promise<RawCandidate[]> {
  const parts = handle.split("/");
  if (parts.length !== 2) return [];
  const [series, agency] = parts;
  const now = new Date();
  const fetchedAt = now.toISOString();
  const end = isoDay(now);
  const start = isoDay(
    new Date(now.getTime() - USAJOBS_HJ_WINDOW_DAYS * USAJOBS_HJ_MS_PER_DAY),
  );
  const qs =
    "PositionSeries=" + encodeURIComponent(series) +
    "&HiringAgencyCodes=" + encodeURIComponent(agency) +
    "&StartPositionOpenDate=" + start +
    "&EndPositionOpenDate=" + end;
  const headers = { "User-Agent": usajobsHistoricUa(), Accept: "application/json" };

  try {
    const metaRes = await fetch(USAJOBS_HJ_BASE + "?" + qs, { headers });
    if (!metaRes.ok) return [];
    const meta = (await metaRes.json()) as UsajobsHistoricMetaResponse;
    const metaItems = meta.data ?? [];

    // Title-gate the list first to bound work; classify() re-applies the gate.
    const kept: UsajobsHistoricMeta[] = [];
    const seen = new Set<string>();
    for (const m of metaItems) {
      if (!m.positionTitle || m.usajobsControlNumber == null) continue;
      if (!isPhysician(m.positionTitle)) continue;
      const cn = String(m.usajobsControlNumber);
      if (seen.has(cn)) continue;
      seen.add(cn);
      kept.push(m);
      if (kept.length >= USAJOBS_HJ_MAX) break;
    }
    if (kept.length === 0) return [];

    await delay(USAJOBS_HJ_DELAY_MS);
    const textRes = await fetch(USAJOBS_HJ_BASE + "/announcementtext?" + qs, { headers });
    if (!textRes.ok) return [];
    const text = (await textRes.json()) as UsajobsHistoricTextResponse;
    const bodyByCn = new Map<string, string>();
    for (const t of text.data ?? []) {
      if (t.usajobsControlNumber == null) continue;
      bodyByCn.set(String(t.usajobsControlNumber), joinUsajobsHistoricBody(t));
    }

    const out: RawCandidate[] = [];
    for (const m of kept) {
      const cn = String(m.usajobsControlNumber);
      const cand = parseUsajobsHistoric(m, bodyByCn.get(cn) ?? "", sourceIdBase, fetchedAt);
      if (cand) out.push(cand);
    }
    return out;
  } catch {
    return [];
  }
}
