#!/bin/bash
set -euo pipefail
ROOT="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip_backups/sprint17_20260716_122330"
if [ -f "$BACKUP/NEW_FILES.txt" ]; then while read -r rel; do rm -f "$ROOT/$rel"; done < "$BACKUP/NEW_FILES.txt"; fi
cd "$BACKUP"
find . -type f ! -name NEW_FILES.txt ! -name ROLLBACK.command | while read -r rel; do rel="${rel#./}"; mkdir -p "$ROOT/$(dirname "$rel")"; cp -p "$BACKUP/$rel" "$ROOT/$rel"; done
echo "Sprint 17 rollback completed."
