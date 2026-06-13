// Visa Job Radar — Tier 1 connectors.
//
// All network calls are gated on environment keys and wrapped so an offline
// run (no keys) simply yields zero live candidates. Parsers are pure and are
// exercised directly by fixtures, so connector logic is verifiable without
// hitting any network.

import type { RawCandidate, SourceTier } from "./types";
import { isPhysician } from "./engine";
import { XMLParser } from "fast-xml-parser";

// ── shared: no-regex HTML stripping ─────────────────────────────────

const ENTITIES: Array<[string, string]> = [
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", '"'],
  ["&#39;", "'"],
  ["&apos;", "'"],
  ["&nbsp;", " "],
  // Workday Greenhouse and other ATSs embed hex/decimal newline entities in
  // JSON description fields; without these the entities land as literal chars
  // ("&#xa;") in cleanedText, making phrase matching unreliable.
  ["&#xa;", " "],
  ["&#x0a;", " "],
  ["&#xd;", " "],
  ["&#x0d;", " "],
  ["&#10;", " "],
  ["&#13;", " "],
  ["&#x20;", " "],
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
// Critical: a keyword search for "physician" returns ~99% non-physician roles.
// The facet returns the real reqs. Empty result => tenant exposes no such facet
// (caller falls back to a keyword search). Note: some tenants (e.g. Cleveland
// Clinic) classify all physician roles outside the "Physician" family facet, so
// the facet count is 1 and the keyword fallback is used — but that tenant's
// Workday site is for non-physician staff; it was disabled after investigation.
export function physicianFacetIds(
  facets?: WorkdayListResponse["facets"],
): { ids: string[]; totalCount: number } {
  const fg = (facets ?? []).find((f) => f.facetParameter === "jobFamilyGroup");
  if (!fg) return { ids: [], totalCount: 0 };
  const ids: string[] = [];
  let totalCount = 0;
  for (const v of fg.values ?? []) {
    const d = (v.descriptor ?? "").toLowerCase();
    if (
      d.includes("physician") ||
      d.includes("faculty") ||
      d.includes("medical staff")
      // NOTE: "provider" removed 2026-06-13 — Brown Health (and likely others) have an
      // "Advanced Practice Provider" job family containing only NP/PA/APP roles. Matching
      // "provider" selects that family instead of falling back to keyword "physician" search,
      // producing 0 physician candidates. No current enabled connector uses a "provider"
      // facet for physician jobs — they all fall through to keyword+isPhysician filtering.
    ) {
      if (v.id) {
        ids.push(v.id);
        totalCount += v.count ?? 0;
      }
    }
  }
  return { ids, totalCount };
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
      const { ids, totalCount } = physicianFacetIds(pdata.facets);
      // Only use the facet if it returns a meaningful number of jobs. Some tenants
      // (e.g. Cleveland Clinic) classify most physician jobs outside the standard
      // "Physician" job-family facet — when the facet count is very low, keyword
      // search finds far more relevant postings.
      if (ids.length > 0 && totalCount >= 5) {
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

// ── Jibe / iCIMS Apply (careers.{employer}.edu/api/jobs JSON endpoint) ─────
//
// Jibe is an iCIMS-owned SPA wrapper used by large academic employers (Emory,
// etc.). Individual posting pages at {employer}.icims.com are SPA-rendered with
// no JSON-LD in the initial HTML, so fetchJsonLd() cannot read them. However,
// the Jibe platform exposes a public /api/jobs endpoint that returns full job
// data (title, HTML description, city, state, posted_date, apply_url) as JSON.
//
// handle = base URL of the Jibe careers page (e.g. "https://careers.emory.edu")

const JIBE_PAGE_SIZE = 100;
const JIBE_MAX_PHYSICIAN = 40;
const JIBE_TIMEOUT_MS = 15000;
const JIBE_DELAY_MS = 300;

export interface JibeJobData {
  title?: string;
  description?: string; // HTML
  city?: string;
  state?: string;
  posted_date?: string;
  apply_url?: string;
}

export interface JibeJobEntry {
  data?: JibeJobData;
}

export interface JibeResponse {
  totalCount?: number;
  jobs?: JibeJobEntry[];
}

// Extract the iCIMS job ID from an apply_url like
// "https://faculty-emory.icims.com/jobs/12345/physician-title/job"
function jibeJobId(applyUrl: string, fallback: number): string {
  const m = applyUrl.match(/\/jobs\/(\d+)\//);
  return m ? m[1] : String(fallback);
}

// ── PeopleAdmin Atom feed ────────────────────────────────────────────────────
//
// PeopleAdmin (common in university HR systems) exposes an Atom feed at
//   /postings/all_jobs.atom
// that includes all open postings with full HTML job descriptions in <content>.
// The employer field is set from the source-registry `employer` property since
// PeopleAdmin doesn't surface a structured employer name field.
// handle = the full Atom feed URL.

const ATOM_TIMEOUT_MS = 20_000;

interface AtomEntry {
  id?: string;
  title?: string;
  content?: string | { "#text"?: string };
  link?: { "@_href"?: string } | string;
  published?: string;
  updated?: string;
}

interface AtomFeed {
  feed?: {
    entry?: AtomEntry | AtomEntry[];
  };
}

export async function fetchAtom(
  feedUrl: string,
  employer: string,
  sourceIdBase: string,
): Promise<RawCandidate[]> {
  const fetchedAt = new Date().toISOString();
  const out: RawCandidate[] = [];

  let raw: string;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ATOM_TIMEOUT_MS);
    const res = await fetch(feedUrl, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return out;
    raw = await res.text();
  } catch {
    return out;
  }

  let feed: AtomFeed;
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
    });
    feed = parser.parse(raw) as AtomFeed;
  } catch {
    return out;
  }

  const entries = feed.feed?.entry;
  if (!entries) return out;
  const list: AtomEntry[] = Array.isArray(entries) ? entries : [entries];

  for (const e of list) {
    const title = typeof e.title === "string" ? e.title.trim() : "";
    if (!title) continue;
    if (!isPhysician(title)) continue;

    const id =
      typeof e.id === "string"
        ? e.id.replace(/^.*\//, "") // strip URL prefix, keep posting ID
        : String(out.length);

    let href = "";
    if (typeof e.link === "string") {
      href = e.link;
    } else if (typeof e.link === "object" && e.link !== null) {
      href = (e.link as { "@_href"?: string })["@_href"] ?? "";
    }
    if (!href && typeof e.id === "string") href = e.id;

    const rawContent =
      typeof e.content === "string"
        ? e.content
        : typeof e.content === "object" && e.content !== null
          ? (e.content as { "#text"?: string })["#text"] ?? ""
          : "";
    const body = rawContent ? stripHtml(rawContent) : "";

    const posted =
      typeof e.published === "string"
        ? e.published.slice(0, 10)
        : typeof e.updated === "string"
          ? e.updated.slice(0, 10)
          : undefined;

    out.push({
      sourceId: sourceIdBase + "-" + id,
      sourceTier: 1,
      sourceUrl: href,
      fetchedAt,
      title,
      employer,
      postedDate: posted,
      rawText: [title, body].filter((s) => s.length > 0).join(". "),
      isFixture: false,
    });
  }

  return out;
}

// ── Findly / Ceridian Career Website Solution (Google Cloud Talent proxy) ───
//
// API: GET https://jobsapi-google.m-cloud.io/api/job/search
// Auth: none — public JSONP endpoint
// Company: handle = "companies/<uuid>" (from cws_opts.org_id in page source)
// Filter: customAttributeFilter=primary_category="Physicians" narrows to
//   physician-category jobs server-side (Findly's own taxonomy, not keyword search)
//   so false-positive rate is low; isPhysician() still runs as final gate.
// Response: JSONP wrapper cb({...}) — stripped by slicing content between
//   first '{' and last '}' before JSON.parse.
// Pagination: offset-indexed; totalHits in response; one page is usually enough
//   for small physician categories.

const FINDLY_BASE = "https://jobsapi-google.m-cloud.io/api/job/search";
const FINDLY_PAGE_SIZE = 100;
const FINDLY_TIMEOUT_MS = 15_000;
const FINDLY_DELAY_MS = 400;

interface FindlyJob {
  id?: number;
  title?: string;
  primary_state?: string;
  primary_city?: string;
  url?: string;
  description?: string;
  open_date?: string;
}

interface FindlyResult {
  job?: FindlyJob;
}

interface FindlyResponse {
  totalHits?: number;
  searchResults?: FindlyResult[];
}

export async function fetchFindly(
  companyId: string,
  employer: string,
  sourceIdBase: string,
): Promise<RawCandidate[]> {
  const fetchedAt = new Date().toISOString();
  const out: RawCandidate[] = [];
  let offset = 0;

  while (true) {
    let data: FindlyResponse;
    try {
      const params = new URLSearchParams({
        companyName: companyId,
        customAttributeFilter: 'primary_category="Physicians"',
        pageSize: String(FINDLY_PAGE_SIZE),
        offset: String(offset),
        callback: "cb",
      });
      const url = FINDLY_BASE + "?" + params.toString();
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), FINDLY_TIMEOUT_MS);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) break;
      const raw = await res.text();
      // Strip JSONP wrapper: cb({...}) → find first { and last }
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) break;
      data = JSON.parse(raw.slice(start, end + 1)) as FindlyResponse;
    } catch {
      break;
    }

    const results = data.searchResults ?? [];
    if (results.length === 0) break;

    for (const r of results) {
      const j = r.job;
      if (!j?.title) continue;
      if (!isPhysician(j.title)) continue;
      const body = j.description ? stripHtml(j.description) : "";
      out.push({
        sourceId: sourceIdBase + "-" + String(j.id ?? out.length),
        sourceTier: 1,
        sourceUrl: j.url ?? "",
        fetchedAt,
        title: j.title,
        employer,
        city: j.primary_city,
        state: j.primary_state,
        postedDate: j.open_date,
        rawText: [j.title, body].filter((s) => s.length > 0).join(". "),
        isFixture: false,
      });
    }

    const total = data.totalHits ?? 0;
    offset += FINDLY_PAGE_SIZE;
    if (offset >= total) break;
    await delay(FINDLY_DELAY_MS);
  }

  return out;
}

