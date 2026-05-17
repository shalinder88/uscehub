/**
 * Listings Hide-list — local override consulted by prisma/seed.ts.
 *
 * Each entry names a program from `usmle-observerships/data.js` that
 * should be SKIPPED at seed time because its source URL is confirmed
 * dead (network unreachable, persistent 404, or shut down).
 *
 * How verification was done (2026-05-16):
 *   1. exact-link runner fetched each program's link with Safari UA
 *   2. failed ones (FAILED_FETCH / REJECTED) were re-probed via Node fetch
 *      with retry
 *   3. Each network failure was cross-verified with curl (Node fetch is
 *      stricter about TLS — several were Node-false-positive and are
 *      NOT on this list)
 *   4. Only confirmed-dead programs land here. Bot-blocked (HTTP 403)
 *      programs are NOT hidden — the page exists, just bot-blocked.
 *
 * Reversal: delete an entry from HIDDEN_PROGRAMS to re-include it.
 *
 * Path forward for hidden programs:
 *   - Find a replacement direct URL at the institution (if it still
 *     has a USCE program), add to prisma/verified-links.ts, remove
 *     from this hidelist
 *   - If the program no longer exists / institution wound down, leave
 *     hidden permanently
 */

export interface HiddenProgram {
  url: string;
  reason: string;
  // 'TLS_NETWORK_DEAD' — Node fetch + curl both fail with network error
  // 'HTTP_404'         — persistent 404 from server
  // 'AGGREGATOR_DEAD'  — third-party aggregator (not an institution), site dead
  classification: 'TLS_NETWORK_DEAD' | 'HTTP_404' | 'AGGREGATOR_DEAD';
  // Suggested follow-up for the operator. 'PERMANENT' = remove entirely;
  // 'REORIENT' = find a replacement URL at the same institution.
  followUp: 'PERMANENT' | 'REORIENT';
  verifiedAt: string;
}

export const HIDDEN_PROGRAMS: Record<string, HiddenProgram> = {
  // ── HTTP 404 (URL moved or path retired; institution may still have a USCE program at a new path) ──
  "Maimonides Medical Center": {
    url: "https://www.maimonides.org/gme/",
    reason: "HTTP 404 — /gme path retired by Maimonides",
    classification: "HTTP_404",
    followUp: "REORIENT",
    verifiedAt: "2026-05-16",
  },
  "Loyola University Medical Center": {
    url: "https://ssom.luc.edu/gme/",
    reason: "HTTP 404 — Loyola SOM GME path retired",
    classification: "HTTP_404",
    followUp: "REORIENT",
    verifiedAt: "2026-05-16",
  },
  "University of Florida Health / Shands Hospital": {
    url: "https://hr.med.ufl.edu/volunteers/onserving-shadowing-application-process/",
    reason: "HTTP 404 — UF Health HR shadowing path retired (note original URL has typo: 'onserving' should likely be 'observing')",
    classification: "HTTP_404",
    followUp: "REORIENT",
    verifiedAt: "2026-05-16",
  },
  "UPMC (University of Pittsburgh Medical Center)": {
    url: "https://dom.pitt.edu/education/eop/",
    reason: "HTTP 404 — Pitt Department of Medicine 'eop' path retired",
    classification: "HTTP_404",
    followUp: "REORIENT",
    verifiedAt: "2026-05-16",
  },
  "Cleveland Clinic — Research Fellowship": {
    url: "https://my.clevelandclinic.org/departments/research-education/postdoctoral-programs",
    reason: "HTTP 404 — CCF postdoctoral programs URL retired",
    classification: "HTTP_404",
    followUp: "REORIENT",
    verifiedAt: "2026-05-16",
  },
  "Cedars-Sinai — Research Fellowship": {
    url: "https://www.cedars-sinai.edu/research/training/postdoctoral.html",
    reason: "HTTP 404 — Cedars-Sinai postdoctoral training page retired",
    classification: "HTTP_404",
    followUp: "REORIENT",
    verifiedAt: "2026-05-16",
  },

  // ── TLS / network dead (server unreachable; site likely retired) ──
  "Interfaith Medical Center": {
    url: "https://www.interfaithmedical.org/graduate-medical-education",
    reason: "Network unreachable — Interfaith Medical Center filed bankruptcy 2023, now part of One Brooklyn Health; original domain dead",
    classification: "TLS_NETWORK_DEAD",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-16",
  },
  "Brookdale University Hospital": {
    url: "https://www.brookdalehospital.org/gme",
    reason: "Network unreachable — Brookdale is part of One Brooklyn Health system; original domain retired",
    classification: "TLS_NETWORK_DEAD",
    followUp: "REORIENT",
    verifiedAt: "2026-05-16",
  },
  "Kingsbrook Jewish Medical Center": {
    url: "https://www.kingsbrook.org/",
    reason: "Network unreachable — Kingsbrook merged into One Brooklyn Health; original domain retired",
    classification: "TLS_NETWORK_DEAD",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-16",
  },
  "Emory University — Postdoctoral Research": {
    url: "https://www.postdocs.emory.edu/",
    reason: "Network unreachable — postdocs.emory.edu subdomain dead (likely consolidated under main emory.edu)",
    classification: "TLS_NETWORK_DEAD",
    followUp: "REORIENT",
    verifiedAt: "2026-05-16",
  },

  // ── Third-party aggregators (not institutions) — dead and out of scope anyway ──
  "Global Medical Foundation — USCE Programs": {
    url: "https://www.globalmedicalfoundation.com/",
    reason: "Network unreachable — third-party USCE aggregator site is dead",
    classification: "AGGREGATOR_DEAD",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-16",
  },
  "Clinical Experience Programs (CEP) — IMG Rotations": {
    url: "https://clinicalexperienceprograms.com/",
    reason: "Network unreachable — third-party paid-USCE provider site is dead",
    classification: "AGGREGATOR_DEAD",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-16",
  },
};

/** Returns true if the program should be skipped at seed time. */
export function isHidden(programName: string): boolean {
  return programName in HIDDEN_PROGRAMS;
}

/** Stats for the seed log. */
export function hideListStats(): { total: number; byClass: Record<string, number>; byFollowUp: Record<string, number> } {
  const entries = Object.values(HIDDEN_PROGRAMS);
  const byClass: Record<string, number> = {};
  const byFollowUp: Record<string, number> = {};
  for (const e of entries) {
    byClass[e.classification] = (byClass[e.classification] ?? 0) + 1;
    byFollowUp[e.followUp] = (byFollowUp[e.followUp] ?? 0) + 1;
  }
  return { total: entries.length, byClass, byFollowUp };
}
