"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, APPLICATION_STATUS_LABELS } from "@/lib/utils";
import { FileText, User } from "lucide-react";

interface ApplicationItem {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  listingId: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    applicantProfile?: {
      medicalSchool: string | null;
      specialtyInterest: string | null;
      usmleStep1: string | null;
      usmleStep2: string | null;
      country: string | null;
    } | null;
  };
  listing?: {
    id: string;
    title: string;
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

export default function PosterApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchApplications();
    }
  }, [session]);

  async function fetchApplications() {
    try {
      // Fetch all poster's listings first, then get applications
      const res = await fetch("/api/poster-applications");
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

  async function handleStatusChange(applicationId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === applicationId ? { ...a, status: newStatus } : a
          )
        );
      }
    } catch {
      // handle silently
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
        <h1 className="text-2xl font-bold text-slate-900">
          Received Applications
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and manage applications to your listings
        </p>
      </div>

      {applications.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No applications received
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Applications will appear here when applicants apply to your
              listings
            </p>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <CardRoot key={app.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900">
                        {app.applicant.name}
                      </span>
                      <Badge variant={getStatusVariant(app.status)}>
                        {APPLICATION_STATUS_LABELS[app.status] || app.status}
                      </Badge>
                    </div>
                    {app.listing && (
                      <p className="mt-1 text-xs text-slate-500">
                        Applied to: {app.listing.title}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{app.applicant.email}</span>
                      {app.applicant.applicantProfile?.medicalSchool && (
                        <span>
                          {app.applicant.applicantProfile.medicalSchool}
                        </span>
                      )}
                      {app.applicant.applicantProfile?.country && (
                        <span>{app.applicant.applicantProfile.country}</span>
                      )}
                      {app.applicant.applicantProfile?.usmleStep1 && (
                        <span>
                          Step 1: {app.applicant.applicantProfile.usmleStep1}
                        </span>
                      )}
                      {app.applicant.applicantProfile?.usmleStep2 && (
                        <span>
                          Step 2: {app.applicant.applicantProfile.usmleStep2}
                        </span>
                      )}
                    </div>
                    {app.message && (
                      <p className="mt-2 text-sm text-slate-600">
                        &quot;{app.message}&quot;
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      Applied {formatDate(app.createdAt)}
                    </p>
                  </div>
                  {(app.status === "SUBMITTED" ||
                    app.status === "UNDER_REVIEW") && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusChange(app.id, "ACCEPTED")}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(app.id, "REJECTED")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </CardRoot>
          ))}
        </div>
      )}
    </div>
  );
}
