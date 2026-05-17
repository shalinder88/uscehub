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
  // 'OPERATOR_HIDE_NO_DIRECT_URL' — institution exists and site is alive, but
  //                                 operator confirmed no usable direct URL for
  //                                 visiting M4 / observership / postdoc; hide
  //                                 until a real linkable pathway is found
  classification:
    | 'TLS_NETWORK_DEAD'
    | 'HTTP_404'
    | 'AGGREGATOR_DEAD'
    | 'THIRD_PARTY_BROKER'
    | 'OPERATOR_HIDE_NO_DIRECT_URL';
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

  // ── ADDED 2026-05-17 (operator visual QA pass on /usce/verified-
  //    preview/display-readiness): outreach + manual-browser + research-
  //    reverify rows where the operator confirmed no usable direct URL
  //    exists. These were previously held in the BORDERLINE / BROKEN /
  //    RESEARCH_TOO_GENERIC_REVERIFY buckets. Operator review converted
  //    them into hard hides because surfacing them on the live site
  //    would either link to a useless residency-only page or to a
  //    generic homepage with no direct visiting / postdoc pathway.
  //    All can be REORIENTED in the future if a real direct URL is
  //    discovered. ──

  "Jamaica Hospital Medical Center": {
    url: "https://jamaicahospital.org/graduate-medical-education/",
    reason: "Operator-confirmed 2026-05-17: jamaicahospital.org GME page lists residency programs only — no USCE for visiting medical students. Hidelist entry covers both data.js entries with this name (general homepage + GME landing).",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-17",
  },

  "Richmond University Medical Center": {
    url: "https://www.rumcsi.org/careers/graduate-medical-education/",
    reason: "Operator-confirmed 2026-05-17: rumcsi.org GME page lists residency programs only — no USCE for visiting medical students at RUMC Staten Island. Hidelist entry covers both data.js entries with this name.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-17",
  },

  "Advocate Christ Medical Center": {
    url: "https://www.advocatehealth.com/education/medical-education/medical-students",
    reason: "Operator-confirmed 2026-05-17: advocatehealth.com/education/medical-education/medical-students has nothing actionable for Advocate Christ specifically. Prior verified-links note describing electives + $2,000 EM scholarship could not be re-verified on the page as written. Hidelist entry covers both data.js entries with this name.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-17",
  },

  // ── 7 research-reverify rows hidden 2026-05-17 (operator-confirmed
  //    none of these have a direct postdoc URL — only generic
  //    institution / school landing pages — and the user instructed
  //    "disregard these too"). These can be UNHIDDEN if and when the
  //    operator supplies a deeper postdoc-office URL. ──

  "Mayo Clinic — Research Fellowship": {
    url: "https://college.mayo.edu/",
    reason: "Operator-confirmed 2026-05-17: college.mayo.edu is the Mayo Clinic College of Medicine and Science homepage, not a direct postdoc fellowship URL. No usable direct link. Hide until a deeper Research Fellowship office URL is found.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  "Mount Sinai — Postdoctoral Research": {
    url: "https://icahn.mssm.edu/",
    reason: "Operator-confirmed 2026-05-17: icahn.mssm.edu is the Icahn School of Medicine homepage, not a direct postdoctoral research URL. No usable direct link. Hide until a deeper postdoc office URL is found.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  "University of Pittsburgh — Postdoctoral Research": {
    url: "https://www.postdoc.pitt.edu/",
    reason: "Operator-confirmed 2026-05-17: postdoc.pitt.edu is the Office of Postdoctoral Affairs landing, not a direct application pathway for a specific postdoctoral program. No usable direct link. Hide until a deeper program URL is found.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  "Fred Hutchinson Cancer Center": {
    url: "https://www.fredhutch.org/",
    reason: "Operator-confirmed 2026-05-17: fredhutch.org is the institution homepage, not a direct research fellowship URL. No usable direct link. Hide until a deeper research training URL is found.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  "Baylor College of Medicine — Postdoctoral Research": {
    url: "https://www.bcm.edu/",
    reason: "Operator-confirmed 2026-05-17: bcm.edu is the Baylor College of Medicine homepage, not a direct postdoctoral research URL. No usable direct link. Hide until a deeper postdoc office URL is found.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  "Northwestern Feinberg — Postdoctoral Research": {
    url: "https://www.feinberg.northwestern.edu/",
    reason: "Operator-confirmed 2026-05-17: feinberg.northwestern.edu is the Feinberg SOM homepage, not a direct postdoctoral research URL. No usable direct link. Hide until a deeper postdoc office URL is found.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  "Albert Einstein College of Medicine — Research Fellowship": {
    url: "https://einsteinmed.edu/",
    reason: "Operator-confirmed 2026-05-17: einsteinmed.edu is the Albert Einstein College of Medicine homepage, not a direct research fellowship URL. No usable direct link. Hide until a deeper research training URL is found.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  // ── ADDED 2026-05-17 (second operator review pass): 5 institutions
  //    whose pages are dead, closed, or scope-restricted to a pathway
  //    that does not match a general M4 visiting / observership audience.
  //    All can be unhidden if a real direct URL is discovered. ──

  "Conemaugh Memorial Medical Center": {
    url: "https://gme.conemaugh.org/resident-programs/medical-students",
    reason: "Operator-confirmed 2026-05-17: gme.conemaugh.org returns 404 to WebFetch and the institution previously stated 'Conemaugh does not offer observerships, externships, shadowing or research assistant positions' (only M4 Internal Medicine audition rotation, which is a different audience from general USCE seekers). Hide until a real M4 page is published.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  // "George Washington University Hospital" — REMOVED from hidelist after
  //   operator's second-pass decision 2026-05-17: keep the reorient to
  //   smhs.gwu.edu/academics/md-program/visiting-students as the active
  //   visiting-student elective pathway. The hidelist's name-key match
  //   was incorrectly hiding the row even though the URL had been
  //   reoriented; removing here so it surfaces in the active display.

  "Allegheny Health Network": {
    url: "https://www.alleghenyinternational.org/observerships.html",
    reason: "Operator-confirmed 2026-05-17: 'Allegheny International is currently not accepting new applications for the Observership Program.' Hide until program reopens.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  "Allegheny Health Network — Observership": {
    url: "https://www.alleghenyinternational.org/observerships.html",
    reason: "Same as Allegheny Health Network parent entry — program suspended.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
    verifiedAt: "2026-05-17",
  },

  "SAMS — Clinical Observership (Nonprofit)": {
    url: "https://society.sams-usa.net/observership-program/",
    reason: "Operator-confirmed 2026-05-17: SAMS (Syrian American Medical Society) is a third-party nonprofit that matches IMG observers with preceptors at private practices and clinics — not an institutional hospital VSLO pathway. Same scope-of-catalog rationale as Brooklyn USCE / AMG / ValueMD: out of scope for an institutional-USCE catalog. Free / no SAMS fee, but institution-specific fees and personal expenses apply.",
    classification: "THIRD_PARTY_BROKER",
    followUp: "PERMANENT",
    verifiedAt: "2026-05-17",
  },

  "Crozer-Chester Medical Center": {
    url: "https://crozerem.com/medical-students/",
    reason: "Operator-confirmed 2026-05-17: only documented Crozer M4 pathway is the Drexel-Crozer EM clerkship for Drexel-enrolled students. No general visiting M4 pathway for students from other LCME schools. Hide until a general program URL is found.",
    classification: "OPERATOR_HIDE_NO_DIRECT_URL",
    followUp: "REORIENT",
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
