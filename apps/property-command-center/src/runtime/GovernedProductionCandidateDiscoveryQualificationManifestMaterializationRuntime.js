// SCIIP Explorer 3.0 — M3.07
// Governed Production Candidate Discovery, Qualification & Manifest Materialization Runtime

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
function stableId(parts,prefix='GD307'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}
function exact(a,b){return clean(a)!=='UNAVAILABLE'&&clean(a)===clean(b);}
function clone(v){return JSON.parse(JSON.stringify(v));}
function get(obj,path){return path.split('.').reduce((v,k)=>v==null?undefined:v[k],obj);}

export function buildGovernedProductionCandidateDiscoveryQualificationManifestMaterializationRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_07_GOVERNED_PRODUCTION_CANDIDATE_DISCOVERY_QUALIFICATION_MANIFEST_MATERIALIZATION_RUNTIME',
    version:'3.0-m3.07',
    status:'READY',
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    discoveryReadOnly:true,
    productionCorpusReadRequired:true,
    syntheticCandidateProhibited:true,
    singleWinnerOnly:true,
    singlePropertyOnly:true,
    singleFieldOnly:true,
    reversibleMutationRequired:true,
    rollbackSnapshotRequired:true,
    lowRiskQualificationRequired:true,
    deterministicRankingRequired:true,
    m306MaterializationBindingRequired:true,
    m305HarnessBindingRequired:true,
    m304ExecutionPlanBindingRequired:true,
    m303RehearsalBindingRequired:true,
    m302HandoffBindingRequired:true,
    m301PreflightBindingRequired:true,
    m298ReadinessBindingRequired:true,
    m296AuthorityBindingRequired:true,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    realCanonicalCommittedCountAtInstall:0
  });
}

export function qualifyProductionCandidate(candidate={}){
  const propertyId=clean(candidate?.propertyId);
  const fieldPath=clean(candidate?.fieldPath);
  let riskScore=0;
  if(candidate?.synthetic===true) riskScore+=1000;
  if(candidate?.destructiveMutation===true) riskScore+=1000;
  if(candidate?.bulkWrite===true) riskScore+=1000;
  if(candidate?.multiProperty===true) riskScore+=1000;
  if(candidate?.persistentWriteAuthority===true) riskScore+=1000;
  if(candidate?.rollbackAvailable!==true) riskScore+=300;
  if(candidate?.canonicalIdentityVerified!==true) riskScore+=300;
  if(candidate?.singleProperty!==true) riskScore+=300;
  if(candidate?.singleField!==true) riskScore+=300;
  if(candidate?.currentValue===undefined) riskScore+=200;
  if(candidate?.proposedValue===undefined) riskScore+=200;
  if(candidate?.currentValue===candidate?.proposedValue) riskScore+=200;
  if(candidate?.currentVersion==null) riskScore+=150;
  if(candidate?.beforeHash==null) riskScore+=150;
  if(candidate?.reversible!==true) riskScore+=300;
  if(candidate?.approvedLowRiskCanary!==true) riskScore+=150;
  if(candidate?.identityCritical===true) riskScore+=100;
  if(candidate?.financialCritical===true) riskScore+=80;
  if(candidate?.relationshipCritical===true) riskScore+=60;

  const qualified =
    propertyId!=='UNAVAILABLE' &&
    fieldPath!=='UNAVAILABLE' &&
    candidate?.actualProductionCandidate===true &&
    candidate?.synthetic!==true &&
    candidate?.singleProperty===true &&
    candidate?.singleField===true &&
    candidate?.approvedLowRiskCanary===true &&
    candidate?.destructiveMutation!==true &&
    candidate?.bulkWrite!==true &&
    candidate?.multiProperty!==true &&
    candidate?.persistentWriteAuthority!==true &&
    candidate?.rollbackAvailable===true &&
    candidate?.canonicalIdentityVerified===true &&
    candidate?.reversible===true &&
    candidate?.currentValue!==undefined &&
    candidate?.proposedValue!==undefined &&
    candidate?.currentValue!==candidate?.proposedValue &&
    clean(candidate?.currentVersion)!=='UNAVAILABLE' &&
    clean(candidate?.beforeHash)!=='UNAVAILABLE' &&
    riskScore<200;

  const qualificationScore = qualified
    ? Math.max(0,1000-riskScore-(candidate?.priorityPenalty||0))
    : -1;

  return Object.freeze({
    propertyId,
    fieldPath,
    currentValue:candidate?.currentValue,
    proposedValue:candidate?.proposedValue,
    currentVersion:clean(candidate?.currentVersion),
    beforeHash:clean(candidate?.beforeHash),
    afterHash:clean(candidate?.afterHash),
    riskScore,
    qualificationScore,
    qualified,
    reason:qualified?'QUALIFIED_LOW_RISK_REVERSIBLE':'REJECTED'
  });
}

