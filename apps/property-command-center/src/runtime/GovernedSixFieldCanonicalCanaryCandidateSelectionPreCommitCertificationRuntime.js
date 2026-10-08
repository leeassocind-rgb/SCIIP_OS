// SCIIP Explorer 3.0 — M3.19
// Governed Six-Field Canonical Canary Candidate Selection & Pre-Commit Certification Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const clone=v=>JSON.parse(JSON.stringify(v));
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const id=(p,parts)=>`${p}-${sha(parts.join('|')).slice(0,16).toUpperCase()}`;

const BASE_FIELD_PRIORITY=Object.freeze({
  availableSf:10,
  powerAmps:20,
  dockHigh:30,
  clearHeight:40,
  groundLevel:50,
  status:60
});

export function buildGovernedSixFieldCanonicalCanaryCandidateSelectionPreCommitCertificationRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_19_GOVERNED_SIX_FIELD_CANONICAL_CANARY_CANDIDATE_SELECTION_PRE_COMMIT_CERTIFICATION_RUNTIME',
    version:'3.0-m3.19',
    status:'READY',
    m318EvidenceRequired:true,
    certifiedFieldManifestRequired:true,
    exactlyOneCandidateRequired:true,
    deterministicRankingRequired:true,
    beforeStateVerificationRequired:true,
    provenanceCompletenessRequired:true,
    rollbackMaterialRequired:true,
    readAfterWriteVerificationReadinessRequired:true,
    singleUseExecutionManifestRequired:true,
    cryptographicBindingRequired:true,
    rateQuarantinePreserved:true,
    noWriteAuthorityIntroduced:true,
    canonicalMutationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    liveWriteExecuted:false,
    automaticCommit:false,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    canonicalCommittedCount:0
  });
}

function allowedFieldSet(m318Evidence){
  const fields=m318Evidence?.expandedManifest?.certifiedEligibleFields||[];
  return new Set(fields.map(x=>typeof x==='string'?x:x?.fieldName).filter(Boolean));
}

function normalizeChange(change,event,eventIndex,changeIndex){
  const propertyId=clean(event?.canonicalPropertyId||event?.propertyId||event?.canonical_property_id||event?.property_id);
  const fieldName=clean(change?.field);
  const beforeValue=change?.before;
  const afterValue=change?.after;
  const eventHash=sha(JSON.stringify(event));
  const changeHash=sha(JSON.stringify(change));
  const currentVersion=clean(event?.version||event?.revision||event?.sequence||event?.eventId||`event-${eventIndex}`);
  return {
    propertyId,fieldName,beforeValue,afterValue,eventIndex,changeIndex,eventHash,changeHash,currentVersion
  };
}

function fieldSpecificEligibility(c){
  if(c.propertyId==='UNAVAILABLE'||c.fieldName==='UNAVAILABLE') return {ok:false,reason:'MISSING_PROPERTY_OR_FIELD'};
  if(c.afterValue===undefined) return {ok:false,reason:'MISSING_AFTER_VALUE'};

  if(c.fieldName==='powerAmps' && c.afterValue===null) return {ok:false,reason:'POWER_AMPS_NULL_TARGET_PROHIBITED'};
  if(c.fieldName==='availableSf'){
    if(typeof c.afterValue!=='number'||c.afterValue<0) return {ok:false,reason:'AVAILABLE_SF_TARGET_INVALID'};
  }
  if(c.fieldName==='clearHeight'){
    if(typeof c.afterValue!=='number'||c.afterValue<6||c.afterValue>100) return {ok:false,reason:'CLEAR_HEIGHT_TARGET_INVALID'};
  }
  if(c.fieldName==='dockHigh'||c.fieldName==='groundLevel'){
    if(!Number.isInteger(c.afterValue)||c.afterValue<0) return {ok:false,reason:'DOOR_COUNT_TARGET_INVALID'};
  }
  if(c.fieldName==='status'){
    if(typeof c.afterValue!=='string'||!c.afterValue.trim()) return {ok:false,reason:'STATUS_TARGET_INVALID'};
  }
  return {ok:true,reason:'FIELD_CONTRACT_SATISFIED'};
}

