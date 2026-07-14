/**
 * SCIIP_OS v5.5 — 8370_EnterpriseJudgmentCriteriaProcessor
 */
function sciipRun8370_EnterpriseJudgmentCriteriaProcessor() {
  var cfg = {
    processorNumber: 8370,
    processorName: 'EnterpriseJudgmentCriteria',
    layer: 'Enterprise Judgment Criteria',
    sourceSheet: 'ENTERPRISE_JUDGMENT_READINESS',
    targetSheet: 'ENTERPRISE_JUDGMENT_CRITERIA',
    statusField: 'enterpriseJudgmentCriteriaStatus',
    requiresSource: false,
    successMessage: 'Enterprise Judgment Criteria completed for Enterprise Judgment Execution.',
    nextAction: 'Run 8380_EnterpriseTradeoffEvaluationProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_JUDGMENT_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8370_EnterpriseJudgmentCriteriaProcessor() {
  var result = sciipRun8370_EnterpriseJudgmentCriteriaProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8370_EnterpriseJudgmentCriteriaProcessor', result: result }));
  return result;
}
