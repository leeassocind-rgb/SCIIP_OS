// SCIIP Explorer 3.0 — M3.09
// Governed Actual Production Corpus Discovery Adapter & Read-Only Execution Runtime
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
function stableId(parts,prefix='G309'){const s=parts.join('|');const h=s.split('').reduce((a,c)=>((a*33+c.charCodeAt(0))>>>0),5381);return `${prefix}-${h.toString(16).toUpperCase().padStart(8,'0')}`;}
function exact(a,b){return clean(a)!=='UNAVAILABLE'&&clean(a)===clean(b);}

export function buildGovernedActualProductionCorpusDiscoveryAdapterReadOnlyExecutionRuntime(){
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_09_GOVERNED_ACTUAL_PRODUCTION_CORPUS_DISCOVERY_ADAPTER_READ_ONLY_EXECUTION_RUNTIME',
  version:'3.0-m3.09',status:'READY',
  actualProductionSourceRequired:true,sourceProvenanceRequired:true,corpusIdentityRequired:true,
  canonicalReadOnlyRequired:true,m308ExecutionRequired:true,explicitNoCandidateOutcomeRequired:true,
  fixtureExecutionProhibitedInActualMode:true,syntheticCorpusProhibited:true,
  installerExecutesWrite:false,certificationExecutesWrite:false,canonicalMutationAllowed:false,
  automaticCommit:false,automaticRetryAllowed:false,generalizedWriteAuthority:false,
  bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false,
  realCanonicalCommittedCountAtInstall:0
 });
}

export function createActualProductionCorpusAdapter({sourceAdapter,sourceDescriptor={}}={}){
 const descriptor=Object.freeze({
  sourceId:clean(sourceDescriptor.sourceId),sourceType:clean(sourceDescriptor.sourceType),
  environment:clean(sourceDescriptor.environment),canonical:sourceDescriptor.canonical===true,
  production:sourceDescriptor.production===true,readOnly:sourceDescriptor.readOnly===true,
  provenance:clean(sourceDescriptor.provenance),fixture:sourceDescriptor.fixture===true,
  synthetic:sourceDescriptor.synthetic===true
 });
 const descriptorReady=descriptor.sourceId!=='UNAVAILABLE'&&descriptor.sourceType!=='UNAVAILABLE'&&
  descriptor.environment==='production'&&descriptor.canonical&&descriptor.production&&descriptor.readOnly&&
  descriptor.provenance!=='UNAVAILABLE'&&!descriptor.fixture&&!descriptor.synthetic;
 return Object.freeze({
  descriptor,status:descriptorReady?'READY':'BLOCKED',
  async readCandidateCorpus(request={}){
   if(!descriptorReady) return {production:false,synthetic:true,state:'ACTUAL_PRODUCTION_SOURCE_DESCRIPTOR_INVALID',records:[]};
   if(request?.mode!=='M3_08_LIVE_DISCOVERY_READ_ONLY') return {production:false,synthetic:true,state:'NON_READ_ONLY_DISCOVERY_MODE_REJECTED',records:[]};
   if(typeof sourceAdapter?.readCanonicalPropertyCorpus!=='function') return {production:false,synthetic:true,state:'CANONICAL_SOURCE_READ_ADAPTER_MISSING',records:[]};
   const result=await sourceAdapter.readCanonicalPropertyCorpus({readOnly:true,purpose:'M3_09_ACTUAL_PRODUCTION_CANARY_DISCOVERY'});
   if(result?.production!==true||result?.canonical!==true||result?.synthetic===true||result?.fixture===true||!Array.isArray(result?.records))
    return {production:false,synthetic:true,state:'ACTUAL_PRODUCTION_SOURCE_RESPONSE_UNVERIFIED',records:[]};
   const corpusId=clean(result.corpusId);
   const version=clean(result.version);
   if(corpusId==='UNAVAILABLE'||version==='UNAVAILABLE') return {production:false,synthetic:true,state:'CORPUS_IDENTITY_MISSING',records:[]};
   return Object.freeze({
    production:true,canonical:true,synthetic:false,fixture:false,readOnly:true,
    corpusId,version,sourceId:descriptor.sourceId,sourceType:descriptor.sourceType,
    provenance:descriptor.provenance,records:Object.freeze(clone(result.records))
   });
  }
 });
}

