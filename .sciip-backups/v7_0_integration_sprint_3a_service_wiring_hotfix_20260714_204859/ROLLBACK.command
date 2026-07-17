#!/bin/bash
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"
R="$(cd "$B/../.." && pwd)"
while IFS='|' read -r action rel; do
  if [[ "$action" == "REPLACE" ]]; then mkdir -p "$R/$(dirname "$rel")"; cp -p "$B/original/$rel" "$R/$rel";
  elif [[ "$action" == "ADD" ]]; then rm -f "$R/$rel"; fi
done < "$B/actions.log"
echo "Rollback complete: $B"
