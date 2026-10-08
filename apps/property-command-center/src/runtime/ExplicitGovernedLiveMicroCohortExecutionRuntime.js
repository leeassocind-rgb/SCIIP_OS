// SCIIP Explorer 3.0 — M3.32
// Explicit Governed Live Micro-Cohort Execution Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM332Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_32_EXPLICIT_GOVERNED_LIVE_MICRO_COHORT_EXECUTION_RUNTIME',
    version:'3.0-m3.32',
    status:'READY',
    m331PreauthorizationRequired:true,
    exactManifestRequired:true,
    maximumLiveRecords:3,
    exactBaselineShaRequired:true,
    fullCohortPreflightRequired:true,
    perRecordSingleUseTokenRequired:true,
    perRecordIdempotencyRequired:true,
    sequentialExecutionRequired:true,
    perRecordAtomicWriteRequired:true,
    perRecordReadAfterWriteRequired:true,
    stopOnFirstFailureRequired:true,
    rollbackFailedRecordRequired:true,
    completedPriorRecordsRemainCommitted:true,
    unexecutedLaterRecordsRemainUnmodified:true,
    durablePerRecordReceiptsRequired:true,
    durableCohortReceiptRequired:true,
    explicitOperatorApprovalRequired:true,
    propagationAllowed:false,
    generalizedWriteAuthority:false,
    persistentWriteAuthority:false,
    automaticRetry:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false
  });
}

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function project(corpus,propertyId,fieldName){
  let found=false,value,lastEventId=null;
  for(const e of (Array.isArray(corpus?.events)?corpus.events:[])){
    if(pid(e)!==propertyId)continue;
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(c?.field!==fieldName)continue;
      found=true;value=clone(c.after);lastEventId=e?.eventId??null;
    }
  }
  return {found,value,lastEventId};
}
function readSource(source){
  const bytes=fs.readFileSync(source);
  const corpus=JSON.parse(bytes.toString('utf8'));
  return {bytes,corpus,sha256:sha(bytes),eventCount:Array.isArray(corpus?.events)?corpus.events.length:0};
}
function atomicWriteJson(filePath,obj){
  const tmp=`${filePath}.m332-${process.pid}-${Date.now()}.tmp`;
  fs.writeFileSync(tmp,JSON.stringify(obj,null,2)+'\n',{flag:'wx'});
  fs.renameSync(tmp,filePath);
}
function ensureLedger(p){
  if(!fs.existsSync(p)){
    fs.mkdirSync(path.dirname(p),{recursive:true});
    fs.writeFileSync(p,JSON.stringify({consumedTokens:[],idempotencyKeys:[]},null,2)+'\n');
  }
  const x=JSON.parse(fs.readFileSync(p,'utf8'));
  if(!Array.isArray(x.consumedTokens))x.consumedTokens=[];
  if(!Array.isArray(x.idempotencyKeys))x.idempotencyKeys=[];
  return x;
}
function writeLedger(p,x){
  fs.mkdirSync(path.dirname(p),{recursive:true});
  const tmp=`${p}.tmp-${process.pid}`;
  fs.writeFileSync(tmp,JSON.stringify(x,null,2)+'\n');
  fs.renameSync(tmp,p);
}

export function certifyM331ExecutionBinding({evidence}={}){
  const m=evidence?.preauthorizationManifest;
  const p=evidence?.finalCohortPreflight;
  const ok=
    evidence?.status==='PASSED' &&
    m?.status==='CERTIFIED' &&
    m?.explicitExecutionMilestoneRequired==='M3.32' &&
    m?.liveExecutionAuthorized===false &&
    m?.cohortSize===3 &&
    m?.records?.length===3 &&
    m?.allRecordQualificationHashesBound===true &&
    m?.allRecordTokensSingleUse===true &&
    p?.status==='CERTIFIED' &&
    p?.allStateCurrent===true;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'M331_PREAUTHORIZATION_BOUND_FOR_M332':'M331_PREAUTHORIZATION_BINDING_FAILED',
    manifestId:m?.manifestId??null,
    sourcePath:m?.authoritativeSource??null,
    baselineSha256:m?.authoritativeSourceSha256??null,
    records:ok?freeze(m.records):freeze([])
  });
}

