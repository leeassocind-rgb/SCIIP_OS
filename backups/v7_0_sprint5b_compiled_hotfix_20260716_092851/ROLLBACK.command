#!/bin/bash
set -euo pipefail
PROJECT="${SCIIP_PROJECT_DIR:-$HOME/Desktop/SCIIP_OS}"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/backups/v7_0_sprint5b_compiled_hotfix_20260716_092851"
cp "$BACKUP/src/ui/integration/SCIIP_Autonomous_Opportunity_Orchestrator.gs"    "$PROJECT/src/ui/integration/SCIIP_Autonomous_Opportunity_Orchestrator.gs"
cp "$BACKUP/src/tests/SCIIP_TestingFramework_v7_IntegrationSprint5B.gs"    "$PROJECT/src/tests/SCIIP_TestingFramework_v7_IntegrationSprint5B.gs"
echo "Rollback completed."
