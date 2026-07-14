/**
 * SCIIP_OS v5.5 — 8290_EnterpriseCausalReasoningProcessor
 */
function sciipRun8290_EnterpriseCausalReasoningProcessor() {
  var cfg = {
    processorNumber: 8290,
    processorName: 'EnterpriseCausalReasoning',
    layer: 'Enterprise Causal Reasoning',
    sourceSheet: 'ENTERPRISE_INFERENCE_MAPPING',
    targetSheet: 'ENTERPRISE_CAUSAL_REASONING',
    statusField: 'enterpriseCausalReasoningStatus',
    requiresSource: false,
    successMessage: 'Enterprise Causal Reasoning completed for Enterprise Reasoning Execution.',
    nextAction: 'Run 8300_EnterpriseScenarioReasoningProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_REASONING_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8290_EnterpriseCausalReasoningProcessor() {
  var result = sciipRun8290_EnterpriseCausalReasoningProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8290_EnterpriseCausalReasoningProcessor', result: result }));
  return result;
}
