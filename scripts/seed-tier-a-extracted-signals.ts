/**
 * Hand-curate `extractedSignals` for the 5 Tier-A rows flagged during
 * the G0 walk. These overrides replace the heuristic in
 * src/lib/listing-v2-signals.ts on a per-section basis: a non-empty
 * array in the JSON wins; everything else falls through to the
 * heuristic.
 *
 * Run: npx tsx scripts/seed-tier-a-extracted-signals.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface HighlightPoint { title: string; tail: string; }
interface MoneyTile { icon: "dollar" | "clock" | "cal" | "shield"; label: string; value: string; small?: string; }
interface ApplyStep { title: string; detail: string; }

interface RowOverride {
  id: string;
  name: string;
  strong?: HighlightPoint[];
  watch?: HighlightPoint[];
  money?: MoneyTile[];
  included?: string[];
  clerkships?: string[];
  applySteps?: ApplyStep[];
}

const ROWS: RowOverride[] = [
  // ─────────────────────────────────────────────────────────────────
  // #154 Texas Tech HSC IM IMG Observership
  //   One of the most transparent IMG observerships in the directory.
  //   Hands-off; specific fees; ECFMG or Step1+2 or LCME diploma.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "cmo3386pc002v1ny92dflv0b9",
    name: "#154 Texas Tech HSC IM IMG Observership",
    strong: [
      { title: "Transparent fee structure", tail: "$250 application + $100 background + $2,000 (4 wk) or $3,800 (8 wk) — all published on the source page" },
      { title: "Three eligibility paths", tail: "ECFMG certificate OR Step 1 + Step 2 score reports OR LCME-accredited medical school diploma" },
      { title: "IM subspecialty options", tail: "Nephrology, Infectious Diseases, and Pulmonary/Critical Care in addition to general IM" },
      { title: "Tier-A featured", tail: "Flagged during G0 walk as a top IMG observership for fee transparency + structured workflow" },
    ],
    watch: [
      { title: "Hands-off only", tail: "No direct patient care or chart access. Strictly shadowing per TTUHSC policy" },
      { title: "No visa sponsorship", tail: "Must already hold valid US visa or citizenship. TTUHSC does not sponsor educational visas" },
      { title: "Substantial program fee", tail: "$2,000 (4-wk) or $3,800 (8-wk) on top of $250 application + $100 background" },
      { title: "Two-block cap", tail: "Maximum 8 weeks total (two 4-week blocks). Beyond that requires special approval" },
    ],
    money: [
      { icon: "dollar", label: "Application fee", value: "$250", small: "non-refundable" },
      { icon: "dollar", label: "Program fee", value: "$2,000 / 4 wk", small: "$3,800 for 8 wk" },
      { icon: "dollar", label: "Background check", value: "~$100", small: "in addition" },
      { icon: "clock", label: "Duration", value: "4 or 8 wk", small: "two 4-wk blocks max" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // #222 UTSW Plastic Surgery Observership
  //   Most-specifically-documented IMG observership. Strict Nov-May
  //   window. MD-only (no PhDs). $2,920 funding floor. B-1 invitation.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "cmo3386sa002z1ny9arnxr27u",
    name: "#222 UTSW Plastic Surgery Observership",
    strong: [
      { title: "Department-specific Plastic Surgery", tail: "Subspecialty depth, not a generalist hub" },
      { title: "UTSW B-1 invitation letter", tail: "Department issues invitation letter to facilitate B-1 visa (rare — most IMG observerships are entirely self-arranged)" },
      { title: "Published funding floor", tail: "Exact threshold ($2,920 USD) documented on official letterhead" },
      { title: "Tier-A featured", tail: "G0 walk: 'one of the most specifically-documented IMG observerships in the directory'" },
    ],
    watch: [
      { title: "MD or equivalent only", tail: "PhDs explicitly NOT eligible. Must have MD/MBBS or equivalent" },
      { title: "Nov 1 - May 31 window only", tail: "Closed Jun 1 - Oct 31 to protect medical-student and resident elective slots" },
      { title: "6-week rotation cap", tail: "Extensions require written approval" },
      { title: "Strictly observational", tail: "No patient care, no clinical privileges, no medical license. Shadowing only" },
    ],
    money: [
      { icon: "dollar", label: "Funding floor", value: "≥ $2,920 USD", small: "documented on letterhead" },
      { icon: "clock", label: "Duration", value: "Up to 6 wk", small: "extensions need approval" },
      { icon: "cal", label: "Window", value: "Nov 1 - May 31", small: "summer closed" },
      { icon: "shield", label: "Visa", value: "B-1 letter", small: "UTSW provides" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // #226 UW DLMP Global Observership (Pathology)
  //   RARE: no fee + $2,500 stipend. 1 grad/month. Pre-residency only.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "cmo3386xy00371ny93hmww5rk",
    name: "#226 UW DLMP Pathology Global Observership",
    strong: [
      { title: "$2,500 stipend (not a fee!)", tail: "Program PAYS the observer up to $2,500 — rare positive in IMG observership landscape" },
      { title: "Highly selective", tail: "ONE medical school graduate accepted per month (~12 per year)" },
      { title: "Single Step 1 requirement", tail: "Only USMLE Step 1 + score submission needed. Step 2/3 not required" },
      { title: "IMG-eligible exception at UW", tail: "UW Medicine general observerships exclude IMGs — this + Radiology are the only two openings" },
    ],
    watch: [
      { title: "Pre-residency only", tail: "Strictly for graduates NOT currently enrolled in residency. Current residents elsewhere are ineligible" },
      { title: "LOR required at application", tail: "Application requires ≥1 letter of recommendation upfront — not just a CV submission" },
      { title: "Visa applicant-arranged", tail: "UW does not sponsor educational visas. INTL applicants must self-arrange B-1/B-2 or other" },
      { title: "1-month rotation cap", tail: "Fixed one-month duration. No extensions or stacking" },
    ],
    money: [
      { icon: "dollar", label: "Program fee", value: "NONE", small: "no fee charged" },
      { icon: "dollar", label: "Stipend", value: "Up to $2,500", small: "PAID to observer" },
      { icon: "clock", label: "Duration", value: "1 month", small: "fixed" },
      { icon: "cal", label: "Slots", value: "1 / month", small: "~12 / year" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // #163 UAB International Visiting Medical Observership
  //   Separate INTL pathway. IMG grads + INTL students. $350 + $4,250/4wk.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "cmo33852p000p1ny92siexq0s",
    name: "#163 UAB International Visiting Medical Observership",
    strong: [
      { title: "Open to both grads + students", tail: "Recent IMG graduates AND international medical students (not all programs accept both)" },
      { title: "Step 1 required, Step 2/3 preferred", tail: "Step 1 firm requirement; Step 2/3 preferred but not required to apply" },
      { title: "Separate INTL pathway", tail: "Distinct program from UAB Heersink Visiting Students (US/PR + LCME/AOA only)" },
      { title: "Tier-A featured", tail: "G0 walk: clean IMG/student multi-audience structure with transparent fees" },
    ],
    watch: [
      { title: "Substantial program fee", tail: "$350 application + $4,250 per 4-week slot — total $4,600 for a 4-week observership" },
      { title: "LOR required", tail: "Letter of recommendation required at application" },
      { title: "Step 1 firm requirement", tail: "Must have passed USMLE Step 1 to be eligible" },
      { title: "No visa sponsorship", tail: "B-1/B-2 self-arranged" },
    ],
    money: [
      { icon: "dollar", label: "Application", value: "$350", small: "non-refundable" },
      { icon: "dollar", label: "Per 4-wk slot", value: "$4,250", small: "program fee" },
      { icon: "clock", label: "Duration", value: "4 or 8 wk", small: "" },
      { icon: "shield", label: "Visa", value: "Self-arranged", small: "B-1/B-2" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // #218 UT Health Memphis / Regional One Health
  //   Wide VSLO accessibility. INTL via VSLO-participating schools.
  //   FREE — no fee. Karen Coleman / visiting@uthsc.edu (real contact).
  // ─────────────────────────────────────────────────────────────────
  {
    id: "cmn2113e6005qsb114hstszfc",
    name: "#218 UT Memphis / Regional One Health",
    strong: [
      { title: "FREE — no fee charged by UTHSC", tail: "No program fee. Applicants only pay VSLO platform fee and supply own malpractice" },
      { title: "INTL via VSLO openness", tail: "Some INTL schools eligible — broader than the typical 'US LCME only' US M4 program (similar to UNM)" },
      { title: "5 UT campus sites", tail: "Memphis + Knoxville + Chattanooga + Nashville/Murfreesboro + Jackson — geographic flexibility" },
      { title: "Tier-A featured", tail: "G0 walk: 'US LCME + INTL via VSLO openness' rare combo" },
    ],
    watch: [
      { title: "Affiliation agreement nuance", tail: "INTL needs home-school VSLO membership OR institutional exchange with UT" },
      { title: "8-week career-wide cap", tail: "Maximum 8 weeks total across the UT system career-wide. No exceeding by stacking" },
      { title: "7 core clerkships required", tail: "Must have completed Family Med, IM, Neurology, Peds, Surgery, Psychiatry, OB-GYN at home institution" },
      { title: "Can be bumped 30 days pre-start", tail: "Visiting students scheduled AFTER UT students. Can lose offer if UT students backfill" },
    ],
    money: [
      { icon: "dollar", label: "Program fee", value: "FREE", small: "no UTHSC fee" },
      { icon: "clock", label: "Duration", value: "Max 8 wk", small: "career-wide cap" },
      { icon: "shield", label: "Malpractice", value: "Self-supplied", small: "applicant covers" },
      { icon: "cal", label: "Apply window", value: "VSLO standard", small: "no special window" },
    ],
  },
];

(async () => {
  for (const row of ROWS) {
    const payload: Record<string, unknown> = {};
    if (row.strong) payload.strong = row.strong;
    if (row.watch) payload.watch = row.watch;
    if (row.money) payload.money = row.money;
    if (row.included) payload.included = row.included;
    if (row.clerkships) payload.clerkships = row.clerkships;
    if (row.applySteps) payload.applySteps = row.applySteps;

    await prisma.listing.update({
      where: { id: row.id },
      data: {
        extractedSignals: payload,
      },
    });
    await prisma.$executeRaw`
      UPDATE listings
      SET "adminNotes" = COALESCE("adminNotes",'') ||
        '\n\nPlan B (mockup-98 per-row override) 2026-05-27: extractedSignals hand-curated — ' ||
        ${Object.keys(payload).join(", ")} ||
        '. Replaces heuristic for these sections.'
      WHERE id = ${row.id}
    `;
    console.log(`✓ ${row.name}`);
    console.log(`    sections curated: ${Object.keys(payload).join(", ")}`);
  }
  await prisma.$disconnect();
  console.log("\nDone.");
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
