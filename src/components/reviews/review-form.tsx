"use client";

import { useState } from "react";
import { CardRoot, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface ReviewFormProps {
  listingId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ listingId, onSuccess }: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wasReal, setWasReal] = useState<boolean | null>(null);
  const [worthCost, setWorthCost] = useState<boolean | null>(null);
  const [actualExposure, setActualExposure] = useState(3);
  const [hoverExposure, setHoverExposure] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (overallRating === 0) {
      setError("Please select an overall rating.");
      return;
    }

    if (wasReal === null || worthCost === null || wouldRecommend === null) {
      setError("Please answer all yes/no questions.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          overallRating,
          wasReal,
          worthCost,
          actualExposure,
          wouldRecommend,
          comment: comment.trim() || null,
          anonymous,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        onSuccess?.();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit review.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <CardRoot>
        <CardContent className="flex flex-col items-center py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Star className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Review submitted!
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Your review is pending moderation and will be published after
            approval.
          </p>
        </CardContent>
      </CardRoot>
    );
  }

  return (
    <CardRoot>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience to help other medical graduates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Overall Rating *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setOverallRating(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || overallRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
              {overallRating > 0 && (
                <span className="ml-2 text-sm text-slate-500">
                  {overallRating}/5
                </span>
              )}
            </div>
          </div>

          {/* Yes/No Questions */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Was this a real clinical experience? *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWasReal(true)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    wasReal === true
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWasReal(false)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    wasReal === false
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Was it worth the cost? *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWorthCost(true)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    worthCost === true
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWorthCost(false)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    worthCost === false
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Would you recommend this to others? *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    wouldRecommend === true
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    wouldRecommend === false
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Actual Exposure Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Actual Clinical Exposure (1-5)
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverExposure(star)}
                  onMouseLeave={() => setHoverExposure(0)}
                  onClick={() => setActualExposure(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverExposure || actualExposure)
                        ? "fill-blue-400 text-blue-400"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-500">
                {actualExposure}/5
              </span>
            </div>
          </div>

          {/* Comment */}
          <Textarea
            id="comment"
            label="Your Review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your detailed experience: what did you learn, how was the supervision, what could be improved..."
            rows={4}
          />

          {/* Anonymous */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <span className="text-sm text-slate-600">
              Post anonymously (your name will not be shown)
            </span>
          </label>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </CardRoot>
  );
}
