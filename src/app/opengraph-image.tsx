import { ImageResponse } from "next/og";
import { SITE_METRICS } from "@/lib/site-metrics";

/**
 * Site-wide Open Graph + Twitter card image.
 *
 * Renders at request time via @vercel/og (bundled into next/og). The
 * design mirrors the locked theme — zinc-100 paper bg, serif "verified"
 * accent in teal, USCEHub wordmark. Resolution is the OG standard
 * 1200×630, which doubles as the X (Twitter) summary_large_image card.
 *
 * Pages can opt out by exporting their own `opengraph-image.tsx` next
 * to the route's page.tsx.
 */

export const alt = "USCEHub — Find verified U.S. Clinical Experience";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f4f4f5",
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top row — wordmark + tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#0f5757",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              U
            </div>
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#1a1f1f",
                letterSpacing: "-0.01em",
              }}
            >
              USCEHub
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "#c5dcd9",
              color: "#084040",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                display: "flex",
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#0f5757",
              }}
            />
            <span style={{ display: "flex" }}>Verified Directory</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 84,
              lineHeight: 1.05,
              color: "#1a1f1f",
              letterSpacing: "-0.02em",
              fontWeight: 500,
            }}
          >
            <span>Find&nbsp;</span>
            <span style={{ color: "#0f5757" }}>verified&nbsp;</span>
            <span>U.S. Clinical Experience.</span>
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#3a4444",
              lineHeight: 1.45,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              maxWidth: 880,
            }}
          >
            Observerships, clerkships, MD/DO visiting rotations (VSLO), and
            research positions — every listing source-linked to the
            institution&apos;s own page.
          </div>
        </div>

        {/* Bottom row — stat tiles */}
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { value: SITE_METRICS.listingsWithOfficialSource, label: "Verified programs" },
            { value: SITE_METRICS.statesCovered, label: "States covered" },
            { value: SITE_METRICS.specialtiesCovered, label: "Specialties" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: "20px 24px",
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 44,
                  lineHeight: 1,
                  color: "#0f5757",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                {s.value}+
              </span>
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#7a8a87",
                    fontWeight: 500,
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
