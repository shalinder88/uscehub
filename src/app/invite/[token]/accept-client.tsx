"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function AcceptInvite({
  token,
  invitedEmail,
  signedInEmail,
  roleLabel,
}: {
  token: string;
  invitedEmail: string;
  signedInEmail: string;
  roleLabel: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mismatch =
    !!signedInEmail && signedInEmail.toLowerCase() !== invitedEmail.toLowerCase();

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/poster"), 900);
      } else {
        setError(data.error ?? "Could not accept the invitation");
      }
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div>
        <CheckCircle2 className="mx-auto h-9 w-9" style={{ color: "var(--teal)" }} />
        <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
          You&apos;re in — taking you to the dashboard…
        </p>
      </div>
    );
  }

  if (mismatch) {
    return (
      <div className="rounded-xl p-4 text-sm" style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>
        This invitation was sent to <strong>{invitedEmail}</strong>, but you&apos;re
        signed in as <strong>{signedInEmail}</strong>. Sign in with the invited
        address to accept.
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={accept}
        disabled={busy}
        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--teal)" }}
      >
        {busy ? "Joining…" : `Accept as ${roleLabel}`}
      </button>
      {error && <p className="mt-3 text-sm" style={{ color: "#b91c1c" }}>{error}</p>}
    </div>
  );
}
