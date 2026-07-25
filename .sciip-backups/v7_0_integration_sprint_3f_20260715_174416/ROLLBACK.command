#!/bin/bash
set -euo pipefail
B="$(cd "$(dirname "$0")" && pwd)"; R="$(cd "$B/../.." && pwd)"; tac "$B/actions.log" | while IFS='|' read -r action rel; do if [[ "$action" == REPLACE ]]; then mkdir -p "$R/$(dirname "$rel")"; cp -p "$B/original/$rel" "$R/$rel"; else rm -f "$R/$rel"; fi; done; echo "Rollback complete: $B"
