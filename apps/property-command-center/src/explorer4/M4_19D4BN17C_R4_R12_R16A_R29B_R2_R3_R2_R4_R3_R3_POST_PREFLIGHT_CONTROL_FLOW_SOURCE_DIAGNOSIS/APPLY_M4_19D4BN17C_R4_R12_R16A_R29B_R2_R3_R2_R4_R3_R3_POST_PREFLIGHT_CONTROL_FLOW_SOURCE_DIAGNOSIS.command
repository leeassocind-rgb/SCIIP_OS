#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R3_POST_PREFLIGHT_CONTROL_FLOW_SOURCE_DIAGNOSIS"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R3 Post-Preflight Control-Flow Source Diagnosis"
echo "============================================================"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r2_r3_r2_r4_r3_r3.mjs"
echo "[2/2] Instrument synchronous post-preflight statements, execute under bound, restore runner"
python3 "$DEST/diagnose_r29b_r2_r3_r2_r4_r3_r3.py" "$ROOT"
