const freeze=v=>Object.freeze(v);
export function createEnterpriseObservabilitySnapshot({events=[],runs=[],playbooks=[],alerts=[]}={}){
 const openAlerts=alerts.filter(a=>a.status==='OPEN').length;
 const failedRuns=runs.filter(r=>r.status==='FAILED').length;
 return freeze({eventCount:events.length,orchestrationRuns:runs.length,playbookInstances:playbooks.length,alertCount:alerts.length,openAlerts,failedRuns,health:failedRuns?'DEGRADED':openAlerts?'WATCH':'OPERATIONAL',traceable:true,auditable:true,productionExecutionAuthorized:false});
}
