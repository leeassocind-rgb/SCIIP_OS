#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node tools/sciip-deployment-compiler-v2.js
node tools/tests/sciip-deployment-compiler-v2-test.js
cd dist/apps-script
clasp push -f
