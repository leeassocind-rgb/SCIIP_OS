const freeze=value=>Object.freeze(value);

export function createExecutiveAlertOperations({alerts=[]}={}) {
  const normalized=alerts.map((alert,index)=>freeze({
    alertId:alert.alertId||`ALERT-${index+1}`,
    subjectId:alert.subjectId||null,
    severity:alert.severity||'INFO',
    status:alert.status||'OPEN',
    actual:alert.actual,
    threshold:alert.threshold,
    approvalRequired:alert.approvalRequired!==false,
    executionAuthorized:false
  }));
  const rank={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1,INFO:0};
  const ordered=[...normalized].sort((a,b)=>(rank[b.severity]||0)-(rank[a.severity]||0));
  return freeze({
    alerts:freeze(ordered),
    total:ordered.length,
    open:ordered.filter(item=>item.status==='OPEN').length,
    critical:ordered.filter(item=>item.severity==='CRITICAL').length,
    high:ordered.filter(item=>item.severity==='HIGH').length,
    acknowledgementRequired:true,
    executionAuthorized:false
  });
}
