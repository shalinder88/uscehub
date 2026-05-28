import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-[var(--bg)] dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--teal-soft)" }}
        >
          <Compass className="h-7 w-7" style={{ color: "var(--teal)" }} />
        </div>

        <p
          className="mb-2 text-xs font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-muted)" }}
        >
          404 &middot; Page not found
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
          We couldn&apos;t find that page.
        </h1>

        <p
          className="mx-auto mt-4 max-w-md text-sm leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          The link may have been moved, removed, or the listing taken down at
          the institution&apos;s request. Try browsing the directory or jump to
          the home page.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/browse">
            <Button size="lg" style={{ background: "var(--teal)", color: "#fff" }}>
              Browse Opportunities
            </Button>
          </Link>
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
          Spot a broken link?{" "}
          <Link
            href="/contact-admin"
            style={{ color: "var(--teal-deep)", textDecoration: "underline" }}
          >
            Tell admin
          </Link>{" "}
          and we&apos;ll re-verify the source.
        </p>
      </div>
    </div>
  );
}
