#!/bin/bash
set -euo pipefail
BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${SCIIP_OS_TARGET:-$HOME/Desktop/SCIIP_OS}"
if [ -f "$BACKUP_DIR/NEW_FILES.txt" ]; then while read -r REL; do [ -n "$REL" ] && rm -f "$TARGET/$REL"; done < "$BACKUP_DIR/NEW_FILES.txt"; fi
cd "$BACKUP_DIR"
find . -type f ! -name 'ROLLBACK.command' ! -name 'NEW_FILES.txt' | while read -r REL; do REL="${REL#./}"; mkdir -p "$TARGET/$(dirname "$REL")"; cp -p "$BACKUP_DIR/$REL" "$TARGET/$REL"; done
echo "Sprint 6 rollback completed."
