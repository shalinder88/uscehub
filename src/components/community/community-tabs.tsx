/**
 * Community placeholder component.
 *
 * PR 0e-fix (community truth/safety) — this file replaces the previous
 * implementation, which contained:
 *   - hardcoded fake "Dr." users rendered as live swap-board posts and
 *     discussion threads (PR 0e audit C1),
 *   - in-memory-only submission forms that displayed "Thank you for your
 *     submission!" without persisting anything (PR 0e audit C3),
 *   - a non-functional "Contact" button on swap cards (PR 0e audit H3),
 *   - a `SuggestProgramForm` whose own source comment said
 *     `// In a real app this would call an API`.
 *
 * The new implementation is read-only and honest:
 *   - explicit "Coming Soon" framing for any USCEHub-hosted forum,
 *   - real external IMG community links (Reddit, SDN, IMG-friendly sheet,
 *     etc.) — these are genuine third-party destinations, kept because
 *     they are useful and unambiguously not USCEHub-hosted,
 *   - real official-resource links (ECFMG, USMLE, NRMP, ERAS, FREIDA),
 *   - a `SuggestProgramForm` that no longer pretends to submit; it
 *     points users at the real `/contact-admin` route.
 *
 * No backend was added. No new API route. No new schema. No real-email
 * send. See docs/platform-v2/audits/COMMUNITY_FLOW_AUDIT.md and
 * docs/platform-v2/audits/V2_COMMUNITY_TRUTH_FIX_LOG.md.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  BookOpen,
  ExternalLink,
  Sparkles,
  Lightbulb,
} from "lucide-react";

const externalCommunities = [
  {
    name: "r/IMGreddit",
    url: "https://www.reddit.com/r/IMGreddit/",
    desc: "The largest Reddit community for International Medical Graduates. Advice, experiences, and support.",
    members: "25K+",
    platform: "Reddit",
  },
  {
    name: "r/residency",
    url: "https://www.reddit.com/r/residency/",
    desc: "Residency community with interview tips, program reviews, and Match discussions.",
    members: "180K+",
    platform: "Reddit",
  },
  {
    name: "r/Step1",
    url: "https://www.reddit.com/r/step1/",
    desc: "USMLE Step 1 study strategies, score reports, and resource recommendations.",
    members: "90K+",
    platform: "Reddit",
  },
  {
    name: "r/Step2",
    url: "https://www.reddit.com/r/Step2/",
    desc: "USMLE Step 2 CK and CS community. Study plans and score discussions.",
    members: "40K+",
    platform: "Reddit",
  },
  {
    name: "Student Doctor Network",
    url: "https://www.studentdoctor.net/",
    desc: "One of the oldest medical education forums. Program-specific threads and interview feedback.",
    members: "500K+",
    platform: "Forum",
  },
  {
    name: "IMG Friendly Programs Spreadsheet",
    url: "https://docs.google.com/spreadsheets/d/1Aou3xqpjGMNxAwhEHAhOh0M9WzVhko1vRpGdbt7xUk4/",
    desc: "Community-maintained spreadsheet of IMG-friendly residency programs across specialties.",
    members: "Public",
    platform: "Google Sheets",
  },
];

const officialResources = [
  { name: "ECFMG", url: "https://www.ecfmg.org/", desc: "Educational Commission for Foreign Medical Graduates — certification for IMGs" },
  { name: "USMLE", url: "https://www.usmle.org/", desc: "United States Medical Licensing Examination — Step 1, 2 CK, and 3" },
  { name: "NRMP", url: "https://www.nrmp.org/", desc: "National Resident Matching Program — the Match" },
  { name: "ERAS", url: "https://students-residents.aamc.org/applying-residencies-eras/applying-residencies-eras", desc: "Electronic Residency Application Service" },
  { name: "FREIDA", url: "https://freida.ama-assn.org/", desc: "AMA residency program database — program details, IMG percentages, visa policies" },
  { name: "Pathways for ECFMG", url: "https://www.ecfmg.org/certification/", desc: "ECFMG certification pathways for international medical graduates" },
];

export function CommunityTabs() {
  return (
    <div className="space-y-12">
      {/* Coming-soon tile — matches the /residency/community pattern */}
      <section className="rounded-xl border border-border bg-surface p-10 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-accent/10 p-4 mb-5">
          <MessageSquare className="h-7 w-7 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          USCEHub Community Features
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          We are planning a moderated community for IMGs — discussion boards,
          observership swap board, and program suggestions. Community content
          will launch only after moderation, anonymity, and safety controls are
          ready. There is nothing to read or post here yet.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          <Sparkles className="h-4 w-4" />
          Coming Soon
        </div>
        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Want to suggest a program or report an issue today?{" "}
          <Link href="/contact-admin" className="font-medium text-blue-600 hover:underline">
            Contact admin directly
          </Link>
          .
        </p>
      </section>

      {/* External communities — real third-party destinations, kept */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          External IMG Communities
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Established communities outside USCEHub where IMGs share advice and
          experiences. We do not moderate or endorse third-party content.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {externalCommunities.map((c) => (
            <a
              key={c.name}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-slate-200 dark:border-slate-700 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                  {c.name}
                </h3>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {c.desc}
              </p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                  {c.platform}
                </span>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                  {c.members} members
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Official resources — real, no UGC */}
      <section>
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
          <BookOpen className="h-5 w-5 text-violet-600" />
          Essential Resources
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Official resources every IMG needs.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {officialResources.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {r.name}
                </h3>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {r.desc}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl bg-slate-50 dark:bg-slate-800 p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Have questions about your IMG journey?
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Check our IMG Resources guide for match stats, IMG-friendly programs,
          and application strategies, or send a question to admin.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/img-resources">
            <Button size="lg">IMG Resources &amp; Match Data</Button>
          </Link>
          <Link href="/faq">
            <Button variant="outline" size="lg">Read FAQ</Button>
          </Link>
          <Link href="/contact-admin">
            <Button variant="outline" size="lg">Contact Admin</Button>
          </Link>
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">
        USCEHub is an informational platform. Always verify details directly with institutions.
      </p>
    </div>
  );
}

/**
 * "Suggest a Program" placeholder.
 *
 * Replaces the previous client-side form whose `handleSubmit` displayed
 * a fabricated success message without persisting anything (PR 0e audit
 * C3 — its own source comment said `// In a real app this would call
 * an API`).
 *
 * Honest behavior: explain the intake is not live yet and route users
 * to the real `/contact-admin` page (which is a real-functional path
 * backed by the `AdminMessage` model and `/api/admin-messages`). No new
 * API route, no new schema, no client-only fake submission.
 */
export function SuggestProgramForm({ standalone = false }: { standalone?: boolean }) {
  return (
    <div className={standalone ? "" : "py-2"}>
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
        <Lightbulb className="h-5 w-5 text-blue-600" />
        Suggest a Program
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Know of an observership, externship, or research program that&apos;s not
        in our database?
      </p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-accent/10 p-4 mb-4">
          <Sparkles className="h-6 w-6 text-accent" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Program suggestion intake is not live yet
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          We are building a moderated submission flow. For now, send program
          details to admin via the contact form — we read every message and
          will add qualifying programs to the database.
        </p>
        <div className="mt-5">
          <Link href="/contact-admin">
            <Button>Open Contact Admin</Button>
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Submissions are reviewed manually before being added. USCEHub does not
        guarantee accuracy of user-submitted information.
      </p>
    </div>
  );
}
