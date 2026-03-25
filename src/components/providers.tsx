"use client";

import { SessionProvider } from "next-auth/react";
import { JourneyProvider } from "@/components/providers/journey-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <JourneyProvider>{children}</JourneyProvider>
    </SessionProvider>
  );
}
