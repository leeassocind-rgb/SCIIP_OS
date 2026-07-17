#!/bin/bash
set -euo pipefail
cp -p "/Users/spencercasement/Desktop/SCIIP_OS/archive/v7_0_integration_sprint_1d_context_conflict_hotfix_20260714_184424/src/ui/SCIIP_ContextIntegrity.gs" "/Users/spencercasement/Desktop/SCIIP_OS/src/ui/SCIIP_ContextIntegrity.gs"
cp -p "/Users/spencercasement/Desktop/SCIIP_OS/archive/v7_0_integration_sprint_1d_context_conflict_hotfix_20260714_184424/src/ui/SCIIP_Integration_Sprint1D_Tests.gs" "/Users/spencercasement/Desktop/SCIIP_OS/src/ui/SCIIP_Integration_Sprint1D_Tests.gs"
echo "Sprint 1D conflict-resolution hotfix rolled back. Review git status before deployment."
