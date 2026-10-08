#!/bin/bash
set -euo pipefail
ROOT="${1:-}"; [ -n "$ROOT" ] || { echo "usage: $0 <SCIIP_OS-root>"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_R1_CDP_FRESH_PAGE_CREATION_METHOD_REPAIR_AND_LIVE_INVENTORY_RECERTIFICATION"
mkdir -p "$DEST"
find "$HERE" -maxdepth 1 -type f -exec cp {} "$DEST"/ \;
echo "[1/2] Static certification"
node "$DEST/test_r29a_r1_r5_r1.mjs"
echo "[2/2] Repair CDP fresh-page creation method and recertify targeted live inventory"
python3 "$DEST/repair_r29a_r1_r5_r1.py" "$ROOT"
