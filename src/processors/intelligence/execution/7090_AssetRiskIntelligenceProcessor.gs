/**
 * SCIIP_OS v5.5 — 7090_AssetRiskIntelligenceProcessor
 * Produces executive asset risk intelligence from scored opportunities.
 */
function sciipRun7090_AssetRiskIntelligenceProcessor() {
  var cfg = {
    processorNumber: 7090,
    processorName: 'AssetRiskIntelligence',
    layer: 'Asset Risk Intelligence',
    sourceSheet: 'MARKET_OPPORTUNITY_SCORES',
    targetSheet: 'ASSET_RISK_INTELLIGENCE',
    statusField: 'assetRiskIntelligenceStatus',
    requiresSource: true,
    recommendation: 'Asset Risk Intelligence produced for executive review.',
    successMessage: 'Produces executive asset risk intelligence from scored opportunities.',
    nextAction: 'Run 7100_PortfolioIntelligenceProcessor after this processor completes.'
  };
  return SCIIP_EXECUTIVE_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7090_AssetRiskIntelligenceProcessor() {
  var result = sciipRun7090_AssetRiskIntelligenceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7090_AssetRiskIntelligenceProcessor', result: result }));
  return result;
}
