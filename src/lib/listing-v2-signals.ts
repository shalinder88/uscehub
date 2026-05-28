/**
 * Mockup-98 Step 3 — signal extraction.
 *
 * Derives the "Quick highlights" (STRONG / WATCH), "Fees & duration",
 * "What's included", "Required clerkships", and "How to apply" sections
 * from the structured fields curated during the G0 walk + the
 * `fullDescription` / `eligibilitySummary` prose.
 *
 * PROJECT BINDING: NO REGEX. All text matching uses indexOf / includes /
 * split on plain strings. Case folded with toLowerCase() for keyword checks.
 *
 * The functions are intentionally conservative: when in doubt, OMIT the
 * point rather than fabricate it. A blank section is better than a wrong
 * one.
 */

export interface HighlightPoint {
  title: string;
  tail: string;
}

export interface MoneyTile {
  icon: "dollar" | "clock" | "cal" | "shield";
  label: string;
  value: string;
  small?: string;
}

export interface ApplyStep {
  title: string;
  detail: string;
}

export interface SignalInputs {
  cost: string;
  duration: string;
  specialty: string;
  applicationMethod: string;
  audienceTag: string | null;
  visaSupport: boolean;
  linkVerified: boolean;
  featured: boolean;
  certificateOffered: boolean;
  lorPossible: boolean;
  fullDescription: string | null;
  shortDescription: string;
  eligibilitySummary: string | null;
  stepRequirements: string | null;
  ecfmgRequired: string | null;
  applicationDeadline: string | null;
  housingSupport: string | null;
}

/** Lowercase text used for keyword checks. Memoised by the caller. */
function lc(s: string | null | undefined): string {
  return (s || "").toLowerCase();
}

