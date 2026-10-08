#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R1_SYNTAX_ONLY_REPAIR_AND_NON_EXPORT_LIVE_QUALIFICATION_RECERTIFICATION"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R1 Syntax-Only Repair + Non-Export Live Qualification Recertification"
echo "============================================================"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r1.mjs"
echo "[2/2] Repair exact mixed ?? / || syntax surface, node-check, and rerun R29B"
python3 "$DEST/repair_r29b_r1.py" "$ROOT"
echo "R29B-R1 EXECUTION COMPLETE — paste complete output into ChatGPT."
