"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert } from "lucide-react";

export interface ClaimRow {
  id: string;
  contactName: string;
  institutionName: string;
  institutionEmail: string;
  title: string | null;
  message: string | null;
  domainMatch: boolean;
  claimantName: string;
  claimantEmail: string;
  listingTitle: string | null;
  orgName: string | null;
  createdAt: string;
}

export function ClaimsReview({ claims: initial }: { claims: ClaimRow[] }) {
  const [claims, setClaims] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/claims/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) setClaims((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (claims.length === 0) {
    return <p className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">No pending claims.</p>;
  }

  return (
    <div className="space-y-4">
      {claims.map((c) => (
        <div key={c.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">{c.institutionName}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {c.contactName}{c.title ? ` · ${c.title}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {c.institutionEmail}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                c.domainMatch
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {c.domainMatch ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              {c.domainMatch ? "Email domain matches website" : "Domain does not match — verify manually"}
            </span>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            <Row label="Claiming" value={c.listingTitle ?? c.orgName ?? "—"} />
            <Row label="Signed-in account" value={`${c.claimantName} (${c.claimantEmail})`} />
            <Row label="Submitted" value={c.createdAt.slice(0, 10)} />
          </dl>

          {c.message && (
            <p className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-600 dark:text-slate-300">“{c.message}”</p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => review(c.id, "approve")}
              disabled={busyId === c.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve & grant access
            </button>
            <button
              onClick={() => review(c.id, "reject")}
              disabled={busyId === c.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  );
}
