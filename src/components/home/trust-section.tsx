// P1-2B trust grid — mirrors mockup #40 pattern. Editorial heading with
// italic teal "verifies" accent + subline. Section lives on warm panel
// tint (#f0e9d3) so it visually breaks from the paper-bg Featured section
// above. Same tint as HowItWorks below — they read as one trust band.

const signals = [
  {
    kicker: "NPI",
    title: "NPI-Verified Posters",
    description: "Institutions verify their NPI credentials before posting.",
  },
  {
    kicker: "Admin",
    title: "Admin-Reviewed",
    description: "Every listing reviewed by our team before publishing.",
  },
  {
    kicker: "Community",
    title: "Community Reviews",
    description: "Moderated feedback, separate from source verification.",
  },
  {
    kicker: "Moderated",
    title: "Moderated Platform",
    description: "Active moderation for quality assurance.",
  },
];

const SERIF =
  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

export function TrustSection() {
  return (
    <section className="border-y border-[#dfd5b8] bg-[#f0e9d3] py-20 dark:border-[#34373f] dark:bg-[#23262e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
            — On verification —
          </p>
          <h2
            className="font-serif text-3xl font-normal tracking-tight text-[#0d1418] dark:text-[#f7f5ec] sm:text-[36px]"
            style={{ fontFamily: SERIF, letterSpacing: "-0.022em" }}
          >
            How USCEHub <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">verifies</em> programs
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[14.5px] leading-snug text-[#4a5057] dark:text-[#bfc1c9]">
            Four checks. A listing that fails any of them is flagged — never silently hidden.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#dfd5b8] bg-[#dfd5b8] sm:grid-cols-2 lg:grid-cols-4 dark:border-[#34373f] dark:bg-[#34373f]">
          {signals.map((signal, index) => {
            const num = String(index + 1).padStart(2, "0");
            return (
              <div
                key={signal.title}
                className="group relative bg-[#fcf9eb] px-6 py-7 transition-all hover:bg-[#f5ecd1] dark:bg-[#23262e] dark:hover:bg-[#2a2d36]"
              >
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1a5454] to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-[#0fa595]" />
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
                  <span className="text-[#7a7f88] dark:text-[#7e8089]">{num}</span>
                  <span className="mx-1.5 text-[#dfd5b8] dark:text-[#34373f]">·</span>
                  {signal.kicker}
                </p>
                <h3
                  className="mb-2 font-serif text-base font-semibold leading-tight text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{ fontFamily: SERIF }}
                >
                  {signal.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#4a5057] dark:text-[#bfc1c9]">
                  {signal.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
