"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, LISTING_TYPE_LABELS } from "@/lib/utils";
import { List, Plus, Eye, FileText, Pencil, Pause, Play, Trash2 } from "lucide-react";

interface ListingItem {
  id: string;
  title: string;
  listingType: string;
  status: string;
  views: number;
  city: string;
  state: string;
  createdAt: string;
  _count: {
    applications: number;
    reviews: number;
  };
}

export default function PosterListingsPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchListings();
    }
  }, [session]);

  async function fetchListings() {
    try {
      const res = await fetch(
        `/api/organizations?ownerId=${session?.user?.id}`
      );
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      } else {
        // No org, fetch by poster ID via listings API with special param
        const res2 = await fetch("/api/poster-listings");
        if (res2.ok) {
          const data2 = await res2.json();
          setListings(data2);
        }
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
      }
    } catch {
      // handle silently
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    } catch {
      // handle silently
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your posted opportunities
          </p>
        </div>
        <Link href="/poster/listings/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <List className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No listings yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first listing to attract applicants
            </p>
            <Link href="/poster/listings/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4" />
                Create Listing
              </Button>
            </Link>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <CardRoot key={listing.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/poster/listings/${listing.id}/edit`}
                      className="text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {listing.title}
                    </Link>
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
                    <Badge
                      variant={
                        listing.status === "APPROVED"
                          ? "approved"
                          : listing.status === "PENDING"
                          ? "pending"
                          : listing.status === "REJECTED"
                          ? "rejected"
                          : "paused"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {listing._count.applications} applications
                    </span>
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Link href={`/poster/listings/${listing.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  {listing.status === "APPROVED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(listing.id, "PAUSED")}
                    >
                      <Pause className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {listing.status === "PAUSED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(listing.id, "APPROVED")}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(listing.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </CardRoot>
          ))}
        </div>
      )}
    </div>
  );
}
