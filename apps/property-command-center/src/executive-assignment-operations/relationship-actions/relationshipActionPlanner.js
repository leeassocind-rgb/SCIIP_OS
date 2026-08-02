const freeze = value => Object.freeze(value);

export function planRelationshipActions({assignmentId,relationships=[],signals=[]}={}) {
  if (!assignmentId) throw new Error('assignmentId is required');

  const plans = relationships.map((relationship,index) => {
    const linkedSignals = signals.filter(signal => signal.personId === relationship.personId);
    const score = Number((
      Number(relationship.opportunityScore || 0) +
      linkedSignals.reduce((sum,signal)=>sum+Number(signal.relevance || 0) * 10,0) +
      Number(relationship.strategicValue || 0)
    ).toFixed(2));

    return freeze({
      actionId: `REL-ACT-${String(index + 1).padStart(4, '0')}`,
      personId: relationship.personId,
      recommendedAction: score >= 30 ? 'CONTACT_NOW' : score >= 15 ? 'PREPARE_OUTREACH' : 'MONITOR',
      score,
      signalCount: linkedSignals.length,
      rationale: relationship.rationale || 'Relationship opportunity detected from governed evidence.',
      approvalRequired: true,
      brokerReviewRequired: true,
      autoSend: false
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    assignmentId,
    plans: freeze(plans),
    total: plans.length,
    immediate: plans.filter(item => item.recommendedAction === 'CONTACT_NOW').length,
    topPlan: plans[0] || null,
    evidenceBacked: true,
    brokerReviewRequired: true,
    autonomousOutreachAllowed: false
  });
}
