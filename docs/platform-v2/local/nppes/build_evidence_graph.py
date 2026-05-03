"""
P98-4: USCEHub Evidence Graph + Interlinking Generator

Graph model:
  Institution → NPPESOrganization  (internal edge: NPI join)
  Institution → Opportunity         (public edge: derived opportunity signals)
  NPPESOrganization → CMSHospital  (internal edge: CCN join — populated when CMS data available)
  CMSHospital → HPSAArea           (internal→derived edge: geographic HPSA flag)
  CMSHospital → ACGMEProgram       (internal edge: sponsor join)

Public/internal separation:
  - INTERNAL edges/nodes: NPI, CCN, EIN, raw source IDs — NEVER in public export
  - PUBLIC edges/nodes: derived signals (HPSA flag, teaching hospital flag, img_eligible, specialty)

Validator: fails if any restricted source (public_raw_display_allowed=false in rights ledger)
           contributes a field to the public export nodes.

Output (all under docs/platform-v2/local/nppes/):
  evidence_graph.json        — full internal graph (all edges, all fields)
  nodes_internal.csv         — all nodes with internal fields
  edges_internal.csv         — all edges with provenance
  nodes_public.csv           — public export nodes (restricted fields stripped)
  edges_public.csv           — public export edges (internal-only edges excluded)
  graph_build_report.json    — validation report

Run: python3 build_evidence_graph.py [--state ME]
"""

import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path

BASE = Path(__file__).parent

RIGHTS_LEDGER_PATH = BASE.parent.parent / "local" / "data-rights" / "source_rights_ledger.json"
INSTITUTION_PROGRESS_CSV = BASE.parent / "p97_institution_search_progress.csv"
NPPES_MATCH_CSV = BASE / "match_results.csv"
OPPORTUNITIES_CSV = BASE.parent / "p97_candidate_opportunities.csv"

OUT_GRAPH_JSON = BASE / "evidence_graph.json"
OUT_NODES_INTERNAL = BASE / "nodes_internal.csv"
OUT_EDGES_INTERNAL = BASE / "edges_internal.csv"
OUT_NODES_PUBLIC = BASE / "nodes_public.csv"
OUT_EDGES_PUBLIC = BASE / "edges_public.csv"
OUT_REPORT = BASE / "graph_build_report.json"

# ─── Rights ledger ────────────────────────────────────────────────────────────

def load_rights_ledger():
    with open(RIGHTS_LEDGER_PATH) as f:
        ledger = json.load(f)
    by_id = {s["source_id"]: s for s in ledger["sources"]}
    return ledger, by_id


def source_is_public_safe(source_id: str, rights_by_id: dict) -> bool:
    """Returns True if derived display is allowed with no external review gate."""
    s = rights_by_id.get(source_id)
    if not s:
        return False
    return (
        s["public_derived_display_allowed"]
        and not s["external_review_required_before_publication"]
    )


# ─── CSV loaders ─────────────────────────────────────────────────────────────

def load_csv(path) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ─── Node/edge builders ──────────────────────────────────────────────────────

def make_node(node_id: str, node_type: str, properties: dict, source_ids: list[str]) -> dict:
    return {
        "id": node_id,
        "type": node_type,
        "properties": properties,
        "source_ids": source_ids,
    }


def make_edge(from_id: str, to_id: str, rel: str, visibility: str,
              properties: dict, source_ids: list[str]) -> dict:
    """
    visibility: 'public' | 'internal'
    """
    return {
        "from": from_id,
        "to": to_id,
        "rel": rel,
        "visibility": visibility,
        "properties": properties,
        "source_ids": source_ids,
    }


def node_id_for(node_type: str, key: str) -> str:
    safe = key.lower().replace(" ", "_").replace("/", "_").replace("(", "").replace(")", "")[:60]
    return f"{node_type}:{safe}"


# ─── Graph build ─────────────────────────────────────────────────────────────

