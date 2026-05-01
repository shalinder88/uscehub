/**
 * Pure URL + optional content classifier — no network, no DB.
 *
 * Sister to `src/lib/link-verification.ts`. Where that module asks
 * "did the URL respond?", this module asks "does the page look like
 * the program it claims to be?". Conservative-by-design:
 *
 *   - HTTP 200 alone never produces VERIFIED_PATH_HINT here.
 *   - Generic homepage (/, /about, etc.) never produces a positive
 *     verdict, even with content snippet support.
 *   - A wrong-page hint (e.g. "consulting", "billing") downgrades
 *     a positive path-keyword match to LIKELY_WRONG_PAGE, never
 *     up-grades.
 *   - Login-required is a separate state from dead.
 *
 * The cron does NOT call this module yet (it still does HEAD-only
 * probes per Phase 3.3 contract). This is staged for a future cron
 * extension and immediate admin-side use.
 *
 * See `docs/platform-v2/local/P96_LINK_VERIFICATION_PROTOCOL.md` and
 * `docs/platform-v2/local/P96_UPGRADED_SCREENER_DESIGN.md` for the
 * source-classifier spec this module implements.
 */

export type ContentClassification =
  | "PATH_HINTS_PROGRAM"
  | "GENERIC_HOMEPAGE"
  | "DEEP_PATH_NO_HINT"
  | "LIKELY_WRONG_PAGE"
  | "LOGIN_REQUIRED"
  | "SOURCE_DEAD"
  | "UNKNOWN";

export interface ContentClassificationResult {
  classification: ContentClassification;
  reason: string | null;
  hostname: string;
  pathname: string;
  pathKeywordsMatched: string[];
  contentKeywordsMatched: string[];
  wrongPageHints: string[];
}

export interface ContentClassifyInput {
  url: string;
  /** HTTP status from a prior probe. 0 = no response, 408 = aborted. */
  httpStatus?: number | null;
  /** Final URL after redirects, when available. */
  finalUrl?: string | null;
  /** Optional 5-50 KB excerpt of page text. Lowercased internally. */
  contentSnippet?: string | null;
}

/**
 * Program / opportunity keywords. Matched against URL pathname AND
 * optional content snippet. Order doesn't matter.
 */
const PROGRAM_KEYWORDS = [
  "observership",
  "observer",
  "externship",
  "elective",
  "visiting student",
  "visiting medical student",
  "visiting students",
  "clinical experience",
  "clinical rotation",
  "research fellowship",
  "research trainee",
  "research-fellow",
  "research_fellow",
  "summer research",
  "summer fellowship",
  "postdoctoral",
  "postdoc",
  "volunteer",
  "shadowing",
  "img",
  "international medical graduate",
  "clerkship",
];

/**
 * Pathname forms that are too generic to be a program page. Path-only.
 */
const GENERIC_PATH_PATTERNS: RegExp[] = [
  /^\/?$/,
  /^\/(home|about|index|main|visit|contact|departments|education|patient[- ]?care|patients|find[- ]?a[- ]?doctor|locations)\/?$/,
];

/**
 * Phrases that suggest the URL points at the wrong content even when a
 * program keyword also appears. Conservative — these only DOWNGRADE
 * a positive match; they never independently produce a positive verdict.
 */
const WRONG_PAGE_HINTS = [
  "consulting",
  "advisory services",
  "advisory-services",
  "billing",
  "donor",
  "donate",
  "press release",
  "news article",
  "patient appointment",
  "make an appointment",
  "find-a-doctor",
];

/**
 * Login-form heuristics. Apply only to the content snippet.
 */
const LOGIN_HINTS = [
  "sign in",
  "log in",
  "single sign-on",
  "saml",
  "shibboleth",
  "microsoft login",
  "okta",
  'name="password"',
  'type="password"',
];

function isGenericPath(path: string): boolean {
  const normalized = path.toLowerCase();
  return GENERIC_PATH_PATTERNS.some((re) => re.test(normalized));
}

function findKeywordsIn(haystack: string, keywords: string[]): string[] {
  const found: string[] = [];
  for (const k of keywords) {
    if (haystack.includes(k)) found.push(k);
  }
  return found;
}

