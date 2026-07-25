#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip-backups/v7_0_integration_sprint_12_20260716_105953"
if [ -f "$BACKUP/created.log" ]; then while IFS= read -r rel; do rm -f "$REPO/$rel"; done < "$BACKUP/created.log"; fi
if [ -d "$BACKUP/files" ]; then cd "$BACKUP/files"; find . -type f | while IFS= read -r rel; do rel="${rel#./}"; mkdir -p "$REPO/$(dirname "$rel")"; cp -p "$BACKUP/files/$rel" "$REPO/$rel"; done; fi
echo "Sprint 12 rollback complete."
