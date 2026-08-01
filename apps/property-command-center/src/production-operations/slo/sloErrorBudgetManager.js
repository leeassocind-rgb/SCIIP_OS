const freeze=v=>Object.freeze(v);
export function evaluateSLOs({objectives=[]}={}){
 const evaluated=objectives.map(o=>{
  const target=Number(o.targetPct||0),actual=Number(o.actualPct||0);
  const errorBudgetPct=Math.max(0,Number((100-target).toFixed(4)));
  const consumedPct=errorBudgetPct===0?(actual<target?100:0):Math.max(0,Number((((target-actual)/errorBudgetPct)*100).toFixed(2)));
  return freeze({...o,targetPct:target,actualPct:actual,errorBudgetPct,errorBudgetConsumedPct:consumedPct,status:actual>=target?'MET':'BREACHED'});
 });
 return freeze({
  objectives:freeze(evaluated),
  objectivesMet:evaluated.filter(o=>o.status==='MET').length,
  objectivesTotal:evaluated.length,
  breaches:evaluated.filter(o=>o.status==='BREACHED').length,
  releaseFreezeRecommended:evaluated.some(o=>o.errorBudgetConsumedPct>=100),
  productionWritesGoverned:true,
  autonomousExecutionAllowed:false
 });
}