/**
 * Classify a URL + optional content snippet. Pure. No I/O.
 */
export function classifyContent(
  input: ContentClassifyInput
): ContentClassificationResult {
  const empty: ContentClassificationResult = {
    classification: "UNKNOWN",
    reason: null,
    hostname: "",
    pathname: "",
    pathKeywordsMatched: [],
    contentKeywordsMatched: [],
    wrongPageHints: [],
  };

  // Probe failure: surface SOURCE_DEAD only when the caller explicitly
  // tells us the URL didn't respond. We never auto-mark dead.
  if (input.httpStatus !== undefined && input.httpStatus !== null) {
    if (input.httpStatus === 0) {
      return { ...empty, classification: "SOURCE_DEAD", reason: "no_response" };
    }
  }

  // Parse the URL we will actually classify. Prefer the final URL after
  // redirects when available.
  const targetUrl = input.finalUrl?.trim() || input.url.trim();
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { ...empty, classification: "UNKNOWN", reason: "invalid_url" };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase().replace(/[-_]/g, " ");
  const pathKeywordsMatched = findKeywordsIn(pathname, PROGRAM_KEYWORDS);

  const snippet = (input.contentSnippet || "").toLowerCase();
  const contentKeywordsMatched = snippet ? findKeywordsIn(snippet, PROGRAM_KEYWORDS) : [];
  const wrongPageHints = snippet ? findKeywordsIn(snippet, WRONG_PAGE_HINTS) : [];
  // Path-side wrong-page hints too (e.g. "/consulting-advisory-services").
  for (const hint of WRONG_PAGE_HINTS) {
    if (pathname.includes(hint)) {
      if (!wrongPageHints.includes(hint)) wrongPageHints.push(hint);
    }
  }

  // Login wall — only if a snippet is present.
  if (snippet) {
    const loginHits = findKeywordsIn(snippet, LOGIN_HINTS);
    if (loginHits.length >= 2) {
      return {
        classification: "LOGIN_REQUIRED",
        reason: `login_form_detected:${loginHits.slice(0, 2).join(",")}`,
        hostname,
        pathname: parsed.pathname,
        pathKeywordsMatched,
        contentKeywordsMatched,
        wrongPageHints,
      };
    }
  }

  // Generic path is a strong negative — downgrade everything.
  if (isGenericPath(parsed.pathname)) {
    return {
      classification: "GENERIC_HOMEPAGE",
      reason: "path_is_generic",
      hostname,
      pathname: parsed.pathname,
      pathKeywordsMatched,
      contentKeywordsMatched,
      wrongPageHints,
    };
  }

  // Wrong-page hints downgrade a path/content keyword match.
  if (wrongPageHints.length > 0) {
    return {
      classification: "LIKELY_WRONG_PAGE",
      reason: `wrong_page_hints:${wrongPageHints.slice(0, 2).join(",")}`,
      hostname,
      pathname: parsed.pathname,
      pathKeywordsMatched,
      contentKeywordsMatched,
      wrongPageHints,
    };
  }

  // Positive verdict requires a keyword match in path or (when given) content.
  if (pathKeywordsMatched.length > 0 || contentKeywordsMatched.length > 0) {
    return {
      classification: "PATH_HINTS_PROGRAM",
      reason: pathKeywordsMatched.length > 0
        ? `path_keywords:${pathKeywordsMatched.slice(0, 2).join(",")}`
        : `content_keywords:${contentKeywordsMatched.slice(0, 2).join(",")}`,
      hostname,
      pathname: parsed.pathname,
      pathKeywordsMatched,
      contentKeywordsMatched,
      wrongPageHints,
    };
  }

  // Path is not generic, not wrong-page, no keyword hit → deep path
  // with no hint. The human queue's call.
  return {
    classification: "DEEP_PATH_NO_HINT",
    reason: "no_keyword_match",
    hostname,
    pathname: parsed.pathname,
    pathKeywordsMatched,
    contentKeywordsMatched,
    wrongPageHints,
  };
}
