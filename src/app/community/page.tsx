import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, BookOpen, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Community — USCEHub",
  description: "Connect with fellow IMGs, share experiences, and find support in the USCEHub community.",
};

const communities = [
  { name: "r/IMGreddit", url: "https://www.reddit.com/r/IMGreddit/", desc: "The largest Reddit community for International Medical Graduates. Advice, experiences, and support.", members: "25K+", platform: "Reddit" },
  { name: "r/residency", url: "https://www.reddit.com/r/residency/", desc: "Residency community with interview tips, program reviews, and Match discussions.", members: "180K+", platform: "Reddit" },
  { name: "r/Step1", url: "https://www.reddit.com/r/step1/", desc: "USMLE Step 1 study strategies, score reports, and resource recommendations.", members: "90K+", platform: "Reddit" },
  { name: "r/Step2", url: "https://www.reddit.com/r/Step2/", desc: "USMLE Step 2 CK and CS community. Study plans and score discussions.", members: "40K+", platform: "Reddit" },
  { name: "Student Doctor Network", url: "https://www.studentdoctor.net/", desc: "One of the oldest medical education forums. Program-specific threads and interview feedback.", members: "500K+", platform: "Forum" },
  { name: "IMG Friendly Programs Spreadsheet", url: "https://docs.google.com/spreadsheets/d/1Aou3xqpjGMNxAwhEHAhOh0M9WzVhko1vRpGdbt7xUk4/", desc: "Community-maintained spreadsheet of IMG-friendly residency programs across specialties.", members: "Public", platform: "Google Sheets" },
];

const resources = [
  { name: "ECFMG", url: "https://www.ecfmg.org/", desc: "Educational Commission for Foreign Medical Graduates — certification for IMGs" },
  { name: "USMLE", url: "https://www.usmle.org/", desc: "United States Medical Licensing Examination — Step 1, 2 CK, and 3" },
  { name: "NRMP", url: "https://www.nrmp.org/", desc: "National Resident Matching Program — the Match" },
  { name: "ERAS", url: "https://students-residents.aamc.org/applying-residencies-eras/applying-residencies-eras", desc: "Electronic Residency Application Service" },
  { name: "FREIDA", url: "https://freida.ama-assn.org/", desc: "AMA residency program database — program details, IMG percentages, visa policies" },
  { name: "Pathways for ECFMG", url: "https://www.ecfmg.org/certification/", desc: "ECFMG certification pathways for international medical graduates" },
];

export default function CommunityPage() {
  return (
    <div className="bg-white">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-blue-400" />
            <h1 className="text-3xl font-bold sm:text-4xl">IMG Community</h1>
            <p className="mt-3 text-base text-slate-400">
              Connect with fellow IMGs, share experiences, ask questions, and find the support you need on your journey.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Community Forums */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            IMG Communities & Forums
          </h2>
          <p className="mt-1 text-sm text-slate-500">Active communities where IMGs share advice and experiences</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {communities.map((c) => (
              <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-slate-200 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">{c.name}</h3>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{c.desc}</p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{c.platform}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">{c.members} members</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Essential Resources */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <BookOpen className="h-5 w-5 text-violet-600" />
            Essential Resources
          </h2>
          <p className="mt-1 text-sm text-slate-500">Official resources every IMG needs</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="group rounded-lg border border-slate-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">{r.name}</h3>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </div>
                <p className="mt-1 text-xs text-slate-500">{r.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl bg-slate-50 p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">Have questions about your IMG journey?</h2>
          <p className="mt-2 text-sm text-slate-500">Check our comprehensive FREIDA & Residency Programs guide for match stats, IMG-friendly programs, and application strategies.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/freida"><Button size="lg">IMG Resources & FREIDA</Button></Link>
            <Link href="/faq"><Button variant="outline" size="lg">Read FAQ</Button></Link>
          </div>
        </section>
      </div>
    </div>
  );
}
