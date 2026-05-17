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
  // 'TLS_NETWORK_DEAD'           — Node fetch + curl both fail with network error
  // 'HTTP_404'                   — persistent 404 from server
  // 'AGGREGATOR_DEAD'            — third-party aggregator (not an institution), site dead
  // 'THIRD_PARTY_BROKER'         — third-party broker site is alive but not an
  //                                 institutional USCE provider (out of scope)
  classification: 'TLS_NETWORK_DEAD' | 'HTTP_404' | 'AGGREGATOR_DEAD' | 'THIRD_PARTY_BROKER';
  // Suggested follow-up for the operator. 'PERMANENT' = remove entirely;
  // 'REORIENT' = find a replacement URL at the same institution.
  followUp: 'PERMANENT' | 'REORIENT';
  verifiedAt: string;
}

export const HIDDEN_PROGRAMS: Record<string, HiddenProgram> = {
  // ── REORIENTED 2026-05-16: Maimonides, Loyola, UF Health, UPMC now have
  //    replacement URLs in prisma/verified-links.ts and have been removed
  //    from this hide list. Original dead URLs documented in the verified-
  //    links.ts note fields for that institution.
  //
  // ── RESEARCH/POSTDOC programs (reclassified REORIENT → PERMANENT). A
  //    replacement URL was found for each but the page is a research /
  //    postdoctoral program, not a Tier-1 USCE clinical opportunity. The
  //    intelligent-extraction gate correctly rejects them as
  //    REJECT_RESEARCH_ONLY. They stay hidden until product scope expands
  //    to research/postdoc as a separate lane. ──

  "Cleveland Clinic — Research Fellowship": {
    url: "https://www.lerner.ccf.org/education/postdoctoral-program/",
    reason: "Replacement found at lerner.ccf.org but page is research postdoctoral program — not Tier-1 USCE per the intelligent-extraction gate (REJECT_RESEARCH_ONLY)",
    classification: "HTTP_404",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-16",
  },
  "Cedars-Sinai — Research Fellowship": {
    url: "https://www.cedars-sinai.edu/education/professional-training-programs/postdoctoral-scientist-program.html",
    reason: "Replacement found at cedars-sinai.edu but page is Postdoctoral Scientist Program — research, not Tier-1 USCE clinical opportunity",
    classification: "HTTP_404",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-16",
  },
  "Emory University — Postdoctoral Research": {
    url: "https://med.emory.edu/education/postdoctoral-training/index.html",
    reason: "Replacement found at med.emory.edu but page is research postdoctoral training (T32s, cancer biology, HIV) — not Tier-1 USCE clinical",
    classification: "TLS_NETWORK_DEAD",
    followUp: "PERMANENT",
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
    reason: "Network unreachable — Brookdale is part of One Brooklyn Health system; original domain retired. WebSearch confirmed One Brooklyn Health publishes residency info but no observership/visiting-student program — only ACGME residencies. Stays hidden until a Tier-1 USCE page is found.",
    classification: "TLS_NETWORK_DEAD",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-16",
  },
  "Kingsbrook Jewish Medical Center": {
    url: "https://www.kingsbrook.org/",
    reason: "Network unreachable — Kingsbrook merged into One Brooklyn Health; original domain retired",
    classification: "TLS_NETWORK_DEAD",
    followUp: "PERMANENT",
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

  // ── ADDED 2026-05-16 second-pass: NYC/Queens IMG-residency hospitals
  //    that confirmed via WebSearch they do NOT offer formal observership
  //    or visiting-medical-student programs. Their existing data.js
  //    entries were misclassified as USCE — they're residency-only. ──

  "Flushing Hospital Medical Center": {
    url: "https://www.flushinghospital.org/graduate-medical-education",
    reason: "WebSearch + FAQ confirmed: 'Observership/externship positions are not offered at Flushing Hospital Medical Center.' Residency programs only. Should not appear in USCE corpus.",
    classification: "HTTP_404",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-16",
  },

  // ── ADDED 2026-05-17 one-by-one packets #97/98/99: third-party
  //    broker / non-institutional sites that don't belong in an
  //    institutional-USCE catalog. Sites are alive — hidden because
  //    they're out of scope, not because they're dead. ──

  "AMG Medical Group — Clinical Rotations": {
    url: "https://amgmedicalgroup.com/",
    reason: "WebFetch confirmed: AMG is a Direct Primary Care clinic operating since 2005 in NYC with $59/$99/$129 monthly membership plans for unlimited primary care visits — NOT a clinical rotation provider, NOT a hospital, NOT an USCE source. The data.js description claiming 'THIRD-PARTY PLACEMENT SERVICE' is unsupported by the actual website content. Out of scope for an institutional-USCE catalog. One-by-one packet #97.",
    classification: "THIRD_PARTY_BROKER",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-17",
  },

  "ValueMD Clinical Rotations": {
    url: "https://www.valuemd.com/clinical-rotations/",
    reason: "WebFetch returned 401 Unauthorized; WebSearch confirmed ValueMD is a Caribbean-medical-school discussion forum with advertising/sponsorship relationships, not an institutional clinical rotation provider. Out of scope for an institutional-USCE catalog. Site retains an active IMG forum but does not arrange or run clinical rotations itself. One-by-one packet #98.",
    classification: "THIRD_PARTY_BROKER",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-17",
  },

  "Brooklyn USCE — Clinical Rotations": {
    url: "https://brooklynusce.com/",
    reason: "WebFetch FAQ confirmed: Brooklyn USCE is a physician-owned private-clinic rotation placement service ('Our company is physician owned to help new physicians start their career'), placing IMGs at unaffiliated private clinics with ACGME-affiliated attendings. Not an institutional hospital program — categorically distinct from VSLO-based academic medical centers. Per third-party iatroX advisory: 'paid clinical rotations from third-party companies are often scams or very low value; if someone is charging $3,000–$10,000+ for a rotation at an unaffiliated private office, caution is advised.' Out of scope for an institutional-USCE catalog. One-by-one packet #99.",
    classification: "THIRD_PARTY_BROKER",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-17",
  },

  "Clinical Experience Programs — Multi-Site": {
    url: "#",
    reason: "data.js entry has placeholder URL '#' (no real link) and description labels it 'THIRD-PARTY PLACEMENT SERVICE (not a hospital). Arranges clinical rotations at community hospitals' — same category as Brooklyn USCE / AMG / ValueMD third-party brokers. No institutional source URL exists. Out of scope for institutional-USCE catalog. Distinct from the prior 'Clinical Experience Programs (CEP) — IMG Rotations' (AGGREGATOR_DEAD; that one is a dead domain). One-by-one packet #104.",
    classification: "THIRD_PARTY_BROKER",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-17",
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
