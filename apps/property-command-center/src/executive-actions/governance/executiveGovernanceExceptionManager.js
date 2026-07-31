import{freezeDeep,normalize,uniq}from'./_shared.js';

export function createExecutiveGovernanceException(input={}){
  if(!input.id)throw new Error('Exception id is required');
  if(!input.ruleId)throw new Error('Exception ruleId is required');
  const type=normalize(input.type||'EXCEPTION');
  if(!['EXCEPTION','WAIVER'].includes(type))throw new Error(`Unsupported exception type: ${type}`);
  if(!input.approvedBy)throw new Error('Approved-by actor is required');
  if(!input.reason)throw new Error('Exception reason is required');
  return freezeDeep({
    id:String(input.id),
    ruleId:String(input.ruleId),
    type,
    reason:String(input.reason),
    approvedBy:String(input.approvedBy),
    approvedAt:input.approvedAt||new Date().toISOString(),
    expiresAt:input.expiresAt||null,
    evidenceIds:uniq(input.evidenceIds),
    sourceSignalIds:uniq(input.sourceSignalIds)
  });
}

export function applyExecutiveGovernanceExceptions({policyEvaluation,exceptions=[]}={}){
  const normalized=exceptions.map(createExecutiveGovernanceException);
  const activeRuleIds=new Set(normalized.map(item=>item.ruleId));
  const unresolved=policyEvaluation.failedRequiredRules.filter(ruleId=>!activeRuleIds.has(ruleId));
  return freezeDeep({
    exceptions:normalized.filter(item=>item.type==='EXCEPTION'),
    waivers:normalized.filter(item=>item.type==='WAIVER'),
    coveredRuleIds:[...activeRuleIds],
    unresolvedRuleIds:unresolved,
    passed:unresolved.length===0,
    humanApprovalRequired:true
  });
}
