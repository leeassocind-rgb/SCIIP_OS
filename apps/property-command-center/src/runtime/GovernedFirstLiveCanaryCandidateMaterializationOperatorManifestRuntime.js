// SCIIP Explorer 3.0 — M3.06
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
function stableId(parts,prefix='GM306'){const basis=parts.join('|');const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;}
function exact(a,b){return clean(a)!=='UNAVAILABLE'&&clean(a)===clean(b);}
function get(obj,path){return path.split('.').reduce((v,k)=>v==null?undefined:v[k],obj);}
function clone(v){return JSON.parse(JSON.stringify(v));}

export function buildGovernedFirstLiveCanaryCandidateMaterializationOperatorManifestRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_06_GOVERNED_FIRST_LIVE_CANARY_CANDIDATE_MATERIALIZATION_OPERATOR_MANIFEST_RUNTIME',
    version:'3.0-m3.06',status:'READY',
    installerExecutesWrite:false,certificationExecutesWrite:false,materializationReadOnly:true,
    productionCanonicalReadRequired:true,actualCandidateRequired:true,syntheticCandidateProhibited:true,
    singlePropertyOnly:true,singleFieldOnly:true,lowRiskOnly:true,reversibleMutationRequired:true,
    rollbackSnapshotRequired:true,currentValueRequired:true,proposedValueRequired:true,liveVersionRequired:true,
    beforeHashRequired:true,afterHashRequired:true,immutableOperatorManifestRequired:true,
    m305HarnessBindingRequired:true,m304ExecutionPlanBindingRequired:true,m303RehearsalBindingRequired:true,
    m302HandoffBindingRequired:true,m301PreflightBindingRequired:true,m298ReadinessBindingRequired:true,
    m296AuthorityBindingRequired:true,automaticRetryAllowed:false,generalizedWriteAuthority:false,
    bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false,
    automaticCommit:false,realCanonicalCommittedCountAtInstall:0
  });
}

