// SCIIP Explorer 3.0 — M3.11
// Governed Real Canonical Corpus Source Resolution & First Actual Discovery Evidence Materialization Runtime
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
function stableId(parts,p='G311'){const s=parts.join('|');const h=s.split('').reduce((a,c)=>((a*33+c.charCodeAt(0))>>>0),5381);return `${p}-${h.toString(16).toUpperCase().padStart(8,'0')}`;}
function exact(a,b){return clean(a)!=='UNAVAILABLE'&&clean(a)===clean(b);}

export function buildGovernedRealCanonicalCorpusSourceResolutionFirstActualDiscoveryEvidenceMaterializationRuntime(){
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_11_GOVERNED_REAL_CANONICAL_CORPUS_SOURCE_RESOLUTION_FIRST_ACTUAL_DISCOVERY_EVIDENCE_MATERIALIZATION_RUNTIME',
  version:'3.0-m3.11',status:'READY',
  installerExecutesWrite:false,certificationExecutesWrite:false,
  canonicalAssetResolutionRequired:true,canonicalAssetFilename:'canonical-property-identity-data.json',
  sha256VerificationRequired:true,sourceProvenanceRequired:true,corpusIdentityRequired:true,
  actualRecordScanRequired:true,m310ExecutionRequired:true,immutableEvidenceRequired:true,
  explicitNoQualifiedCandidateOutcomeRequired:true,syntheticSourceProhibited:true,fixtureSourceProhibited:true,
  canonicalMutationAllowed:false,automaticCommit:false,automaticRetryAllowed:false,
  generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,
  persistentWriteAuthority:false,realCanonicalCommittedCountAtInstall:0
 });
}

export function resolveCanonicalCorpusSource({asset={}}={}){
 const filename=clean(asset.filename);
 const sha256=clean(asset.sha256);
 const bytes=Number(asset.bytes||0);
 const provenance=clean(asset.provenance);
 const corpusVersion=clean(asset.corpusVersion);
 const records=Array.isArray(asset.records)?asset.records:[];
 const valid=
  filename==='canonical-property-identity-data.json' &&
  /^[a-f0-9]{64}$/i.test(sha256) &&
  bytes>0 &&
  provenance!=='UNAVAILABLE' &&
  corpusVersion!=='UNAVAILABLE' &&
  records.length>0 &&
  asset.production===true &&
  asset.canonical===true &&
  asset.readOnly===true &&
  asset.synthetic!==true &&
  asset.fixture!==true;

 const sourceId=stableId([filename,sha256,String(bytes),provenance,corpusVersion,String(records.length),String(valid)],'G3CS');
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_11_CANONICAL_CORPUS_SOURCE_RESOLUTION',
  version:'3.0-m3.11',status:valid?'RESOLVED':'BLOCKED',
  state:valid?'REAL_CANONICAL_CORPUS_SOURCE_RESOLVED':'REAL_CANONICAL_CORPUS_SOURCE_BLOCKED',
  sourceId,filename,sha256,bytes,provenance,corpusVersion,recordCount:records.length,
  records:Object.freeze(clone(records)),production:true,canonical:true,readOnly:true,synthetic:false,fixture:false
 });
}

