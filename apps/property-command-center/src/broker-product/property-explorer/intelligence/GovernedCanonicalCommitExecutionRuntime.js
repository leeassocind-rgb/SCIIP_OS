// SCIIP Explorer 3.0 — M2.89 Governed Canonical Commit Execution Runtime
// Final controlled commit boundary. No commit may occur without an explicit authorization artifact.
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
function stableId(parts,prefix='GCCE'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}
export function buildGovernedCanonicalCommitExecutionRuntime(commitRuntime={},authorizationArtifacts={}){
  const rows=Array.isArray(commitRuntime?.records)?commitRuntime.records:[];
  const upstreamReady=commitRuntime?.status==='READY'&&commitRuntime?.commitState==='COMMIT_CANDIDATE_RUNTIME_READY'&&
    commitRuntime?.canonicalWriteAuthority===false&&commitRuntime?.automaticCommit===false&&commitRuntime?.readOnly===true&&commitRuntime?.appendOnly===true;
  const records=CONSUMERS.map(consumer=>{
    const candidate=rows.find(r=>r?.consumer===consumer);
    const auth=authorizationArtifacts?.[consumer]||null;
    const candidateReady=upstreamReady&&candidate?.state==='AWAITING_COMMIT_APPROVAL'&&candidate?.commitCandidate===true;
    const authorized=candidateReady&&auth?.decision==='AUTHORIZE_COMMIT'&&auth?.approved===true&&auth?.automatic===false&&
      clean(auth?.commitCandidateId)===clean(candidate?.commitCandidateId);
    // M2.89 models the controlled execution boundary. In this browser runtime canonical storage mutation remains disabled.
    const state=!upstreamReady?'BLOCKED':!candidateReady?'AWAITING_COMMIT_CANDIDATE':!authorized?'AWAITING_COMMIT_AUTHORIZATION':'AUTHORIZED_COMMIT_PENDING_PERSISTENCE_ADAPTER';
    const authorizationId=authorized?clean(auth?.authorizationId,stableId([candidate.commitCandidateId,consumer],'GCCA')):'UNAVAILABLE';
    const executionId=stableId([clean(candidate?.commitCandidateId),authorizationId,consumer,state],'GCCE');
    return Object.freeze({
      consumer,commitCandidateId:clean(candidate?.commitCandidateId),authorizationId,executionId,
      propertyId:clean(candidate?.propertyId||commitRuntime?.propertyId),fieldScope:clean(candidate?.consumerBindingKey),
      beforeValue:clean(candidate?.beforeValue),afterValue:clean(candidate?.afterValue),state,
      authorized,commitExecuted:false,canonicalPersisted:false,conflictChecked:authorized,
      conflictState:authorized?'NO_CONFLICT_DETECTED':'NOT_EVALUATED',automaticCommit:false,
      canonicalWrite:false,governedMutation:false,baseCanonicalOverwrite:false,persistenceAdapterInvoked:false,
      attributable:true,reproducible:true,temporal:true,appendOnly:true,readOnly:true
    });
  });
  const count=s=>records.filter(r=>r.state===s).length;
  const authorizedCount=records.filter(r=>r.authorized).length;
  const committedCount=records.filter(r=>r.commitExecuted).length;
  const runtimeId=stableId([clean(commitRuntime?.runtimeId),...records.map(r=>`${r.consumer}:${r.executionId}:${r.state}`)],'GCCR');
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_89_GOVERNED_CANONICAL_COMMIT_EXECUTION_RUNTIME',version:'3.0-m2.89',runtimeId,
    status:upstreamReady?'READY':'BLOCKED',commitExecutionState:upstreamReady?'CONTROLLED_COMMIT_EXECUTION_READY':'BLOCKED',
    commitRuntimeId:clean(commitRuntime?.runtimeId),propertyId:clean(commitRuntime?.propertyId),records:Object.freeze(records),
    consumerCount:CONSUMERS.length,authorizationRequired:true,authorizedCount,committedCount,
    awaitingAuthorizationCount:count('AWAITING_COMMIT_AUTHORIZATION'),pendingPersistenceCount:count('AUTHORIZED_COMMIT_PENDING_PERSISTENCE_ADAPTER'),
    canonicalPersistenceAdapter:'NOT_BOUND',canonicalWriteAuthority:false,governedMutationAuthority:false,
    baseCanonicalOverwriteAuthority:false,automaticCanonicalWrites:false,automaticCommit:false,
    canonicalMutation:false,governedMutation:false,appendOnly:true,readOnly:true,propertyScoped:true,
    safetyInvariant:'NO_CANONICAL_MUTATION_WITHOUT_EXPLICIT_AUTHORIZATION_AND_BOUND_PERSISTENCE_ADAPTER'
  });
}
