#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
BACKUP="${1:-.sciip-backups/epic3-sprint5-preinstall}"
for f in src/ui/SCIIP_Application.gs src/ui/SCIIP_Application_Shell.html package.json; do
  [[ -f "$BACKUP/$f" ]] || { echo "Backup file not found: $BACKUP/$f" >&2; exit 1; }
  cp "$BACKUP/$f" "$f"
done
rm -rf src/applications/relationship-intelligence
rm -f tools/tests/sciip-epic3-sprint5-test.js manifests/SCIIP_V7_EPIC3_SPRINT5_RELATIONSHIP_INTELLIGENCE.json docs/releases/SCIIP_V7_EPIC3_SPRINT5_README.md
node tools/sciip-deployment-compiler-v2.js --force
printf '%s\n' 'Epic 3 Sprint 5 rollback restored and compiler-validated.'