def build_graph(state_filter: str, rights_by_id: dict) -> dict:
    nodes = {}   # id → node
    edges = []

    # Load source data
    institutions = [r for r in load_csv(INSTITUTION_PROGRESS_CSV)
                    if not state_filter or r["state"] == state_filter]
    nppes_matches = {r["institution_name"]: r for r in load_csv(NPPES_MATCH_CSV)
                     if not state_filter or r.get("state") == state_filter}
    opportunities = [r for r in load_csv(OPPORTUNITIES_CSV)
                     if not state_filter or r.get("state") == state_filter]

    # ── Institution nodes ────────────────────────────────────────────────────
    for inst in institutions:
        nid = node_id_for("Institution", inst["institutionName"])
        nodes[nid] = make_node(
            node_id=nid,
            node_type="Institution",
            properties={
                # Public-safe derived fields
                "name": inst["institutionName"],
                "state": inst["state"],
                "county": inst["county"],
                "institution_type": inst.get("institutionType", ""),
                "official_website": inst.get("officialWebsite", ""),
                "health_system": inst.get("healthSystem", ""),
                "medical_school_affiliation": inst.get("medicalSchoolAffiliation", ""),
                "teaching_hospital_likely": inst.get("teachingHospitalLikely", ""),
                "va_affiliated": inst.get("vaAffiliated", ""),
                "search_status": inst.get("searchStatus", ""),
                # Internal-only fields — prefixed _internal
                "_internal_packet_path": inst.get("packetPath", ""),
                "_internal_search_terms_tried": inst.get("searchTermsTried", ""),
            },
            source_ids=["aamc_eras_stats"],  # institution list derived from public education data
        )

    # ── NPPESOrganization nodes + Institution→NPPES edges ────────────────────
    for inst_name, match in nppes_matches.items():
        if match["match_tier"] == "NO_NPPES_MATCH" or not match.get("npi"):
            continue

        npi = match["npi"]
        nid_nppes = node_id_for("NPPESOrg", npi)

        # All NPPES properties are INTERNAL — never in public export
        nodes[nid_nppes] = make_node(
            node_id=nid_nppes,
            node_type="NPPESOrg",
            properties={
                "_internal_npi": npi,
                "_internal_org_name": match.get("org_name", ""),
                "_internal_pl_addr1": match.get("pl_addr1", ""),
                "_internal_pl_city": match.get("pl_city", ""),
                "_internal_pl_state": match.get("pl_state", ""),
                "_internal_pl_zip": (match.get("pl_zip", "") or "")[:5],
                "_internal_taxonomy_1": match.get("taxonomy_1", ""),
                "_internal_is_hospital_taxonomy": match.get("is_hospital_taxonomy", ""),
                "_internal_match_tier": match.get("match_tier", ""),
                "_internal_match_confidence": match.get("confidence", ""),
                "_internal_deactivation_date": match.get("deactivation_date", ""),
            },
            source_ids=["cms_nppes"],  # NPPES = CMS public domain
        )

        # Edge: Institution → NPPESOrg
        nid_inst = node_id_for("Institution", inst_name)
        if nid_inst in nodes:
            edges.append(make_edge(
                from_id=nid_inst,
                to_id=nid_nppes,
                rel="HAS_NPPES_MATCH",
                visibility="internal",  # NPI joins are INTERNAL
                properties={
                    "match_tier": match.get("match_tier", ""),
                    "confidence": match.get("confidence", ""),
                    "review_status": "pending",  # updated after P98-3 workbench
                },
                source_ids=["cms_nppes"],
            ))

    # ── Opportunity nodes + Institution→Opportunity edges ────────────────────
    for opp in opportunities:
        oid = node_id_for("Opportunity", opp.get("candidateId", opp.get("opportunityTitle", "")))

        # Opportunities are public-facing content
        nodes[oid] = make_node(
            node_id=oid,
            node_type="Opportunity",
            properties={
                "candidate_id": opp.get("candidateId", ""),
                "title": opp.get("opportunityTitle", ""),
                "opportunity_type": opp.get("opportunityType", ""),
                "specialty": opp.get("specialty", ""),
                "official_source_url": opp.get("officialSourceUrl", ""),
                "source_page_type": opp.get("sourcePageType", ""),
                "target_fit": opp.get("targetFit", ""),
                "target_fit_reason": opp.get("targetFitReason", ""),
                "img_eligibility": opp.get("imgEligibility", ""),
                "student_graduate_eligibility": opp.get("studentGraduateEligibility", ""),
                "visa_language": opp.get("visaLanguage", ""),
                "cost": opp.get("cost", ""),
                "duration": opp.get("duration", ""),
                "deadline": opp.get("deadline", ""),
                "state": opp.get("state", ""),
                "county": opp.get("county", ""),
            },
            source_ids=[],  # operator-discovered; no restricted source
        )

        # Edge: Institution → Opportunity
        inst_name_raw = opp.get("institutionName", "")
        nid_inst = node_id_for("Institution", inst_name_raw)
        if nid_inst in nodes:
            edges.append(make_edge(
                from_id=nid_inst,
                to_id=oid,
                rel="HAS_OPPORTUNITY",
                visibility="public",
                properties={
                    "specialty": opp.get("specialty", ""),
                    "target_fit": opp.get("targetFit", ""),
                    "img_eligibility": opp.get("imgEligibility", ""),
                },
                source_ids=[],
            ))

    return {"nodes": nodes, "edges": edges}


