"use client";

import { useState, useEffect } from "react";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";
import Link from "next/link";

interface ReviewItem {
  id: string;
  overallRating: number;
  wasReal: boolean;
  worthCost: boolean;
  wouldRecommend: boolean;
  comment: string | null;
  anonymous: boolean;
  moderationStatus: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
  };
}

function getModerationVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "approved" as const;
    case "REJECTED":
      return "rejected" as const;
    case "PENDING":
      return "pending" as const;
    default:
      return "default" as const;
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch("/api/my-reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Reviews</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reviews you&apos;ve written for programs
        </p>
      </div>

      {reviews.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <Star className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No reviews yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Share your experience to help other IMGs
            </p>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <CardRoot key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/listing/${review.listing.id}`}
                      className="text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {review.listing.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.overallRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-slate-500">
                        {review.overallRating}/5
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-slate-600">
                        {review.comment}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {/*
                       * PR 0d audit H2: `wasReal` / `worthCost` /
                       * `wouldRecommend` chips removed — the live review
                       * form (src/components/listings/review-form.tsx) does
                       * not collect those fields, so the API silently
                       * defaults them to true. Rendering them as
                       * user-affirmed claims was misleading.
                       */}
                      {review.anonymous && (
                        <Badge variant="default">Anonymous</Badge>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-1">
                    <Badge variant={getModerationVariant(review.moderationStatus)}>
                      {review.moderationStatus}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </CardRoot>
          ))}
        </div>
      )}
    </div>
  );
}
