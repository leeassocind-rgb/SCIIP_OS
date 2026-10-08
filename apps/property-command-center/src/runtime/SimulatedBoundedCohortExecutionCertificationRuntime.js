// SCIIP Explorer 3.0 — M3.29
// Simulated Bounded Cohort Execution Certification Runtime
import fs from 'node:fs';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM329Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_29_SIMULATED_BOUNDED_COHORT_EXECUTION_CERTIFICATION_RUNTIME',
    version:'3.0-m3.29',
    status:'READY',
    m328PolicyRequired:true,
    simulatedCohortOnly:true,
    cohortSizeRequired:3,
    deterministicOrderingRequired:true,
    preflightAllRecordsRequired:true,
    perRecordQualificationRequired:true,
    idempotencyRequired:true,
    replayProtectionRequired:true,
    perRecordTransactionBoundaryRequired:true,
    readAfterWriteSimulationRequired:true,
    rollbackRehearsalRequired:true,
    haltOnFirstFailureRequired:true,
    perRecordReceiptRequired:true,
    cohortReceiptRequired:true,
    liveMutationAllowed:false,
    canonicalCommitAllowed:false,
    propagationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    operationalIngestionAuthorized:false
  });
}

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}

export function projectCurrentState(corpus){
  const current={};
  const lineage=[];
  for(const [i,e] of (Array.isArray(corpus?.events)?corpus.events:[]).entries()){
    const propertyId=pid(e);
    if(!propertyId)continue;
    current[propertyId] ||= {};
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(!c?.field)continue;
      current[propertyId][c.field]=clone(c.after);
      lineage.push({eventIndex:i,eventId:e?.eventId??`event-${i}`,propertyId,fieldName:c.field,before:clone(c.before),after:clone(c.after)});
    }
  }
  return freeze({
    status:'PROJECTED',
    propertyCount:Object.keys(current).length,
    transitionCount:lineage.length,
    currentState:freeze(current),
    lineage:freeze(lineage)
  });
}

function proposeAvailableSf(current){
  if(typeof current!=='number'||!Number.isFinite(current)||current<=1)return null;
  const delta=Math.max(1,Math.round(Math.abs(current)*0.005));
  const after=current-delta;
  if(after<0||after===current)return null;
  return {after,delta,deltaPct:delta/current};
}

export function constructDeterministicSimulatedCohort({
  projection,
  cohortSize=3,
  fieldName='availableSf'
}={}){
  if(projection?.status!=='PROJECTED')return freeze({status:'BLOCKED',state:'PROJECTION_REQUIRED'});
  if(cohortSize!==3)return freeze({status:'BLOCKED',state:'M3_29_REQUIRES_THREE_RECORD_COHORT'});
  const candidates=[];

  for(const propertyId of Object.keys(projection.currentState||{}).sort()){
    const current=projection.currentState[propertyId]?.[fieldName];
    const proposal=proposeAvailableSf(current);
    if(!proposal)continue;

    const idempotencyKey=sha([propertyId,fieldName,current,proposal.after,'CLASS_B_SMALL_COHORT_SINGLE_FIELD','SIMULATED'].join('|'));
    const token=sha(`${idempotencyKey}|M3.29|SIMULATED|SINGLE_USE`);
    candidates.push(freeze({
      propertyId,fieldName,
      beforeValue:current,
      afterValue:proposal.after,
      rollbackValue:current,
      delta:proposal.delta,
      deltaPct:proposal.deltaPct,
      mutationClass:'CLASS_B_SMALL_COHORT_SINGLE_FIELD',
      idempotencyKey,
      simulatedSingleUseToken:token,
      qualificationHash:sha([propertyId,fieldName,current,proposal.after,idempotencyKey].join('|'))
    }));
    if(candidates.length===cohortSize)break;
  }

  return freeze({
    status:candidates.length===cohortSize?'CERTIFIED':'BLOCKED',
    state:candidates.length===cohortSize?'DETERMINISTIC_SIMULATED_COHORT_CONSTRUCTED':'INSUFFICIENT_QUALIFIED_RECORDS_FOR_SIMULATED_COHORT',
    cohortSize:candidates.length,
    records:freeze(candidates),
    deterministicOrdering:true
  });
}

