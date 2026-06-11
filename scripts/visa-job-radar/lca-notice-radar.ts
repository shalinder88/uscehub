// LCA-notice radar — the freshest legal sponsorship signal.
//
// 20 CFR 655.734 requires an employer to post notice of every LCA filing; the
// electronic route puts these on the employer's OWN public website. A notice =
// "this employer is filing an H-1B for this role/wage/worksite RIGHT NOW" —
// months ahead of the quarterly DOL disclosure files. Notices stay up ~10
// business days, so any single poll sees only a few; the value is polling over
// time and ACCUMULATING into an index (firstSeenAt/lastSeenAt per case number).
//
// Honesty contract: a notice is sponsorship ACTIVITY for an already-identified
// beneficiary — it is NEVER surfaced as an open job. It feeds the per-employer
// sponsor-truth layer ("actively sponsoring physicians as of <date>, role-level
// evidence") with the notice PDF as the citable source.
//
//   npx tsx scripts/visa-job-radar/lca-notice-radar.ts          # poll + accumulate
//
// PDF text extraction shells out to poppler pdftotext (~/homebrew). Pages that
// 403 a plain client are documented and skipped — never spoofed (WVU posture).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { isPhysician } from "./engine";

export interface LcaNoticeSource {
  id: string;
  employer: string;
  pageUrl: string;
  enabled: boolean;
  note: string;
}

export const LCA_NOTICE_SOURCES: LcaNoticeSource[] = [
  {
    id: "lca-kumc",
    employer: "University of Kansas Medical Center",
    pageUrl:
      "https://www.kumc.edu/academic-and-student-affairs/departments/office-of-international-programs/inbound-programs/information-for-faculty-researchers-and-physicians/h-1b-employees/lca-postings.html",
    enabled: true,
    note: "Verified 2026-06-10: public LCA Postings page, notice PDFs with numbered role/salary/period/worksite items. First parsed notice: Pulm/CC Nocturnist Physician, $435,000.",
  },
  {
    id: "lca-upenn",
    employer: "University of Pennsylvania",
    pageUrl: "https://global.upenn.edu/isss/LCA-notifications/",
    enabled: false,
    note: "DISABLED 2026-06-10: HTTP 403 to a plain client (bot protection). Not bypassed — same posture as WVU/HRSA.",
  },
  {
    id: "lca-umich",
    employer: "University of Michigan",
    pageUrl: "https://internationalcenter.umich.edu/fsis/filing-notice",
    enabled: false,
    note: "DISABLED 2026-06-10: HTTP 403 to a plain client. Not bypassed.",
  },
  {
    id: "lca-vanderbilt",
    employer: "Vanderbilt University",
    pageUrl: "https://hr.vanderbilt.edu/employee-immigration-services/lca-h1b/",
    enabled: false,
    note: "DISABLED 2026-06-10: page is LCA policy/process only; no notice documents posted there.",
  },
];

export interface LcaNoticeRecord {
  caseNumber: string;
  sourceId: string;
  employer: string;
  noticeUrl: string;
  role?: string;
  isPhysicianRole: boolean;
  salaryText?: string;
  periodText?: string;
  worksiteText?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  rawText: string;
}

const UA = "USCEHub-visa-job-radar/1.0 (LCA notice compliance pages; shalinder_singh@hotmail.com)";
const OUT_DIR = join(process.cwd(), "docs/platform-v2/local/career/jobs/radar/lca-notices");
const INDEX_FILE = join(OUT_DIR, "notices_index.json");
const FETCH_DELAY_MS = 400;
const MAX_PDFS_PER_SOURCE = 12;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function pdftotextBin(): string {
  const brew = join(homedir(), "homebrew/bin/pdftotext");
  return existsSync(brew) ? brew : "pdftotext";
}

// Extract href values from HTML by explicit scanning (no regex, project rule).
export function extractHrefs(html: string): string[] {
  const out: string[] = [];
  const lower = html.toLowerCase();
  let i = 0;
  for (;;) {
    const at = lower.indexOf('href="', i);
    if (at < 0) break;
    const start = at + 6;
    const end = html.indexOf('"', start);
    if (end < 0) break;
    out.push(html.slice(start, end));
    i = end + 1;
  }
  return out;
}

