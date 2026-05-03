"""
P99-0 Phase C: USCE Listing Completeness Scorer

Scores each listing on 15 dimensions (0-5 per dimension) and assigns
a classification:
  READY_PUBLIC
  PUBLIC_WITH_UNKNOWN_FIELDS
  NEEDS_REVIEW
  DO_NOT_SHOW
  FUTURE_LANE_ONLY

Hard gates:
  - No official source URL                → DO_NOT_SHOW or NEEDS_REVIEW
  - GENERIC_HOMEPAGE_ONLY source          → NEEDS_REVIEW
  - Residency/fellowship type             → FUTURE_LANE_ONLY
  - Parent-system opportunity w/o campus  → NEEDS_REVIEW
  - No eligibility language               → PUBLIC_WITH_UNKNOWN_FIELDS at best
  - No application method                 → PUBLIC_WITH_UNKNOWN_FIELDS or NEEDS_REVIEW
  - DO_NOT_SHOW in public card            → blocked

Inputs:  usce_listing_candidates.csv
Output:  usce_listing_completeness.csv

Run: python3 score_listing_completeness.py
"""

import csv
from collections import Counter
from pathlib import Path

BASE = Path(__file__).parent
IN_FILE = BASE / "usce_listing_candidates.csv"
OUT_FILE = BASE / "usce_listing_completeness.csv"