/** Does any haystack contain the needle (case-insensitive)? */
function anyContains(needle: string, ...haystacks: (string | null | undefined)[]): boolean {
  const n = needle.toLowerCase();
  for (const h of haystacks) {
    if (h && h.toLowerCase().includes(n)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────
// STRONG POINTS
// ─────────────────────────────────────────────────────────────────────

export function computeStrongPoints(i: SignalInputs): HighlightPoint[] {
  const out: HighlightPoint[] = [];
  const allText = [i.fullDescription, i.shortDescription, i.cost].join(" ");
  const allLc = allText.toLowerCase();

  // 1. Always show "Verified direct source" if linkVerified
  if (i.linkVerified) {
    out.push({
      title: "Verified direct source",
      tail: "Audited URL — no platform middleman, no scraped data",
    });
  }

  // 2. Featured (Tier-A) — strong signal
  if (i.featured) {
    out.push({
      title: "Tier-A recommended",
      tail: "Flagged as a top program in our directory",
    });
  }

  // 3. FREE tuition / no fee
  if (
    allLc.includes("free tuition") ||
    allLc.includes("no tuition") ||
    allLc.includes("no fee") ||
    allLc.includes("free — no fee") ||
    (i.cost.toLowerCase().includes("free") && !i.cost.toLowerCase().includes("free of"))
  ) {
    out.push({
      title: "No tuition fee",
      tail: "Program does not charge a per-elective fee",
    });
  }

  // 4. Stipend / paid position
  if (allLc.includes("stipend") || allLc.includes("paid position")) {
    out.push({
      title: "Stipend-paying",
      tail: "Receives a paid stipend (rare for IMG observerships)",
    });
  }

  // 5. Multi-specialty
  const specCount = i.specialty
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean).length;
  if (specCount >= 3) {
    out.push({
      title: `Multi-specialty (${specCount}+)`,
      tail: "Placement available across multiple clinical departments",
    });
  }

  // 6. INTL accessible — when audience includes IMG/INTL
  const audLc = lc(i.audienceTag);
  if (audLc.includes("img") && i.visaSupport) {
    out.push({
      title: "INTL physicians eligible",
      tail: "Open to international medical graduates",
    });
  }

  // 7. LOR possible
  if (i.lorPossible) {
    out.push({
      title: "LOR eligibility",
      tail: "Letter of recommendation possible at attending discretion",
    });
  }

  // 8. Certificate
  if (i.certificateOffered) {
    out.push({
      title: "Certificate of completion",
      tail: "Issued on successful program completion",
    });
  }

  // 9. Rolling / year-round
  if (allLc.includes("rolling") || allLc.includes("year-round") || allLc.includes("year round")) {
    out.push({
      title: "Rolling applications",
      tail: "Apply year-round, not tied to a single yearly window",
    });
  }

  // 10. Affiliation-agreement openness (rare positive — UNM/UTHSC pattern)
  if (
    allLc.includes("vslo-participating") ||
    allLc.includes("some international medical schools are eligible")
  ) {
    out.push({
      title: "Open INTL VSLO access",
      tail: "Accepts INTL students from any VSLO-participating home school",
    });
  }

  return out.slice(0, 4);
}

// ─────────────────────────────────────────────────────────────────────
// WATCH FOR
// ─────────────────────────────────────────────────────────────────────

export function computeWatchPoints(i: SignalInputs): HighlightPoint[] {
  const out: HighlightPoint[] = [];
  const allText = [i.fullDescription, i.shortDescription, i.cost, i.duration].join(" ");
  const allLc = allText.toLowerCase();
  const audLc = lc(i.audienceTag);

  // 1. INTL not eligible — strong caveat
  if (!i.visaSupport && audLc.includes("us-md-do-visiting") && !audLc.includes("img")) {
    out.push({
      title: "INTL not eligible",
      tail: "Program is US LCME/COCA only — no IMG pathway",
    });
  } else if (
    allLc.includes("intl not accepted") ||
    allLc.includes("not accepting international") ||
    allLc.includes("international students are not eligible") ||
    allLc.includes("intl excluded")
  ) {
    out.push({
      title: "INTL not eligible",
      tail: "Page explicitly excludes international applicants",
    });
  }

  // 2. VSLO platform required
  if (i.applicationMethod === "VSLO" || i.applicationMethod === "VSAS" || i.applicationMethod === "VSAS/VSLO") {
    out.push({
      title: "VSLO platform required",
      tail: "Your home medical school must participate in AAMC VSLO",
    });
  }

  // 3. USMLE step required
  if (i.stepRequirements && i.stepRequirements.length > 0) {
    out.push({
      title: "USMLE Step required",
      tail: i.stepRequirements,
    });
  }

  // 4. ECFMG required
  if (i.ecfmgRequired && i.ecfmgRequired.length > 0) {
    out.push({
      title: "ECFMG certification",
      tail: i.ecfmgRequired,
    });
  }

  // 5. No hands-on patient care (observation only)
  if (
    allLc.includes("no hands-on") ||
    allLc.includes("hands-off") ||
    allLc.includes("observation only") ||
    allLc.includes("strictly observational")
  ) {
    out.push({
      title: "Hands-off observation only",
      tail: "No direct patient care or EMR access permitted",
    });
  }

  // 6. Affiliation agreement required (Wake Forest / Stony Brook pattern)
  if (
    allLc.includes("affiliation agreement") &&
    (allLc.includes("required") || allLc.includes("mandatory") || allLc.includes("no exceptions"))
  ) {
    out.push({
      title: "Affiliation agreement required",
      tail: "Home school must have an existing agreement (6-8 weeks to execute)",
    });
  }

  // 7. Short duration (hours / days)
  if (i.duration && (i.duration.toLowerCase().includes("hour") || i.duration.toLowerCase().includes(" day"))) {
    out.push({
      title: "Limited duration",
      tail: i.duration,
    });
  }

  // 8. No visa sponsorship for INTL
  if (!i.visaSupport && audLc.includes("img")) {
    out.push({
      title: "No visa sponsorship",
      tail: "INTL applicants must self-arrange B-1/B-2 visitor visa",
    });
  }

  // 9. Fall term / window restrictions
  if (
    allLc.includes("fall term only") ||
    allLc.includes("summer only") ||
    allLc.includes("seasonal window") ||
    allLc.includes("november 1 - may 31") ||
    allLc.includes("only nov") ||
    (allLc.includes("blackout") && allLc.includes("month"))
  ) {
    out.push({
      title: "Seasonal availability",
      tail: "Limited application/rotation window during the year",
    });
  }

  // 10. High program fee (>= $1000)
  // Skip if the cost field actually describes a stipend / payment to
  // the observer (UW DLMP pattern: "No fee; program provides stipend
  // up to $2,500" — that's money TO the observer, not from them).
  if (i.cost) {
    const costLc = i.cost.toLowerCase();
    const isReceivingMoney =
      costLc.includes("stipend") ||
      costLc.includes("paid position") ||
      costLc.includes("no fee") ||
      costLc.includes("free tuition") ||
      costLc.includes("no tuition");
    if (
      !isReceivingMoney &&
      (costLc.includes("$1,") ||
      costLc.includes("$2,") ||
      costLc.includes("$3,") ||
      costLc.includes("$4,") ||
      costLc.includes("$5,") ||
      costLc.includes("$6,") ||
      costLc.includes("$7,") ||
      costLc.includes("$8,") ||
      costLc.includes("$9,") ||
      costLc.includes("$10,"))
    ) {
      out.push({
        title: "Substantial program fee",
        tail: i.cost,
      });
    }
  }

  return out.slice(0, 4);
}

// ─────────────────────────────────────────────────────────────────────
// FEES, DURATION, LEAD-TIME, MALPRACTICE — 4 money tiles
// ─────────────────────────────────────────────────────────────────────

export function computeMoneyTiles(i: SignalInputs): MoneyTile[] {
  const tiles: MoneyTile[] = [];

  // Program fee
  if (i.cost) {
    const costShort = i.cost.length > 60 ? i.cost.slice(0, 57) + "..." : i.cost;
    tiles.push({
      icon: "dollar",
      label: "Program fee",
      value: costShort,
    });
  }

  // Duration
  if (i.duration) {
    const durShort = i.duration.length > 50 ? i.duration.slice(0, 47) + "..." : i.duration;
    tiles.push({ icon: "clock", label: "Duration", value: durShort });
  }

  // Lead time — from applicationDeadline or from prose
  const allLc = [i.fullDescription, i.shortDescription, i.applicationDeadline].join(" ").toLowerCase();
  let leadTime: string | null = null;
  if (allLc.includes("12 weeks") || allLc.includes("12-week")) leadTime = "12 weeks";
  else if (allLc.includes("8 weeks") || allLc.includes("8-week")) leadTime = "8 weeks";
  else if (allLc.includes("6 weeks") || allLc.includes("6-week")) leadTime = "6 weeks";
  else if (allLc.includes("4 weeks") || allLc.includes("4-week")) leadTime = "4 weeks";
  else if (allLc.includes("3 months ahead") || allLc.includes("3-4 months ahead")) leadTime = "3-4 months";
  else if (allLc.includes("2 months ahead") || allLc.includes("2-3 months ahead")) leadTime = "2-3 months";
  else if (allLc.includes("30 days") || allLc.includes("30-day")) leadTime = "30 days";
  else if (i.applicationDeadline) leadTime = i.applicationDeadline;

  if (leadTime) {
    tiles.push({
      icon: "cal",
      label: "Lead time",
      value: leadTime,
      small: "before start",
    });
  }

  // Malpractice
  const malpracticeLc = [i.fullDescription, i.shortDescription, i.eligibilitySummary, i.cost]
    .join(" ")
    .toLowerCase();
  if (malpracticeLc.includes("malpractice")) {
    let malValue = "Required";
    let malSmall = "active coverage";
    if (malpracticeLc.includes("$1m") || malpracticeLc.includes("$1 million") || malpracticeLc.includes("$1,000,000")) {
      malValue = "$1M / $3M";
      malSmall = "minimum coverage";
    } else if (malpracticeLc.includes("not covered") || malpracticeLc.includes("does not cover")) {
      malSmall = "applicant supplies";
    }
    tiles.push({ icon: "shield", label: "Malpractice", value: malValue, small: malSmall });
  }

  return tiles;
}

// ─────────────────────────────────────────────────────────────────────
// WHAT'S INCLUDED — checklist of benefits
// ─────────────────────────────────────────────────────────────────────

/** Truncate a verbose value for inline display in a bullet. */
function shortValue(s: string, max = 60): string {
  if (s.length <= max) return s;
  // Try to break at a natural boundary (comma, semicolon) before max.
  const cut = s.slice(0, max);
  const lastComma = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(";"));
  if (lastComma > max - 20) return cut.slice(0, lastComma) + "...";
  return cut.slice(0, max - 1).trim() + "...";
}

export function computeIncluded(i: SignalInputs): string[] {
  const out: string[] = [];

  // Duration of experience (truncated if verbose)
  if (i.duration) {
    out.push(`<b>${shortValue(i.duration, 60)}</b> of structured clinical experience`);
  }

  // Specialty placement
  if (i.specialty) {
    const specCount = i.specialty.split(",").filter(Boolean).length;
    if (specCount > 1) {
      out.push(`<b>Placement</b> in your chosen specialty across ${specCount} departments`);
    } else {
      out.push(`<b>Placement</b> in ${shortValue(i.specialty, 80)}`);
    }
  }

  // Supervision (standard for observerships)
  out.push(`<b>Direct supervision</b> by attending faculty`);

  // Rounds / case discussion (standard)
  out.push(`<b>Rounds, case discussions, and bedside teaching</b> participation`);

  // LOR
  if (i.lorPossible) {
    out.push(`<b>Letter of recommendation</b> eligibility (attending discretion)`);
  }

  // Certificate
  if (i.certificateOffered) {
    out.push(`<b>Certificate of completion</b> at end of program`);
  }

  // Housing
  if (i.housingSupport) {
    out.push(`<b>Housing</b>: ${shortValue(i.housingSupport, 90)}`);
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────
// REQUIRED CLERKSHIPS — derived from eligibilitySummary / fullDescription
// ─────────────────────────────────────────────────────────────────────

const CORE_CLERKSHIPS = [
  "Internal Medicine",
  "Surgery",
  "OB/GYN",
  "Pediatrics",
  "Psychiatry",
  "Family Medicine",
  "Neurology",
  "Emergency Medicine",
];

export function computeRequiredClerkships(i: SignalInputs): string[] {
  const lcText = [i.eligibilitySummary, i.fullDescription, i.shortDescription]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Only run if the text explicitly mentions "core clerkship(s)" or
  // "completed clerkships" or "required clerkships"
  const triggersClerkships =
    lcText.includes("core clerkship") ||
    lcText.includes("completed clerkships") ||
    lcText.includes("required clerkships") ||
    lcText.includes("required core") ||
    lcText.includes("must have completed");

  if (!triggersClerkships) return [];

  const out: string[] = [];
  for (const c of CORE_CLERKSHIPS) {
    if (lcText.includes(c.toLowerCase()) || lcText.includes(c.toLowerCase().replace("/", "-"))) {
      out.push(c);
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// HOW TO APPLY — numbered steps (templated by applicationMethod)
// ─────────────────────────────────────────────────────────────────────

export function computeApplySteps(i: SignalInputs): ApplyStep[] {
  const method = i.applicationMethod;

  if (method === "VSLO" || method === "VSAS" || method === "VSAS/VSLO") {
    return [
      {
        title: "Confirm eligibility with your home Dean's office.",
        detail:
          "Verify your school participates in VSLO and that you have completed any required core clerkships.",
      },
      {
        title: "Open the program's official Visiting Students page.",
        detail:
          "Review the current elective catalog, available specialties, and any program-specific forms.",
      },
      {
        title: "Submit your application through the AAMC VSLO platform.",
        detail:
          "Your home Dean's office handles the submission. Include the Dean's letter of permission and any required documentation.",
      },
      {
        title: "Wait for the program to assign your rotation.",
        detail:
          "Lead time varies by demand. Programs review on a rolling or cohort schedule (see Lead time tile above).",
      },
      {
        title: "Complete pre-arrival onboarding.",
        detail:
          "Health clearance, malpractice attestation, immunization documentation, and orientation are coordinated by the program before your start date.",
      },
    ];
  }

  // Email-direct flow (typical for IMG observerships)
  return [
    {
      title: "Identify a faculty host or coordinator at the program.",
      detail:
        "Many IMG observerships require a faculty sponsor BEFORE you can apply. Use the contact email in the sidebar.",
    },
    {
      title: "Submit your application packet directly to the program.",
      detail:
        "Typical packet: CV, USMLE scores or ECFMG certificate, letter of intent, proof of funding, immunizations, and (for INTL) translated medical license.",
    },
    {
      title: "Pay any required application or program fee.",
      detail:
        "Many programs charge a non-refundable application fee + per-rotation program fee. See the cost tile above for this program's specific amounts.",
    },
    {
      title: "Complete pre-arrival paperwork and visa coordination.",
      detail:
        "Most IMG observerships do not sponsor educational visas — applicants travel on B-1/B-2 visitor status. Confirm before booking travel.",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────
// MAIN entry point — single object the page can consume
// ─────────────────────────────────────────────────────────────────────

export interface ListingV2Signals {
  strong: HighlightPoint[];
  watch: HighlightPoint[];
  money: MoneyTile[];
  included: string[];
  clerkships: string[];
  applySteps: ApplyStep[];
}

export function computeListingV2Signals(i: SignalInputs): ListingV2Signals {
  return {
    strong: computeStrongPoints(i),
    watch: computeWatchPoints(i),
    money: computeMoneyTiles(i),
    included: computeIncluded(i),
    clerkships: computeRequiredClerkships(i),
    applySteps: computeApplySteps(i),
  };
}
