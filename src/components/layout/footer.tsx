"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Globe } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (mounted && pathname?.startsWith("/career")) {
    return (
      <footer
        className="border-t"
        style={{ background: "var(--bg)", borderColor: "var(--line)", color: "var(--ink-soft)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-10">
            <div>
              <Link href="/career" className="flex items-center gap-2">
                <Globe className="h-4 w-4" style={{ color: "var(--teal)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  Visa &amp; Jobs
                </span>
              </Link>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                J-1 waiver intelligence, H-1B sponsor data, and career tools for international medical graduate physicians.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink)" }}>
                Resources
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li><Link href="/career/waiver" className="hover:underline" style={{ color: "var(--ink-soft)" }}>J-1 Waiver</Link></li>
                <li><Link href="/career/visa" className="hover:underline" style={{ color: "var(--ink-soft)" }}>Visa &amp; Immigration</Link></li>
                <li><Link href="/career/jobs" className="hover:underline" style={{ color: "var(--ink-soft)" }}>Jobs</Link></li>
                <li><Link href="/career/sponsors" className="hover:underline" style={{ color: "var(--ink-soft)" }}>H-1B Sponsor Database</Link></li>
                <li><Link href="/career/practice" className="hover:underline" style={{ color: "var(--ink-soft)" }}>Offers &amp; Practice</Link></li>
                <li><Link href="/career/attorneys" className="hover:underline" style={{ color: "var(--ink-soft)" }}>Immigration Attorneys</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink)" }}>
                Legal
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li><Link href="/privacy" className="hover:underline" style={{ color: "var(--ink-soft)" }}>Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:underline" style={{ color: "var(--ink-soft)" }}>Terms of Use</Link></li>
                <li><Link href="/privacy#disclaimer" className="hover:underline" style={{ color: "var(--ink-soft)" }}>Disclaimer</Link></li>
              </ul>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Educational information only. Not legal, immigration, or financial advice.
              </p>
            </div>
          </div>
          <div
            className="mt-6 pt-4 border-t text-[10px] flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "var(--line)", color: "var(--text-muted)" }}
          >
            <span>
              Visa &amp; Jobs &middot; Part of{" "}
              <Link href="/" className="hover:underline">USCEHub</Link>
              {" "}&middot;{" "}
              <Link href="/browse" className="hover:underline">USCE Search →</Link>
            </span>
            <span>© 2026 USCEHub &middot; Not affiliated with USCIS, DOL, or any government agency</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="border-t"
      style={{
        background: "var(--bg)",
        borderColor: "var(--line)",
        color: "var(--ink-soft)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-10">
          {/* Brand + 1-line tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" style={{ color: "var(--teal)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                USCEHub
              </span>
            </Link>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Verified directory of U.S. clinical experience programs —
              observerships, clerkships, MD/DO visiting (VSLO), research.
            </p>
          </div>

          {/* Platform — 4 essentials only */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink)" }}>
              Platform
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li>
                <Link href="/browse" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  Browse Opportunities
                </Link>
              </li>
              <li>
                <Link href="/observerships" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  Browse by State
                </Link>
              </li>
              <li>
                <Link href="/img-corner" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  IMG Corner
                </Link>
              </li>
              <li>
                <Link href="/for-institutions" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  For Institutions
                </Link>
              </li>
              <li>
                <Link href="/career" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  Visa &amp; Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* About + Legal merged */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink)" }}>
              About
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li>
                <Link href="/about" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline" style={{ color: "var(--ink-soft)" }}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline" style={{ color: "var(--text-muted)" }}>
                  Privacy · Terms · Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mini subscribe line — visible-but-disabled placeholder. Honest
            until real digest pipeline ships. */}
        <div
          className="mt-6 pt-4 border-t flex flex-col items-start gap-2 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
        >
          <span style={{ color: "var(--ink-soft)" }}>
            Monthly digest of verified listings &mdash;{" "}
            <em style={{ color: "var(--text-muted)" }}>coming soon</em>.
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium"
            style={{
              background: "var(--paper-soft)",
              color: "var(--text-muted)",
              border: "1px solid var(--line)",
            }}
          >
            Intake not yet open
          </span>
        </div>

        <div
          className="mt-4 text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          © 2026 USCEHub · Not affiliated with NRMP, ECFMG, ERAS, or AAMC ·
          Listings are submitted by third-party institutions.
        </div>
      </div>
    </footer>
  );
}
