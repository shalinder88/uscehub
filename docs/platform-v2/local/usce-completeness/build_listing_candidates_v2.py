"""
P99-0A Phase B+C: Audience-specific listing candidates + completeness scorer

Adds:
  source_page_type   — OPPORTUNITY_PAGE / POLICY_HUB / SPECIALTY_PAGE /
                       APPLICATION_PORTAL / OFFICIAL_DEPARTMENT_PAGE /
                       FUTURE_LANE_PAGE
  listing_role       — PUBLIC_OPPORTUNITY / SUPPORTING_SOURCE /
                       INTERNAL_EVIDENCE_ONLY / FUTURE_LANE_ONLY

Audience-specific readiness fields:
  public_ready_us_md_do
  public_ready_international_student
  public_ready_img_graduate
  public_ready_caribbean_student
  public_ready_observer

Per-audience eligibility status:
  ELIGIBLE_EXPLICIT / EXCLUDED_EXPLICIT / UNKNOWN_NOT_STATED /
  ONLY_IF_AFFILIATED / ONLY_IF_VSLO / ONLY_IF_LCME_COCA /
  ONLY_IF_CURRENTLY_ENROLLED / INTERNAL_REVIEW_REQUIRED

Display bucket (replaces old completeness_status):
  READY_PUBLIC_IMG_RELEVANT
  READY_PUBLIC_US_STUDENT_ONLY
  PUBLIC_BUT_IMG_EXCLUDED
  PUBLIC_WITH_IMG_UNKNOWN
  PUBLIC_WITH_UNKNOWN_FIELDS
  NEEDS_REVIEW
  SUPPORTING_SOURCE_ONLY
  DO_NOT_SHOW
  FUTURE_LANE_ONLY

Outputs:
  usce_listing_candidates_v2.csv
  usce_listing_completeness_v2.csv

Run: python3 build_listing_candidates_v2.py
"""

import csv
from pathlib import Path

BASE = Path(__file__).parent
LOCAL = BASE.parent
CANONICAL = LOCAL / "nppes" / "canonical_institutions_for_matching.csv"
IDENTITY = LOCAL / "identity" / "institution_identity_review_queue_maine.csv"
OPPORTUNITIES = LOCAL / "p97_candidate_opportunities.csv"
CAND_OUT = BASE / "usce_listing_candidates_v2.csv"
SCORE_OUT = BASE / "usce_listing_completeness_v2.csv"

# ── Source page type rules ─────────────────────────────────────────────
# ID → overrides where the automatic logic is insufficient
MANUAL_SOURCE_PAGE_TYPE = {
    "ME-001": "POLICY_HUB",       # MMC visiting-MS hub; specialty pages below it
    "ME-002": "OFFICIAL_DEPARTMENT_PAGE",  # Togus VA; affiliation-routed
    "ME-003": "POLICY_HUB",       # CMHC umbrella; specialty pages ME-015–021
    "ME-013": "OPPORTUNITY_PAGE", # EMMC direct observership program page
    "ME-014": "OFFICIAL_DEPARTMENT_PAGE",  # EMMC FM via residency program page
}

MANUAL_LISTING_ROLE = {
    "ME-001": "SUPPORTING_SOURCE",
    "ME-002": "SUPPORTING_SOURCE",
    "ME-003": "SUPPORTING_SOURCE",
}

# IDs that P97 marked NEEDS_MANUAL_REVIEW
P97_NEEDS_REVIEW = {"ME-009", "ME-010", "ME-011", "ME-013", "ME-014"}
# ME-013: EMMC observership has unusual broad eligibility ("high school" students,
# "licensed practitioners") that needs reviewer confirmation before any audience claim.
# Kept in NEEDS_REVIEW even though P97 marked APPROVED_FOR_HUMAN_REVIEW.

