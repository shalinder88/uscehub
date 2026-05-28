"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Next.js global error boundary for server / route errors. Stays minimal:
 * no stack trace exposure, single "Try again" affordance, and a path back
 * to home. The error itself is logged to the console so it surfaces in
 * dev + in deployed logs without leaking internals to users.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="bg-[var(--bg)] dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(179, 80, 62, 0.12)" }}
        >
          <AlertTriangle className="h-7 w-7" style={{ color: "var(--terracotta)" }} />
        </div>

        <p
          className="mb-2 text-xs font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          Something went wrong
        </p>

        <h1
          className="text-4xl sm:text-5xl"
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          We hit an unexpected error.
        </h1>

        <p
          className="mx-auto mt-4 max-w-md text-sm leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          The page failed to load. This usually clears on a retry. If it
          keeps happening, let admin know which page you were trying to reach.
        </p>

        {error.digest && (
          <p
            className="mt-3 font-mono text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            onClick={() => reset()}
            style={{ background: "var(--teal)", color: "#fff" }}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>

        <p
          className="mt-10 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Persistent issue?{" "}
          <Link
            href="/contact-admin"
            style={{ color: "var(--teal-deep)", textDecoration: "underline" }}
          >
            Contact admin
          </Link>{" "}
          with the reference code above.
        </p>
      </div>
    </div>
  );
}
