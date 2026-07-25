/** SCIIP Testing Framework v4 explicit patch — Enterprise Judgment Execution 8360–8450 */
function sciipTest8360() { return sciipTest8360_EnterpriseJudgmentReadinessProcessor(); }
function sciipTest8370() { return sciipTest8370_EnterpriseJudgmentCriteriaProcessor(); }
function sciipTest8380() { return sciipTest8380_EnterpriseTradeoffEvaluationProcessor(); }
function sciipTest8390() { return sciipTest8390_EnterpriseRiskJudgmentProcessor(); }
function sciipTest8400() { return sciipTest8400_EnterprisePriorityJudgmentProcessor(); }
function sciipTest8410() { return sciipTest8410_EnterpriseConfidenceJudgmentProcessor(); }
function sciipTest8420() { return sciipTest8420_EnterpriseJudgmentGovernanceProcessor(); }
function sciipTest8430() { return sciipTest8430_EnterpriseJudgmentValidationProcessor(); }
function sciipTest8440() { return sciipTest8440_EnterpriseJudgmentCertificationProcessor(); }
function sciipTest8450() { return sciipTest8450_EnterpriseJudgmentAcceptanceProcessor(); }

function sciipTestRange8360_8450_EnterpriseJudgmentExecution() {
  return SCIIP_TEST.runRange(8360, 8450);
}
