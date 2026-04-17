import { Resend } from "resend";

// ---------------------------------------------------------------------------
// Resend transactional email — reads from server-side env only.
// NOTIFY_TO (recipient) is NEVER exposed to the client or to public responses.
// ---------------------------------------------------------------------------

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  if (cachedClient) return cachedClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cachedClient = new Resend(key);
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
  const to = process.env.NOTIFY_TO;
  // Default to Resend's built-in test domain so setup works before the user
  // has verified their own domain. Swap to noreply@uscehub.com after DNS.
  const from = process.env.RESEND_FROM || "USCEHub <onboarding@resend.dev>";

  if (!client || !to) {
    console.warn("[email] Resend not configured; skipping listing notification");
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://uscehub.com";
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

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