CANDIDATE_FIELDS_V2 = [
    "listing_id",
    "institution_id",
    "institution_name",
    "campus_name",
    "parent_system",
    "state",
    "county",
    "city",
    "specialty",
    "opportunity_type",
    "source_page_type",
    "listing_role",
    # Eligibility raw
    "audience_eligibility",
    "student_eligibility",
    "graduate_eligibility",
    "img_eligibility_raw",
    # Audience-specific flags
    "public_ready_us_md_do",
    "public_ready_international_student",
    "public_ready_img_graduate",
    "public_ready_caribbean_student",
    "public_ready_observer",
    # Per-audience status
    "us_md_do_status",
    "international_student_status",
    "img_graduate_status",
    "caribbean_student_status",
    "vslo_required",
    "affiliation_required",
    "hands_on_level",
    "observership_only",
    "lor_possible",
    "evaluation_possible",
    "application_method",
    "application_url",
    "official_source_url",
    "source_status",
    "source_quote_eligibility",
    "source_quote_type",
    "source_quote_fee",
    "source_quote_deadline",
    "fee_status",
    "fee_amount",
    "duration",
    "deadline_status",
    "contact_status",
    "contact_email_or_url",
    "last_reviewed_at",
    "identity_status_from_p98_6",
    "source_packet_path",
    "extraction_notes",
]

SCORE_FIELDS_V2 = [
    "listing_id",
    "institution_name",
    "state",
    "county",
    "specialty",
    "opportunity_type",
    "source_page_type",
    "listing_role",
    "display_bucket",
    "completeness_score",
    "max_possible_score",
    "public_ready_us_md_do",
    "public_ready_international_student",
    "public_ready_img_graduate",
    "public_ready_caribbean_student",
    "us_md_do_status",
    "international_student_status",
    "img_graduate_status",
    "caribbean_student_status",
    "eligible_audiences",
    "excluded_audiences",
    "unknown_audiences",
    "restriction_tags",
    "fit_warnings",
    "hard_gates_hit",
    "unknown_fields",
    "img_eligibility_raw",
    "application_url",
    "official_source_url",
    "source_status",
    "identity_status_from_p98_6",
    "listing_id_ref",
]


def load_csv(path):
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def normalize_name(s):
    return s.lower().strip()


def find_canonical(inst_name, canonical_rows):
    n = normalize_name(inst_name)
    for c in canonical_rows:
        cn = normalize_name(c["institution_name"])
        if cn == n or n in cn or cn in n:
            return c
    for c in canonical_rows:
        cn = normalize_name(c["institution_name"])
        words = [w for w in n.split() if len(w) > 4]
        if any(w in cn for w in words):
            return c
    return {}


# ── Source page type derivation ────────────────────────────────────────

def derive_source_page_type(opp):
    lid = opp["candidateId"]
    if lid in MANUAL_SOURCE_PAGE_TYPE:
        return MANUAL_SOURCE_PAGE_TYPE[lid]
    spt = opp.get("sourcePageType", "")
    ot = opp.get("opportunityType", "").lower()
    if "residency" in ot or "fellowship" in ot:
        return "FUTURE_LANE_PAGE"
    if spt == "EXACT_OFFICIAL_PROGRAM_PAGE":
        return "SPECIALTY_PAGE"
    if spt == "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT":
        return "SPECIALTY_PAGE"
    if "generic" in spt.lower():
        return "GENERIC_HOMEPAGE"
    return "SPECIALTY_PAGE"


def derive_listing_role(opp, source_page_type):
    lid = opp["candidateId"]
    if lid in MANUAL_LISTING_ROLE:
        return MANUAL_LISTING_ROLE[lid]
    if source_page_type in ("POLICY_HUB", "GENERIC_HOMEPAGE"):
        return "SUPPORTING_SOURCE"
    if source_page_type == "FUTURE_LANE_PAGE":
        return "FUTURE_LANE_ONLY"
    return "PUBLIC_OPPORTUNITY"


# ── IMG / audience eligibility ─────────────────────────────────────────

