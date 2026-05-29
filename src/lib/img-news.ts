/**
 * IMG-relevant external news, pulled from official RSS/Atom feeds.
 *
 * Decision (2026-05-28): pull only from authoritative organizations so
 * the news strip stays consistent with USCEHub's "verified" positioning.
 * No Twitter, no aggregators, no editor-curated content. If a source
 * goes dark or starts publishing off-topic items, swap or drop it here.
 *
 * Each fetch is cached for FEED_TTL_MS to be polite to upstream servers
 * and to keep page renders fast. Failures are swallowed and logged —
 * one bad feed shouldn't break the strip.
 */

import { XMLParser } from "fast-xml-parser";

export interface NewsItem {
  source: string;
  sourceLabel: string;
  title: string;
  url: string;
  publishedAt: Date;
  summary: string;
}

interface FeedSource {
  id: string;
  label: string;
  url: string;
  /** Optional topical filter — only include items whose title contains
   *  one of these keywords. Used to keep each feed scoped to
   *  USMLE-applicant-facing items rather than every press release. */
  keywords?: string[];
}

/**
 * Feed set — scoped to U.S. residency *applicants* (IMGs sitting the
 * USMLE and entering the Match).
 *
 * 2026-05-28: dropped USCIS (`all-news.xml`) and AAMC (`news.xml`) —
 * both now 404. USCIS publishes no applicant-scoped RSS and AAMC's
 * surviving feed is a stale single 2023 item, so neither is replaced.
 * The two live, on-topic authorities are ECFMG (certification, USMLE,
 * Pathways, ERAS) and NRMP (the Match). Both are keyword-filtered to
 * applicant-facing items so program/institution newsletters and portal
 * uptime notices don't crowd the strip.
 */
const APPLICANT_KEYWORDS = [
  "usmle",
  "step",
  "eras",
  "pathways",
  "match",
  "rank",
  "soap",
  "img",
  "ecfmg",
  "certification",
  "visa",
  "j-1",
  "waiver",
  "fee",
];

const SOURCES: FeedSource[] = [
  {
    id: "ecfmg",
    label: "ECFMG",
    url: "https://www.ecfmg.org/news/feed/",
    keywords: APPLICANT_KEYWORDS,
  },
  {
    id: "nrmp",
    label: "NRMP",
    url: "https://www.nrmp.org/feed/",
    keywords: APPLICANT_KEYWORDS,
  },
];

const FEED_TTL_MS = 30 * 60 * 1000; // 30 minutes
const FETCH_TIMEOUT_MS = 5000;
const MAX_ITEMS_PER_SOURCE = 5;

// Simple module-level cache. Server components live for one request,
// but Next.js' React cache + module hoisting keep this Map alive across
// requests in a single server process. On dev hot-reload the Map resets.
const cache = new Map<string, { items: NewsItem[]; expiry: number }>();

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

interface RawFeedItem {
  title?: string | { "#text"?: string };
  link?: string | { "@_href"?: string };
  description?: string;
  summary?: string;
  pubDate?: string;
  published?: string;
  updated?: string;
}

function asString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "#text" in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>)["#text"] ?? "");
  }
  if (v && typeof v === "object" && "@_href" in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>)["@_href"] ?? "");
  }
  return "";
}

function parseDate(raw: string): Date {
  if (!raw) return new Date(0);
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function stripTags(html: string): string {
  // Remove the <…> tags and decode the four common entities. No regex
  // per global rule — walk the string character by character.
  const tagsOut: string[] = [];
  let inTag = false;
  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (ch === "<") {
      inTag = true;
      continue;
    }
    if (ch === ">") {
      inTag = false;
      continue;
    }
    if (!inTag) tagsOut.push(ch);
  }
  return tagsOut
    .join("")
    .split("&amp;").join("&")
    .split("&#38;").join("&")
    .split("&lt;").join("<")
    .split("&gt;").join(">")
    .split("&quot;").join('"')
    .split("&#39;").join("'")
    .split("&apos;").join("'")
    .split("&nbsp;").join(" ")
    .split("&#160;").join(" ")
    .split("&#xA0;").join(" ")
    .split("&mdash;").join("—")
    .split("&#8212;").join("—")
    .split("&ndash;").join("–")
    .split("&#8211;").join("–")
    .split("&hellip;").join("…")
    .split("&#8230;").join("…")
    .split("&ldquo;").join("“")
    .split("&rdquo;").join("”")
    .split("&lsquo;").join("‘")
    .split("&rsquo;").join("’")
    .trim();
}

function matchesKeywords(title: string, keywords?: string[]): boolean {
  if (!keywords || keywords.length === 0) return true;
  const lower = title.toLowerCase();
  for (const k of keywords) {
    if (lower.includes(k.toLowerCase())) return true;
  }
  return false;
}

async function fetchFeed(source: FeedSource): Promise<NewsItem[]> {
  const now = Date.now();
  const cached = cache.get(source.url);
  if (cached && cached.expiry > now) return cached.items;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(source.url, {
      headers: {
        // Many feed endpoints reject empty User-Agent.
        "User-Agent": "USCEHub-News-Fetcher/1.0 (+https://uscehub.com)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      signal: controller.signal,
      next: { revalidate: 1800 },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[img-news] ${source.id} returned ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const parsed = parser.parse(xml) as Record<string, unknown>;

    // RSS 2.0: rss > channel > item[]
    // Atom: feed > entry[]
    // Try RSS first, fall back to Atom.
    const rssChannel = (parsed.rss as { channel?: { item?: RawFeedItem | RawFeedItem[] } } | undefined)?.channel;
    const rawRssItems = rssChannel?.item;
    const rawAtomItems = (parsed.feed as { entry?: RawFeedItem | RawFeedItem[] } | undefined)?.entry;

    const rawItems = (
      Array.isArray(rawRssItems) ? rawRssItems
      : rawRssItems ? [rawRssItems]
      : Array.isArray(rawAtomItems) ? rawAtomItems
      : rawAtomItems ? [rawAtomItems]
      : []
    ) as RawFeedItem[];

    const items: NewsItem[] = [];
    for (const it of rawItems) {
      const title = asString(it.title).trim();
      const url = asString(it.link).trim();
      const dateRaw = asString(it.pubDate) || asString(it.published) || asString(it.updated);
      const summary = stripTags(asString(it.description) || asString(it.summary)).slice(0, 220);

      if (!title || !url) continue;
      if (!matchesKeywords(title, source.keywords)) continue;

      items.push({
        source: source.id,
        sourceLabel: source.label,
        title,
        url,
        publishedAt: parseDate(dateRaw),
        summary,
      });

      if (items.length >= MAX_ITEMS_PER_SOURCE) break;
    }

    cache.set(source.url, { items, expiry: now + FEED_TTL_MS });
    return items;
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`[img-news] failed to fetch ${source.id}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Fetch all configured sources in parallel and merge them into a single
 * timeline, newest first. Sources that fail (timeout, network error,
 * non-200, malformed XML) are silently skipped — the strip degrades
 * gracefully when individual feeds are unhealthy.
 */
export async function getImgNews(limit = 8): Promise<NewsItem[]> {
  const perSource = await Promise.all(SOURCES.map(fetchFeed));
  const merged = perSource.flat();
  merged.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  return merged.slice(0, limit);
}

export const IMG_NEWS_SOURCES = SOURCES.map((s) => ({ id: s.id, label: s.label, url: s.url }));
