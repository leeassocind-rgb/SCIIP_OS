#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R1_R1_POST_SYNTAX_REPAIR_RUNTIME_BOOTSTRAP_RESIDUAL_CAUSAL_DIAGNOSIS_AND_RECERTIFICATION"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29B-R1-R1 Post-Syntax-Repair Runtime Bootstrap Residual Diagnosis + Recertification"
echo "============================================================"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29b_r1_r1.mjs"
echo "[2/2] Diagnose runtime absence, bootstrap/revalidate SCIIP app, and rerun authoritative R29B"
python3 "$DEST/diagnose_and_recertify_r29b_r1_r1.py" "$ROOT"
echo "R29B-R1-R1 PACKAGE EXECUTION COMPLETE — paste complete output into ChatGPT."
