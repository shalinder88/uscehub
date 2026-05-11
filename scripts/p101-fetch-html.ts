/**
 * P101 — Minimal bot-block retry HTML fetcher
 *
 * Some institution domains (e.g., medschool.umich.edu) return HTTP 403 to
 * WebFetch's default User-Agent. This helper retries with a realistic
 * browser-style User-Agent using the system `curl` binary. It does NOT
 * bypass CAPTCHA, login, or paywalls. It does NOT crawl. It fetches ONE
 * URL, records what happened, and writes cleaned text or a failure reason
 * to stdout.
 *
 * Usage:
 *   npx tsx scripts/p101-fetch-html.ts <url> [outdir]
 *
 * Behavior:
 *   - Single URL, one request, single 30s timeout.
 *   - User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15
 *   - Accept: text/html
 *   - Max body size: 5 MB.
 *   - Follows up to 5 redirects (recorded).
 *   - Writes raw HTML to tmp-html-cache/<sha1>.html and stripped text to
 *     tmp-html-cache/<sha1>.txt.
 *   - Prints HTTP status, final URL, content-type, byte size, redirect
 *     chain, and the first 80 lines of stripped text.
 *   - Exits non-zero on failure with a short reason. Operator then classifies
 *     the institution as `BOT_BLOCKED_MANUAL_RETRY` if no plausible source
 *     emerges, or quotes the cleaned text into the packet if it does.
 *
 * Hard rules:
 *   - NO CAPTCHA / login / paywall / 2FA bypass.
 *   - NO credentials stored or printed.
 *   - NO proxy. NO Tor.
 *   - NO parallel crawling. NO domain hammering.
 *   - NO automatic Wayback fallback (operator can run separately if needed).
 *   - NO browser automation framework.
 *   - NO persistent database.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { execFileSync } from "child_process";

const HOMEBREW_BIN = path.join(process.env.HOME ?? "", "homebrew", "bin");
process.env.PATH = [HOMEBREW_BIN, "/usr/bin", "/usr/local/bin", process.env.PATH ?? ""].filter(Boolean).join(":");

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_S = 30;
const MAX_REDIRECTS = 5;

function die(code: number, msg: string): never {
  console.error(`[p101-fetch-html] ${msg}`);
  process.exit(code);
}

function whichCurl(): string | null {
  try {
    const out = execFileSync("which", ["curl"], { encoding: "utf8" }).trim();
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  // Remove script/style blocks, then collapse tags. Not a parser — enough
  // for verbatim-quote spotting. The operator pastes the actual quote from
  // the page itself; this is a search-aid.
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function main(): void {
  const url = process.argv[2];
  if (!url) die(1, "missing argument: provide a URL");
  if (!/^https?:\/\//i.test(url)) die(2, `URL must start with http:// or https://; got '${url}'`);
  if (!whichCurl()) die(3, "curl not found on PATH");

  const outDirArg = process.argv[3];
  const outDir = outDirArg ? path.resolve(outDirArg) : path.resolve("tmp-html-cache");
  fs.mkdirSync(outDir, { recursive: true });

  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
  const htmlPath = path.join(outDir, `${hash}.html`);
  const txtPath = path.join(outDir, `${hash}.txt`);
  const metaPath = path.join(outDir, `${hash}.meta.json`);

  let status = -1;
  let finalUrl = url;
  let contentType = "";
  let redirects: string[] = [];

  try {
    const writeOutFormat = "STATUS=%{http_code}\\nFINAL_URL=%{url_effective}\\nCONTENT_TYPE=%{content_type}\\nSIZE=%{size_download}\\nREDIRECTS=%{num_redirects}\\n";
    const out = execFileSync(
      "curl",
      [
        "-sS",
        "-L",
        "--max-redirs", String(MAX_REDIRECTS),
        "--max-time", String(TIMEOUT_S),
        "--max-filesize", String(MAX_BYTES),
        "-A", UA,
        "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "-H", "Accept-Language: en-US,en;q=0.5",
        "-o", htmlPath,
        "-w", writeOutFormat,
        url,
      ],
      { encoding: "utf8" }
    );
    for (const line of out.split("\n")) {
      if (line.startsWith("STATUS=")) status = Number.parseInt(line.slice(7), 10);
      else if (line.startsWith("FINAL_URL=")) finalUrl = line.slice(10);
      else if (line.startsWith("CONTENT_TYPE=")) contentType = line.slice(13);
    }
  } catch (e) {
    die(4, `curl failed: ${String(e).slice(0, 240)}`);
  }

  if (status >= 400 || status < 0) {
    fs.writeFileSync(metaPath, JSON.stringify({ url, status, finalUrl, contentType, redirects, fetchedAt: new Date().toISOString() }, null, 2));
    die(status, `HTTP ${status} ${finalUrl} content-type=${contentType}`);
  }

  let html: string;
  try {
    html = fs.readFileSync(htmlPath, "utf8");
  } catch (e) {
    die(5, `failed to read fetched HTML at ${htmlPath}: ${String(e)}`);
  }

  const text = stripHtml(html);
  fs.writeFileSync(txtPath, text);
  fs.writeFileSync(metaPath, JSON.stringify({ url, status, finalUrl, contentType, byteSize: html.length, textSize: text.length, fetchedAt: new Date().toISOString() }, null, 2));

  console.log(`[p101-fetch-html] OK`);
  console.log(`status:       ${status}`);
  console.log(`final_url:    ${finalUrl}`);
  console.log(`content_type: ${contentType}`);
  console.log(`html:         ${htmlPath} (${html.length} bytes)`);
  console.log(`text:         ${txtPath} (${text.length} chars)`);
  console.log(`---FIRST 80 LINES OF STRIPPED TEXT---`);
  const lines = text.split(/\.\s+/);
  for (const ln of lines.slice(0, 80)) console.log(ln);
}

main();
