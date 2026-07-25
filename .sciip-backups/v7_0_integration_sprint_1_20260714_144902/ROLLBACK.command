#!/bin/bash
set -euo pipefail
BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$BACKUP_DIR/../.." && pwd)"
while IFS='|' read -r action rel; do
  if [ "$action" = "REPLACE" ]; then mkdir -p "$REPO/$(dirname "$rel")"; cp -p "$BACKUP_DIR/original/$rel" "$REPO/$rel"
  elif [ "$action" = "ADD" ]; then rm -f "$REPO/$rel"; fi
done < "$BACKUP_DIR/actions.log"
echo "Rollback complete: $BACKUP_DIR"
