#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R1_RAW_WEBSOCKET_HTTP_UPGRADE_SYNTAX_ONLY_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R2-R1 Raw WebSocket HTTP Upgrade Syntax-Only Repair + Non-Export Recertification"
echo "============================================================"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r2_r1.mjs"
echo "[2/2] Repair exact HTTP upgrade syntax surface, node-check, and rerun authoritative R29B"
python3 "$DEST/repair_r29b_r2_r1.py" "$ROOT"
echo "R29B-R2-R1 PACKAGE EXECUTION COMPLETE — paste complete output into ChatGPT."
