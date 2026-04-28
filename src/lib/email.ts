import { Resend } from "resend";
import { getResendConfig, getSiteUrlFromEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site-config";

// ---------------------------------------------------------------------------
// Resend transactional email — reads from server-side env only.
// NOTIFY_TO (recipient) is NEVER exposed to the client or to public responses.
// All env reads now flow through src/lib/env.ts (cleanup PR3).
// ---------------------------------------------------------------------------

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  if (cachedClient) return cachedClient;
  const { apiKey } = getResendConfig();
  if (!apiKey) return null;
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

export type ListingNotificationPayload = {
  listingId: string;
  title: string;
  listingType: string;
  city: string;
  state: string;
  submitterEmail: string;
  submitterName?: string | null;
};

export async function sendListingNotification(
  payload: ListingNotificationPayload
): Promise<void> {
  const client = getClient();
  const { from, notifyTo: to } = getResendConfig();

  if (!client || !to) {
    console.warn("[email] Resend not configured; skipping listing notification");
    return;
  }

  const baseUrl = getSiteUrlFromEnv(SITE_URL);
  const reviewUrl = `${baseUrl}/admin/listings`;

  const subject = `[USCEHub] New listing pending review: ${payload.title}`;

  const text = [
    `A new listing is waiting for review.`,
    ``,
    `Title:      ${payload.title}`,
    `Type:       ${payload.listingType}`,
    `Location:   ${payload.city}, ${payload.state}`,
    `Submitter:  ${payload.submitterName || "(no name)"} <${payload.submitterEmail}>`,
    ``,
    `Review it here: ${reviewUrl}`,
    ``,
    `-- USCEHub automated notification`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px;">
      <h2 style="margin:0 0 16px;">New listing pending review</h2>
      <table style="border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Title</td><td><strong>${escapeHtml(payload.title)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Type</td><td>${escapeHtml(payload.listingType)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Location</td><td>${escapeHtml(payload.city)}, ${escapeHtml(payload.state)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Submitter</td><td>${escapeHtml(payload.submitterName || "(no name)")} &lt;${escapeHtml(payload.submitterEmail)}&gt;</td></tr>
      </table>
      <p style="margin-top:20px;">
        <a href="${reviewUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Review in admin</a>
      </p>
      <p style="color:#888;font-size:12px;margin-top:24px;">Listing ID: ${escapeHtml(payload.listingId)}</p>
    </div>
  `;

  const { error } = await client.emails.send({
    from,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
  }
}

// ---------------------------------------------------------------------------
// Generic admin notification — used for new review, flag, contact message
// ---------------------------------------------------------------------------
export type AdminNotificationPayload = {
  kind: "review" | "flag" | "contact";
  subjectLine: string;
  fromUserEmail?: string | null;
  fromUserName?: string | null;
  contextLines: Array<{ label: string; value: string }>;
  body?: string;
  reviewUrl: string;
};

export async function sendAdminNotification(
  p: AdminNotificationPayload
): Promise<void> {
  const client = getClient();
  const { from, notifyTo: to } = getResendConfig();

  if (!client || !to) {
    console.warn(`[email] Resend not configured; skipping ${p.kind} notification`);
    return;
  }

  const subject = `[USCEHub] ${p.subjectLine}`;
  const text = [
    `New ${p.kind} in USCEHub.`,
    ``,
    ...p.contextLines.map((c) => `${c.label.padEnd(12)} ${c.value}`),
    p.fromUserEmail ? `From:        ${p.fromUserName || "(anon)"} <${p.fromUserEmail}>` : "",
    p.body ? `\nMessage:\n${p.body}` : "",
    ``,
    `Review: ${p.reviewUrl}`,
  ].filter(Boolean).join("\n");

  const ctxRows = p.contextLines
    .map((c) => `<tr><td style="padding:4px 12px 4px 0;color:#666;">${escapeHtml(c.label)}</td><td>${escapeHtml(c.value)}</td></tr>`)
    .join("");
  const fromRow = p.fromUserEmail
    ? `<tr><td style="padding:4px 12px 4px 0;color:#666;">From</td><td>${escapeHtml(p.fromUserName || "(anon)")} &lt;${escapeHtml(p.fromUserEmail)}&gt;</td></tr>`
    : "";
  const bodyBlock = p.body
    ? `<div style="margin-top:16px;padding:12px;background:#f6f8fa;border-radius:6px;white-space:pre-wrap;font-size:14px;">${escapeHtml(p.body)}</div>`
    : "";
  const html = `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px;">
      <h2 style="margin:0 0 16px;">New ${escapeHtml(p.kind)} in USCEHub</h2>
      <table style="border-collapse:collapse;font-size:14px;">${ctxRows}${fromRow}</table>
      ${bodyBlock}
      <p style="margin-top:20px;">
        <a href="${p.reviewUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Review in admin</a>
      </p>
    </div>
  `;

  const { error } = await client.emails.send({ from, to, subject, text, html });
  if (error) throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
