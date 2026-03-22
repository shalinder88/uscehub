export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CardRoot, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, APPLICATION_STATUS_LABELS, LISTING_TYPE_LABELS } from "@/lib/utils";
import { FileText, Bookmark, Star, ArrowRight } from "lucide-react";

export default async function DashboardOverview() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [applicationCount, savedCount, reviewCount, recentApplications] =
    await Promise.all([
      prisma.application.count({
        where: { applicantId: session.user.id },
      }),
      prisma.savedListing.count({
        where: { userId: session.user.id },
      }),
      prisma.review.count({
        where: { userId: session.user.id },
      }),
      prisma.application.findMany({
        where: { applicantId: session.user.id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              listingType: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    {
      label: "Applications",
      value: applicationCount,
      icon: FileText,
      href: "/dashboard/applications",
    },
    {
      label: "Saved Listings",
      value: savedCount,
      icon: Bookmark,
      href: "/dashboard/saved",
    },
    {
      label: "Reviews Written",
      value: reviewCount,
      icon: Star,
      href: "/dashboard/reviews",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s an overview of your activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <CardRoot className="transition-shadow hover:shadow-md">
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
          </Link>
        ))}
      </div>

      <CardRoot>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Link
            href="/dashboard/applications"
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              <p>No applications yet.</p>
              <Link
                href="/browse"
                className="mt-2 inline-block font-medium text-slate-900 hover:underline"
              >
                Browse opportunities
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/listing/${app.listing.id}`}
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {app.listing.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <span>
                        {LISTING_TYPE_LABELS[app.listing.listingType] ||
                          app.listing.listingType}
                      </span>
                      <span>
                        {app.listing.city}, {app.listing.state}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        app.status === "ACCEPTED"
                          ? "approved"
                          : app.status === "REJECTED"
                          ? "rejected"
                          : app.status === "SUBMITTED"
                          ? "info"
                          : "pending"
                      }
                    >
                      {APPLICATION_STATUS_LABELS[app.status] || app.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDate(app.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </CardRoot>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/browse">
          <CardRoot className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900">
                Browse Opportunities
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter through hundreds of clinical experiences
              </p>
            </CardContent>
          </CardRoot>
        </Link>
        <Link href="/dashboard/profile">
          <CardRoot className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900">
                Complete Your Profile
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add your credentials and scores to stand out to programs
              </p>
            </CardContent>
          </CardRoot>
        </Link>
      </div>
    </div>
  );
}
