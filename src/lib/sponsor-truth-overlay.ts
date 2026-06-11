// Auto-generated — run: npx tsx scripts/visa-job-radar/build-sponsor-truth-overlay.ts
// 1465 employers total · 2 with live physician LCA notices · 148 cap-exempt

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
  ["university of kansas medical center", {
    employer: "THE UNIVERSITY OF KANSAS MEDICAL CENTER",
    state: "KS",
    latestNoticeAt: "2026-06-11T02:41:35.993Z",
    notices: [
      { role: "Pulmonary and Critical Care Nocturnist Physician/Faculty", salaryText: "$435,000", noticeUrl: "https://www.kumc.edu/documents/international/lca/NOTICE%20OF%20LCA%20FILING%20KBGOVI07995-2%20%282%29.pdf", periodText: "from 13 Jul 2026 to 12 Jul 2029", firstSeenAt: "2026-06-11T02:02:17.834Z" },
    ],
  }],
  ["university of pittsburgh", {
    employer: "University of Pittsburgh",
    state: "PA",
    latestNoticeAt: "2026-06-11T02:41:35.993Z",
    notices: [
      { role: "Assistant Professor - Adult Cardiology", salaryText: "$156.25 per hour", noticeUrl: "https://www.ois.pitt.edu/sites/default/files/docs/Assistant%20Professor%20-%20Adult%20Cardiology%20%28UPP%29.pdf", periodText: "from 9/1/2026 to 8/31/2029", firstSeenAt: "2026-06-11T02:41:35.993Z" },
    ],
  }],
]);

// normKeys of cap-exempt employers (H-1B cap does not apply; no annual lottery).
export const CAP_EXEMPT_KEYS = new Set<string>(["university of kansas medical center","university of pittsburgh","mayo clinic","university of arkansas for medical sciences","montefiore medical center","university of iowa","cleveland clinic foundation","icahn school of medicine at mount sinai","emory university","west virginia university medical","memorial sloan kettering cancer center","banner university medical","university of pittsburgh physicians","cleveland clinic","university of alabama health services foundation","trustees of university of pennsylvania","university of kentucky","university of colorado denver","medical university of south carolina and affiliates","university of florida","university of rochester","johns hopkins university","university of louisville","university of utah","university of washington","university of louisville physicians","wake forest university baptist medical center","university of kansas physicians","university physicians surgeons","university of miami","medical college of wisconsin","ut southwestern medical center","university of new mexico","nyu grossman school of medicine","rutgers state university of new jersey","university of texas medical branch","cincinnati children s hospital medical center","children s national medical center","university hospitals medical","university of minnesota physicians","university of michigan","ohio state university","nicklaus children s pediatric specialists","columbia university","university of vermont health network medical","university of texas m d anderson cancer center","curators of university of missouri","indiana university health care","vanderbilt university medical center","st jude children s research hospital","mount sinai community foundation","weill cornell medical college","university of virginia physicians","wake forest university health sciences","nemours foundation nemours children s health","university of california san francisco","saint peter s university hospital","yale university","brown medicine","university of texas health science center at houston","university of colorado health","children s physician services of south texas","nationwide children s hospital","northwestern memorial healthcare","phoenix children s hospital","southern illinois university school of medicine","university of south florida","duke university","mount sinai medical center of florida","texas tech university health sciences center el paso","university health physicians","university of vermont medical health network medical","baylor college of medicine","children s hospital los angeles medical","cleveland clinic florida","east carolina university","nicklaus children s pediatric specialist","northwestern medical faculty foundation","old dominion university","presbyterian medical center of university of pennsylvania health system","rush medical","university at buffalo pediatric","university of connecticut health center","upmc altoona","children s mercy hospital","university pediatricians","brown neurology","university radiology llp","clinical care of university of pennsylvania health system","mount sinai hospital","prisma health university medical","leland stanford jr university","university of california san diego","university of maryland baltimore","upmc community medicine","connecticut children s specialty","east tennessee children s hospital","lurie children s medical","university of north carolina at chapel hill","albany medical college","children s anesthesia","iowa state university of science and technology","oregon health and science university","queen s university medical","university of maryland community medical","children s specialized hospital","dayton children s hospital","dayton children s specialty physicians","el paso children s physician","northwestern university","seattle children s hospital","stony brook children s services ufpc","children s medical","university of chicago","university of virginia health services foundation","university of wisconsin medical foundation","university of wisconsin system","upmc altoona regional health services","indiana university purdue university indianapolis","rush university medical center","university of texas health center at tyler","boston children s heart foundation","brown dermatology","children s community care","children s health care","children s hospital neurology foundation","east tennessee state university etsu","emory children s pediatric institute","indiana university health arnett","indiana university health ball memorial physicians","oregon health and science unviersity","partners physician a subsidiary of cleveland clinic","sheridan children s services of alabama","temple university a commonwealth university","university of vermont health network university of vermont medical center","thomas jefferson university","university health system","university of kansas school of medicine wichita medical practice","university of mississippi medical center","university of vermont health network champlain valley physicians hospital","university of vermont health network alice hyde medical center","university of vermont medical","university physicians and surgeons","university primary care practices","upmc western maryland health services","valley children s primary care","valley children s specialty medical","west virginia university hospitals"]);
