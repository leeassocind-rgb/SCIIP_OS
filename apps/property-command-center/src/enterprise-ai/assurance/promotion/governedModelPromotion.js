const freeze=v=>Object.freeze(v);
export function evaluateModelPromotion({candidate={},gates={},approvals=[]}={}){
 const roles=['AI_GOVERNANCE','SECURITY','PRODUCT','OPERATIONS'];const quorum=roles.every(role=>approvals.some(a=>a.role===role&&a.status==='APPROVED'));const gatesPassed=Boolean(gates.evaluationPassed&&gates.redTeamPassed&&gates.groundingPassed&&gates.dataProtectionPassed&&gates.rollbackReady);
 return freeze({modelId:candidate.modelId||null,version:candidate.version||null,approvalRoles:freeze(roles),approvalQuorum:quorum,gatesPassed,status:quorum&&gatesPassed?'READY_FOR_CONTROLLED_PROMOTION':'BLOCKED',stagedPromotion:true,rollbackRequired:true,autoPromote:false,productionTrafficGoverned:true});
}
