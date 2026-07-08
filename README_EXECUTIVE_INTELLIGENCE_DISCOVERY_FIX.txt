SCIIP_OS v5.5 Executive Intelligence 7060–7150 Discovery Fix

Why this patch exists:
The prior test run showed ProcessorRange_7060_7150 executed but discovered 0 tests and reported missing 7060–7150 test functions.

Fix:
1. Processor files are placed under the canonical path used by the Industrial Intelligence subsystem:
   src/processors/intelligence/execution/
2. Explicit public test aliases sciipTest7060() through sciipTest7150() are added.
3. Range wrappers continue to explicitly call SCIIP_TEST.runRange(7060, 7150).

Push workflow:
unzip -o ~/Downloads/SCIIP_OS_v5_5_7060_7150_Executive_Intelligence_DISCOVERY_FIX.zip
clasp push

Verify locally before push, if desired:
grep -R "function sciipTest7060" src/processors src/tests
grep -R "function sciipTest7150" src/processors src/tests

Run in Apps Script:
sciipTestRange7060_7150_ExecutiveIntelligenceExecution();
