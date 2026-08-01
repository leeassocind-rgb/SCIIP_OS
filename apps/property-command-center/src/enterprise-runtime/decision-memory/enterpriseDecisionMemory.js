const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createEnterpriseDecisionMemory() {
  const decisions=new Map();
  const outcomeLedger=[];

  const recordDecision=({
    decisionId,
    label,
    decisionType='EXECUTIVE',
    rationale='',
    assumptions=[],
    evidence=[],
    approvals=[],
    selectedScenarioId=null,
    context={}
  }={})=>{
    if(!decisionId)throw new Error('decisionId is required');
    if(decisions.has(decisionId))return freeze({status:'DUPLICATE_SKIPPED',decision:decisions.get(decisionId)});

    const decision=freeze({
      decisionId,
      label:label||decisionId,
      decisionType,
      rationale,
      assumptions:freeze(clone(assumptions)),
      evidence:freeze(clone(evidence)),
      approvals:freeze(clone(approvals)),
      selectedScenarioId,
      context:freeze(clone(context)),
      status:'RECORDED',
      recordedAt:new Date().toISOString(),
      productionExecutionAuthorized:false
    });
    decisions.set(decisionId,decision);
    return freeze({status:'RECORDED',decision});
  };

  const recordOutcome=({
    outcomeId,
    decisionId,
    result,
    metrics={},
    evidence=[],
    occurredAt
  }={})=>{
    if(!outcomeId||!decisionId)throw new Error('outcomeId and decisionId are required');
    if(!decisions.has(decisionId))throw new Error('Unknown decision');
    if(outcomeLedger.some(item=>item.outcomeId===outcomeId))return freeze({status:'DUPLICATE_SKIPPED'});

    const outcome=freeze({
      outcomeId,
      decisionId,
      result,
      metrics:freeze(clone(metrics)),
      evidence:freeze(clone(evidence)),
      occurredAt:occurredAt||new Date().toISOString()
    });
    outcomeLedger.push(outcome);
    return freeze({status:'RECORDED',outcome});
  };

  const query=decisionId=>{
    const decision=decisions.get(decisionId);
    if(!decision)return null;
    const outcomes=outcomeLedger.filter(item=>item.decisionId===decisionId);
    return freeze({
      decision,
      outcomes:freeze(outcomes),
      learnedFromOutcome:outcomes.length>0,
      explainable:true
    });
  };

  const lessons=()=>{
    const items=[];
    for(const decision of decisions.values()){
      const outcomes=outcomeLedger.filter(item=>item.decisionId===decision.decisionId);
      if(!outcomes.length)continue;
      items.push(freeze({
        decisionId:decision.decisionId,
        selectedScenarioId:decision.selectedScenarioId,
        assumptions:decision.assumptions,
        outcomeCount:outcomes.length,
        latestResult:outcomes[outcomes.length-1].result,
        recommendation:outcomes[outcomes.length-1].result==='SUCCESS'
          ? 'RETAIN_DECISION_PATTERN'
          : 'REVIEW_ASSUMPTIONS_AND_POLICY',
        policyChangesAutoApplied:false,
        humanReviewRequired:true
      }));
    }
    return freeze(items);
  };

  return freeze({
    recordDecision,
    recordOutcome,
    query,
    lessons,
    snapshot:()=>freeze({
      decisions:decisions.size,
      outcomes:outcomeLedger.length,
      explainable:true,
      organizationalLearning:true,
      appendOnly:true,
      policyChangesAutoApplied:false,
      productionExecutionAuthorized:false
    })
  });
}
