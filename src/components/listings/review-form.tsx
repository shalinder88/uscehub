"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

type Props = { listingId: string };

export function ReviewForm({ listingId }: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-400">
        <a href="/auth/signin" className="font-medium text-blue-600 hover:underline">
          Sign in
        </a>{" "}
        to leave a review of this program.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          overallRating,
          wouldRecommend,
          comment: comment.trim() || null,
          anonymous,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Thanks — your review was submitted and is waiting for admin approval before it shows publicly.");
        setComment("");
        setOpen(false);
      } else {
        setMessage(data.error || "Could not submit review.");
      }
    } catch {
      setMessage("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          Completed this program?{" "}
          <span className="text-slate-500 dark:text-slate-400">Share what it was actually like.</span>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>Write a review</Button>
        {message && <p className="ml-3 text-xs text-emerald-600">{message}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Overall rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setOverallRating(n)}
              className="p-1"
              aria-label={`${n} star`}
            >
              <Star className={`h-6 w-6 ${n <= overallRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Would you recommend this program?</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="radio" checked={wouldRecommend} onChange={() => setWouldRecommend(true)} /> Yes
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="radio" checked={!wouldRecommend} onChange={() => setWouldRecommend(false)} /> No
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">What was your experience?</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What worked, what didn't, and what should other IMGs know."
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
        Post anonymously (your name will not show)
      </label>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        All reviews are reviewed by our admin before they appear publicly.
      </p>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for review"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
          Cancel
        </Button>
        {message && <p className="ml-2 text-xs text-red-600">{message}</p>}
      </div>
    </form>
  );
}
