import { Mail, Sparkles } from "lucide-react";

/**
 * Visible-but-honest placeholder newsletter strip.
 *
 * No intake yet — explicitly labeled "Coming Soon" so the design surface
 * exists without the fake-submission honesty problem we've already
 * cleaned up on /community. When a real provider (Mailchimp / Resend /
 * Brevo) is wired and double opt-in is in place, swap the disabled
 * input + label for a working form.
 */
export function NewsletterBand() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
      <div
        className="card-lift rounded-2xl p-6 sm:p-8 text-center"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
        }}
      >
        <div
          className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "var(--teal-soft)" }}
        >
          <Mail className="h-5 w-5" style={{ color: "var(--teal)" }} />
        </div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 20,
            color: "var(--ink)",
          }}
        >
          New verified listings &mdash; in your inbox
        </h2>
        <p
          className="mx-auto mt-2 max-w-md text-sm"
          style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}
        >
          A short monthly digest of programs added, deadlines opening, and
          source-link changes. No spam, ever.
        </p>
        <div className="mx-auto mt-5 flex max-w-md flex-col items-stretch gap-2 sm:flex-row">
          <input
            type="email"
            placeholder="you@example.com"
            aria-label="Email (intake not active yet)"
            disabled
            className="flex h-10 flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-500 dark:text-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 cursor-not-allowed"
          />
          <button
            type="button"
            disabled
            aria-disabled
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium cursor-not-allowed"
            style={{
              background: "var(--paper-soft)",
              color: "var(--text-muted)",
              border: "1px solid var(--line)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Coming Soon
          </button>
        </div>
        <p
          className="mt-3 text-xs"
          style={{ color: "var(--text-muted)", fontStyle: "italic" }}
        >
          Intake is not live yet &mdash; we&apos;ll open it once the verified
          digest pipeline ships.
        </p>
      </div>
    </section>
  );
}
