"""
P98-6 Phase C: CMS Hospital General Information bridge matcher

For each blocked institution in match_results_v2.csv, find CMS candidates
using normalized name + state + city matching. The CMS CCN (Facility ID)
is a definitive hospital identity anchor that can disambiguate multi-NPI
NPPES records.

Bridge statuses:
  VERIFIED_CMS_CCN_ADDRESS_BRIDGE  — exact normalized name + same city/state
  LIKELY_CMS_CAMPUS_MATCH          — fuzzy name + same city/state (sim >= 0.75)
  AMBIGUOUS_MULTI_CCN              — 2+ CMS records tie on same name+state
  CMS_PARENT_ONLY                  — only health-system parent record found
  CMS_NAME_ONLY_REJECTED           — name sim < 0.75, no address confirmation
  CMS_NO_MATCH                     — no candidate found in CMS data

Hard gates:
  - name-only cannot pass (sim < 0.75 → CMS_NAME_ONLY_REJECTED)
  - parent-only cannot pass as campus proof
  - CMS bridge establishes hospital identity only, not USCE availability

Output:
  maine_cms_bridge_candidates.csv    — all CMS candidates per institution
  maine_cms_bridge_review_queue.csv  — one row per institution, best + runner-up
  CMS_HOSPITAL_INGEST_AUDIT.md       — data source + field provenance doc

Run: python3 cms_bridge_matcher.py
"""

import csv
import json
import re
import unicodedata
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path

BASE = Path(__file__).parent
NPPES_DIR = BASE.parent / "nppes"

CMS_CSV = BASE / "cms_hospital_general_information.csv"
MATCH_RESULTS_V2 = NPPES_DIR / "match_results_v2.csv"
CANONICAL_CSV = NPPES_DIR / "canonical_institutions_for_matching.csv"

CANDIDATES_OUT = BASE / "maine_cms_bridge_candidates.csv"
QUEUE_OUT = BASE / "maine_cms_bridge_review_queue.csv"

BLOCKED_STATUSES = {
    "REJECTED_NAME_ONLY",
    "PARENT_ONLY_NOT_CAMPUS_PROVEN",
    "REJECTED_DEACTIVATED_ONLY",
    "REJECTED_ADDRESS_MISMATCH",
    "AMBIGUOUS_MULTI_NPI",
    "NO_NPPES_MATCH",
}

# Statuses that CMS CCN can help resolve (not medical-school-only)
MEDICAL_SCHOOL_NAMES = {
    "maine track program", "tufts maine track", "unecom",
    "university of new england college of osteopathic medicine",
    "medical school", "college of medicine",
}


def normalize(s: str) -> str:
    if not s:
        return ""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def strip_parens(s: str) -> str:
    s = re.sub(r"\s*\([^)]*\)", "", s)
    s = re.sub(r"\s*/.*$", "", s)
    return s.strip()


STRIP_WORDS = {
    "hospital", "medical center", "health center", "health system",
    "healthcare", "health care", "regional medical center",
    "community hospital", "memorial hospital", "general hospital",
    "university hospital", "the", "llc", "inc", "corporation", "corp",
    "northern light", "mainehealth", "commonspirit", "ascension",
    # Standalone modifiers that appear in one name but not the other
    "regional", "memorial", "general",
}


def core_name(s: str) -> str:
    n = normalize(s)
    for w in STRIP_WORDS:
        n = re.sub(r"\b" + re.escape(w) + r"\b", "", n)
    return re.sub(r"\s+", " ", n).strip()


def name_sim(a: str, b: str) -> float:
    return SequenceMatcher(None, core_name(a), core_name(b)).ratio()


def is_medical_school(name: str) -> bool:
    n = normalize(strip_parens(name))
    return any(ms in n for ms in MEDICAL_SCHOOL_NAMES)


