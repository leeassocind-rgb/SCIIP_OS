#!/usr/bin/env bash
set -euo pipefail
ROOT="${SCIIP_REPOSITORY_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
OUT="${1:-$ROOT/.recovery/checkpoints}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
NAME="SCIIP_OS_checkpoint_${STAMP}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT" "$WORK/$NAME"
rsync -a --delete \
  --exclude '.git/' --exclude 'node_modules/' --exclude 'archive/' \
  --exclude '.recovery/' --exclude 'dist/' --exclude 'coverage/' \
  "$ROOT/" "$WORK/$NAME/"
(
  cd "$WORK/$NAME"
  find . -type f ! -name 'RECOVERY_MANIFEST.sha256' -print0 | sort -z | xargs -0 shasum -a 256 > RECOVERY_MANIFEST.sha256
)
tar -C "$WORK" -czf "$OUT/$NAME.tar.gz" "$NAME"
shasum -a 256 "$OUT/$NAME.tar.gz" > "$OUT/$NAME.tar.gz.sha256"
printf '%s\n' "$OUT/$NAME.tar.gz"
