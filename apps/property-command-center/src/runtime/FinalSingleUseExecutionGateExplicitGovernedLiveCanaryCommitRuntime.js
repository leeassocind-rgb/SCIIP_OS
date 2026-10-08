// SCIIP Explorer 3.0 — M3.24
// Final Single-Use Execution Gate & Explicit Governed Live Canary Commit Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const hashBytes=v=>crypto.createHash('sha256').update(v).digest('hex');
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM324Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_24_FINAL_SINGLE_USE_EXECUTION_GATE_EXPLICIT_GOVERNED_LIVE_CANARY_COMMIT_RUNTIME',
    version:'3.0-m3.24',
    status:'READY',
    m323BFinalManifestRequired:true,
    exactFinalManifestBindingRequired:true,
    exactSourceShaRequired:true,
    exactCurrentStateRequired:true,
    singleUseTokenRequired:true,
    explicitLiveApprovalRequired:true,
    oneTransactionOnly:true,
    onePropertyOnly:true,
    oneFieldOnly:true,
    readAfterWriteVerificationRequired:true,
    rollbackOnVerificationFailure:true,
    postBindingBuildOrSyncProhibited:true,
    automaticRetry:false,
    generalizedWriteAuthority:false,
    bulkWrites:false,
    multiPropertyWrites:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    realCanonicalCommittedCountAtInstall:0
  });
}

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function projectCurrent(corpus,propertyId,fieldName){
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
function atomicWriteJson(filePath,data){
  const tmp=`${filePath}.m324-${process.pid}-${Date.now()}.tmp`;
  fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n');
  fs.renameSync(tmp,filePath);
}
function ensureState(statePath){
  if(!fs.existsSync(statePath)){
    fs.mkdirSync(path.dirname(statePath),{recursive:true});
    fs.writeFileSync(statePath,JSON.stringify({consumedTokens:[],receipts:[],audit:[]},null,2)+'\n');
  }
  return JSON.parse(fs.readFileSync(statePath,'utf8'));
}
function persistState(statePath,state){atomicWriteJson(statePath,state);}

export function verifyFinalExecutionGate({m323BEvidence}={}){
  const m=m323BEvidence?.finalManifest;
  const drift=m323BEvidence?.immediatePostBindingDriftCheck;
  const ok=
    m323BEvidence?.status==='PASSED' &&
    m?.status==='CERTIFIED' &&
    m?.readyForM324ExecutionGate===true &&
    m?.singleUseOnly===true &&
    m?.noBuildOrSyncAfterBindingRequired===true &&
    m?.invalidateIfSourceShaChanges===true &&
    drift?.status==='CERTIFIED' &&
    drift?.exactSourceBinding===true;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'FINAL_SINGLE_USE_EXECUTION_GATE_VERIFIED':'FINAL_SINGLE_USE_EXECUTION_GATE_BLOCKED',
    manifestId:m?.manifestId||null,
    target:m?.target||null,
    sourcePath:m?.authoritativeSource||null,
    sourceSha256:m?.authoritativeSourceSha256||null,
    singleUseToken:m?.singleUseToken||null,
    noBuildOrSyncAfterBindingRequired:m?.noBuildOrSyncAfterBindingRequired===true
  });
}

export function finalPreWriteVerification({gate}={}){
  if(gate?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'FINAL_GATE_NOT_CERTIFIED'});
  if(!gate.sourcePath||!fs.existsSync(gate.sourcePath))return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_MISSING'});

  const bytes=fs.readFileSync(gate.sourcePath);
  const currentSha=hashBytes(bytes);
  if(clean(currentSha)!==clean(gate.sourceSha256)){
    return freeze({status:'BLOCKED',state:'POST_BINDING_SOURCE_SHA_DRIFT',expectedSha256:gate.sourceSha256,observedSha256:currentSha});
  }

  let corpus;try{corpus=JSON.parse(bytes.toString('utf8'));}catch(e){return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_INVALID_JSON'});}
  const current=projectCurrent(corpus,gate.target.propertyId,gate.target.fieldName);
  const exact=current.found&&same(current.value,gate.target.beforeValue);

  return freeze({
    status:exact?'CERTIFIED':'BLOCKED',
    state:exact?'FINAL_PRE_WRITE_STATE_VERIFIED':'FINAL_PRE_WRITE_STATE_MISMATCH',
    observedCurrentValue:clone(current.value),
    expectedBeforeValue:clone(gate.target.beforeValue),
    lastEventId:current.lastEventId,
    lastVersion:current.lastVersion,
    sourceSha256:currentSha,
    exactCurrentState:exact
  });
}

