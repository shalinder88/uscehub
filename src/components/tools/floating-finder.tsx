"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export function FloatingFinder() {
  return (
    <Link
      href="/recommend"
      className="fixed bottom-[5.5rem] right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-foreground shadow-lg transition-transform hover:scale-105"
      title="Program Finder"
    >
      <Search className="h-5 w-5" />
    </Link>
  );
}
