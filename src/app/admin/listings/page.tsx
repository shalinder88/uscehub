"use client";

import { useState, useEffect } from "react";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, LISTING_TYPE_LABELS } from "@/lib/utils";
import { List, MapPin } from "lucide-react";

interface ListingItem {
  id: string;
  title: string;
  listingType: string;
  specialty: string;
  city: string;
  state: string;
  status: string;
  createdAt: string;
  poster: {
    id: string;
    name: string;
  };
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      const res = await fetch("/api/admin/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(listingId: string, action: string) {
    setActionLoading(listingId);
    try {
      const actionMap: Record<string, string> = {
        approve: "approve_listing",
        reject: "reject_listing",
        hide: "hide_listing",
      };

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionMap[action],
          targetId: listingId,
        }),
      });

      if (res.ok) {
        const statusMap: Record<string, string> = {
          approve: "APPROVED",
          reject: "REJECTED",
          hide: "HIDDEN",
        };
        setListings((prev) =>
          prev.map((l) =>
            l.id === listingId ? { ...l, status: statusMap[action] } : l
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
        <p className="text-sm text-slate-500">Loading pending listings...</p>
      </div>
    );
  }

  const pendingListings = listings.filter((l) => l.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Pending Listings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and approve new listing submissions
        </p>
      </div>

      {pendingListings.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <List className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No pending listings
            </p>
            <p className="mt-1 text-sm text-slate-500">
              All listings have been reviewed
            </p>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {pendingListings.map((listing) => (
            <CardRoot key={listing.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {listing.title}
                      </span>
                      <Badge
                        variant={
                          listing.listingType.toLowerCase() as
                            | "observership"
                            | "externship"
                            | "research"
                        }
                      >
                        {LISTING_TYPE_LABELS[listing.listingType] ||
                          listing.listingType}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>By: {listing.poster.name}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {listing.city}, {listing.state}
                      </span>
                      <span>{listing.specialty}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Submitted {formatDate(listing.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={actionLoading === listing.id}
                      onClick={() => handleAction(listing.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionLoading === listing.id}
                      onClick={() => handleAction(listing.id, "reject")}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoading === listing.id}
                      onClick={() => handleAction(listing.id, "hide")}
                    >
                      Hide
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
