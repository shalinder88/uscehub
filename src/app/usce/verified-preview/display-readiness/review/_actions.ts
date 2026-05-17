"use server";

import { revalidatePath } from "next/cache";
import {
  saveDecision,
  clearDecision,
  type DecisionType,
  type DecisionStatus,
} from "@/lib/p102-operator-review-decisions";

/**
 * Local-only operator review actions for /usce/verified-preview/
 * display-readiness/review. Each action throws in production — the
 * dashboard writes to a JSON file in the docs/ tree which is
 * appropriate for local review only.
 */
function assertLocalOnly(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "P102 operator review actions are local-only and disabled in production"
    );
  }
}

function getString(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function saveOperatorDecisionAction(
  _prevState: { message: string; ok: boolean } | null,
  formData: FormData
): Promise<{ message: string; ok: boolean }> {
  assertLocalOnly();
  const programName = getString(formData, "programName");
  const decisionType = getString(formData, "decisionType") as DecisionType;
  const decisionStatus = getString(formData, "decisionStatus") as DecisionStatus;
  const note = getString(formData, "note");

  if (!programName) {
    return { ok: false, message: "Missing programName." };
  }

  const result = saveDecision({ programName, decisionType, decisionStatus, note });
  if (!result.ok) {
    return { ok: false, message: result.error };
  }
  revalidatePath("/usce/verified-preview/display-readiness/review");
  return { ok: true, message: `Saved decision for ${programName}.` };
}

export async function clearOperatorDecisionAction(
  formData: FormData
): Promise<void> {
  assertLocalOnly();
  const programName = getString(formData, "programName");
  if (!programName) return;
  clearDecision(programName);
  revalidatePath("/usce/verified-preview/display-readiness/review");
}
