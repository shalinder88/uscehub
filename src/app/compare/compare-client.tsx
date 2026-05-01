"use client";

import { useState, useEffect } from "react";
import { Check, X, ArrowRight, GitCompareArrows } from "lucide-react";
import Link from "next/link";
import { ListingVerificationBadge } from "@/components/listings/listing-verification-badge";
import { listingVerificationStatus } from "@/lib/listing-display";

type LinkVerificationStatusInput =
  | "VERIFIED"
  | "REVERIFYING"
  | "NEEDS_MANUAL_REVIEW"
  | "SOURCE_DEAD"
  | "PROGRAM_CLOSED"
  | "NO_OFFICIAL_SOURCE"
  | "UNKNOWN";

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
  /**
   * Phase 3.5b: real verification fields. Optional because the legacy
   * `linkVerified` Boolean is the back-compat fallback when the enum or
   * timestamp are absent.
   */
  linkVerificationStatus?: LinkVerificationStatusInput | null;
  lastVerifiedAt?: string | null;
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
    <Check className="mx-auto h-4 w-4 text-[#1a5454] dark:text-[#0fa595]" />
  ) : (
    <X className="mx-auto h-4 w-4 text-[#dfd5b8] dark:text-[#34373f]" />
  );
}

/**
 * Phase 3.5b: compare-table verification cell. Renders the real
 * `ListingVerificationBadge` for verified / verified-on-file /
 * reverifying / needs-review states, and a neutral "—" for the soft
 * "unverified" bucket (UNKNOWN, admin-only states, false legacy
 * Boolean) — matches the conservative-no-clutter rule on listing
 * cards.
 */
function VerificationCell({ listing }: { listing: ComparedListing }) {
  const status = listingVerificationStatus({
    linkVerified: listing.linkVerified,
    linkVerificationStatus: listing.linkVerificationStatus,
    lastVerifiedAt: listing.lastVerifiedAt,
  });
  if (status === "unverified") {
    return <X className="mx-auto h-4 w-4 text-[#dfd5b8] dark:text-[#34373f]" aria-label="Source not yet verified" />;
  }
  return (
    <div className="flex justify-center">
      <ListingVerificationBadge status={status} />
    </div>
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
    { label: "Verified", render: (l) => <VerificationCell listing={l} /> },
    // PR 0c audit: the "platform" applicationMethod branch is unreachable
    // (no <ApplyForm /> exists; the listing-detail CTA always exits to
    // websiteUrl or mailto). The DB column is informational only — display
    // a neutral label here rather than implying a platform-tracked
    // application flow.
    { label: "Application", render: () => "Via institution" },
    { label: "Start Date", render: (l) => l.startDate || "—" },
    { label: "Deadline", render: (l) => l.applicationDeadline || "—" },
  ];

  const SERIF =
    "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

  return (
    <div className="min-h-screen">
      <div className="border-b border-[#dfd5b8] dark:border-[#34373f]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
            — Side by side —
          </p>
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-[#1a5454] dark:text-[#0fa595]" />
            <h1
              className="font-serif text-3xl font-normal text-[#0d1418] dark:text-[#f7f5ec] sm:text-[36px]"
              style={{ fontFamily: SERIF, letterSpacing: "-0.022em" }}
            >
              Compare <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">programs</em>
            </h1>
          </div>
          <p
            className="mt-1 text-sm italic text-[#4a5057] dark:text-[#bfc1c9]"
            style={{ fontFamily: SERIF }}
          >
            Pick 2&ndash;3 programs to set them side by side. Source-linked fields where available.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Selection */}
        <div className="mb-6 rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-5 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
          <div className="flex flex-wrap items-end gap-3">
            {selectedIds.map((id, i) => (
              <div key={i} className="min-w-[200px] flex-1">
                <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a7f88] dark:text-[#7e8089]">
                  Program {i + 1}
                </label>
                <div className="flex gap-1">
                  <select
                    value={id}
                    onChange={(e) => handleSelect(i, e.target.value)}
                    className="flex h-10 w-full appearance-none rounded-lg border border-[#dfd5b8] bg-[#faf6e8] px-3 py-2 pr-8 text-sm text-[#0d1418] focus:border-[#a87b2e] focus:outline-none dark:border-[#34373f] dark:bg-[#1d1f26] dark:text-[#f7f5ec] dark:focus:border-[#d8a978]"
                  >
                    <option value="">Select a program…</option>
                    {allListings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} — {l.city}, {l.state}
                      </option>
                    ))}
                  </select>
                  {selectedIds.length > 2 && (
                    <button
                      onClick={() => removeSlot(i)}
                      className="shrink-0 rounded-lg px-2 text-[#7a7f88] hover:text-[#0d1418] dark:hover:text-[#f7f5ec]"
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
                className="h-10 rounded-lg border border-dashed border-[#dfd5b8] px-4 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#7a7f88] hover:border-[#a87b2e] hover:text-[#0d1418] dark:border-[#34373f] dark:text-[#7e8089] dark:hover:border-[#d8a978] dark:hover:text-[#f7f5ec]"
              >
                + Add
              </button>
            )}
            <button
              onClick={handleCompare}
              disabled={selectedIds.filter(Boolean).length < 2 || loading}
              className="h-10 rounded-lg bg-[#1a5454] px-5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white shadow-plush hover:bg-[#0e3838] disabled:opacity-40 dark:bg-[#0fa595] dark:hover:bg-[#0b8378]"
            >
              {loading ? "Loading…" : "Compare"}
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        {compared.length >= 2 && (
          <div className="overflow-x-auto rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#dfd5b8] bg-[#f0e9d3] dark:border-[#34373f] dark:bg-[#2a2d36]">
                  <th className="px-4 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a7f88] dark:text-[#7e8089]">
                    Attribute
                  </th>
                  {compared.map((l) => (
                    <th key={l.id} className="px-4 py-3 text-center">
                      <Link
                        href={`/listing/${l.id}`}
                        className="font-serif text-sm font-medium text-[#1a5454] hover:underline dark:text-[#0fa595]"
                        style={{ fontFamily: SERIF }}
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
                    className={i % 2 === 0 ? "" : "bg-[#f0e9d3]/40 dark:bg-[#2a2d36]/40"}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
                      {row.label}
                    </td>
                    {compared.map((l) => (
                      <td
                        key={l.id}
                        className="px-4 py-3 text-center text-sm text-[#0d1418] dark:text-[#f7f5ec]"
                      >
                        {row.render(l)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-[#dfd5b8] dark:border-[#34373f]">
                  <td className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">Details</td>
                  {compared.map((l) => (
                    <td key={l.id} className="px-4 py-3 text-center">
                      <Link
                        href={`/listing/${l.id}`}
                        className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#1a5454] hover:underline dark:text-[#0fa595]"
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
              <div key={l.id} className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
                <Link
                  href={`/listing/${l.id}`}
                  className="font-serif font-medium text-[#1a5454] hover:underline dark:text-[#0fa595]"
                  style={{ fontFamily: SERIF }}
                >
                  {l.title}
                </Link>
                <dl className="mt-3 space-y-2 text-sm">
                  {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">{row.label}</dt>
                      <dd className="text-[#0d1418] dark:text-[#f7f5ec]">{row.render(l)}</dd>
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
