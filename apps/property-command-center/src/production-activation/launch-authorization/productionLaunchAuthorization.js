const freeze=value=>Object.freeze(value);

export function createProductionLaunchAuthorization({
  approvalBoard,
  releaseCandidate,
  goLivePlan,
  observability,
  recovery,
  authorizationWindow
}={}) {
  const now=Date.now();
  const startsAt=authorizationWindow?.startsAt?new Date(authorizationWindow.startsAt).getTime():NaN;
  const expiresAt=authorizationWindow?.expiresAt?new Date(authorizationWindow.expiresAt).getTime():NaN;
  const windowValid=Number.isFinite(startsAt)&&Number.isFinite(expiresAt)&&startsAt<expiresAt;
  const windowOpen=windowValid&&now>=startsAt&&now<=expiresAt;

  const checks=freeze([
    freeze({id:'APPROVAL_QUORUM',passed:Boolean(approvalBoard?.quorumReached)}),
    freeze({id:'RELEASE_CANDIDATE',passed:Boolean(releaseCandidate?.status==='RELEASE_CANDIDATE')}),
    freeze({id:'GO_LIVE_PLAN',passed:Boolean(goLivePlan?.status==='READY_FOR_CONTROLLED_START')}),
    freeze({id:'OBSERVABILITY',passed:Boolean(observability?.status==='READY'&&observability?.blockerCount===0)}),
    freeze({id:'RECOVERY',passed:Boolean(recovery?.rollbackReady&&recovery?.restartRecovery)}),
    freeze({id:'AUTHORIZATION_WINDOW',passed:windowValid})
  ]);

  const failed=checks.filter(item=>!item.passed).length;
  return freeze({
    authorizationId:`LAUNCH-AUTH-${releaseCandidate?.releaseCandidateId||'UNKNOWN'}`,
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    windowValid,
    windowOpen,
    status:failed?'BLOCKED':'READY_FOR_REHEARSAL',
    rehearsalAuthorized:failed===0,
    productionTrafficAuthorized:false
  });
}
