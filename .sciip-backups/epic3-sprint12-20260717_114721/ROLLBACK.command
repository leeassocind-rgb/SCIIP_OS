#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"; BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip-backups/epic3-sprint12-20260717_114721"
while IFS= read -r rel; do [ -z "$rel" ] || { mkdir -p "$REPO/$(dirname "$rel")"; cp "$BACKUP/$rel" "$REPO/$rel"; }; done < "$BACKUP/touched-files.txt"
while IFS= read -r rel; do [ -z "$rel" ] || rm -f "$REPO/$rel"; done < "$BACKUP/new-files.txt"
echo "Sprint 12 rollback completed."
