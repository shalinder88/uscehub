"""
P99-0 Phase B: Build USCE listing candidates table

Joins p97 opportunity data with canonical institution + identity merge records
to produce a unified listing schema CSV ready for completeness scoring.

Output: usce-completeness/usce_listing_candidates.csv

Run: python3 build_listing_candidates.py
"""

import csv
import re
from pathlib import Path

BASE = Path(__file__).parent
LOCAL = BASE.parent
CANONICAL = LOCAL / "nppes" / "canonical_institutions_for_matching.csv"
IDENTITY = LOCAL / "identity" / "institution_identity_review_queue_maine.csv"
OPPORTUNITIES = LOCAL / "p97_candidate_opportunities.csv"
OUT = BASE / "usce_listing_candidates.csv"

FIELDS = [
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
    "audience_eligibility",
    "student_eligibility",
    "graduate_eligibility",
    "img_eligibility",
    "caribbean_eligibility",
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


def load_csv(path):
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def normalize_name(s):
    return s.lower().strip()


def find_canonical(inst_name, canonical_rows):
    """Find the best canonical match for an institution name."""
    n = normalize_name(inst_name)
    for c in canonical_rows:
        cn = normalize_name(c["institution_name"])
        if cn == n or n in cn or cn in n:
            return c
    # Fuzzy: check if any significant word matches
    for c in canonical_rows:
        cn = normalize_name(c["institution_name"])
        words = [w for w in n.split() if len(w) > 4]
        if any(w in cn for w in words):
            return c
    return {}


def derive_source_status(opp):
    """Map p97 sourcePageType to internal source_status."""
    spt = opp.get("sourcePageType", "")
    if spt in ("EXACT_OFFICIAL_PROGRAM_PAGE",):
        return "OFFICIAL_PROGRAM_PAGE"
    if spt in ("OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",):
        return "OFFICIAL_DEPARTMENT_PAGE"
    if "generic" in spt.lower() or spt in ("PATH_HINTS_ONLY",):
        return "GENERIC_HOMEPAGE_ONLY"
    if spt in ("VSLO_PROGRAM_PAGE",):
        return "OFFICIAL_PROGRAM_PAGE"
    return "OFFICIAL_SOURCE_UNKNOWN_TYPE"


def derive_img_eligibility(opp):
    """Classify IMG eligibility into YES / NO / UNKNOWN."""
    raw = opp.get("imgEligibility", "").lower()
    if not raw or raw in ("unknown", "unclear", "not stated"):
        return "UNKNOWN"
    if any(t in raw for t in ("international accepted", "international medical student",
                               "img accepted", "international eligible", "explicitly accepted",
                               "international medical school", "international ms accepted",
                               "us/canadian/international", "international ms")):
        return "YES"
    if any(t in raw for t in ("lcme-only", "lcme only", "lcme/aoa", "lcme/aamc",
                               "exclud", "us-only", "us only", "us/canadian only",
                               "aamc/aacom us only")):
        return "NO"
    if "not explicit" in raw or "unclear" in raw or "via vslo" in raw:
        return "UNKNOWN"
    return "UNKNOWN"


def derive_vslo(opp):
    text = (opp.get("applicationUrl","") + opp.get("evidenceSnippet","") +
            opp.get("eligibility","") + opp.get("reviewerNotes","")).lower()
    if "vslo" in text:
        return "YES"
    return "UNKNOWN"


def derive_affiliation(opp):
    raw = (opp.get("eligibility","") + opp.get("targetFitReason","") +
           opp.get("reviewerNotes","")).lower()
    if "affiliation" in raw or "affiliation required" in raw:
        return "YES"
    if "no affiliation" in raw:
        return "NO"
    return "UNKNOWN"


def derive_observership(opp):
    ot = opp.get("opportunityType","").lower()
    title = opp.get("opportunityTitle","").lower()
    ev = opp.get("evidenceSnippet","").lower()
    if "observership" in ot or "observership" in title:
        return "YES"
    if any(t in title for t in ("sub-i", "sub-internship", "elective", "clerkship", "rotation")):
        return "NO"
    return "UNKNOWN"


def derive_hands_on(opp):
    ot = opp.get("opportunityType","").lower()
    ev = (opp.get("evidenceSnippet","") + opp.get("eligibility","")).lower()
    obs = derive_observership(opp)
    if obs == "YES":
        return "OBSERVATION"
    if "clinical" in ev or "hands" in ev or "sub-i" in ot:
        return "CLINICAL"
    if "elective" in ot or "clerkship" in ot:
        return "CLINICAL"
    return "UNKNOWN"


def derive_lor(opp):
    ev = (opp.get("evidenceSnippet","") + opp.get("eligibility","") +
          opp.get("reviewerNotes","")).lower()
    if "letter of recommendation" in ev or "lor" in ev:
        return "YES"
    return "UNKNOWN"


def derive_evaluation(opp):
    ev = (opp.get("evidenceSnippet","") + opp.get("eligibility","")).lower()
    if "evaluation" in ev or "grade" in ev or "assess" in ev:
        return "YES"
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
    email = opp.get("contactEmail","")
    if email and "@" in email:
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
    if "per" in dl or "cohort" in dl or "per-specialty" in dl:
        return "COHORT_BASED"
    return "STATED"


def derive_contact_status(opp):
    email = opp.get("contactEmail","").strip()
    name = opp.get("coordinatorNameIfPublic","").strip()
    if email or name:
        return "CONTACT_FOUND"
    return "NO_CONTACT_FOUND"


def derive_future_lane(opp):
    ot = opp.get("opportunityType","").lower()
    title = opp.get("opportunityTitle","").lower()
    return "residency" in ot or "fellowship" in ot or "residency" in title or "fellowship" in title


def is_non_target(opp):
    return opp.get("candidateStatus","") == "REJECTED_NON_TARGET"


def main():
    opps = load_csv(OPPORTUNITIES)
    canonical = load_csv(CANONICAL)
    identity_rows = load_csv(IDENTITY)
    identity_by_id = {r["canonical_institution_id"]: r for r in identity_rows}

    output_rows = []

    for opp in opps:
        cid_opp = opp["candidateId"]

        # Skip rejected non-target — no public listing
        if is_non_target(opp):
            continue

        # Resolve canonical institution
        canon = find_canonical(opp["institutionName"], canonical)
        cid = canon.get("canonical_institution_id", "")
        irow = identity_by_id.get(cid, {})

        # Derive fields
        img_elig = derive_img_eligibility(opp)

        # Student vs graduate: parse from studentGraduateEligibility
        stud_grad = opp.get("studentGraduateEligibility","").lower()
        student_elig = "YES" if any(t in stud_grad for t in ("student","medical student","ms")) else "UNKNOWN"
        grad_elig = "YES" if any(t in stud_grad for t in ("resident","fellow","graduate","grad")) else "NO"

        # Caribbean eligibility: unknown unless stated
        carib_raw = (opp.get("imgEligibility","") + opp.get("eligibility","")).lower()
        carib_elig = "YES" if "caribbean" in carib_raw else "UNKNOWN"

        row = {
            "listing_id": cid_opp,
            "institution_id": cid,
            "institution_name": opp["institutionName"],
            "campus_name": canon.get("campus_name",""),
            "parent_system": opp.get("healthSystem","") or canon.get("parent_system",""),
            "state": opp["state"],
            "county": opp["county"],
            "city": canon.get("city",""),
            "specialty": opp["specialty"],
            "opportunity_type": opp["opportunityType"],
            "audience_eligibility": opp.get("eligibility",""),
            "student_eligibility": student_elig,
            "graduate_eligibility": grad_elig,
            "img_eligibility": img_elig,
            "caribbean_eligibility": carib_elig,
            "vslo_required": derive_vslo(opp),
            "affiliation_required": derive_affiliation(opp),
            "hands_on_level": derive_hands_on(opp),
            "observership_only": derive_observership(opp),
            "lor_possible": derive_lor(opp),
            "evaluation_possible": derive_evaluation(opp),
            "application_method": derive_application_method(opp),
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
            "contact_status": derive_contact_status(opp),
            "contact_email_or_url": opp.get("contactEmail","") or opp.get("coordinatorNameIfPublic",""),
            "last_reviewed_at": "2026-05-03",
            "identity_status_from_p98_6": irow.get("combined_identity_status","UNKNOWN"),
            "source_packet_path": canon.get("packet_path",""),
            "extraction_notes": opp.get("reviewerNotes",""),
        }
        output_rows.append(row)

    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(output_rows)

    print(f"Written {len(output_rows)} listing candidates to {OUT}")
    from collections import Counter
    by_img = Counter(r["img_eligibility"] for r in output_rows)
    by_type = Counter(r["opportunity_type"] for r in output_rows)
    by_source = Counter(r["source_status"] for r in output_rows)
    by_method = Counter(r["application_method"] for r in output_rows)
    print(f"\nIMG eligibility: {dict(by_img)}")
    print(f"Opportunity type: {dict(by_type)}")
    print(f"Source status: {dict(by_source)}")
    print(f"Application method: {dict(by_method)}")


if __name__ == "__main__":
    main()
