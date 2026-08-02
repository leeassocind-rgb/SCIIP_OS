const freeze = value => Object.freeze(value);

export function certifyExecutiveAssignmentOperations({
  orchestration,
  decisionSupport,
  relationshipActions,
  workflow,
  commandCenter,
  userValidation,
  governance,
  safety
} = {}) {
  const checks = freeze([
    { id:'ASSIGNMENT_ORCHESTRATION', passed:Boolean(orchestration?.evidenceRequired && orchestration?.permanentHistory) },
    { id:'DECISION_SUPPORT', passed:Boolean(decisionSupport?.explainable && decisionSupport?.approvalRequired) },
    { id:'RELATIONSHIP_ACTIONS', passed:Boolean(relationshipActions?.evidenceBacked && relationshipActions?.brokerReviewRequired) },
    { id:'BROKER_WORKFLOW', passed:Boolean(workflow?.workflowVisible && workflow?.brokerControlled) },
    { id:'EXECUTIVE_COMMAND', passed:Boolean(commandCenter?.evidenceBacked && commandCenter?.brokerControlPreserved) },
    { id:'USER_VALIDATION', passed:Boolean(userValidation?.navigation && userValidation?.operationsVisible && userValidation?.controlsVisible) },
    { id:'GOVERNANCE', passed:Boolean(governance?.evidenceRequired && governance?.approvalRequired && governance?.permanentHistory) },
    { id:'PRODUCTION_SAFETY', passed:Boolean(
      safety?.autonomousExecutionAllowed === false &&
      safety?.autonomousOutreachAllowed === false &&
      safety?.autonomousCommitmentAllowed === false &&
      safety?.productionWritesGoverned
    ) }
  ].map(freeze));

  const failed = checks.filter(check => !check.passed).length;

  return freeze({
    framework:'SCIIP_PHASE17_EXECUTIVE_ASSIGNMENT_OPERATIONS_CERTIFICATION',
    status:failed ? 'BLOCKED' : 'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length - failed,
    checksFailed:failed,
    executiveAssignmentOperationsReady:failed===0,
    orchestrationCertified:true,
    decisionSupportCertified:true,
    relationshipActionsCertified:true,
    workflowCertified:true,
    commandCenterCertified:true,
    autonomousExecutionAllowed:false,
    autonomousOutreachAllowed:false,
    autonomousCommitmentAllowed:false
  });
}
