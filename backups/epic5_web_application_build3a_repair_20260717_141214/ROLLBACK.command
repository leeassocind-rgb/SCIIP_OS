#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/backups/epic5_web_application_build3a_repair_20260717_141214"
for f in SCIIP_Application.gs SCIIP_Epic5_Web_App.html; do
  rm -f "$REPO/src/ui/$f"
  [ -f "$BACKUP/src/ui/$f" ] && cp "$BACKUP/src/ui/$f" "$REPO/src/ui/$f"
done
echo "Rollback complete."
