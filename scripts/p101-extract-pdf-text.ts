/**
 * P101 — Minimal PDF text extraction helper
 *
 * Wraps the system `pdftotext` (poppler) binary so packet writers can quote
 * verbatim language from official-source PDFs (fee schedules, handbooks,
 * visiting-student policies) instead of skipping or faking the quote.
 *
 * Usage:
 *   npx tsx scripts/p101-extract-pdf-text.ts <pdf-url-or-local-path> [outdir]
 *
 * Behavior:
 *   - If the input starts with http:// or https://, downloads with curl
 *     using a generic browser-style User-Agent (no login, no cookies, no
 *     credentials) into `tmp-pdf-cache/` and runs `pdftotext` on it.
 *   - If the input is a local path, runs `pdftotext` directly on it.
 *   - Writes plaintext to `tmp-pdf-cache/<sha1>.txt` and prints the path
 *     plus the first 80 lines to stdout so the operator can copy verbatim
 *     quotes back into the packet.
 *   - Fails GRACEFULLY: if pdftotext is missing, download fails, or the
 *     PDF is image-only, exits non-zero with a clear message. The packet
 *     writer then sets `PDF_EXTRACTION_FAILED_MANUAL_RETRY` in the packet
 *     and queues it in `p101_manual_retry_log.csv`. NEVER fabricate the
 *     quote.
 *
 * Hard rules (operator):
 *   - No login / paywall / CAPTCHA bypass.
 *   - No credentials stored or printed.
 *   - No network-heavy crawling.
 *   - No automatic Wayback submission (out of scope for P101-1).
 *   - Output is for human packet writers; do NOT pipe straight into
 *     auto-classification without verbatim review.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { execFileSync } from "child_process";

const HOMEBREW_BIN = path.join(process.env.HOME ?? "", "homebrew", "bin");
const LOCAL_BIN = path.join(process.env.HOME ?? "", ".local", "bin");
process.env.PATH = [HOMEBREW_BIN, LOCAL_BIN, process.env.PATH ?? ""].filter(Boolean).join(":");

const SAFE_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 USCEHub-P101-Discovery/0.1";
const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024; // 25 MB ceiling

function die(code: number, msg: string): never {
  console.error(`[p101-extract-pdf-text] ${msg}`);
  process.exit(code);
}

function whichPdftotext(): string | null {
  try {
    const out = execFileSync("which", ["pdftotext"], { encoding: "utf8" }).trim();
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

function downloadPdf(url: string, outPath: string): void {
  try {
    execFileSync(
      "curl",
      [
        "-fsSL",
        "-A", SAFE_UA,
        "--max-time", "30",
        "--max-filesize", String(MAX_DOWNLOAD_BYTES),
        "-o", outPath,
        url,
      ],
      { encoding: "utf8" }
    );
  } catch (e) {
    die(2, `curl download failed for ${url}: ${String(e).slice(0, 240)}`);
  }
}

function runPdftotext(pdfPath: string, txtPath: string): void {
  try {
    execFileSync("pdftotext", ["-layout", "-nopgbrk", pdfPath, txtPath], { encoding: "utf8" });
  } catch (e) {
    die(3, `pdftotext failed on ${pdfPath}: ${String(e).slice(0, 240)}`);
  }
}

function main(): void {
  const input = process.argv[2];
  if (!input) die(1, "missing argument: provide a PDF URL or local path");

  if (!whichPdftotext()) {
    die(4, "pdftotext not found on PATH (install poppler-utils: `brew install poppler` or `apt-get install poppler-utils`)");
  }

  const outDirArg = process.argv[3];
  const outDir = outDirArg ? path.resolve(outDirArg) : path.resolve("tmp-pdf-cache");
  fs.mkdirSync(outDir, { recursive: true });

  let pdfPath: string;
  let cleanupPdf = false;
  if (/^https?:\/\//i.test(input)) {
    const hash = crypto.createHash("sha1").update(input).digest("hex").slice(0, 16);
    pdfPath = path.join(outDir, `${hash}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      console.error(`[p101-extract-pdf-text] downloading ${input} -> ${pdfPath}`);
      downloadPdf(input, pdfPath);
      cleanupPdf = false; // keep cached PDF for later re-extract
    } else {
      console.error(`[p101-extract-pdf-text] cache hit: ${pdfPath}`);
    }
  } else {
    pdfPath = path.resolve(input);
    if (!fs.existsSync(pdfPath)) die(5, `local PDF not found: ${pdfPath}`);
  }

  const baseName = path.basename(pdfPath, path.extname(pdfPath));
  const txtPath = path.join(outDir, `${baseName}.txt`);
  runPdftotext(pdfPath, txtPath);

  let text: string;
  try {
    text = fs.readFileSync(txtPath, "utf8");
  } catch (e) {
    die(6, `pdftotext produced no readable output at ${txtPath}: ${String(e)}`);
  }

  if (text.replace(/\s+/g, "").length === 0) {
    die(7, `pdftotext extracted empty text from ${pdfPath} — likely image-only PDF; needs OCR or manual retry`);
  }

  console.log(`[p101-extract-pdf-text] OK`);
  console.log(`pdf:  ${pdfPath}`);
  console.log(`text: ${txtPath}`);
  console.log(`size: ${text.length} chars`);
  console.log(`---FIRST 80 LINES---`);
  const lines = text.split(/\r?\n/);
  for (const ln of lines.slice(0, 80)) console.log(ln);
  if (cleanupPdf) {
    try { fs.unlinkSync(pdfPath); } catch { /* ignore */ }
  }
}

main();
