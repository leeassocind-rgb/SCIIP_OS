const freeze=value=>Object.freeze(value);

export function createMissionControlOperationalUX({
  missionControl,
  activation,
  lastUpdatedAt,
  staleAfterMinutes=15
}={}) {
  const lastUpdated=lastUpdatedAt?new Date(lastUpdatedAt):null;
  const ageMinutes=lastUpdated?Math.max(0,(Date.now()-lastUpdated.getTime())/60000):Infinity;
  const stale=ageMinutes>staleAfterMinutes;

  const alerts=[];
  if(stale)alerts.push(freeze({id:'DATA_STALE',severity:'HIGH',message:'Enterprise data is stale.'}));
  if(Number(missionControl?.criticalRisks||0)>0)alerts.push(freeze({id:'CRITICAL_RISKS',severity:'CRITICAL',message:'Critical enterprise risks require review.'}));
  if(Number(missionControl?.pendingApprovals||0)>0)alerts.push(freeze({id:'PENDING_APPROVALS',severity:'HIGH',message:'Pending approvals require action.'}));
  if(Number(activation?.recordsRejected||0)>0)alerts.push(freeze({id:'REJECTED_RECORDS',severity:'MEDIUM',message:'Some SuperSheet records were rejected.'}));

  return freeze({
    health:missionControl?.health||'UNKNOWN',
    liveData:Boolean(missionControl?.liveData),
    stale,
    ageMinutes:Number.isFinite(ageMinutes)?Number(ageMinutes.toFixed(2)):null,
    activationStatus:activation?.status||'NOT_ACTIVATED',
    acceptedRecords:Number(activation?.recordsAccepted||0),
    rejectedRecords:Number(activation?.recordsRejected||0),
    alerts:freeze(alerts),
    alertCount:alerts.length,
    emptyState:!missionControl?.liveData,
    responsive:true,
    accessible:true,
    keyboardNavigable:true,
    productionExecutionAuthorized:false
  });
}
