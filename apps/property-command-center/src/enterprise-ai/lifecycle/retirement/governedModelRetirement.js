const freeze=v=>Object.freeze(v);
export function evaluateModelRetirement({model={},replacement={},gates={},approvals=[]}={}){
 const roles=['AI_GOVERNANCE','SECURITY','PRODUCT','OPERATIONS'];
 const quorum=roles.every(role=>approvals.some(a=>a.role===role&&a.status==='APPROVED'));
 const gatesPassed=Boolean(gates.trafficMigrated&&gates.memoryPreserved&&gates.provenancePreserved&&gates.rollbackWindowComplete&&replacement?.certified);
 return freeze({modelId:model.modelId||null,replacementModelId:replacement.modelId||null,approvalQuorum:quorum,gatesPassed,status:quorum&&gatesPassed?'READY_FOR_RETIREMENT':'BLOCKED',memoryPreserved:Boolean(gates.memoryPreserved),provenancePreserved:Boolean(gates.provenancePreserved),autoRetire:false,productionTrafficGoverned:true});
}
