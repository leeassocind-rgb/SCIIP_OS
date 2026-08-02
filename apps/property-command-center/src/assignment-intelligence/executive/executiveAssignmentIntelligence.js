const freeze = value => Object.freeze(value);

export function createExecutiveAssignmentIntelligence({
  assignment,
  signals=[],
  relationships=[],
  matches=[],
  strategy={},
  decisions=[]
}={}) {
  const attention = [
    ...signals.filter(item=>item.status==='ACTIVE').map(item=>freeze({type:'SIGNAL',id:item.signalId,score:item.score})),
    ...relationships.filter(item=>item.status==='FOLLOW_UP').map(item=>freeze({type:'RELATIONSHIP',id:item.personId,score:item.opportunityScore})),
    ...decisions.filter(item=>item.approvalRequired).map(item=>freeze({type:'DECISION',id:item.decisionId}))
  ];

  return freeze({
    assignment: freeze({...assignment}),
    signals: freeze([...signals]),
    relationships: freeze([...relationships]),
    matches: freeze([...matches]),
    strategy: freeze({...strategy}),
    decisions: freeze([...decisions]),
    attention: freeze(attention),
    attentionCount: attention.length,
    evidenceBacked: true,
    citationsRequired: true,
    brokerReviewRequired: true,
    autonomousPublishingAllowed: false
  });
}
