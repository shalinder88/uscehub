"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { CardRoot, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { US_STATES, SPECIALTIES, LISTING_TYPE_LABELS } from "@/lib/utils";

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    listingType: "OBSERVERSHIP",
    specialty: "",
    city: "",
    state: "",
    country: "USA",
    format: "IN_PERSON",
    shortDescription: "",
    fullDescription: "",
    duration: "",
    cost: "",
    applicationMethod: "website",
    contactEmail: "",
    eligibilitySummary: "",
    startDate: "",
    applicationDeadline: "",
    certificateOffered: false,
    lorPossible: false,
    visaSupport: false,
    housingSupport: "",
    websiteUrl: "",
    numberOfSpots: "",
    supervisingPhysician: "",
    graduationYearPref: "",
    stepRequirements: "",
    ecfmgRequired: "",
  });

  useEffect(() => {
    fetchListing();
  }, [id]);

  async function fetchListing() {
    try {
      const res = await fetch(`/api/listings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          title: data.title || "",
          listingType: data.listingType || "OBSERVERSHIP",
          specialty: data.specialty || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "USA",
          format: data.format || "IN_PERSON",
          shortDescription: data.shortDescription || "",
          fullDescription: data.fullDescription || "",
          duration: data.duration || "",
          cost: data.cost || "",
          applicationMethod: data.applicationMethod || "website",
          contactEmail: data.contactEmail || "",
          eligibilitySummary: data.eligibilitySummary || "",
          startDate: data.startDate || "",
          applicationDeadline: data.applicationDeadline || "",
          certificateOffered: data.certificateOffered || false,
          lorPossible: data.lorPossible || false,
          visaSupport: data.visaSupport || false,
          housingSupport: data.housingSupport || "",
          websiteUrl: data.websiteUrl || "",
          numberOfSpots: data.numberOfSpots || "",
          supervisingPhysician: data.supervisingPhysician || "",
          graduationYearPref: data.graduationYearPref || "",
          stepRequirements: data.stepRequirements || "",
          ecfmgRequired: data.ecfmgRequired || "",
        });
      } else {
        setError("Listing not found.");
      }
    } catch {
      setError("Failed to load listing.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("Listing updated successfully.");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update listing.");
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
        <p className="text-sm text-slate-500">Loading listing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Listing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update the details of your listing
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
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Required details about the opportunity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              label="Title *"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="listingType"
                label="Type *"
                value={form.listingType}
                onChange={(e) => updateField("listingType", e.target.value)}
                required
              >
                {Object.entries(LISTING_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Select
                id="specialty"
                label="Specialty *"
                value={form.specialty}
                onChange={(e) => updateField("specialty", e.target.value)}
                required
              >
                <option value="">Select specialty</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              id="shortDescription"
              label="Short Description *"
              value={form.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
              rows={2}
              required
            />
            <Textarea
              id="fullDescription"
              label="Full Description"
              value={form.fullDescription}
              onChange={(e) => updateField("fullDescription", e.target.value)}
              rows={5}
            />
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="city"
                label="City *"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
              <Select
                id="state"
                label="State *"
                value={form.state}
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
              <Select
                id="format"
                label="Format"
                value={form.format}
                onChange={(e) => updateField("format", e.target.value)}
              >
                <option value="IN_PERSON">In Person</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </Select>
            </div>
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Duration & Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="duration"
                label="Duration *"
                value={form.duration}
                onChange={(e) => updateField("duration", e.target.value)}
                required
              />
              <Input
                id="cost"
                label="Cost *"
                value={form.cost}
                onChange={(e) => updateField("cost", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="startDate"
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
              />
              <Input
                id="applicationDeadline"
                label="Application Deadline"
                type="date"
                value={form.applicationDeadline}
                onChange={(e) =>
                  updateField("applicationDeadline", e.target.value)
                }
              />
            </div>
            <Input
              id="numberOfSpots"
              label="Number of Spots"
              value={form.numberOfSpots}
              onChange={(e) => updateField("numberOfSpots", e.target.value)}
            />
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Benefits & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={form.certificateOffered}
                  onChange={(e) =>
                    updateField("certificateOffered", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Certificate Offered
                </span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={form.visaSupport}
                  onChange={(e) =>
                    updateField("visaSupport", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Visa Support
                </span>
              </label>
            </div>
            <Input
              id="housingSupport"
              label="Housing Support"
              value={form.housingSupport}
              onChange={(e) => updateField("housingSupport", e.target.value)}
            />
            <Input
              id="supervisingPhysician"
              label="Supervising Physician"
              value={form.supervisingPhysician}
              onChange={(e) =>
                updateField("supervisingPhysician", e.target.value)
              }
            />
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="eligibilitySummary"
              label="Eligibility Summary"
              value={form.eligibilitySummary}
              onChange={(e) =>
                updateField("eligibilitySummary", e.target.value)
              }
              rows={2}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                id="graduationYearPref"
                label="Graduation Year Preference"
                value={form.graduationYearPref}
                onChange={(e) =>
                  updateField("graduationYearPref", e.target.value)
                }
              />
              <Input
                id="stepRequirements"
                label="USMLE Step Requirements"
                value={form.stepRequirements}
                onChange={(e) =>
                  updateField("stepRequirements", e.target.value)
                }
              />
              <Input
                id="ecfmgRequired"
                label="ECFMG Required"
                value={form.ecfmgRequired}
                onChange={(e) => updateField("ecfmgRequired", e.target.value)}
              />
            </div>
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="applicationMethod"
                label="Application Method"
                value={form.applicationMethod}
                onChange={(e) =>
                  updateField("applicationMethod", e.target.value)
                }
              >
                {/*
                 * PR 0c audit: "Through Platform" was removed because no
                 * in-platform <ApplyForm /> exists today. Existing listings
                 * with applicationMethod === "platform" continue to round-trip
                 * through the DB; the dropdown defaults to "website" if the
                 * stored value is no longer in the option set.
                 */}
                <option value="email">Via Email</option>
                <option value="website">External Website</option>
              </Select>
              <Input
                id="contactEmail"
                label="Contact Email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
              />
            </div>
            <Input
              id="websiteUrl"
              label="External Application URL"
              value={form.websiteUrl}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
            />
          </CardContent>
        </CardRoot>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
