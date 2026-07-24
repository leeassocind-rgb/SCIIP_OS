#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"; BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip-backups/epic4-sprint1-20260717_121353"
while IFS= read -r rel; do [ -z "$rel" ] || { mkdir -p "$REPO/$(dirname "$rel")"; cp "$BACKUP/$rel" "$REPO/$rel"; }; done < "$BACKUP/touched-files.txt"
while IFS= read -r rel; do [ -z "$rel" ] || rm -f "$REPO/$rel"; done < "$BACKUP/new-files.txt"
echo "Epic 4 Sprint 1 rollback completed."
