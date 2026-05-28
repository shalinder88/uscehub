import Link from "next/link";
import { SITE_METRICS } from "@/lib/site-metrics";

/**
 * Subtle verification footer line. Sits at the bottom of home + browse
 * (not the big teal-soft block we had before).
 *
 * Two-line plain prose:
 *   "Every listing has a verified source URL — {n} programs as of today.
 *    Found a broken link? Report it."
 */
export function VerifiedNotice() {
  return (
    <div
      className="mx-auto my-8 max-w-3xl text-center"
      style={{
        fontSize: 12.5,
        color: "var(--text-muted)",
        lineHeight: 1.6,
        padding: "0 16px",
      }}
    >
      Every listing has a verified source URL — {SITE_METRICS.listingsWithOfficialSource}{" "}
      programs as of today.{" "}
      <Link
        href="/contact?topic=broken-link"
        style={{
          color: "var(--teal-deep)",
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textUnderlineOffset: 3,
        }}
      >
        Found a broken link? Report it.
      </Link>
    </div>
  );
}
