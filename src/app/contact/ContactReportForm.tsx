"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ResolvedContactContext } from "@/lib/usce-contact-context";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error_generic" };

export function ContactReportForm({
  context,
}: {
  context: ResolvedContactContext;
}) {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [issueType, setIssueType] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const isReportContext =
    context.status === "VALID_LISTING_CONTEXT" && context.listingId !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isReportContext) {
      setState({ kind: "error_generic" });
      return;
    }
    if (message.trim().length < 5) {
      setState({ kind: "error_generic" });
      return;
    }

    setState({ kind: "submitting" });

    const payload = {
      schema_version: "v2",
      listing_id: context.listingId,
      report_ref: context.reportRef ?? "pilot-listing",
      runtime_set: context.runtimeSet ?? "unknown",
      page_url:
        typeof window !== "undefined" ? window.location.href : "/contact",
      issue_type: issueType || "other",
      user_message: message,
      submitted_at: new Date().toISOString(),
      source_context: {},
      institution_name_displayed: context.displayInstitutionName ?? "",
      client_timestamp: new Date().toISOString(),
      honeypot_field: "",
    };

    try {
      const res = await fetch("/api/usce/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setState({ kind: "success" });
        setMessage("");
      } else {
        setState({ kind: "error_generic" });
      }
    } catch {
      setState({ kind: "error_generic" });
    }
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
      {isReportContext && (
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          data-testid="contact-report-context-banner"
        >
          <div className="font-medium text-slate-900">
            Reporting an issue for: {context.displayInstitutionName}
            {context.displayCityState ? `, ${context.displayCityState}` : ""}
          </div>
          <div className="mt-0.5 text-slate-500">
            Reference: {context.reportRef}
          </div>
        </div>
      )}

      {isReportContext && (
        <>
          <input type="hidden" name="listing_id" value={context.listingId ?? ""} />
          <input
            type="hidden"
            name="report_ref"
            value={context.reportRef ?? "pilot-listing"}
          />
          <input
            type="hidden"
            name="runtime_set"
            value={context.runtimeSet ?? "unknown"}
          />
          {context.evidenceJoinKey && (
            <input
              type="hidden"
              name="evidence_join_key"
              value={context.evidenceJoinKey}
            />
          )}
          {context.pagePath && (
            <input type="hidden" name="page_path" value={context.pagePath} />
          )}
          <input type="hidden" name="honeypot_field" value="" />
        </>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input id="firstName" label="First Name" placeholder="John" />
        <Input id="lastName" label="Last Name" placeholder="Doe" />
      </div>

      <Input
        id="email"
        label="Email Address"
        type="email"
        placeholder="john@example.com"
      />

      {isReportContext ? (
        <Select
          id="issue_type"
          label="Issue type"
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
        >
          <option value="">Select an issue type</option>
          <option value="eligibility_incorrect">Eligibility incorrect</option>
          <option value="visa_information_incorrect">
            Visa information incorrect
          </option>
          <option value="cost_or_fee_incorrect">Cost / fee incorrect</option>
          <option value="application_process_incorrect">
            Application process incorrect
          </option>
          <option value="source_link_broken">Source link broken</option>
          <option value="program_closed">Program closed</option>
          <option value="duplicate_listing">Duplicate listing</option>
          <option value="wrong_institution">Wrong institution</option>
          <option value="outdated_information">Outdated information</option>
          <option value="source_does_not_support_claim">
            Source does not support claim
          </option>
          <option value="other">Other</option>
        </Select>
      ) : (
        <Select id="subject" label="Subject">
          <option value="">Select a subject</option>
          <option value="general">General Inquiry</option>
          <option value="listing">Listing Question</option>
          <option value="account">Account Issue</option>
          <option value="report">Report a Problem</option>
          <option value="partnership">Partnership Inquiry</option>
          <option value="other">Other</option>
        </Select>
      )}

      <Textarea
        id="message"
        label="Message"
        placeholder="Tell us how we can help..."
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Button
        type="submit"
        size="lg"
        disabled={state.kind === "submitting"}
      >
        {state.kind === "submitting" ? "Sending…" : "Send Message"}
      </Button>

      {state.kind === "success" && (
        <p
          className="text-sm text-slate-700"
          role="status"
          data-testid="contact-report-success"
        >
          Thanks — your report was received.
        </p>
      )}
      {state.kind === "error_generic" && (
        <p
          className="text-sm text-slate-500"
          role="status"
          data-testid="contact-report-error"
        >
          Thanks — we could not submit this report right now. Please try again
          later.
        </p>
      )}
    </form>
  );
}
