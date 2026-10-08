#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R7_REFERENCE400_DOWNSTREAM_COHORT_REQUALIFICATION"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29A R1-R7 Reference-400 Downstream Cohort Requalification"
echo "============================================================"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29a_r1_r7.mjs"
echo "[2/2] Requalify exact New-400 from live Explorer inventory against recertified Reference-400"
python3 "$DEST/requalify_r29a_r1_r7.py" "$ROOT"
