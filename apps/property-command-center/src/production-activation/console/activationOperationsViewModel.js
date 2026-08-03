const freeze=value=>Object.freeze(value);
export function createActivationOperationsViewModel(state={}, evidence=[], {now=new Date(), staleAfterMinutes=60}={}) {
 const reports=evidence.map(item=>{const ts=item.generatedAt?new Date(item.generatedAt):null; const age=ts?Math.max(0,(now-ts)/60000):null; return freeze({...item,ageMinutes:age,stale:age==null||age>staleAfterMinutes});});
 const staleReports=reports.filter(r=>r.stale).length;
 const gates=freeze({buildPassed:Boolean(state.build?.passed),approvalReady:Number(state.approval?.approved||0)>0,canaryVerified:state.canary?.status==='ROLLED_BACK_VERIFIED',productionDefaultDenied:state.promotion?.productionDefaultDenied!==false});
 return freeze({health:Object.values(gates).every(Boolean)&&staleReports===0?'OPERATIONAL':'ATTENTION_REQUIRED',revision:state.revision||0,reports,staleReports,gates,productionExecutionAuthorized:false});
}
