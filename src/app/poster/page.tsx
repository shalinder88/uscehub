export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CardRoot, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, LISTING_TYPE_LABELS } from "@/lib/utils";
import { List, FileText, Eye, Clock, ArrowRight } from "lucide-react";

export default async function PosterOverview() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [allListings, pendingListings, applications, recentListings] =
    await Promise.all([
      prisma.listing.count({
        where: { posterId: session.user.id },
      }),
      prisma.listing.count({
        where: { posterId: session.user.id, status: "PENDING" },
      }),
      prisma.application.count({
        where: {
          listing: { posterId: session.user.id },
        },
      }),
      prisma.listing.findMany({
        where: { posterId: session.user.id },
        select: {
          id: true,
          title: true,
          listingType: true,
          status: true,
          views: true,
          createdAt: true,
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const activeListings = await prisma.listing.count({
    where: { posterId: session.user.id, status: "APPROVED" },
  });

  const stats = [
    { label: "Total Listings", value: allListings, icon: List },
    { label: "Active Listings", value: activeListings, icon: Eye },
    { label: "Pending Review", value: pendingListings, icon: Clock },
    { label: "Applications", value: applications, icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Poster Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your listings and applications
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <CardRoot key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                <stat.icon className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </CardRoot>
        ))}
      </div>

      <CardRoot>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Listings</CardTitle>
          <Link
            href="/poster/listings"
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentListings.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              <p>No listings yet.</p>
              <Link
                href="/poster/listings/new"
                className="mt-2 inline-block font-medium text-slate-900 hover:underline"
              >
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/poster/listings/${listing.id}/edit`}
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        {LISTING_TYPE_LABELS[listing.listingType] ||
                          listing.listingType}
                      </span>
                      <span>{listing.views} views</span>
                      <span>{listing._count.applications} applications</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge
                      variant={
                        listing.status === "APPROVED"
                          ? "approved"
                          : listing.status === "PENDING"
                          ? "pending"
                          : listing.status === "REJECTED"
                          ? "rejected"
                          : "paused"
                      }
                    >
                      {listing.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDate(listing.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </CardRoot>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/poster/listings/new">
          <CardRoot className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900">
                Create New Listing
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Post a new clinical opportunity for applicants
              </p>
            </CardContent>
          </CardRoot>
        </Link>
        <Link href="/poster/applications">
          <CardRoot className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900">
                Review Applications
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                View and manage received applications
              </p>
            </CardContent>
          </CardRoot>
        </Link>
      </div>
    </div>
  );
}
