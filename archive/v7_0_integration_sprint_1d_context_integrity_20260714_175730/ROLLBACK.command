#!/bin/bash
set -euo pipefail
TARGET="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/archive/v7_0_integration_sprint_1d_context_integrity_20260714_175730"
for rel in   "src/ui/SCIIP_ContextIntegrity.gs"   "src/ui/SCIIP_ContextIntegrityClient.html"   "src/ui/SCIIP_Integration_Sprint1D_Tests.gs"   "tools/tests/sciip-integration-sprint1-context-integrity-v7-test.js"   ".github/workflows/sciip-v7-integration-sprint1-context-integrity.yml"; do
  if [[ -e "$BACKUP/$rel" ]]; then
    mkdir -p "$TARGET/$(dirname \"$rel\")"
    cp -p "$BACKUP/$rel" "$TARGET/$rel"
  else
    rm -f "$TARGET/$rel"
  fi
done
cp -p "$BACKUP/package.json" "$TARGET/package.json"
cp -p "$BACKUP/src/ui/SCIIP_UI_Shell.html" "$TARGET/src/ui/SCIIP_UI_Shell.html"
echo "Sprint 1D rolled back. Review git status before deployment."
