"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

type SavedListingsContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  isSaved: (listingId: string) => boolean;
  toggleSaved: (listingId: string) => Promise<{ ok: boolean; saved: boolean; error?: string }>;
};

const SavedListingsContext = createContext<SavedListingsContextValue | null>(null);

type SavedRow = { listing: { id: string } };

export function SavedListingsProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [isReady, setIsReady] = useState(false);

  const isAuthenticated = status === "authenticated";

  // Sync saved-listing set to NextAuth session status. Setting state in
  // this effect is intentional — savedIds derives from a remote fetch
  // that depends on auth — and matches the pattern used in
  // `journey-provider.tsx` and `theme-provider.tsx`.
  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedIds(new Set());
      setIsReady(true);
      return;
    }

    let cancelled = false;
    fetch("/api/saved")
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: SavedRow[]) => {
        if (cancelled) return;
        setSavedIds(new Set(rows.map((r) => r.listing.id)));
        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSavedIds(new Set());
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const isSaved = useCallback(
    (listingId: string) => savedIds.has(listingId),
    [savedIds]
  );

  const toggleSaved = useCallback<SavedListingsContextValue["toggleSaved"]>(
    async (listingId) => {
      if (!isAuthenticated) {
        return { ok: false, saved: false, error: "auth" };
      }
      const wasSaved = savedIds.has(listingId);
      // Optimistic update.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(listingId);
        else next.add(listingId);
        return next;
      });

      try {
        const res = wasSaved
          ? await fetch(`/api/saved?listingId=${encodeURIComponent(listingId)}`, {
              method: "DELETE",
            })
          : await fetch("/api/saved", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ listingId }),
            });

        if (!res.ok) {
          // Revert on failure.
          setSavedIds((prev) => {
            const next = new Set(prev);
            if (wasSaved) next.add(listingId);
            else next.delete(listingId);
            return next;
          });
          return { ok: false, saved: wasSaved, error: "request" };
        }
        return { ok: true, saved: !wasSaved };
      } catch {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
        return { ok: false, saved: wasSaved, error: "network" };
      }
    },
    [isAuthenticated, savedIds]
  );

  const value = useMemo<SavedListingsContextValue>(
    () => ({ isAuthenticated, isReady, isSaved, toggleSaved }),
    [isAuthenticated, isReady, isSaved, toggleSaved]
  );

  return (
    <SavedListingsContext.Provider value={value}>
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings(): SavedListingsContextValue {
  const ctx = useContext(SavedListingsContext);
  if (!ctx) {
    // Fallback for trees that don't include the provider — keeps the
    // SaveButton from crashing if mounted outside of <Providers>.
    return {
      isAuthenticated: false,
      isReady: true,
      isSaved: () => false,
      toggleSaved: async () => ({ ok: false, saved: false, error: "no-provider" }),
    };
  }
  return ctx;
}
