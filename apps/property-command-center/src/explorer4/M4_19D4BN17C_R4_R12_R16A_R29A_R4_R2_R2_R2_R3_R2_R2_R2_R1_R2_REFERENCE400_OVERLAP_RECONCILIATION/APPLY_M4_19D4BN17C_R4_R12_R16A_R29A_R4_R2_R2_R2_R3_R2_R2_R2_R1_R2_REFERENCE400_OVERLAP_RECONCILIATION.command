#!/bin/bash
set -euo pipefail
ROOT="${1:-}"; [ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_REFERENCE400_OVERLAP_RECONCILIATION"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "[1/2] Static certification"
node "$DEST/test_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1_r2.mjs"
echo "[2/2] Reconcile authoritative reference-400 overlap and lineage"
python3 "$DEST/reconcile_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1_r2.py" "$ROOT"
