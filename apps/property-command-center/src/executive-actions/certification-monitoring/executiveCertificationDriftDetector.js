import{freezeDeep,normalize,uniq,round}from'./_shared.js';

function compareMap(baseline,current,type){
  const keys=uniq([...Object.keys(baseline||{}),...Object.keys(current||{})]);
  return keys.flatMap(key=>{
    const before=baseline?.[key];
    const after=current?.[key];
    if(before===after)return[];
    return[freezeDeep({
      type,
      key,
      before:before??null,
      after:after??null,
      severity:type==='CONTROL_STATUS_DRIFT'&&normalize(after)==='FAILED'?'CRITICAL':
        type==='POLICY_VERSION_DRIFT'?'HIGH':'MEDIUM'
    })];
  });
}

export function detectExecutiveCertificationDrift({baseline,snapshot,readinessTolerance=5}={}){
  if(!baseline||!snapshot)throw new Error('Baseline and snapshot are required');
  const drifts=[
    ...compareMap(baseline.policyVersions,snapshot.policyVersions,'POLICY_VERSION_DRIFT'),
    ...compareMap(baseline.evidenceChecksums,snapshot.evidenceChecksums,'EVIDENCE_DRIFT'),
    ...compareMap(baseline.controlStatuses,snapshot.controlStatuses,'CONTROL_STATUS_DRIFT')
  ];
  const readinessDelta=round(snapshot.readinessScore-baseline.readinessScore);
  if(Math.abs(readinessDelta)>readinessTolerance){
    drifts.push(freezeDeep({
      type:'READINESS_SCORE_DRIFT',
      key:'readinessScore',
      before:baseline.readinessScore,
      after:snapshot.readinessScore,
      delta:readinessDelta,
      severity:readinessDelta<0?'HIGH':'LOW'
    }));
  }
  const baselineExceptions=new Set((baseline.exceptions||[]).map(item=>String(item.id||item)));
  const currentExceptions=new Set((snapshot.exceptions||[]).map(item=>String(item.id||item)));
  const newExceptions=[...currentExceptions].filter(id=>!baselineExceptions.has(id));
  for(const id of newExceptions){
    drifts.push(freezeDeep({type:'NEW_EXCEPTION',key:id,before:null,after:id,severity:'HIGH'}));
  }
  const baselineWaivers=new Set((baseline.waivers||[]).map(item=>String(item.id||item)));
  const currentWaivers=new Set((snapshot.waivers||[]).map(item=>String(item.id||item)));
  const newWaivers=[...currentWaivers].filter(id=>!baselineWaivers.has(id));
  for(const id of newWaivers){
    drifts.push(freezeDeep({type:'NEW_WAIVER',key:id,before:null,after:id,severity:'HIGH'}));
  }
  const severityRank={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1};
  const maxSeverity=drifts.reduce((max,item)=>
    severityRank[item.severity]>severityRank[max]?item.severity:max,'LOW');
  return freezeDeep({
    drifts,
    driftCount:drifts.length,
    hasDrift:drifts.length>0,
    maxSeverity:drifts.length?maxSeverity:'NONE',
    readinessDelta,
    sourceSignalIds:uniq([...(baseline.sourceSignalIds||[]),...(snapshot.sourceSignalIds||[])])
  });
}
