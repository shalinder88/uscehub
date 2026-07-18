export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveInstitutionContext } from "@/lib/institution";
import { TeamManager } from "./team-client";
import type { TeamMember } from "./team-client";

export default async function TeamPage() {
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

  const rows = await prisma.organizationMembership.findMany({
    where: { organizationId: ctx.org.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const members: TeamMember[] = rows.map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    title: m.title,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          {ctx.org.name}
        </p>
        <h1 className="mt-1 text-2xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
          Team & coordinators
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
          Coordinators can manage listings and applicants. Viewers have read-only access.
        </p>
      </header>
      <TeamManager members={members} isOwner={ctx.role === "OWNER"} />
    </div>
  );
}
