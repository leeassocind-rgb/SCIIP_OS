#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"; BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip_backups/epic5_build3d_20260717_145006"
FILES=(src/applications/property-command-center/SCIIP_Epic5_Approved_Commit_Refresh_Engine.gs tools/tests/sciip-epic5-approved-commit-refresh-test.js)
for rel in "${FILES[@]}"; do if [ -f "$BACKUP/$rel" ]; then mkdir -p "$REPO/$(dirname "$rel")"; cp "$BACKUP/$rel" "$REPO/$rel"; else rm -f "$REPO/$rel"; fi; done
cd "$REPO" && npm run deployment:compile
echo "Rollback complete."
