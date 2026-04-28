import { US_STATES, SPECIALTIES } from "@/lib/utils";

export interface SmartSearchFilters {
  search?: string;
  type?: string;
  state?: string;
  sort?: string;
  free?: string;
  visa?: string;
  specialty?: string;
}

const STATE_NAME_TO_CODE: Record<string, string> = {};
for (const [code, name] of Object.entries(US_STATES)) {
  STATE_NAME_TO_CODE[name.toLowerCase()] = code;
  STATE_NAME_TO_CODE[code.toLowerCase()] = code;
}

// City-to-state mapping for "near X" queries
const CITY_TO_STATE: Record<string, string> = {
  "new york": "NY",
  "nyc": "NY",
  "manhattan": "NY",
  "brooklyn": "NY",
  "bronx": "NY",
  "queens": "NY",
  "los angeles": "CA",
  "la": "CA",
  "san francisco": "CA",
  "san diego": "CA",
  "chicago": "IL",
  "houston": "TX",
  "dallas": "TX",
  "san antonio": "TX",
  "austin": "TX",
  "philadelphia": "PA",
  "philly": "PA",
  "pittsburgh": "PA",
  "boston": "MA",
  "cleveland": "OH",
  "columbus": "OH",
  "cincinnati": "OH",
  "detroit": "MI",
  "miami": "FL",
  "orlando": "FL",
  "tampa": "FL",
  "jacksonville": "FL",
  "atlanta": "GA",
  "seattle": "WA",
  "portland": "OR",
  "denver": "CO",
  "phoenix": "AZ",
  "las vegas": "NV",
  "minneapolis": "MN",
  "st louis": "MO",
  "saint louis": "MO",
  "baltimore": "MD",
  "washington dc": "DC",
  "dc": "DC",
  "nashville": "TN",
  "memphis": "TN",
  "charlotte": "NC",
  "raleigh": "NC",
  "indianapolis": "IN",
  "milwaukee": "WI",
  "new orleans": "LA",
  "salt lake city": "UT",
  "richmond": "VA",
  "buffalo": "NY",
  "rochester": "NY",
  "newark": "NJ",
  "jersey city": "NJ",
};

const TYPE_KEYWORDS: Record<string, string> = {
  observership: "OBSERVERSHIP",
  observerships: "OBSERVERSHIP",
  externship: "EXTERNSHIP",
  externships: "EXTERNSHIP",
  research: "RESEARCH",
  "research fellowship": "RESEARCH",
  "research fellowships": "RESEARCH",
  fellowship: "RESEARCH",
  fellowships: "RESEARCH",
  postdoc: "RESEARCH",
  postdoctoral: "RESEARCH",
  rotation: "EXTERNSHIP",
  rotations: "EXTERNSHIP",
  elective: "ELECTIVE",
  electives: "ELECTIVE",
  volunteer: "VOLUNTEER",
  volunteering: "VOLUNTEER",
};

const COST_FREE_KEYWORDS = ["free", "no cost", "no fee", "zero cost", "$0"];
const COST_CHEAP_KEYWORDS = ["cheap", "affordable", "low cost", "budget", "inexpensive"];

const SPECIALTY_LOWER = SPECIALTIES.map((s) => s.toLowerCase());

/**
 * Parse a natural-language search query into structured filter params.
 *
 * Examples:
 *   "free observerships in New York" → { free: "true", type: "OBSERVERSHIP", state: "NY" }
 *   "research fellowship California"  → { type: "RESEARCH", state: "CA" }
 *   "cheap observership"              → { type: "OBSERVERSHIP", sort: "cost-low" }
 *   "observerships near Boston"       → { type: "OBSERVERSHIP", state: "MA" }
 *   "pediatrics observership"         → { type: "OBSERVERSHIP", specialty: "Pediatrics" }
 */