# ─── Public export filter ─────────────────────────────────────────────────────

RESTRICTED_FIELD_PREFIXES = ("_internal",)

def is_restricted_field(key: str) -> bool:
    return any(key.startswith(p) for p in RESTRICTED_FIELD_PREFIXES)


def public_node(node: dict):  # -> dict | None
    """
    Strip internal fields. Returns None if the node type is never public-safe
    (NPPESOrg is always internal).
    """
    if node["type"] == "NPPESOrg":
        return None  # NPPES nodes never appear in public export

    public_props = {k: v for k, v in node["properties"].items()
                    if not is_restricted_field(k)}
    return {
        "id": node["id"],
        "type": node["type"],
        "properties": public_props,
        "source_ids": node["source_ids"],
    }


def public_edge(edge: dict):  # -> dict | None
    if edge["visibility"] != "public":
        return None
    return edge


# ─── Validator ───────────────────────────────────────────────────────────────

def validate_public_export(
    public_nodes: list[dict],
    public_edges: list[dict],
    rights_by_id: dict,
) -> list[str]:
    errors = []

    # Check: no restricted source_ids appear in public nodes
    RESTRICTED_SOURCES = {
        sid for sid, s in rights_by_id.items()
        if not s["public_derived_display_allowed"]
        or s["external_review_required_before_publication"]
    }

    for node in public_nodes:
        for src in node.get("source_ids", []):
            if src in RESTRICTED_SOURCES:
                errors.append(
                    f"FAIL: public node {node['id']} references restricted source '{src}'. "
                    f"Remove or move to internal-only."
                )

    # Check: no _internal fields leaked into public nodes
    for node in public_nodes:
        for key in node.get("properties", {}):
            if is_restricted_field(key):
                errors.append(
                    f"FAIL: public node {node['id']} has internal field '{key}'. "
                    f"Strip before public export."
                )

    # Check: no internal edges in public export
    for edge in public_edges:
        if edge.get("visibility") == "internal":
            errors.append(
                f"FAIL: internal edge {edge['from']} -[{edge['rel']}]-> {edge['to']} "
                f"is in public export."
            )
        for src in edge.get("source_ids", []):
            if src in RESTRICTED_SOURCES:
                errors.append(
                    f"FAIL: public edge {edge['from']}->{edge['to']} references "
                    f"restricted source '{src}'."
                )

    # Specific hard rules
    for node in public_nodes:
        props = node.get("properties", {})
        for field in ("npi", "ccn", "ein", "npi_number", "org_npi"):
            if field in props and props[field]:
                errors.append(
                    f"FAIL: public node {node['id']} exposes field '{field}' "
                    f"(NPI/CCN/EIN must remain internal)."
                )

    return errors


# ─── CSV writers ─────────────────────────────────────────────────────────────

