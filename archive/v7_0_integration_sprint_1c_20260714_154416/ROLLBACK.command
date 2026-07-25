#!/bin/bash
set -euo pipefail
cp -R "/Users/spencercasement/Desktop/SCIIP_OS/archive/v7_0_integration_sprint_1c_20260714_154416/." "/Users/spencercasement/Desktop/SCIIP_OS/"
rm -f "/Users/spencercasement/Desktop/SCIIP_OS/src/ui/SCIIP_ContextContinuity.gs" "/Users/spencercasement/Desktop/SCIIP_OS/src/ui/SCIIP_ContextContinuityClient.html" "/Users/spencercasement/Desktop/SCIIP_OS/tools/tests/sciip-integration-sprint1-context-continuity-v7-test.js" "/Users/spencercasement/Desktop/SCIIP_OS/.github/workflows/sciip-v7-integration-sprint1-context-continuity.yml"
echo "Rollback files restored. Review git status before deployment."