export function discoverAndRankProductionCandidates(candidates=[]){
  const evaluated=(Array.isArray(candidates)?candidates:[]).map(qualifyProductionCandidate);
  const qualified=evaluated.filter(c=>c.qualified).sort((a,b)=>{
    if(b.qualificationScore!==a.qualificationScore) return b.qualificationScore-a.qualificationScore;
    if(a.propertyId!==b.propertyId) return a.propertyId.localeCompare(b.propertyId);
    return a.fieldPath.localeCompare(b.fieldPath);
  });

  const winner=qualified[0]||null;
  const discoveryId=stableId([
    ...evaluated.map(c=>`${c.propertyId}:${c.fieldPath}:${c.qualificationScore}:${c.qualified}`)
  ],'GDDI');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_07_PRODUCTION_CANDIDATE_DISCOVERY_RESULT',
    version:'3.0-m3.07',
    status:winner?'READY':'BLOCKED',
    state:winner?'PRODUCTION_CANARY_CANDIDATE_DISCOVERED':'NO_QUALIFIED_PRODUCTION_CANARY_CANDIDATE',
    discoveryId,
    evaluated:Object.freeze(evaluated),
    qualifiedCount:qualified.length,
    winner: winner ? Object.freeze(winner) : null,
    singleWinnerOnly:true,
    syntheticCandidateProhibited:true,
    readOnly:true,
    liveWriteExecuted:false,
    canonicalCommitted:false
  });
}

