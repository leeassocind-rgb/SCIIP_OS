/**
 * SCIIP_OS v5.5 — 8480_EnterpriseInsightSynthesisProcessor
 */
function sciipRun8480_EnterpriseInsightSynthesisProcessor() {
  var cfg = {
    processorNumber: 8480,
    processorName: 'EnterpriseInsightSynthesis',
    layer: 'Enterprise Insight Synthesis',
    sourceSheet: 'ENTERPRISE_SIGNAL_SYNTHESIS',
    targetSheet: 'ENTERPRISE_INSIGHT_SYNTHESIS',
    statusField: 'enterpriseInsightSynthesisStatus',
    requiresSource: false,
    successMessage: 'Enterprise Insight Synthesis completed for Enterprise Synthesis Execution.',
    nextAction: 'Run 8490_EnterpriseMarketSynthesisProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_SYNTHESIS_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8480_EnterpriseInsightSynthesisProcessor() {
  var result = sciipRun8480_EnterpriseInsightSynthesisProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8480_EnterpriseInsightSynthesisProcessor', result: result }));
  return result;
}
