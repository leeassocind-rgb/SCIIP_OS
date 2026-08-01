const freeze=value=>Object.freeze(value);

export function analyzePilotFeedback({responses=[]}={}) {
  const normalized=responses.map((item,index)=>freeze({
    responseId:item.responseId||`FEEDBACK-${index+1}`,
    userId:item.userId||null,
    workspace:item.workspace||'UNKNOWN',
    category:item.category||'GENERAL',
    sentiment:Number(item.sentiment||0),
    severity:item.severity||'MEDIUM',
    comment:item.comment||'',
    evidence:freeze([...(item.evidence||[])]),
    actionable:item.actionable!==false
  }));

  const grouped=new Map();
  for(const item of normalized){
    const key=`${item.workspace}:${item.category}`;
    if(!grouped.has(key))grouped.set(key,[]);
    grouped.get(key).push(item);
  }

  const themes=[...grouped.entries()].map(([key,items])=>{
    const [workspace,category]=key.split(':');
    const averageSentiment=Number((items.reduce((sum,item)=>sum+item.sentiment,0)/items.length).toFixed(2));
    const evidenceCount=items.reduce((sum,item)=>sum+item.evidence.length,0);
    return freeze({
      themeId:`THEME-${workspace}-${category}`.replace(/\s+/g,'-').toUpperCase(),
      workspace,
      category,
      responseCount:items.length,
      averageSentiment,
      evidenceCount,
      priority:averageSentiment<0?'HIGH':items.length>=3?'MEDIUM':'LOW',
      recommendedAction:averageSentiment<0?'REVIEW_AND_REMEDIATE':'MONITOR',
      approvalRequired:true,
      changesAutoApplied:false
    });
  }).sort((a,b)=>{
    const rank={HIGH:3,MEDIUM:2,LOW:1};
    return (rank[b.priority]||0)-(rank[a.priority]||0);
  });

  return freeze({
    responses:freeze(normalized),
    themes:freeze(themes),
    totalResponses:normalized.length,
    actionableResponses:normalized.filter(item=>item.actionable).length,
    highPriorityThemes:themes.filter(item=>item.priority==='HIGH').length,
    evidenceBacked:true,
    humanReviewRequired:true,
    changesAutoApplied:false
  });
}
