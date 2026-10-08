#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_FIRST_RECORD_ASYNC_BOUNDARY_EXACT_LOCALIZATION"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R4 First Record Async Boundary Exact Localization"
echo "============================================================"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r2_r3_r2_r4_r3_r4.mjs"
echo "[2/2] Instrument createFreshPage internal await lifecycle, execute under bound, restore runner"
python3 "$DEST/localize_r29b_r2_r3_r2_r4_r3_r4.py" "$ROOT"
