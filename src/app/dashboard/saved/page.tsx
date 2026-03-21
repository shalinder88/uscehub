"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, LISTING_TYPE_LABELS } from "@/lib/utils";
import { Bookmark, MapPin, ExternalLink } from "lucide-react";

interface SavedItem {
  id: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    listingType: string;
    specialty: string;
    city: string;
    state: string;
    duration: string;
    cost: string;
    organization?: {
      id: string;
      name: string;
    } | null;
    _count: {
      reviews: number;
    };
  };
}

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSaved();
  }, []);

  async function fetchSaved() {
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const data = await res.json();
        setSaved(data);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsave(listingId: string) {
    setRemovingId(listingId);
    try {
      const res = await fetch(`/api/saved?listingId=${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSaved((prev) => prev.filter((s) => s.listing.id !== listingId));
      }
    } catch {
      // handle silently
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading saved listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Listings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Listings you&apos;ve bookmarked for later
        </p>
      </div>

      {saved.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <Bookmark className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No saved listings
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Browse opportunities and save ones you&apos;re interested in
            </p>
            <Link href="/browse">
              <Button variant="outline" className="mt-4">
                Browse Listings
              </Button>
            </Link>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {saved.map((item) => (
            <CardRoot key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/listing/${item.listing.id}`}
                      className="text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {item.listing.title}
                    </Link>
                    <Badge
                      variant={
                        item.listing.listingType.toLowerCase() as
                          | "observership"
                          | "externship"
                          | "research"
                          | "postdoc"
                          | "elective"
                          | "volunteer"
                      }
                    >
                      {LISTING_TYPE_LABELS[item.listing.listingType] ||
                        item.listing.listingType}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {item.listing.organization && (
                      <span>{item.listing.organization.name}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.listing.city}, {item.listing.state}
                    </span>
                    <span>{item.listing.specialty}</span>
                    <span>{item.listing.duration}</span>
                    <span>{item.listing.cost}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Saved {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/listing/${item.listing.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnsave(item.listing.id)}
                    disabled={removingId === item.listing.id}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {removingId === item.listing.id ? "Removing..." : "Unsave"}
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
