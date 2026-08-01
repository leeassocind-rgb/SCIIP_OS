const freeze=v=>Object.freeze(v);
export function evaluateAutomationPolicy({action,policy={}}={}){
 const reasons=[];
 if(policy.evidenceRequired&&!action?.evidence?.length)reasons.push('EVIDENCE_REQUIRED');
 if(policy.approvalRequired&&action?.approvalStatus!=='APPROVED')reasons.push('APPROVAL_REQUIRED');
 if(policy.productionWrite&&policy.autonomousExecutionAllowed===false)reasons.push('AUTONOMOUS_WRITE_BLOCKED');
 return freeze({
  actionId:action?.actionId||null,
  allowed:reasons.length===0,
  reasons:freeze(reasons),
  evidenceRequired:Boolean(policy.evidenceRequired),
  approvalRequired:Boolean(policy.approvalRequired),
  autonomousExecutionAllowed:false
 });
}
