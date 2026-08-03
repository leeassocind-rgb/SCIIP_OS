const freeze = value => Object.freeze(value);

export function evaluateStrategicAccounts({accounts=[]}={}) {
  const evaluated = accounts.map(account => {
    const score = Number((
      Number(account.revenuePotential || 0) * .35 +
      Number(account.relationshipStrength || 0) * .25 +
      Number(account.assignmentPotential || 0) * .25 +
      Number(account.marketFit || 0) * .15
    ).toFixed(2));

    return freeze({
      ...account,
      score,
      status: score >= 80 ? 'PRIORITY_GROWTH' : score >= 60 ? 'DEVELOP' : 'MONITOR',
      evidenceRequired: true,
      brokerReviewRequired: true,
      autonomousOutreachAllowed: false
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    accounts: freeze(evaluated),
    total: evaluated.length,
    priorityGrowth: evaluated.filter(item=>item.status==='PRIORITY_GROWTH').length,
    topAccount: evaluated[0] || null,
    evidenceBacked: true,
    brokerReviewRequired: true,
    autonomousOutreachAllowed: false
  });
}