export function preflightSimulatedCohort({cohort,policy}={}){
  const classB=policy?.mutationClassPolicy?.classes?.find(x=>x?.classId==='CLASS_B_SMALL_COHORT_SINGLE_FIELD');
  const governance=policy?.cohortGovernance;
  const policyCertified=policy?.operationalPolicyCertification?.status==='CERTIFIED';
  const simulatedAuthorized=policy?.operationalPolicyCertification?.simulatedCohortAuthorized===true;
  const stage=policy?.progressiveRolloutPolicy?.currentAuthorizedStage==='SIMULATED_COHORT';

  const records=(cohort?.records||[]).map((r,index)=>{
    const checks={
      propertyIdentity:typeof r.propertyId==='string'&&r.propertyId.length>0,
      approvedClass:r.mutationClass==='CLASS_B_SMALL_COHORT_SINGLE_FIELD',
      exactBefore:typeof r.beforeValue==='number',
      boundedAfter:typeof r.afterValue==='number'&&r.afterValue>=0&&r.afterValue<r.beforeValue,
      nonNoOp:r.afterValue!==r.beforeValue,
      idempotencyKey:typeof r.idempotencyKey==='string'&&r.idempotencyKey.length===64,
      token:typeof r.simulatedSingleUseToken==='string'&&r.simulatedSingleUseToken.length===64,
      rollback:r.rollbackValue===r.beforeValue,
      qualificationHash:typeof r.qualificationHash==='string'&&r.qualificationHash.length===64
    };
    const qualified=Object.values(checks).every(Boolean);
    return freeze({index:index+1,propertyId:r.propertyId,qualified,checks:freeze(checks)});
  });

  const allQualified=records.length===3&&records.every(r=>r.qualified);
  const cohortWithinPolicy=
    classB?.maxRecordsPerOperation>=3 &&
    governance?.initialOperationalCohortLimit>=3 &&
    governance?.hardMaximumWithoutNewMilestone>=3;

  const ok=policyCertified&&simulatedAuthorized&&stage&&cohortWithinPolicy&&allQualified;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'SIMULATED_COHORT_PREFLIGHT_CERTIFIED':'SIMULATED_COHORT_PREFLIGHT_BLOCKED',
    policyCertified,simulatedAuthorized,stage,cohortWithinPolicy,allQualified,
    records:freeze(records)
  });
}

function runOne(record,tokenLedger,{injectVerificationFailure=false}={}){
  if(tokenLedger.has(record.simulatedSingleUseToken)){
    return {
      status:'BLOCKED',
      state:'SIMULATED_TOKEN_REPLAY_BLOCKED',
      propertyId:record.propertyId,
      tokenConsumed:false,
      simulatedCommit:false,
      readAfterWriteVerified:false,
      rolledBack:false
    };
  }

  const before=record.beforeValue;
  let simulatedCurrent=before;
  tokenLedger.add(record.simulatedSingleUseToken);
  simulatedCurrent=record.afterValue;

  const verificationObserved=injectVerificationFailure ? record.afterValue+1 : simulatedCurrent;
  const verified=same(verificationObserved,record.afterValue);

  let rolledBack=false;
  if(!verified){
    simulatedCurrent=record.rollbackValue;
    rolledBack=true;
  }

  return {
    status:verified?'PASSED':'ROLLED_BACK',
    state:verified?'SIMULATED_RECORD_COMMITTED_AND_VERIFIED':'SIMULATED_RECORD_ROLLED_BACK_AFTER_VERIFICATION_FAILURE',
    propertyId:record.propertyId,
    fieldName:record.fieldName,
    beforeValue:before,
    afterValue:record.afterValue,
    finalSimulatedValue:simulatedCurrent,
    idempotencyKey:record.idempotencyKey,
    tokenConsumed:true,
    simulatedCommit:verified,
    readAfterWriteVerified:verified,
    rolledBack
  };
}

