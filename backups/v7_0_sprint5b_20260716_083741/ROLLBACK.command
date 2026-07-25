#!/bin/bash
set -euo pipefail
PROJECT="${SCIIP_PROJECT_DIR:-$HOME/Desktop/SCIIP_OS}"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/backups/v7_0_sprint5b_20260716_083741"
cp -R "$BACKUP/src/." "$PROJECT/src/" 2>/dev/null || true
echo "Rollback completed from $BACKUP"
