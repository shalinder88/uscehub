"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  MessageSquare,
  Users,
  BookOpen,
  ExternalLink,
  ArrowRightLeft,
  PenSquare,
  Lightbulb,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  X,
  Send,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

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

interface SwapPost {
  id: number;
  userName: string;
  programHave: string;
  dates: string;
  lookingFor: string;
  reason: string;
  createdAt: string;
}

const initialSwapPosts: SwapPost[] = [
  {
    id: 1,
    userName: "Dr. Amira K.",
    programHave: "Internal Medicine Observership — Mount Sinai, NY",
    dates: "June 1 – June 30, 2026",
    lookingFor: "Any IM or Cardiology observership in July 2026",
    reason: "Visa processing delay",
    createdAt: "2026-03-18",
  },
  {
    id: 2,
    userName: "Dr. Raj P.",
    programHave: "Surgery Observership — Cleveland Clinic, OH",
    dates: "July 15 – Aug 15, 2026",
    lookingFor: "Surgery or General Surgery observership in September 2026",
    reason: "Schedule conflict with Step 2 exam",
    createdAt: "2026-03-15",
  },
  {
    id: 3,
    userName: "Dr. Maria L.",
    programHave: "Pediatrics Externship — Johns Hopkins, MD",
    dates: "Aug 1 – Aug 31, 2026",
    lookingFor: "Pediatrics observership in October/November 2026",
    reason: "Family emergency — need later dates",
    createdAt: "2026-03-12",
  },
];

interface Discussion {
  id: number;
  title: string;
  author: string;
  date: string;
  replyCount: number;
  category: string;
}

const initialDiscussions: Discussion[] = [
  {
    id: 1,
    title: "Share your observership experience",
    author: "USCEHub Team",
    date: "2026-03-20",
    replyCount: 47,
    category: "Experiences",
  },
  {
    id: 2,
    title: "Tips for first-time observers",
    author: "Dr. Sarah M.",
    date: "2026-03-18",
    replyCount: 32,
    category: "Tips",
  },
  {
    id: 3,
    title: "Program recommendations for IMGs in Internal Medicine",
    author: "Dr. Ahmed R.",
    date: "2026-03-16",
    replyCount: 28,
    category: "Recommendations",
  },
  {
    id: 4,
    title: "How to make the most of a 2-week observership",
    author: "Dr. Li W.",
    date: "2026-03-14",
    replyCount: 19,
    category: "Tips",
  },
  {
    id: 5,
    title: "Best cities for clinical experience opportunities",
    author: "Dr. Priya N.",
    date: "2026-03-10",
    replyCount: 41,
    category: "Recommendations",
  },
];

/* ------------------------------------------------------------------ */
/*  Reason badge color helper                                          */
/* ------------------------------------------------------------------ */

function reasonBadgeVariant(reason: string) {
  const lower = reason.toLowerCase();
  if (lower.includes("visa")) return "warning" as const;
  if (lower.includes("schedule") || lower.includes("exam")) return "info" as const;
  return "default" as const;
}

