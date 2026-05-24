"""
P99-0A Phase D: Public listing card preview v2

Uses audience-specific fields from v2 scorer.
Excludes SUPPORTING_SOURCE_ONLY and DO_NOT_SHOW.
Unknown audiences are always visible — never hidden.

Output: public_listing_cards_preview_v2.json

Run: python3 build_public_card_preview_v2.py
"""

import csv
import json
from pathlib import Path

BASE = Path(__file__).parent
SCORE_FILE = BASE / "usce_listing_completeness_v2.csv"
CAND_FILE = BASE / "usce_listing_candidates_v2.csv"
OUT = BASE / "public_listing_cards_preview_v2.json"

# These buckets do not generate public cards
EXCLUDED_BUCKETS = {"SUPPORTING_SOURCE_ONLY", "DO_NOT_SHOW"}


def load_csv(path):
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def build_eligible_audiences(s):
    return [a for a in s.get("eligible_audiences","").split("|") if a]


def build_excluded_audiences(s):
    return [a for a in s.get("excluded_audiences","").split("|") if a]


def build_unknown_audiences(s):
    return [a for a in s.get("unknown_audiences","").split("|") if a]


def build_restriction_tags(s):
    return [t for t in s.get("restriction_tags","").split("|") if t]


def build_card(score_row, cand):
    bucket = score_row.get("display_bucket","")
    if bucket in EXCLUDED_BUCKETS:
        return None

    unknowns = [u for u in score_row.get("unknown_fields","").split("|") if u]
    unknown_audiences = build_unknown_audiences(score_row)
    fit_warnings = [w for w in score_row.get("fit_warnings","").split("|") if w]

    card = {
        "listing_id": score_row["listing_id"],
        "institution_name": cand.get("institution_name",""),
        "campus_name": cand.get("campus_name",""),
        "state": cand.get("state",""),
        "county": cand.get("county",""),
        "city": cand.get("city",""),
        "specialty": cand.get("specialty",""),
        "opportunity_type": cand.get("opportunity_type",""),
        "source_page_type": score_row.get("source_page_type",""),
        "listing_role": score_row.get("listing_role",""),
        "display_bucket": bucket,
        # Audience-specific readiness
        "eligible_audiences": build_eligible_audiences(score_row),
        "excluded_audiences": build_excluded_audiences(score_row),
        "unknown_audiences": unknown_audiences,   # ALWAYS visible — never hidden
        "restriction_tags": build_restriction_tags(score_row),
        "fit_warnings": fit_warnings,
        # Per-audience status (visible in detailed view)
        "audience_detail": {
            "us_md_do": score_row.get("us_md_do_status",""),
            "international_student": score_row.get("international_student_status",""),
            "img_graduate": score_row.get("img_graduate_status",""),
            "caribbean_student": score_row.get("caribbean_student_status",""),
        },
        # Application & source
        "application_url": cand.get("application_url",""),
        "official_source_url": cand.get("official_source_url",""),
        "source_status": cand.get("source_status",""),
        "last_reviewed_at": cand.get("last_reviewed_at",""),
        # Completeness
        "completeness_score": int(score_row.get("completeness_score",0)),
        "max_possible_score": int(score_row.get("max_possible_score",75)),
        "unknown_fields": unknowns,
        # Identity
        "identity_status": score_row.get("identity_status_from_p98_6",""),
    }

    if bucket == "NEEDS_REVIEW":
        gates = [g for g in score_row.get("hard_gates_hit","").split("|") if g]
        card["review_required_reason"] = gates

    if bucket == "FUTURE_LANE_ONLY":
        card["future_lane_note"] = "Residency/fellowship track — not current USCE scope."

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

    from collections import Counter
    status_summary = dict(Counter(c["display_bucket"] for c in cards))

    output = {
        "generated_at": "2026-05-03",
        "schema_version": "v2",
        "scope": "Maine (P99-0A)",
        "total_cards": len(cards),
        "skipped_supporting_or_do_not_show": skipped,
        "status_summary": status_summary,
        "cards": cards,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"Written {len(cards)} cards → {OUT}")
    print(f"Skipped (supporting/do-not-show): {skipped}")
    print(f"Status: {status_summary}")

    # Show a sample IMG-relevant card
    for c in cards:
        if c["display_bucket"] == "READY_PUBLIC_IMG_RELEVANT":
            print("\nSample READY_PUBLIC_IMG_RELEVANT card:")
            print(json.dumps({k: c[k] for k in [
                "listing_id","institution_name","specialty","display_bucket",
                "eligible_audiences","excluded_audiences","unknown_audiences",
                "restriction_tags","audience_detail"
            ]}, indent=2))
            break

    # Show a sample US-only card
    for c in cards:
        if c["display_bucket"] == "READY_PUBLIC_US_STUDENT_ONLY":
            print("\nSample READY_PUBLIC_US_STUDENT_ONLY card:")
            print(json.dumps({k: c[k] for k in [
                "listing_id","institution_name","specialty","display_bucket",
                "eligible_audiences","excluded_audiences","unknown_audiences",
                "restriction_tags","audience_detail"
            ]}, indent=2))
            break


if __name__ == "__main__":
    main()
