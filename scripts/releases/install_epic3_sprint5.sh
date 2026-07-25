#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
node tools/tests/sciip-epic3-sprint5-test.js
node tools/sciip-deployment-compiler-v2.js
printf '%s\n' 'Epic 3 Sprint 5 installed and compiler-validated. Deploy with npm run deployment:push.'