export function parseSmartSearch(query: string): SmartSearchFilters {
  const filters: SmartSearchFilters = {};
  const q = query.trim();
  if (!q) return filters;

  const lower = q.toLowerCase();

  // 1. Detect cost keywords
  for (const kw of COST_FREE_KEYWORDS) {
    if (lower.includes(kw)) {
      filters.free = "true";
      break;
    }
  }
  if (!filters.free) {
    for (const kw of COST_CHEAP_KEYWORDS) {
      if (lower.includes(kw)) {
        filters.sort = "cost-low";
        break;
      }
    }
  }

  // 2. Detect listing type
  // Check multi-word keywords first, then single-word
  const sortedTypeKeys = Object.keys(TYPE_KEYWORDS).sort(
    (a, b) => b.length - a.length
  );
  for (const kw of sortedTypeKeys) {
    if (lower.includes(kw)) {
      filters.type = TYPE_KEYWORDS[kw];
      break;
    }
  }

  // 3. Detect state — check "in <state>" or "near <city>" patterns first
  const inStateMatch = lower.match(
    /\b(?:in|from|at)\s+([a-z][a-z\s]+?)(?:\s*$|\s+(?:for|with|that|and|or))/
  );
  const nearCityMatch = lower.match(/\bnear\s+([a-z][a-z\s]+?)(?:\s*$|\s+(?:for|with|that|and|or))/);

  if (nearCityMatch) {
    const cityName = nearCityMatch[1].trim();
    if (CITY_TO_STATE[cityName]) {
      filters.state = CITY_TO_STATE[cityName];
    }
  }

  if (!filters.state && inStateMatch) {
    const locationName = inStateMatch[1].trim();
    // Check city first, then state
    if (CITY_TO_STATE[locationName]) {
      filters.state = CITY_TO_STATE[locationName];
    } else if (STATE_NAME_TO_CODE[locationName]) {
      filters.state = STATE_NAME_TO_CODE[locationName];
    }
  }

  // Fallback: check if any state name or abbreviation appears in the query
  if (!filters.state) {
    // Check full state names first (longer matches win)
    const stateNames = Object.entries(STATE_NAME_TO_CODE)
      .filter(([name]) => name.length > 2)
      .sort((a, b) => b[0].length - a[0].length);

    for (const [name, code] of stateNames) {
      if (lower.includes(name)) {
        filters.state = code;
        break;
      }
    }

    // Check two-letter abbreviations only if surrounded by word boundaries
    if (!filters.state) {
      for (const [code] of Object.entries(US_STATES)) {
        const regex = new RegExp(`\\b${code.toLowerCase()}\\b`);
        if (regex.test(lower) && code.length === 2) {
          // Avoid false positives for common words like "IN", "OR", "ME"
          const commonWords = ["in", "or", "me", "ok"];
          if (!commonWords.includes(code.toLowerCase())) {
            filters.state = code;
            break;
          }
        }
      }
    }

    // Check city names in free text
    if (!filters.state) {
      const sortedCities = Object.entries(CITY_TO_STATE).sort(
        (a, b) => b[0].length - a[0].length
      );
      for (const [city, stateCode] of sortedCities) {
        if (lower.includes(city)) {
          filters.state = stateCode;
          break;
        }
      }
    }
  }

  // 4. Detect specialty
  for (let i = 0; i < SPECIALTY_LOWER.length; i++) {
    if (lower.includes(SPECIALTY_LOWER[i])) {
      filters.specialty = SPECIALTIES[i];
      break;
    }
  }

  // 5. Detect visa-related keywords
  if (
    lower.includes("visa support") ||
    lower.includes("visa sponsorship") ||
    lower.includes("j1") ||
    lower.includes("j-1")
  ) {
    filters.visa = "true";
  }

  // 6. Build remaining search text by removing detected keywords
  let remaining = lower;
  // Remove matched keywords to get residual search text
  const removePatterns: string[] = [];
  if (filters.free) removePatterns.push(...COST_FREE_KEYWORDS);
  if (filters.sort === "cost-low") removePatterns.push(...COST_CHEAP_KEYWORDS);
  if (filters.type) {
    for (const [kw, val] of Object.entries(TYPE_KEYWORDS)) {
      if (val === filters.type) removePatterns.push(kw);
    }
  }
  if (filters.visa) {
    removePatterns.push("visa support", "visa sponsorship", "j1", "j-1");
  }

  // Remove prepositions and connectors used in patterns
  remaining = remaining
    .replace(/\b(in|from|at|near|for|with)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const pattern of removePatterns) {
    remaining = remaining.replace(new RegExp(pattern, "gi"), " ");
  }

  // Remove matched state/city names
  if (filters.state) {
    const stateName = US_STATES[filters.state]?.toLowerCase();
    if (stateName) remaining = remaining.replace(stateName, " ");
    remaining = remaining.replace(
      new RegExp(`\\b${filters.state.toLowerCase()}\\b`, "g"),
      " "
    );
    for (const [city, code] of Object.entries(CITY_TO_STATE)) {
      if (code === filters.state) {
        remaining = remaining.replace(city, " ");
      }
    }
  }

  // Remove matched specialty
  if (filters.specialty) {
    remaining = remaining.replace(filters.specialty.toLowerCase(), " ");
  }

  remaining = remaining.replace(/\s+/g, " ").trim();

  // Only set search if there are meaningful leftover words
  if (remaining.length > 1) {
    filters.search = remaining;
  }

  return filters;
}

/**
 * Build URLSearchParams from smart search filters merged with any existing params.
 */
export function buildSearchUrl(filters: SmartSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.state) params.set("state", filters.state);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.free) params.set("free", filters.free);
  if (filters.visa) params.set("visa", filters.visa);
  if (filters.specialty) params.set("search", filters.specialty);
  const qs = params.toString();
  return `/browse${qs ? `?${qs}` : ""}`;
}
