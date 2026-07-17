#!/bin/bash
set -euo pipefail
TARGET="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip_backups/v7_0_sprint3f_test_restoration_20260715_175656"
for f in src/ui/SCIIP_Integration_Sprint3F_Tests.gs src/ui/SCIIP_Integration_Sprint3F_Wiring.gs tools/tests/sciip-integration-sprint3f-restoration-test.js; do
  if [ -f "$BACKUP/$f" ]; then mkdir -p "$TARGET/$(dirname \"$f\")"; cp "$BACKUP/$f" "$TARGET/$f"; fi
done
echo "Rollback complete."