function categoryBadgeVariant(category: string) {
  switch (category) {
    case "Experiences":
      return "observership" as const;
    case "Tips":
      return "success" as const;
    case "Recommendations":
      return "research" as const;
    default:
      return "default" as const;
  }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function CommunityTabs() {
  const [swapPosts, setSwapPosts] = useState<SwapPost[]>(initialSwapPosts);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);

  /* Swap form state */
  const [swapForm, setSwapForm] = useState({
    userName: "",
    programHave: "",
    dates: "",
    lookingFor: "",
    reason: "",
  });

  /* Discussion form state */
  const [discussionForm, setDiscussionForm] = useState({
    title: "",
    author: "",
    category: "Experiences",
  });

  function handleSwapSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newPost: SwapPost = {
      id: Date.now(),
      ...swapForm,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSwapPosts([newPost, ...swapPosts]);
    setSwapForm({ userName: "", programHave: "", dates: "", lookingFor: "", reason: "" });
    setShowSwapForm(false);
  }

  function handleDiscussionSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newDiscussion: Discussion = {
      id: Date.now(),
      title: discussionForm.title,
      author: discussionForm.author || "Anonymous",
      date: new Date().toISOString().split("T")[0],
      replyCount: 0,
      category: discussionForm.category,
    };
    setDiscussions([newDiscussion, ...discussions]);
    setDiscussionForm({ title: "", author: "", category: "Experiences" });
    setShowDiscussionForm(false);
  }

  return (
    <Tabs defaultValue="suggest" className="w-full">
      <div className="flex justify-center">
        <TabsList className="flex-wrap">
          <TabsTrigger value="suggest">
            <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
            Suggest a Program
          </TabsTrigger>
          <TabsTrigger value="swap">
            <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
            Swap Board
          </TabsTrigger>
          <TabsTrigger value="discussions">
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="community">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Community
          </TabsTrigger>
        </TabsList>
      </div>

      {/* ============================================================ */}
      {/*  TAB 1 — Community (existing forums + resources)              */}
      {/* ============================================================ */}
      <TabsContent value="community">
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <MessageSquare className="h-5 w-5 text-accent" />
            IMG Communities &amp; Forums
          </h2>
          <p className="mt-1 text-sm text-muted">Active communities where IMGs share advice and experiences</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {communities.map((c) => (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border p-5 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent">{c.name}</h3>
                  <ExternalLink className="h-3.5 w-3.5 text-muted" />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{c.desc}</p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-medium text-muted">{c.platform}</span>
                  <span className="rounded-full bg-blue-950/30 px-2 py-0.5 text-[10px] font-medium text-accent">{c.members} members</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <BookOpen className="h-5 w-5 text-violet-600" />
            Essential Resources
          </h2>
          <p className="mt-1 text-sm text-muted">Official resources every IMG needs</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-border p-4 transition-colors hover:border-accent hover:bg-surface-alt"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{r.name}</h3>
                  <ExternalLink className="h-3 w-3 text-muted" />
                </div>
                <p className="mt-1 text-xs text-muted">{r.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-surface-alt p-8 text-center">
          <h2 className="text-lg font-bold text-foreground">Have questions about your IMG journey?</h2>
          <p className="mt-2 text-sm text-muted">
            Check our comprehensive IMG Resources guide for match stats, IMG-friendly programs, and application strategies.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/img-resources">
              <Button size="lg">IMG Resources &amp; Match Data</Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" size="lg">Read FAQ</Button>
            </Link>
          </div>
        </section>

        {/* General disclaimer */}
        <p className="mt-8 text-center text-xs text-muted">
          USCEHub is an informational platform. Always verify details directly with institutions.
        </p>
      </TabsContent>

      {/* ============================================================ */}
      {/*  TAB 2 — Observership Swap Board                             */}
      {/* ============================================================ */}
      <TabsContent value="swap">
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ArrowRightLeft className="h-5 w-5 text-accent" />
            Observership Swap Board
          </h2>
          <p className="mt-1 text-sm text-muted">
            Need to change your observership dates? Find another IMG willing to swap. Post your availability and what you&apos;re looking for.
          </p>

          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-950/30 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-200">
              USCEHub facilitates introductions only. Swap/transfer must be approved by respective institutions.
              USCEHub is not responsible for outcomes.
            </p>
          </div>

          <div className="mt-5">
            <Button onClick={() => setShowSwapForm(!showSwapForm)}>
              <PenSquare className="h-4 w-4" />
              {showSwapForm ? "Cancel" : "Post a Swap"}
            </Button>
          </div>
        </div>

        {/* Swap form */}
        {showSwapForm && (
          <form onSubmit={handleSwapSubmit} className="mb-8 rounded-xl border border-border bg-surface-alt p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Post a Swap Request</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Your Name"
                placeholder="Dr. Jane D."
                value={swapForm.userName}
                onChange={(e) => setSwapForm({ ...swapForm, userName: e.target.value })}
                required
              />
              <Input
                label="Program You Have"
                placeholder="Internal Medicine Observership — Mount Sinai, NY"
                value={swapForm.programHave}
                onChange={(e) => setSwapForm({ ...swapForm, programHave: e.target.value })}
                required
              />
              <Input
                label="Your Dates"
                placeholder="June 1 – June 30, 2026"
                value={swapForm.dates}
                onChange={(e) => setSwapForm({ ...swapForm, dates: e.target.value })}
                required
              />
              <Input
                label="What You're Looking For"
                placeholder="Any IM observership in July 2026"
                value={swapForm.lookingFor}
                onChange={(e) => setSwapForm({ ...swapForm, lookingFor: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Select
                  label="Reason for Swap"
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Visa processing delay">Visa processing delay</option>
                  <option value="Schedule conflict with exam">Schedule conflict with exam</option>
                  <option value="Family emergency">Family emergency</option>
                  <option value="Travel/logistics issue">Travel/logistics issue</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit">
                <Send className="h-4 w-4" />
                Submit Swap Post
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowSwapForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Swap posts */}
        <div className="grid gap-4">
          {swapPosts.map((post) => (
            <div key={post.id} className="rounded-xl border border-border p-5 transition-all hover:border-border-strong hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-950/30 text-xs font-semibold text-accent">
                    {post.userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{post.userName}</p>
                    <p className="text-[10px] text-muted">Posted {post.createdAt}</p>
                  </div>
                </div>
                <Badge variant={reasonBadgeVariant(post.reason)}>{post.reason}</Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                    <MapPin className="h-3 w-3" /> Program They Have
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{post.programHave}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                    <Calendar className="h-3 w-3" /> Dates
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{post.dates}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                    <ArrowRightLeft className="h-3 w-3" /> Looking For
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{post.lookingFor}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          USCEHub facilitates introductions only. Swap/transfer must be approved by respective institutions. USCEHub is not responsible for outcomes.
        </p>
      </TabsContent>

      {/* ============================================================ */}
      {/*  TAB 3 — Discussions                                         */}
      {/* ============================================================ */}
      <TabsContent value="discussions">
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <MessageCircle className="h-5 w-5 text-accent" />
            Community Discussions
          </h2>
          <p className="mt-1 text-sm text-muted">
            Share experiences, ask questions, and connect with fellow IMGs navigating USCE opportunities.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => setShowDiscussionForm(!showDiscussionForm)}>
              <PenSquare className="h-4 w-4" />
              {showDiscussionForm ? "Cancel" : "Start a Discussion"}
            </Button>
            <Link href="/community/suggest-program">
              <Button variant="outline">
                <Lightbulb className="h-4 w-4" />
                Suggest a New Program
              </Button>
            </Link>
          </div>
        </div>

        {/* Discussion form */}
        {showDiscussionForm && (
          <form onSubmit={handleDiscussionSubmit} className="mb-8 rounded-xl border border-border bg-surface-alt p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Start a New Discussion</h3>
            <div className="grid gap-4">
              <Input
                label="Your Name"
                placeholder="Dr. Jane D."
                value={discussionForm.author}
                onChange={(e) => setDiscussionForm({ ...discussionForm, author: e.target.value })}
                required
              />
              <Input
                label="Discussion Title"
                placeholder="What would you like to discuss?"
                value={discussionForm.title}
                onChange={(e) => setDiscussionForm({ ...discussionForm, title: e.target.value })}
                required
              />
              <Select
                label="Category"
                value={discussionForm.category}
                onChange={(e) => setDiscussionForm({ ...discussionForm, category: e.target.value })}
              >
                <option value="Experiences">Experiences</option>
                <option value="Tips">Tips</option>
                <option value="Recommendations">Recommendations</option>
                <option value="General">General</option>
              </Select>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit">
                <Send className="h-4 w-4" />
                Post Discussion
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowDiscussionForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Discussion cards */}
        <div className="grid gap-3">
          {discussions.map((d) => (
            <div
              key={d.id}
              className="group rounded-xl border border-border p-5 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent">{d.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="font-medium text-muted">{d.author}</span>
                    <span className="text-border-strong">|</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {d.date}
                    </span>
                    <span className="text-border-strong">|</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {d.replyCount} replies
                    </span>
                  </div>
                </div>
                <Badge variant={categoryBadgeVariant(d.category)}>{d.category}</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Suggest a program card */}
        <Link href="/community/suggest-program" className="mt-6 block">
          <div className="rounded-xl border border-dashed border-border bg-surface-alt p-6 text-center transition-colors hover:border-accent hover:bg-surface-alt">
            <Lightbulb className="mx-auto h-6 w-6 text-accent" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">Know a program that&apos;s not listed?</h3>
            <p className="mt-1 text-xs text-muted">
              Suggest a new observership, externship, or research program to help other IMGs.
            </p>
          </div>
        </Link>

        <p className="mt-8 text-center text-xs text-muted">
          USCEHub is an informational platform. Always verify details directly with institutions.
        </p>
      </TabsContent>

      {/* ============================================================ */}
      {/*  TAB 4 — Suggest a Program                                   */}
      {/* ============================================================ */}
      <TabsContent value="suggest">
        <SuggestProgramForm />
      </TabsContent>
    </Tabs>
  );
}

/* ------------------------------------------------------------------ */
/*  Suggest Program Form (inline for tab, also used as standalone)     */
/* ------------------------------------------------------------------ */

export function SuggestProgramForm({ standalone = false }: { standalone?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    hospitalName: "",
    city: "",
    state: "",
    programType: "",
    url: "",
    experience: "",
    details: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real app this would call an API
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-950/30 p-8 text-center">
        <ThumbsUp className="mx-auto h-8 w-8 text-emerald-400" />
        <h3 className="mt-3 text-lg font-semibold text-foreground">Thank you for your submission!</h3>
        <p className="mt-2 text-sm text-muted">
          Our admin team will review your program suggestion. Approved submissions will be added to the database.
        </p>
        <Button className="mt-5" variant="outline" onClick={() => { setSubmitted(false); setForm({ hospitalName: "", city: "", state: "", programType: "", url: "", experience: "", details: "" }); }}>
          Submit Another Program
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
        <Lightbulb className="h-5 w-5 text-accent" />
        Suggest a New Program
      </h2>
      <p className="mt-1 text-sm text-muted">
        Know of an observership, externship, or research program that&apos;s not in our database? Help other IMGs by submitting it for review.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-950/30 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
        <p className="text-xs leading-relaxed text-blue-200">
          All submissions are reviewed before publishing. USCEHub does not guarantee accuracy of user-submitted information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-border bg-surface-alt p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Hospital / Institution Name"
            placeholder="e.g., Mayo Clinic"
            value={form.hospitalName}
            onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
            required
          />
          <Select
            label="Program Type"
            value={form.programType}
            onChange={(e) => setForm({ ...form, programType: e.target.value })}
            required
          >
            <option value="">Select type</option>
            <option value="Observership">Observership</option>
            <option value="Externship">Externship</option>
            <option value="Research">Research</option>
            <option value="Clinical Rotation">Clinical Rotation</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Other">Other</option>
          </Select>
          <Input
            label="City"
            placeholder="e.g., Rochester"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <Select
            label="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            required
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <Input
              label="Program URL (if known)"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Your Experience with This Program"
              placeholder="Share how you found this program, application process, your experience, etc."
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Additional Details (cost, duration, specialty, etc.)"
              placeholder="e.g., $500 for 4 weeks, Internal Medicine, accepts J1/B1 visa holders"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <Button type="submit">
            <Send className="h-4 w-4" />
            Submit for Review
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Submissions are reviewed by our admin team before being added to the database.
        USCEHub does not guarantee accuracy of user-submitted information.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  US States list                                                     */
/* ------------------------------------------------------------------ */

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];
