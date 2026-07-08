/**
 * SCIIP_OS v5.5 — 7080_MarketOpportunityScoringProcessor
 * Scores market opportunities for executive review using dashboard summaries.
 */
function sciipRun7080_MarketOpportunityScoringProcessor() {
  var cfg = {
    processorNumber: 7080,
    processorName: 'MarketOpportunityScoring',
    layer: 'Market Opportunity Scoring',
    sourceSheet: 'EXECUTIVE_DASHBOARD_SUMMARY',
    targetSheet: 'MARKET_OPPORTUNITY_SCORES',
    statusField: 'marketOpportunityScoringStatus',
    requiresSource: true,
    recommendation: 'Market Opportunity Scoring produced for executive review.',
    successMessage: 'Scores market opportunities for executive review using dashboard summaries.',
    nextAction: 'Run 7090_AssetRiskIntelligenceProcessor after this processor completes.'
  };
  return SCIIP_EXECUTIVE_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7080_MarketOpportunityScoringProcessor() {
  var result = sciipRun7080_MarketOpportunityScoringProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7080_MarketOpportunityScoringProcessor', result: result }));
  return result;
}
