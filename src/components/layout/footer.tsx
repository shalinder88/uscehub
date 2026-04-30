import Link from "next/link";

const SERIF =
  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

// Editorial masthead footer — mirrors #40 mockup: italic display title
// "USCE·Hub", gold mono-cap tagline, 4 columns (Browse / Tools / About /
// Legal), volume row at the bottom (VOL II · ISSUE 4 …), italic Charter
// disclaimer. Background uses the warm paper card tint so the page
// closes on the same surface the hero opens on.
const cols: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    heading: "Browse",
    links: [
      { label: "All listings", href: "/browse" },
      { label: "By state", href: "/observerships" },
      { label: "By specialty", href: "/browse" },
      { label: "Compare", href: "/compare" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { label: "Cost estimator", href: "/tools/cost-calculator" },
      { label: "Saved", href: "/dashboard/saved" },
      { label: "Recommend", href: "/recommend" },
      { label: "Report issue", href: "/contact-admin" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Methodology", href: "/methodology" },
      { label: "For institutions", href: "/for-institutions" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#dfd5b8] bg-[#faf6e8] py-16 dark:border-[#34373f] dark:bg-[#1d1f26]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 border-t-2 border-double border-[#dfd5b8] dark:border-[#34373f]" />

        <div className="text-center">
          <h2
            className="font-serif text-[34px] italic leading-tight tracking-tight text-[#0d1418] dark:text-[#f7f5ec]"
            style={{ fontFamily: SERIF }}
          >
            USCE
            <span className="not-italic font-medium text-[#1a5454] dark:text-[#0fa595]">·</span>
            Hub
          </h2>
          <p className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[#a87b2e] dark:text-[#d8a978]">
            Verified Directory · A Resource for U.S. Clinical Experience
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 text-left sm:grid-cols-4">
          {cols.map((col) => (
            <div key={col.heading}>
              <h5 className="mb-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
                {col.heading}
              </h5>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-[#4a5057] transition-colors hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:text-[#f7f5ec]"
                      style={{ fontFamily: SERIF }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#dfd5b8] pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7a7f88] dark:border-[#34373f] dark:text-[#7e8089]">
          <span>
            <strong className="font-semibold text-[#4a5057] dark:text-[#bfc1c9]">VOL II · ISSUE 4</strong>
          </span>
          <span>Edited by the USCEHub desk</span>
          <span>Last reviewed · April {year}</span>
          <span>NO. {year}.04</span>
        </div>

        <div className="mt-6 text-center">
          <p
            className="mx-auto max-w-3xl text-[12px] italic leading-relaxed text-[#7a7f88] dark:text-[#7e8089]"
            style={{ fontFamily: SERIF }}
          >
            USCEHub is an independent informational platform. Not affiliated with
            NRMP, ECFMG, ERAS, AAMC, or any hospital or residency program. We do
            not guarantee placement, match, or visa outcomes. Always verify
            program details with the official institution before applying.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
            &copy; {year} USCEHub · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
