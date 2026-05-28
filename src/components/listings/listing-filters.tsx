"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, Sparkles, Info } from "lucide-react";
import { Select } from "@/components/ui/select";
import { US_STATES } from "@/lib/utils";
import { parseSmartSearch } from "@/lib/smart-search";

interface BrowseChip {
  label: string;
  filter: string;
  count: number;
}

interface ListingFiltersProps {
  browseChips?: BrowseChip[];
  activeCategory?: string;
}

export function ListingFilters({ browseChips, activeCategory }: ListingFiltersProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentType = searchParams.get("type") || "";
  const currentCategory = searchParams.get("category") || "";
  // audience filter removed; param ignored.
  const currentState = searchParams.get("state") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentFree = searchParams.get("free") === "true";
  const currentVisa = searchParams.get("visa") === "true";
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
    <div className="card-lift rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label={smartMode ? "Smart search (natural language)" : "Search hospitals or cities"}
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
            className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-9 pr-20 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
          />
          <button
            type="button"
            onClick={() => setSmartMode(!smartMode)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              smartMode
                ? "bg-slate-900 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
            title="Toggle smart search — parse natural language queries"
          >
            <Sparkles className="h-3 w-3" />
            Smart
          </button>
        </div>

        <Select
          value={currentCategory}
          onChange={(e) => {
            // Clear legacy type param when switching to category
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set("category", e.target.value);
            else params.delete("category");
            params.delete("type");
            router.push(`/browse?${params.toString()}`);
          }}
          title="What kind of program are you looking for?"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          <option value="observership">Observership</option>
          <option value="clerkship">Clerkship</option>
          <option value="visiting">MD/DO Visiting Students (VSLO)</option>
          <option value="research">Research</option>
        </Select>

        {/* Audience dropdown removed 2026-05-28 — category + state cover it. */}

        <Select
          value={currentState}
          onChange={(e) => updateParam("state", e.target.value)}
          aria-label="Filter by state"
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
          aria-label="Sort order"
        >
          <option value="newest">Newest First</option>
          <option value="cost-low">Cost: Low to High</option>
          <option value="cost-high">Cost: High to Low</option>
          <option value="most-reviewed">Most Viewed</option>
        </Select>

        <a
          href="#category-difference"
          title="What's the difference between an observership, clerkship, MD/DO visiting, and research?"
          aria-label="What's the difference between categories?"
          className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <Info className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50">
          <input
            type="checkbox"
            checked={currentFree}
            onChange={() => toggleParam("free")}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="font-medium text-slate-700 dark:text-slate-200">Free Programs Only</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 has-[:checked]:border-blue-300 has-[:checked]:bg-blue-50">
          <input
            type="checkbox"
            checked={currentVisa}
            onChange={() => toggleParam("visa")}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-slate-700 dark:text-slate-200">Visa Support</span>
        </label>

        <a
          href="#category-difference"
          title="What's the difference between an observership, clerkship, MD/DO visiting, and research?"
          aria-label="What's the difference between categories?"
          className="inline-flex lg:hidden h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 px-3 text-sm text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <Info className="h-3.5 w-3.5" />
          What&apos;s the difference?
        </a>
      </div>

      {browseChips && browseChips.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {browseChips.map((c) => {
            const isActive = activeCategory === c.filter;
            const href = isActive ? "/browse" : `/browse?category=${c.filter}`;
            return (
              <a
                key={c.filter}
                href={href}
                style={{
                  background: isActive ? "var(--teal)" : "var(--paper-soft)",
                  color: isActive ? "#fff" : "var(--ink)",
                  border: `1px solid ${isActive ? "var(--teal)" : "var(--line)"}`,
                  borderRadius: 999,
                  padding: "10px 16px",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all .15s",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span>{c.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    opacity: 0.8,
                    background: isActive ? "rgba(255,255,255,0.18)" : "var(--bg-alt)",
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  {c.count}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
