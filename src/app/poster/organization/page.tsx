"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CardRoot, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { US_STATES } from "@/lib/utils";

interface OrgData {
  id?: string;
  name: string;
  type: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  description: string;
}

const emptyOrg: OrgData = {
  name: "",
  type: "",
  contactName: "",
  contactEmail: "",
  phone: "",
  website: "",
  city: "",
  state: "",
  description: "",
};

const ORG_TYPES = [
  "Hospital",
  "University Hospital",
  "Academic Medical Center",
  "Community Hospital",
  "Private Practice",
  "Research Institution",
  "Clinic",
  "Other",
];

export default function OrganizationPage() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<OrgData>(emptyOrg);
  const [isNew, setIsNew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchOrganization();
    }
  }, [session]);

  async function fetchOrganization() {
    try {
      const res = await fetch(
        `/api/organizations?ownerId=${session?.user?.id}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrg({
          id: data.id,
          name: data.name || "",
          type: data.type || "",
          contactName: data.contactName || "",
          contactEmail: data.contactEmail || "",
          phone: data.phone || "",
          website: data.website || "",
          city: data.city || "",
          state: data.state || "",
          description: data.description || "",
        });
        setIsNew(false);
      }
    } catch {
      // No organization yet
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch("/api/organizations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(org),
      });

      if (res.ok) {
        const data = await res.json();
        setOrg((prev) => ({ ...prev, id: data.id }));
        setIsNew(false);
        setMessage(
          isNew
            ? "Organization created successfully."
            : "Organization updated successfully."
        );
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save organization.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof OrgData, value: string) {
    setOrg((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading organization...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isNew ? "Create Organization" : "Edit Organization"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isNew
            ? "Set up your organization to start posting listings"
            : "Update your organization information"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <CardRoot>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Basic information about your institution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Organization Name"
              value={org.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Metropolitan Hospital"
              required
            />
            <Select
              id="type"
              label="Organization Type"
              value={org.type}
              onChange={(e) => updateField("type", e.target.value)}
            >
              <option value="">Select type</option>
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Textarea
              id="description"
              label="Description"
              value={org.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Tell applicants about your organization..."
              rows={3}
            />
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How applicants can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="contactName"
                label="Contact Name"
                value={org.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                placeholder="Program Coordinator"
              />
              <Input
                id="contactEmail"
                label="Contact Email"
                type="email"
                value={org.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                placeholder="contact@hospital.org"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="phone"
                label="Phone"
                value={org.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
              <Input
                id="website"
                label="Website"
                value={org.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://www.hospital.org"
              />
            </div>
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where your organization is located</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="city"
                label="City"
                value={org.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="New York"
                required
              />
              <Select
                id="state"
                label="State"
                value={org.state}
                onChange={(e) => updateField("state", e.target.value)}
                required
              >
                <option value="">Select state</option>
                {Object.entries(US_STATES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </CardRoot>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isNew
              ? "Create Organization"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
