#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_RUNTIME_REBOOTSTRAP_TRANSPORT_EXERCISE_AND_NON_EXPORT_RECERTIFICATION"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R2-R3 Runtime Rebootstrap + Transport Exercise + Non-Export Recertification"
echo "============================================================"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r2_r3.mjs"
echo "[2/2] Rebootstrap SCIIP runtime if needed, verify CDP, and exercise repaired transport through R29B"
python3 "$DEST/rebootstrap_and_recertify_r29b_r2_r3.py" "$ROOT"
echo "R29B-R2-R3 PACKAGE EXECUTION COMPLETE — paste complete output into ChatGPT."
