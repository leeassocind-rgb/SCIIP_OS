import{freezeDeep,normalize,uniq}from'./_shared.js';

export function evaluateExecutiveGovernanceRule({rule,context={},evidence=[]}={}){
  if(!rule?.id)throw new Error('Rule is required');
  const evidenceTypes=new Set(evidence.map(item=>normalize(item.type)));
  const missingEvidence=(rule.evidenceTypes||[]).filter(type=>!evidenceTypes.has(normalize(type)));
  let passed=missingEvidence.length===0;
  let reason=passed?'RULE_SATISFIED':'MISSING_REQUIRED_EVIDENCE';
  if(rule.evaluator){
    const result=rule.evaluator({context,evidence});
    passed=Boolean(result?.passed);
    reason=result?.reason|| (passed?'RULE_SATISFIED':'RULE_FAILED');
  }
  return freezeDeep({
    ruleId:rule.id,
    passed,
    required:rule.required,
    severity:rule.severity,
    reason,
    missingEvidence,
    evidenceIds:uniq(evidence.map(item=>item.id)),
    evaluatedAt:context.evaluatedAt||new Date().toISOString()
  });
}

export function evaluateExecutiveGovernancePolicy({policy,context={},evidence=[]}={}){
  const ruleResults=(policy.rules||[]).map(rule=>evaluateExecutiveGovernanceRule({rule,context,evidence}));
  const failedRequired=ruleResults.filter(result=>result.required&&!result.passed);
  return freezeDeep({
    policyId:policy.id,
    policyVersion:policy.version,
    rulesEvaluated:ruleResults.length,
    rulesPassed:ruleResults.filter(result=>result.passed).length,
    rulesFailed:ruleResults.filter(result=>!result.passed).length,
    failedRequiredRules:failedRequired.map(result=>result.ruleId),
    passed:failedRequired.length===0,
    ruleResults
  });
}
