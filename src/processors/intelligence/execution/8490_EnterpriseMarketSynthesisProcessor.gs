/**
 * SCIIP_OS v5.5 — 8490_EnterpriseMarketSynthesisProcessor
 */
function sciipRun8490_EnterpriseMarketSynthesisProcessor() {
  var cfg = {
    processorNumber: 8490,
    processorName: 'EnterpriseMarketSynthesis',
    layer: 'Enterprise Market Synthesis',
    sourceSheet: 'ENTERPRISE_INSIGHT_SYNTHESIS',
    targetSheet: 'ENTERPRISE_MARKET_SYNTHESIS',
    statusField: 'enterpriseMarketSynthesisStatus',
    requiresSource: false,
    successMessage: 'Enterprise Market Synthesis completed for Enterprise Synthesis Execution.',
    nextAction: 'Run 8500_EnterpriseAssetSynthesisProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_SYNTHESIS_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8490_EnterpriseMarketSynthesisProcessor() {
  var result = sciipRun8490_EnterpriseMarketSynthesisProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8490_EnterpriseMarketSynthesisProcessor', result: result }));
  return result;
}
