import Link from "next/link";
import { SITE_METRICS } from "@/lib/site-metrics";

/**
 * Cream/teal notice used on home + browse to communicate the
 * verification policy ("we only keep listings with a verified URL")
 * and give users a one-click report path for stale links.
 *
 * Inline styles use the Phase A design tokens so the look is
 * consistent regardless of which page hosts the component.
 */
export function VerifiedNotice() {
  return (
    <div
      className="mx-auto my-6 max-w-4xl"
      style={{
        background: "var(--teal-soft)",
        border: "1px solid rgba(15, 87, 87, 0.15)",
        borderRadius: 14,
        padding: "14px 18px",
        color: "var(--ink)",
        fontSize: 14,
        lineHeight: 1.55,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <span
        aria-hidden
        style={{
          flex: "0 0 auto",
          width: 28,
          height: 28,
          borderRadius: 14,
          background: "var(--teal)",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 600,
          marginTop: 2,
        }}
      >
        ✓
      </span>
      <div style={{ flex: 1 }}>
        <strong style={{ color: "var(--teal-deep)", fontWeight: 600 }}>
          Every listing has a verified source URL.
        </strong>{" "}
        We only keep programs whose official page we can reach right now —{" "}
        {SITE_METRICS.listingsWithOfficialSource} of them as of today. If you find a broken or
        outdated link, please{" "}
        <Link
          href="/contact?topic=broken-link"
          style={{ color: "var(--teal-deep)", textDecoration: "underline", fontWeight: 500 }}
        >
          report it here
        </Link>{" "}
        so we can fix or remove it.
      </div>
    </div>
  );
}
