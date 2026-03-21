"use client";

import { useState, useEffect } from "react";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

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
  user: {
    id: string;
    name: string;
  };
  listing: {
    id: string;
    title: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch("/api/admin/reviews");
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

  async function handleAction(reviewId: string, action: string) {
    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "approve" ? "approve_review" : "reject_review",
          targetId: reviewId,
        }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  moderationStatus:
                    action === "approve" ? "APPROVED" : "REJECTED",
                }
              : r
          )
        );
      }
    } catch {
      // handle silently
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading reviews...</p>
      </div>
    );
  }

  const pendingReviews = reviews.filter(
    (r) => r.moderationStatus === "PENDING"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Pending Reviews
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Moderate user-submitted reviews
        </p>
      </div>

      {pendingReviews.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <Star className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No pending reviews
            </p>
            <p className="mt-1 text-sm text-slate-500">
              All reviews have been moderated
            </p>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {pendingReviews.map((review) => (
            <CardRoot key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {review.listing.title}
                    </p>
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
                    <p className="mt-1 text-xs text-slate-500">
                      By: {review.anonymous ? "Anonymous" : review.user.name}
                    </p>
                    {review.comment && (
                      <p className="mt-2 text-sm text-slate-600">
                        {review.comment}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={review.wasReal ? "success" : "warning"}>
                        {review.wasReal ? "Real" : "Not Real"}
                      </Badge>
                      <Badge
                        variant={review.worthCost ? "success" : "warning"}
                      >
                        {review.worthCost ? "Worth Cost" : "Not Worth"}
                      </Badge>
                      <Badge
                        variant={review.wouldRecommend ? "success" : "warning"}
                      >
                        {review.wouldRecommend ? "Recommends" : "No Recommend"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Submitted {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={actionLoading === review.id}
                      onClick={() => handleAction(review.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionLoading === review.id}
                      onClick={() => handleAction(review.id, "reject")}
                    >
                      Reject
                    </Button>
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