export function finalCohortPreWriteCheck({binding}={}){
  if(binding?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'M331_BINDING_NOT_CERTIFIED'});
  if(!binding.sourcePath||!fs.existsSync(binding.sourcePath))return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_MISSING'});

  let r;try{r=readSource(binding.sourcePath);}catch{return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_READ_FAILED'});}
  const shaOk=r.sha256===binding.baselineSha256;
  const checks=binding.records.map(x=>{
    const cur=project(r.corpus,x.propertyId,x.fieldName);
    return freeze({
      propertyId:x.propertyId,
      fieldName:x.fieldName,
      expectedBefore:clone(x.beforeValue),
      observedCurrent:clone(cur.value),
      lastEventId:cur.lastEventId,
      stateOk:cur.found&&same(cur.value,x.beforeValue)
    });
  });
  const allStateCurrent=checks.length===3&&checks.every(x=>x.stateOk);
  return freeze({
    status:shaOk&&allStateCurrent?'CERTIFIED':'BLOCKED',
    state:shaOk&&allStateCurrent?'FINAL_LIVE_MICRO_COHORT_PREWRITE_CHECK_CERTIFIED':'FINAL_LIVE_MICRO_COHORT_PREWRITE_CHECK_BLOCKED',
    shaOk,allStateCurrent,
    expectedSha256:binding.baselineSha256,
    observedSha256:r.sha256,
    eventCount:r.eventCount,
    checks:freeze(checks)
  });
}

function makeEvent({manifestId,record,sequence,sourceShaBefore}){
  const eventId='EVENT-M332-'+sha(Buffer.from([
    manifestId,record.propertyId,record.fieldName,record.beforeValue,record.afterValue,
    sequence,sourceShaBefore,record.qualificationHash
  ].join('|'))).slice(0,20).toUpperCase();

  return {
    eventId,
    eventType:'GOVERNED_LIVE_MICRO_COHORT_FIELD_UPDATE',
    canonicalPropertyId:record.propertyId,
    version:eventId,
    milestone:'M3.32',
    cohortManifestId:manifestId,
    cohortSequence:sequence,
    idempotencyKey:record.idempotencyKey,
    qualificationHash:record.qualificationHash,
    changes:[{
      field:record.fieldName,
      before:clone(record.beforeValue),
      after:clone(record.afterValue)
    }]
  };
}

function executeOneRecord({
  sourcePath,manifestId,record,sequence,ledger,ledgerPath,injectVerificationFailure=false
}){
  if(ledger.consumedTokens.includes(record.singleUseToken)){
    return {status:'BLOCKED',state:'SINGLE_USE_TOKEN_ALREADY_CONSUMED',sequence,propertyId:record.propertyId};
  }
  if(ledger.idempotencyKeys.includes(record.idempotencyKey)){
    return {status:'BLOCKED',state:'IDEMPOTENCY_KEY_ALREADY_COMMITTED',sequence,propertyId:record.propertyId};
  }

  const beforeRead=readSource(sourcePath);
  const current=project(beforeRead.corpus,record.propertyId,record.fieldName);
  if(!current.found||!same(current.value,record.beforeValue)){
    return {
      status:'BLOCKED',state:'PER_RECORD_PREWRITE_STATE_MISMATCH',sequence,propertyId:record.propertyId,
      expectedBefore:clone(record.beforeValue),observedCurrent:clone(current.value)
    };
  }

  const event=makeEvent({manifestId,record,sequence,sourceShaBefore:beforeRead.sha256});
  const working=JSON.parse(beforeRead.bytes.toString('utf8'));
  if(!Array.isArray(working.events)){
    return {status:'BLOCKED',state:'CANONICAL_EVENTS_ARRAY_MISSING',sequence,propertyId:record.propertyId};
  }

  // Consume token immediately before this record's sole write attempt.
  ledger.consumedTokens.push(record.singleUseToken);
  writeLedger(ledgerPath,ledger);

  working.events.push(event);
  let wrote=false;
  try{
    atomicWriteJson(sourcePath,working);
    wrote=true;

    let verify=readSource(sourcePath);
    let cur=project(verify.corpus,record.propertyId,record.fieldName);
    let verified=cur.found&&same(cur.value,record.afterValue)&&cur.lastEventId===event.eventId;

    if(injectVerificationFailure)verified=false;

    if(!verified){
      // Failed record only: restore exact pre-record bytes.
      fs.writeFileSync(sourcePath,beforeRead.bytes);
      return {
        status:'ROLLED_BACK',
        state:'LIVE_MICRO_COHORT_RECORD_ROLLED_BACK_AFTER_VERIFICATION_FAILURE',
        sequence,
        propertyId:record.propertyId,
        eventId:event.eventId,
        sourceShaBefore:beforeRead.sha256,
        writePerformed:true,
        readAfterWriteVerified:false,
        rolledBack:true,
        tokenConsumed:true,
        idempotencyCommitted:false,
        canonicalCommitted:false
      };
    }

    ledger.idempotencyKeys.push(record.idempotencyKey);
    writeLedger(ledgerPath,ledger);

    return {
      status:'PASSED',
      state:'LIVE_MICRO_COHORT_RECORD_COMMITTED_AND_VERIFIED',
      sequence,
      propertyId:record.propertyId,
      fieldName:record.fieldName,
      eventId:event.eventId,
      beforeValue:clone(record.beforeValue),
      afterValue:clone(record.afterValue),
      sourceShaBefore:beforeRead.sha256,
      sourceShaAfter:verify.sha256,
      eventCountAfter:verify.eventCount,
      writePerformed:true,
      readAfterWriteVerified:true,
      rolledBack:false,
      tokenConsumed:true,
      idempotencyCommitted:true,
      canonicalCommitted:true
    };
  }catch(e){
    try{if(wrote)fs.writeFileSync(sourcePath,beforeRead.bytes);}catch{}
    return {
      status:'FAILED',
      state:'LIVE_MICRO_COHORT_RECORD_EXECUTION_EXCEPTION',
      sequence,
      propertyId:record.propertyId,
      error:String(e?.message||e),
      writePerformed:wrote,
      rolledBack:wrote
    };
  }
}

