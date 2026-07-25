#!/bin/bash
set -euo pipefail
TARGET="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip_backups/v7_0_sprint4b_20260716_073905"
while IFS= read -r f; do [ -n "$f" ] && rm -f "$TARGET/$f"; done < "$BACKUP/NEW_FILES.txt" 2>/dev/null || true
for f in src/ui/SCIIP_PlatformRegistry.gs src/ui/SCIIP_PlatformAdapters.gs src/ui/SCIIP_PlatformSelfAssembly.gs src/ui/SCIIP_PlatformCertifier.gs src/ui/SCIIP_Integration_Sprint4B_Wiring.gs src/ui/SCIIP_Integration_Sprint4B_Tests.gs tools/tests/sciip-integration-sprint4b-test.js .github/workflows/sciip-v7-integration-sprint4b.yml; do if [ -f "$BACKUP/$f" ]; then mkdir -p "$TARGET/$(dirname "$f")"; cp "$BACKUP/$f" "$TARGET/$f"; fi; done
echo "Rollback complete."
