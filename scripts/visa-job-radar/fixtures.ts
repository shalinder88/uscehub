// Visa Job Radar — fixtures + seed gold set.
//
// These 12 candidates are hand-labeled (never AI-labeled) and exercise every
// branch of the classifier. They are the frozen seed of the gold set the spec
// calls for. EXPECTED holds the human verdict for each so the runner can prove
// the deterministic engine still agrees. isFixture is true on every one, so no
// fixture can ever reach the published app surface.

import type {
  JobStatus,
  RawCandidate,
  RejectReason,
} from "./types";
import type { GreenhouseResponse, UsajobsResponse } from "./connectors";

const FETCHED_AT = "2026-05-29T12:00:00.000Z";

export interface GoldLabel {
  status: JobStatus;
  rejectReason?: RejectReason;
  note: string;
}

export const FIXTURES: RawCandidate[] = [
  {
    sourceId: "fx-01",
    sourceTier: 1,
    sourceUrl: "https://regionalhealth.example.org/careers/im-physician",
    fetchedAt: FETCHED_AT,
    title: "Internal Medicine Physician",
    employer: "Regional Health System",
    city: "Tyler",
    state: "TX",
    postedDate: "2026-05-18",
    rawText:
      "Internal Medicine Physician sought for our regional hospital. We welcome international medical graduates and offer J-1 visa waiver support as well as H-1B sponsorship for qualified physicians.",
    isFixture: true,
  },
  {
    sourceId: "fx-02",
    sourceTier: 1,
    sourceUrl: "https://cedarvalleyclinic.example.org/jobs/fm",
    fetchedAt: FETCHED_AT,
    title: "Family Medicine Physician",
    employer: "Cedar Valley Clinic",
    city: "Ottumwa",
    state: "IA",
    postedDate: "2026-05-12",
    rawText:
      "Family Medicine Physician opportunity at a rural clinic. This position is Conrad 30 waiver eligible for J-1 physicians completing residency.",
    isFixture: true,
  },
  {
    sourceId: "fx-03",
    sourceTier: 1,
    sourceUrl: "https://summitim.example.org/careers/123",
    fetchedAt: FETCHED_AT,
    title: "Internal Medicine Physician",
    employer: "Summit Internal Medicine",
    city: "Denver",
    state: "CO",
    postedDate: "2026-05-20",
    rawText:
      "Internal Medicine Physician. All applicants must be legally authorized to work in the United States without sponsorship now or in the future.",
    isFixture: true,
  },
  {
    sourceId: "fx-04",
    sourceTier: 1,
    sourceUrl: "https://brightkids.example.org/careers/peds",
    fetchedAt: FETCHED_AT,
    title: "Pediatrician",
    employer: "Bright Kids Pediatrics",
    city: "Columbus",
    state: "OH",
    postedDate: "2026-05-21",
    rawText:
      "Pediatrician position. This role is open to U.S. citizens only. We are unable to sponsor visa applications.",
    isFixture: true,
  },
  {
    sourceId: "fx-05",
    sourceTier: 1,
    sourceUrl: "https://communitycare.example.org/jobs/np",
    fetchedAt: FETCHED_AT,
    title: "Nurse Practitioner - Primary Care",
    employer: "Community Care Partners",
    city: "Fresno",
    state: "CA",
    postedDate: "2026-05-15",
    rawText:
      "Nurse Practitioner - Primary Care. J-1 visa waiver candidates are welcome to apply.",
    isFixture: true,
  },
  {
    sourceId: "fx-06",
    sourceTier: 1,
    sourceUrl: "https://example.org/listing/anon-123",
    fetchedAt: FETCHED_AT,
    title: "Family Medicine Physician",
    employer: "Confidential",
    city: "Unknown",
    state: "KY",
    postedDate: "2026-05-19",
    rawText:
      "Family Medicine Physician. Visa sponsorship available for qualified candidates. Employer name withheld.",
    isFixture: true,
  },
  {
    sourceId: "fx-07",
    sourceTier: 1,
    sourceUrl: "https://communityhospital.example.org/careers/hosp",
    fetchedAt: FETCHED_AT,
    title: "Hospitalist",
    employer: "Community Hospital",
    city: "Boise",
    state: "ID",
    postedDate: "2026-05-22",
    rawText:
      "Hospitalist needed for a busy community hospital. Competitive salary and excellent benefits offered.",
    isFixture: true,
  },
  {
    sourceId: "fx-08",
    sourceTier: 1,
    sourceUrl: "https://lakesidemed.example.org/careers/im2",
    fetchedAt: FETCHED_AT,
    title: "Internal Medicine Physician",
    employer: "Lakeside Medical Group",
    city: "Duluth",
    state: "MN",
    postedDate: "2026-05-17",
    rawText:
      "Internal Medicine Physician. H-1B visa sponsorship is available for the right candidate. Please note this position does not sponsor relocation or housing costs.",
    isFixture: true,
  },
  {
    sourceId: "fx-09",
    sourceTier: 1,
    sourceUrl: "https://universitymed.example.org/careers/acad-hosp",
    fetchedAt: FETCHED_AT,
    title: "Academic Hospitalist",
    employer: "University Medical Center",
    city: "Ann Arbor",
    state: "MI",
    postedDate: "2026-05-10",
    rawText:
      "Academic Hospitalist at University Medical Center. As a cap-exempt employer, we are pleased to offer H-1B sponsorship to international physicians.",
    isFixture: true,
  },
  {
    sourceId: "fx-10",
    sourceTier: 1,
    sourceUrl: "https://northernmed.example.org/careers/im-old",
    fetchedAt: FETCHED_AT,
    title: "Internal Medicine Physician",
    employer: "Northern Medical Center",
    city: "Billings",
    state: "MT",
    postedDate: "2025-11-01",
    rawText:
      "Internal Medicine Physician. We offer J-1 visa waiver support and H-1B sponsorship for international medical graduates.",
    isFixture: true,
  },
  {
    sourceId: "fx-11",
    sourceTier: 1,
    sourceUrl: "https://prairiehealth.example.org/careers/fm-contradiction",
    fetchedAt: FETCHED_AT,
    title: "Family Medicine Physician",
    employer: "Prairie Health",
    city: "Fargo",
    state: "ND",
    postedDate: "2026-05-16",
    rawText:
      "Family Medicine Physician. Visa sponsorship available for qualified applicants. This position is open to U.S. citizens only.",
    isFixture: true,
  },
  {
    sourceId: "fx-12",
    sourceTier: 2,
    sourceUrl: "https://state-pco.example.gov/listings/cedar-county",
    fetchedAt: FETCHED_AT,
    title: "Family Medicine Physician",
    employer: "Cedar County Rural Health Clinic",
    city: "Tipton",
    state: "IA",
    postedDate: "2026-05-14",
    rawText:
      "Family Medicine Physician. Our clinic welcomes J-1 physicians through the Conrad 30 waiver program.",
    isFixture: true,
  },
];

