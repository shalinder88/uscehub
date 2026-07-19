export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveInstitutionContext } from "@/lib/institution";
import { ApplicationsPipeline } from "./pipeline-client";
import type { PipelineApplication } from "./pipeline-client";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const ctx = await resolveInstitutionContext(session.user.id);
  if (!ctx) {
    return (
      <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        Set up your organization first.{" "}
        <Link href="/poster/organization" style={{ color: "var(--teal)" }}>Create organization</Link>.
      </div>
    );
  }

  const rows = await prisma.application.findMany({
    where: { listing: { organizationId: ctx.org.id } },
    include: {
      applicant: {
        select: {
          name: true,
          email: true,
          applicantProfile: {
            select: {
              medicalSchool: true,
              country: true,
              graduationYear: true,
              specialtyInterest: true,
              usmleStep1: true,
              usmleStep2: true,
              visaStatus: true,
              ecfmgStatus: true,
            },
          },
        },
      },
      listing: { select: { id: true, title: true } },
      notes: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const applications: PipelineApplication[] = rows.map((r) => ({
    id: r.id,
    status: r.status,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    applicantName: r.applicant.name,
    applicantEmail: r.applicant.email,
    school: r.applicant.applicantProfile?.medicalSchool ?? null,
    country: r.applicant.applicantProfile?.country ?? null,
    graduationYear: r.applicant.applicantProfile?.graduationYear ?? null,
    step1: r.applicant.applicantProfile?.usmleStep1 ?? null,
    step2: r.applicant.applicantProfile?.usmleStep2 ?? null,
    visaStatus: r.applicant.applicantProfile?.visaStatus ?? null,
    ecfmgStatus: r.applicant.applicantProfile?.ecfmgStatus ?? null,
    listingId: r.listing.id,
    listingTitle: r.listing.title,
    notes: r.notes.map((nte) => ({
      id: nte.id,
      body: nte.body,
      authorName: nte.author.name,
      createdAt: nte.createdAt.toISOString(),
    })),
  }));

  const listings = Array.from(
    new Map(applications.map((a) => [a.listingId, a.listingTitle])).entries(),
  ).map(([id, title]) => ({ id, title }));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          {ctx.org.name}
        </p>
        <h1 className="mt-1 text-2xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
          Applicant pipeline
        </h1>
      </header>
      <ApplicationsPipeline
        applications={applications}
        listings={listings}
        canManage={ctx.canManage}
      />
    </div>
  );
}
