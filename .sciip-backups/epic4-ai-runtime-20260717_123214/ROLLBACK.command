#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"; BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip-backups/epic4-ai-runtime-20260717_123214"
while IFS= read -r rel; do [ -z "$rel" ] || { mkdir -p "$REPO/$(dirname "$rel")"; cp "$BACKUP/$rel" "$REPO/$rel"; }; done < "$BACKUP/touched-files.txt"
while IFS= read -r rel; do [ -z "$rel" ] || rm -f "$REPO/$rel"; done < "$BACKUP/new-files.txt"
echo "Epic 4 AI Runtime rollback completed."
