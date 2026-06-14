// Auto-generated — run: npx tsx scripts/visa-job-radar/build-sponsor-truth-overlay.ts
// 5870 employers total · 2 with live physician LCA notices · 148 cap-exempt

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
    latestNoticeAt: "2026-06-14T00:55:30.760Z",
    notices: [
      { role: "Pulmonary and Critical Care Nocturnist Physician/Faculty", salaryText: "$435,000", noticeUrl: "https://www.kumc.edu/documents/international/lca/NOTICE%20OF%20LCA%20FILING%20KBGOVI07995-2%20%282%29.pdf", periodText: "from 13 Jul 2026 to 12 Jul 2029", firstSeenAt: "2026-06-11T02:02:17.834Z" },
    ],
  }],
  ["university of pittsburgh", {
    employer: "University of Pittsburgh",
    state: "PA",
    latestNoticeAt: "2026-06-14T00:55:30.760Z",
    notices: [
      { role: "Assistant Professor - Adult Cardiology", salaryText: "$156.25 per hour", noticeUrl: "https://www.ois.pitt.edu/sites/default/files/docs/Assistant%20Professor%20-%20Adult%20Cardiology%20%28UPP%29.pdf", periodText: "from 9/1/2026 to 8/31/2029", firstSeenAt: "2026-06-11T02:41:35.993Z" },
    ],
  }],
]);

// normKeys of cap-exempt employers (H-1B cap does not apply; no annual lottery).
export const CAP_EXEMPT_KEYS = new Set<string>(["university of kansas medical center","university of pittsburgh","university of kentucky","university of rochester","medical college of wisconsin","medical university of south carolina and affiliates","montefiore medical center","memorial sloan kettering cancer center","university of pittsburgh physicians","emory university","cleveland clinic","cleveland clinic foundation","mayo clinic","university of arkansas for medical sciences","university of alabama health services foundation","icahn school of medicine at mount sinai","banner university medical","university of colorado denver","university of florida","johns hopkins university","university of kansas physicians","university of miami","indiana university health care","trustees of university of pennsylvania","university of vermont health network medical","university of washington","university hospitals medical","university physicians surgeons","university pediatricians","children s national medical center","nyu grossman school of medicine","university of iowa","university of minnesota physicians","ut southwestern medical center","columbia university","cincinnati children s hospital medical center","rutgers state university of new jersey","university of michigan","university of utah","university of texas health science center at houston","university of louisville physicians","university of texas medical branch","mount sinai community foundation","wake forest university baptist medical center","university of texas m d anderson cancer center","wake forest university health sciences","yale university","brown medicine","university of california san francisco","weill cornell medical college","nationwide children s hospital","curators of university of missouri","children s physician services of south texas","children s mercy hospital","vanderbilt university medical center","west virginia university medical","university of virginia health services foundation","baylor college of medicine","university of connecticut health center","mount sinai medical center of florida","ohio state university","indiana university health ball memorial physicians","southern illinois university school of medicine","phoenix children s hospital","university of south florida","university of louisville","cleveland clinic florida","rush university medical center","valley children s specialty medical","saint peter s university hospital","texas tech university health sciences center el paso","leland stanford jr university","university of north carolina at chapel hill","st jude children s research hospital","university health physicians","university of maryland community medical","nemours foundation nemours children s health","indiana university purdue university indianapolis","northwestern medical faculty foundation","upmc altoona","children s health care","connecticut children s specialty","university of chicago","university primary care practices","indiana university health arnett","university of wisconsin medical foundation","university of california san diego","albany medical college","brown neurology","valley children s primary care","university health system","nicklaus children s pediatric specialists","emory children s pediatric institute","dayton children s specialty physicians","upmc community medicine","northwestern memorial healthcare","prisma health university medical","university at buffalo pediatric","university of maryland baltimore","university radiology llp","east tennessee children s hospital","university of kansas school of medicine wichita medical practice","upmc altoona regional health services","rush medical","university of new mexico","duke university","mount sinai hospital","northwestern university","boston children s heart foundation","children s hospital los angeles medical","east carolina university","queen s university medical","university of wisconsin system","university of vermont health network alice hyde medical center","west virginia university hospitals","clinical care of university of pennsylvania health system","oregon health and science university","children s community care","university of vermont medical","university of colorado health","thomas jefferson university","upmc western maryland health services","university of virginia physicians","temple university a commonwealth university","university of mississippi medical center","old dominion university","brown dermatology","university of texas health center at tyler","university of vermont medical health network medical","children s anesthesia","children s hospital neurology foundation","dayton children s hospital","el paso children s physician","sheridan children s services of alabama","lurie children s medical","university of vermont health network champlain valley physicians hospital","seattle children s hospital","children s specialized hospital","stony brook children s services ufpc","children s medical","university of vermont health network university of vermont medical center","nicklaus children s pediatric specialist","iowa state university of science and technology","presbyterian medical center of university of pennsylvania health system","east tennessee state university etsu","oregon health and science unviersity","partners physician a subsidiary of cleveland clinic","university physicians and surgeons"]);
