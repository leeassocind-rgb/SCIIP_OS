const freeze = value => Object.freeze(value);

export function evaluateTerritories({territories=[]}={}) {
  const evaluated = territories.map(territory => {
    const score = Number((
      Number(territory.demandScore || 0) * .30 +
      Number(territory.clientDensity || 0) * .20 +
      Number(territory.inventoryDepth || 0) * .20 +
      Number(territory.competitiveWhitespace || 0) * .20 +
      Number(territory.executionReadiness || 0) * .10
    ).toFixed(2));

    return freeze({
      ...territory,
      score,
      status: score >= 75 ? 'EXPANSION_CANDIDATE' : score >= 55 ? 'RESEARCH' : 'MONITOR',
      evidenceRequired: true,
      executiveApprovalRequired: true
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    territories: freeze(evaluated),
    total: evaluated.length,
    candidates: evaluated.filter(item=>item.status==='EXPANSION_CANDIDATE').length,
    topTerritory: evaluated[0] || null,
    evidenceBacked: true,
    executiveApprovalRequired: true,
    autonomousExpansionAllowed: false
  });
}
