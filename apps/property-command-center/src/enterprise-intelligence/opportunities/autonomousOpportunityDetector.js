const freeze=value=>Object.freeze(value);

export function detectAutonomousOpportunities({
  properties=[],
  marketSignals=[],
  threshold=70
}={}) {
  const signalMap=new Map();
  for(const signal of marketSignals){
    if(!signalMap.has(signal.propertyId))signalMap.set(signal.propertyId,[]);
    signalMap.get(signal.propertyId).push(signal);
  }

  const opportunities=properties.map(property=>{
    const signals=signalMap.get(property.id)||[];
    const score=Math.min(
      100,
      Number(property.fitScore||0)*0.45 +
      Number(property.marketScore||0)*0.35 +
      Math.min(signals.length*8,20)
    );
    return freeze({
      opportunityId:`OPP-${property.id}`,
      propertyId:property.id,
      label:property.label||property.address||property.id,
      score:Number(score.toFixed(2)),
      signals:freeze(signals.map(item=>freeze({...item}))),
      status:score>=threshold?'DETECTED':'BELOW_THRESHOLD',
      recommendedAction:score>=threshold?'REVIEW_AND_QUALIFY':'MONITOR',
      approvalRequired:true,
      autonomousExecutionAllowed:false
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    opportunities:freeze(opportunities),
    detected:opportunities.filter(item=>item.status==='DETECTED').length,
    threshold,
    autonomousDetection:true,
    autonomousExecutionAllowed:false,
    approvalRequired:true
  });
}
