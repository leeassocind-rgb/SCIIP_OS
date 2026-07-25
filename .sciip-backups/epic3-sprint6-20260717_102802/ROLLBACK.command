#!/bin/bash
set -euo pipefail
REPO="/Users/spencercasement/Desktop/SCIIP_OS"
BACKUP_ROOT="/Users/spencercasement/Desktop/SCIIP_OS/.sciip-backups/epic3-sprint6-20260717_102802"
if [[ -f "$BACKUP_ROOT/new-files.txt" ]]; then
  while IFS= read -r rel; do
    [[ -z "$rel" ]] && continue
    rm -f "$REPO/$rel"
  done < "$BACKUP_ROOT/new-files.txt"
fi
if [[ -d "$BACKUP_ROOT/original" ]]; then
  cd "$BACKUP_ROOT/original"
  find . -type f -print0 | while IFS= read -r -d '' file; do
    rel="${file#./}"
    mkdir -p "$REPO/$(dirname "$rel")"
    cp "$file" "$REPO/$rel"
  done
fi
echo "Sprint 6 rollback completed from $BACKUP_ROOT"
