"use client";

import { useState, useEffect } from "react";
import { CardRoot, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, XCircle, AlertCircle } from "lucide-react";

interface PosterProfileData {
  npiNumber: string | null;
  institutionalEmail: string | null;
  verificationStatus: string;
}

export default function VerificationPage() {
  const [profile, setProfile] = useState<PosterProfileData | null>(null);
  const [npiNumber, setNpiNumber] = useState("");
  const [institutionalEmail, setInstitutionalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/poster-profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setNpiNumber(data.npiNumber || "");
        setInstitutionalEmail(data.institutionalEmail || "");
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (!npiNumber && !institutionalEmail) {
      setError("Please provide either an NPI number or institutional email.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/poster-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npiNumber, institutionalEmail }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setMessage("Verification request submitted. Our team will review it shortly.");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit verification.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading verification status...</p>
      </div>
    );
  }

  const status = profile?.verificationStatus || "UNVERIFIED";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification</h1>
        <p className="mt-1 text-sm text-slate-500">
          Verify your credentials to build trust with applicants
        </p>
      </div>

      <CardRoot>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "APPROVED" && (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">Verified</p>
                <p className="text-sm text-emerald-600">
                  Your credentials have been verified. A badge will appear on
                  your listings.
                </p>
              </div>
              <Badge variant="approved" className="ml-auto">
                Verified
              </Badge>
            </div>
          )}

          {status === "PENDING" && (
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-4">
              <Clock className="h-8 w-8 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">
                  Verification Pending
                </p>
                <p className="text-sm text-amber-600">
                  Your verification request is being reviewed by our team. This
                  usually takes 1-3 business days.
                </p>
              </div>
              <Badge variant="pending" className="ml-auto">
                Pending
              </Badge>
            </div>
          )}

          {status === "REJECTED" && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">
                  Verification Rejected
                </p>
                <p className="text-sm text-red-600">
                  Your verification was not approved. Please check your details
                  and resubmit, or contact support for assistance.
                </p>
              </div>
              <Badge variant="rejected" className="ml-auto">
                Rejected
              </Badge>
            </div>
          )}

          {status === "UNVERIFIED" && (
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <AlertCircle className="h-8 w-8 text-slate-400" />
              <div>
                <p className="font-semibold text-slate-800">Not Verified</p>
                <p className="text-sm text-slate-500">
                  Submit your NPI number and institutional email to get verified.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </CardRoot>

      {status !== "APPROVED" && (
        <CardRoot>
          <CardHeader>
            <CardTitle>Submit Verification</CardTitle>
            <CardDescription>
              Provide your credentials for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Input
                id="npiNumber"
                label="NPI Number"
                value={npiNumber}
                onChange={(e) => setNpiNumber(e.target.value)}
                placeholder="10-digit NPI number"
              />
              <Input
                id="institutionalEmail"
                label="Institutional Email"
                type="email"
                value={institutionalEmail}
                onChange={(e) => setInstitutionalEmail(e.target.value)}
                placeholder="you@hospital.edu"
              />
              <p className="text-xs text-slate-400">
                Provide at least one of the above. An institutional email
                (ending in .edu or .org) speeds up verification.
              </p>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Submitting..." : "Submit for Verification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </CardRoot>
      )}
    </div>
  );
}
