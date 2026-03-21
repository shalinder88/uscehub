"use client";

import { useState, useEffect } from "react";
import { CardRoot, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, User } from "lucide-react";

interface PosterItem {
  id: string;
  npiNumber: string | null;
  institutionalEmail: string | null;
  verificationStatus: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminPostersPage() {
  const [posters, setPosters] = useState<PosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPosters();
  }, []);

  async function fetchPosters() {
    try {
      const res = await fetch("/api/admin/posters");
      if (res.ok) {
        const data = await res.json();
        setPosters(data);
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(posterId: string, action: string) {
    setActionLoading(posterId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "approve" ? "approve_poster" : "reject_poster",
          targetId: posterId,
        }),
      });

      if (res.ok) {
        setPosters((prev) =>
          prev.map((p) =>
            p.id === posterId
              ? {
                  ...p,
                  verificationStatus:
                    action === "approve" ? "APPROVED" : "REJECTED",
                }
              : p
          )
        );
      }
    } catch {
      // handle silently
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading pending posters...</p>
      </div>
    );
  }

  const pendingPosters = posters.filter(
    (p) => p.verificationStatus === "PENDING"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Pending Poster Verifications
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and verify poster credentials
        </p>
      </div>

      {pendingPosters.length === 0 ? (
        <CardRoot>
          <CardContent className="flex flex-col items-center py-12">
            <ShieldCheck className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No pending verifications
            </p>
            <p className="mt-1 text-sm text-slate-500">
              All poster verifications have been reviewed
            </p>
          </CardContent>
        </CardRoot>
      ) : (
        <div className="space-y-3">
          {pendingPosters.map((poster) => (
            <CardRoot key={poster.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900">
                        {poster.user.name}
                      </span>
                      <Badge variant="pending">Pending</Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-500">
                          Email:
                        </span>{" "}
                        {poster.user.email}
                      </p>
                      {poster.npiNumber && (
                        <p>
                          <span className="font-medium text-slate-500">
                            NPI:
                          </span>{" "}
                          {poster.npiNumber}
                        </p>
                      )}
                      {poster.institutionalEmail && (
                        <p>
                          <span className="font-medium text-slate-500">
                            Institutional Email:
                          </span>{" "}
                          {poster.institutionalEmail}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Submitted {formatDate(poster.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={actionLoading === poster.id}
                      onClick={() => handleAction(poster.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionLoading === poster.id}
                      onClick={() => handleAction(poster.id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CardRoot>
          ))}
        </div>
      )}
    </div>
  );
}