OUTPUT_FIELDS = [
    "listing_id",
    "institution_name",
    "state",
    "county",
    "specialty",
    "opportunity_type",
    "completeness_status",
    "completeness_score",
    "max_possible_score",
    # Per-dimension scores
    "score_official_source",
    "score_eligibility_clarity",
    "score_usce_type_clarity",
    "score_student_grad_clarity",
    "score_img_clarity",
    "score_vslo_affiliation_clarity",
    "score_hands_on_clarity",
    "score_lor_eval_clarity",
    "score_application_method",
    "score_fee_clarity",
    "score_deadline_clarity",
    "score_duration_clarity",
    "score_contact_clarity",
    "score_source_quote_coverage",
    "score_freshness",
    # Derived classification inputs
    "hard_gates_hit",
    "unknown_fields",
    "fit_warnings",
    # Pass-through key fields
    "img_eligibility",
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


def score_official_source(r):
    status = r.get("source_status","")
    url = r.get("official_source_url","")
    if status == "OFFICIAL_PROGRAM_PAGE" and url:
        return 5
    if status == "OFFICIAL_DEPARTMENT_PAGE" and url:
        return 4
    if status == "OFFICIAL_SOURCE_UNKNOWN_TYPE" and url:
        return 3
    if status == "GENERIC_HOMEPAGE_ONLY" and url:
        return 1
    if not url:
        return 0
    return 2


def score_eligibility_clarity(r):
    elig = r.get("audience_eligibility","").strip()
    if not elig:
        return 0
    # If it has explicit keyword-level language
    explicit = any(t in elig.lower() for t in (
        "lcme", "aamc", "img", "international", "caribbean", "do not", "not eligible",
        "us-only", "us only", "accredited", "good standing"
    ))
    if explicit and len(elig) > 30:
        return 5
    if len(elig) > 20:
        return 3
    return 2


def score_usce_type(r):
    ot = r.get("opportunity_type","").lower()
    title = r.get("opportunity_type","")
    if not ot:
        return 0
    known = {"elective", "clerkship", "sub-internship", "observership", "rotation"}
    if any(k in ot for k in known):
        return 5
    return 3


def score_student_grad(r):
    stu = r.get("student_eligibility","")
    grad = r.get("graduate_eligibility","")
    if stu in ("YES","NO") and grad in ("YES","NO"):
        return 5
    if stu in ("YES","NO") or grad in ("YES","NO"):
        return 3
    return 0


def score_img(r):
    img = r.get("img_eligibility","")
    if img == "UNKNOWN":
        return 0
    if img in ("YES","NO"):
        return 5
    return 0


def score_vslo_affil(r):
    vslo = r.get("vslo_required","")
    affil = r.get("affiliation_required","")
    if vslo != "UNKNOWN" and affil != "UNKNOWN":
        return 5
    if vslo != "UNKNOWN" or affil != "UNKNOWN":
        return 3
    return 0


def score_hands_on(r):
    ho = r.get("hands_on_level","")
    obs = r.get("observership_only","")
    if ho in ("CLINICAL","OBSERVATION") and obs in ("YES","NO"):
        return 5
    if ho in ("CLINICAL","OBSERVATION") or obs in ("YES","NO"):
        return 3
    return 0


def score_lor_eval(r):
    lor = r.get("lor_possible","")
    ev = r.get("evaluation_possible","")
    if lor != "UNKNOWN" and ev != "UNKNOWN":
        return 3
    if lor != "UNKNOWN" or ev != "UNKNOWN":
        return 2
    return 0


def score_application_method(r):
    method = r.get("application_method","")
    url = r.get("application_url","")
    if method in ("VSLO","SMARTSHEET","ONLINE_PORTAL") and url:
        return 5
    if method == "EMAIL" and r.get("contact_email_or_url",""):
        return 4
    if method != "UNKNOWN" and not url:
        return 2
    return 0


def score_fee(r):
    fs = r.get("fee_status","")
    if fs == "NO_FEE":
        return 5
    if fs == "FEE_CHARGED":
        return 4
    return 0


def score_deadline(r):
    ds = r.get("deadline_status","")
    if ds == "STATED":
        return 5
    if ds in ("ROLLING","COHORT_BASED"):
        return 4
    return 0


def score_duration(r):
    d = r.get("duration","").strip()
    if not d:
        return 0
    if any(t in d.lower() for t in ("week","month","wk","4 w")):
        return 5
    if "variable" in d.lower():
        return 2
    return 3


def score_contact(r):
    cs = r.get("contact_status","")
    c = r.get("contact_email_or_url","").strip()
    if cs == "CONTACT_FOUND" and c:
        return 5
    return 0


def score_source_quote(r):
    elig_q = r.get("source_quote_eligibility","").strip()
    fee_q = r.get("source_quote_fee","").strip()
    dl_q = r.get("source_quote_deadline","").strip()
    filled = sum(1 for q in [elig_q, fee_q, dl_q] if q and q.lower() not in ("unknown","not stated"))
    return filled + 2 if filled > 0 else 0


def score_freshness(r):
    reviewed = r.get("last_reviewed_at","")
    if reviewed and "2026" in reviewed:
        return 5
    if reviewed and "2025" in reviewed:
        return 3
    return 1


def classify(row, gates, score, max_score):
    # Hard gates take precedence
    if "FUTURE_LANE" in gates:
        return "FUTURE_LANE_ONLY"
    if "NO_SOURCE" in gates:
        return "DO_NOT_SHOW"
    if "GENERIC_HOMEPAGE_ONLY" in gates:
        return "NEEDS_REVIEW"
    if "MANUAL_REVIEW" in gates:
        return "NEEDS_REVIEW"
    if "PARENT_INHERITED_UNPROVEN" in gates:
        return "NEEDS_REVIEW"

    # Score-based thresholds
    pct = score / max_score if max_score else 0
    img = row.get("img_eligibility","")
    elig = row.get("audience_eligibility","").strip()
    app_method = row.get("application_method","")

    # READY_PUBLIC requirements:
    #   - img_eligibility explicit
    #   - eligibility language present
    #   - application method known
    #   - pct >= 0.55
    if (img != "UNKNOWN" and elig and app_method != "UNKNOWN" and pct >= 0.55):
        return "READY_PUBLIC"

    # PUBLIC_WITH_UNKNOWN_FIELDS: has source, has some eligibility, just incomplete
    if elig and row.get("official_source_url",""):
        return "PUBLIC_WITH_UNKNOWN_FIELDS"

    return "NEEDS_REVIEW"


def collect_unknown_fields(row):
    unknowns = []
    if row.get("img_eligibility","") == "UNKNOWN":
        unknowns.append("img_eligibility")
    if not row.get("audience_eligibility",""):
        unknowns.append("eligibility")
    if row.get("application_method","") == "UNKNOWN":
        unknowns.append("application_method")
    if not row.get("application_url","") and row.get("application_method","") not in ("EMAIL",):
        unknowns.append("application_url")
    if row.get("fee_status","") == "UNKNOWN":
        unknowns.append("fee")
    if row.get("deadline_status","") == "UNKNOWN":
        unknowns.append("deadline")
    if not row.get("duration","").strip():
        unknowns.append("duration")
    if row.get("lor_possible","") == "UNKNOWN":
        unknowns.append("lor_possible")
    return unknowns


def collect_fit_warnings(row):
    warnings = []
    img = row.get("img_eligibility","")
    if img == "NO":
        warnings.append("IMG_EXCLUDED")
    if row.get("vslo_required","") == "YES":
        warnings.append("VSLO_REQUIRED")
    if row.get("affiliation_required","") == "YES":
        warnings.append("AFFILIATION_REQUIRED")
    if row.get("observership_only","") == "YES":
        warnings.append("OBSERVERSHIP_ONLY")
    return warnings


def collect_hard_gates(row):
    gates = []
    ot = row.get("opportunity_type","").lower()
    title = row.get("institution_name","").lower()
    cs = row.get("candidateStatus","")

    if not row.get("official_source_url",""):
        gates.append("NO_SOURCE")
    if row.get("source_status","") == "GENERIC_HOMEPAGE_ONLY":
        gates.append("GENERIC_HOMEPAGE_ONLY")
    if "residency" in ot or "fellowship" in ot:
        gates.append("FUTURE_LANE")
    # NEEDS_MANUAL_REVIEW from p97 maps to MANUAL_REVIEW gate
    notes = row.get("extraction_notes","").lower()
    if "needs_manual_review" in notes or "manual review" in notes:
        gates.append("MANUAL_REVIEW")
    return gates


def main():
    candidates = load_csv(IN_FILE)
    output = []

    for r in candidates:
        gates = collect_hard_gates(r)

        dims = {
            "official_source":     score_official_source(r),
            "eligibility_clarity": score_eligibility_clarity(r),
            "usce_type_clarity":   score_usce_type(r),
            "student_grad_clarity":score_student_grad(r),
            "img_clarity":         score_img(r),
            "vslo_affiliation_clarity": score_vslo_affil(r),
            "hands_on_clarity":    score_hands_on(r),
            "lor_eval_clarity":    score_lor_eval(r),
            "application_method":  score_application_method(r),
            "fee_clarity":         score_fee(r),
            "deadline_clarity":    score_deadline(r),
            "duration_clarity":    score_duration(r),
            "contact_clarity":     score_contact(r),
            "source_quote_coverage": score_source_quote(r),
            "freshness":           score_freshness(r),
        }

        score = sum(dims.values())
        max_score = 5 * len(dims)
        status = classify(r, gates, score, max_score)
        unknowns = collect_unknown_fields(r)
        warnings = collect_fit_warnings(r)

        output.append({
            "listing_id": r["listing_id"],
            "institution_name": r["institution_name"],
            "state": r["state"],
            "county": r["county"],
            "specialty": r["specialty"],
            "opportunity_type": r["opportunity_type"],
            "completeness_status": status,
            "completeness_score": score,
            "max_possible_score": max_score,
            "score_official_source": dims["official_source"],
            "score_eligibility_clarity": dims["eligibility_clarity"],
            "score_usce_type_clarity": dims["usce_type_clarity"],
            "score_student_grad_clarity": dims["student_grad_clarity"],
            "score_img_clarity": dims["img_clarity"],
            "score_vslo_affiliation_clarity": dims["vslo_affiliation_clarity"],
            "score_hands_on_clarity": dims["hands_on_clarity"],
            "score_lor_eval_clarity": dims["lor_eval_clarity"],
            "score_application_method": dims["application_method"],
            "score_fee_clarity": dims["fee_clarity"],
            "score_deadline_clarity": dims["deadline_clarity"],
            "score_duration_clarity": dims["duration_clarity"],
            "score_contact_clarity": dims["contact_clarity"],
            "score_source_quote_coverage": dims["source_quote_coverage"],
            "score_freshness": dims["freshness"],
            "hard_gates_hit": "|".join(gates) if gates else "",
            "unknown_fields": "|".join(unknowns),
            "fit_warnings": "|".join(warnings),
            "img_eligibility": r.get("img_eligibility",""),
            "application_url": r.get("application_url",""),
            "official_source_url": r.get("official_source_url",""),
            "source_status": r.get("source_status",""),
            "identity_status_from_p98_6": r.get("identity_status_from_p98_6",""),
            "listing_id_ref": r["listing_id"],
        })

    with open(OUT_FILE, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(output)

    print(f"Scored {len(output)} listings → {OUT_FILE}")
    by_status = Counter(r["completeness_status"] for r in output)
    print("\nCompleteness status:")
    for s, c in sorted(by_status.items(), key=lambda x: -x[1]):
        print(f"  {s:30s}: {c}")

    avg = sum(r["completeness_score"] for r in output) / len(output) if output else 0
    print(f"\nAvg completeness score: {avg:.1f} / {max_score}")

    # Per-status listing IDs
    for status in ["READY_PUBLIC", "PUBLIC_WITH_UNKNOWN_FIELDS", "NEEDS_REVIEW",
                   "DO_NOT_SHOW", "FUTURE_LANE_ONLY"]:
        ids = [r["listing_id"] for r in output if r["completeness_status"] == status]
        if ids:
            print(f"\n{status}:")
            for lid in ids:
                inst = next(r["institution_name"] for r in output if r["listing_id"] == lid)
                spec = next(r["specialty"] for r in output if r["listing_id"] == lid)
                score_v = next(r["completeness_score"] for r in output if r["listing_id"] == lid)
                print(f"  {lid}: {inst[:40]:40s}  [{spec[:20]:20s}]  score={score_v}")


if __name__ == "__main__":
    main()
