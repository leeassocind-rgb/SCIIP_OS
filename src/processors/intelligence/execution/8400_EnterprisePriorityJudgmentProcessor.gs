/**
 * SCIIP_OS v5.5 — 8400_EnterprisePriorityJudgmentProcessor
 */
function sciipRun8400_EnterprisePriorityJudgmentProcessor() {
  var cfg = {
    processorNumber: 8400,
    processorName: 'EnterprisePriorityJudgment',
    layer: 'Enterprise Priority Judgment',
    sourceSheet: 'ENTERPRISE_RISK_JUDGMENT',
    targetSheet: 'ENTERPRISE_PRIORITY_JUDGMENT',
    statusField: 'enterprisePriorityJudgmentStatus',
    requiresSource: false,
    successMessage: 'Enterprise Priority Judgment completed for Enterprise Judgment Execution.',
    nextAction: 'Run 8410_EnterpriseConfidenceJudgmentProcessor after this processor completes.'
  };
  return SCIIP_ENTERPRISE_JUDGMENT_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest8400_EnterprisePriorityJudgmentProcessor() {
  var result = sciipRun8400_EnterprisePriorityJudgmentProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest8400_EnterprisePriorityJudgmentProcessor', result: result }));
  return result;
}
