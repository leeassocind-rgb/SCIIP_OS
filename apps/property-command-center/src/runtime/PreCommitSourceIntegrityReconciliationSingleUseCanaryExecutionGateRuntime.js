import fs from'node:fs';import crypto from'node:crypto';
const hashBytes=b=>crypto.createHash('sha256').update(b).digest('hex');
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const freeze=v=>Object.freeze(v);

export function buildM323Runtime(){return freeze({
 contract:'SCIIP_EXPLORER_3_M3_23_PRE_COMMIT_SOURCE_INTEGRITY_RECONCILIATION_SINGLE_USE_CANARY_EXECUTION_GATE_RUNTIME',
 version:'3.0-m3.23',status:'READY',m322EvidenceRequired:true,authoritativeSourceRequired:true,
 publicCopyReconciliationRequired:true,sourceHashBindingRequired:true,exactCurrentStateRequired:true,
 finalReadImmediatelyBeforeGateRequired:true,singleUseExecutionGateRequired:true,exactManifestBindingRequired:true,
 exactTokenBindingRequired:true,rollbackBindingRequired:true,liveMutationAllowed:false,installerExecutesWrite:false,
 certificationExecutesWrite:false,automaticCommit:false,automaticRetry:false,generalizedWriteAuthority:false,
 bulkWrites:false,multiPropertyWrites:false,persistentWriteAuthority:false,canonicalCommittedCountAtInstall:0
});}

function loadJson(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function project(corpus,propertyId,fieldName){
 let found=false,value,lastEventId='UNAVAILABLE',lastVersion='UNAVAILABLE';
 (Array.isArray(corpus?.events)?corpus.events:[]).forEach((e,i)=>{
  if(pid(e)!==propertyId)return;
  for(const c of (Array.isArray(e?.changes)?e.changes:[])){
   if(c?.field!==fieldName)continue;
   found=true;value=clone(c.after);lastEventId=clean(e?.eventId||`event-${i}`);
   lastVersion=clean(e?.version||e?.revision||e?.sequence||e?.eventId||`event-${i}`);
  }
 });
 return{found,value,lastEventId,lastVersion};
}

export function reconcileCanonicalSourceIntegrity({authoritativeSource,publicCopy}={}){
 if(!authoritativeSource||!fs.existsSync(authoritativeSource))return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_MISSING'});
 const ab=fs.readFileSync(authoritativeSource),ac=loadJson(authoritativeSource);
 const auth={filePath:authoritativeSource,bytes:ab.length,sha256:hashBytes(ab),version:clean(ac?.version||ac?.datasetVersion||ac?.corpusVersion),eventCount:Array.isArray(ac?.events)?ac.events.length:0};
 let pub={filePath:publicCopy||null,exists:false,bytes:null,sha256:null,eventCount:null};
 if(publicCopy&&fs.existsSync(publicCopy)){
  const pb=fs.readFileSync(publicCopy);let pc=null;try{pc=loadJson(publicCopy)}catch{}
  pub={filePath:publicCopy,exists:true,bytes:pb.length,sha256:hashBytes(pb),eventCount:Array.isArray(pc?.events)?pc.events.length:null};
 }
 return freeze({
  status:'CERTIFIED',state:'CANONICAL_SOURCE_INTEGRITY_RECONCILED',authoritative:freeze(auth),publicCopy:freeze(pub),
  publicCopyHashMatchesAuthoritative:pub.exists&&pub.sha256===auth.sha256,
  publicCopyBytesMatchAuthoritative:pub.exists&&pub.bytes===auth.bytes,
  publicCopyEventCountMatchesAuthoritative:pub.exists&&pub.eventCount===auth.eventCount,
  authoritativeWritableAuthority:true,publicCopyWritableAuthority:false
 });
}

export function verifyM322ManifestBinding({m322Evidence,sourceIntegrity}={}){
 const m=m322Evidence?.manifest;
 if(m322Evidence?.status!=='PASSED'||m?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'M3_22_MANIFEST_NOT_CERTIFIED'});
 const checks={
  sourcePathMatch:clean(m.authoritativeSource)===clean(sourceIntegrity?.authoritative?.filePath),
  sourceShaMatch:clean(m.authoritativeSourceSha256)===clean(sourceIntegrity?.authoritative?.sha256),
  targetPresent:!!m.target,
  tokenPresent:typeof m.singleUseToken==='string'&&m.singleUseToken.length===64,
  singleUse:m.singleUseOnly===true,
  separateM323:m.separateExecutionMilestoneRequired==='M3.23'
 };
 const ok=Object.values(checks).every(Boolean);
 return freeze({status:ok?'CERTIFIED':'BLOCKED',state:ok?'M3_22_MANIFEST_BOUND_TO_AUTHORITATIVE_SOURCE':'M3_22_MANIFEST_SOURCE_BINDING_FAILED',manifestId:m.manifestId,...checks});
}

