#!/bin/bash
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
R="$(cd "$B/../.." && pwd)"
while IFS='|' read -r action rel; do
  [[ "$action" == "REPLACE" ]] || continue
  mkdir -p "$R/$(dirname "$rel")"
  cp -p "$B/original/$rel" "$R/$rel"
done < "$B/actions.log"
echo "Rollback complete: $B"