export async function executeActualProductionCorpusDiscovery({
 actualCorpusAdapter,m308Runtime,m307Runtime,policy={},clock=()=>new Date().toISOString()
}={}){
 if(actualCorpusAdapter?.status!=='READY') return Object.freeze({status:'BLOCKED',state:'ACTUAL_PRODUCTION_CORPUS_ADAPTER_NOT_READY'});
 if(typeof m308Runtime?.executeLiveProductionCandidateDiscovery!=='function')
  return Object.freeze({status:'BLOCKED',state:'M3_08_EXECUTION_RUNTIME_MISSING'});
 const execution=await m308Runtime.executeLiveProductionCandidateDiscovery({
  corpusAdapter:actualCorpusAdapter,m307Runtime,policy,clock
 });
 const descriptor=actualCorpusAdapter.descriptor||{};
 const noCandidate=execution?.state==='LIVE_PRODUCTION_DISCOVERY_NO_QUALIFIED_WINNER';
 const winner=execution?.state==='LIVE_PRODUCTION_CANARY_CANDIDATE_DISCOVERED';
 const acceptable=winner||noCandidate;
 const state=winner?'ACTUAL_PRODUCTION_CANARY_CANDIDATE_DISCOVERED':
  noCandidate?'ACTUAL_PRODUCTION_DISCOVERY_NO_QUALIFIED_CANDIDATE':
  `ACTUAL_PRODUCTION_DISCOVERY_BLOCKED_${clean(execution?.state)}`;
 const executionId=stableId([clean(execution?.executionId),clean(execution?.corpusId),clean(execution?.corpusVersion),
  descriptor.sourceId,descriptor.provenance,state],'GAEX');
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_09_ACTUAL_PRODUCTION_CORPUS_DISCOVERY_EXECUTION',
  version:'3.0-m3.09',status:acceptable?'EXECUTED':'BLOCKED',state,executionId,
  source:Object.freeze(clone(descriptor)),m308Execution:Object.freeze(clone(execution)),
  corpusId:clean(execution?.corpusId),corpusVersion:clean(execution?.corpusVersion),
  evaluatedCount:execution?.evaluatedCount||0,qualifiedCount:execution?.qualifiedCount||0,
  rejectedCount:execution?.rejectedCount||0,selectedCandidate:execution?.winner?Object.freeze(clone(execution.winner)):null,
  explicitNoQualifiedCandidate:noCandidate,actualProduction:true,readOnly:true,
  liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0
 });
}

export function buildActualProductionDiscoveryEvidenceReceipt({execution={}}={}){
 const source=execution?.source||{};
 const validSource=source.production===true&&source.canonical===true&&source.readOnly===true&&
  source.fixture===false&&source.synthetic===false&&clean(source.sourceId)!=='UNAVAILABLE'&&clean(source.provenance)!=='UNAVAILABLE';
 const validOutcome=execution?.status==='EXECUTED'&&(
  execution?.state==='ACTUAL_PRODUCTION_CANARY_CANDIDATE_DISCOVERED'||
  execution?.state==='ACTUAL_PRODUCTION_DISCOVERY_NO_QUALIFIED_CANDIDATE');
 const ready=validSource&&validOutcome&&execution?.liveWriteExecuted===false&&execution?.canonicalCommitted===false;
 const receiptId=stableId([clean(execution?.executionId),clean(execution?.corpusId),clean(execution?.corpusVersion),
  clean(source.sourceId),clean(source.provenance),clean(execution?.state),String(execution?.evaluatedCount),
  clean(execution?.selectedCandidate?.propertyId),clean(execution?.selectedCandidate?.fieldPath),ready?'CERTIFIED':'BLOCKED'],'GAER');
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_09_ACTUAL_PRODUCTION_DISCOVERY_EVIDENCE_RECEIPT',
  version:'3.0-m3.09',status:ready?'CERTIFIED':'BLOCKED',
  state:ready?'ACTUAL_PRODUCTION_DISCOVERY_EVIDENCE_CERTIFIED':'ACTUAL_PRODUCTION_DISCOVERY_EVIDENCE_BLOCKED',
  receiptId,executionId:clean(execution?.executionId),source:Object.freeze(clone(source)),
  corpusId:clean(execution?.corpusId),corpusVersion:clean(execution?.corpusVersion),
  outcome:clean(execution?.state),evaluatedCount:execution?.evaluatedCount||0,
  qualifiedCount:execution?.qualifiedCount||0,rejectedCount:execution?.rejectedCount||0,
  selectedCandidate:execution?.selectedCandidate?Object.freeze(clone(execution.selectedCandidate)):null,
  explicitNoQualifiedCandidate:execution?.explicitNoQualifiedCandidate===true,
  immutable:true,actualProduction:true,readOnly:true,liveWriteExecuted:false,
  mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0,
  automaticCommit:false,automaticRetryAllowed:false,generalizedWriteAuthority:false,
  bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false
 });
}
