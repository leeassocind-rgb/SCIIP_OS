#!/bin/bash
set -euo pipefail
TARGET="/Users/spencercasement/Desktop/SCIIP_OS"; BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip_backups/v7_0_sprint5a_20260716_080014"
while IFS= read -r f; do [ -n "$f" ] && rm -f "$TARGET/$f"; done < "$BACKUP/NEW_FILES.txt" 2>/dev/null || true
for f in src/ui/SCIIP_AutonomousMarketMonitor.gs src/ui/SCIIP_AutonomousIndustrialScoring.gs src/ui/SCIIP_AutonomousMatchingAndSelection.gs src/ui/SCIIP_AutonomousExecutiveBriefing.gs src/ui/SCIIP_Integration_Sprint5A_Wiring.gs src/ui/SCIIP_Integration_Sprint5A_Tests.gs tools/tests/sciip-integration-sprint5a-test.js .github/workflows/sciip-v7-integration-sprint5a.yml; do if [ -f "$BACKUP/$f" ]; then mkdir -p "$TARGET/$(dirname "$f")"; cp "$BACKUP/$f" "$TARGET/$f"; fi; done
echo "Rollback complete."
