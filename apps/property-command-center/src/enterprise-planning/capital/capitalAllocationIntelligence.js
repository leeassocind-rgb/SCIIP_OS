const freeze = value => Object.freeze(value);

export function evaluateCapitalAllocation({opportunities=[],capitalBudget=0}={}) {
  const ranked = opportunities.map(item => {
    const expectedReturn = Number(item.expectedReturn || 0);
    const risk = Number(item.riskScore || 0);
    const strategicFit = Number(item.strategicFit || 0);
    const capitalRequired = Number(item.capitalRequired || 0);
    const score = Number((expectedReturn * .45 + strategicFit * .35 - risk * .20).toFixed(2));
    return freeze({
      ...item,
      capitalRequired,
      score,
      status:'UNALLOCATED',
      evidenceRequired:true,
      executiveApprovalRequired:true
    });
  }).sort((a,b)=>b.score-a.score);

  let remaining = Number(capitalBudget || 0);
  const allocated = ranked.map(item => {
    const selected = item.capitalRequired <= remaining;
    if (selected) remaining -= item.capitalRequired;
    return freeze({
      ...item,
      status:selected?'RECOMMENDED':'DEFERRED',
      selected
    });
  });

  return freeze({
    opportunities:freeze(allocated),
    capitalBudget:Number(capitalBudget||0),
    capitalAllocated:Number((Number(capitalBudget||0)-remaining).toFixed(2)),
    remainingCapital:Number(remaining.toFixed(2)),
    selectedCount:allocated.filter(item=>item.selected).length,
    evidenceBacked:true,
    executiveApprovalRequired:true,
    autonomousCapitalDeploymentAllowed:false
  });
}
