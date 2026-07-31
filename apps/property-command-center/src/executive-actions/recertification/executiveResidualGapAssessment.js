import{freezeDeep,round}from'./_shared.js';
export function assessExecutiveResidualGaps({actions=[],evidence=[],controls=[]}={}){
  const evidenceByAction=new Map();
  for(const item of evidence){
    if(!evidenceByAction.has(item.actionId))evidenceByAction.set(item.actionId,[]);
    evidenceByAction.get(item.actionId).push(item);
  }
  const controlsByAction=new Map();
  for(const item of controls){
    if(!controlsByAction.has(item.actionId))controlsByAction.set(item.actionId,[]);
    controlsByAction.get(item.actionId).push(item);
  }
  const residualGaps=actions.map(action=>{
    const actionEvidence=evidenceByAction.get(action.id)||[];
    const actionControls=controlsByAction.get(action.id)||[];
    const required=action.evidenceRequired||[];
    const verifiedEvidence=actionEvidence.filter(item=>item.status==='VERIFIED');
    const passedControls=actionControls.filter(item=>item.status==='PASSED'||item.status==='WAIVED');
    const missingEvidence=Math.max(0,required.length-verifiedEvidence.length);
    const failedCriticalControls=actionControls.filter(item=>item.critical&&item.status!=='PASSED'&&item.status!=='WAIVED');
    const resolved=missingEvidence===0&&failedCriticalControls.length===0&&actionControls.every(item=>item.status==='PASSED'||item.status==='WAIVED');
    return freezeDeep({
      actionId:action.id,
      gapId:action.gapId||action.id,
      priority:action.priority||'MEDIUM',
      resolved,
      missingEvidence,
      failedCriticalControls:failedCriticalControls.map(item=>item.id),
      evidenceCoveragePct:required.length?round((verifiedEvidence.length/required.length)*100):100,
      controlPassPct:actionControls.length?round((passedControls.length/actionControls.length)*100):100
    });
  });
  return freezeDeep({
    residualGaps,
    unresolved:residualGaps.filter(item=>!item.resolved),
    resolvedCount:residualGaps.filter(item=>item.resolved).length,
    unresolvedCount:residualGaps.filter(item=>!item.resolved).length
  });
}
