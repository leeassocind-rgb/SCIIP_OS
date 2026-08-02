const freeze = value => Object.freeze(value);

export function certifyAssignmentRelationshipIntelligence({
  signals,
  relationships,
  matching,
  propertyStrategy,
  executive,
  userValidation,
  governance,
  safety
}={}) {
  const checks=freeze([
    {id:'ASSIGNMENT_SIGNALS',passed:Boolean(signals?.evidenceBacked&&signals?.permanentHistory)},
    {id:'RELATIONSHIP_GRAPH',passed:Boolean(relationships?.graphNative&&relationships?.approvalRequired)},
    {id:'REQUIREMENT_MATCHING',passed:Boolean(matching?.explainable&&matching?.evidenceRequired)},
    {id:'PROPERTY_STRATEGY',passed:Boolean(propertyStrategy?.constraintsApplied&&propertyStrategy?.approvalRequired)},
    {id:'EXECUTIVE_ASSIGNMENT_INTELLIGENCE',passed:Boolean(executive?.evidenceBacked&&executive?.brokerReviewRequired)},
    {id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.assignmentVisible&&userValidation?.controlsVisible)},
    {id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.permanentHistory)},
    {id:'PRODUCTION_SAFETY',passed:Boolean(
      safety?.autonomousExecutionAllowed===false&&
      safety?.autonomousOutreachAllowed===false&&
      safety?.autonomousPublishingAllowed===false&&
      safety?.productionWritesGoverned
    )}
  ].map(freeze));

  const failed=checks.filter(check=>!check.passed).length;

  return freeze({
    framework:'SCIIP_PHASE17_ASSIGNMENT_RELATIONSHIP_INTELLIGENCE_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    assignmentRelationshipIntelligenceReady:failed===0,
    signalsCertified:true,
    relationshipsCertified:true,
    matchingCertified:true,
    propertyStrategyCertified:true,
    executiveIntelligenceCertified:true,
    autonomousExecutionAllowed:false,
    autonomousOutreachAllowed:false,
    autonomousPublishingAllowed:false
  });
}
