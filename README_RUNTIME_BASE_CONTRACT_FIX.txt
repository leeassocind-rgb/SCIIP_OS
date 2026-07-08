SCIIP_OS v5.5 — Executive Intelligence Runtime Base Contract Fix

Fixes 7060–7150 validation failures:
- UNKNOWN_PROCESSOR
- Missing processor.
- Missing action.

Root cause:
The shared helper called SCIIP_RUNTIME_PROCESSOR_BASE.run with { processorNumber, processorName, execute }.
The active runtime framework validates { processor, action }.

Patch:
Replaces runWithRuntimeBase to call:
SCIIP_RUNTIME_PROCESSOR_BASE.run({
  processor: cfg.processorNumber + '_' + cfg.processorName,
  action: function(runtimeContext) { return ns.execute(cfg); }
});

Push:
unzip -o ~/Downloads/SCIIP_OS_v5_5_7060_7150_Executive_Intelligence_RUNTIME_BASE_FIX.zip
clasp push

Test:
sciipTestRange7060_7150_ExecutiveIntelligenceExecution();
