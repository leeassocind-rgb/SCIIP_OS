// SCIIP Explorer 3.0 — M3.01
// Governed Live Canary Candidate Selection & Preflight Evidence Runtime

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GC301'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function normalizeChangedFields(fields){
  if(!Array.isArray(fields)) return Object.freeze([]);
  return Object.freeze([...new Set(fields.map(v=>clean(v)).filter(v=>v!=='UNAVAILABLE'))].sort());
}

function scoreRisk(candidate={}){
  let score=0;
  if(candidate?.destructiveMutation===true) score+=100;
  if(candidate?.multiProperty===true) score+=100;
  if(candidate?.bulkWrite===true) score+=100;
  if(candidate?.identityCritical===true) score+=50;
  if(candidate?.financialCritical===true) score+=40;
  if(candidate?.relationshipCritical===true) score+=30;
  if(candidate?.changedFieldCount>3) score+=20;
  if(candidate?.rollbackSnapshotAvailable!==true) score+=50;
  if(candidate?.currentRecordVerified!==true) score+=30;
  return score;
}

export function evaluateLiveCanaryCandidate(candidate={}){
  const changedFields=normalizeChangedFields(candidate?.changedFields);
  const changedFieldCount=changedFields.length;
  const riskScore=scoreRisk({...candidate,changedFieldCount});
  const lowRisk=
    candidate?.approvedLowRiskCanary===true &&
    candidate?.singleProperty===true &&
    candidate?.bulkWrite!==true &&
    candidate?.multiProperty!==true &&
    candidate?.destructiveMutation!==true &&
    candidate?.rollbackSnapshotAvailable===true &&
    candidate?.currentRecordVerified===true &&
    changedFieldCount>=1 &&
    changedFieldCount<=3 &&
    riskScore<50;

  return Object.freeze({
    propertyId:clean(candidate?.propertyId),
    mutationSummary:clean(candidate?.mutationSummary),
    changedFields,
    changedFieldCount,
    riskScore,
    riskClass:lowRisk?'LOW':'BLOCKED',
    lowRisk,
    rollbackSnapshotAvailable:candidate?.rollbackSnapshotAvailable===true,
    currentRecordVerified:candidate?.currentRecordVerified===true
  });
}

