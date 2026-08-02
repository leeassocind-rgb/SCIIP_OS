const freeze = value => Object.freeze(value);

export function buildRelationshipOpportunityGraph({assignmentId, people=[], relationships=[], activity=[]}={}) {
  if (!assignmentId) throw new Error('assignmentId is required');

  const activityByPerson = new Map();
  for (const event of activity) {
    if (!activityByPerson.has(event.personId)) activityByPerson.set(event.personId, []);
    activityByPerson.get(event.personId).push(event);
  }

  const nodes = people.map(person => {
    const events = activityByPerson.get(person.personId) || [];
    const relationshipCount = relationships.filter(
      edge => edge.from === person.personId || edge.to === person.personId
    ).length;
    const score = Number((
      events.reduce((sum,event)=>sum+Number(event.relevance||0),0) * 10 +
      relationshipCount * 5 +
      Number(person.strategicValue || 0)
    ).toFixed(2));

    return freeze({
      ...person,
      activityCount: events.length,
      relationshipCount,
      opportunityScore: score,
      status: score >= 20 ? 'FOLLOW_UP' : 'MONITOR'
    });
  }).sort((a,b)=>b.opportunityScore-a.opportunityScore);

  return freeze({
    assignmentId,
    nodes: freeze(nodes),
    edges: freeze(relationships.map(edge=>freeze({...edge}))),
    nodeCount: nodes.length,
    edgeCount: relationships.length,
    topRelationship: nodes[0] || null,
    graphNative: true,
    evidenceBacked: true,
    approvalRequired: true,
    autonomousOutreachAllowed: false
  });
}
