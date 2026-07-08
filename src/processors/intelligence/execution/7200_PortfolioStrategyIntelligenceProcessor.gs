/**
 * SCIIP_OS v5.5 — 7200_PortfolioStrategyIntelligenceProcessor
 * Aggregates asset strategies into portfolio-level strategic intelligence.
 */
function sciipRun7200_PortfolioStrategyIntelligenceProcessor() {
  var cfg = {
    processorNumber: 7200,
    processorName: 'PortfolioStrategyIntelligence',
    layer: 'Portfolio Strategy Intelligence',
    sourceSheet: 'ASSET_STRATEGY_INTELLIGENCE',
    targetSheet: 'PORTFOLIO_STRATEGY_INTELLIGENCE',
    statusField: 'portfolioStrategyIntelligenceStatus',
    requiresSource: false,
    recommendation: 'Portfolio Strategy Intelligence produced for strategic review.',
    successMessage: 'Aggregates asset strategies into portfolio-level strategic intelligence.',
    nextAction: 'Run 7210_CapitalAllocationIntelligenceProcessor after this processor completes.'
  };
  return SCIIP_STRATEGIC_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7200_PortfolioStrategyIntelligenceProcessor() {
  var result = sciipRun7200_PortfolioStrategyIntelligenceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7200_PortfolioStrategyIntelligenceProcessor', result: result }));
  return result;
}