export function executeSimulatedCohort({
  cohort,
  preflight,
  injectFailureAtRecord=null
}={}){
  if(preflight?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'PREFLIGHT_NOT_CERTIFIED'});
  const records=cohort?.records||[];
  const ledger=new Set();
  const receipts=[];
  let halted=false,haltReason=null;

  for(let i=0;i<records.length;i++){
    if(halted)break;
    const receipt=runOne(records[i],ledger,{injectVerificationFailure:injectFailureAtRecord===i+1});
    receipts.push(freeze(receipt));
    if(receipt.status!=='PASSED'){
      halted=true;
      haltReason=receipt.state;
    }
  }

  const completed=receipts.length;
  const verified=receipts.filter(r=>r.status==='PASSED').length;
  const rolledBack=receipts.filter(r=>r.rolledBack).length;
  const terminalOk=injectFailureAtRecord===null
    ? (completed===3&&verified===3&&!halted)
    : (halted===true&&rolledBack===1&&completed===injectFailureAtRecord);

  return freeze({
    status:terminalOk?'CERTIFIED':'BLOCKED',
    state:injectFailureAtRecord===null
      ? (terminalOk?'SIMULATED_THREE_RECORD_COHORT_COMPLETED':'SIMULATED_COHORT_COMPLETION_FAILED')
      : (terminalOk?'SIMULATED_FAILURE_CONTAINMENT_AND_ROLLBACK_CERTIFIED':'SIMULATED_FAILURE_CONTAINMENT_FAILED'),
    requestedRecords:records.length,
    completedRecords:completed,
    verifiedRecords:verified,
    rolledBackRecords:rolledBack,
    halted,
    haltReason,
    receipts:freeze(receipts),
    tokenLedger:freeze([...ledger]),
    canonicalWritesExecuted:0,
    canonicalCommits:0
  });
}

export function certifyReplayRejection({cohort,successfulExecution}={}){
  const consumed=new Set(successfulExecution?.tokenLedger||[]);
  const replayReceipts=(cohort?.records||[]).map(r=>freeze(runOne(r,consumed)));
  const allBlocked=replayReceipts.length===3&&replayReceipts.every(r=>r.state==='SIMULATED_TOKEN_REPLAY_BLOCKED');
  return freeze({
    status:allBlocked?'CERTIFIED':'BLOCKED',
    state:allBlocked?'SIMULATED_COHORT_REPLAY_REJECTION_CERTIFIED':'SIMULATED_COHORT_REPLAY_REJECTION_FAILED',
    replayAttempts:replayReceipts.length,
    replayBlockedCount:replayReceipts.filter(r=>r.status==='BLOCKED').length,
    receipts:freeze(replayReceipts)
  });
}

export function buildM329Certification({
  cohort,preflight,successfulExecution,failureRehearsal,replayCertification
}={}){
  const ok=
    cohort?.status==='CERTIFIED' &&
    cohort?.cohortSize===3 &&
    preflight?.status==='CERTIFIED' &&
    successfulExecution?.status==='CERTIFIED' &&
    successfulExecution?.verifiedRecords===3 &&
    successfulExecution?.canonicalCommits===0 &&
    failureRehearsal?.status==='CERTIFIED' &&
    failureRehearsal?.rolledBackRecords===1 &&
    failureRehearsal?.halted===true &&
    replayCertification?.status==='CERTIFIED';

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_29_SIMULATED_BOUNDED_COHORT_EXECUTION_CERTIFICATION',
    version:'3.0-m3.29',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'SIMULATED_BOUNDED_COHORT_EXECUTION_CERTIFIED':'SIMULATED_BOUNDED_COHORT_EXECUTION_BLOCKED',
    certificationId:ok?`G329C-${sha([
      cohort.records.map(r=>r.qualificationHash).join('|'),
      successfulExecution.verifiedRecords,
      failureRehearsal.rolledBackRecords,
      replayCertification.replayBlockedCount
    ].join('|')).slice(0,16).toUpperCase()}`:null,
    simulatedCohortSize:cohort?.cohortSize??0,
    normalPathCertified:successfulExecution?.status==='CERTIFIED',
    failureContainmentCertified:failureRehearsal?.status==='CERTIFIED',
    replayRejectionCertified:replayCertification?.status==='CERTIFIED',
    canonicalWritesExecuted:0,
    canonicalCommits:0,
    liveMicroCohortAuthorized:false,
    operationalIngestionAuthorized:false,
    nextMilestone:'M3.30_LIVE_MICRO_COHORT_POLICY_AND_EXECUTION_READINESS'
  });
}
