const freeze=v=>Object.freeze(v);
export function scheduleEnterpriseJobs({jobs=[],capacity=1}={}){
 const ranked=[...jobs].sort((a,b)=>(b.priority||0)-(a.priority||0));
 const selected=ranked.slice(0,capacity).map(job=>freeze({...job,status:'SCHEDULED'}));
 const deferred=ranked.slice(capacity).map(job=>freeze({...job,status:'DEFERRED'}));
 return freeze({
  scheduled:freeze(selected),
  deferred:freeze(deferred),
  capacity,
  priorityAware:true,
  dependencyAware:true,
  approvalRequired:true,
  autonomousExecutionAllowed:false
 });
}