export function executeExplicitLiveMicroCohort({
  binding,
  approval,
  manifestId,
  ledgerPath,
  recordReceiptDir,
  cohortReceiptPath,
  auditPath,
  injectFailureAtRecord=null
}={}){
  if(approval!=='YES')return freeze({status:'BLOCKED',state:'EXPLICIT_OPERATOR_APPROVAL_REQUIRED',canonicalCommits:0});
  if(binding?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'M331_BINDING_NOT_CERTIFIED',canonicalCommits:0});
  if(manifestId!==binding.manifestId)return freeze({status:'BLOCKED',state:'MANIFEST_ID_MISMATCH',canonicalCommits:0});

  const pre=finalCohortPreWriteCheck({binding});
  if(pre.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'FINAL_COHORT_PREWRITE_CHECK_FAILED',preWriteCheck:pre,canonicalCommits:0});

  const ledger=ensureLedger(ledgerPath);
  const receipts=[];
  let halted=false,haltReason=null;

  fs.mkdirSync(recordReceiptDir,{recursive:true});
  fs.mkdirSync(path.dirname(cohortReceiptPath),{recursive:true});
  fs.mkdirSync(path.dirname(auditPath),{recursive:true});

  for(let i=0;i<binding.records.length;i++){
    if(halted)break;
    const rec=binding.records[i];
    const receipt=executeOneRecord({
      sourcePath:binding.sourcePath,
      manifestId:binding.manifestId,
      record:rec,
      sequence:i+1,
      ledger,
      ledgerPath,
      injectVerificationFailure:injectFailureAtRecord===i+1
    });
    receipts.push(receipt);

    fs.writeFileSync(
      path.join(recordReceiptDir,`m3-32-record-${i+1}-${rec.propertyId}.json`),
      JSON.stringify(receipt,null,2)+'\n'
    );
    fs.appendFileSync(auditPath,JSON.stringify({type:'M3_32_RECORD_TERMINAL',...receipt})+'\n');

    if(receipt.status!=='PASSED'){
      halted=true;
      haltReason=receipt.state;
    }
  }

  const committed=receipts.filter(r=>r.status==='PASSED'&&r.canonicalCommitted===true).length;
  const rolledBack=receipts.filter(r=>r.rolledBack===true).length;
  const terminalState=
    !halted&&committed===3
      ? 'LIVE_MICRO_COHORT_COMMITTED_AND_VERIFIED'
      : halted
        ? 'LIVE_MICRO_COHORT_HALTED_WITH_FAILURE_CONTAINED'
        : 'LIVE_MICRO_COHORT_INCOMPLETE';

  const finalRead=readSource(binding.sourcePath);
  const cohortReceipt={
    contract:'SCIIP_EXPLORER_3_M3_32_LIVE_MICRO_COHORT_TERMINAL_RECEIPT',
    version:'3.0-m3.32',
    status:terminalState==='LIVE_MICRO_COHORT_COMMITTED_AND_VERIFIED'?'PASSED':'SAFE_TERMINAL',
    state:terminalState,
    manifestId:binding.manifestId,
    requestedRecords:binding.records.length,
    executedRecords:receipts.length,
    canonicalCommits:committed,
    rolledBackRecords:rolledBack,
    halted,
    haltReason,
    finalAuthoritativeSha256:finalRead.sha256,
    finalCanonicalEventCount:finalRead.eventCount,
    records:receipts,
    propagationExecuted:false,
    liveWriteAuthorityRelocked:true,
    generalizedWriteAuthority:false,
    persistentWriteAuthority:false,
    automaticRetry:false
  };

  fs.writeFileSync(cohortReceiptPath,JSON.stringify(cohortReceipt,null,2)+'\n');
  fs.appendFileSync(auditPath,JSON.stringify({type:'M3_32_COHORT_TERMINAL',...cohortReceipt})+'\n');

  return freeze({
    status:cohortReceipt.status,
    state:cohortReceipt.state,
    preWriteCheck:pre,
    manifestId:binding.manifestId,
    executedRecords:receipts.length,
    canonicalCommits:committed,
    rolledBackRecords:rolledBack,
    halted,
    haltReason,
    finalAuthoritativeSha256:finalRead.sha256,
    finalCanonicalEventCount:finalRead.eventCount,
    liveWriteAuthorityRelocked:true,
    propagationExecuted:false,
    receipts:freeze(receipts)
  });
}
