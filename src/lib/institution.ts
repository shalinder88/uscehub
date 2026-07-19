import { prisma } from "@/lib/prisma";

export type OrgRole = "OWNER" | "COORDINATOR" | "VIEWER";

export interface InstitutionContext {
  org: {
    id: string;
    name: string;
    type: string | null;
    city: string;
    state: string;
    website: string | null;
    verificationStatus: string;
    badges: string;
  };
  role: OrgRole;
  canManage: boolean; // OWNER or COORDINATOR
}

/**
 * Resolve the organization a user acts within, and their role.
 * Prefers an explicit OrganizationMembership row; falls back to legacy
 * single-owner ownership (Organization.ownerId) so orgs created before
 * memberships still resolve. Returns null if the user belongs to no org.
 */
export async function resolveInstitutionContext(
  userId: string,
): Promise<InstitutionContext | null> {
  const membership = await prisma.organizationMembership.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  let org = membership?.organization ?? null;
  let role: OrgRole = (membership?.role as OrgRole) ?? "OWNER";

  if (!org) {
    const owned = await prisma.organization.findUnique({ where: { ownerId: userId } });
    if (!owned) return null;
    org = owned;
    role = "OWNER";
  }

  return {
    org: {
      id: org.id,
      name: org.name,
      type: org.type,
      city: org.city,
      state: org.state,
      website: org.website,
      verificationStatus: org.verificationStatus,
      badges: org.badges,
    },
    role,
    canManage: role === "OWNER" || role === "COORDINATOR",
  };
}

/**
 * Can this user manage the given listing's applications? True if they are the
 * listing's direct poster, an admin, or an OWNER/COORDINATOR member of the
 * listing's organization. VIEWER members are read-only (false).
 */
export async function canManageListing(
  userId: string,
  listingId: string,
  isAdmin = false,
): Promise<boolean> {
  if (isAdmin) return true;
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { posterId: true, organizationId: true },
  });
  if (!listing) return false;
  if (listing.posterId === userId) return true;
  if (!listing.organizationId) return false;
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      organizationId: listing.organizationId,
      userId,
      role: { in: ["OWNER", "COORDINATOR"] },
    },
  });
  return !!membership;
}

/**
 * Cheap check for whether the applicant pipeline is worth showing at all.
 * Kept separate from getInstitutionAnalytics so the layout can gate nav
 * without paying for the full analytics query on every page render.
 */
export async function isPipelineActive(orgId: string): Promise<boolean> {
  const [apps, platformListing] = await Promise.all([
    prisma.application.count({ where: { listing: { organizationId: orgId } } }),
    prisma.listing.findFirst({
      where: { organizationId: orgId, applicationMethod: "platform" },
      select: { id: true },
    }),
  ]);
  return apps > 0 || !!platformListing;
}

export interface ListingPerformance {
  id: string;
  title: string;
  listingType: string;
  status: string;
  linkVerified: boolean;
  views: number;
  saves: number;
  applications: number;
  accepted: number;
  applicationMethod: string;
  sourceVerified: boolean;
  lastVerifiedAt: string | null;
}

export interface InstitutionAnalytics {
  totals: {
    activeListings: number;
    totalListings: number;
    views: number;
    saves: number;
    applications: number;
    accepted: number;
  };
  /**
   * Interest funnel (views -> saves). Always meaningful: every listing
   * accrues views and saves regardless of how applicants actually apply.
   */
  funnel: { label: string; value: number }[];
  /**
   * True only when in-platform applications are actually possible for this
   * org -- either an application already exists, or a listing routes
   * applications through USCEHub rather than off-site.
   *
   * Almost every listing today sends applicants to the institution's own
   * site (external / VSLO / AAMC), so the applicant pipeline would render as
   * permanent zeroes. We hide it rather than show a dead surface, and it
   * lights up on its own the moment either condition becomes true.
   */
  pipelineActive: boolean;
  pipeline: Record<string, number>; // ApplicationStatus -> count
  /** Source-link freshness -- the thing a coordinator can actually act on. */
  freshness: {
    verified: number;
    unverified: number;
    lastCheckedAt: string | null;
  };
  listings: ListingPerformance[];
  team: { name: string; email: string; role: string; title: string | null }[];
}

const PIPELINE_ORDER = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "COMPLETED",
  "REJECTED",
  "WITHDRAWN",
];

export async function getInstitutionAnalytics(
  orgId: string,
): Promise<InstitutionAnalytics> {
  const [listings, appByListing, appByStatus, memberships] = await Promise.all([
    prisma.listing.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        title: true,
        listingType: true,
        status: true,
        linkVerified: true,
        views: true,
        applicationMethod: true,
        lastVerifiedAt: true,
        _count: { select: { applications: true, savedBy: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.groupBy({
      by: ["listingId", "status"],
      where: { listing: { organizationId: orgId } },
      _count: { _all: true },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { listing: { organizationId: orgId } },
      _count: { _all: true },
    }),
    prisma.organizationMembership.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const acceptedByListing = new Map<string, number>();
  for (const row of appByListing) {
    if (row.status === "ACCEPTED" || row.status === "COMPLETED") {
      acceptedByListing.set(
        row.listingId,
        (acceptedByListing.get(row.listingId) ?? 0) + row._count._all,
      );
    }
  }

  const listingPerf: ListingPerformance[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    listingType: l.listingType,
    status: l.status,
    linkVerified: l.linkVerified,
    views: l.views,
    saves: l._count.savedBy,
    applications: l._count.applications,
    accepted: acceptedByListing.get(l.id) ?? 0,
    applicationMethod: l.applicationMethod,
    sourceVerified: l.linkVerified,
    lastVerifiedAt: l.lastVerifiedAt ? l.lastVerifiedAt.toISOString() : null,
  }));

  const totals = {
    activeListings: listings.filter((l) => l.status === "APPROVED").length,
    totalListings: listings.length,
    views: listingPerf.reduce((s, l) => s + l.views, 0),
    saves: listingPerf.reduce((s, l) => s + l.saves, 0),
    applications: listingPerf.reduce((s, l) => s + l.applications, 0),
    accepted: listingPerf.reduce((s, l) => s + l.accepted, 0),
  };

  const pipeline: Record<string, number> = {};
  for (const key of PIPELINE_ORDER) pipeline[key] = 0;
  for (const row of appByStatus) pipeline[row.status] = row._count._all;

  const pipelineActive =
    totals.applications > 0 ||
    listings.some((l) => l.applicationMethod === "platform");

  const verifiedDates = listings
    .map((l) => l.lastVerifiedAt)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime());

  const freshness = {
    verified: listings.filter((l) => l.linkVerified).length,
    unverified: listings.filter((l) => !l.linkVerified).length,
    lastCheckedAt: verifiedDates[0] ? verifiedDates[0].toISOString() : null,
  };

  // The interest funnel stops at "Saved" unless applications can actually
  // land here -- otherwise every institution sees Applied: 0 forever.
  const funnel = [
    { label: "Views", value: totals.views },
    { label: "Saved", value: totals.saves },
    ...(pipelineActive
      ? [
          { label: "Applied", value: totals.applications },
          { label: "Accepted", value: totals.accepted },
        ]
      : []),
  ];

  return {
    totals,
    funnel,
    pipelineActive,
    freshness,
    pipeline,
    listings: listingPerf,
    team: memberships.map((m) => ({
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      title: m.title,
    })),
  };
}