export async function materializeDiscoveredWinner({
  discoveryResult={},
  governance={},
  adapter,
  hashCanonical
}={}){
  if(discoveryResult?.status!=='READY'||!discoveryResult?.winner){
    return Object.freeze({status:'BLOCKED',state:'DISCOVERY_RESULT_NOT_READY'});
  }
  if(typeof adapter?.readCurrent!=='function'){
    return Object.freeze({status:'BLOCKED',state:'CANONICAL_READ_ADAPTER_MISSING'});
  }
  if(typeof hashCanonical!=='function'){
    return Object.freeze({status:'BLOCKED',state:'CANONICAL_HASHER_MISSING'});
  }

  const winner=discoveryResult.winner;
  const current=await adapter.readCurrent({
    propertyId:winner.propertyId,
    mode:'M3_07_DISCOVERY_MATERIALIZE_READ_ONLY'
  });

  const identityExact=
    current?.canonicalIdentityVerified===true &&
    exact(current?.propertyId,winner.propertyId);

  const versionExact=exact(current?.version,winner.currentVersion);
  const hashExact=exact(current?.hash,winner.beforeHash);
  const liveValue=get(current?.record||{},winner.fieldPath);
  const valueExact=liveValue===winner.currentValue;

  if(!identityExact||!versionExact||!hashExact||!valueExact){
    return Object.freeze({
      status:'BLOCKED',
      state:!identityExact?'DISCOVERY_LIVE_IDENTITY_MISMATCH':
        (!versionExact?'DISCOVERY_LIVE_VERSION_MISMATCH':
          (!hashExact?'DISCOVERY_LIVE_HASH_MISMATCH':'DISCOVERY_LIVE_VALUE_MISMATCH')),
      liveWriteExecuted:false,
      canonicalCommitted:false
    });
  }

  const proposedRecord=clone(current.record);
  const keys=winner.fieldPath.split('.');
  let cursor=proposedRecord;
  for(let i=0;i<keys.length-1;i++){
    if(cursor[keys[i]]==null||typeof cursor[keys[i]]!=='object') cursor[keys[i]]={};
    cursor=cursor[keys[i]];
  }
  cursor[keys[keys.length-1]]=winner.proposedValue;

  const computedAfterHash=clean(await hashCanonical({
    propertyId:winner.propertyId,
    version:winner.currentVersion,
    beforeHash:winner.beforeHash,
    record:proposedRecord
  }));

  const m306=governance?.m306Runtime||{};
  const m305=governance?.m305Harness||{};
  const m304=governance?.m304ExecutionPlan||{};
  const m303=governance?.m303Rehearsal||{};
  const m302=governance?.m302Handoff||{};
  const m301=governance?.m301Preflight||{};
  const m298=governance?.m298Certification||{};
  const auth=(governance?.authorityRuntime?.records||[]).find(r=>r?.consumer===clean(m301?.consumer));

  const governanceReady=
    m306?.status==='READY' &&
    m306?.materializationReadOnly===true &&
    m305?.status==='READY' &&
    m305?.operatorExecutionSeparate===true &&
    m304?.status==='READY' &&
    m304?.state==='FIRST_LIVE_CANARY_EXECUTION_READY' &&
    m303?.status==='CERTIFIED' &&
    m303?.state==='FIRST_LIVE_CANARY_EXECUTION_REHEARSAL_CERTIFIED' &&
    m302?.status==='AUTHORIZED' &&
    m302?.state==='FIRST_LIVE_CANARY_EXECUTION_HANDOFF_AUTHORIZED' &&
    m301?.status==='CERTIFIED' &&
    m301?.state==='FIRST_LIVE_CANARY_PREFLIGHT_CERTIFIED' &&
    m298?.status==='READY' &&
    m298?.state==='LIVE_CANARY_EXECUTION_READY' &&
    auth?.state==='CANARY_WRITE_AUTHORIZED';

  const governanceScopeExact=
    exact(winner.propertyId,m304?.propertyId) &&
    exact(winner.propertyId,m303?.propertyId) &&
    exact(winner.propertyId,m302?.request?.propertyId) &&
    exact(winner.propertyId,m301?.propertyId) &&
    exact(winner.propertyId,m298?.propertyId) &&
    exact(winner.propertyId,auth?.propertyId) &&
    exact(winner.currentVersion,m304?.expectedVersion) &&
    exact(winner.beforeHash,m304?.beforeHash) &&
    exact(winner.beforeHash,auth?.beforeHash);

  const m304AfterHash=clean(m304?.afterHash);
  const afterHashExact=
    (m304AfterHash==='UNAVAILABLE'||m304AfterHash===computedAfterHash) &&
    (winner.afterHash==='UNAVAILABLE'||winner.afterHash===computedAfterHash);

  let state;
  if(!governanceReady) state='DISCOVERY_GOVERNANCE_CHAIN_NOT_READY';
  else if(!governanceScopeExact) state='DISCOVERY_GOVERNANCE_SCOPE_MISMATCH';
  else if(!afterHashExact) state='DISCOVERY_AFTER_HASH_MISMATCH';
  else state='PRODUCTION_CANARY_CANDIDATE_QUALIFIED_AND_MATERIALIZED';

  const ready=state==='PRODUCTION_CANARY_CANDIDATE_QUALIFIED_AND_MATERIALIZED';
  const materializationId=stableId([
    clean(discoveryResult?.discoveryId),
    winner.propertyId,winner.fieldPath,String(winner.currentValue),String(winner.proposedValue),
    winner.currentVersion,winner.beforeHash,computedAfterHash,
    clean(m304?.executionPlanId),clean(m303?.rehearsalReceiptId),clean(m302?.handoffId),
    clean(m301?.preflightCertificationReceiptId),clean(m298?.readinessReceiptId),
    clean(auth?.authorityLeaseId),state
  ],'GDMZ');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_07_PRODUCTION_CANARY_CANDIDATE_MATERIALIZATION',
    version:'3.0-m3.07',
    status:ready?'MATERIALIZED':'BLOCKED',
    state,
    materializationId,
    discoveryId:clean(discoveryResult?.discoveryId),
    propertyId:winner.propertyId,
    fieldPath:winner.fieldPath,
    currentValue:winner.currentValue,
    proposedValue:winner.proposedValue,
    liveVersion:winner.currentVersion,
    beforeHash:winner.beforeHash,
    afterHash:computedAfterHash,
    rollbackSnapshot:Object.freeze({
      propertyId:winner.propertyId,
      version:winner.currentVersion,
      hash:winner.beforeHash,
      record:clone(current.record),
      verified:true
    }),
    proposedRecord,
    actualProductionCandidate:true,
    synthetic:false,
    qualified:true,
    reversible:true,
    lowRisk:true,
    singleProperty:true,
    singleField:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0,
    authorityRelocked:true,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWrite:false,
    multiProperty:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export function buildM307ImmutableOperatorManifest({
  materialized={},
  governance={}
}={}){
  const m304=governance?.m304ExecutionPlan||{};
  const m303=governance?.m303Rehearsal||{};
  const m302=governance?.m302Handoff||{};
  const m301=governance?.m301Preflight||{};
  const m298=governance?.m298Certification||{};
  const auth=(governance?.authorityRuntime?.records||[]).find(r=>r?.consumer===clean(m301?.consumer));

  const materializedReady=
    materialized?.status==='MATERIALIZED' &&
    materialized?.state==='PRODUCTION_CANARY_CANDIDATE_QUALIFIED_AND_MATERIALIZED' &&
    materialized?.actualProductionCandidate===true &&
    materialized?.synthetic===false &&
    materialized?.qualified===true &&
    materialized?.liveWriteExecuted===false &&
    materialized?.canonicalCommitted===false &&
    materialized?.canonicalCommittedCount===0;

  const bindingsExact=
    exact(materialized?.propertyId,m304?.propertyId) &&
    exact(materialized?.propertyId,m303?.propertyId) &&
    exact(materialized?.propertyId,m301?.propertyId) &&
    exact(materialized?.propertyId,m298?.propertyId) &&
    exact(materialized?.propertyId,auth?.propertyId) &&
    exact(materialized?.liveVersion,m304?.expectedVersion) &&
    exact(materialized?.beforeHash,m304?.beforeHash) &&
    exact(materialized?.beforeHash,auth?.beforeHash);

  const ready=materializedReady&&bindingsExact;
  const manifestId=stableId([
    clean(materialized?.materializationId),clean(materialized?.discoveryId),
    clean(materialized?.propertyId),clean(materialized?.fieldPath),
    String(materialized?.currentValue),String(materialized?.proposedValue),
    clean(materialized?.liveVersion),clean(materialized?.beforeHash),clean(materialized?.afterHash),
    clean(m304?.executionPlanId),clean(m303?.rehearsalReceiptId),clean(m302?.handoffId),
    clean(m301?.preflightCertificationReceiptId),clean(m298?.readinessReceiptId),
    clean(auth?.authorityLeaseId),clean(auth?.oneUseAuthorizationToken),
    ready?'READY':'BLOCKED'
  ],'GDOM');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_07_IMMUTABLE_PRODUCTION_CANARY_OPERATOR_MANIFEST',
    version:'3.0-m3.07',
    status:ready?'READY':'BLOCKED',
    state:ready?'IMMUTABLE_PRODUCTION_CANARY_OPERATOR_MANIFEST_READY':'PRODUCTION_CANARY_OPERATOR_MANIFEST_BLOCKED',
    manifestId,
    discoveryId:clean(materialized?.discoveryId),
    materializationId:clean(materialized?.materializationId),
    propertyId:clean(materialized?.propertyId),
    mutation:Object.freeze({
      fieldPath:clean(materialized?.fieldPath),
      currentValue:materialized?.currentValue,
      proposedValue:materialized?.proposedValue
    }),
    canonical:Object.freeze({
      currentVersion:clean(materialized?.liveVersion),
      beforeHash:clean(materialized?.beforeHash),
      afterHash:clean(materialized?.afterHash)
    }),
    rollback:Object.freeze({
      propertyId:clean(materialized?.rollbackSnapshot?.propertyId),
      version:clean(materialized?.rollbackSnapshot?.version),
      hash:clean(materialized?.rollbackSnapshot?.hash),
      verified:materialized?.rollbackSnapshot?.verified===true
    }),
    bindings:Object.freeze({
      m304ExecutionPlanId:clean(m304?.executionPlanId),
      m303RehearsalReceiptId:clean(m303?.rehearsalReceiptId),
      m302HandoffId:clean(m302?.handoffId),
      m301PreflightReceiptId:clean(m301?.preflightCertificationReceiptId),
      m298ReadinessReceiptId:clean(m298?.readinessReceiptId),
      m296AuthorityLeaseId:clean(auth?.authorityLeaseId),
      m296OneUseAuthorizationToken:clean(auth?.oneUseAuthorizationToken)
    }),
    immutable:true,
    actualProductionCandidate:true,
    synthetic:false,
    oneShot:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0,
    authorityRelocked:true,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}
