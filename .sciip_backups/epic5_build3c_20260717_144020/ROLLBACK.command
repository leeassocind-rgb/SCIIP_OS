#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip_backups/epic5_build3c_20260717_144020"
FILES=(
  src/applications/property-command-center/SCIIP_Epic5_Live_Ingestion_Review_Workflow.gs
  src/ui/SCIIP_Application.gs
  src/ui/SCIIP_Epic5_Web_App.html
  tools/tests/sciip-epic5-live-data-review-workflow-test.js
)
for rel in "${FILES[@]}"; do
  if [ -f "$BACKUP/$rel" ]; then mkdir -p "$REPO/$(dirname "$rel")"; cp "$BACKUP/$rel" "$REPO/$rel"; else rm -f "$REPO/$rel"; fi
done
cd "$REPO" && npm run deployment:compile
echo "Rollback complete."
