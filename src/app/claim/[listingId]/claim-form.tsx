"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function ClaimForm({ listingId, defaultName }: { listingId: string; defaultName: string }) {
  const [contactName, setContactName] = useState(defaultName);
  const [institutionName, setInstitutionName] = useState("");
  const [institutionEmail, setInstitutionEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const inputStyle = { background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" } as const;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, contactName, institutionName, institutionEmail, title, message }),
      });
      const data = await res.json();
      if (res.ok) setDone(true);
      else setError(data.error ?? "Failed to submit claim");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
        <CheckCircle2 className="mx-auto h-10 w-10" style={{ color: "var(--teal)" }} />
        <h2 className="mt-3 text-xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>Claim submitted</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "var(--ink-soft)" }}>
          Our team will review your institutional email and confirm your
          affiliation. You&apos;ll get access to manage this program once approved.
        </p>
      </div>
    );
  }

  const canSubmit = contactName.trim() && institutionName.trim() && institutionEmail.trim();

  return (
    <div className="space-y-4">
      <Field label="Your name">
        <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
      </Field>
      <Field label="Institution name">
        <input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="e.g. Riverside Medical Center" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
      </Field>
      <Field label="Institutional email" hint="Use your @institution email — it's how we confirm affiliation.">
        <input value={institutionEmail} onChange={(e) => setInstitutionEmail(e.target.value)} placeholder="you@institution.org" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
      </Field>
      <Field label="Your title (optional)">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. GME Program Coordinator" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
      </Field>
      <Field label="Anything to add? (optional)">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
      </Field>

      {error && <p className="text-sm" style={{ color: "#b91c1c" }}>{error}</p>}

      <button onClick={submit} disabled={busy || !canSubmit} className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--teal)" }}>
        {busy ? "Submitting…" : "Submit claim for review"}
      </button>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" style={{ color: "var(--ink)" }}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}
