#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"; BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/backups/epic5_property_context_build2_20260717_134231"
rm -rf "$REPO/src/applications/property-command-center"
cp -R "$BACKUP/src/applications/property-command-center" "$REPO/src/applications/"
rm -f "$REPO/tools/tests/sciip-epic5-property-context-test.js" "$REPO/manifests/SCIIP_V7_EPIC5_PROPERTY_CONTEXT_ENGINE_BUILD2.json"
[ -f "$BACKUP/tools/tests/sciip-epic5-property-context-test.js" ] && cp "$BACKUP/tools/tests/sciip-epic5-property-context-test.js" "$REPO/tools/tests/"
[ -f "$BACKUP/manifests/SCIIP_V7_EPIC5_PROPERTY_CONTEXT_ENGINE_BUILD2.json" ] && cp "$BACKUP/manifests/SCIIP_V7_EPIC5_PROPERTY_CONTEXT_ENGINE_BUILD2.json" "$REPO/manifests/"
cp "$BACKUP/package.json" "$REPO/package.json"
echo "Rollback complete."
