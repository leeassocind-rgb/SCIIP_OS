export function assessInfrastructureDependencies(items=[]){
 const normalized=items.map(x=>({id:x.id||x.infrastructureId,type:x.type||'UNKNOWN',status:x.status||'UNKNOWN',criticality:x.criticality||'MEDIUM',capacity:x.capacity??null}));
 const criticalRisks=normalized.filter(x=>x.criticality==='CRITICAL'&&x.status!=='OPERATIONAL');
 return Object.freeze({dependencies:Object.freeze(normalized),criticalRiskCount:criticalRisks.length,status:criticalRisks.length?'AT_RISK':'SUPPORTED'});
}
