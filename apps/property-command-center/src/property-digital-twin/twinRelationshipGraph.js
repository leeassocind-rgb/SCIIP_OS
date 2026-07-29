export function buildTwinRelationships({twinId,owner,tenants=[],assignments=[],comparables=[],infrastructure=[]}){
 if(!twinId)throw new Error('twinId required'); const edges=[];
 const add=(type,target,metadata={})=>{if(target)edges.push(Object.freeze({source:twinId,type,target:String(target),metadata:Object.freeze(metadata)}));};
 add('OWNED_BY',owner); tenants.forEach(x=>add('OCCUPIED_BY',x.tenantId||x.id||x,x)); assignments.forEach(x=>add('ASSOCIATED_WITH_ASSIGNMENT',x.assignmentId||x.id||x,x)); comparables.forEach(x=>add('COMPARED_TO',x.propertyId||x.id||x,x)); infrastructure.forEach(x=>add('DEPENDS_ON_INFRASTRUCTURE',x.infrastructureId||x.id||x,x));
 return Object.freeze(edges);
}
