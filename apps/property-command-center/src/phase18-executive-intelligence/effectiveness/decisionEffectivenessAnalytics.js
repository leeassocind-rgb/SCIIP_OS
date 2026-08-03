const freeze=v=>Object.freeze(v);

export function evaluateDecisionEffectiveness({decisions=[],outcomes=[]}={}) {
  const outcomeMap=new Map(outcomes.map(o=>[o.decisionId,o]));
  const rows=decisions.map(decision=>{
    const outcome=outcomeMap.get(decision.decisionId);
    const success=outcome?.status==='SUCCESS';
    const valueRealized=Number(outcome?.valueRealized||0);
    const cycleDays=Number(outcome?.cycleDays||0);
    const effectivenessScore=outcome
      ? Number((Math.min(100,valueRealized)-Math.min(50,cycleDays*.5)+(success?25:0)).toFixed(2))
      : 0;
    return freeze({
      ...decision,
      outcome:outcome?freeze({...outcome}):null,
      effectivenessScore,
      status:!outcome?'PENDING_OUTCOME':effectivenessScore>=70?'EFFECTIVE':'REVIEW_REQUIRED'
    });
  });

  return freeze({
    decisions:freeze(rows),
    total:rows.length,
    effective:rows.filter(r=>r.status==='EFFECTIVE').length,
    reviewRequired:rows.filter(r=>r.status==='REVIEW_REQUIRED').length,
    pending:rows.filter(r=>r.status==='PENDING_OUTCOME').length,
    evidenceBacked:true,
    autonomousDecisionChangesAllowed:false
  });
}
