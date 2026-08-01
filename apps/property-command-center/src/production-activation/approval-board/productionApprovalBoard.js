const freeze=v=>Object.freeze(v);
export function createProductionApprovalBoard({requiredApprovers=['PRODUCT','ENGINEERING','SECURITY','OPERATIONS'],decisions=[]}={}){
 const normalized=requiredApprovers.map(role=>{const d=decisions.find(x=>x.role===role);return freeze({role,status:d?.status||'PENDING',reviewer:d?.reviewer||null,evidenceCount:Number(d?.evidenceCount||0),decidedAt:d?.decidedAt||null})});
 const approved=normalized.filter(x=>x.status==='APPROVED').length,rejected=normalized.filter(x=>x.status==='REJECTED').length,pending=normalized.filter(x=>x.status==='PENDING').length;
 return freeze({decisions:freeze(normalized),requiredApprovals:requiredApprovers.length,approved,rejected,pending,quorumReached:approved===requiredApprovers.length&&rejected===0,status:rejected?'REJECTED':pending?'PENDING':'APPROVED',evidenceRequired:true,productionDeploymentAuthorized:false});
}
