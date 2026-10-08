#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R1_CDP_OPEN_POST_REPAIR_RESIDUAL_DIAGNOSIS_AND_NET_IMPORT_REPAIR"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B R5-R1-R1 CDP Open Post-Repair Residual Diagnosis + Net Import Repair"
echo "============================================================"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r5_r1_r1.mjs"
echo "[2/2] Consume exact net ReferenceError, repair node:net binding, and recertify Record 401"
python3 "$DEST/diagnose_and_repair_r29b_r5_r1_r1.py" "$ROOT"