export async function executeExplicitGovernedLiveCanary({
  m323BEvidence,
  explicitLiveApproval,
  expectedManifestId,
  expectedToken,
  statePath,
  receiptPath,
  auditPath
}={}){
  const gate=verifyFinalExecutionGate({m323BEvidence});
  if(gate.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:gate.state,writeExecuted:false,canonicalCommitted:false,canonicalCommittedCount:0});

  if(explicitLiveApproval!==true){
    return freeze({status:'BLOCKED',state:'EXPLICIT_LIVE_APPROVAL_REQUIRED',writeExecuted:false,canonicalCommitted:false,canonicalCommittedCount:0});
  }
  if(clean(expectedManifestId)!==clean(gate.manifestId)){
    return freeze({status:'BLOCKED',state:'MANIFEST_ID_MISMATCH',writeExecuted:false,canonicalCommitted:false,canonicalCommittedCount:0});
  }
  if(clean(expectedToken)!==clean(gate.singleUseToken)){
    return freeze({status:'BLOCKED',state:'SINGLE_USE_TOKEN_MISMATCH',writeExecuted:false,canonicalCommitted:false,canonicalCommittedCount:0});
  }

  const pre=finalPreWriteVerification({gate});
  if(pre.status!=='CERTIFIED'){
    return freeze({status:'BLOCKED',state:pre.state,writeExecuted:false,canonicalCommitted:false,canonicalCommittedCount:0});
  }

  const state=ensureState(statePath);
  if(state.consumedTokens.includes(gate.singleUseToken)){
    return freeze({status:'BLOCKED',state:'SINGLE_USE_TOKEN_ALREADY_CONSUMED',writeExecuted:false,canonicalCommitted:false,canonicalCommittedCount:0});
  }

  const sourceBeforeBytes=fs.readFileSync(gate.sourcePath);
  const sourceBeforeSha=hashBytes(sourceBeforeBytes);
  const corpus=JSON.parse(sourceBeforeBytes.toString('utf8'));

  const executionId=`G324EX-${hash([gate.manifestId,gate.singleUseToken,Date.now()].join('|')).slice(0,16).toUpperCase()}`;
  const newEventId=`EVENT-M324-${hash([executionId,gate.target.propertyId,gate.target.fieldName].join('|')).slice(0,20).toUpperCase()}`;

  const event={
    eventId:newEventId,
    eventType:'GOVERNED_LIVE_CANARY_COMMIT',
    canonicalPropertyId:gate.target.propertyId,
    version:newEventId,
    milestone:'M3.24',
    executionId,
    manifestId:gate.manifestId,
    candidateId:gate.target.candidateId,
    qualificationHash:gate.target.qualificationHash,
    changes:[{
      field:gate.target.fieldName,
      before:clone(gate.target.beforeValue),
      after:clone(gate.target.afterValue)
    }]
  };

  // Single-use authorization is consumed immediately before the sole write attempt.
  state.consumedTokens.push(gate.singleUseToken);
  state.audit.push({event:'M3.24_TOKEN_CONSUMED',executionId,manifestId:gate.manifestId});
  persistState(statePath,state);

  let committed=false,verified=false,rolledBack=false,terminal='WRITE_FAILED';
  let afterSha=null,rollbackEventId=null,errorMessage=null;

  try{
    corpus.events=[...(Array.isArray(corpus.events)?corpus.events:[]),event];
    atomicWriteJson(gate.sourcePath,corpus);
    committed=true;

    const afterBytes=fs.readFileSync(gate.sourcePath);
    const afterCorpus=JSON.parse(afterBytes.toString('utf8'));
    const afterState=projectCurrent(afterCorpus,gate.target.propertyId,gate.target.fieldName);
    afterSha=hashBytes(afterBytes);
    verified=afterState.found&&same(afterState.value,gate.target.afterValue);

    if(!verified){
      const rollbackEvent={
        eventId:`EVENT-M324-RB-${hash([executionId,'ROLLBACK'].join('|')).slice(0,20).toUpperCase()}`,
        eventType:'GOVERNED_LIVE_CANARY_ROLLBACK',
        canonicalPropertyId:gate.target.propertyId,
        version:`M3.24-RB-${executionId}`,
        milestone:'M3.24',
        executionId,
        manifestId:gate.manifestId,
        rollbackReason:'READ_AFTER_WRITE_VERIFICATION_FAILED',
        changes:[{
          field:gate.target.fieldName,
          before:clone(gate.target.afterValue),
          after:clone(gate.target.rollbackValue)
        }]
      };
      afterCorpus.events.push(rollbackEvent);
      atomicWriteJson(gate.sourcePath,afterCorpus);
      rolledBack=true;
      rollbackEventId=rollbackEvent.eventId;
      terminal='ROLLED_BACK_AFTER_VERIFICATION_FAILURE';
    }else{
      terminal='SINGLE_CANARY_COMMIT_VERIFIED';
    }
  }catch(error){
    errorMessage=String(error?.message||error);
    if(committed){
      try{
        const rollbackCorpus=JSON.parse(fs.readFileSync(gate.sourcePath,'utf8'));
        const cur=projectCurrent(rollbackCorpus,gate.target.propertyId,gate.target.fieldName);
        const rollbackEvent={
          eventId:`EVENT-M324-RB-${hash([executionId,'EXCEPTION'].join('|')).slice(0,20).toUpperCase()}`,
          eventType:'GOVERNED_LIVE_CANARY_ROLLBACK',
          canonicalPropertyId:gate.target.propertyId,
          version:`M3.24-RB-${executionId}`,
          milestone:'M3.24',
          executionId,
          manifestId:gate.manifestId,
          rollbackReason:'EXECUTION_EXCEPTION',
          changes:[{
            field:gate.target.fieldName,
            before:clone(cur.value),
            after:clone(gate.target.rollbackValue)
          }]
        };
        rollbackCorpus.events.push(rollbackEvent);
        atomicWriteJson(gate.sourcePath,rollbackCorpus);
        rolledBack=true;rollbackEventId=rollbackEvent.eventId;terminal='ROLLED_BACK_AFTER_EXECUTION_EXCEPTION';
      }catch(rollbackError){
        terminal='ROLLBACK_FAILED_AFTER_EXECUTION_EXCEPTION';
        errorMessage+=`; rollback=${String(rollbackError?.message||rollbackError)}`;
      }
    }
  }

  const receipt={
    milestone:'M3.24',
    executionId,
    manifestId:gate.manifestId,
    eventId:newEventId,
    rollbackEventId,
    propertyId:gate.target.propertyId,
    fieldName:gate.target.fieldName,
    beforeValue:clone(gate.target.beforeValue),
    afterValue:clone(gate.target.afterValue),
    rollbackValue:clone(gate.target.rollbackValue),
    sourceBeforeSha256:sourceBeforeSha,
    sourceAfterSha256:afterSha,
    committed,
    verified,
    rolledBack,
    errorMessage,
    state:terminal,
    singleUseTokenConsumed:true,
    authorityRelocked:true,
    canonicalCommitted:terminal==='SINGLE_CANARY_COMMIT_VERIFIED',
    canonicalCommittedCount:terminal==='SINGLE_CANARY_COMMIT_VERIFIED'?1:0
  };

  fs.mkdirSync(path.dirname(receiptPath),{recursive:true});
  fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
  fs.mkdirSync(path.dirname(auditPath),{recursive:true});
  fs.appendFileSync(auditPath,JSON.stringify(receipt)+'\n');

  const finalState=ensureState(statePath);
  finalState.receipts.push(receipt);
  finalState.audit.push({event:'M3.24_EXECUTION_TERMINAL',...receipt});
  persistState(statePath,finalState);

  return freeze({
    status:terminal==='SINGLE_CANARY_COMMIT_VERIFIED'?'COMMITTED':'SAFE_TERMINAL',
    state:terminal,
    executionId,
    eventId:newEventId,
    rollbackEventId,
    writeExecuted:true,
    writeSucceeded:committed,
    readAfterWriteVerified:verified,
    rollbackExecuted:rolledBack,
    canonicalCommitted:terminal==='SINGLE_CANARY_COMMIT_VERIFIED',
    canonicalCommittedCount:terminal==='SINGLE_CANARY_COMMIT_VERIFIED'?1:0,
    authorityRelocked:true,
    automaticRetry:false,
    generalizedWriteAuthority:false,
    bulkWrites:false,
    multiPropertyWrites:false,
    persistentWriteAuthority:false
  });
}