def classify_img_eligibility(opp):
    """Returns YES / NO / UNKNOWN based on raw text."""
    raw = opp.get("imgEligibility", "").lower()
    if not raw or raw in ("unknown", "unclear", "not stated"):
        return "UNKNOWN"
    if any(t in raw for t in (
        "international accepted", "international medical student",
        "img accepted", "international eligible", "explicitly accepted",
        "international medical school", "international ms accepted",
        "us/canadian/international", "international ms",
    )):
        return "YES"
    if any(t in raw for t in (
        "lcme-only", "lcme only", "lcme/aoa", "lcme/aamc",
        "exclud", "us-only", "us only", "us/canadian only",
        "aamc/aacom us only", "not explicit", "lcme via vslo",
        "lcme/aamc us-only", "lcme/aoacoa",
    )):
        return "NO"
    # "not on parent page" or "check sub-page" → unconfirmed
    if any(t in raw for t in ("check sub-page", "not on parent", "not explicit")):
        return "UNKNOWN"
    return "UNKNOWN"


def derive_us_md_do_status(opp, img_elig, listing_role, source_page_type):
    """US MD/DO status is almost always ELIGIBLE_EXPLICIT for medical school electives."""
    if listing_role == "SUPPORTING_SOURCE":
        return "INTERNAL_REVIEW_REQUIRED"
    elig = opp.get("eligibility", "").lower()
    # If any student-type language present
    if any(t in elig for t in ("medical student", " ms", "lcme", "aamc", "aacom",
                                "4th-yr", "4th yr", "3rd", "visiting student",
                                "md/do", "m.d.", "d.o.", "accredited college")):
        return "ELIGIBLE_EXPLICIT"
    if "affiliation" in elig and "no direct" in elig:
        return "ONLY_IF_AFFILIATED"
    return "UNKNOWN_NOT_STATED"


def derive_international_student_status(opp, img_elig, source_page_type):
    """International medical student (currently enrolled) status."""
    raw = opp.get("imgEligibility", "").lower()
    elig = opp.get("eligibility", "").lower()

    if any(t in raw for t in (
        "international medical student", "international ms",
        "us/canadian/international", "international ms accepted",
    )):
        return "ELIGIBLE_EXPLICIT"

    if any(t in raw for t in (
        "lcme-only", "lcme/aoa", "lcme/aamc", "lcme via vslo",
        "lcme/aoacoa", "us-only", "us only",
    )):
        return "EXCLUDED_EXPLICIT"

    if "affiliation" in elig and "not direct" in elig:
        return "ONLY_IF_AFFILIATED"

    # ME-009 "visiting students nationwide" — ambiguous
    if "nationwide" in elig:
        return "UNKNOWN_NOT_STATED"

    return "UNKNOWN_NOT_STATED"


def derive_img_graduate_status(opp, intl_student_status):
    """
    IMG graduate = already holds MD/DO degree from non-US/non-Canadian school.
    Distinct from current international medical student.
    'International MS accepted' covers students; it does NOT confirm IMG graduates.
    """
    raw = (opp.get("imgEligibility", "") + opp.get("eligibility", "") +
           opp.get("studentGraduateEligibility", "")).lower()

    # Explicit IMG graduate acceptance is rare and would say "IMG", "international graduate",
    # or "physicians", "licensed practitioners", etc.
    if any(t in raw for t in ("img graduate", "international graduate", "licensed practitioner",
                               "licensed physician", "post-graduate", "residency applicant")):
        return "ELIGIBLE_EXPLICIT"  # e.g. EMMC licensed practitioners

    # LCME-only explicitly excludes
    if any(t in raw for t in ("lcme-only", "lcme only", "lcme/aoa", "lcme via vslo",
                               "us-only", "us only", "lcme/aamc", "lcme/aoacoa")):
        return "EXCLUDED_EXPLICIT"

    # Student-only language → IMG graduate not covered
    if intl_student_status == "ELIGIBLE_EXPLICIT":
        # International student is eligible, but grad status still unknown unless stated
        return "UNKNOWN_NOT_STATED"  # "International MS" ≠ "IMG graduate"

    return "UNKNOWN_NOT_STATED"


