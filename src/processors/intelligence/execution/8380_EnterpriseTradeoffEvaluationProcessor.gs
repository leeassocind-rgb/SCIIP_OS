/**
 * SCIIP_OS v5.5 — 8380_EnterpriseTradeoffEvaluationProcessor
 */
function sciipRun8380_EnterpriseTradeoffEvaluationProcessor() {
  var cfg = {
    processorNumber: 8380,
    processorName: 'EnterpriseTradeoffEvaluation',
    layer: 'Enterprise Tradeoff Evaluation',
    sourceSheet: 'ENTERPRISE_JUDGMENT_CRITERIA',
    targetSheet: 'ENTERPRISE_TRADEOFF_EVALUATION',
    statusField: 'enterpriseTradeoffEvaluationStatus',
    requiresSource: false,
    successMessage: 'Enterprise Tradeoff Evaluation completed for Enterprise Judgment Execution.',
    nextAction: 'Run 8390_EnterpriseRiskJudgmentProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_JUDGMENT_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8380_EnterpriseTradeoffEvaluationProcessor() {
  var result = sciipRun8380_EnterpriseTradeoffEvaluationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8380_EnterpriseTradeoffEvaluationProcessor', result: result }));
  return result;
}