export function buildGovernedLiveCanaryCandidateSelectionPreflightEvidence({
  m300Runtime={},
  orchestration={},
  adapterCertification={},
  authorityRuntime={},
  candidate={},
  canonicalBefore={},
  canonicalAfter={},
  rollbackSnapshot={}
}={}){
  const evaluated=evaluateLiveCanaryCandidate(candidate);
  const consumer=clean(adapterCertification?.consumer);
  const auth=(authorityRuntime?.records||[]).find(r=>r?.consumer===consumer);

  const m300Ready=
    m300Runtime?.status==='READY' &&
    m300Runtime?.installerExecutesWrite===false &&
    m300Runtime?.operatorApprovalRequired===true &&
    m300Runtime?.mutationDiffRequired===true &&
    m300Runtime?.m298ReadinessRequired===true &&
    m300Runtime?.m296OneUseAuthorityRequired===true &&
    m300Runtime?.m299ExplicitInvocationRequired===true &&
    m300Runtime?.singleTransactionOnly===true &&
    m300Runtime?.singlePropertyOnly===true &&
    m300Runtime?.lowRiskCanaryOnly===true &&
    m300Runtime?.generalizedWriteAuthority===false &&
    m300Runtime?.bulkWritesAllowed===false &&
    m300Runtime?.multiPropertyWritesAllowed===false &&
    m300Runtime?.persistentWriteAuthority===false &&
    m300Runtime?.automaticCommit===false &&
    m300Runtime?.realCanonicalCommittedCountAtInstall===0;

  const orchestrationReady=
    orchestration?.status==='READY' &&
    orchestration?.state==='AWAITING_FINAL_OPERATOR_APPROVAL' &&
    clean(orchestration?.approvalChallengeId)!=='UNAVAILABLE' &&
    clean(orchestration?.orchestrationId)!=='UNAVAILABLE';

  const adapterReady=
    adapterCertification?.status==='READY' &&
    adapterCertification?.state==='LIVE_CANARY_EXECUTION_READY' &&
    adapterCertification?.liveCanaryExecutionReady===true &&
    clean(adapterCertification?.readinessReceiptId)!=='UNAVAILABLE';

  const authorityReady=
    auth?.state==='CANARY_WRITE_AUTHORIZED' &&
    auth?.canaryWriteAuthorized===true &&
    clean(auth?.authorityLeaseId)!=='UNAVAILABLE' &&
    clean(auth?.oneUseAuthorizationToken)!=='UNAVAILABLE';

  const propertyId=clean(evaluated.propertyId);
  const propertyScopeExact=
    propertyId!=='UNAVAILABLE' &&
    propertyId===clean(orchestration?.propertyId) &&
    propertyId===clean(adapterCertification?.propertyId) &&
    propertyId===clean(auth?.propertyId);

  const beforeVersion=clean(canonicalBefore?.version);
  const beforeHash=clean(canonicalBefore?.hash);
  const afterHash=clean(canonicalAfter?.hash);

  const beforeExact=
    beforeVersion!=='UNAVAILABLE' &&
    beforeHash!=='UNAVAILABLE' &&
    beforeVersion===clean(auth?.expectedVersion) &&
    beforeHash===clean(auth?.beforeHash);

  const afterExact=
    afterHash!=='UNAVAILABLE' &&
    afterHash===clean(auth?.afterHash);

  const rollbackExact=
    rollbackSnapshot?.verified===true &&
    clean(rollbackSnapshot?.propertyId)===propertyId &&
    clean(rollbackSnapshot?.version)===beforeVersion &&
    clean(rollbackSnapshot?.hash)===beforeHash;

  const currentIdentityVerified=
    canonicalBefore?.canonicalIdentityVerified===true &&
    clean(canonicalBefore?.propertyId)===propertyId;

  const proposedIdentityVerified=
    canonicalAfter?.canonicalIdentityVerified===true &&
    clean(canonicalAfter?.propertyId)===propertyId;

  const changedFieldEvidenceExact=
    Array.isArray(canonicalAfter?.changedFields) &&
    JSON.stringify([...canonicalAfter.changedFields].map(clean).sort())===
    JSON.stringify([...evaluated.changedFields]);

  const certified=
    m300Ready &&
    orchestrationReady &&
    adapterReady &&
    authorityReady &&
    evaluated.lowRisk &&
    propertyScopeExact &&
    beforeExact &&
    afterExact &&
    rollbackExact &&
    currentIdentityVerified &&
    proposedIdentityVerified &&
    changedFieldEvidenceExact;

  let state;
  if(!m300Ready) state='M3_00_RUNTIME_NOT_READY';
  else if(!orchestrationReady) state='M3_00_ORCHESTRATION_NOT_READY';
  else if(!adapterReady) state='M2_98_READINESS_NOT_READY';
  else if(!authorityReady) state='M2_96_AUTHORITY_NOT_READY';
  else if(!evaluated.lowRisk) state='CANDIDATE_RISK_REJECTED';
  else if(!propertyScopeExact) state='PROPERTY_SCOPE_MISMATCH';
  else if(!beforeExact) state='CANONICAL_BEFORE_MISMATCH';
  else if(!afterExact) state='CANONICAL_AFTER_MISMATCH';
  else if(!rollbackExact) state='ROLLBACK_SNAPSHOT_MISMATCH';
  else if(!currentIdentityVerified) state='CURRENT_CANONICAL_IDENTITY_UNVERIFIED';
  else if(!proposedIdentityVerified) state='PROPOSED_CANONICAL_IDENTITY_UNVERIFIED';
  else if(!changedFieldEvidenceExact) state='CHANGED_FIELD_EVIDENCE_MISMATCH';
  else state='FIRST_LIVE_CANARY_PREFLIGHT_CERTIFIED';

  const evidencePackageId=stableId([
    clean(m300Runtime?.version),
    clean(orchestration?.orchestrationId),
    clean(orchestration?.approvalChallengeId),
    clean(adapterCertification?.readinessReceiptId),
    clean(auth?.authorityLeaseId),
    propertyId,
    beforeVersion,
    beforeHash,
    afterHash,
    evaluated.changedFields.join(','),
    String(evaluated.riskScore),
    state
  ],'GCEP');

  const rollbackEvidenceId=rollbackExact
    ?stableId([evidencePackageId,'ROLLBACK_SNAPSHOT',beforeVersion,beforeHash],'GCRB')
    :'UNAVAILABLE';

  const diffEvidenceId=changedFieldEvidenceExact
    ?stableId([evidencePackageId,'FIELD_DIFF',...evaluated.changedFields],'GCDF')
    :'UNAVAILABLE';

  const preflightCertificationReceiptId=certified
    ?stableId([evidencePackageId,'FIRST_LIVE_CANARY_PREFLIGHT_CERTIFIED'],'GCPR')
    :'UNAVAILABLE';

  const evidence=Object.freeze({
    propertyIdentity:Object.freeze({
      propertyId,
      canonicalIdentityVerified:currentIdentityVerified&&proposedIdentityVerified
    }),
    canonicalBefore:Object.freeze({
      version:beforeVersion,
      hash:beforeHash
    }),
    canonicalAfter:Object.freeze({
      hash:afterHash
    }),
    mutation:Object.freeze({
      summary:evaluated.mutationSummary,
      changedFields:evaluated.changedFields,
      changedFieldCount:evaluated.changedFieldCount
    }),
    risk:Object.freeze({
      score:evaluated.riskScore,
      classification:evaluated.riskClass,
      lowRisk:evaluated.lowRisk
    }),
    rollback:Object.freeze({
      rollbackEvidenceId,
      snapshotVerified:rollbackExact,
      propertyId:clean(rollbackSnapshot?.propertyId),
      version:clean(rollbackSnapshot?.version),
      hash:clean(rollbackSnapshot?.hash)
    }),
    bindings:Object.freeze({
      m300OrchestrationId:clean(orchestration?.orchestrationId),
      m300ApprovalChallengeId:clean(orchestration?.approvalChallengeId),
      m298ReadinessReceiptId:clean(adapterCertification?.readinessReceiptId),
      m296AuthorityLeaseId:clean(auth?.authorityLeaseId),
      m296OneUseAuthorizationToken:clean(auth?.oneUseAuthorizationToken)
    }),
    diffEvidenceId
  });

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_01_GOVERNED_LIVE_CANARY_CANDIDATE_SELECTION_PREFLIGHT_EVIDENCE_RUNTIME',
    version:'3.0-m3.01',
    status:certified?'CERTIFIED':'BLOCKED',
    state,
    evidencePackageId,
    preflightCertificationReceiptId,
    propertyId,
    consumer,
    evidence,
    candidateEvaluated:true,
    preflightCertified:certified,
    liveWriteExecuted:false,
    canonicalCommitted:false,
    operatorApprovalStillRequired:true,
    m299InvocationStillExplicit:true,
    authorityRelocked:true,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export function buildGovernedLiveCanaryCandidateSelectionPreflightEvidenceRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_01_GOVERNED_LIVE_CANARY_CANDIDATE_SELECTION_PREFLIGHT_EVIDENCE_RUNTIME',
    version:'3.0-m3.01',
    status:'READY',
    installerExecutesWrite:false,
    candidateSelectionRequired:true,
    preflightEvidenceRequired:true,
    rollbackSnapshotRequired:true,
    canonicalIdentityVerificationRequired:true,
    fieldLevelDiffEvidenceRequired:true,
    riskClassificationRequired:true,
    m300ApprovalChallengeBindingRequired:true,
    m298ReadinessBindingRequired:true,
    m296AuthorityBindingRequired:true,
    singleTransactionOnly:true,
    singlePropertyOnly:true,
    lowRiskCanaryOnly:true,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    realCanonicalCommittedCountAtInstall:0
  });
}
