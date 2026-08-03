const freeze = value => Object.freeze(value);

export function createExecutiveResilienceCommand({risks=[],stressTests=[],contingencies=[],assurance={},approvals=[]}={}) {
  const attention = [
    ...risks.filter(r=>['HIGH','CRITICAL'].includes(r.severity)).map(r=>freeze({type:'RISK',id:r.riskId,score:r.score})),
    ...stressTests.filter(t=>t.status==='VULNERABLE').map(t=>freeze({type:'STRESS_TEST',id:t.testId})),
    ...contingencies.filter(c=>c.status!=='READY').map(c=>freeze({type:'CONTINGENCY',id:c.riskId})),
    ...(assurance.controls||[]).filter(c=>!c.passed).map(c=>freeze({type:'ASSURANCE_GAP',id:c.controlId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    risks:freeze([...risks]),
    stressTests:freeze([...stressTests]),
    contingencies:freeze([...contingencies]),
    assurance:freeze({...assurance}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    resilienceCommandReady:true,
    executiveReviewRequired:true,
    autonomousExecutionAllowed:false,
    autonomousCertificationAllowed:false
  });
}
