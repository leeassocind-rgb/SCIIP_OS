const freeze=value=>Object.freeze(value);

function weightedScore(asset,weights){
  const fit=Number(asset.fitScore||0);
  const market=Number(asset.marketScore||0);
  const risk=Number(asset.riskScore||0);
  const returnScore=Number(asset.returnScore||0);
  const strategic=Number(asset.strategicScore||0);

  return Number((
    fit*weights.fit +
    market*weights.market +
    returnScore*weights.return +
    strategic*weights.strategic -
    risk*weights.risk
  ).toFixed(2));
}

export function optimizeEnterprisePortfolio({
  assets=[],
  capitalAvailable=0,
  maximumSelections=10,
  weights={
    fit:0.2,
    market:0.2,
    return:0.3,
    strategic:0.2,
    risk:0.1
  }
}={}) {
  const ranked=assets.map(asset=>freeze({
    ...asset,
    optimizationScore:weightedScore(asset,weights),
    requiredCapital:Number(asset.requiredCapital||0),
    approvalRequired:true,
    executionAuthorized:false
  })).sort((a,b)=>b.optimizationScore-a.optimizationScore);

  const selected=[];
  let capitalAllocated=0;

  for(const asset of ranked){
    if(selected.length>=maximumSelections)break;
    if(capitalAllocated+asset.requiredCapital>capitalAvailable)continue;
    selected.push(freeze({
      ...asset,
      sequence:selected.length+1,
      recommendation:'SELECT_FOR_REVIEW'
    }));
    capitalAllocated+=asset.requiredCapital;
  }

  return freeze({
    ranked:freeze(ranked),
    selected:freeze(selected),
    selectedCount:selected.length,
    capitalAvailable:Number(capitalAvailable),
    capitalAllocated,
    capitalRemaining:Number(capitalAvailable)-capitalAllocated,
    objective:'MAXIMIZE_ENTERPRISE_VALUE',
    multiObjective:true,
    autonomousRecommendation:true,
    approvalRequired:true,
    executionAuthorized:false
  });
}
