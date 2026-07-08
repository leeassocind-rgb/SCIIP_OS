SCIIP_OS v5.5 — 7060–7150 Executive Intelligence Cleanup Patch

This is a surgical repo cleanup based on SCIIP_OS(16).zip.

Fixes:
1. Updates 7060_7150_ExecutiveIntelligenceExecutionShared.gs in both current duplicate paths:
   - src/processors/intelligence/execution/
   - src/processors/intelligence/executive/

2. Replaces the bad runtime call:
   SCIIP_RUNTIME_PROCESSOR_BASE.run({ processorNumber, processorName, execute })

   with the runtime v5.2 contract:
   SCIIP_RUNTIME_PROCESSOR_BASE.run({ processor, action, sourceSheet, targetSheet, ledgerSheet, buildPayload, validate, execute })

3. Keeps explicit Testing Framework v4 wrappers:
   SCIIP_TEST.runRange(7060, 7150)
   SCIIP_TEST.runRange(7060, 7100)
   SCIIP_TEST.runRange(7110, 7150)

Recommended workflow from SCIIP_OS repo root:

unzip -o ~/Downloads/SCIIP_OS_v5_5_7060_7150_EXECUTIVE_INTELLIGENCE_REPO_CLEANUP_PATCH.zip
chmod +x SCIIP_OS_v5_5_7060_7150_cleanup.sh
./SCIIP_OS_v5_5_7060_7150_cleanup.sh
clasp push

Then run:
sciipTestRange7060_7150_ExecutiveIntelligenceExecution()

Note: The cleanup script removes the duplicate noncanonical folder:
src/processors/intelligence/executive/

The canonical folder retained is:
src/processors/intelligence/execution/
