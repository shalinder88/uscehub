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

// How a source's notice documents are reached on its page:
//   "filename-token"  — KUMC style: PDF hrefs that themselves contain "lca"/"notice";
//                       the role lives INSIDE the numbered DOL notice body.
//   "all-pdf-titled"  — Pitt style: every PDF on the page is a notice and the
//                       FILENAME is the job title ("Assistant Professor - Adult
//                       Cardiology (UPP).pdf"). The title is physician-gated before
//                       any fetch, so we only pull likely-physician notices.
//   "html-row"        — UMD iTerp style: notices are INLINE HTML table rows on the
//                       page itself (no PDFs). Each notice block = a heading text +
//                       a <table> with <tr><td>field</td><td>value</td></tr> rows.
//                       Physician gate uses DOL SOC code prefix "29-12" (physician/
//                       surgeon family) OR title-based isPhysician(). No PDF fetch.
export type NoticeLinkStrategy = "filename-token" | "all-pdf-titled" | "html-row";

export interface LcaNoticeSource {
  id: string;
  employer: string;
  pageUrl: string;
  enabled: boolean;
  note: string;
  linkStrategy?: NoticeLinkStrategy; // default "filename-token"
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
    id: "lca-pitt",
    employer: "University of Pittsburgh",
    pageUrl: "https://www.ois.pitt.edu/lca-postings",
    enabled: true,
    linkStrategy: "all-pdf-titled",
    note: "Verified 2026-06-11: public LCA Postings page (Office of International Services), one notice PDF per filing under /sites/default/files/docs/ with the JOB TITLE as the filename (no 'lca'/'notice' token in the URL → needs all-pdf-titled). Top physician sponsor via UPMC / Univ. of Pittsburgh Physicians (UPP). Notice template differs from KUMC ('for the position of', 'salary ... is $X per hour', 'validity dates from'); the parser handles both. Title carries the dept in a trailing paren ('(Ophthalmology)') so the dept is stripped before the physician gate to avoid postdoc/research false positives. First physician notice: Assistant Professor - Adult Cardiology, $156.25/hr.",
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
  {
    id: "lca-umd",
    employer: "University of Maryland",
    pageUrl: "https://iterp.umd.edu/istart/xservices/employment/lcaPostings.cfm?index=01",
    enabled: true,
    linkStrategy: "html-row",
    note: "ENABLED 2026-06-12 with html-row strategy. Page follows a 302 redirect and serves plain HTML with inline notice tables (no PDFs). Each notice block: heading 'Notice of Intent to Hire H-1B / E-3 Employee - N' + <table class=\"display dataTable\"> with <tr><td>field</td><td>value</td></tr> rows. Fields include: Posting Dates, Posted Position Title, DOL Occupational Classification (SOC code), Salary Offered, LCA Validity Period, Geographic Location. Physician gate: SOC prefix '29-12' (physicians/surgeons family) OR title-based. Current postings are research scientists (SOC 19-xxxx), no physicians — monitoring is still worthwhile as UMD has a large medical school.",
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

// DOL SOC code 29-12xx is the physician and surgeon family.
export function isPhysicianSoc(soc: string): boolean {
  return soc.trimStart().startsWith("29-12");
}

// Strip HTML tags from a cell value using char-level scanning (consistent with
// the no-regex style of this file; also handles tag attributes cleanly).
function stripTags(s: string): string {
  const out: string[] = [];
  let inTag = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "<") { inTag = true; continue; }
    if (s[i] === ">") { inTag = false; continue; }
    if (!inTag) out.push(s[i]);
  }
  let result = out.join("");
  // Collapse runs of whitespace including newlines.
  let prev = "";
  while (result !== prev) { prev = result; result = result.split("  ").join(" ").split("\t").join(" ").split("\n").join(" "); }
  return result.trim();
}

export interface HtmlNoticeRow {
  seqNum: number;
  title?: string;
  postingDates?: string;
  socCode?: string;
  salaryText?: string;
  periodText?: string;
  location?: string;
}

