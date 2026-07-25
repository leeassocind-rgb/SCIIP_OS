#!/bin/bash
set -euo pipefail
REPO_DIR="${SCIIP_OS_REPO:-$HOME/Desktop/SCIIP_OS}"
cd "$REPO_DIR"
node tools/sciip-architecture-governance.js
