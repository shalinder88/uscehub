export const dynamic = "force-dynamic";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AcceptInvite } from "./accept-client";

export const metadata = { robots: { index: false, follow: false } };

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  COORDINATOR: "Coordinator",
  VIEWER: "Viewer",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center" style={{ background: "var(--bg)" }}>
      {children}
    </div>
  );
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: { organization: { select: { name: true, city: true, state: true } } },
  });

  if (!invite) {
    return (
      <Shell>
        <h1 className="text-2xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
          Invitation not found
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
          This link may have been mistyped or already used.
        </p>
      </Shell>
    );
  }

  const expired = invite.expiresAt.getTime() < Date.now();
  const inactive = invite.status !== "PENDING" || expired;

  if (inactive) {
    const reason =
      invite.status === "ACCEPTED"
        ? "This invitation has already been accepted."
        : invite.status === "REVOKED"
          ? "This invitation was withdrawn by the organization."
          : "This invitation has expired.";
    return (
      <Shell>
        <h1 className="text-2xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
          Invitation no longer active
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>{reason}</p>
        <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
          Ask {invite.organization.name} to send a new one.
        </p>
      </Shell>
    );
  }

  const roleLabel = ROLE_LABEL[invite.role] ?? invite.role;

  // Not signed in — send them to sign in (or create an account) and come back.
  if (!session?.user) {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Invitation
        </p>
        <h1 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
          Join {invite.organization.name}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--ink-soft)" }}>
          You&apos;ve been invited as <strong>{roleLabel}</strong>. Sign in as{" "}
          <strong>{invite.email}</strong> to accept — or create a free account with
          that address first.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/auth/signin?callbackUrl=/invite/${token}`}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "var(--teal)" }}
          >
            Sign in
          </Link>
          <Link
            href={`/auth/signup?callbackUrl=/invite/${token}`}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold"
            style={{ border: "1px solid var(--line)", color: "var(--ink)" }}
          >
            Create account
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Invitation
      </p>
      <h1 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
        Join {invite.organization.name}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--ink-soft)" }}>
        {invite.organization.city}, {invite.organization.state} — invited as{" "}
        <strong>{roleLabel}</strong>.
      </p>
      <div className="mt-6">
        <AcceptInvite
          token={token}
          invitedEmail={invite.email}
          signedInEmail={session.user.email ?? ""}
          roleLabel={roleLabel}
        />
      </div>
      <p className="mx-auto mt-6 max-w-md text-xs" style={{ color: "var(--text-muted)" }}>
        Joining lets you keep this institution&apos;s program information accurate and
        manage applicants. It does not imply USCEHub endorses the programs.
      </p>
    </Shell>
  );
}