def derive_caribbean_status(opp, intl_student_status):
    """
    Caribbean medical student = enrolled in Caribbean medical school.
    Typically Caribbean schools are not LCME-accredited.
    """
    raw = (opp.get("imgEligibility", "") + opp.get("eligibility", "")).lower()

    if "caribbean" in raw:
        return "ELIGIBLE_EXPLICIT" if "accepted" in raw else "EXCLUDED_EXPLICIT"

    # LCME-only → Caribbean students excluded (LCME ≠ Caribbean accreditation)
    if any(t in raw for t in ("lcme-only", "lcme only", "lcme/aoa", "lcme via vslo",
                               "lcme/aamc", "lcme/aoacoa")):
        return "EXCLUDED_EXPLICIT"

    # If international student is eligible, Caribbean is likely eligible too
    # but we cannot confirm without explicit mention
    if intl_student_status == "ELIGIBLE_EXPLICIT":
        return "UNKNOWN_NOT_STATED"  # "international" doesn't explicitly include Caribbean

    return "UNKNOWN_NOT_STATED"


def to_bool_flag(status):
    if status == "ELIGIBLE_EXPLICIT":
        return "YES"
    if status in ("EXCLUDED_EXPLICIT", "ONLY_IF_LCME_COCA"):
        return "NO"
    return "UNKNOWN"


# ── Display bucket ─────────────────────────────────────────────────────

def derive_display_bucket(row, listing_role, source_page_type):
    lid = row.get("listing_id", "")

    if listing_role == "SUPPORTING_SOURCE":
        return "SUPPORTING_SOURCE_ONLY"
    if listing_role == "FUTURE_LANE_ONLY":
        return "FUTURE_LANE_ONLY"
    if source_page_type == "GENERIC_HOMEPAGE":
        return "DO_NOT_SHOW"

    # P97 manual review carries through
    if lid in P97_NEEDS_REVIEW:
        return "NEEDS_REVIEW"

    us_status = row.get("us_md_do_status", "")
    intl_status = row.get("international_student_status", "")
    img_status = row.get("img_graduate_status", "")
    carib_status = row.get("caribbean_student_status", "")

    # International / IMG path
    if intl_status == "ELIGIBLE_EXPLICIT":
        return "READY_PUBLIC_IMG_RELEVANT"

    # US-only (explicit exclusion of international)
    if intl_status == "EXCLUDED_EXPLICIT" and us_status == "ELIGIBLE_EXPLICIT":
        if img_status == "EXCLUDED_EXPLICIT":
            return "READY_PUBLIC_US_STUDENT_ONLY"
        # US student-only but img_graduate unknown → still US-student bucket
        return "READY_PUBLIC_US_STUDENT_ONLY"

    # US-eligible but img_status is NO (explicit exclusion)
    if us_status == "ELIGIBLE_EXPLICIT" and img_status == "EXCLUDED_EXPLICIT":
        return "PUBLIC_BUT_IMG_EXCLUDED"

    # US-eligible but international/IMG unknown
    if us_status == "ELIGIBLE_EXPLICIT" and intl_status == "UNKNOWN_NOT_STATED":
        if img_status == "ELIGIBLE_EXPLICIT":
            return "READY_PUBLIC_IMG_RELEVANT"
        return "PUBLIC_WITH_IMG_UNKNOWN"

    # No clear eligibility
    if us_status in ("UNKNOWN_NOT_STATED", "INTERNAL_REVIEW_REQUIRED"):
        return "NEEDS_REVIEW"

    return "PUBLIC_WITH_UNKNOWN_FIELDS"


# ── Helper derives from original build_listing_candidates ─────────────

