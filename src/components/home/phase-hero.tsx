"use client";

import { useJourney } from "@/components/providers/journey-provider";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Stethoscope,
  Briefcase,
  MapPin,
  Scale,
  FileCheck,
  Users,
  ArrowRight,
  ClipboardCheck,
  HeartPulse,
} from "lucide-react";

export function ResidentHero() {
  const stats = [
    { value: "20+", label: "Teaching Resources", icon: BookOpen, href: "/residency/resources" },
    { value: "10+", label: "Fellowship Programs", icon: GraduationCap, href: "/residency/fellowship" },
    { value: "6", label: "Board Exam Guides", icon: ClipboardCheck, href: "/residency/boards" },
    { value: "4", label: "Survival Sections", icon: HeartPulse, href: "/residency/survival" },
  ];

  return (
    <section className="bg-gradient-to-b from-background via-background to-surface">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            <Stethoscope className="h-3.5 w-3.5 text-cyan" />
            Phase 2 — Residency
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Your Residency{" "}
            <span className="bg-gradient-to-r from-cyan to-accent bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Teaching materials, fellowship intelligence, board prep, and community — for{" "}
            <strong className="text-foreground">all</strong> residents.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/residency/resources"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Explore Resources
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/residency/fellowship"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-alt"
            >
              Fellowship Database
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group rounded-xl border border-border bg-surface p-5 text-center transition-all hover:border-accent/50 hover:bg-surface-alt"
              >
                <Icon className="mx-auto h-5 w-5 text-cyan" />
                <div className="mt-2 text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-0.5 text-xs text-muted">{stat.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AttendingHero() {
  const stats = [
    { value: "250+", label: "Waiver Jobs", icon: Briefcase, href: "/career/jobs" },
    { value: "50", label: "States Covered", icon: MapPin, href: "/career/waiver" },
    { value: "6", label: "Verified Attorney Firms", icon: Scale, href: "/career/attorneys" },
    { value: "4", label: "Visa Pathways", icon: FileCheck, href: "/career/citizenship" },
  ];

  return (
    <section className="bg-gradient-to-b from-background via-background to-surface">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            <Briefcase className="h-3.5 w-3.5 text-success" />
            Phase 3 — Career
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Navigate Your{" "}
            <span className="bg-gradient-to-r from-success to-cyan bg-clip-text text-transparent">
              Attending Career
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">
            J-1 waiver intelligence, job search, immigration guidance, and contract tools for physicians transitioning to independent practice.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/career/jobs"
              className="inline-flex items-center gap-2 rounded-lg bg-success px-6 py-3 text-sm font-semibold text-background transition-all hover:brightness-110"
            >
              Browse Waiver Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/career/waiver"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-alt"
            >
              State Intelligence
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group rounded-xl border border-border bg-surface p-5 text-center transition-all hover:border-accent/50 hover:bg-surface-alt"
              >
                <Icon className="mx-auto h-5 w-5 text-success" />
                <div className="mt-2 text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-0.5 text-xs text-muted">{stat.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PhaseCards() {
  const { phase } = useJourney();

  const phases = [
    {
      id: "medical_graduate" as const,
      label: "USCE",
      description: "Observerships, externships, match prep",
      icon: GraduationCap,
      href: "/browse",
      color: "text-accent",
      stats: "207+ programs",
    },
    {
      id: "resident" as const,
      label: "Residency",
      description: "Teaching, fellowship, boards, survival",
      icon: Stethoscope,
      href: "/residency",
      color: "text-cyan",
      stats: "20+ resources",
    },
    {
      id: "attending" as const,
      label: "Career",
      description: "Waiver jobs, immigration, contracts",
      icon: Briefcase,
      href: "/career",
      color: "text-success",
      stats: "50 states covered",
    },
  ];

  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            One Platform, Three Phases
          </h2>
          <p className="mt-2 text-sm text-muted">
            From USCE to residency to attending career — your full IMG journey.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {phases.map((p) => {
            const Icon = p.icon;
            const isActive = phase === p.id;

            return (
              <Link
                key={p.id}
                href={p.href}
                className={`group rounded-xl border p-6 transition-all hover-glow ${
                  isActive
                    ? "border-accent bg-accent/5"
                    : "border-border bg-surface-alt hover:border-accent/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${p.color}`} />
                  <div>
                    <h3 className="font-semibold text-foreground">{p.label}</h3>
                    <p className="text-xs text-muted">{p.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">{p.stats}</span>
                  <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </div>
                {isActive && (
                  <div className="mt-3 text-[10px] font-medium uppercase tracking-wider text-accent">
                    Current phase
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
