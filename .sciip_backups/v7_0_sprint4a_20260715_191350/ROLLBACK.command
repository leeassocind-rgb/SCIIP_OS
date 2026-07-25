#!/bin/bash
set -euo pipefail
TARGET="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip_backups/v7_0_sprint4a_20260715_191350"
while IFS= read -r f; do [ -n "$f" ] && rm -f "$TARGET/$f"; done < "$BACKUP/NEW_FILES.txt" 2>/dev/null || true
for f in src/ui/SCIIP_CapabilityBuilder.gs src/ui/SCIIP_UnifiedScoringAnalytics.gs src/ui/SCIIP_IndustrialKnowledgeEngine.gs src/ui/SCIIP_IndustrialIntelligenceEngines.gs src/ui/SCIIP_IndustrialIntelligenceWorkspace.gs src/ui/SCIIP_Integration_Sprint4A_Wiring.gs src/ui/SCIIP_Integration_Sprint4A_Tests.gs tools/tests/sciip-integration-sprint4a-test.js .github/workflows/sciip-v7-integration-sprint4a.yml; do if [ -f "$BACKUP/$f" ]; then mkdir -p "$TARGET/$(dirname "$f")"; cp "$BACKUP/$f" "$TARGET/$f"; fi; done
echo "Rollback complete."