def write_nodes_csv(path, node_list: list[dict]):
    if not node_list:
        return
    all_prop_keys = set()
    for n in node_list:
        all_prop_keys.update(n["properties"].keys())
    prop_keys = sorted(all_prop_keys)
    fields = ["id", "type"] + prop_keys + ["source_ids"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for n in node_list:
            row = {"id": n["id"], "type": n["type"],
                   "source_ids": "|".join(n.get("source_ids", []))}
            row.update(n["properties"])
            w.writerow(row)


def write_edges_csv(path, edge_list: list[dict]):
    if not edge_list:
        return
    all_prop_keys = set()
    for e in edge_list:
        all_prop_keys.update(e.get("properties", {}).keys())
    prop_keys = sorted(all_prop_keys)
    fields = ["from", "to", "rel", "visibility"] + prop_keys + ["source_ids"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for e in edge_list:
            row = {"from": e["from"], "to": e["to"], "rel": e["rel"],
                   "visibility": e["visibility"],
                   "source_ids": "|".join(e.get("source_ids", []))}
            row.update(e.get("properties", {}))
            w.writerow(row)


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="P98-4 Evidence graph builder")
    parser.add_argument("--state", default="ME", help="State filter (default: ME)")
    args = parser.parse_args()

    t0 = time.time()
    print(f"=== P98-4 Evidence Graph Builder ===\n")

    # Load rights ledger
    if not RIGHTS_LEDGER_PATH.exists():
        sys.exit(f"ERROR: Rights ledger not found at {RIGHTS_LEDGER_PATH}")
    ledger, rights_by_id = load_rights_ledger()
    print(f"Rights ledger: {len(rights_by_id)} sources loaded")

    # Build graph
    graph = build_graph(args.state, rights_by_id)
    node_list = list(graph["nodes"].values())
    edge_list = graph["edges"]

    print(f"\nInternal graph:")
    print(f"  Nodes: {len(node_list)}")
    type_counts = {}
    for n in node_list:
        type_counts[n["type"]] = type_counts.get(n["type"], 0) + 1
    for t, c in sorted(type_counts.items()):
        print(f"    {t}: {c}")
    print(f"  Edges: {len(edge_list)}")
    vis_counts = {}
    for e in edge_list:
        vis_counts[e["visibility"]] = vis_counts.get(e["visibility"], 0) + 1
    for v, c in vis_counts.items():
        print(f"    {v}: {c}")

    # Build public export
    public_node_list = [pn for n in node_list if (pn := public_node(n)) is not None]
    public_edge_list = [pe for e in edge_list if (pe := public_edge(e)) is not None]

    print(f"\nPublic export:")
    print(f"  Nodes: {len(public_node_list)} (excluded {len(node_list)-len(public_node_list)} internal-only)")
    print(f"  Edges: {len(public_edge_list)} (excluded {len(edge_list)-len(public_edge_list)} internal-only)")

    # Validate public export
    validation_errors = validate_public_export(public_node_list, public_edge_list, rights_by_id)

    if validation_errors:
        print(f"\nVALIDATION FAILURES ({len(validation_errors)}):")
        for e in validation_errors:
            print(f"  {e}")
    else:
        print(f"\nValidation: PASSED — no restricted fields in public export")

    # Write outputs
    with open(OUT_GRAPH_JSON, "w") as f:
        json.dump({"nodes": node_list, "edges": edge_list}, f, indent=2)
    print(f"\nWrote: {OUT_GRAPH_JSON}")

    write_nodes_csv(OUT_NODES_INTERNAL, node_list)
    write_edges_csv(OUT_EDGES_INTERNAL, edge_list)
    print(f"Wrote: {OUT_NODES_INTERNAL}, {OUT_EDGES_INTERNAL}")

    write_nodes_csv(OUT_NODES_PUBLIC, public_node_list)
    write_edges_csv(OUT_EDGES_PUBLIC, public_edge_list)
    print(f"Wrote: {OUT_NODES_PUBLIC}, {OUT_EDGES_PUBLIC}")

    # Build report
    report = {
        "built_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "state_filter": args.state,
        "internal_graph": {
            "total_nodes": len(node_list),
            "node_types": type_counts,
            "total_edges": len(edge_list),
            "edge_visibility": vis_counts,
        },
        "public_export": {
            "total_nodes": len(public_node_list),
            "total_edges": len(public_edge_list),
            "excluded_node_types": ["NPPESOrg"],
            "excluded_edge_rels": ["HAS_NPPES_MATCH"],
        },
        "validation": {
            "passed": len(validation_errors) == 0,
            "errors": validation_errors,
        },
        "compliance_note": (
            "Internal graph contains NPPES NPIs and raw source joins — INTERNAL ONLY. "
            "Public export strips all _internal fields and NPPESOrg nodes. "
            "NPI/CCN/EIN never appear in public export."
        ),
        "elapsed_seconds": round(time.time() - t0, 2),
    }
    with open(OUT_REPORT, "w") as f:
        json.dump(report, f, indent=2)
    print(f"Wrote: {OUT_REPORT}")

    print(f"\nDone in {report['elapsed_seconds']}s.")
    if validation_errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
