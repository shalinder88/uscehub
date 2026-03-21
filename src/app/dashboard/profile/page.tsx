"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CardRoot, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SPECIALTIES } from "@/lib/utils";

interface ProfileData {
  country: string;
  currentLocation: string;
  medicalSchool: string;
  graduationYear: string;
  currentRole: string;
  specialtyInterest: string;
  visaStatus: string;
  usmleStep1: string;
  usmleStep2: string;
  ecfmgStatus: string;
  shortBio: string;
  cvText: string;
  linkedin: string;
}

const emptyProfile: ProfileData = {
  country: "",
  currentLocation: "",
  medicalSchool: "",
  graduationYear: "",
  currentRole: "",
  specialtyInterest: "",
  visaStatus: "",
  usmleStep1: "",
  usmleStep2: "",
  ecfmgStatus: "",
  shortBio: "",
  cvText: "",
  linkedin: "",
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      fetchProfile();
    }
  }, [session]);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile({
          country: data.country || "",
          currentLocation: data.currentLocation || "",
          medicalSchool: data.medicalSchool || "",
          graduationYear: data.graduationYear || "",
          currentRole: data.currentRole || "",
          specialtyInterest: data.specialtyInterest || "",
          visaStatus: data.visaStatus || "",
          usmleStep1: data.usmleStep1 || "",
          usmleStep2: data.usmleStep2 || "",
          ecfmgStatus: data.ecfmgStatus || "",
          shortBio: data.shortBio || "",
          cvText: data.cvText || "",
          linkedin: data.linkedin || "",
        });
      }
    } catch {
      // Profile may not exist yet
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
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ...profile }),
      });

      if (res.ok) {
        setMessage("Profile saved successfully.");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save profile.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof ProfileData, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Keep your profile up to date to improve your applications
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
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details about you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="country"
                label="Country of Origin"
                value={profile.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="e.g. India, Nigeria, Pakistan"
              />
              <Input
                id="currentLocation"
                label="Current Location"
                value={profile.currentLocation}
                onChange={(e) => updateField("currentLocation", e.target.value)}
                placeholder="e.g. New York, NY"
              />
            </div>
            <Textarea
              id="shortBio"
              label="Short Bio"
              value={profile.shortBio}
              onChange={(e) => updateField("shortBio", e.target.value)}
              placeholder="Tell programs about yourself..."
              rows={3}
            />
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Medical Education</CardTitle>
            <CardDescription>Your medical training background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="medicalSchool"
                label="Medical School"
                value={profile.medicalSchool}
                onChange={(e) => updateField("medicalSchool", e.target.value)}
                placeholder="University of Medicine"
              />
              <Input
                id="graduationYear"
                label="Graduation Year"
                value={profile.graduationYear}
                onChange={(e) => updateField("graduationYear", e.target.value)}
                placeholder="e.g. 2023"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="currentRole"
                label="Current Role"
                value={profile.currentRole}
                onChange={(e) => updateField("currentRole", e.target.value)}
                placeholder="e.g. Resident, Research Fellow"
              />
              <Select
                id="specialtyInterest"
                label="Specialty Interest"
                value={profile.specialtyInterest}
                onChange={(e) => updateField("specialtyInterest", e.target.value)}
              >
                <option value="">Select a specialty</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Scores & Credentials</CardTitle>
            <CardDescription>USMLE scores, visa, and ECFMG status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="usmleStep1"
                label="USMLE Step 1"
                value={profile.usmleStep1}
                onChange={(e) => updateField("usmleStep1", e.target.value)}
                placeholder="e.g. Pass, 250"
              />
              <Input
                id="usmleStep2"
                label="USMLE Step 2 CK"
                value={profile.usmleStep2}
                onChange={(e) => updateField("usmleStep2", e.target.value)}
                placeholder="e.g. 260"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="ecfmgStatus"
                label="ECFMG Status"
                value={profile.ecfmgStatus}
                onChange={(e) => updateField("ecfmgStatus", e.target.value)}
              >
                <option value="">Select status</option>
                <option value="Certified">Certified</option>
                <option value="Pending">Pending</option>
                <option value="Not Started">Not Started</option>
                <option value="N/A">N/A</option>
              </Select>
              <Select
                id="visaStatus"
                label="Visa Status"
                value={profile.visaStatus}
                onChange={(e) => updateField("visaStatus", e.target.value)}
              >
                <option value="">Select visa status</option>
                <option value="US Citizen">US Citizen</option>
                <option value="Green Card">Green Card</option>
                <option value="J1">J1 Visa</option>
                <option value="H1B">H1B Visa</option>
                <option value="B1/B2">B1/B2 Tourist Visa</option>
                <option value="F1">F1 Student Visa</option>
                <option value="Need Sponsorship">Need Visa Sponsorship</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>CV and professional links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="cvText"
              label="CV / Resume Text"
              value={profile.cvText}
              onChange={(e) => updateField("cvText", e.target.value)}
              placeholder="Paste your CV text here..."
              rows={6}
            />
            <Input
              id="linkedin"
              label="LinkedIn Profile URL"
              value={profile.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
            />
          </CardContent>
        </CardRoot>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