export async function fetchJibe(
  baseUrl: string,
  employer: string,
  sourceIdBase: string,
  query = "keyword=physician",
): Promise<RawCandidate[]> {
  const fetchedAt = new Date().toISOString();
  const out: RawCandidate[] = [];
  let offset = 0;

  while (out.length < JIBE_MAX_PHYSICIAN) {
    let data: JibeResponse;
    try {
      const url =
        baseUrl +
        "/api/jobs?" +
        query +
        "&limit=" +
        JIBE_PAGE_SIZE +
        "&offset=" +
        offset;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), JIBE_TIMEOUT_MS);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) break;
      data = (await res.json()) as JibeResponse;
    } catch {
      break;
    }

    const jobs = data.jobs ?? [];
    if (jobs.length === 0) break;

    for (const j of jobs) {
      const d = j.data;
      if (!d?.title) continue;
      if (!isPhysician(d.title)) continue;
      const body = d.description ? stripHtml(d.description) : "";
      const applyUrl = d.apply_url ?? "";
      const idTail = jibeJobId(applyUrl, out.length);
      out.push({
        sourceId: sourceIdBase + "-" + idTail,
        sourceTier: 1,
        sourceUrl: applyUrl,
        fetchedAt,
        title: d.title,
        employer,
        city: d.city,
        state: d.state,
        postedDate: d.posted_date,
        rawText: [d.title, body].filter((s) => s.length > 0).join(". "),
        isFixture: false,
      });
      if (out.length >= JIBE_MAX_PHYSICIAN) break;
    }

    const total = data.totalCount ?? 0;
    offset += JIBE_PAGE_SIZE;
    if (offset >= total) break;
    await delay(JIBE_DELAY_MS);
  }

  return out;
}
