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
  const currentCategory = searchParams.get("category") || "";
  const currentAudience = searchParams.get("audience") || "";
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
    <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7f88] dark:text-[#7e8089]" />
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
            className="flex h-10 w-full rounded-lg border border-[#dfd5b8] bg-[#faf6e8] pl-9 pr-20 py-2 text-sm text-[#0d1418] placeholder:text-[#7a7f88] focus:border-[#a87b2e] focus:outline-none dark:border-[#34373f] dark:bg-[#1d1f26] dark:text-[#f7f5ec] dark:placeholder:text-[#7e8089] dark:focus:border-[#d8a978]"
          />
          <button
            type="button"
            onClick={() => setSmartMode(!smartMode)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              smartMode
                ? "bg-[#1a5454] text-white dark:bg-[#0fa595] dark:text-[#0d1418]"
                : "bg-[#f0e9d3] text-[#4a5057] hover:bg-[#dfd5b8] dark:bg-[#2a2d36] dark:text-[#bfc1c9] dark:hover:bg-[#34373f]"
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
        >
          <option value="">All categories</option>
          <option value="clinical">Clinical Rotation (observership / externship / elective)</option>
          <option value="research">Research Position</option>
          <option value="volunteer">Volunteer / Pre-Med</option>
        </Select>

        <Select
          value={currentAudience}
          onChange={(e) => updateParam("audience", e.target.value)}
          title="Who's the program for?"
        >
          <option value="">All audiences</option>
          <option value="USMLE-IMG">IMG Graduate (USMLE Match prep)</option>
          <option value="Med Student">Current Medical Student</option>
          <option value="Specialty Visiting">Trained Specialist visitor</option>
          <option value="Pre-Med/Volunteer">Pre-Med / Volunteer</option>
          <option value="Both">Open to Both IMG + Students</option>
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

      <div className="mt-3 flex flex-wrap gap-2.5">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dfd5b8] px-3 py-2 text-sm transition-colors hover:bg-[#f0e9d3] has-[:checked]:border-[#1a5454] has-[:checked]:bg-[#f0e9d3] dark:border-[#34373f] dark:hover:bg-[#2a2d36] dark:has-[:checked]:border-[#0fa595] dark:has-[:checked]:bg-[#2a2d36]">
          <input
            type="checkbox"
            checked={currentFree}
            onChange={() => toggleParam("free")}
            className="h-4 w-4 rounded border-[#dfd5b8] text-[#1a5454] focus:ring-[#1a5454]"
          />
          <span className="font-medium text-[#4a5057] dark:text-[#bfc1c9]">Free programs only</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dfd5b8] px-3 py-2 text-sm transition-colors hover:bg-[#f0e9d3] has-[:checked]:border-[#1a5454] has-[:checked]:bg-[#f0e9d3] dark:border-[#34373f] dark:hover:bg-[#2a2d36] dark:has-[:checked]:border-[#0fa595] dark:has-[:checked]:bg-[#2a2d36]">
          <input
            type="checkbox"
            checked={currentVisa}
            onChange={() => toggleParam("visa")}
            className="h-4 w-4 rounded border-[#dfd5b8] text-[#1a5454] focus:ring-[#1a5454]"
          />
          <span className="font-medium text-[#4a5057] dark:text-[#bfc1c9]">Visa support</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dfd5b8] px-3 py-2 text-sm transition-colors hover:bg-[#f0e9d3] has-[:checked]:border-[#1a5454] has-[:checked]:bg-[#f0e9d3] dark:border-[#34373f] dark:hover:bg-[#2a2d36] dark:has-[:checked]:border-[#0fa595] dark:has-[:checked]:bg-[#2a2d36]">
          <input
            type="checkbox"
            checked={currentVerified}
            onChange={() => toggleParam("verified")}
            className="h-4 w-4 rounded border-[#dfd5b8] text-[#1a5454] focus:ring-[#1a5454]"
          />
          <span className="flex items-center gap-1 font-medium text-[#4a5057] dark:text-[#bfc1c9]">
            <svg className="h-3 w-3 text-[#1a5454] dark:text-[#0fa595]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            Verified links
          </span>
        </label>
      </div>
    </div>
  );
}