export async function materializeFirstLiveCanaryCandidate({selector={},governance={},adapter,proposeMutation,hashCanonical}={}){
  if(typeof adapter?.readCurrent!=='function') return Object.freeze({status:'BLOCKED',state:'CANONICAL_READ_ADAPTER_MISSING'});
  if(typeof proposeMutation!=='function') return Object.freeze({status:'BLOCKED',state:'MUTATION_PROPOSER_MISSING'});
  if(typeof hashCanonical!=='function') return Object.freeze({status:'BLOCKED',state:'CANONICAL_HASHER_MISSING'});

  const propertyId=clean(selector?.propertyId), fieldPath=clean(selector?.fieldPath);
  const selectorValid=propertyId!=='UNAVAILABLE'&&fieldPath!=='UNAVAILABLE'&&selector?.actualProductionCandidate===true&&
    selector?.synthetic!==true&&selector?.singleProperty===true&&selector?.singleField===true&&
    selector?.approvedLowRiskCanary===true&&selector?.destructiveMutation!==true&&selector?.bulkWrite!==true&&
    selector?.multiProperty!==true&&selector?.persistentWriteAuthority!==true;
  if(!selectorValid) return Object.freeze({status:'BLOCKED',state:'CANDIDATE_SELECTOR_INVALID',propertyId,fieldPath,liveWriteExecuted:false,canonicalCommitted:false});

  const current=await adapter.readCurrent({propertyId,mode:'M3_06_MATERIALIZE_READ_ONLY'});
  const identityValid=current?.canonicalIdentityVerified===true&&exact(current?.propertyId,propertyId);
  const version=clean(current?.version), beforeHash=clean(current?.hash), currentValue=get(current?.record||{},fieldPath);
  if(!(identityValid&&version!=='UNAVAILABLE'&&beforeHash!=='UNAVAILABLE'&&currentValue!==undefined)){
    return Object.freeze({status:'BLOCKED',state:!identityValid?'CANONICAL_IDENTITY_UNVERIFIED':'CURRENT_CANONICAL_STATE_INCOMPLETE',propertyId,fieldPath,liveWriteExecuted:false,canonicalCommitted:false});
  }

  const proposal=await proposeMutation({propertyId,fieldPath,currentValue,currentRecord:clone(current.record),currentVersion:version,beforeHash});
  const proposalValid=proposal?.approved===true&&proposal?.reversible===true&&proposal?.lowRisk===true&&proposal?.destructive!==true&&
    proposal?.proposedValue!==undefined&&proposal?.proposedValue!==currentValue&&clean(proposal?.fieldPath)===fieldPath;
  if(!proposalValid) return Object.freeze({status:'BLOCKED',state:'PROPOSED_MUTATION_REJECTED',propertyId,fieldPath,currentValue,liveWriteExecuted:false,canonicalCommitted:false});

  const afterRecord=clone(current.record), keys=fieldPath.split('.');
  let cursor=afterRecord;
  for(let i=0;i<keys.length-1;i++){if(cursor[keys[i]]==null||typeof cursor[keys[i]]!=='object')cursor[keys[i]]={};cursor=cursor[keys[i]];}
  cursor[keys[keys.length-1]]=proposal.proposedValue;

  const computedAfterHash=clean(await hashCanonical({propertyId,version,beforeHash,record:afterRecord}));
  const rollbackSnapshot=Object.freeze({propertyId,version,hash:beforeHash,record:clone(current.record),verified:true});

  const m305=governance?.m305Harness||{},m304=governance?.m304ExecutionPlan||{},m303=governance?.m303Rehearsal||{},
    m302=governance?.m302Handoff||{},m301=governance?.m301Preflight||{},m298=governance?.m298Certification||{};
  const auth=(governance?.authorityRuntime?.records||[]).find(r=>r?.consumer===clean(m301?.consumer));

  const governanceReady=m305?.status==='READY'&&m305?.operatorExecutionSeparate===true&&m305?.installerExecutesWrite===false&&
    m304?.status==='READY'&&m304?.state==='FIRST_LIVE_CANARY_EXECUTION_READY'&&
    m303?.status==='CERTIFIED'&&m303?.state==='FIRST_LIVE_CANARY_EXECUTION_REHEARSAL_CERTIFIED'&&
    m302?.status==='AUTHORIZED'&&m302?.state==='FIRST_LIVE_CANARY_EXECUTION_HANDOFF_AUTHORIZED'&&
    m301?.status==='CERTIFIED'&&m301?.state==='FIRST_LIVE_CANARY_PREFLIGHT_CERTIFIED'&&
    m298?.status==='READY'&&m298?.state==='LIVE_CANARY_EXECUTION_READY'&&auth?.state==='CANARY_WRITE_AUTHORIZED';

  const scopeExact=exact(propertyId,m304?.propertyId)&&exact(propertyId,m303?.propertyId)&&exact(propertyId,m302?.request?.propertyId)&&
    exact(propertyId,m301?.propertyId)&&exact(propertyId,m298?.propertyId)&&exact(propertyId,auth?.propertyId)&&
    exact(version,m304?.expectedVersion)&&exact(beforeHash,m304?.beforeHash)&&exact(beforeHash,auth?.beforeHash);

  const governanceAfterHash=clean(m304?.afterHash);
  const afterHashCompatible=governanceAfterHash==='UNAVAILABLE'||governanceAfterHash===computedAfterHash;

  let state;
  if(!governanceReady) state='GOVERNANCE_CHAIN_NOT_READY';
  else if(!scopeExact) state='MATERIALIZED_SCOPE_MISMATCH';
  else if(!afterHashCompatible) state='MATERIALIZED_AFTER_HASH_MISMATCH';
  else state='FIRST_LIVE_CANARY_CANDIDATE_MATERIALIZED';

  const ready=state==='FIRST_LIVE_CANARY_CANDIDATE_MATERIALIZED';
  const materializationId=stableId([propertyId,fieldPath,version,beforeHash,computedAfterHash,String(currentValue),String(proposal.proposedValue),
    clean(m304?.executionPlanId),clean(m303?.rehearsalReceiptId),clean(m302?.handoffId),clean(m301?.preflightCertificationReceiptId),
    clean(m298?.readinessReceiptId),clean(auth?.authorityLeaseId),state],'GMCN');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_06_FIRST_LIVE_CANARY_CANDIDATE_MATERIALIZATION',version:'3.0-m3.06',
    status:ready?'MATERIALIZED':'BLOCKED',state,materializationId,propertyId,fieldPath,currentValue,proposedValue:proposal.proposedValue,
    mutationSummary:clean(proposal?.summary),liveVersion:version,beforeHash,afterHash:computedAfterHash,rollbackSnapshot,
    currentRecord:clone(current.record),proposedRecord:afterRecord,actualProductionCandidate:true,synthetic:false,lowRisk:true,reversible:true,
    singleProperty:true,singleField:true,liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0,
    authorityRelocked:true,automaticRetryAllowed:false,generalizedWriteAuthority:false,bulkWrite:false,multiProperty:false,
    persistentWriteAuthority:false,automaticCommit:false
  });
}

