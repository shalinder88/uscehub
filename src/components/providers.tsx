"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SavedListingsProvider } from "@/components/listings/saved-listings-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SavedListingsProvider>{children}</SavedListingsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
