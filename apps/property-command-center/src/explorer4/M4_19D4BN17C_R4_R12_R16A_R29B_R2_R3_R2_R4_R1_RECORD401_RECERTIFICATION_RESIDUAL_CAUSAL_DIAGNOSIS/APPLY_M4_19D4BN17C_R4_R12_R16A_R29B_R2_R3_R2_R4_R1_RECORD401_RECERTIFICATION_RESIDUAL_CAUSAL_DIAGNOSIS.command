#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R1_RECORD401_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R1 Record 401 Recertification Residual Causal Diagnosis"
echo "============================================================"
echo "Live UI interaction: OFF"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r2_r3_r2_r4_r1.mjs"
echo "[2/2] Diagnose Node exit-13 unresolved-await residual without replay"
node "$DEST/diagnose_r29b_r2_r3_r2_r4_r1.mjs" "$ROOT"
