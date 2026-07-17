#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/.sciip-backups/v7_0_integration_sprint_11_20260716_105127"
if [ -f "$BACKUP/new-files.txt" ]; then while IFS= read -r rel; do rm -f "$REPO/$rel"; done < "$BACKUP/new-files.txt"; fi
if [ -d "$BACKUP/files" ]; then cp -R "$BACKUP/files/." "$REPO/"; fi
echo "Sprint 11 rollback completed."
