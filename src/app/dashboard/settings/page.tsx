"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CardRoot, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setMessage("Name updated successfully.");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update name.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings
        </p>
      </div>

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
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your basic account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveName} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              value={session?.user?.email || ""}
              disabled
              className="bg-slate-50"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </CardRoot>

      <CardRoot>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />
            <Input
              id="confirmNewPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
            <div className="flex justify-end">
              <Button type="button" variant="outline" disabled>
                Update Password
              </Button>
            </div>
          </form>
          <p className="mt-2 text-xs text-slate-400">
            Password change functionality is coming soon.
          </p>
        </CardContent>
      </CardRoot>
    </div>
  );
}
