"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

export function FloatingFinder() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed right-4 top-1/2 z-40 -translate-y-1/2">
      {expanded ? (
        <div className="animate-in slide-in-from-right rounded-xl border border-slate-200 bg-white p-4 shadow-xl" style={{ width: 200 }}>
          <button
            onClick={() => setExpanded(false)}
            className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="mb-3 text-xs font-semibold text-slate-900">Quick Tools</p>
          <div className="space-y-2">
            <Link
              href="/recommend"
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Search className="h-3.5 w-3.5" />
              Program Finder
            </Link>
            <Link
              href="/tools/cost-calculator"
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              💰 Cost Calculator
            </Link>
            <Link
              href="/browse?verified=true"
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              ✓ Verified Programs
            </Link>
            <Link
              href="/browse?free=true"
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              🆓 Free Programs
            </Link>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 shadow-lg transition-all hover:bg-slate-900 hover:text-white"
          title="Program Finder"
        >
          <Search className="h-4 w-4 text-slate-600 group-hover:text-white" />
          <span className="text-xs font-semibold text-slate-700 group-hover:text-white">
            Find
          </span>
        </button>
      )}
    </div>
  );
}