export function buildImmutableOperatorManifest({materialized={},governance={}}={}){
  const m304=governance?.m304ExecutionPlan||{},m303=governance?.m303Rehearsal||{},m302=governance?.m302Handoff||{},
    m301=governance?.m301Preflight||{},m298=governance?.m298Certification||{};
  const auth=(governance?.authorityRuntime?.records||[]).find(r=>r?.consumer===clean(m301?.consumer));

  const materializedReady=materialized?.status==='MATERIALIZED'&&materialized?.state==='FIRST_LIVE_CANARY_CANDIDATE_MATERIALIZED'&&
    materialized?.actualProductionCandidate===true&&materialized?.synthetic===false&&materialized?.liveWriteExecuted===false&&
    materialized?.mutationPerformed===false&&materialized?.canonicalCommitted===false&&materialized?.canonicalCommittedCount===0;

  const manifestBindingsExact=exact(materialized?.propertyId,m304?.propertyId)&&exact(materialized?.propertyId,m303?.propertyId)&&
    exact(materialized?.propertyId,m301?.propertyId)&&exact(materialized?.propertyId,m298?.propertyId)&&exact(materialized?.propertyId,auth?.propertyId)&&
    exact(materialized?.liveVersion,m304?.expectedVersion)&&exact(materialized?.beforeHash,m304?.beforeHash)&&exact(materialized?.beforeHash,auth?.beforeHash);

  const ready=materializedReady&&manifestBindingsExact;
  const manifestId=stableId([clean(materialized?.materializationId),clean(materialized?.propertyId),clean(materialized?.fieldPath),
    String(materialized?.currentValue),String(materialized?.proposedValue),clean(materialized?.liveVersion),clean(materialized?.beforeHash),
    clean(materialized?.afterHash),clean(m304?.executionPlanId),clean(m303?.rehearsalReceiptId),clean(m302?.handoffId),
    clean(m301?.preflightCertificationReceiptId),clean(m298?.readinessReceiptId),clean(auth?.authorityLeaseId),
    clean(auth?.oneUseAuthorizationToken),ready?'READY':'BLOCKED'],'GMOM');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_06_IMMUTABLE_FIRST_LIVE_CANARY_OPERATOR_MANIFEST',version:'3.0-m3.06',
    status:ready?'READY':'BLOCKED',state:ready?'IMMUTABLE_FIRST_LIVE_CANARY_OPERATOR_MANIFEST_READY':'OPERATOR_MANIFEST_BLOCKED',
    manifestId,materializationId:clean(materialized?.materializationId),propertyId:clean(materialized?.propertyId),
    mutation:Object.freeze({fieldPath:clean(materialized?.fieldPath),currentValue:materialized?.currentValue,proposedValue:materialized?.proposedValue,summary:clean(materialized?.mutationSummary)}),
    canonical:Object.freeze({currentVersion:clean(materialized?.liveVersion),beforeHash:clean(materialized?.beforeHash),afterHash:clean(materialized?.afterHash)}),
    rollback:Object.freeze({propertyId:clean(materialized?.rollbackSnapshot?.propertyId),version:clean(materialized?.rollbackSnapshot?.version),hash:clean(materialized?.rollbackSnapshot?.hash),verified:materialized?.rollbackSnapshot?.verified===true}),
    bindings:Object.freeze({m304ExecutionPlanId:clean(m304?.executionPlanId),m303RehearsalReceiptId:clean(m303?.rehearsalReceiptId),m302HandoffId:clean(m302?.handoffId),
      m301PreflightReceiptId:clean(m301?.preflightCertificationReceiptId),m298ReadinessReceiptId:clean(m298?.readinessReceiptId),m296AuthorityLeaseId:clean(auth?.authorityLeaseId),
      m296OneUseAuthorizationToken:clean(auth?.oneUseAuthorizationToken)}),
    immutable:true,actualProductionCandidate:true,synthetic:false,oneShot:true,liveWriteExecuted:false,canonicalCommitted:false,canonicalCommittedCount:0,
    authorityRelocked:true,automaticRetryAllowed:false,generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,automaticCommit:false
  });
}