export function isNoticeLink(href: string): boolean {
  const h = href.toLowerCase();
  if (!h.includes(".pdf")) return false;
  return h.includes("lca") || h.includes("notice");
}

// A bare relative href can resolve against the page path OR the site root (when
// the page carries a <base href="/">, as KUMC's does). Return both candidates;
// the fetcher tries them in order and validates the %PDF magic bytes.
function absolutizeCandidates(href: string, pageUrl: string): string[] {
  if (href.startsWith("http://") || href.startsWith("https://")) return [href];
  const u = new URL(pageUrl);
  if (href.startsWith("/")) return [u.origin + href];
  const basePath = u.pathname.slice(0, u.pathname.lastIndexOf("/") + 1);
  return [u.origin + "/" + href, u.origin + basePath + href];
}

// Pull the value sentence following an anchor phrase, up to the next period
// that ends a sentence (tolerant of "St." style abbreviations by requiring the
// period to be followed by whitespace+digit or end).
function valueAfter(text: string, anchor: string, maxLen: number): string | undefined {
  const lower = text.toLowerCase();
  const at = lower.indexOf(anchor.toLowerCase());
  if (at < 0) return undefined;
  const start = at + anchor.length;
  const slice = text.slice(start, start + maxLen);
  let end = slice.length;
  for (let i = 0; i < slice.length - 1; i++) {
    if (slice[i] === "." && (slice[i + 1] === "\n" || (slice[i + 1] === " " && i + 2 < slice.length && slice[i + 2] >= "0" && slice[i + 2] <= "9"))) {
      end = i;
      break;
    }
  }
  const v = slice.slice(0, end).split("\n").join(" ").split("  ").join(" ").trim();
  return v.length > 0 ? v : undefined;
}

export function parseNoticeText(text: string): {
  caseNumber?: string;
  role?: string;
  salaryText?: string;
  periodText?: string;
  worksiteText?: string;
} {
  // Case number: text inside the first [...] after "Case"
  let caseNumber: string | undefined;
  const caseAt = text.toLowerCase().indexOf("case");
  if (caseAt >= 0) {
    const open = text.indexOf("[", caseAt);
    const close = open >= 0 ? text.indexOf("]", open) : -1;
    if (open >= 0 && close > open && close - open < 40) caseNumber = text.slice(open + 1, close).trim();
  }
  const cutAt = (v: string | undefined, stops: string[]): string | undefined => {
    if (!v) return v;
    let out = v;
    for (const s of stops) {
      const at = out.toLowerCase().indexOf(s);
      if (at > 0) out = out.slice(0, at);
    }
    return out.trim();
  };
  return {
    caseNumber,
    role: cutAt(valueAfter(text, "being sought as a", 160) ?? valueAfter(text, "being sought as", 160), [" through the filing"]),
    salaryText: cutAt(
      valueAfter(text, "salary of", 60) ?? valueAfter(text, "wage of", 60) ?? valueAfter(text, "wage rate of", 60),
      [" is being", " will be", " per "],
    ),
    periodText: cutAt(valueAfter(text, "period of employment for which this worker is sought is", 90) ?? valueAfter(text, "period of employment", 90), [" the employment"]),
    worksiteText: valueAfter(text, "employment will occur at", 280),
  };
}

function loadIndex(): Map<string, LcaNoticeRecord> {
  if (!existsSync(INDEX_FILE)) return new Map();
  const arr = JSON.parse(readFileSync(INDEX_FILE, "utf8")) as LcaNoticeRecord[];
  return new Map(arr.map((r) => [r.caseNumber, r]));
}

async function fetchPdf(urls: string[]): Promise<{ buf: Buffer; url: string } | null> {
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 4 && buf.toString("latin1", 0, 4) === "%PDF") return { buf, url };
    } catch {
      continue;
    }
  }
  return null;
}

