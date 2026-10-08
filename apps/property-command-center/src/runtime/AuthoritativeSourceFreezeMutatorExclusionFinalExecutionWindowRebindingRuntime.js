// SCIIP Explorer 3.0 — M3.23D
// Authoritative Source Freeze, Mutator Exclusion & Final Execution-Window Rebinding Runtime

import fs from 'node:fs';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM323DRuntime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_23D_AUTHORITATIVE_SOURCE_FREEZE_MUTATOR_EXCLUSION_FINAL_EXECUTION_WINDOW_REBINDING_RUNTIME',
    version:'3.0-m3.23d',
    status:'READY',
    m323CEvidenceRequired:true,
    authoritativeSourcePinningRequired:true,
    mutatorExclusionRequired:true,
    repeatedStabilityReadsRequired:true,
    exactTargetStateRequired:true,
    priorManifestSupersessionRequired:true,
    priorTokenReuseProhibited:true,
    shortLivedExecutionWindowRequired:true,
    sourceShaDriftInvalidatesWindow:true,
    targetStateDriftInvalidatesWindow:true,
    liveMutationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    automaticRetry:false,
    generalizedWriteAuthority:false,
    bulkWrites:false,
    multiPropertyWrites:false,
    persistentWriteAuthority:false,
    canonicalCommittedCountAtInstall:0
  });
}

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function projectCurrent(corpus,propertyId,fieldName){
  let found=false,value,lastEventId='UNAVAILABLE',lastVersion='UNAVAILABLE';
  (Array.isArray(corpus?.events)?corpus.events:[]).forEach((e,i)=>{
    if(pid(e)!==propertyId)return;
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(c?.field!==fieldName)continue;
      found=true;
      value=clone(c.after);
      lastEventId=clean(e?.eventId||`event-${i}`);
      lastVersion=clean(e?.version||e?.revision||e?.sequence||e?.eventId||`event-${i}`);
    }
  });
  return{found,value,lastEventId,lastVersion};
}

function capture(source,target){
  const bytes=fs.readFileSync(source);
  const corpus=JSON.parse(bytes.toString('utf8'));
  const current=projectCurrent(corpus,target.propertyId,target.fieldName);
  return{
    sha256:sha(bytes),
    bytes:bytes.length,
    eventCount:Array.isArray(corpus?.events)?corpus.events.length:0,
    version:clean(corpus?.version||corpus?.datasetVersion||corpus?.corpusVersion),
    current
  };
}

export async function performRepeatedStabilityReads({
  sourcePath,
  target,
  expectedBeforeValue,
  readCount=3,
  intervalMs=25
}={}){
  if(!sourcePath||!fs.existsSync(sourcePath)){
    return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_MISSING'});
  }
  if(readCount<3){
    return freeze({status:'BLOCKED',state:'MINIMUM_THREE_STABILITY_READS_REQUIRED'});
  }

  const observations=[];
  for(let i=0;i<readCount;i++){
    let obs;
    try{obs=capture(sourcePath,target);}catch(e){
      return freeze({status:'BLOCKED',state:'STABILITY_READ_FAILED',error:String(e?.message||e)});
    }
    observations.push(freeze({index:i+1,...obs}));
    if(i<readCount-1&&intervalMs>0) await new Promise(r=>setTimeout(r,intervalMs));
  }

  const first=observations[0];
  const shaStable=observations.every(x=>x.sha256===first.sha256);
  const bytesStable=observations.every(x=>x.bytes===first.bytes);
  const eventsStable=observations.every(x=>x.eventCount===first.eventCount);
  const targetStable=observations.every(x=>x.current.found&&same(x.current.value,expectedBeforeValue));

  const ok=shaStable&&bytesStable&&eventsStable&&targetStable;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'AUTHORITATIVE_SOURCE_STABILITY_WINDOW_CERTIFIED':'AUTHORITATIVE_SOURCE_STABILITY_WINDOW_BLOCKED',
    readCount:observations.length,
    shaStable,bytesStable,eventsStable,targetStable,
    baselineSha256:first.sha256,
    baselineBytes:first.bytes,
    baselineEventCount:first.eventCount,
    baselineVersion:first.version,
    observations:freeze(observations)
  });
}

