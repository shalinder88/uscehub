"use client";

import { useState, useEffect } from "react";
import { Check, X, ArrowRight, GitCompareArrows } from "lucide-react";
import Link from "next/link";

interface ListingOption {
  id: string;
  title: string;
  city: string;
  state: string;
}

interface ComparedListing {
  id: string;
  title: string;
  listingType: string;
  specialty: string;
  city: string;
  state: string;
  duration: string;
  cost: string;
  format: string;
  certificateOffered: boolean;
  lorPossible: boolean;
  visaSupport: boolean;
  linkVerified: boolean;
  shortDescription: string;
  applicationMethod: string;
  startDate: string | null;
  applicationDeadline: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  OBSERVERSHIP: "Observership",
  EXTERNSHIP: "Externship",
  RESEARCH: "Research",
  POSTDOC: "Postdoc",
  ELECTIVE: "Elective",
  VOLUNTEER: "Volunteer",
};

const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "In Person",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto h-4 w-4 text-emerald-600" />
  ) : (
    <X className="mx-auto h-4 w-4 text-slate-300" />
  );
}

export default function CompareClient() {
  const [allListings, setAllListings] = useState<ListingOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(["", ""]);
  const [compared, setCompared] = useState<ComparedListing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/listings?limit=500")
      .then((r) => r.json())
      .then((data) => {
        const listings = data.listings || data;
        if (Array.isArray(listings)) {
          setAllListings(
            listings.map((l: ListingOption) => ({
              id: l.id,
              title: l.title,
              city: l.city,
              state: l.state,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = (index: number, id: string) => {
    const next = [...selectedIds];
    next[index] = id;
    setSelectedIds(next);
  };

  const addSlot = () => {
    if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, ""]);
    }
  };

  const removeSlot = (index: number) => {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.filter((_, i) => i !== index));
    }
  };

  const handleCompare = async () => {
    const ids = selectedIds.filter(Boolean);
    if (ids.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/compare?ids=${ids.join(",")}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompared(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const rows: { label: string; render: (l: ComparedListing) => React.ReactNode }[] = [
    { label: "Type", render: (l) => TYPE_LABELS[l.listingType] || l.listingType },
    { label: "Specialty", render: (l) => l.specialty },
    { label: "Location", render: (l) => `${l.city}, ${l.state}` },
    { label: "Duration", render: (l) => l.duration },
    { label: "Cost", render: (l) => l.cost },
    { label: "Format", render: (l) => FORMAT_LABELS[l.format] || l.format },
    { label: "Certificate", render: (l) => <BoolCell value={l.certificateOffered} /> },
    { label: "Visa Support", render: (l) => <BoolCell value={l.visaSupport} /> },
    { label: "Verified", render: (l) => <BoolCell value={l.linkVerified} /> },
    { label: "Application", render: (l) => l.applicationMethod === "platform" ? "Via Platform" : "External" },
    { label: "Start Date", render: (l) => l.startDate || "—" },
    { label: "Deadline", render: (l) => l.applicationDeadline || "—" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Compare Programs</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select 2-3 programs to compare side by side
          </p>
        </div>

        {/* Selection */}
        <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            {selectedIds.map((id, i) => (
              <div key={i} className="min-w-[200px] flex-1">
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Program {i + 1}
                </label>
                <div className="flex gap-1">
                  <select
                    value={id}
                    onChange={(e) => handleSelect(i, e.target.value)}
                    className="flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white dark:bg-slate-900 px-3 py-2 pr-8 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Select a program...</option>
                    {allListings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} — {l.city}, {l.state}
                      </option>
                    ))}
                  </select>
                  {selectedIds.length > 2 && (
                    <button
                      onClick={() => removeSlot(i)}
                      className="shrink-0 rounded-lg px-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {selectedIds.length < 3 && (
              <button
                onClick={addSlot}
                className="h-10 rounded-lg border border-dashed border-slate-300 px-4 text-sm text-slate-500 dark:text-slate-400 hover:border-slate-400 hover:text-slate-700 dark:text-slate-300"
              >
                + Add
              </button>
            )}
            <button
              onClick={handleCompare}
              disabled={selectedIds.filter(Boolean).length < 2 || loading}
              className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40"
            >
              {loading ? "Loading..." : "Compare"}
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        {compared.length >= 2 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Attribute
                  </th>
                  {compared.map((l) => (
                    <th key={l.id} className="px-4 py-3 text-center">
                      <Link
                        href={`/listing/${l.id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {l.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50"}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {row.label}
                    </td>
                    {compared.map((l) => (
                      <td
                        key={l.id}
                        className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300"
                      >
                        {row.render(l)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400">Details</td>
                  {compared.map((l) => (
                    <td key={l.id} className="px-4 py-3 text-center">
                      <Link
                        href={`/listing/${l.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile stacked view */}
        {compared.length >= 2 && (
          <div className="mt-6 space-y-4 sm:hidden">
            {compared.map((l) => (
              <div key={l.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                <Link href={`/listing/${l.id}`} className="font-semibold text-blue-600 hover:text-blue-700">
                  {l.title}
                </Link>
                <dl className="mt-3 space-y-2 text-sm">
                  {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <dt className="text-xs text-slate-500 dark:text-slate-400">{row.label}</dt>
                      <dd className="text-slate-700 dark:text-slate-300">{row.render(l)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
