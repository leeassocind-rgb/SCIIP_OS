#!/bin/bash
set -euo pipefail
ROOT="${1:-}"
[ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_POST_KEY_EXTRACTION_SELECTOR_INVOCATION_ARGUMENT_REPAIR_AND_RECERTIFICATION"
mkdir -p "$DEST"
cp "$HERE/"* "$DEST/" 2>/dev/null || true
echo "[1/2] Static certification"
node "$DEST/test_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1.mjs"
echo "[2/2] Invoke already-repaired authoritative R29A selector with required repository-root argv[1]"
python3 "$DEST/run_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1.py" "$ROOT"
