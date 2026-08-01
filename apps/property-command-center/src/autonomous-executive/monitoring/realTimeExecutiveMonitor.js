const freeze=v=>Object.freeze(v);
export function evaluateExecutiveConditions({signals=[],rules=[]}={}){
 const alerts=[];
 for(const rule of rules)for(const signal of signals){
  const actual=Number(signal[rule.field]);const threshold=Number(rule.threshold);
  const triggered=rule.operator==='GT'?actual>threshold:rule.operator==='LT'?actual<threshold:actual===threshold;
  if(triggered)alerts.push(freeze({alertId:`ALERT-${alerts.length+1}`,ruleId:rule.ruleId,subjectId:signal.subjectId,severity:rule.severity||'INFO',actual,threshold,status:'OPEN',approvalRequired:true,executionAuthorized:false}));
 }
 return freeze({alerts:freeze(alerts),alertCount:alerts.length,monitoringActive:true,notificationOnly:true,executionAuthorized:false});
}
