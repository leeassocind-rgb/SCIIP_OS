const freeze=v=>Object.freeze(v);
export function createStagedGoLivePlan({releaseCandidate,approvalBoard,stages=[
{id:'STAGE-1',name:'Internal',trafficPct:5},{id:'STAGE-2',name:'Limited',trafficPct:25},{id:'STAGE-3',name:'Expanded',trafficPct:50},{id:'STAGE-4',name:'Full',trafficPct:100}],rollback}={}){
 if(releaseCandidate?.status!=='RELEASE_CANDIDATE')throw new Error('Release candidate required');
 if(!approvalBoard?.quorumReached)throw new Error('Approval quorum required');
 if(!rollback?.ready)throw new Error('Rollback readiness required');
 const normalized=stages.map((s,i)=>freeze({...s,sequence:i+1,status:i===0?'READY':'BLOCKED',healthGateRequired:true,approvalRequired:true,productionTrafficAuthorized:false}));
 return freeze({planId:`GO-LIVE-${releaseCandidate.releaseCandidateId}`,releaseCandidateId:releaseCandidate.releaseCandidateId,stages:freeze(normalized),currentStage:normalized[0]?.id||null,status:'READY_FOR_CONTROLLED_START',rollbackPlanId:rollback.rollbackPlanId,staged:true,healthGated:true,productionTrafficAuthorized:false});
}