def derive_source_status(opp):
    spt = opp.get("sourcePageType", "")
    if spt in ("EXACT_OFFICIAL_PROGRAM_PAGE",):
        return "OFFICIAL_PROGRAM_PAGE"
    if spt in ("OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",):
        return "OFFICIAL_DEPARTMENT_PAGE"
    if "generic" in spt.lower():
        return "GENERIC_HOMEPAGE_ONLY"
    return "OFFICIAL_SOURCE_UNKNOWN_TYPE"


def derive_vslo(opp):
    text = (opp.get("applicationUrl","") + opp.get("evidenceSnippet","") +
            opp.get("eligibility","") + opp.get("reviewerNotes","")).lower()
    return "YES" if "vslo" in text else "UNKNOWN"


def derive_observership(opp):
    ot = opp.get("opportunityType","").lower()
    title = opp.get("opportunityTitle","").lower()
    return "YES" if "observership" in ot or "observership" in title else (
        "NO" if any(t in title for t in ("sub-i","elective","clerkship")) else "UNKNOWN"
    )


def derive_hands_on(opp):
    obs = derive_observership(opp)
    ot = opp.get("opportunityType","").lower()
    if obs == "YES":
        return "OBSERVATION"
    if any(t in ot for t in ("elective","clerkship","sub-i","sub-internship")):
        return "CLINICAL"
    return "UNKNOWN"


def derive_application_method(opp):
    app = opp.get("applicationUrl","")
    ev = opp.get("evidenceSnippet","").lower()
    if "vslo" in app.lower() or "vslo" in ev:
        return "VSLO"
    if app and "smartsheet" in app.lower():
        return "SMARTSHEET"
    if app and app.startswith("http"):
        return "ONLINE_PORTAL"
    if opp.get("contactEmail","") and "@" in opp.get("contactEmail",""):
        return "EMAIL"
    return "UNKNOWN"


def derive_fee_status(opp):
    raw = opp.get("cost","").lower()
    if not raw or raw in ("", "unknown", "not stated", "not explicit"):
        return "UNKNOWN"
    if "no fee" in raw or "free" in raw or "$0" in raw:
        return "NO_FEE"
    if "$" in opp.get("cost","") or "fee" in raw:
        return "FEE_CHARGED"
    return "UNKNOWN"


def derive_deadline_status(opp):
    dl = opp.get("deadline","").lower()
    if not dl or dl in ("", "unknown", "variable"):
        return "UNKNOWN"
    if "rolling" in dl:
        return "ROLLING"
    if "per" in dl or "cohort" in dl:
        return "COHORT_BASED"
    return "STATED"


# ── Scoring ────────────────────────────────────────────────────────────

def score_row(cand):
    def s(val, targets_5, targets_3=None):
        if val in (targets_5 if isinstance(targets_5, (list, set)) else [targets_5]):
            return 5
        if targets_3 and val in (targets_3 if isinstance(targets_3, (list, set)) else [targets_3]):
            return 3
        return 0

    dims = {
        "official_source": (
            5 if cand["source_status"] == "OFFICIAL_PROGRAM_PAGE" and cand["official_source_url"] else
            4 if cand["source_status"] == "OFFICIAL_DEPARTMENT_PAGE" and cand["official_source_url"] else
            3 if cand["source_status"] == "OFFICIAL_SOURCE_UNKNOWN_TYPE" and cand["official_source_url"] else
            1 if cand["official_source_url"] else 0
        ),
        "us_eligibility": 5 if cand["us_md_do_status"] == "ELIGIBLE_EXPLICIT" else 3 if cand["us_md_do_status"] != "UNKNOWN_NOT_STATED" else 0,
        "img_clarity": 5 if cand["img_graduate_status"] != "UNKNOWN_NOT_STATED" else 0,
        "intl_clarity": 5 if cand["international_student_status"] != "UNKNOWN_NOT_STATED" else 0,
        "carib_clarity": 3 if cand["caribbean_student_status"] != "UNKNOWN_NOT_STATED" else 0,
        "usce_type": 5 if cand["opportunity_type"].lower() in ("elective","clerkship","sub-internship","observership") else 3,
        "hands_on": 5 if cand["hands_on_level"] in ("CLINICAL","OBSERVATION") else 0,
        "vslo_clarity": 5 if cand["vslo_required"] != "UNKNOWN" else 0,
        "application_method": (
            5 if cand["application_method"] in ("VSLO","SMARTSHEET","ONLINE_PORTAL") and cand["application_url"] else
            4 if cand["application_method"] == "EMAIL" and cand["contact_email_or_url"] else
            2 if cand["application_method"] != "UNKNOWN" else 0
        ),
        "fee": 5 if cand["fee_status"] == "NO_FEE" else 4 if cand["fee_status"] == "FEE_CHARGED" else 0,
        "deadline": 5 if cand["deadline_status"] == "STATED" else 4 if cand["deadline_status"] in ("ROLLING","COHORT_BASED") else 0,
        "duration": 5 if any(t in cand["duration"].lower() for t in ("week","month","wk")) else 2 if cand["duration"] else 0,
        "contact": 5 if cand["contact_status"] == "CONTACT_FOUND" else 0,
        "source_quotes": min(5, sum(1 for q in [cand["source_quote_eligibility"],cand["source_quote_fee"],cand["source_quote_deadline"]] if q and q.lower() not in ("unknown","not stated"))*2),
        "freshness": 5 if "2026" in cand.get("last_reviewed_at","") else 3,
    }
    return sum(dims.values()), 5 * len(dims)