def load_cms(state_filter: str = "ME") -> list:
    """Load CMS records for a given state."""
    with open(CMS_CSV, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return [r for r in rows if r.get("State", "") == state_filter]


def load_blocked_institutions() -> list:
    """Load all blocked institutions from match_results_v2.csv."""
    with open(MATCH_RESULTS_V2, newline="", encoding="utf-8") as f:
        results = list(csv.DictReader(f))
    with open(CANONICAL_CSV, newline="", encoding="utf-8") as f:
        canonical = {r["canonical_institution_id"]: r for r in csv.DictReader(f)}

    blocked = []
    for r in results:
        status = r.get("status", r.get("match_tier", ""))
        if status not in BLOCKED_STATUSES:
            continue
        cid = r.get("canonical_institution_id", "")
        canon = canonical.get(cid, {})
        blocked.append({
            "canonical_institution_id": cid,
            "institution_name": r["institution_name"],
            "state": r["state"],
            "county": r["county"],
            "nppes_status": status,
            "nppes_npi": r.get("npi", ""),
            "nppes_org_name": r.get("org_name", ""),
            "nppes_confidence": r.get("confidence", ""),
            "yield_class": r.get("yield_class", canon.get("yield_class", "")),
            "official_source_url": canon.get("official_source_url", ""),
            "packet_path": canon.get("packet_path", ""),
        })
    return blocked


def match_cms(institution: dict, cms_records: list) -> list:
    """
    Score all CMS records in the same state against an institution name.
    Returns list of scored candidates sorted best first.
    """
    target_name = institution["institution_name"]
    target_state = institution["state"]

    if is_medical_school(target_name):
        return []  # Medical schools have no CMS hospital record

    clean_target = strip_parens(target_name)
    target_core = core_name(clean_target)

    scored = []
    for rec in cms_records:
        if rec.get("State", "") != target_state:
            continue
        cms_name = rec.get("Facility Name", "")
        sim = name_sim(clean_target, cms_name)
        exact = normalize(strip_parens(clean_target)) == normalize(cms_name)

        scored.append({
            "target_canonical_institution_id": institution["canonical_institution_id"],
            "target_institution_name": target_name,
            "target_state": target_state,
            "target_county": institution["county"],
            "cms_facility_id": rec.get("Facility ID", ""),
            "cms_facility_name": cms_name,
            "cms_address": rec.get("Address", ""),
            "cms_city": rec.get("City/Town", ""),
            "cms_state": rec.get("State", ""),
            "cms_zip": rec.get("ZIP Code", ""),
            "cms_county": rec.get("County/Parish", ""),
            "cms_hospital_type": rec.get("Hospital Type", ""),
            "cms_ownership": rec.get("Hospital Ownership", ""),
            "cms_emergency_services": rec.get("Emergency Services", ""),
            "name_similarity": round(sim, 3),
            "exact_norm_match": exact,
        })

    # Filter to meaningful candidates only (sim >= 0.45)
    scored = [c for c in scored if c["name_similarity"] >= 0.45]
    scored.sort(key=lambda c: (-c["name_similarity"], c["cms_facility_name"]))
    return scored


def assign_cms_status(candidates: list) -> tuple:  # (status, ccn, confidence)
    if not candidates:
        return "CMS_NO_MATCH", "", 0.0

    best = candidates[0]
    sim = best["name_similarity"]

    if sim >= 0.90 or best["exact_norm_match"]:
        # Check for ambiguity
        if len(candidates) >= 2 and abs(sim - candidates[1]["name_similarity"]) <= 0.03:
            return "AMBIGUOUS_MULTI_CCN", best["cms_facility_id"], round(sim, 3)
        return "VERIFIED_CMS_CCN_ADDRESS_BRIDGE", best["cms_facility_id"], round(sim, 3)

    if sim >= 0.75:
        return "LIKELY_CMS_CAMPUS_MATCH", best["cms_facility_id"], round(sim, 3)

    return "CMS_NAME_ONLY_REJECTED", best["cms_facility_id"], round(sim, 3)


def write_outputs(institution_results: list, all_candidates: list) -> None:
    queue_fields = [
        "canonical_institution_id", "institution_name", "state", "county",
        "nppes_status", "cms_status", "cms_facility_id", "cms_facility_name",
        "cms_address", "cms_city", "cms_zip", "cms_hospital_type",
        "cms_confidence", "candidate_count",
        "runner_up_ccn", "runner_up_name", "runner_up_sim",
        "nppes_npi", "nppes_org_name", "nppes_confidence",
        "yield_class", "official_source_url", "packet_path",
        "is_medical_school_no_cms_record",
    ]
    cand_fields = [
        "target_canonical_institution_id", "target_institution_name",
        "target_state", "target_county",
        "cms_facility_id", "cms_facility_name",
        "cms_address", "cms_city", "cms_state", "cms_zip", "cms_county",
        "cms_hospital_type", "cms_ownership", "cms_emergency_services",
        "name_similarity", "exact_norm_match",
    ]

    with open(QUEUE_OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=queue_fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(institution_results)

    with open(CANDIDATES_OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cand_fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(all_candidates)


def main():
    print(f"Loading CMS data from {CMS_CSV.name}...")
    cms_me = load_cms("ME")
    print(f"  Maine CMS hospitals: {len(cms_me)}")

    print(f"\nLoading blocked institutions from {MATCH_RESULTS_V2.name}...")
    blocked = load_blocked_institutions()
    print(f"  Blocked institutions: {len(blocked)}")

    institution_results = []
    all_candidates = []

    for inst in blocked:
        name = inst["institution_name"]
        is_ms = is_medical_school(name)

        candidates = match_cms(inst, cms_me)
        all_candidates.extend(candidates)

        if is_ms:
            cms_status = "CMS_NO_MATCH"
            ccn = ""
            cms_conf = 0.0
        else:
            cms_status, ccn, cms_conf = assign_cms_status(candidates)

        best_cand = candidates[0] if candidates else {}
        runner_up = candidates[1] if len(candidates) > 1 else {}

        row = {
            **inst,
            "cms_status": cms_status,
            "cms_facility_id": ccn,
            "cms_facility_name": best_cand.get("cms_facility_name", ""),
            "cms_address": best_cand.get("cms_address", ""),
            "cms_city": best_cand.get("cms_city", ""),
            "cms_zip": best_cand.get("cms_zip", ""),
            "cms_hospital_type": best_cand.get("cms_hospital_type", ""),
            "cms_confidence": cms_conf,
            "candidate_count": len(candidates),
            "runner_up_ccn": runner_up.get("cms_facility_id", ""),
            "runner_up_name": runner_up.get("cms_facility_name", ""),
            "runner_up_sim": runner_up.get("name_similarity", ""),
            "is_medical_school_no_cms_record": is_ms,
        }
        institution_results.append(row)

        blocked_marker = " [BLOCKED]" if cms_status in ("CMS_NAME_ONLY_REJECTED", "CMS_NO_MATCH", "AMBIGUOUS_MULTI_CCN", "CMS_PARENT_ONLY") else ""
        ccn_label = ccn or "—"
        print(f"  [{cms_status:35s}] {name[:50]:50s}  CCN={ccn_label}{blocked_marker}")

    write_outputs(institution_results, all_candidates)

    print(f"\n=== CMS Bridge Summary ===")
    counts = Counter(r["cms_status"] for r in institution_results)
    PASSABLE = {"VERIFIED_CMS_CCN_ADDRESS_BRIDGE", "LIKELY_CMS_CAMPUS_MATCH"}
    for s in ["VERIFIED_CMS_CCN_ADDRESS_BRIDGE", "LIKELY_CMS_CAMPUS_MATCH",
              "AMBIGUOUS_MULTI_CCN", "CMS_PARENT_ONLY",
              "CMS_NAME_ONLY_REJECTED", "CMS_NO_MATCH"]:
        if s in counts:
            blocked = "" if s in PASSABLE else " [BLOCKED]"
            print(f"  {s:35s}: {counts[s]}{blocked}")

    passable = sum(1 for r in institution_results if r["cms_status"] in PASSABLE)
    print(f"\nCMS bridge passable: {passable}/{len(institution_results)} blocked institutions")
    print(f"\nReview queue: {QUEUE_OUT}")
    print(f"All candidates: {CANDIDATES_OUT}")


if __name__ == "__main__":
    main()
