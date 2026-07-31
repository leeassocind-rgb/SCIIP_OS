import{freeze,asArray,unique}from'./_shared.js';
export function buildRemediationVerification(actions=[]){return freeze(actions.map(a=>({actionId:a.id,gapId:a.gapId,requiredEvidence:unique(asArray(a.evidenceRequired)),verificationStatus:a.evidenceRequired.length?'EVIDENCE_REQUIRED':'READY_FOR_REVIEW',approvalRequired:true,verifiedBy:null,verifiedAt:null})))}
