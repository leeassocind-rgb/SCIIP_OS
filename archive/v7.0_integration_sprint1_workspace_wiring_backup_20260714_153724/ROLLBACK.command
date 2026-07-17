#!/bin/bash
set -euo pipefail
TARGET="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/archive/v7.0_integration_sprint1_workspace_wiring_backup_20260714_153724"
if [[ -f "$BACKUP/.new_files" ]]; then
  while IFS= read -r rel; do rm -f "$TARGET/$rel"; done < "$BACKUP/.new_files"
fi
find "$BACKUP" -type f ! -name 'ROLLBACK.command' ! -name '.new_files' | while IFS= read -r file; do
  rel="${file#$BACKUP/}"
  mkdir -p "$TARGET/$(dirname "$rel")"
  cp -p "$file" "$TARGET/$rel"
done
echo "Rollback complete. Recompile and deploy with: cd \"$TARGET\" && npm run deployment:push"
