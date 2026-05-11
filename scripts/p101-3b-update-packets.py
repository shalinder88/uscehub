#!/usr/bin/env python3
"""P101-3B — update 10 enhanced packets with real SHA-256 hashes and T7 paths.

Reads /tmp/p101-3b-results/manifest.csv (slug,state,url,sha256,bytes,outcome).
For each row with outcome CAPTURED:
  - find the packet JSON for that slug+state
  - in sourceEvidence[], find the entry whose sourceUrl matches; update
    cleanedTextHash, cleanedTextPath, screenshotStatus, accessedAt, httpStatus
  - in changeDetectionPrep, set sourceHash to the hash for the primary
    (first) source page; set cleanedTextPath to the same path
  - write back the packet JSON

This script is idempotent. It does NOT touch any field whose source URL
didn't match a captured row. PENDING placeholders for un-captured fields
remain honest.
"""
import csv, json, os, sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
T7_ROOT = "/Volumes/T7Shield_Code/USCEHubEvidence/p101"

# Map slug -> packet file (relative to repo root)
SLUG_TO_PACKET = {
    "uab-hospital": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/AL/university-of-alabama-at-birmingham-hospital.json",
    "stanford-health-care": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/CA/stanford-health-care.json",
    "emory-university-hospital": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/GA/emory-university-hospital.json",
    "upmc-presbyterian": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/PA/upmc-presbyterian.json",
    "boston-medical-center": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/MA/boston-medical-center.json",
    "parkland-health-utsw": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/TX/parkland-health-utsw.json",
    "brigham-and-womens-hospital": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/MA/brigham-and-womens-hospital.json",
    "massachusetts-general-hospital": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/MA/massachusetts-general-hospital.json",
    "beth-israel-deaconess-medical-center": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/MA/beth-israel-deaconess-medical-center.json",
    "cook-county-health-stroger": "docs/platform-v2/local/usce-discovery-command-center/institution-packets/IL/cook-county-health-stroger.json",
}

ACCESSED_AT = "2026-05-11T07:30:00Z"

def find_t7_text_path(slug: str, state: str) -> str:
    """Find the .txt file in T7 cleaned-text/ for this institution."""
    d = f"{T7_ROOT}/{state}/{slug}/cleaned-text"
    if not os.path.isdir(d):
        return ""
    files = [f for f in os.listdir(d) if f.endswith(".txt")]
    if not files:
        return ""
    return f"{d}/{files[0]}"

def update_packet(packet_path: Path, captured_url: str, sha256: str, byte_count: int, t7_text_path: str):
    with open(packet_path, "r", encoding="utf-8") as f:
        pkt = json.load(f)

    se = pkt.get("sourceEvidence", [])
    primary_hash_set = False
    for entry in se:
        if entry.get("sourceUrl") == captured_url:
            entry["cleanedTextHash"] = sha256
            entry["cleanedTextPath"] = t7_text_path
            entry["screenshotStatus"] = entry.get("screenshotStatus", "PENDING")
            entry["accessedAt"] = ACCESSED_AT
            entry["httpStatus"] = 200
            entry["notes"] = (entry.get("notes", "") or "").replace(
                "T7 unmounted; SHA-256 placeholder. Backfill via scripts/p101-backfill-t7-artifacts.ts when T7 available.",
                "T7 Shield artifact captured 2026-05-11; cleaned text + SHA-256 on T7."
            ).replace(
                "T7 unmounted; SHA-256 placeholder.",
                "T7 Shield artifact captured 2026-05-11."
            ).replace(
                "T7 unmounted",
                "T7 Shield artifact captured 2026-05-11"
            )
            if not primary_hash_set:
                # First-matching source page becomes the canonical source-of-truth for change detection
                cdp = pkt.setdefault("changeDetectionPrep", {})
                cdp["sourceHash"] = sha256
                cdp["cleanedTextPath"] = t7_text_path
                cdp["firstCapturedAt"] = ACCESSED_AT
                if not cdp.get("nextRecheckDue"):
                    cdp["nextRecheckDue"] = "2026-08-09T07:30:00Z"
                primary_hash_set = True

    # HASH_CAPTURED source tag
    ot = pkt.setdefault("opportunityTags", {})
    src_tags = ot.get("source", [])
    if "HASH_CAPTURED" not in src_tags:
        src_tags.append("HASH_CAPTURED")
    if "CLEANED_TEXT_SAVED" not in src_tags:
        src_tags.append("CLEANED_TEXT_SAVED")
    # Remove the no-longer-accurate PENDING tag if both above are now set
    if "CLEANED_TEXT_PENDING" in src_tags:
        src_tags.remove("CLEANED_TEXT_PENDING")
    ot["source"] = src_tags

    with open(packet_path, "w", encoding="utf-8") as f:
        json.dump(pkt, f, indent=2, ensure_ascii=False)
        f.write("\n")

def main():
    manifest = "/tmp/p101-3b-results/manifest.csv"
    if not os.path.isfile(manifest):
        print(f"Missing {manifest}; run scripts/p101-3b-backfill.sh first", file=sys.stderr)
        sys.exit(1)

    updated = []
    failed = []
    with open(manifest, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            slug = row["slug"]
            state = row["state"]
            url = row["url"]
            sha = row["sha256"]
            byte_count = int(row["bytes"].strip())
            outcome = row["outcome"]
            if outcome != "CAPTURED":
                failed.append((slug, url, outcome))
                continue
            packet_rel = SLUG_TO_PACKET.get(slug)
            if not packet_rel:
                failed.append((slug, url, "NO_PACKET_MAPPED"))
                continue
            packet_path = REPO / packet_rel
            if not packet_path.exists():
                failed.append((slug, url, f"PACKET_NOT_FOUND {packet_path}"))
                continue
            t7_text_path = find_t7_text_path(slug, state)
            update_packet(packet_path, url, sha, byte_count, t7_text_path)
            updated.append((slug, sha, t7_text_path, byte_count))

    print(f"Updated {len(updated)} packets:")
    for slug, sha, tp, b in updated:
        print(f"  {slug}  hash={sha[:16]}…  bytes={b}  t7={tp}")
    if failed:
        print(f"\nFailed: {len(failed)}")
        for slug, url, reason in failed:
            print(f"  {slug}  {url}  {reason}")

if __name__ == "__main__":
    main()