export function finalPreCommitRead({authoritativeSource,target,expectedSourceSha256}={}){
 if(!authoritativeSource||!fs.existsSync(authoritativeSource))return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_MISSING'});
 const bytes=fs.readFileSync(authoritativeSource),currentSha=hashBytes(bytes);
 if(clean(currentSha)!==clean(expectedSourceSha256))return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_HASH_DRIFTED_BEFORE_GATE',expectedSourceSha256,observedSourceSha256:currentSha});
 const current=project(JSON.parse(bytes.toString('utf8')),target?.propertyId,target?.fieldName);
 const exact=current.found&&same(current.value,target?.beforeValue);
 return freeze({
  status:exact?'CERTIFIED':'BLOCKED',
  state:exact?'FINAL_PRE_COMMIT_AUTHORITATIVE_STATE_CONFIRMED':!current.found?'TARGET_NOT_FOUND_IN_AUTHORITATIVE_SOURCE':'TARGET_CURRENT_VALUE_DRIFTED',
  propertyId:target?.propertyId,fieldName:target?.fieldName,expectedBeforeValue:clone(target?.beforeValue),
  observedCurrentValue:clone(current.value),exactCurrentState:exact,lastEventId:current.lastEventId,lastVersion:current.lastVersion,sourceSha256:currentSha
 });
}

export function buildSingleUseExecutionGate({m322Evidence,sourceIntegrity,manifestBinding,finalRead}={}){
 const m=m322Evidence?.manifest,t=m?.target;
 const ok=m322Evidence?.status==='PASSED'&&m?.status==='CERTIFIED'&&sourceIntegrity?.status==='CERTIFIED'&&manifestBinding?.status==='CERTIFIED'&&finalRead?.status==='CERTIFIED';
 const basis=[clean(m?.manifestId),clean(m?.singleUseToken),clean(t?.candidateId),clean(t?.qualificationHash),clean(sourceIntegrity?.authoritative?.sha256),clean(finalRead?.sourceSha256),JSON.stringify(t?.beforeValue),JSON.stringify(t?.afterValue),JSON.stringify(t?.rollbackValue)].join('|');
 const gateId=`G323G-${hashBytes(Buffer.from(basis)).slice(0,16).toUpperCase()}`;
 const binding=hashBytes(Buffer.from(JSON.stringify({gateId,manifestId:m?.manifestId,singleUseToken:m?.singleUseToken,target:t,authoritativeSource:m?.authoritativeSource,authoritativeSourceSha256:sourceIntegrity?.authoritative?.sha256})));
 return freeze({
  contract:'SCIIP_EXPLORER_3_M3_23_SINGLE_USE_CANARY_EXECUTION_GATE',version:'3.0-m3.23',
  status:ok?'CERTIFIED':'BLOCKED',state:ok?'SINGLE_USE_CANARY_EXECUTION_GATE_CERTIFIED':'SINGLE_USE_CANARY_EXECUTION_GATE_BLOCKED',
  gateId,executionBinding:binding,manifestId:m?.manifestId||null,singleUseToken:ok?m.singleUseToken:null,singleUseOnly:true,
  target:ok?freeze({propertyId:t.propertyId,fieldName:t.fieldName,beforeValue:clone(t.beforeValue),afterValue:clone(t.afterValue),rollbackValue:clone(t.rollbackValue),candidateId:t.candidateId,qualificationHash:t.qualificationHash}):null,
  authoritativeSource:m?.authoritativeSource||null,authoritativeSourceSha256:sourceIntegrity?.authoritative?.sha256||null,
  publicCopyWritableAuthority:false,finalReadConsistency:finalRead?.exactCurrentState===true,liveWriteAuthorized:false,
  explicitExecutionStepRequired:true,writeExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0
 });
}