export const EXPECTED: Record<string, GoldLabel> = {
  "fx-01": { status: "PUBLISH", note: "Tier-1, physician, J-1 + H-1B affirmative" },
  "fx-02": { status: "PUBLISH", note: "Tier-1, physician, Conrad 30 affirmative" },
  "fx-03": {
    status: "REJECT",
    rejectReason: "SPONSORSHIP_DENIED",
    note: "'without sponsorship' explicit denial",
  },
  "fx-04": {
    status: "REJECT",
    rejectReason: "SPONSORSHIP_DENIED",
    note: "'U.S. citizens only' + 'unable to sponsor visa'",
  },
  "fx-05": {
    status: "REJECT",
    rejectReason: "NOT_PHYSICIAN",
    note: "Nurse Practitioner — physician gate rejects before visa signal",
  },
  "fx-06": {
    status: "REJECT",
    rejectReason: "RECRUITER_ONLY",
    note: "Confidential employer despite real visa signal",
  },
  "fx-07": {
    status: "REJECT",
    rejectReason: "NO_VISA_MENTION",
    note: "Physician, no visa language",
  },
  "fx-08": {
    status: "PUBLISH",
    note: "Denial specificity — 'does not sponsor relocation' must NOT block H-1B",
  },
  "fx-09": { status: "PUBLISH", note: "Cap-exempt academic H-1B affirmative" },
  "fx-10": {
    status: "REJECT",
    rejectReason: "STALE",
    note: "Affirmative but posted >120 days before fetch",
  },
  "fx-11": {
    status: "HOLD_REVIEW",
    note: "Affirmative + denied contradiction → human review",
  },
  "fx-12": {
    status: "VISA_SIGNAL_ONLY",
    note: "Real Conrad 30 signal from a Tier-2 source → signal, not published",
  },
};

// Sample upstream payloads used to smoke-test the pure parsers offline. These
// are NOT fed into the publish pipeline (the parsers mark isFixture:false), so
// the runner only uses them to assert field mapping.
export const SAMPLE_USAJOBS: UsajobsResponse = {
  SearchResult: {
    SearchResultItems: [
      {
        MatchedObjectDescriptor: {
          PositionTitle: "Physician (Internal Medicine)",
          OrganizationName: "Veterans Health Administration",
          PositionLocationDisplay: "Phoenix, AZ",
          ApplyURI: ["https://www.usajobs.gov/job/000000000"],
          PublicationStartDate: "2026-05-01",
          UserArea: {
            Details: {
              JobSummary:
                "Seeking a board-certified internal medicine physician. Visa sponsorship is available for qualified candidates.",
            },
          },
        },
      },
    ],
  },
};

export const SAMPLE_GREENHOUSE: GreenhouseResponse = {
  jobs: [
    {
      title: "Hospitalist Physician",
      location: { name: "Salem, OR" },
      content:
        "&lt;p&gt;Join our team. We offer &lt;strong&gt;H-1B sponsorship&lt;/strong&gt; for international physicians.&lt;/p&gt;",
      absolute_url: "https://boards.greenhouse.io/example/jobs/123",
      updated_at: "2026-05-20T00:00:00Z",
    },
  ],
};
