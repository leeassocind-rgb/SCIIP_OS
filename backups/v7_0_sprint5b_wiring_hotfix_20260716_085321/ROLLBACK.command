#!/bin/bash
set -euo pipefail
PROJECT="${SCIIP_PROJECT_DIR:-$HOME/Desktop/SCIIP_OS}"
BACKUP="/Users/spencercasement/Desktop/SCIIP_OS/backups/v7_0_sprint5b_wiring_hotfix_20260716_085321"
if [ -f "$BACKUP/src/ui/integration/SCIIP_Autonomous_Opportunity_Orchestrator.gs" ]; then
  cp "$BACKUP/src/ui/integration/SCIIP_Autonomous_Opportunity_Orchestrator.gs"      "$PROJECT/src/ui/integration/SCIIP_Autonomous_Opportunity_Orchestrator.gs"
fi
if [ -f "$BACKUP/src/tests/SCIIP_TestingFramework_v7_IntegrationSprint5B_WiringHotfix.gs" ]; then
  cp "$BACKUP/src/tests/SCIIP_TestingFramework_v7_IntegrationSprint5B_WiringHotfix.gs"      "$PROJECT/src/tests/SCIIP_TestingFramework_v7_IntegrationSprint5B_WiringHotfix.gs"
else
  rm -f "$PROJECT/src/tests/SCIIP_TestingFramework_v7_IntegrationSprint5B_WiringHotfix.gs"
fi
echo "Rollback completed from $BACKUP"
