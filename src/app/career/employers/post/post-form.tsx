"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Shield,
  CheckCircle2,
  Send,
  ArrowLeft,
  Info,
  Globe,
} from "lucide-react";

interface FormData {
  // Employer
  orgName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  orgType: string;
  // Position
  specialty: string;
  jobTitle: string;
  city: string;
  state: string;
  visaTypes: string[];
  hpsa: string;
  waiverPathways: string[];
  // Compensation
  salaryMin: string;
  salaryMax: string;
  signOnBonus: string;
  benefits: string;
  // Details
  schedule: string;
  description: string;
  careerPageUrl: string;
}

const SPECIALTIES = [
  "Anesthesiology", "Cardiology (Non-Invasive)", "Cardiology (Interventional)",
  "Critical Care / Intensivist", "Dermatology", "Emergency Medicine",
  "Endocrinology", "Family Medicine", "Gastroenterology", "Hematology/Oncology",
  "Hospitalist", "Infectious Disease", "Internal Medicine (Outpatient)",
  "Nephrology", "Neurology", "OB/GYN", "Orthopedic Surgery", "Pathology",
  "Pediatrics", "Psychiatry", "Pulmonary/Critical Care", "Radiology",
  "Rheumatology", "General Surgery", "Other",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

export function PostJobForm() {
  const [form, setForm] = useState<FormData>({
    orgName: "", contactName: "", contactEmail: "", contactPhone: "", orgType: "",
    specialty: "", jobTitle: "", city: "", state: "", visaTypes: [], hpsa: "",
    waiverPathways: [], salaryMin: "", salaryMax: "", signOnBonus: "", benefits: "",
    schedule: "", description: "", careerPageUrl: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArray = (field: "visaTypes" | "waiverPathways", value: string) => {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleSubmit = () => {
    // Build mailto body
    const body = `
NEW JOB POSTING SUBMISSION — USCEHub

EMPLOYER INFORMATION
Organization: ${form.orgName}
Contact: ${form.contactName}
Email: ${form.contactEmail}
Phone: ${form.contactPhone}
Type: ${form.orgType}

POSITION DETAILS
Specialty: ${form.specialty}
Job Title: ${form.jobTitle}
Location: ${form.city}, ${form.state}
Visa Types: ${form.visaTypes.join(", ")}
HPSA Designated: ${form.hpsa}
Waiver Pathways: ${form.waiverPathways.join(", ")}

COMPENSATION
Salary Range: $${form.salaryMin} - $${form.salaryMax}
Sign-On Bonus: $${form.signOnBonus || "N/A"}
Benefits: ${form.benefits}

SCHEDULE & DETAILS
Schedule: ${form.schedule}
Career Page: ${form.careerPageUrl}

DESCRIPTION
${form.description}
    `.trim();

    window.location.href = `mailto:employers@uscehub.com?subject=${encodeURIComponent(`Job Posting: ${form.specialty} — ${form.orgName} (${form.city}, ${form.state})`)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Submission Ready</h1>
        <p className="text-muted mb-6">
          Your email client should have opened with the job details.
          Send the email and we&apos;ll review and publish within 24 hours.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/career/employers" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
            Back to Employers
          </Link>
          <button onClick={() => setSubmitted(false)} className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 transition-colors">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/career/employers" className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent mb-4 transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Back to Employer Info
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Post a Position</h1>
            <p className="text-xs text-muted">We verify and publish within 24 hours</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-alt p-4 mb-8 flex gap-3">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-muted">
          <strong className="text-foreground">How it works:</strong> Fill out the form below.
          It generates an email to our team. We verify the position (HPSA status, employer,
          visa eligibility) and publish within 24 hours. Your listing includes a direct link
          to your career page. Every listing is reviewed — we don&apos;t publish unverified data.
        </div>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* Employer Info */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent" />
            Employer Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Organization Name *</label>
              <input type="text" value={form.orgName} onChange={(e) => update("orgName", e.target.value)}
                placeholder="e.g., Memorial Regional Medical Center"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Contact Name *</label>
              <input type="text" value={form.contactName} onChange={(e) => update("contactName", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Contact Email *</label>
              <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Phone</label>
              <input type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Organization Type</label>
              <select value={form.orgType} onChange={(e) => update("orgType", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent">
                <option value="">Select...</option>
                <option value="hospital">Hospital / Health System</option>
                <option value="fqhc">FQHC / Community Health Center</option>
                <option value="private">Private Practice</option>
                <option value="academic">Academic Medical Center</option>
                <option value="va">VA Medical Center</option>
                <option value="government">Government / Public Health</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Position Details */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-accent" />
            Position Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Specialty *</label>
              <select value={form.specialty} onChange={(e) => update("specialty", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent">
                <option value="">Select specialty...</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Job Title</label>
              <input type="text" value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)}
                placeholder="e.g., Staff Physician, Attending"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">City *</label>
              <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">State *</label>
              <select value={form.state} onChange={(e) => update("state", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent">
                <option value="">Select state...</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Visa Types */}
          <div className="mt-4">
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Visa Sponsorship Offered *</label>
            <div className="flex flex-wrap gap-2">
              {["J-1 Waiver", "H-1B", "Green Card Sponsorship", "O-1"].map((v) => (
                <button key={v} type="button"
                  onClick={() => toggleArray("visaTypes", v)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.visaTypes.includes(v) ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:border-accent/30"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* HPSA */}
          <div className="mt-4">
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">HPSA / MUA / MUP Designated?</label>
            <div className="flex gap-2">
              {["Yes — Primary Care HPSA", "Yes — Mental Health HPSA", "Yes — MUA/MUP", "No / Unknown"].map((h) => (
                <button key={h} type="button"
                  onClick={() => update("hpsa", h)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.hpsa === h ? "border-success bg-success/10 text-success" : "border-border text-muted hover:border-success/30"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Waiver Pathways */}
          <div className="mt-4">
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Waiver Pathways Available</label>
            <div className="flex flex-wrap gap-2">
              {["Conrad 30", "HHS", "ARC", "DRA", "SCRC", "VA", "Not Sure"].map((p) => (
                <button key={p} type="button"
                  onClick={() => toggleArray("waiverPathways", p)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.waiverPathways.includes(p) ? "border-cyan bg-cyan/10 text-cyan" : "border-border text-muted hover:border-cyan/30"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Compensation */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            Compensation (Optional but Recommended)
          </h2>
          <p className="text-xs text-muted mb-4">
            Listings with salary data get 3x more engagement. You can provide a range.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Salary Min ($)</label>
              <input type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)}
                placeholder="250000"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Salary Max ($)</label>
              <input type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)}
                placeholder="350000"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Sign-On Bonus ($)</label>
              <input type="number" value={form.signOnBonus} onChange={(e) => update("signOnBonus", e.target.value)}
                placeholder="50000"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Key Benefits</label>
            <input type="text" value={form.benefits} onChange={(e) => update("benefits", e.target.value)}
              placeholder="e.g., Loan repayment, relocation, 401K match, CME allowance"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent" />
          </div>
        </section>

        {/* Description */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-accent" />
            Description & Links
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Schedule / Work Pattern</label>
              <input type="text" value={form.schedule} onChange={(e) => update("schedule", e.target.value)}
                placeholder="e.g., Mon-Fri outpatient, 7-on/7-off, nocturnist"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Position Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                rows={4} placeholder="Describe the position, team, community..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Career Page URL</label>
              <input type="url" value={form.careerPageUrl} onChange={(e) => update("careerPageUrl", e.target.value)}
                placeholder="https://yourorg.com/careers"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent" />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="border-t border-border pt-6">
          <button
            onClick={handleSubmit}
            disabled={!form.orgName || !form.specialty || !form.city || !form.state || !form.contactEmail || form.visaTypes.length === 0}
            className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            Submit for Review
          </button>
          <p className="text-[10px] text-muted text-center mt-3">
            Opens your email client with the job details. We review and publish within 24 hours.
            Questions? Email employers@uscehub.com
          </p>
        </div>
      </div>
    </div>
  );
}
