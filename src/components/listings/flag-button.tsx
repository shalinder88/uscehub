"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

type Props = { listingId: string };

// UI category → server-side FlagKind enum. Sent on the wire so the
// admin queue (and any future filtering) can see the structured kind
// instead of falling back to OTHER. The /api/flags route still
// validates the kind against its allowlist, so an unexpected value
// is harmless.
const CATEGORIES: ReadonlyArray<{
  value: string;
  label: string;
  kind: "INCORRECT_INFO" | "BROKEN_LINK" | "SPAM" | "DUPLICATE" | "OTHER";
}> = [
  { value: "inaccurate", label: "Incorrect or outdated info", kind: "INCORRECT_INFO" },
  { value: "dead_link", label: "Link is dead or wrong page", kind: "BROKEN_LINK" },
  { value: "spam", label: "Looks like spam or fake", kind: "SPAM" },
  { value: "duplicate", label: "Duplicate of another listing", kind: "DUPLICATE" },
  { value: "other", label: "Other", kind: "OTHER" },
];

export function FlagButton({ listingId }: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("inaccurate");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      setMessage("Please sign in to report an issue.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const selected = CATEGORIES.find((c) => c.value === category);
      const fullReason = `[${selected?.label || category}] ${reason}`.trim();
      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "listing",
          targetId: listingId,
          reason: fullReason,
          kind: selected?.kind ?? "OTHER",
        }),
      });
      if (res.ok) {
        setMessage("Thanks — report sent. Admin will review.");
        setReason("");
        setTimeout(() => {
          setOpen(false);
          setMessage(null);
        }, 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || "Could not submit report.");
      }
    } catch {
      setMessage("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <Flag className="h-3 w-3" />
        Report issue
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white dark:bg-slate-900 p-5 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Report an issue with this listing</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Tell admin what&apos;s wrong. They review every report.
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Issue type</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-slate-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Details</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            minLength={5}
            maxLength={2000}
            required
            placeholder="What's wrong, and how did you find out?"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button type="submit" disabled={submitting || reason.length < 5}>
            {submitting ? "Sending…" : "Send report"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          {message && <p className="ml-2 text-xs text-slate-600 dark:text-slate-400">{message}</p>}
        </div>
      </form>
    </div>
  );
}
