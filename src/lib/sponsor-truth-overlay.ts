// Auto-generated — run: npx tsx scripts/visa-job-radar/build-sponsor-truth-overlay.ts
// 5870 employers total · 4 with live physician LCA notices · 148 cap-exempt

// Replicates normEmployer() from sponsor-universe.ts for client-side lookup.
const CORP_SUFFIXES = new Set([
  "the","inc","llc","pa","pc","pllc","ltd","corp","corporation",
  "company","co","group","incorporated","associates","association",
]);

export function normEmployerKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ")
    .filter((t) => t.length > 0 && !CORP_SUFFIXES.has(t))
    .join(" ").trim();
}

export interface LiveNotice {
  role: string;
  salaryText: string;
  noticeUrl: string;
  periodText: string;
  firstSeenAt: string;
}

export interface LiveNoticeEmployer {
  employer: string;
  state: string;
  latestNoticeAt: string;
  notices: LiveNotice[];
}

// normKey → active physician LCA notice data from the employer's own public page.
// 20 CFR 655.734 requires ~10 business day public posting — this is the freshest
// legal H-1B signal, months ahead of DOL quarterly disclosure files.
export const LIVE_NOTICE_EMPLOYERS = new Map<string, LiveNoticeEmployer>([
  ["emory university", {
    employer: "Emory University",
    state: "GA",
    latestNoticeAt: "2026-06-21T12:09:21.467Z",
    notices: [
      { role: "Assistant Professor SOM Radiology", salaryText: "", noticeUrl: "https://hr.emory.edu/eu/career/lca-notices/../../_includes/documents/sections/lca-postings/Assistant-Professor-SOM-Radiology-6.10.2026-6.30.2026.pdf", periodText: "", firstSeenAt: "2026-06-14T01:11:25.962Z" },
      { role: "Assistant Professor SOM Radiology", salaryText: "", noticeUrl: "https://hr.emory.edu/eu/career/lca-notices/../../_includes/documents/sections/lca-postings/Assistant-Professor-SOM-Radiology-7.1.2026-6.30.2029.pdf", periodText: "", firstSeenAt: "2026-06-14T01:11:25.962Z" },
      { role: "Assistant Professor SOM Pathology and Laboratory Medicine", salaryText: "", noticeUrl: "https://hr.emory.edu/eu/career/lca-notices/../../_includes/documents/sections/lca-postings/Assistant-Professor-SOM-Pathology-and-Laboratory-Medicine-7.1.2026-6.30.2029.pdf", periodText: "", firstSeenAt: "2026-06-14T01:11:25.962Z" },
      { role: "Assistant Professor SOM Surgery", salaryText: "", noticeUrl: "https://hr.emory.edu/eu/career/lca-notices/../../_includes/documents/sections/lca-postings/Assistant-Professor-SOM-Surgery-8.1.2026-7.31.2029.pdf", periodText: "", firstSeenAt: "2026-06-14T01:11:25.962Z" },
      { role: "Assistant Professor SOM Anesthesiology", salaryText: "", noticeUrl: "https://hr.emory.edu/eu/career/lca-notices/../../_includes/documents/sections/lca-postings/Assistant-Professor-SOM-Anesthesiology-7.1.2026-6.30.2029.pdf", periodText: "", firstSeenAt: "2026-06-18T12:05:05.643Z" },
      { role: "Assistant Professor SOM Surgery 8.1.2026 7.31.20291", salaryText: "", noticeUrl: "https://hr.emory.edu/eu/career/lca-notices/../../_includes/documents/sections/lca-postings/Assistant-Professor-SOM-Surgery-8.1.2026-7.31.20291.pdf", periodText: "", firstSeenAt: "2026-06-18T12:05:05.643Z" },
      { role: "Medical House Staff Resident SOM Surgery", salaryText: "", noticeUrl: "https://hr.emory.edu/eu/career/lca-notices/../../_includes/documents/sections/lca-postings/Medical-House-Staff-Resident-SOM-Surgery-7.1.2026-6.30.2027.pdf", periodText: "", firstSeenAt: "2026-06-19T12:08:01.120Z" },
    ],
  }],
  ["university of arkansas for medical sciences", {
    employer: "University of Arkansas for Medical Sciences",
    state: "AR",
    latestNoticeAt: "2026-06-20T12:14:19.296Z",
    notices: [
      { role: "Fellow Physician", salaryText: "$68,720.00", noticeUrl: "https://hr.uams.edu/immigration-services/wp-content/uploads/sites/9/2026/03/Fellow-Physician-I-200-26064-681539.pdf", periodText: "07/01/2026 – 06/23/2029", firstSeenAt: "2026-06-14T01:07:56.218Z" },
      { role: "Physician", salaryText: "$175/hr", noticeUrl: "https://hr.uams.edu/immigration-services/wp-content/uploads/sites/9/2026/05/Physician-I-200-26146-947183-1.pdf", periodText: "7/1/2026 - 6/30/2028", firstSeenAt: "2026-06-14T01:07:56.218Z" },
      { role: "Fellow Physician", salaryText: "$77,210.00", noticeUrl: "https://hr.uams.edu/immigration-services/wp-content/uploads/sites/9/2026/06/Fellow-Physician-I-200-26162-004440.pdf", periodText: "7/3/2026 - 7/2/2029", firstSeenAt: "2026-06-14T01:07:56.218Z" },
      { role: "Fellow Physician", salaryText: "$68,720", noticeUrl: "https://hr.uams.edu/immigration-services/wp-content/uploads/sites/9/2026/02/Fellow-Physician-I-200-26057-666396.pdf", periodText: "07/01/2026 – 06/30/2029", firstSeenAt: "2026-06-14T01:07:56.218Z" },
      { role: "Resident/Fellow Physician", salaryText: "$63396.00", noticeUrl: "https://hr.uams.edu/immigration-services/wp-content/uploads/sites/9/2026/05/Resident-Fellow-Physician-I-200-26126-878193.pdf", periodText: "6/17/2026 - 06/16/2029", firstSeenAt: "2026-06-14T01:07:56.218Z" },
      { role: "Resident/Fellow Physician", salaryText: "$63,396.00", noticeUrl: "https://hr.uams.edu/immigration-services/wp-content/uploads/sites/9/2026/05/Resident-Fellow-Physician-I-200-26142-941577.pdf", periodText: "6/17/2026 - 6/16/2029", firstSeenAt: "2026-06-14T01:07:56.218Z" },
    ],
  }],
  ["university of pittsburgh", {
    employer: "University of Pittsburgh",
    state: "PA",
    latestNoticeAt: "2026-06-21T12:09:21.467Z",
    notices: [
      { role: "Assistant Professor - Adult Cardiology", salaryText: "$156.25 per hour", noticeUrl: "https://www.ois.pitt.edu/sites/default/files/docs/Assistant%20Professor%20-%20Adult%20Cardiology%20%28UPP%29.pdf", periodText: "from 9/1/2026 to 8/31/2029", firstSeenAt: "2026-06-11T02:41:35.993Z" },
      { role: "Assistant Professor – Molecular Genomic Pathology", salaryText: "$125.00 per hour", noticeUrl: "https://www.ois.pitt.edu/sites/default/files/docs/Assistant%20Professor%20%E2%80%93%20Molecular%20Genomic%20Pathology%20%28Medicine%29.pdf", periodText: "from 8/1/2026 to 7/31/2029", firstSeenAt: "2026-06-15T12:05:05.762Z" },
    ],
  }],
  ["university of kansas medical center", {
    employer: "THE UNIVERSITY OF KANSAS MEDICAL CENTER",
    state: "KS",
    latestNoticeAt: "2026-06-16T12:05:06.426Z",
    notices: [
      { role: "Pulmonary and Critical Care Nocturnist Physician/Faculty", salaryText: "$435,000", noticeUrl: "https://www.kumc.edu/documents/international/lca/NOTICE%20OF%20LCA%20FILING%20KBGOVI07995-2%20%282%29.pdf", periodText: "from 13 Jul 2026 to 12 Jul 2029", firstSeenAt: "2026-06-11T02:02:17.834Z" },
    ],
  }],
]);

