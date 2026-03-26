// ---------------------------------------------------------------------------
// Policy Alerts for Physician Immigration
//
// Curated feed of immigration policy changes that affect physicians.
// Updated weekly. Each alert includes source URL for verification.
//
// Categories:
// - h1b: H-1B visa policy changes
// - conrad: Conrad 30 / J-1 waiver program changes
// - greencard: Green card / visa bulletin changes
// - uscis: USCIS processing and policy changes
// - legislative: Congressional bills and legislation
// - state: State-specific changes
//
// Trust: every alert must have a sourceUrl to an official or reputable source.
// ---------------------------------------------------------------------------

export interface PolicyAlert {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  impact: "critical" | "high" | "medium" | "low";
  category: "h1b" | "conrad" | "greencard" | "uscis" | "legislative" | "state";
  affectsWho: string[]; // e.g., ["J-1 physicians", "H-1B holders", "Indian-born"]
  sourceUrl: string;
  sourceName: string;
}

export const POLICY_ALERTS: PolicyAlert[] = [
  {
    id: "100k-h1b-fee",
    date: "2025-09-19",
    title: "$100,000 H-1B Supplemental Filing Fee Signed Into Law",
    summary:
      "Presidential Proclamation 10973 imposes a $100,000 fee on new H-1B petitions requiring consular processing. Applies to cap-exempt employers including hospitals and universities. Does NOT apply to change-of-status (already in US), extensions, or many transfers. Expires September 2026 unless renewed. Only ~85 employers have paid it so far, causing a dramatic drop in new H-1B filings.",
    impact: "critical",
    category: "h1b",
    affectsWho: ["H-1B applicants from abroad", "All employers sponsoring new H-1Bs", "J-1 physicians needing consular processing"],
    sourceUrl: "https://www.federalregister.gov/documents/2025/09/22/2025-21653/adjusting-nonimmigrant-visa-fees",
    sourceName: "Federal Register",
  },
  {
    id: "physician-h1b-exemption-bill",
    date: "2025-10-15",
    title: "H-1Bs for Physicians and Healthcare Workforce Act Introduced",
    summary:
      "Bipartisan bill introduced to exempt physicians and healthcare workers from the $100,000 H-1B fee. Supported by AMA and 55+ medical specialty societies. Bill status: introduced, not yet passed.",
    impact: "high",
    category: "legislative",
    affectsWho: ["All physician H-1B applicants"],
    sourceUrl: "https://www.ama-assn.org/about/leadership/exempting-physicians-h-1b-visa-fee-protects-patients",
    sourceName: "American Medical Association",
  },
  {
    id: "conrad-reauth-2025",
    date: "2025-02-25",
    title: "Conrad State 30 Reauthorization Act (H.R. 1585 / S. 709) Introduced",
    summary:
      "Bipartisan bill would extend Conrad 30 for 3 years, increase slots from 30 to 35 per state, add automatic escalation if 90% used nationally, create slot recapture when physicians leave states, and add a 6-month status extension for denied applicants. Currently in Senate Judiciary Committee. Without passage, physicians who acquired J-1 status after October 1, 2025 may not be eligible.",
    impact: "critical",
    category: "conrad",
    affectsWho: ["All J-1 waiver physicians", "Future Conrad 30 applicants"],
    sourceUrl: "https://www.congress.gov/bill/119th-congress/house-bill/1585/text",
    sourceName: "Congress.gov",
  },
  {
    id: "uscis-processing-freeze-2025",
    date: "2025-12-01",
    title: "USCIS Processing Freeze Affects 39 Countries",
    summary:
      "USCIS froze processing for work authorization renewals affecting physicians from 39 countries in winter 2025-2026. Hospitals in OH, PA, MI cancelled clinics. Doctors forced into unpaid absences. 20+ federal lawsuits filed. An estimated 900+ patients left without care from a single affected physician's practice.",
    impact: "critical",
    category: "uscis",
    affectsWho: ["H-1B holders from affected countries", "H-4 dependents", "Hospitals employing affected physicians"],
    sourceUrl: "https://www.axios.com/2026/03/24/trump-visa-policy-immigrant-doctors",
    sourceName: "Axios",
  },
  {
    id: "h4-ead-extension-ended",
    date: "2025-10-01",
    title: "H-4 EAD Automatic Extension Settlement Expired",
    summary:
      "The settlement that required bundled processing of H-4 EAD applications expired January 2025. Standalone H-4 EAD applications now take 6-12+ months. Spouses losing work authorization during gaps. Affects nearly every physician family on H-1B.",
    impact: "high",
    category: "h1b",
    affectsWho: ["H-4 spouses of H-1B physicians", "Physician families"],
    sourceUrl: "https://manifestlaw.com/blog/h4-ead-processing-time/",
    sourceName: "Manifest Law",
  },
  {
    id: "cms-conversion-factor-2026",
    date: "2026-01-01",
    title: "CY 2026 Medicare Conversion Factor: $33.40/RVU",
    summary:
      "CMS established two conversion factors for the first time: $33.57/RVU for qualifying APM participants, $33.40/RVU standard. Includes 2.5% statutory bump but a -2.5% efficiency adjustment on non-timed procedural wRVUs may reduce procedural specialty reimbursement despite the higher headline number.",
    impact: "medium",
    category: "uscis",
    affectsWho: ["All practicing physicians", "Physicians negotiating contracts"],
    sourceUrl: "https://www.cms.gov/newsroom/fact-sheets/calendar-year-cy-2026-medicare-physician-fee-schedule-final-rule-cms-1832-f",
    sourceName: "CMS.gov",
  },
  {
    id: "fha-loan-exclusion",
    date: "2025-05-15",
    title: "FHA Loans No Longer Available to Non-Permanent Residents",
    summary:
      "HUD Mortgagee Letter 2025-09 made FHA-insured loans unavailable to non-permanent residents. This directly affects H-1B physicians trying to buy homes during their waiver service. Conventional and physician mortgage loans remain available but often at higher rates or with adjustable terms.",
    impact: "high",
    category: "uscis",
    affectsWho: ["H-1B physicians buying homes", "J-1 waiver physicians considering home purchase"],
    sourceUrl: "https://homesteadfinancial.com/purchase/who-can-get-a-mortgage-a-guide-for-immigrants-in-the-u-s/",
    sourceName: "Homestead Financial",
  },
  {
    id: "premium-processing-fee-increase",
    date: "2026-03-01",
    title: "H-1B Premium Processing Fee Increased to $2,965",
    summary:
      "USCIS increased the premium processing fee from $2,805 to $2,965 effective March 1, 2026. Premium processing guarantees 15-business-day adjudication for H-1B petitions. Still strongly recommended for physician petitions to avoid 3-6 month regular processing delays.",
    impact: "low",
    category: "h1b",
    affectsWho: ["All H-1B petitioners using premium processing"],
    sourceUrl: "https://www.uscis.gov/newsroom/alerts/uscis-to-increase-premium-processing-fees",
    sourceName: "USCIS.gov",
  },
];

export function getAlertsByImpact(): PolicyAlert[] {
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...POLICY_ALERTS].sort((a, b) => order[a.impact] - order[b.impact]);
}

export function getAlertsByDate(): PolicyAlert[] {
  return [...POLICY_ALERTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function getAlertsByCategory(category: string): PolicyAlert[] {
  return POLICY_ALERTS.filter((a) => a.category === category);
}
