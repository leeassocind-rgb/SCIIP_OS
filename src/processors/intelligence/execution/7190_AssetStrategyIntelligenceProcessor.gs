/**
 * SCIIP_OS v5.5 — 7190_AssetStrategyIntelligenceProcessor
 * Produces asset-level strategy intelligence from market thesis outputs.
 */
function sciipRun7190_AssetStrategyIntelligenceProcessor() {
  var cfg = {
    processorNumber: 7190,
    processorName: 'AssetStrategyIntelligence',
    layer: 'Asset Strategy Intelligence',
    sourceSheet: 'MARKET_THESIS_INTELLIGENCE',
    targetSheet: 'ASSET_STRATEGY_INTELLIGENCE',
    statusField: 'assetStrategyIntelligenceStatus',
    requiresSource: false,
    recommendation: 'Asset Strategy Intelligence produced for strategic review.',
    successMessage: 'Produces asset-level strategy intelligence from market thesis outputs.',
    nextAction: 'Run 7200_PortfolioStrategyIntelligenceProcessor after this processor completes.'
  };
  return SCIIP_STRATEGIC_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7190_AssetStrategyIntelligenceProcessor() {
  var result = sciipRun7190_AssetStrategyIntelligenceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7190_AssetStrategyIntelligenceProcessor', result: result }));
  return result;
}
