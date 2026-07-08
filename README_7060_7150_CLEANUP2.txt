SCIIP_OS v5.5 — 7060–7150 Executive Intelligence Cleanup Patch 2

Fixes the latest test failure:
TypeError: Cannot read properties of null (reading 'getSheetByName')

Root cause:
The processor shared helper used SpreadsheetApp.getActiveSpreadsheet(), which can return null when the runtime executes from a standalone Apps Script context. The patch uses SCIIP_RUNTIME.getSpreadsheet() / openById fallback instead.

Also preserves the prior runtime contract fix:
SCIIP_RUNTIME_PROCESSOR_BASE.run({ processor, action, buildPayload, execute, ... })

Run from repo root:
unzip -o ~/Downloads/SCIIP_OS_v5_5_7060_7150_EXECUTIVE_INTELLIGENCE_CLEANUP2.zip
chmod +x SCIIP_OS_v5_5_7060_7150_cleanup2.sh
./SCIIP_OS_v5_5_7060_7150_cleanup2.sh
clasp push

Then run:
sciipTestRange7060_7150_ExecutiveIntelligenceExecution()
