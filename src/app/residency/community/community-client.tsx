"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeftRight,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";

const tabs = [
  {
    id: "discussions",
    label: "Discussions",
    icon: MessageSquare,
    title: "Resident Discussions",
    description:
      "Ask questions, share experiences, and connect with residents across specialties. Topics include clinical pearls, program reviews, work-life balance, and career advice.",
  },
  {
    id: "swap",
    label: "Swap Board",
    icon: ArrowLeftRight,
    title: "Rotation Swap Board",
    description:
      "Find residents looking to swap elective rotations, away rotations, or interview dates. Post your availability and browse open requests from other programs.",
  },
  {
    id: "articles",
    label: "Articles",
    icon: FileText,
    title: "Resident-Written Articles",
    description:
      "Read and publish articles on topics that matter to residents — from fellowship application guides to moonlighting advice to wellness strategies.",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function CommunityTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("discussions");
  const currentTab = tabs.find((t) => t.id === activeTab)!;
  const TabIcon = currentTab.icon;

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`
              inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${
                activeTab === id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground hover:border-border"
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content — Coming Soon */}
      <div className="rounded-xl border border-border bg-surface p-12 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-accent/10 p-4 mb-6">
          <TabIcon className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {currentTab.title}
        </h2>
        <p className="mt-3 text-muted max-w-lg mx-auto">
          {currentTab.description}
        </p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          <Sparkles className="h-4 w-4" />
          Coming Soon
        </div>

        <div className="mt-10 rounded-xl border border-border bg-surface-alt p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-accent" />
            <h3 className="text-base font-semibold text-foreground">
              Be the First to Contribute
            </h3>
          </div>
          <p className="text-sm text-muted mb-4">
            Create your USCEHub account and be among the first residents to
            shape our community when it launches.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Sign Up for Early Access
          </Link>
        </div>
      </div>
    </>
  );
}
