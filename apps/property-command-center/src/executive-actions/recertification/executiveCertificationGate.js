import{freezeDeep,uniq}from'./_shared.js';
export function evaluateExecutiveCertificationGate({residualAssessment,rescore,humanSignoff,evidence=[],controls=[]}={}){
  const reasons=[];
  if((residualAssessment?.unresolvedCount||0)>0)reasons.push('UNRESOLVED_GAPS');
  if((rescore?.criticalControlFailures||0)>0)reasons.push('CRITICAL_CONTROL_FAILURE');
  if(!evidence.length||evidence.some(item=>item.status!=='VERIFIED'))reasons.push('EVIDENCE_NOT_VERIFIED');
  if(!controls.length||controls.some(item=>item.status!=='PASSED'&&item.status!=='WAIVED'))reasons.push('CONTROL_VERIFICATION_INCOMPLETE');
  if(!humanSignoff?.approved)reasons.push('HUMAN_SIGNOFF_REQUIRED');
  if(!humanSignoff?.actorId)reasons.push('SIGNOFF_ACTOR_REQUIRED');
  const passed=reasons.length===0&&rescore?.status==='CERTIFIABLE';
  return freezeDeep({
    passed,
    status:passed?'CERTIFIED':'CERTIFICATION_BLOCKED',
    reasons:uniq(reasons),
    humanSignoffRequired:true,
    humanSignoffActor:humanSignoff?.actorId||null,
    signedAt:humanSignoff?.signedAt||null
  });
}
