export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClaimsReview } from "./claims-review";
import type { ClaimRow } from "./claims-review";

export default async function AdminClaimsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const rows = await prisma.organizationClaim.findMany({
    where: { status: "PENDING" },
    include: {
      claimant: { select: { name: true, email: true } },
      listing: { select: { title: true } },
      organization: { select: { name: true, website: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const claims: ClaimRow[] = rows.map((c) => ({
    id: c.id,
    contactName: c.contactName,
    institutionName: c.institutionName,
    institutionEmail: c.institutionEmail,
    title: c.title,
    message: c.message,
    domainMatch: c.domainMatch,
    claimantName: c.claimant.name,
    claimantEmail: c.claimant.email,
    listingTitle: c.listing?.title ?? null,
    orgName: c.organization?.name ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Institution claims</h1>
        <p className="mt-1 text-sm text-slate-500">
          Confirm the institutional email affiliation, then approve to grant the
          coordinator access to manage the program. Approval is not an endorsement.
        </p>
      </div>
      <ClaimsReview claims={claims} />
    </div>
  );
}
