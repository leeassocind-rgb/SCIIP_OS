import{freezeDeep,round}from'./_shared.js';
export function rescoreExecutiveReadiness({baselineScore=0,residualAssessment,controls=[]}={}){
  const total=(residualAssessment?.residualGaps||[]).length;
  const resolved=residualAssessment?.resolvedCount||0;
  const criticalFailed=controls.filter(item=>item.critical&&item.status!=='PASSED'&&item.status!=='WAIVED').length;
  const evidenceScore=total?resolved/total:1;
  const controlScore=controls.length?controls.filter(item=>item.status==='PASSED'||item.status==='WAIVED').length/controls.length:1;
  const remediationLift=round((evidenceScore*20)+(controlScore*13));
  const penalty=criticalFailed*15;
  const readinessScore=Math.max(0,Math.min(100,round(Number(baselineScore)+remediationLift-penalty)));
  const status=readinessScore>=90&&!criticalFailed&&residualAssessment?.unresolvedCount===0?'CERTIFIABLE':
    readinessScore>=75?'CONDITIONALLY_READY':'NOT_READY';
  return freezeDeep({
    baselineScore:Number(baselineScore)||0,
    remediationLift,
    penalty,
    readinessScore,
    status,
    criticalControlFailures:criticalFailed
  });
}
