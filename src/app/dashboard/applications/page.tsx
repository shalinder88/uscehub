"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, APPLICATION_STATUS_LABELS, LISTING_TYPE_LABELS } from "@/lib/utils";
import { FileText, MapPin } from "lucide-react";

interface ApplicationItem {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    listingType: string;
    specialty: string;
    city: string;
    state: string;
    organization?: {
      id: string;
      name: string;
    } | null;
  };
}

function getStatusVariant(status: string) {
  switch (status) {
    case "ACCEPTED":
    case "COMPLETED":
      return "approved" as const;
    case "REJECTED":
      return "rejected" as const;
    case "SUBMITTED":
      return "info" as const;
    case "UNDER_REVIEW":
      return "pending" as const;
    case "WITHDRAWN":
      return "paused" as const;
    default:
      return "default" as const;
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track the status of your applications
        </p>
      </div>

      {applications.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No applications yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Start applying to clinical opportunities
            </p>
            <Link
              href="/browse"
              className="mt-4 text-sm font-medium text-slate-900 hover:underline"
            >
              Browse Listings
            </Link>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <CardRoot key={app.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/listing/${app.listing.id}`}
                      className="text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {app.listing.title}
                    </Link>
                    <Badge
                      variant={
                        app.listing.listingType.toLowerCase() as
                          | "observership"
                          | "externship"
                          | "research"
                      }
                    >
                      {LISTING_TYPE_LABELS[app.listing.listingType] ||
                        app.listing.listingType}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {app.listing.organization && (
                      <span>{app.listing.organization.name}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {app.listing.city}, {app.listing.state}
                    </span>
                    <span>{app.listing.specialty}</span>
                  </div>
                  {app.message && (
                    <p className="mt-1 text-xs text-slate-400 truncate max-w-md">
                      {app.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <Badge variant={getStatusVariant(app.status)}>
                    {APPLICATION_STATUS_LABELS[app.status] || app.status}
                  </Badge>
                  <span className="whitespace-nowrap text-xs text-slate-400">
                    {formatDate(app.createdAt)}
                  </span>
                </div>
              </CardContent>
            </CardRoot>
          ))}
        </div>
      )}
    </div>
  );
}
