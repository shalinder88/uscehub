/**
 * P99-P97 Correction Intake — disabled-by-default route handler
 *
 * POST /api/usce/corrections
 *
 * Behavior:
 *   - Disabled by default. Set USCE_CORRECTION_INTAKE_ENABLED="true" to enable.
 *   - When disabled: returns 404 { ok: false, error: "not_available" }; no file writes.
 *   - When enabled + invalid payload: returns 400 { ok: false, error: "invalid_request" }.
 *   - When enabled + valid payload: writes queue item + audit event; returns 200 { ok: true, correction_id }.
 *   - Never echoes user_message, internal paths, evidence paths, forbidden field names, or which validator rule tripped.
 *   - GET / PUT / DELETE / etc. return 405.
 */

export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";

import { MAX_PAYLOAD_BYTES, isCorrectionIntakeEnabled } from "@/lib/usce-corrections/correction-intake-config";
import { writeCorrectionToQueue } from "@/lib/usce-corrections/correction-file-queue";
import { validateIntakePayload } from "@/lib/usce-corrections/correction-intake-validate";

function notAvailable(): Response {
  return Response.json({ ok: false, error: "not_available" }, { status: 404 });
}

function invalidRequest(): Response {
  return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
}

function methodNotAllowed(): Response {
  return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!isCorrectionIntakeEnabled()) {
    return notAvailable();
  }

  // Size gate using Content-Length when present.
  const lenHeader = request.headers.get("content-length");
  if (lenHeader) {
    const len = Number.parseInt(lenHeader, 10);
    if (Number.isFinite(len) && len > MAX_PAYLOAD_BYTES) {
      return invalidRequest();
    }
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_PAYLOAD_BYTES) {
      return invalidRequest();
    }
    raw = JSON.parse(text);
  } catch {
    return invalidRequest();
  }

  const validated = validateIntakePayload(raw);
  if (!validated.ok) {
    // Coarse-grained rejection. Do NOT echo which rule tripped.
    return invalidRequest();
  }

  let written;
  try {
    written = writeCorrectionToQueue(validated.payload);
  } catch {
    // Filesystem error — opaque response.
    return Response.json({ ok: false, error: "intake_failed" }, { status: 500 });
  }

  if (!written.ok) {
    // Only reachable if the env flag was disabled between checks (shouldn't happen).
    return notAvailable();
  }

  return Response.json({ ok: true, correction_id: written.correction_id }, { status: 200 });
}

export async function GET(): Promise<Response> {
  return methodNotAllowed();
}

export async function PUT(): Promise<Response> {
  return methodNotAllowed();
}

export async function DELETE(): Promise<Response> {
  return methodNotAllowed();
}

export async function PATCH(): Promise<Response> {
  return methodNotAllowed();
}
