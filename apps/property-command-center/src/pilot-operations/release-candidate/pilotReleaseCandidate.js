const freeze=value=>Object.freeze(value);

export function createPilotReleaseCandidate({
  version,
  proposals=[],
  resolvedIssueIds=[],
  certifications=[],
  build={},
  userValidation={},
  rollback={}
}={}) {
  if(!version)throw new Error('version is required');

  const unresolvedProposals=proposals.filter(item=>!['APPROVED','COMPLETED','DEFERRED'].includes(item.status));
  const certificationFailures=certifications.filter(item=>item.status!=='CERTIFIED'&&item.status!=='PASSED');
  const gates=freeze([
    freeze({id:'IMPROVEMENT_REVIEW',passed:unresolvedProposals.length===0}),
    freeze({id:'CERTIFICATIONS',passed:certificationFailures.length===0&&certifications.length>0}),
    freeze({id:'BUILD',passed:Boolean(build.passed)}),
    freeze({id:'USER_VALIDATION',passed:Boolean(userValidation.passed)}),
    freeze({id:'ROLLBACK',passed:Boolean(rollback.ready)})
  ]);

  const failed=gates.filter(item=>!item.passed).length;
  return freeze({
    releaseCandidateId:`SCIIP-RC-${version}`,
    version,
    status:failed?'BLOCKED':'RELEASE_CANDIDATE',
    gates,
    gatesRun:gates.length,
    gatesPassed:gates.length-failed,
    gatesFailed:failed,
    resolvedIssues:resolvedIssueIds.length,
    unresolvedProposals:unresolvedProposals.length,
    pilotDeploymentEligible:failed===0,
    productionDeploymentAuthorized:false
  });
}
