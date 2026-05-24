"""
P99-0 Phase D: Public listing card preview

Reads usce_listing_completeness.csv + usce_listing_candidates.csv and produces
public_listing_cards_preview.json.

Only allowed public fields are included. Forbidden fields (NPI, CCN, raw NPPES/CMS
rows, internal scoring internals, source table dumps) are excluded.

Output: public_listing_cards_preview.json

Run: python3 build_public_card_preview.py
"""

import csv
import json
from pathlib import Path

BASE = Path(__file__).parent
SCORE_FILE = BASE / "usce_listing_completeness.csv"
CAND_FILE = BASE / "usce_listing_candidates.csv"
OUT = BASE / "public_listing_cards_preview.json"

# Statuses eligible for public card output (DO_NOT_SHOW excluded)
PUBLIC_STATUSES = {"READY_PUBLIC", "PUBLIC_WITH_UNKNOWN_FIELDS", "NEEDS_REVIEW", "FUTURE_LANE_ONLY"}


def load_csv(path):
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def build_eligibility_tags(cand):
    tags = []
    img = cand.get("img_eligibility","")
    if img == "YES":
        tags.append("IMG_ELIGIBLE")
    elif img == "NO":
        tags.append("IMG_EXCLUDED")
    stu = cand.get("student_eligibility","")
    if stu == "YES":
        tags.append("MEDICAL_STUDENTS")
    grad = cand.get("graduate_eligibility","")
    if grad == "YES":
        tags.append("RESIDENTS_FELLOWS")
    vslo = cand.get("vslo_required","")
    if vslo == "YES":
        tags.append("VSLO_PLATFORM")
    return tags


def build_restriction_tags(score_row, cand):
    tags = []
    warnings = score_row.get("fit_warnings","")
    if "VSLO_REQUIRED" in warnings:
        tags.append("VSLO_REQUIRED")
    if "AFFILIATION_REQUIRED" in warnings:
        tags.append("AFFILIATION_REQUIRED")
    if "OBSERVERSHIP_ONLY" in warnings:
        tags.append("OBSERVERSHIP_ONLY")
    if "IMG_EXCLUDED" in warnings:
        tags.append("LCME_AOA_ONLY")
    return tags


def build_card(score_row, cand):
    status = score_row.get("completeness_status","")
    if status == "DO_NOT_SHOW":
        return None  # Never include in preview

    unknowns = [u for u in score_row.get("unknown_fields","").split("|") if u]

    card = {
        "listing_id": score_row["listing_id"],
        "institution_name": cand.get("institution_name",""),
        "campus_name": cand.get("campus_name",""),
        "state": cand.get("state",""),
        "county": cand.get("county",""),
        "city": cand.get("city",""),
        "specialty": cand.get("specialty",""),
        "opportunity_type": cand.get("opportunity_type",""),
        "eligibility_tags": build_eligibility_tags(cand),
        "restriction_tags": build_restriction_tags(score_row, cand),
        "application_url": cand.get("application_url",""),
        "official_source_url": cand.get("official_source_url",""),
        "source_status": cand.get("source_status",""),
        "last_reviewed_at": cand.get("last_reviewed_at",""),
        "completeness_status": status,
        "completeness_score": int(score_row.get("completeness_score",0)),
        "max_possible_score": int(score_row.get("max_possible_score",75)),
        "unknown_fields": unknowns,
        "fit_warnings": [w for w in score_row.get("fit_warnings","").split("|") if w],
    }

    # For FUTURE_LANE_ONLY, add a marker
    if status == "FUTURE_LANE_ONLY":
        card["future_lane_note"] = "This opportunity is for residency/fellowship — not current USCE scope."

    # For NEEDS_REVIEW, add a reviewer note
    if status == "NEEDS_REVIEW":
        gates = [g for g in score_row.get("hard_gates_hit","").split("|") if g]
        card["review_required_reason"] = gates

    return card


def main():
    scores = load_csv(SCORE_FILE)
    cands = load_csv(CAND_FILE)
    cand_by_id = {r["listing_id"]: r for r in cands}

    cards = []
    skipped = []

    for s in scores:
        lid = s["listing_id"]
        cand = cand_by_id.get(lid, {})
        card = build_card(s, cand)
        if card is None:
            skipped.append(lid)
        else:
            cards.append(card)

    output = {
        "generated_at": "2026-05-03",
        "scope": "Maine (P99-0 pilot)",
        "total_cards": len(cards),
        "skipped_do_not_show": skipped,
        "status_summary": {},
        "cards": cards,
    }

    from collections import Counter
    output["status_summary"] = dict(Counter(c["completeness_status"] for c in cards))

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"Written {len(cards)} public cards to {OUT}")
    print(f"Skipped (DO_NOT_SHOW): {len(skipped)}")
    print(f"Status breakdown: {output['status_summary']}")
    print(f"\nSample READY_PUBLIC card:")
    for c in cards:
        if c["completeness_status"] == "READY_PUBLIC":
            print(json.dumps({k: c[k] for k in [
                "listing_id","institution_name","specialty","opportunity_type",
                "eligibility_tags","restriction_tags","completeness_status",
                "completeness_score"
            ]}, indent=2))
            break


if __name__ == "__main__":
    main()