def collect_unknowns(cand):
    unknowns = []
    if cand["img_graduate_status"] == "UNKNOWN_NOT_STATED":
        unknowns.append("img_graduate_eligibility")
    if cand["international_student_status"] == "UNKNOWN_NOT_STATED":
        unknowns.append("international_student_eligibility")
    if cand["caribbean_student_status"] == "UNKNOWN_NOT_STATED":
        unknowns.append("caribbean_eligibility")
    if cand["application_method"] == "UNKNOWN":
        unknowns.append("application_method")
    if not cand["application_url"] and cand["application_method"] not in ("EMAIL",):
        unknowns.append("application_url")
    if cand["fee_status"] == "UNKNOWN":
        unknowns.append("fee")
    if cand["deadline_status"] == "UNKNOWN":
        unknowns.append("deadline")
    if not cand["duration"].strip():
        unknowns.append("duration")
    return unknowns


def collect_restrictions(cand):
    tags = []
    if cand["vslo_required"] == "YES":
        tags.append("VSLO_REQUIRED")
    if cand["affiliation_required"] == "YES":
        tags.append("AFFILIATION_REQUIRED")
    if cand["observership_only"] == "YES":
        tags.append("OBSERVERSHIP_ONLY")
    if cand["us_md_do_status"] in ("ONLY_IF_LCME_COCA",):
        tags.append("LCME_COCA_ONLY")
    if cand["international_student_status"] == "EXCLUDED_EXPLICIT":
        tags.append("IMG_EXCLUDED")
    if cand["international_student_status"] == "ONLY_IF_AFFILIATED":
        tags.append("AFFILIATION_REQUIRED")
    return list(dict.fromkeys(tags))


# ── Main ──────────────────────────────────────────────────────────────

