#!/bin/bash
set -euo pipefail
ROOT="${1:-}"; [ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_PRIOR200_SELECTION_KEY_NORMALIZATION_REPAIR_AND_SELECTOR_RECERTIFICATION"
mkdir -p "$DEST"; cp "$HERE/"* "$DEST/" 2>/dev/null || true
echo "[1/2] Static certification"; node "$DEST/test_r29a_r4_r2_r2_r2_r3_r2.mjs"
echo "[2/2] Apply diagnosed selector-only normalization repair and rerun authoritative R29A selector"
python3 "$DEST/repair_r29a_r4_r2_r2_r2_r3_r2.py" "$ROOT"
