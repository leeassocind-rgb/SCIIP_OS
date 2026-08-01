const freeze=v=>Object.freeze(v);
export function diagnoseRuntime({services=[],metrics={}}={}){
 const unhealthy=services.filter(s=>!['OPERATIONAL','HEALTHY','READY','SYNCHRONIZED'].includes(s.status));
 const findings=[];
 if(Number(metrics.memoryUtilizationPct||0)>85)findings.push('MEMORY_PRESSURE');
 if(Number(metrics.queueDepth||0)>100)findings.push('QUEUE_BACKLOG');
 if(Number(metrics.apiLatencyMs||0)>500)findings.push('API_LATENCY');
 for(const service of unhealthy)findings.push(`SERVICE_${service.name}_UNHEALTHY`);
 return freeze({
  status:findings.length?'ATTENTION_REQUIRED':'HEALTHY',
  servicesChecked:services.length,
  unhealthyServices:unhealthy.length,
  findings:freeze(findings),
  rootCauseCandidates:freeze(findings.map((id,index)=>freeze({id,rank:index+1}))),
  evidenceBacked:true,
  productionWritesGoverned:true,
  autonomousExecutionAllowed:false
 });
}