// For "html-row" sources: parse LCA notices directly from inline HTML tables.
// The UMD iTerp format has a heading ("Notice of Intent to Hire H-1B / E-3
// Employee - N") followed immediately by a <table> of key/value row pairs.
// Returns one entry per notice block found in the page HTML.
export function extractHtmlTableNotices(html: string): HtmlNoticeRow[] {
  const out: HtmlNoticeRow[] = [];
  const lower = html.toLowerCase();
  let searchFrom = 0;
  let seqNum = 0;

  for (;;) {
    const headerAt = lower.indexOf("notice of intent to hire", searchFrom);
    if (headerAt < 0) break;
    seqNum++;

    const tableOpen = lower.indexOf("<table", headerAt);
    if (tableOpen < 0) break;
    const tableClose = lower.indexOf("</table>", tableOpen);
    if (tableClose < 0) break;

    const tableHtml = html.slice(tableOpen, tableClose + 8);
    const tLower = tableHtml.toLowerCase();
    const notice: HtmlNoticeRow = { seqNum };

    let rowPos = 0;
    for (;;) {
      const trStart = tLower.indexOf("<tr>", rowPos);
      if (trStart < 0) break;

      const td1Open = tLower.indexOf("<td>", trStart);
      if (td1Open < 0) { rowPos = trStart + 4; continue; }
      const td1Close = tLower.indexOf("</td>", td1Open);
      if (td1Close < 0) { rowPos = trStart + 4; continue; }

      const td2Open = tLower.indexOf("<td>", td1Close);
      if (td2Open < 0) { rowPos = trStart + 4; continue; }
      const td2Close = tLower.indexOf("</td>", td2Open);
      if (td2Close < 0) { rowPos = trStart + 4; continue; }

      const key = stripTags(tableHtml.slice(td1Open + 4, td1Close)).toLowerCase();
      const val = stripTags(tableHtml.slice(td2Open + 4, td2Close));

      if (key.includes("position title") || key.includes("posted position")) {
        notice.title = val;
      } else if (key.includes("posting date")) {
        notice.postingDates = val;
      } else if (key.includes("occupational class")) {
        notice.socCode = val;
      } else if (key.includes("salary offered")) {
        notice.salaryText = val;
      } else if (key.includes("validity period")) {
        notice.periodText = val;
      } else if (key.includes("geographic location")) {
        notice.location = val;
      }

      rowPos = td2Close + 5;
    }

    out.push(notice);
    searchFrom = tableClose + 8;
  }
  return out;
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

// Drop leading separators left behind when an anchor stops just before a colon
// or dash (e.g. "for the position of" → ": Assistant Professor ...").
function stripLeadingPunct(s: string): string {
  let i = 0;
  while (i < s.length && (s[i] === ":" || s[i] === "-" || s[i] === " " || s[i] === "." || s[i] === "\t" || s[i] === "\n")) i++;
  return s.slice(i);
}

function stripTrailingPunct(s: string): string {
  let out = s.trim();
  while (out.length > 0 && (out.endsWith(".") || out.endsWith(",") || out.endsWith(";"))) {
    out = out.slice(0, -1).trim();
  }
  return out;
}

// A Drupal re-post suffix ("..._3") on an otherwise-identical filename.
function stripTrailingNumericSuffix(s: string): string {
  let i = s.length - 1;
  let sawDigit = false;
  while (i >= 0 && s[i] >= "0" && s[i] <= "9") { i--; sawDigit = true; }
  if (sawDigit && i >= 0 && s[i] === "_") return s.slice(0, i);
  return s;
}

// A trailing parenthetical — Pitt's filename convention carries the DEPARTMENT
// there ("Assistant Professor - Adult Cardiology (UPP)", "Postdoctoral Associate
// (Ophthalmology)"). The dept must be stripped before the physician gate, or a
// clinical-department postdoc trips a specialty token and false-positives.
function stripTrailingParenthetical(s: string): string {
  const t = s.trimEnd();
  if (!t.endsWith(")")) return s.trim();
  const open = t.lastIndexOf("(");
  if (open <= 0) return s.trim();
  return t.slice(0, open).trim();
}

// For "all-pdf-titled" sources, the job title IS the PDF filename. Decode it,
// drop the extension + re-post suffix + trailing department paren.
export function deriveTitleFromHref(href: string): string {
  const path = href.split("?")[0];
  let name = path.split("/").pop() ?? "";
  try { name = decodeURIComponent(name); } catch { /* keep raw on malformed escapes */ }
  const dot = name.toLowerCase().lastIndexOf(".pdf");
  if (dot >= 0) name = name.slice(0, dot);
  name = stripTrailingNumericSuffix(name);
  name = stripTrailingParenthetical(name);
  return name.trim();
}

// Pulls the labeled fields out of an LCA notice's text. Tolerant of two real
// templates: the numbered DOL form (KUMC — "being sought as a", "salary of",
// "period of employment ... is") and the Pitt OIS prose form ("for the position
// of", "salary for this position is $X per hour", "validity dates from").
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

  let role = cutAt(
    valueAfter(text, "being sought as a", 160) ??
      valueAfter(text, "being sought as", 160) ??
      valueAfter(text, "for the position of", 160),
    [" through the filing", " with validity", " with the following"],
  );
  if (role) role = stripLeadingPunct(role);

  let salaryText = cutAt(
    valueAfter(text, "salary of", 80) ??
      valueAfter(text, "wage of", 80) ??
      valueAfter(text, "wage rate of", 80) ??
      valueAfter(text, "salary for this position is", 80),
    [" is being", " will be", " the employment", " the labor"],
  );
  if (salaryText) salaryText = stripTrailingPunct(salaryText);

  const periodText = cutAt(
    valueAfter(text, "period of employment for which this worker is sought is", 90) ??
      valueAfter(text, "period of employment", 90) ??
      valueAfter(text, "validity dates", 90),
    [" the employment", " the salary"],
  );

  return {
    caseNumber,
    role,
    salaryText,
    periodText,
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

    // "filename-token" pulls notice-tokened PDFs (role lives in the body).
    // "all-pdf-titled" pulls every PDF whose filename-title is a physician role,
    // physician-gating BEFORE any fetch so non-clinical postings are never pulled.
    // "html-row" parses inline HTML tables directly — no PDFs, no extra fetches.
    const strategy = src.linkStrategy ?? "filename-token";

    if (strategy === "html-row") {
      const allNotices = extractHtmlTableNotices(page);
      const physNotices = allNotices.filter((n) => {
        if (!n.title) return false;
        const isSocPhys = n.socCode ? isPhysicianSoc(n.socCode) : false;
        return isSocPhys || isPhysician(n.title);
      });
      pollLog.push(
        src.id + ": " + allNotices.length + " notice(s) on page (html-row), " +
        physNotices.length + " physician",
      );
      for (const n of physNotices) {
        // Stable key: posting start date (compact MMDDYYYY) + title slug.
        const postingStart = n.postingDates?.split("-")[0]?.trim().replace(/\//g, "") ?? String(n.seqNum);
        const titleSlug = (n.title ?? "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
        const caseNumber = "html-" + src.id + "-" + postingStart + "-" + titleSlug;
        const existing = index.get(caseNumber);
        if (existing) {
          existing.lastSeenAt = now;
          refreshedCount++;
        } else {
          index.set(caseNumber, {
            caseNumber,
            sourceId: src.id,
            employer: src.employer,
            noticeUrl: src.pageUrl,
            role: n.title,
            isPhysicianRole: true,
            salaryText: n.salaryText,
            periodText: n.periodText,
            worksiteText: n.location,
            firstSeenAt: now,
            lastSeenAt: now,
            rawText: "",
          });
          newCount++;
        }
      }
      continue; // skip PDF-based link processing below
    }

    let links: Array<{ href: string; titleHint?: string }>;
    if (strategy === "all-pdf-titled") {
      links = extractHrefs(page)
        .filter((h) => h.toLowerCase().includes(".pdf"))
        .map((h) => ({ href: h, titleHint: deriveTitleFromHref(h) }))
        .filter((l) => l.titleHint!.length > 0 && isPhysician(l.titleHint!))
        .slice(0, MAX_PDFS_PER_SOURCE);
      pollLog.push(src.id + ": " + links.length + " physician notice link(s) on page");
    } else {
      links = extractHrefs(page)
        .filter(isNoticeLink)
        .map((h) => ({ href: h }))
        .slice(0, MAX_PDFS_PER_SOURCE);
      pollLog.push(src.id + ": " + links.length + " notice link(s) on page");
    }

    for (const link of links) {
      await delay(FETCH_DELAY_MS);
      const got = await fetchPdf(absolutizeCandidates(link.href, src.pageUrl));
      if (!got) {
        pollLog.push(src.id + ": could not fetch a valid PDF for " + link.href.slice(0, 80));
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
      // Content gate: only an actual LCA notice reaches the index. Protects the
      // widened all-pdf harvest from instruction/policy PDFs.
      if (!text.toLowerCase().includes("labor condition application")) {
        pollLog.push(src.id + ": not an LCA notice (no header) — " + safeName.slice(0, 60));
        continue;
      }
      const parsed = parseNoticeText(text);
      // all-pdf-titled: the title is the filename (already physician-gated).
      // filename-token: the role is parsed from the body and gated here.
      const role = link.titleHint ?? parsed.role;
      const isPhysicianRole = link.titleHint
        ? true
        : parsed.role
          ? isPhysician(parsed.role)
          : false;
      const caseNumber =
        parsed.caseNumber ?? "uncased-" + (link.titleHint ?? decodeURIComponent(safeName));
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
          role,
          isPhysicianRole,
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
