"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CATEGORIES = [
  { value: "general", label: "General question" },
  { value: "feedback", label: "Feedback / suggestion" },
  { value: "grievance", label: "Complaint / grievance" },
  { value: "bug", label: "Bug report" },
  { value: "data", label: "Data correction" },
  // Coordinator-facing intents. AdminMessage.category is a free
  // string, so adding values here costs nothing on the backend; the
  // admin queue lists the category as-is.
  { value: "institution_update", label: "Institution / program update" },
  { value: "removal_request", label: "Request listing removal or review" },
  { value: "source_update", label: "Official source URL changed" },
  { value: "coordinator_correction", label: "Coordinator correction" },
  { value: "partnership", label: "Partnership / collaboration" },
];

const VALID_CATEGORY_VALUES = new Set(CATEGORIES.map((c) => c.value));

const INSTITUTION_FACING_CATEGORIES = new Set([
  "institution_update",
  "removal_request",
  "source_update",
  "coordinator_correction",
]);

export default function ContactAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl p-6 text-sm text-slate-600 dark:text-slate-400">
          Loading…
        </div>
      }
    >
      <ContactAdminForm />
    </Suspense>
  );
}

function ContactAdminForm() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  // Prefill from URL on first mount. Used by the listing detail
  // "Suggest a correction" link and by /for-institutions coordinator
  // CTAs. Server validates again, so untrusted query strings are safe.
  useEffect(() => {
    const qpCategory = searchParams.get("category");
    if (qpCategory && VALID_CATEGORY_VALUES.has(qpCategory)) {
      setCategory(qpCategory);
    }
    const qpSubject = searchParams.get("subject");
    if (qpSubject && qpSubject.length > 0 && qpSubject.length <= 200) {
      setSubject(qpSubject);
    }
    // Intentionally only on first mount — subsequent edits are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return <div className="mx-auto max-w-2xl p-6 text-sm text-slate-600 dark:text-slate-400">Loading…</div>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Contact Admin</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Please{" "}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            sign in
          </Link>{" "}
          to send a message.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject: subject.trim(), body: message.trim() }),
      });
      if (res.ok) {
        setResult({ ok: true, text: "Thanks — your message is in the admin queue. Expect a reply to your sign-in email." });
        setSubject("");
        setMessage("");
      } else {
        const data = await res.json().catch(() => ({}));
        setResult({ ok: false, text: data.error || "Could not send message." });
      }
    } catch {
      setResult({ ok: false, text: "Network error. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Contact Admin</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Send a private message to USCEHub&apos;s administrator. Use this for feedback,
        grievances, data corrections, or anything you want us to know.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-slate-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {INSTITUTION_FACING_CATEGORIES.has(category) && (
            <p className="mt-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              USCEHub does not represent the institutions listed on this site. We
              link applicants to official sources when available. Correction,
              update, and removal requests are reviewed before any public change
              — we do not guarantee a response time.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
            placeholder="Short summary"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
            maxLength={5000}
            rows={8}
            placeholder="What do you want the admin to know?"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-slate-100"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Sent from: {session.user.name || "(no name)"} — {session.user.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting || subject.length === 0 || message.length < 10}>
            {submitting ? "Sending…" : "Send message"}
          </Button>
          {result && (
            <p className={`text-sm ${result.ok ? "text-emerald-600" : "text-red-600"}`}>{result.text}</p>
          )}
        </div>
      </form>
    </div>
  );
}
