#!/bin/bash
set -euo pipefail
ROOT="${1:-}"; [ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R2_EXPLORER_ENTRY_HELPER_RUNTIME_DIAGNOSIS"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R5-R1-R6-R2 Explorer Entry Helper Runtime Diagnosis"
echo "============================================================"
echo "Live UI interaction: OFF"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r5_r1_r6_r2.mjs"
echo "[2/2] Diagnose exact ev ReferenceError source and available CDP evaluation surface"
python3 "$DEST/diagnose_r29b_r5_r1_r6_r2.py" "$ROOT"
