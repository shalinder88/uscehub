"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export function FloatingFinder() {
  return (
    <Link
      href="/recommend"
      className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg transition-all hover:bg-slate-700 hover:scale-110 dark:bg-slate-700 dark:hover:bg-slate-600"
      title="Program Finder"
    >
      <Search className="h-4 w-4" />
    </Link>
  );
}