// normKeys of cap-exempt employers (H-1B cap does not apply; no annual lottery).
export const CAP_EXEMPT_KEYS = new Set<string>(["emory university","university of arkansas for medical sciences","university of pittsburgh","university of kansas medical center","university hospitals medical","university of kentucky","montefiore medical center","medical college of wisconsin","university of rochester","nationwide children s hospital","medical university of south carolina and affiliates","university of minnesota physicians","university of louisville physicians","memorial sloan kettering cancer center","university of pittsburgh physicians","trustees of university of pennsylvania","cleveland clinic","cleveland clinic foundation","mayo clinic","university of alabama health services foundation","icahn school of medicine at mount sinai","banner university medical","university of colorado denver","university of florida","johns hopkins university","university of kansas physicians","university of miami","indiana university health care","university of vermont health network medical","university of washington","university physicians surgeons","university pediatricians","children s national medical center","nyu grossman school of medicine","university of iowa","ut southwestern medical center","columbia university","cincinnati children s hospital medical center","rutgers state university of new jersey","university of michigan","university of utah","university of texas health science center at houston","university of texas medical branch","mount sinai community foundation","wake forest university baptist medical center","university of texas m d anderson cancer center","wake forest university health sciences","yale university","brown medicine","university of california san francisco","weill cornell medical college","curators of university of missouri","children s physician services of south texas","children s mercy hospital","vanderbilt university medical center","west virginia university medical","university of virginia health services foundation","baylor college of medicine","university of connecticut health center","mount sinai medical center of florida","ohio state university","indiana university health ball memorial physicians","southern illinois university school of medicine","phoenix children s hospital","university of south florida","university of louisville","cleveland clinic florida","rush university medical center","valley children s specialty medical","saint peter s university hospital","texas tech university health sciences center el paso","leland stanford jr university","university of north carolina at chapel hill","st jude children s research hospital","university health physicians","university of maryland community medical","nemours foundation nemours children s health","indiana university purdue university indianapolis","northwestern medical faculty foundation","upmc altoona","children s health care","connecticut children s specialty","university of chicago","university primary care practices","indiana university health arnett","university of wisconsin medical foundation","university of california san diego","albany medical college","brown neurology","valley children s primary care","university health system","nicklaus children s pediatric specialists","emory children s pediatric institute","dayton children s specialty physicians","upmc community medicine","northwestern memorial healthcare","prisma health university medical","university at buffalo pediatric","university of maryland baltimore","university radiology llp","east tennessee children s hospital","university of kansas school of medicine wichita medical practice","upmc altoona regional health services","rush medical","university of new mexico","duke university","mount sinai hospital","northwestern university","boston children s heart foundation","children s hospital los angeles medical","east carolina university","queen s university medical","university of wisconsin system","university of vermont health network alice hyde medical center","west virginia university hospitals","clinical care of university of pennsylvania health system","oregon health and science university","children s community care","university of vermont medical","university of colorado health","thomas jefferson university","upmc western maryland health services","university of virginia physicians","temple university a commonwealth university","university of mississippi medical center","old dominion university","brown dermatology","university of texas health center at tyler","university of vermont medical health network medical","children s anesthesia","children s hospital neurology foundation","dayton children s hospital","el paso children s physician","sheridan children s services of alabama","lurie children s medical","university of vermont health network champlain valley physicians hospital","seattle children s hospital","children s specialized hospital","stony brook children s services ufpc","children s medical","university of vermont health network university of vermont medical center","nicklaus children s pediatric specialist","iowa state university of science and technology","presbyterian medical center of university of pennsylvania health system","east tennessee state university etsu","oregon health and science unviersity","partners physician a subsidiary of cleveland clinic","university physicians and surgeons"]);