export async function executeFirstRealCanonicalDiscovery({
 resolvedSource={},
 m310Runtime,
 m309Runtime,
 m308Runtime,
 m307Runtime,
 policy={},
 clock=()=>new Date().toISOString()
}={}){
 if(resolvedSource?.status!=='RESOLVED')
  return Object.freeze({status:'BLOCKED',state:'REAL_CANONICAL_CORPUS_SOURCE_NOT_RESOLVED'});

 if(typeof m310Runtime?.bindActualProductionSource!=='function' ||
    typeof m310Runtime?.executeFirstActualReadOnlyProductionDiscovery!=='function')
  return Object.freeze({status:'BLOCKED',state:'M3_10_RUNTIME_INCOMPLETE'});

 const sourceAdapter={
  async readCanonicalPropertyCorpus(req){
   if(req?.readOnly!==true) return {production:false,canonical:false,synthetic:true,fixture:false,records:[]};
   return Object.freeze({
    production:true,canonical:true,synthetic:false,fixture:false,
    corpusId:resolvedSource.sourceId,version:resolvedSource.corpusVersion,
    records:Object.freeze(clone(resolvedSource.records))
   });
  }
 };

 const sourceDescriptor={
  sourceId:resolvedSource.sourceId,
  sourceType:'canonical-property-identity-data',
  environment:'production',
  canonical:true,production:true,readOnly:true,
  provenance:resolvedSource.provenance,
  corpusIdentityStrategy:'filename+sha256+bytes+recordCount',
  fixture:false,synthetic:false
 };

 const binding=m310Runtime.bindActualProductionSource({sourceAdapter,sourceDescriptor});
 if(binding?.status!=='BOUND')
  return Object.freeze({status:'BLOCKED',state:'M3_10_SOURCE_BINDING_FAILED'});

 const execution=await m310Runtime.executeFirstActualReadOnlyProductionDiscovery({
  sourceBinding:binding,m309Runtime,m308Runtime,m307Runtime,policy,clock
 });

 const acceptable=execution?.status==='EXECUTED' &&
  execution?.state==='FIRST_ACTUAL_READ_ONLY_PRODUCTION_DISCOVERY_EXECUTED';

 const scanId=stableId([
  resolvedSource.sourceId,resolvedSource.sha256,String(resolvedSource.recordCount),
  clean(execution?.scanExecutionId),clean(execution?.corpusId),clean(execution?.corpusVersion),
  String(execution?.evaluatedCount||0),String(execution?.qualifiedCount||0),String(execution?.rejectedCount||0),
  clean(execution?.selectedCandidate?.propertyId),clean(execution?.selectedCandidate?.fieldPath),
  String(execution?.explicitNoQualifiedCandidate===true),acceptable?'EXECUTED':'BLOCKED'
 ],'G3RS');

 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_11_FIRST_REAL_CANONICAL_DISCOVERY_EXECUTION',
  version:'3.0-m3.11',status:acceptable?'EXECUTED':'BLOCKED',
  state:acceptable?'FIRST_REAL_CANONICAL_DISCOVERY_EXECUTED':`FIRST_REAL_CANONICAL_DISCOVERY_BLOCKED_${clean(execution?.state)}`,
  scanId,executedAt:clock(),
  source:Object.freeze({
   sourceId:resolvedSource.sourceId,filename:resolvedSource.filename,sha256:resolvedSource.sha256,
   bytes:resolvedSource.bytes,provenance:resolvedSource.provenance,
   corpusVersion:resolvedSource.corpusVersion,recordCount:resolvedSource.recordCount
  }),
  m310Execution:Object.freeze(clone(execution)),
  evaluatedCount:execution?.evaluatedCount||0,
  qualifiedCount:execution?.qualifiedCount||0,
  rejectedCount:execution?.rejectedCount||0,
  selectedCandidate:execution?.selectedCandidate?Object.freeze(clone(execution.selectedCandidate)):null,
  explicitNoQualifiedCandidate:execution?.explicitNoQualifiedCandidate===true,
  actualProduction:true,readOnly:true,liveWriteExecuted:false,mutationPerformed:false,
  canonicalCommitted:false,canonicalCommittedCount:0
 });
}

export function buildFirstRealCanonicalDiscoveryEvidence({execution={}}={}){
 const src=execution?.source||{};
 const validSource=
  clean(src.filename)==='canonical-property-identity-data.json' &&
  /^[a-f0-9]{64}$/i.test(clean(src.sha256)) &&
  Number(src.bytes||0)>0 &&
  clean(src.provenance)!=='UNAVAILABLE' &&
  Number(src.recordCount||0)>0;

 const validExecution=
  execution?.status==='EXECUTED' &&
  execution?.state==='FIRST_REAL_CANONICAL_DISCOVERY_EXECUTED' &&
  execution?.actualProduction===true &&
  execution?.readOnly===true &&
  execution?.liveWriteExecuted===false &&
  execution?.mutationPerformed===false &&
  execution?.canonicalCommitted===false &&
  execution?.canonicalCommittedCount===0;

 const ready=validSource&&validExecution;

 const evidenceId=stableId([
  clean(execution?.scanId),clean(src.sourceId),clean(src.filename),clean(src.sha256),
  String(src.bytes||0),clean(src.provenance),clean(src.corpusVersion),String(src.recordCount||0),
  String(execution?.evaluatedCount||0),String(execution?.qualifiedCount||0),String(execution?.rejectedCount||0),
  clean(execution?.selectedCandidate?.propertyId),clean(execution?.selectedCandidate?.fieldPath),
  String(execution?.explicitNoQualifiedCandidate===true),ready?'CERTIFIED':'BLOCKED'
 ],'G3EV');

 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_11_FIRST_REAL_CANONICAL_DISCOVERY_EVIDENCE',
  version:'3.0-m3.11',status:ready?'CERTIFIED':'BLOCKED',
  state:ready?'FIRST_REAL_CANONICAL_DISCOVERY_EVIDENCE_CERTIFIED':'FIRST_REAL_CANONICAL_DISCOVERY_EVIDENCE_BLOCKED',
  evidenceId,scanId:clean(execution?.scanId),source:Object.freeze(clone(src)),
  evaluatedCount:execution?.evaluatedCount||0,qualifiedCount:execution?.qualifiedCount||0,
  rejectedCount:execution?.rejectedCount||0,
  selectedCandidate:execution?.selectedCandidate?Object.freeze(clone(execution.selectedCandidate)):null,
  explicitNoQualifiedCandidate:execution?.explicitNoQualifiedCandidate===true,
  immutable:true,actualProduction:true,readOnly:true,
  liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0,
  automaticCommit:false,automaticRetryAllowed:false,generalizedWriteAuthority:false,
  bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false
 });
}
