// SCIIP Explorer 3.0 — M3.10
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
function stableId(parts,p='G310'){const s=parts.join('|');const h=s.split('').reduce((a,c)=>((a*33+c.charCodeAt(0))>>>0),5381);return `${p}-${h.toString(16).toUpperCase().padStart(8,'0')}`;}

export function buildGovernedActualProductionSourceBindingFirstReadOnlyCorpusDiscoveryExecutionRuntime(){
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_10_GOVERNED_ACTUAL_PRODUCTION_SOURCE_BINDING_FIRST_READ_ONLY_CORPUS_DISCOVERY_EXECUTION_RUNTIME',
  version:'3.0-m3.10',status:'READY',
  installerExecutesWrite:false,certificationExecutesWrite:false,
  actualProductionSourceBindingRequired:true,realSourceExecutionRequired:true,
  sourceProvenanceRequired:true,corpusIdentityRequired:true,canonicalReadOnlyRequired:true,
  m309AdapterRequired:true,m308ExecutionRequired:true,evidenceArtifactRequired:true,
  explicitNoQualifiedCandidateOutcomeRequired:true,syntheticSourceProhibited:true,fixtureSourceProhibited:true,
  canonicalMutationAllowed:false,automaticCommit:false,automaticRetryAllowed:false,
  generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,
  persistentWriteAuthority:false,realCanonicalCommittedCountAtInstall:0
 });
}

export function bindActualProductionSource({sourceAdapter,sourceDescriptor={}}={}){
 const descriptor=Object.freeze({
  sourceId:clean(sourceDescriptor.sourceId),sourceType:clean(sourceDescriptor.sourceType),
  environment:clean(sourceDescriptor.environment),canonical:sourceDescriptor.canonical===true,
  production:sourceDescriptor.production===true,readOnly:sourceDescriptor.readOnly===true,
  provenance:clean(sourceDescriptor.provenance),corpusIdentityStrategy:clean(sourceDescriptor.corpusIdentityStrategy),
  fixture:sourceDescriptor.fixture===true,synthetic:sourceDescriptor.synthetic===true
 });
 const valid=descriptor.sourceId!=='UNAVAILABLE'&&descriptor.sourceType!=='UNAVAILABLE'&&
  descriptor.environment==='production'&&descriptor.canonical&&descriptor.production&&descriptor.readOnly&&
  descriptor.provenance!=='UNAVAILABLE'&&descriptor.corpusIdentityStrategy!=='UNAVAILABLE'&&
  !descriptor.fixture&&!descriptor.synthetic&&typeof sourceAdapter?.readCanonicalPropertyCorpus==='function';
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_10_ACTUAL_PRODUCTION_SOURCE_BINDING',version:'3.0-m3.10',
  status:valid?'BOUND':'BLOCKED',state:valid?'ACTUAL_PRODUCTION_SOURCE_BOUND':'ACTUAL_PRODUCTION_SOURCE_BINDING_BLOCKED',
  bindingId:stableId([descriptor.sourceId,descriptor.sourceType,descriptor.provenance,descriptor.corpusIdentityStrategy,String(valid)],'G3SB'),
  descriptor,sourceAdapter,readOnly:true,canonicalMutationAllowed:false
 });
}

