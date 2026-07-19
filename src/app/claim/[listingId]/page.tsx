export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClaimForm } from "./claim-form";

export const metadata = { robots: { index: false, follow: false } };

export default async function ClaimListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/claim/${listingId}`);
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      specialty: true,
      city: true,
      state: true,
      organization: { select: { name: true } },
    },
  });
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6" style={{ background: "var(--bg)" }}>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Claim this program
      </p>
      <h1 className="mt-1 text-3xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
        {listing.title}
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
        {listing.specialty} · {listing.city}, {listing.state}
        {listing.organization?.name ? ` · ${listing.organization.name}` : ""}
      </p>

      <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: "var(--paper-soft)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>
        Claiming lets a verified coordinator keep this program&apos;s
        information accurate and manage applicants. Verification confirms your
        institutional affiliation so you can <strong>manage information</strong> —
        it is not an endorsement or approval of the program by USCEHub.
      </div>

      <div className="mt-6">
        <ClaimForm listingId={listing.id} defaultName={session.user.name ?? ""} />
      </div>
    </div>
  );
}
