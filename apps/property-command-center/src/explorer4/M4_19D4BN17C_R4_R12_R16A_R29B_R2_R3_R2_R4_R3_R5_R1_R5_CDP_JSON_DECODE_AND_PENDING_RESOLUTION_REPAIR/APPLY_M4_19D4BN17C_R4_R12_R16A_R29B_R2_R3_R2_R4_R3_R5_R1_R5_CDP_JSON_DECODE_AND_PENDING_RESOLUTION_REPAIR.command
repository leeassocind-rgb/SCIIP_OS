#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_CDP_JSON_DECODE_AND_PENDING_RESOLUTION_REPAIR"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R5-R1-R5 CDP JSON Decode + Pending Resolution Repair"
echo "============================================================"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r5_r1_r5.mjs"
echo "[2/2] Install inbound RFC6455 decode / pending response resolution and recertify Record 401"
python3 "$DEST/repair_and_recertify_r29b_r5_r1_r5.py" "$ROOT"