def main():
    opps = load_csv(OPPORTUNITIES)
    canonical = load_csv(CANONICAL)
    identity_rows = load_csv(IDENTITY)
    identity_by_id = {r["canonical_institution_id"]: r for r in identity_rows}

    cand_rows = []
    score_rows = []

    for opp in opps:
        if opp.get("candidateStatus","") == "REJECTED_NON_TARGET":
            continue

        lid = opp["candidateId"]
        canon = find_canonical(opp["institutionName"], canonical)
        cid = canon.get("canonical_institution_id", "")
        irow = identity_by_id.get(cid, {})

        spt = derive_source_page_type(opp)
        role = derive_listing_role(opp, spt)

        img_elig = classify_img_eligibility(opp)
        us_status = derive_us_md_do_status(opp, img_elig, role, spt)
        intl_status = derive_international_student_status(opp, img_elig, spt)
        img_grad_status = derive_img_graduate_status(opp, intl_status)
        carib_status = derive_caribbean_status(opp, intl_status)

        app_method = derive_application_method(opp)

        cand = {
            "listing_id": lid,
            "institution_id": cid,
            "institution_name": opp["institutionName"],
            "campus_name": canon.get("campus_name",""),
            "parent_system": opp.get("healthSystem","") or canon.get("parent_system",""),
            "state": opp["state"],
            "county": opp["county"],
            "city": canon.get("city",""),
            "specialty": opp["specialty"],
            "opportunity_type": opp["opportunityType"],
            "source_page_type": spt,
            "listing_role": role,
            "audience_eligibility": opp.get("eligibility",""),
            "student_eligibility": "YES" if any(t in opp.get("studentGraduateEligibility","").lower() for t in ("student","ms","medical student")) else "UNKNOWN",
            "graduate_eligibility": "YES" if any(t in opp.get("studentGraduateEligibility","").lower() for t in ("resident","fellow","graduate","practitioner")) else "NO",
            "img_eligibility_raw": img_elig,
            "public_ready_us_md_do": to_bool_flag(us_status),
            "public_ready_international_student": to_bool_flag(intl_status),
            "public_ready_img_graduate": to_bool_flag(img_grad_status),
            "public_ready_caribbean_student": to_bool_flag(carib_status),
            "public_ready_observer": "YES" if spt == "OPPORTUNITY_PAGE" and opp.get("opportunityType","").lower() == "observership" else "UNKNOWN",
            "us_md_do_status": us_status,
            "international_student_status": intl_status,
            "img_graduate_status": img_grad_status,
            "caribbean_student_status": carib_status,
            "vslo_required": derive_vslo(opp),
            "affiliation_required": "YES" if "affiliation" in opp.get("eligibility","").lower() and "no direct" in opp.get("eligibility","").lower() else "UNKNOWN",
            "hands_on_level": derive_hands_on(opp),
            "observership_only": derive_observership(opp),
            "lor_possible": "UNKNOWN",
            "evaluation_possible": "UNKNOWN",
            "application_method": app_method,
            "application_url": opp.get("applicationUrl",""),
            "official_source_url": opp.get("officialSourceUrl",""),
            "source_status": derive_source_status(opp),
            "source_quote_eligibility": opp.get("eligibility","")[:200],
            "source_quote_type": opp.get("opportunityType",""),
            "source_quote_fee": opp.get("cost",""),
            "source_quote_deadline": opp.get("deadline",""),
            "fee_status": derive_fee_status(opp),
            "fee_amount": opp.get("cost",""),
            "duration": opp.get("duration",""),
            "deadline_status": derive_deadline_status(opp),
            "contact_status": "CONTACT_FOUND" if opp.get("contactEmail","").strip() or opp.get("coordinatorNameIfPublic","").strip() else "NO_CONTACT_FOUND",
            "contact_email_or_url": opp.get("contactEmail","") or opp.get("coordinatorNameIfPublic",""),
            "last_reviewed_at": "2026-05-03",
            "identity_status_from_p98_6": irow.get("combined_identity_status","UNKNOWN"),
            "source_packet_path": canon.get("packet_path",""),
            "extraction_notes": opp.get("reviewerNotes",""),
        }
        cand_rows.append(cand)

        # Compute display bucket
        display_bucket = derive_display_bucket(cand, role, spt)

        score, max_score = score_row(cand)

        eligible_audiences = [a for a, s in [
            ("US_MD_DO", us_status), ("INTERNATIONAL_STUDENT", intl_status),
            ("IMG_GRADUATE", img_grad_status), ("CARIBBEAN_STUDENT", carib_status),
        ] if s == "ELIGIBLE_EXPLICIT"]

        excluded_audiences = [a for a, s in [
            ("US_MD_DO", us_status), ("INTERNATIONAL_STUDENT", intl_status),
            ("IMG_GRADUATE", img_grad_status), ("CARIBBEAN_STUDENT", carib_status),
        ] if s == "EXCLUDED_EXPLICIT"]

        unknown_audiences = [a for a, s in [
            ("US_MD_DO", us_status), ("INTERNATIONAL_STUDENT", intl_status),
            ("IMG_GRADUATE", img_grad_status), ("CARIBBEAN_STUDENT", carib_status),
        ] if s == "UNKNOWN_NOT_STATED"]

        unknowns = collect_unknowns(cand)
        restrictions = collect_restrictions(cand)
        gates = []
        if role == "SUPPORTING_SOURCE":
            gates.append("HUB_OR_AFFILIATED_ROUTE")
        if lid in P97_NEEDS_REVIEW:
            gates.append("P97_MANUAL_REVIEW")
        if intl_status == "EXCLUDED_EXPLICIT":
            gates.append("IMG_EXCLUDED")
        if cand["vslo_required"] == "YES":
            gates.append("VSLO_REQUIRED")

        score_rows.append({
            "listing_id": lid,
            "institution_name": opp["institutionName"],
            "state": opp["state"],
            "county": opp["county"],
            "specialty": opp["specialty"],
            "opportunity_type": opp["opportunityType"],
            "source_page_type": spt,
            "listing_role": role,
            "display_bucket": display_bucket,
            "completeness_score": score,
            "max_possible_score": max_score,
            "public_ready_us_md_do": cand["public_ready_us_md_do"],
            "public_ready_international_student": cand["public_ready_international_student"],
            "public_ready_img_graduate": cand["public_ready_img_graduate"],
            "public_ready_caribbean_student": cand["public_ready_caribbean_student"],
            "us_md_do_status": us_status,
            "international_student_status": intl_status,
            "img_graduate_status": img_grad_status,
            "caribbean_student_status": carib_status,
            "eligible_audiences": "|".join(eligible_audiences),
            "excluded_audiences": "|".join(excluded_audiences),
            "unknown_audiences": "|".join(unknown_audiences),
            "restriction_tags": "|".join(restrictions),
            "fit_warnings": "|".join(restrictions),
            "hard_gates_hit": "|".join(gates),
            "unknown_fields": "|".join(unknowns),
            "img_eligibility_raw": img_elig,
            "application_url": opp.get("applicationUrl",""),
            "official_source_url": opp.get("officialSourceUrl",""),
            "source_status": derive_source_status(opp),
            "identity_status_from_p98_6": irow.get("combined_identity_status","UNKNOWN"),
            "listing_id_ref": lid,
        })

    # Write candidates
    with open(CAND_OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CANDIDATE_FIELDS_V2, extrasaction="ignore")
        w.writeheader()
        w.writerows(cand_rows)

    # Write scores
    with open(SCORE_OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=SCORE_FIELDS_V2, extrasaction="ignore")
        w.writeheader()
        w.writerows(score_rows)

    print(f"Written {len(cand_rows)} candidate rows → {CAND_OUT}")
    print(f"Written {len(score_rows)} score rows → {SCORE_OUT}")

    from collections import Counter
    by_bucket = Counter(r["display_bucket"] for r in score_rows)
    print("\nDisplay bucket:")
    for b, c in sorted(by_bucket.items(), key=lambda x: -x[1]):
        print(f"  {b:35s}: {c}")

    by_img = Counter(r["img_graduate_status"] for r in score_rows)
    by_intl = Counter(r["international_student_status"] for r in score_rows)
    print(f"\nIMG graduate status: {dict(by_img)}")
    print(f"Intl student status: {dict(by_intl)}")

    print("\nListing detail:")
    for r in score_rows:
        print(f"  {r['listing_id']:7s} {r['display_bucket']:35s} US={r['us_md_do_status'][:12]:12s} INTL={r['international_student_status'][:12]:12s} IMG_GRAD={r['img_graduate_status'][:12]:12s}")


if __name__ == "__main__":
    main()
