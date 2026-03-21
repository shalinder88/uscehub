import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CardRoot, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldCheck,
  List,
  Star,
  Flag,
  ArrowRight,
} from "lucide-react";

export default async function AdminOverview() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const [
    totalUsers,
    pendingPosters,
    pendingListings,
    pendingReviews,
    openFlags,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.posterProfile.count({
      where: { verificationStatus: "PENDING" },
    }),
    prisma.listing.count({
      where: { status: "PENDING" },
    }),
    prisma.review.count({
      where: { moderationStatus: "PENDING" },
    }),
    prisma.flagReport.count({
      where: { status: "OPEN" },
    }),
  ]);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Pending Posters",
      value: pendingPosters,
      icon: ShieldCheck,
      href: "/admin/posters",
      urgent: pendingPosters > 0,
    },
    {
      label: "Pending Listings",
      value: pendingListings,
      icon: List,
      href: "/admin/listings",
      urgent: pendingListings > 0,
    },
    {
      label: "Pending Reviews",
      value: pendingReviews,
      icon: Star,
      href: "/admin/reviews",
      urgent: pendingReviews > 0,
    },
    {
      label: "Open Flags",
      value: openFlags,
      icon: Flag,
      href: "/admin/flags",
      urgent: openFlags > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform overview and moderation tools
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <CardRoot
              className={`transition-shadow hover:shadow-md ${
                stat.urgent
                  ? "border-amber-200 bg-amber-50/30"
                  : ""
              }`}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    stat.urgent ? "bg-amber-100" : "bg-slate-100"
                  }`}
                >
                  <stat.icon
                    className={`h-6 w-6 ${
                      stat.urgent ? "text-amber-600" : "text-slate-600"
                    }`}
                  />
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pendingPosters > 0 && (
          <CardRoot className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-base">Review Poster Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                {pendingPosters} poster{pendingPosters !== 1 ? "s" : ""} awaiting
                verification
              </p>
              <Link href="/admin/posters">
                <Button size="sm" className="mt-3">
                  Review Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </CardRoot>
        )}

        {pendingListings > 0 && (
          <CardRoot className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-base">Review Pending Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                {pendingListings} listing{pendingListings !== 1 ? "s" : ""}{" "}
                awaiting approval
              </p>
              <Link href="/admin/listings">
                <Button size="sm" className="mt-3">
                  Review Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </CardRoot>
        )}

        {pendingReviews > 0 && (
          <CardRoot className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-base">Moderate Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                {pendingReviews} review{pendingReviews !== 1 ? "s" : ""} awaiting
                moderation
              </p>
              <Link href="/admin/reviews">
                <Button size="sm" className="mt-3">
                  Review Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </CardRoot>
        )}
      </div>
    </div>
  );
}
