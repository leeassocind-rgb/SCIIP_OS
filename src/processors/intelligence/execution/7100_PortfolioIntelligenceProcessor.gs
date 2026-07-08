/**
 * SCIIP_OS v5.5 — 7100_PortfolioIntelligenceProcessor
 * Aggregates asset risk intelligence into portfolio-level executive intelligence.
 */
function sciipRun7100_PortfolioIntelligenceProcessor() {
  var cfg = {
    processorNumber: 7100,
    processorName: 'PortfolioIntelligence',
    layer: 'Portfolio Intelligence',
    sourceSheet: 'ASSET_RISK_INTELLIGENCE',
    targetSheet: 'PORTFOLIO_INTELLIGENCE',
    statusField: 'portfolioIntelligenceStatus',
    requiresSource: true,
    recommendation: 'Portfolio Intelligence produced for executive review.',
    successMessage: 'Aggregates asset risk intelligence into portfolio-level executive intelligence.',
    nextAction: 'Run 7110_PredictiveIntelligenceProcessor after this processor completes.'
  };
  return SCIIP_EXECUTIVE_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7100_PortfolioIntelligenceProcessor() {
  var result = sciipRun7100_PortfolioIntelligenceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7100_PortfolioIntelligenceProcessor', result: result }));
  return result;
}
