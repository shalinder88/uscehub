#!/usr/bin/env tsx
/**
 * P102 PDF extraction cascade — shells out to pdftotext (or pdftoppm+OCR
 * if available) to extract text from PDFs already on disk.
 *
 * Decision logic + status determination lives in p102-extraction-lib.ts
 * for testability. This file is the I/O wrapper: it inspects the system
 * for available binaries and invokes them.
 *
 * No network. No Agent.
 *
 * Used in two places (when extraction resumes):
 *   1. The runner's A0 probe, when content-type indicates application/pdf.
 *   2. A post-hoc batch over already-captured PDFs in T7 artifact folders.
 *
 * Usage (post-hoc batch, when extraction resumes):
 *   npx tsx scripts/p102-pdf-cascade.ts --run-id <id>
 *   npx tsx scripts/p102-pdf-cascade.ts --all-existing-p102-runs
 *
 * No-op for runs without captured PDFs (current state: all 4 runs).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  decidePdfToolChain, determinePdfStatus,
  type PdfExtractResult, type PdfStatus,
} from './p102-extraction-lib';

const REPO_ROOT = path.resolve(__dirname, '..');
const RUNS_ROOT = path.join(REPO_ROOT, 'docs/platform-v2/local/usce-discovery-command-center/p102/runs');

function whichExists(bin: string): boolean {
  try {
    execFileSync('which', [bin], { stdio: ['ignore', 'pipe', 'ignore'] });
    return true;
  } catch {
    return false;
  }
}

function pdfPagesViaPdfInfo(pdfPath: string): number | null {
  try {
    const out = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' });
    const m = out.match(/Pages:\s+(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  } catch {
    return null;
  }
}

export function extractTextFromPdf(pdfPath: string): PdfExtractResult {
  const result: PdfExtractResult = {
    status: 'NOT_PDF',
    text: null,
    byteSize: 0,
    pageCount: null,
    errorMessage: null,
    toolChainUsed: 'none',
  };
  if (!fs.existsSync(pdfPath)) {
    result.errorMessage = 'pdf file not found';
    result.status = 'PDF_FAILED';
    return result;
  }
  result.byteSize = fs.statSync(pdfPath).size;
  result.pageCount = pdfPagesViaPdfInfo(pdfPath);

  const tools = {
    pdftotext: whichExists('pdftotext'),
    pdftoppm: whichExists('pdftoppm'),
    tesseract: whichExists('tesseract'),
  };
  const chain = decidePdfToolChain(tools);
  result.toolChainUsed = chain.toolChain;

  if (chain.toolChain === 'pdftotext') {
    try {
      // pdftotext -layout preserves structure; default is fine for our purposes.
      const text = execFileSync('pdftotext', [pdfPath, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      result.text = text;
      result.status = determinePdfStatus(text, 'pdftotext', null);
    } catch (e) {
      result.errorMessage = e instanceof Error ? e.message : String(e);
      result.status = 'PDF_FAILED';
    }
  } else if (chain.toolChain === 'pdftoppm+ocr') {
    // For P102-0AD scope, this branch is documented but not implemented.
    // When tesseract becomes available, render pages to PNG and OCR each.
    result.errorMessage = 'pdftoppm+ocr cascade not yet implemented; tesseract presence not confirmed in this environment';
    result.status = 'PDF_OCR_UNAVAILABLE';
  } else {
    result.errorMessage = chain.reason;
    result.status = 'PDF_BINARY_NOT_AVAILABLE';
  }

  return result;
}

interface RunPdfSummary {
  runId: string;
  pdfsFound: number;
  pdfsExtracted: number;
  pdfsFailed: number;
  pdfsOcrUnavailable: number;
}

function processRun(runFolder: string): RunPdfSummary {
  const runId = path.basename(runFolder);
  const summary: RunPdfSummary = { runId, pdfsFound: 0, pdfsExtracted: 0, pdfsFailed: 0, pdfsOcrUnavailable: 0 };

  // Look for PDFs in the T7 artifact folder.
  const sourceMap = (() => {
    try { return JSON.parse(fs.readFileSync(path.join(runFolder, '01_source_map.json'), 'utf8')) as { sources?: Array<{ sourceUrl: string; cleanedTextPath: string | null; rawHtmlPath: string | null; pdfStatus?: string }> }; }
    catch { return null; }
  })();
  if (!sourceMap?.sources) return summary;

  // Find the run's T7 artifact pdf folder
  // Conventionally: <T7>/p102-national-runner/artifacts/<runId>/pdf/
  const t7Root = '/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/artifacts';
  const pdfDir = path.join(t7Root, runId, 'pdf');
  if (!fs.existsSync(pdfDir)) return summary;
  const pdfs = fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  summary.pdfsFound = pdfs.length;

  const results: Array<{ file: string; result: PdfExtractResult }> = [];
  for (const f of pdfs) {
    const fullPath = path.join(pdfDir, f);
    const r = extractTextFromPdf(fullPath);
    results.push({ file: f, result: r });
    if (r.status === 'PDF_TEXT_EXTRACTED') summary.pdfsExtracted++;
    else if (r.status === 'PDF_FAILED') summary.pdfsFailed++;
    else if (r.status === 'PDF_OCR_UNAVAILABLE') summary.pdfsOcrUnavailable++;

    // If extraction succeeded, write cleaned text alongside the PDF.
    if (r.text && r.status === 'PDF_TEXT_EXTRACTED') {
      const cleanedTextPath = path.join(t7Root, runId, 'cleaned_text', f.replace(/\.pdf$/i, '_pdf.txt'));
      fs.mkdirSync(path.dirname(cleanedTextPath), { recursive: true });
      fs.writeFileSync(cleanedTextPath, r.text);
    }
  }

  // Write a summary file
  fs.writeFileSync(path.join(runFolder, 'p102_0ad_pdf_cascade.json'), JSON.stringify({
    schemaVersion: 'p102-0r-1',
    runId,
    extractedAt: new Date().toISOString(),
    extractedBy: 'p102-pdf-cascade (pdftotext)',
    summary,
    results: results.map(r => ({ file: r.file, status: r.result.status, textLength: r.result.text?.length ?? 0, byteSize: r.result.byteSize, pageCount: r.result.pageCount, toolChainUsed: r.result.toolChainUsed, errorMessage: r.result.errorMessage })),
  }, null, 2) + '\n');

  return summary;
}

function parseArgs(argv: string[]): { runIds: string[] } {
  const args = { runIds: [] as string[] };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--run-id') args.runIds.push(argv[++i]);
    else if (argv[i] === '--all-existing-p102-runs') {
      if (fs.existsSync(RUNS_ROOT)) {
        args.runIds = fs.readdirSync(RUNS_ROOT).filter(n => fs.statSync(path.join(RUNS_ROOT, n)).isDirectory());
      }
    }
  }
  return args;
}

function main(): void {
  const args = parseArgs(process.argv);
  if (args.runIds.length === 0) { console.error('No runs specified.'); process.exit(2); }
  console.log(`[pdf-cascade] processing ${args.runIds.length} runs`);
  let totalFound = 0, totalExtracted = 0;
  for (const runId of args.runIds) {
    const s = processRun(path.join(RUNS_ROOT, runId));
    totalFound += s.pdfsFound;
    totalExtracted += s.pdfsExtracted;
    console.log(`  ${s.runId}: PDFs found=${s.pdfsFound}, extracted=${s.pdfsExtracted}, failed=${s.pdfsFailed}, ocr-unavailable=${s.pdfsOcrUnavailable}`);
  }
  console.log(`[pdf-cascade] total: ${totalFound} PDFs found, ${totalExtracted} extracted`);
}

main();