export function certifyMutatorExclusion({
  m323CEvidence,
  prohibitedProcesses=['npm run build','sync-production-validation-assets.cjs']
}={}){
  const rec=m323CEvidence?.stabilizationRecommendation;
  const cls=m323CEvidence?.durableSourceClassification;
  const ok=
    m323CEvidence?.status==='PASSED' &&
    cls?.status==='CERTIFIED' &&
    cls?.classification==='AUTHORITATIVE_SOURCE_WITH_GENERATED_PUBLIC_COPY' &&
    rec?.status==='CERTIFIED' &&
    Array.isArray(rec?.controls) &&
    rec.controls.some(x=>/block build\/sync/i.test(x));

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'EXECUTION_WINDOW_MUTATOR_EXCLUSION_CERTIFIED':'EXECUTION_WINDOW_MUTATOR_EXCLUSION_BLOCKED',
    prohibitedProcesses:freeze([...prohibitedProcesses]),
    buildProhibited:true,
    assetSyncProhibited:true,
    publicCopyExcludedFromAuthorization:true,
    authoritativeSourceOnly:true
  });
}

export function buildFinalExecutionWindowManifest({
  priorManifest,
  stability,
  mutatorExclusion,
  sourcePath,
  target
}={}){
  const ok=
    priorManifest?.status==='CERTIFIED' &&
    stability?.status==='CERTIFIED' &&
    mutatorExclusion?.status==='CERTIFIED' &&
    stability?.targetStable===true;

  const manifestId=`G323DM-${sha(Buffer.from([
    clean(priorManifest?.manifestId),
    clean(stability?.baselineSha256),
    target?.propertyId,
    target?.fieldName,
    JSON.stringify(target?.beforeValue),
    JSON.stringify(target?.afterValue),
    JSON.stringify(target?.rollbackValue)
  ].join('|'))).slice(0,16).toUpperCase()}`;

  const token=sha(Buffer.from(`${manifestId}|M3.24|FINAL_FROZEN_WINDOW|SINGLE_USE`));

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_23D_FINAL_EXECUTION_WINDOW_MANIFEST',
    version:'3.0-m3.23d',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'FINAL_EXECUTION_WINDOW_MANIFEST_CERTIFIED':'FINAL_EXECUTION_WINDOW_MANIFEST_BLOCKED',
    manifestId,
    supersedesManifestId:priorManifest?.manifestId||null,
    supersededToken:priorManifest?.singleUseToken||null,
    supersededTokenReusable:false,
    singleUseToken:ok?token:null,
    singleUseOnly:true,
    target:ok?freeze(clone(target)):null,
    authoritativeSource:sourcePath||null,
    authoritativeSourceSha256:stability?.baselineSha256||null,
    authoritativeSourceBytes:stability?.baselineBytes??null,
    authoritativeEventCount:stability?.baselineEventCount??null,
    stabilityReadCount:stability?.readCount??0,
    buildProhibitedDuringWindow:true,
    assetSyncProhibitedDuringWindow:true,
    publicCopyExcludedFromAuthorization:true,
    sourceShaDriftInvalidatesWindow:true,
    targetStateDriftInvalidatesWindow:true,
    readyForM324Execution:true,
    liveWriteAuthorized:false,
    explicitM324ExecutionRequired:true,
    writeExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function finalExecutionWindowCheck({manifest}={}){
  if(manifest?.status!=='CERTIFIED'){
    return freeze({status:'BLOCKED',state:'FINAL_EXECUTION_WINDOW_MANIFEST_NOT_CERTIFIED'});
  }
  if(!manifest.authoritativeSource||!fs.existsSync(manifest.authoritativeSource)){
    return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_MISSING'});
  }
  let obs;
  try{obs=capture(manifest.authoritativeSource,manifest.target);}catch(e){
    return freeze({status:'BLOCKED',state:'FINAL_WINDOW_READ_FAILED'});
  }
  const shaOk=obs.sha256===manifest.authoritativeSourceSha256;
  const stateOk=obs.current.found&&same(obs.current.value,manifest.target.beforeValue);
  const ok=shaOk&&stateOk;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'FINAL_EXECUTION_WINDOW_STILL_VALID':'FINAL_EXECUTION_WINDOW_INVALIDATED',
    shaOk,stateOk,
    expectedSha256:manifest.authoritativeSourceSha256,
    observedSha256:obs.sha256,
    expectedBeforeValue:clone(manifest.target.beforeValue),
    observedCurrentValue:clone(obs.current.value)
  });
}
