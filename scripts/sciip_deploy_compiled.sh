#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node tools/sciip-deployment-compiler.js
cd dist/apps-script
clasp push -f