async function main(): Promise<void> {
  const now = new Date().toISOString();
  mkdirSync(join(OUT_DIR, "pdfs"), { recursive: true });
  const index = loadIndex();
  const pollLog: string[] = [];
  let newCount = 0;
  let refreshedCount = 0;

  for (const src of LCA_NOTICE_SOURCES) {
    if (!src.enabled) {
      pollLog.push(src.id + ": disabled — " + src.note.split(":")[0]);
      continue;
    }
    let page: string | null = null;
    try {
      const res = await fetch(src.pageUrl, { headers: { "User-Agent": UA } });
      page = res.ok ? await res.text() : null;
      if (!page) pollLog.push(src.id + ": HTTP " + res.status + " — skipped");
    } catch {
      pollLog.push(src.id + ": fetch error — skipped");
    }
    if (!page) continue;

    const links = extractHrefs(page).filter(isNoticeLink).slice(0, MAX_PDFS_PER_SOURCE);
    pollLog.push(src.id + ": " + links.length + " notice link(s) on page");

    for (const link of links) {
      await delay(FETCH_DELAY_MS);
      const got = await fetchPdf(absolutizeCandidates(link, src.pageUrl));
      if (!got) {
        pollLog.push(src.id + ": could not fetch a valid PDF for " + link.slice(0, 80));
        continue;
      }
      const url = got.url;
      const safeName = url.split("/").pop()?.split("?")[0] ?? "notice.pdf";
      const pdfPath = join(OUT_DIR, "pdfs", decodeURIComponent(safeName).split("/").join("_"));
      writeFileSync(pdfPath, got.buf);
      let text = "";
      try {
        execFileSync(pdftotextBin(), [pdfPath, pdfPath + ".txt"], { stdio: "pipe" });
        text = readFileSync(pdfPath + ".txt", "utf8");
      } catch {
        continue;
      }
      const parsed = parseNoticeText(text);
      const caseNumber = parsed.caseNumber ?? "uncased-" + decodeURIComponent(safeName);
      const existing = index.get(caseNumber);
      if (existing) {
        existing.lastSeenAt = now;
        refreshedCount++;
      } else {
        index.set(caseNumber, {
          caseNumber,
          sourceId: src.id,
          employer: src.employer,
          noticeUrl: url,
          role: parsed.role,
          isPhysicianRole: parsed.role ? isPhysician(parsed.role) : false,
          salaryText: parsed.salaryText,
          periodText: parsed.periodText,
          worksiteText: parsed.worksiteText,
          firstSeenAt: now,
          lastSeenAt: now,
          rawText: text.slice(0, 4000),
        });
        newCount++;
      }
    }
  }

  const all = Array.from(index.values()).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  writeFileSync(INDEX_FILE, JSON.stringify(all, null, 2) + "\n", "utf8");

  const phys = all.filter((r) => r.isPhysicianRole);
  const lines: string[] = [];
  lines.push("# LCA-notice radar — accumulated index");
  lines.push("");
  lines.push("- Last poll: " + now);
  lines.push("- Notices tracked (all time): " + all.length + " (" + phys.length + " physician)");
  lines.push("- This poll: " + newCount + " new, " + refreshedCount + " still posted");
  lines.push("");
  lines.push("## Poll log");
  for (const l of pollLog) lines.push("- " + l);
  lines.push("");
  lines.push("## Physician notices (sponsorship ACTIVITY — never open jobs)");
  lines.push("");
  lines.push("| Employer | Role | Salary | Period | First seen | Case |");
  lines.push("|---|---|---|---|---|---|");
  for (const r of phys) {
    lines.push(
      "| " + r.employer + " | " + (r.role ?? "?") + " | " + (r.salaryText ?? "?") + " | " +
      (r.periodText ?? "?") + " | " + r.firstSeenAt.slice(0, 10) + " | " + r.caseNumber + " |",
    );
  }
  lines.push("");
  writeFileSync(join(OUT_DIR, "lca_notice_report.md"), lines.join("\n"), "utf8");

  console.log("LCA-notice radar poll @ " + now);
  for (const l of pollLog) console.log("  " + l);
  console.log("  index: " + all.length + " notices (" + phys.length + " physician); +" + newCount + " new, " + refreshedCount + " refreshed");
  for (const r of phys.slice(0, 6)) {
    console.log("    • " + r.employer + " — " + (r.role ?? "?") + " — " + (r.salaryText ?? "?"));
  }
  console.log("  report: " + join(OUT_DIR, "lca_notice_report.md"));
}

const isDirect = process.argv[1]?.includes("lca-notice-radar");
if (isDirect) main();