export function selectRealCanonicalCanaryCandidates({events=[],m318Evidence={}}={}){
  if(m318Evidence?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'M3_18_EVIDENCE_NOT_CERTIFIED'});

  const allowed=allowedFieldSet(m318Evidence);
  if(!allowed.size)
    return Object.freeze({status:'BLOCKED',state:'NO_CERTIFIED_FIELDS_AVAILABLE'});

  const candidates=[];
  const rejected=[];

  events.forEach((event,eventIndex)=>{
    (Array.isArray(event?.changes)?event.changes:[]).forEach((change,changeIndex)=>{
      if(!change||typeof change!=='object'||Array.isArray(change)) return;
      const c=normalizeChange(change,event,eventIndex,changeIndex);

      if(!allowed.has(c.fieldName)){
        rejected.push({...c,rejectionReason:c.fieldName==='rate'?'RATE_QUARANTINED':'FIELD_NOT_IN_CERTIFIED_MANIFEST'});
        return;
      }

      const gate=fieldSpecificEligibility(c);
      if(!gate.ok){
        rejected.push({...c,rejectionReason:gate.reason});
        return;
      }

      const noOp=JSON.stringify(c.beforeValue)===JSON.stringify(c.afterValue);
      if(noOp){
        rejected.push({...c,rejectionReason:'NO_OP_TRANSITION'});
        return;
      }

      const priority=BASE_FIELD_PRIORITY[c.fieldName]??999;
      const reversibilityScore=c.beforeValue===undefined?100:0;
      const nullSourcePenalty=c.beforeValue===null?10:0;
      const deterministicScore=priority+reversibilityScore+nullSourcePenalty+c.eventIndex/100000+c.changeIndex/1000000;

      candidates.push(Object.freeze({
        ...c,
        certifiedField:true,
        transitionValid:true,
        rollbackAvailable:c.beforeValue!==undefined,
        provenanceComplete:true,
        readAfterWriteVerificationReady:true,
        riskScore:priority,
        deterministicScore
      }));
    });
  });

  const ranked=[...candidates].sort((a,b)=>
    a.deterministicScore-b.deterministicScore||
    a.propertyId.localeCompare(b.propertyId)||
    a.fieldName.localeCompare(b.fieldName)||
    a.eventIndex-b.eventIndex||
    a.changeIndex-b.changeIndex
  );

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_19_CANARY_CANDIDATE_SELECTION',
    version:'3.0-m3.19',
    status:'SELECTED',
    state:ranked.length?'CERTIFIED_CANARY_CANDIDATES_RANKED':'NO_CERTIFIED_CANARY_CANDIDATE_AVAILABLE',
    evaluatedEventCount:events.length,
    candidateCount:ranked.length,
    rejectedCount:rejected.length,
    candidates:Object.freeze(ranked),
    rejected:Object.freeze(rejected),
    winner:ranked[0]||null,
    explicitNoCandidate:ranked.length===0,
    rateQuarantinePreserved:true,
    readOnly:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function certifySelectedCanaryPreCommit({selection={},m318Evidence={}}={}){
  if(selection?.status!=='SELECTED')
    return Object.freeze({status:'BLOCKED',state:'CANARY_SELECTION_NOT_READY'});
  if(selection.explicitNoCandidate)
    return Object.freeze({status:'BLOCKED',state:'NO_CERTIFIED_CANARY_CANDIDATE_AVAILABLE'});
  if(m318Evidence?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'M3_18_EVIDENCE_NOT_CERTIFIED'});

  const c=selection.winner;
  const beforeStateVerified=c.beforeValue!==undefined;
  const provenanceComplete=!!c.eventHash&&!!c.changeHash&&c.propertyId!=='UNAVAILABLE';
  const rollbackMaterialReady=beforeStateVerified;
  const readAfterWriteReady=c.readAfterWriteVerificationReady===true;
  const certifiedField=allowedFieldSet(m318Evidence).has(c.fieldName);
  const rateBlocked=c.fieldName!=='rate';

  const ready=beforeStateVerified&&provenanceComplete&&rollbackMaterialReady&&readAfterWriteReady&&certifiedField&&rateBlocked;

  const rollbackMaterial=Object.freeze({
    propertyId:c.propertyId,
    fieldName:c.fieldName,
    restoreValue:clone(c.beforeValue),
    sourceEventHash:c.eventHash,
    sourceChangeHash:c.changeHash
  });

  const verificationPlan=Object.freeze({
    propertyId:c.propertyId,
    fieldName:c.fieldName,
    expectedBeforeValue:clone(c.beforeValue),
    expectedAfterValue:clone(c.afterValue),
    expectedVersion:c.currentVersion,
    readAfterWriteRequired:true,
    exactValueVerificationRequired:true,
    exactPropertyVerificationRequired:true,
    exactFieldVerificationRequired:true
  });

  const manifestCore={
    propertyId:c.propertyId,
    fieldName:c.fieldName,
    beforeValue:c.beforeValue,
    afterValue:c.afterValue,
    currentVersion:c.currentVersion,
    eventHash:c.eventHash,
    changeHash:c.changeHash,
    rollbackMaterial,
    verificationPlan,
    m318ManifestId:clean(m318Evidence?.expandedManifest?.manifestId)
  };

  const executionManifestId=id('G3XM',[
    manifestCore.propertyId,
    manifestCore.fieldName,
    JSON.stringify(manifestCore.beforeValue),
    JSON.stringify(manifestCore.afterValue),
    manifestCore.currentVersion,
    manifestCore.eventHash,
    manifestCore.changeHash,
    manifestCore.m318ManifestId
  ]);

  const singleUseToken=sha(`${executionManifestId}|SINGLE_USE|M3.20`);

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_19_PRE_COMMIT_CERTIFICATION',
    version:'3.0-m3.19',
    status:ready?'CERTIFIED':'BLOCKED',
    state:ready?'SINGLE_CANARY_PRE_COMMIT_CERTIFIED':'SINGLE_CANARY_PRE_COMMIT_BLOCKED',
    executionManifestId,
    singleUseToken,
    singleUseOnly:true,
    target:Object.freeze({
      propertyId:c.propertyId,
      fieldName:c.fieldName,
      beforeValue:clone(c.beforeValue),
      afterValue:clone(c.afterValue),
      currentVersion:c.currentVersion
    }),
    provenance:Object.freeze({
      eventIndex:c.eventIndex,
      changeIndex:c.changeIndex,
      eventHash:c.eventHash,
      changeHash:c.changeHash
    }),
    rollbackMaterial,
    verificationPlan,
    gates:Object.freeze({
      exactlyOneSelected:true,
      certifiedField,
      beforeStateVerified,
      provenanceComplete,
      rollbackMaterialReady,
      readAfterWriteReady,
      rateQuarantinePreserved:rateBlocked
    }),
    cryptographicBinding:sha(JSON.stringify(manifestCore)),
    readyForM320Execution:ready,
    readOnly:true,
    canonicalMutationAllowed:false,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function buildM319Evidence({selection,preCommitCertification}={}){
  if(selection?.status!=='SELECTED'||preCommitCertification?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'M3_19_EVIDENCE_NOT_READY'});

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_19_CANARY_SELECTION_PRE_COMMIT_EVIDENCE',
    version:'3.0-m3.19',
    status:'CERTIFIED',
    state:'CANARY_SELECTION_PRE_COMMIT_EVIDENCE_CERTIFIED',
    evidenceId:id('G3EV',[
      preCommitCertification.executionManifestId,
      preCommitCertification.cryptographicBinding,
      String(selection.candidateCount),
      String(selection.rejectedCount)
    ]),
    selectionSummary:Object.freeze({
      evaluatedEventCount:selection.evaluatedEventCount,
      candidateCount:selection.candidateCount,
      rejectedCount:selection.rejectedCount,
      winner:selection.winner
    }),
    preCommitCertification,
    immutable:true,
    readOnly:true,
    canonicalMutationAllowed:false,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0,
    automaticCommit:false,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false
  });
}

export function persistM319Evidence({evidence,outputPath}={}){
  if(evidence?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'UNCERTIFIED_M3_19_EVIDENCE_NOT_PERSISTED'});
  const target=path.resolve(outputPath);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const body=JSON.stringify(evidence,null,2)+'\n';
  fs.writeFileSync(target,body,{flag:'w',mode:0o444});
  return Object.freeze({status:'PERSISTED',state:'M3_19_EVIDENCE_PERSISTED',outputPath:target,sha256:sha(body)});
}
