/**
 * SCIIP_OS v5.5 — 8390_EnterpriseRiskJudgmentProcessor
 */
function sciipRun8390_EnterpriseRiskJudgmentProcessor() {
  var cfg = {
    processorNumber: 8390,
    processorName: 'EnterpriseRiskJudgment',
    layer: 'Enterprise Risk Judgment',
    sourceSheet: 'ENTERPRISE_TRADEOFF_EVALUATION',
    targetSheet: 'ENTERPRISE_RISK_JUDGMENT',
    statusField: 'enterpriseRiskJudgmentStatus',
    requiresSource: false,
    successMessage: 'Enterprise Risk Judgment completed for Enterprise Judgment Execution.',
    nextAction: 'Run 8400_EnterprisePriorityJudgmentProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_JUDGMENT_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8390_EnterpriseRiskJudgmentProcessor() {
  var result = sciipRun8390_EnterpriseRiskJudgmentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8390_EnterpriseRiskJudgmentProcessor', result: result }));
  return result;
}
