"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  updateDecision,
  REVIEWER_DECISIONS,
  OPPORTUNITY_TYPES,
  AUDIENCES,
  type ReviewerDecision,
} from "@/lib/p102-review-csv";

/**
 * Server actions for the local-only reviewer admin UI at
 * /usce/verified-preview/admin/review.
 *
 * Hard guard: every action throws if NODE_ENV === 'production'. The admin
 * surface is intentionally dev-only — it writes directly to a CSV in the
 * docs/ tree, which is appropriate for local review but never for prod.
 */

function assertLocalOnly(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "P102 admin actions are local-only and disabled in production",
    );
  }
}

const REVIEWER_DECISIONS_SET = new Set<string>(REVIEWER_DECISIONS);
const OPPORTUNITY_TYPES_SET = new Set<string>(OPPORTUNITY_TYPES);
const AUDIENCES_SET = new Set<string>(AUDIENCES);

function getString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Collect every value submitted under `key` as a string[]. Used for
 * multi-select checkboxes (proposedAudience: a page can serve both VMS
 * and IMG at the same time).
 */
function getStringList(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/**
 * Save a reviewer decision. Validates server-side (defense-in-depth on
 * top of the build-time `p102-validate-approved-public-safe-export.ts`).
 *
 * On success, revalidates the admin pages and the public preview pages,
 * then redirects back to the row's edit page so the reviewer sees the
 * persisted state.
 */
export async function saveReviewDecision(formData: FormData): Promise<void> {
  assertLocalOnly();

  const reviewId = getString(formData, "reviewId");
  if (!reviewId) throw new Error("reviewId is required");

  const reviewerDecision = getString(formData, "reviewerDecision");
  if (!REVIEWER_DECISIONS_SET.has(reviewerDecision)) {
    throw new Error(`invalid reviewerDecision: ${reviewerDecision}`);
  }

  const proposedOpportunityType = getString(formData, "proposedOpportunityType");
  if (
    proposedOpportunityType &&
    !OPPORTUNITY_TYPES_SET.has(proposedOpportunityType)
  ) {
    throw new Error(`invalid proposedOpportunityType: ${proposedOpportunityType}`);
  }

  // Multi-select: a single source page may serve more than one audience
  // (e.g. Houston Methodist Medical Student Rotations serves both VMS and
  // IMG). Stored as comma-separated string for CSV compatibility.
  const proposedAudienceList = getStringList(formData, "proposedAudience");
  for (const a of proposedAudienceList) {
    if (!AUDIENCES_SET.has(a)) throw new Error(`invalid proposedAudience: ${a}`);
  }
  const proposedAudience = [...new Set(proposedAudienceList)].sort().join(",");

  updateDecision(reviewId, {
    reviewerDecision: reviewerDecision as ReviewerDecision,
    decisionReason: getString(formData, "decisionReason"),
    reviewer: getString(formData, "reviewer"),
    reviewedAt: getString(formData, "reviewedAt"),
    proposedOpportunityName: getString(formData, "proposedOpportunityName"),
    proposedOpportunityType,
    proposedAudience,
    proposedCampus: getString(formData, "proposedCampus"),
    campusApplicabilityProof: getString(formData, "campusApplicabilityProof"),
    duplicateOfRowId: getString(formData, "duplicateOfRowId"),
    notes: getString(formData, "notes"),
  });

  revalidatePath("/usce/verified-preview/admin/review");
  revalidatePath(`/usce/verified-preview/admin/review/${reviewId}`);
  revalidatePath("/usce/verified-preview");
  redirect(`/usce/verified-preview/admin/review/${reviewId}?saved=1`);
}

/**
 * Rebuild + validate + sync chain. Runs the four scripts the reviewer
 * would otherwise run from the shell:
 *   - p102-build-approved-public-safe-export.ts
 *   - p102-validate-approved-public-safe-export.ts
 *   - p102-sync-approved-rows-to-website.ts
 *   - p102-validate-website-approved-usce-data.ts
 *
 * Outputs combined stdout/stderr into the redirect URL via a flash flag
 * (or into a query param — kept simple here).
 *
 * Throws if any step fails. The page surfaces the failure.
 */
export async function rebuildAndSyncExports(): Promise<void> {
  assertLocalOnly();

  const repoRoot = process.cwd();
  const runStep = (script: string): string => {
    const scriptPath = path.join(repoRoot, "scripts", script);
    const out = execFileSync("npx", ["tsx", scriptPath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return out;
  };

  let combined = "";
  try {
    combined += "$ p102-build-approved-public-safe-export\n";
    combined += runStep("p102-build-approved-public-safe-export.ts");
    combined += "\n$ p102-validate-approved-public-safe-export\n";
    combined += runStep("p102-validate-approved-public-safe-export.ts");
    combined += "\n$ p102-sync-approved-rows-to-website\n";
    combined += runStep("p102-sync-approved-rows-to-website.ts");
    combined += "\n$ p102-validate-website-approved-usce-data\n";
    combined += runStep("p102-validate-website-approved-usce-data.ts");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`rebuild step failed: ${msg}\n\nPartial output:\n${combined}`);
  }

  revalidatePath("/usce/verified-preview");
  revalidatePath("/usce/verified-preview/admin/review");
  redirect("/usce/verified-preview/admin/review?rebuilt=1");
}
