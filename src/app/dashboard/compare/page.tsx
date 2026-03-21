"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LISTING_TYPE_LABELS } from "@/lib/utils";
import { GitCompareArrows, X, Check, Minus } from "lucide-react";

interface ComparedItem {
  id: string;
  listing: {
    id: string;
    title: string;
    listingType: string;
    specialty: string;
    city: string;
    state: string;
    duration: string;
    cost: string;
    certificateOffered: boolean;
    lorPossible: boolean;
    visaSupport: boolean;
  };
}

const comparisonFields = [
  { key: "listingType", label: "Type", format: (v: string) => LISTING_TYPE_LABELS[v] || v },
  { key: "specialty", label: "Specialty" },
  { key: "location", label: "Location", format: (_v: string, item: ComparedItem["listing"]) => `${item.city}, ${item.state}` },
  { key: "duration", label: "Duration" },
  { key: "cost", label: "Cost" },
  { key: "certificateOffered", label: "Certificate", boolean: true },
  { key: "lorPossible", label: "Letter of Rec.", boolean: true },
  { key: "visaSupport", label: "Visa Support", boolean: true },
];

export default function ComparePage() {
  const [compared, setCompared] = useState<ComparedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompared();
  }, []);

  async function fetchCompared() {
    try {
      const res = await fetch("/api/compared");
      if (res.ok) {
        const data = await res.json();
        setCompared(data);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(listingId: string) {
    try {
      const res = await fetch(`/api/compared?listingId=${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCompared((prev) => prev.filter((c) => c.listing.id !== listingId));
      }
    } catch {
      // handle silently
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading comparison...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compare Listings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Side-by-side comparison of your selected listings (max 3)
        </p>
      </div>

      {compared.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <GitCompareArrows className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No listings to compare
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add listings to your comparison list from the browse page
            </p>
            <Link href="/browse">
              <Button variant="outline" className="mt-4">
                Browse Listings
              </Button>
            </Link>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-40 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Field
                </th>
                {compared.map((item) => (
                  <th
                    key={item.id}
                    className="min-w-[200px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/listing/${item.listing.id}`}
                        className="text-sm font-semibold text-slate-900 hover:underline"
                      >
                        {item.listing.title}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.listing.id)}
                        className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field) => (
                <tr key={field.key}>
                  <td className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                    {field.label}
                  </td>
                  {compared.map((item) => (
                    <td
                      key={item.id}
                      className="border-b border-slate-100 px-4 py-3 text-sm text-slate-900"
                    >
                      {field.boolean ? (
                        (item.listing as Record<string, unknown>)[field.key] ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Minus className="h-4 w-4 text-slate-300" />
                        )
                      ) : field.format ? (
                        field.format(
                          String((item.listing as Record<string, unknown>)[field.key] || ""),
                          item.listing
                        )
                      ) : field.key === "listingType" ? (
                        <Badge
                          variant={
                            item.listing.listingType.toLowerCase() as
                              | "observership"
                              | "externship"
                              | "research"
                          }
                        >
                          {LISTING_TYPE_LABELS[item.listing.listingType] ||
                            item.listing.listingType}
                        </Badge>
                      ) : (
                        String((item.listing as Record<string, unknown>)[field.key] || "-")
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
