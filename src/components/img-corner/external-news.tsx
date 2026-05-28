import { ExternalLink, Newspaper } from "lucide-react";
import { getImgNews, IMG_NEWS_SOURCES } from "@/lib/img-news";

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Convert a feed URL like "https://example.com/news.xml" or
 * ".../feed/" into the human-facing equivalent so the fallback "we're
 * offline" block sends users to a readable page rather than to raw
 * XML. No regex per the global rule — explicit suffix walk.
 */
function feedToHomepageUrl(url: string): string {
  const suffixes = ["/news.xml", "/feed.xml", "/feed/", "/feed", ".xml"];
  for (const s of suffixes) {
    if (url.endsWith(s)) return url.slice(0, url.length - s.length);
  }
  return url;
}

function relativeDays(d: Date): string {
  const ms = Date.now() - d.getTime();
  if (ms < 0) return "just now";
  const days = Math.floor(ms / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 730) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/**
 * IMG-relevant external news — RSS-backed, scoped to /img-corner only.
 *
 * Pulls from authoritative orgs only (USCIS, AAMC, ECFMG, NRMP) via
 * the cached fetcher in lib/img-news.ts. If all feeds fail, the
 * component renders a small "we'll be back" panel rather than nothing,
 * so the surface is honestly explained.
 *
 * Per the user's news-shape decision (2026-05-28), this lives on
 * /img-corner only — NOT on the home page. The home stays focused on
 * the verified directory.
 */
export async function ExternalNews() {
  const items = await getImgNews(8);

  if (items.length === 0) {
    return (
      <section
        className="card-lift rounded-2xl p-8 text-center"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
        }}
      >
        <div
          className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "var(--teal-soft)" }}
        >
          <Newspaper className="h-5 w-5" style={{ color: "var(--teal)" }} />
        </div>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 18,
            color: "var(--ink)",
          }}
        >
          IMG news is briefly unavailable
        </h3>
        <p
          className="mx-auto mt-2 max-w-md text-sm"
          style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}
        >
          We pull live updates from USCIS, AAMC, ECFMG, and NRMP. One or
          more of those feeds is offline right now &mdash; check back
          shortly. In the meantime, the official pages remain reachable
          directly.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {IMG_NEWS_SOURCES.map((s) => (
            <a
              key={s.id}
              href={feedToHomepageUrl(s.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: "var(--paper-soft)",
                color: "var(--ink-soft)",
                border: "1px solid var(--line)",
              }}
            >
              {s.label} <ExternalLink className="ml-1 inline h-3 w-3" />
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p
            className="mb-1 text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            External news &middot; official sources
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: 24,
              lineHeight: 1.15,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}
          >
            IMG &amp; visa updates
          </h2>
        </div>
        <p className="hidden sm:block text-xs" style={{ color: "var(--text-muted)" }}>
          USCIS &middot; AAMC &middot; ECFMG &middot; NRMP
        </p>
      </div>

      <ol
        className="card-lift rounded-2xl overflow-hidden"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
        }}
      >
        {items.map((item, idx) => (
          <li
            key={item.url}
            style={{
              borderTop: idx === 0 ? undefined : "1px solid var(--line)",
            }}
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[var(--paper-soft)]"
            >
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--teal-soft)" }}
              >
                <Newspaper className="h-4 w-4" style={{ color: "var(--teal)" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background: "var(--paper-soft)",
                      color: "var(--teal-deep)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {item.sourceLabel}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {relativeDays(item.publishedAt)}
                  </span>
                </div>
                <p
                  className="mt-1 text-sm font-semibold leading-snug"
                  style={{ color: "var(--ink)" }}
                >
                  {item.title}
                </p>
                {item.summary && (
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {item.summary}
                    {item.summary.length >= 220 && "…"}
                  </p>
                )}
              </div>
              <ExternalLink
                className="mt-2 h-4 w-4 shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
            </a>
          </li>
        ))}
      </ol>

      <p
        className="mt-3 text-center text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        Headlines pulled directly from each source&apos;s RSS feed and
        refreshed every 30 minutes. We don&apos;t edit or summarize &mdash;
        click through to read the official article.
      </p>
    </section>
  );
}
