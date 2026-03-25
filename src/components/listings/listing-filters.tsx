"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Select } from "@/components/ui/select";
import { US_STATES } from "@/lib/utils";
import { parseSmartSearch } from "@/lib/smart-search";

export function ListingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentType = searchParams.get("type") || "";
  const currentState = searchParams.get("state") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentFree = searchParams.get("free") === "true";
  const currentVisa = searchParams.get("visa") === "true";
  const currentVerified = searchParams.get("verified") === "true";
  const [smartMode, setSmartMode] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === "true") {
        params.delete(key);
      } else {
        params.set(key, "true");
      }
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={smartMode ? 'Try "free observerships in New York"...' : "Search hospitals, cities..."}
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter" && smartMode) {
                const val = (e.target as HTMLInputElement).value;
                if (val.trim()) {
                  const filters = parseSmartSearch(val.trim());
                  const params = new URLSearchParams();
                  if (filters.search) params.set("search", filters.search);
                  if (filters.type) params.set("type", filters.type);
                  if (filters.state) params.set("state", filters.state);
                  if (filters.sort) params.set("sort", filters.sort);
                  if (filters.free) params.set("free", filters.free);
                  if (filters.visa) params.set("visa", filters.visa);
                  router.push(`/browse?${params.toString()}`);
                }
              }
            }}
            onChange={(e) => {
              if (!smartMode) {
                const timeout = setTimeout(() => {
                  updateParam("search", e.target.value);
                }, 400);
                return () => clearTimeout(timeout);
              }
            }}
            className="flex h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-20 py-2 text-sm text-foreground placeholder:text-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-border"
          />
          <button
            type="button"
            onClick={() => setSmartMode(!smartMode)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              smartMode
                ? "bg-accent text-white"
                : "bg-surface-alt text-muted hover:bg-surface-alt"
            }`}
            title="Toggle smart search — parse natural language queries"
          >
            <Sparkles className="h-3 w-3" />
            Smart
          </button>
        </div>

        <Select
          value={currentType}
          onChange={(e) => updateParam("type", e.target.value)}
        >
          <option value="">All Types</option>
          <option value="OBSERVERSHIP">Observership</option>
          <option value="EXTERNSHIP">Externship</option>
          <option value="RESEARCH">Research Fellowship</option>
          <option value="ELECTIVE">Elective</option>
          <option value="VOLUNTEER">Volunteer</option>
        </Select>

        <Select
          value={currentState}
          onChange={(e) => updateParam("state", e.target.value)}
        >
          <option value="">All States</option>
          {Object.entries(US_STATES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </Select>

        <Select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="cost-low">Cost: Low to High</option>
          <option value="cost-high">Cost: High to Low</option>
          <option value="most-reviewed">Most Viewed</option>
        </Select>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-alt has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-950/30">
          <input
            type="checkbox"
            checked={currentFree}
            onChange={() => toggleParam("free")}
            className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
          />
          <span className="font-medium text-foreground">Free Programs Only</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-alt has-[:checked]:border-blue-300 has-[:checked]:bg-blue-950/30">
          <input
            type="checkbox"
            checked={currentVisa}
            onChange={() => toggleParam("visa")}
            className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-foreground">Visa Support</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-alt has-[:checked]:border-green-300 has-[:checked]:bg-green-950/30">
          <input
            type="checkbox"
            checked={currentVerified}
            onChange={() => toggleParam("verified")}
            className="h-4 w-4 rounded border-border text-green-600 focus:ring-green-500"
          />
          <span className="font-medium text-foreground">
            <svg className="mr-1 inline h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            Verified Links
          </span>
        </label>
      </div>
    </div>
  );
}
