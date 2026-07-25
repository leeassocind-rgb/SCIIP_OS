#!/usr/bin/env bash
set -euo pipefail
ARCHIVE="${1:?Usage: sciip_repository_restore.sh <checkpoint.tar.gz> <restore-directory>}"
DEST="${2:?Usage: sciip_repository_restore.sh <checkpoint.tar.gz> <restore-directory>}"
[[ -f "$ARCHIVE" ]] || { echo "Checkpoint not found: $ARCHIVE" >&2; exit 2; }
mkdir -p "$DEST"
tar -xzf "$ARCHIVE" -C "$DEST"
ROOT="$(find "$DEST" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
[[ -n "$ROOT" && -f "$ROOT/RECOVERY_MANIFEST.sha256" ]] || { echo "Recovery manifest missing" >&2; exit 3; }
(
  cd "$ROOT"
  shasum -a 256 -c RECOVERY_MANIFEST.sha256 >/dev/null
)
printf '%s\n' "$ROOT"
