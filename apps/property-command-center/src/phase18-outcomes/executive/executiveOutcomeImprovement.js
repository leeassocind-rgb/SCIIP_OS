const freeze=v=>Object.freeze(v);

export function createExecutiveOutcomeImprovement({
  outcomes={},
  feedback={},
  improvements={},
  learning={},
  approvals=[]
}={}) {
  const attention=[
    ...(outcomes.executions||[]).filter(x=>x.status==='OUTCOME_ATTENTION'||x.status==='OUTCOME_PENDING')
      .map(x=>freeze({type:'OUTCOME',id:x.executionId})),
    ...(feedback.feedback||[]).filter(x=>x.status==='INCOMPLETE')
      .map(x=>freeze({type:'FEEDBACK',id:x.feedbackId})),
    ...(improvements.improvements||[]).filter(x=>x.status==='INSUFFICIENT_EVIDENCE')
      .map(x=>freeze({type:'IMPROVEMENT',id:x.improvementId})),
    ...(learning.candidates||[]).filter(x=>x.status==='BLOCKED')
      .map(x=>freeze({type:'LEARNING',id:x.candidateId})),
    ...approvals.filter(x=>x.status==='PENDING')
      .map(x=>freeze({type:'APPROVAL',id:x.approvalId}))
  ];

  return freeze({
    outcomes:freeze({...outcomes}),
    feedback:freeze({...feedback}),
    improvements:freeze({...improvements}),
    learning:freeze({...learning}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    outcomeImprovementReady:true,
    humanReviewRequired:true,
    autonomousLearningAllowed:false,
    autonomousProcessChangesAllowed:false
  });
}
