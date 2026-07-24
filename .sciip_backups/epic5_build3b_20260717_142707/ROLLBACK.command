#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip_backups/epic5_build3b_20260717_142707"
for rel in   src/applications/property-command-center/SCIIP_Epic5_SuperSheet_Ingestion_Center.gs   src/ui/SCIIP_Application.gs   src/ui/SCIIP_Epic5_Web_App.html   tools/tests/sciip-epic5-supersheet-ingestion-center-test.js; do
  if [ -f "$BACKUP/$rel" ]; then mkdir -p "$REPO/$(dirname \"$rel\")"; cp "$BACKUP/$rel" "$REPO/$rel"; else rm -f "$REPO/$rel"; fi
done
cd "$REPO" && npm run deployment:compile
echo "Rollback complete."
