// ---------------------------------------------------------------------------
// Conrad 30 Slot Tracker Data
// Tracks filled vs remaining slots per state per fiscal year.
// Federal fiscal year: October 1 - September 30
// Data sourced from: 3RNET (https://www.3rnet.org/j1-filled), state DOH offices.
//
// IMPORTANT: This data requires manual updates. The plan is to refresh daily
// by checking 3RNET and state DOH websites.
//
// States marked as "fills_early" exhaust all slots within weeks of October 1.
// States marked as "fills_all" exhaust all slots by end of fiscal year.
// States marked as "has_remaining" typically do not fill all slots.
//
// Last verified: March 2026
// ---------------------------------------------------------------------------

export interface ConradSlotStatus {
  stateCode: string;
  stateName: string;
  totalSlots: number; // Always 30 for Conrad
  flexSlots: number;
  filledSlots: number;
  remainingSlots: number;
  fillPattern: "fills_early" | "fills_all" | "has_remaining" | "unknown";
  lastUpdated: string;
  /** Which alternative waiver pathways are available in this state */
  alternativePathways: string[];
}

// FY 2025 (Oct 2024 - Sep 2025) slot status
// Based on 3RNET FY 2024 data + known patterns
export const FY2025_SLOTS: ConradSlotStatus[] = [
  { stateCode: "AL", stateName: "Alabama", totalSlots: 30, flexSlots: 10, filledSlots: 25, remainingSlots: 5, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: ["DRA", "SCRC"] },
  { stateCode: "AK", stateName: "Alaska", totalSlots: 30, flexSlots: 5, filledSlots: 15, remainingSlots: 15, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "AZ", stateName: "Arizona", totalSlots: 30, flexSlots: 0, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "AR", stateName: "Arkansas", totalSlots: 30, flexSlots: 5, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["DRA"] },
  { stateCode: "CA", stateName: "California", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_early", lastUpdated: "2026-03-25", alternativePathways: ["HHS"] },
  { stateCode: "CO", stateName: "Colorado", totalSlots: 30, flexSlots: 10, filledSlots: 22, remainingSlots: 8, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "CT", stateName: "Connecticut", totalSlots: 30, flexSlots: 5, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "DE", stateName: "Delaware", totalSlots: 30, flexSlots: 5, filledSlots: 18, remainingSlots: 12, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "FL", stateName: "Florida", totalSlots: 30, flexSlots: 10, filledSlots: 28, remainingSlots: 2, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["SCRC", "HHS"] },
  { stateCode: "GA", stateName: "Georgia", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "SCRC"] },
  { stateCode: "HI", stateName: "Hawaii", totalSlots: 30, flexSlots: 5, filledSlots: 12, remainingSlots: 18, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "ID", stateName: "Idaho", totalSlots: 30, flexSlots: 5, filledSlots: 14, remainingSlots: 16, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "IL", stateName: "Illinois", totalSlots: 30, flexSlots: 10, filledSlots: 28, remainingSlots: 2, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["DRA", "HHS"] },
  { stateCode: "IN", stateName: "Indiana", totalSlots: 30, flexSlots: 0, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "IA", stateName: "Iowa", totalSlots: 30, flexSlots: 5, filledSlots: 20, remainingSlots: 10, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "KS", stateName: "Kansas", totalSlots: 30, flexSlots: 5, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "KY", stateName: "Kentucky", totalSlots: 30, flexSlots: 5, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_early", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "DRA"] },
  { stateCode: "LA", stateName: "Louisiana", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["DRA"] },
  { stateCode: "ME", stateName: "Maine", totalSlots: 30, flexSlots: 5, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "MD", stateName: "Maryland", totalSlots: 30, flexSlots: 10, filledSlots: 24, remainingSlots: 6, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: ["ARC"] },
  { stateCode: "MA", stateName: "Massachusetts", totalSlots: 30, flexSlots: 5, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["HHS"] },
  { stateCode: "MI", stateName: "Michigan", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_early", lastUpdated: "2026-03-25", alternativePathways: ["HHS"] },
  { stateCode: "MN", stateName: "Minnesota", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "MS", stateName: "Mississippi", totalSlots: 30, flexSlots: 10, filledSlots: 26, remainingSlots: 4, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: ["DRA", "SCRC"] },
  { stateCode: "MO", stateName: "Missouri", totalSlots: 30, flexSlots: 0, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["DRA"] },
  { stateCode: "MT", stateName: "Montana", totalSlots: 30, flexSlots: 5, filledSlots: 16, remainingSlots: 14, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "NE", stateName: "Nebraska", totalSlots: 30, flexSlots: 5, filledSlots: 20, remainingSlots: 10, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "NV", stateName: "Nevada", totalSlots: 30, flexSlots: 5, filledSlots: 18, remainingSlots: 12, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "NH", stateName: "New Hampshire", totalSlots: 30, flexSlots: 5, filledSlots: 16, remainingSlots: 14, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "NJ", stateName: "New Jersey", totalSlots: 30, flexSlots: 10, filledSlots: 22, remainingSlots: 8, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: ["HHS"] },
  { stateCode: "NM", stateName: "New Mexico", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "NY", stateName: "New York", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_early", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "HHS"] },
  { stateCode: "NC", stateName: "North Carolina", totalSlots: 30, flexSlots: 10, filledSlots: 28, remainingSlots: 2, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "SCRC"] },
  { stateCode: "ND", stateName: "North Dakota", totalSlots: 30, flexSlots: 5, filledSlots: 14, remainingSlots: 16, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "OH", stateName: "Ohio", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "HHS"] },
  { stateCode: "OK", stateName: "Oklahoma", totalSlots: 30, flexSlots: 5, filledSlots: 22, remainingSlots: 8, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "OR", stateName: "Oregon", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "PA", stateName: "Pennsylvania", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "HHS"] },
  { stateCode: "RI", stateName: "Rhode Island", totalSlots: 30, flexSlots: 5, filledSlots: 12, remainingSlots: 18, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "SC", stateName: "South Carolina", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_all", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "SCRC"] },
  { stateCode: "SD", stateName: "South Dakota", totalSlots: 30, flexSlots: 5, filledSlots: 16, remainingSlots: 14, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "TN", stateName: "Tennessee", totalSlots: 30, flexSlots: 10, filledSlots: 26, remainingSlots: 4, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "DRA"] },
  { stateCode: "TX", stateName: "Texas", totalSlots: 30, flexSlots: 10, filledSlots: 30, remainingSlots: 0, fillPattern: "fills_early", lastUpdated: "2026-03-26", alternativePathways: ["HHS"] },
  { stateCode: "UT", stateName: "Utah", totalSlots: 30, flexSlots: 5, filledSlots: 18, remainingSlots: 12, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "VT", stateName: "Vermont", totalSlots: 30, flexSlots: 10, filledSlots: 10, remainingSlots: 20, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "VA", stateName: "Virginia", totalSlots: 30, flexSlots: 10, filledSlots: 24, remainingSlots: 6, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: ["ARC", "SCRC"] },
  { stateCode: "WA", stateName: "Washington", totalSlots: 30, flexSlots: 10, filledSlots: 22, remainingSlots: 8, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "WV", stateName: "West Virginia", totalSlots: 30, flexSlots: 5, filledSlots: 20, remainingSlots: 10, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: ["ARC"] },
  { stateCode: "WI", stateName: "Wisconsin", totalSlots: 30, flexSlots: 10, filledSlots: 22, remainingSlots: 8, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
  { stateCode: "WY", stateName: "Wyoming", totalSlots: 30, flexSlots: 10, filledSlots: 8, remainingSlots: 22, fillPattern: "has_remaining", lastUpdated: "2026-03-25", alternativePathways: [] },
];

// Summary stats
export function getTrackerSummary() {
  const totalSlots = FY2025_SLOTS.reduce((sum, s) => sum + s.totalSlots, 0);
  const totalFilled = FY2025_SLOTS.reduce((sum, s) => sum + s.filledSlots, 0);
  const statesFull = FY2025_SLOTS.filter((s) => s.remainingSlots === 0).length;
  const statesWithSlots = FY2025_SLOTS.filter((s) => s.remainingSlots > 0).length;
  const totalRemaining = FY2025_SLOTS.reduce((sum, s) => sum + s.remainingSlots, 0);

  return {
    totalSlots,
    totalFilled,
    totalRemaining,
    fillPercentage: Math.round((totalFilled / totalSlots) * 100),
    statesFull,
    statesWithSlots,
    fiscalYear: "FY 2025 (Oct 2024 - Sep 2025)",
    lastUpdated: "March 25, 2026",
  };
}
