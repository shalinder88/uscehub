/**
 * Simple in-memory rate limiter for API routes.
 * Limits requests per IP address within a time window.
 * Resets automatically. No external dependencies.
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit?: number;
  /** Time window in seconds */
  windowSeconds?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export function rateLimit(
  ip: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { limit = 60, windowSeconds = 60 } = options;
  const now = Date.now();
  const key = ip;

  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetTime) {
    // First request or window expired — reset
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return { allowed: true, remaining: limit - 1, resetIn: windowSeconds };
  }

  existing.count++;

  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((existing.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: limit - existing.count,
    resetIn: Math.ceil((existing.resetTime - now) / 1000),
  };
}

/**
 * Detect common scraping bot user agents
 */
export function isScrapingBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const botPatterns = [
    /scrapy/i,
    /wget/i,
    /curl/i,
    /python-requests/i,
    /httpx/i,
    /aiohttp/i,
    /go-http-client/i,
    /java\//i,
    /libwww/i,
    /lwp-trivial/i,
    /php\//i,
    /pycurl/i,
    /urllib/i,
    /httrack/i,
    /harvest/i,
    /linkextractor/i,
    /collector/i,
    /grabber/i,
    /sitesucker/i,
    /copier/i,
  ];
  return botPatterns.some((p) => p.test(userAgent));
}
