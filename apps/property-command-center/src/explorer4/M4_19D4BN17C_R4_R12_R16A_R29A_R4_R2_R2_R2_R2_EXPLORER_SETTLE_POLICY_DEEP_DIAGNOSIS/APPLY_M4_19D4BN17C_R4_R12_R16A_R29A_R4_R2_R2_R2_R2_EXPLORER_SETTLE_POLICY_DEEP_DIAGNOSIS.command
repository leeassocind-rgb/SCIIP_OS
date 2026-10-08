#!/bin/bash
set -euo pipefail
ROOT="${1:-}"; [ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R2_EXPLORER_SETTLE_POLICY_DEEP_DIAGNOSIS"
mkdir -p "$DEST"
cp "$HERE/"* "$DEST/" 2>/dev/null || true
echo "============================================================"
echo "SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R2 Explorer Settle Policy Deep Diagnosis"
echo "============================================================"
echo "Live UI interaction: OFF"
echo "Export invocation: OFF"
echo "[1/2] Static certification"
node "$DEST/test_r29a_r4_r2_r2_r2_r2.mjs"
echo "[2/2] Separate app HTTP reachability, CDP target state, navigation outcome, and Explorer settle state"
python3 "$DEST/diagnose_r29a_r4_r2_r2_r2_r2.py" "$ROOT"