export async function executeFirstActualReadOnlyProductionDiscovery({sourceBinding={},m309Runtime,m308Runtime,m307Runtime,policy={},clock=()=>new Date().toISOString()}={}){
 if(sourceBinding?.status!=='BOUND') return Object.freeze({status:'BLOCKED',state:'ACTUAL_PRODUCTION_SOURCE_NOT_BOUND'});
 if(typeof m309Runtime?.createActualProductionCorpusAdapter!=='function'||typeof m309Runtime?.executeActualProductionCorpusDiscovery!=='function')
  return Object.freeze({status:'BLOCKED',state:'M3_09_RUNTIME_INCOMPLETE'});
 if(typeof m308Runtime?.executeLiveProductionCandidateDiscovery!=='function')
  return Object.freeze({status:'BLOCKED',state:'M3_08_RUNTIME_INCOMPLETE'});
 const actualCorpusAdapter=m309Runtime.createActualProductionCorpusAdapter({
  sourceAdapter:sourceBinding.sourceAdapter,sourceDescriptor:sourceBinding.descriptor
 });
 if(actualCorpusAdapter?.status!=='READY') return Object.freeze({status:'BLOCKED',state:'M3_09_ACTUAL_CORPUS_ADAPTER_NOT_READY'});
 const execution=await m309Runtime.executeActualProductionCorpusDiscovery({
  actualCorpusAdapter,m308Runtime,m307Runtime,policy,clock
 });
 const acceptable=execution?.state==='ACTUAL_PRODUCTION_CANARY_CANDIDATE_DISCOVERED'||execution?.state==='ACTUAL_PRODUCTION_DISCOVERY_NO_QUALIFIED_CANDIDATE';
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_10_FIRST_ACTUAL_READ_ONLY_PRODUCTION_DISCOVERY_EXECUTION',
  version:'3.0-m3.10',status:acceptable?'EXECUTED':'BLOCKED',
  state:acceptable?'FIRST_ACTUAL_READ_ONLY_PRODUCTION_DISCOVERY_EXECUTED':`FIRST_ACTUAL_READ_ONLY_PRODUCTION_DISCOVERY_BLOCKED_${clean(execution?.state)}`,
  scanExecutionId:stableId([clean(sourceBinding?.bindingId),clean(execution?.executionId),clean(execution?.corpusId),clean(execution?.corpusVersion),clean(execution?.state)],'G3SX'),
  executedAt:clock(),sourceBindingId:clean(sourceBinding?.bindingId),source:Object.freeze(clone(sourceBinding?.descriptor||{})),
  corpusId:clean(execution?.corpusId),corpusVersion:clean(execution?.corpusVersion),
  evaluatedCount:execution?.evaluatedCount||0,qualifiedCount:execution?.qualifiedCount||0,rejectedCount:execution?.rejectedCount||0,
  selectedCandidate:execution?.selectedCandidate?Object.freeze(clone(execution.selectedCandidate)):null,
  explicitNoQualifiedCandidate:execution?.explicitNoQualifiedCandidate===true,
  actualProduction:true,readOnly:true,liveWriteExecuted:false,mutationPerformed:false,
  canonicalCommitted:false,canonicalCommittedCount:0
 });
}

export function buildFirstActualDiscoveryEvidenceArtifact({execution={}}={}){
 const s=execution?.source||{};
 const validSource=s.production===true&&s.canonical===true&&s.readOnly===true&&s.fixture===false&&s.synthetic===false&&clean(s.sourceId)!=='UNAVAILABLE'&&clean(s.provenance)!=='UNAVAILABLE';
 const validExecution=execution?.status==='EXECUTED'&&execution?.state==='FIRST_ACTUAL_READ_ONLY_PRODUCTION_DISCOVERY_EXECUTED'&&
  execution?.actualProduction===true&&execution?.readOnly===true&&execution?.liveWriteExecuted===false&&
  execution?.mutationPerformed===false&&execution?.canonicalCommitted===false&&execution?.canonicalCommittedCount===0;
 const ready=validSource&&validExecution;
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_10_FIRST_ACTUAL_PRODUCTION_DISCOVERY_EVIDENCE_ARTIFACT',version:'3.0-m3.10',
  status:ready?'CERTIFIED':'BLOCKED',state:ready?'FIRST_ACTUAL_PRODUCTION_DISCOVERY_EVIDENCE_CERTIFIED':'FIRST_ACTUAL_PRODUCTION_DISCOVERY_EVIDENCE_BLOCKED',
  evidenceArtifactId:stableId([clean(execution?.scanExecutionId),clean(execution?.sourceBindingId),clean(execution?.corpusId),clean(execution?.corpusVersion),String(ready)],'G3EA'),
  scanExecutionId:clean(execution?.scanExecutionId),sourceBindingId:clean(execution?.sourceBindingId),
  source:Object.freeze(clone(s)),corpusId:clean(execution?.corpusId),corpusVersion:clean(execution?.corpusVersion),
  evaluatedCount:execution?.evaluatedCount||0,qualifiedCount:execution?.qualifiedCount||0,rejectedCount:execution?.rejectedCount||0,
  selectedCandidate:execution?.selectedCandidate?Object.freeze(clone(execution.selectedCandidate)):null,
  explicitNoQualifiedCandidate:execution?.explicitNoQualifiedCandidate===true,
  immutable:true,actualProduction:true,readOnly:true,liveWriteExecuted:false,mutationPerformed:false,
  canonicalCommitted:false,canonicalCommittedCount:0,automaticCommit:false,automaticRetryAllowed:false,
  generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false
 });
}
