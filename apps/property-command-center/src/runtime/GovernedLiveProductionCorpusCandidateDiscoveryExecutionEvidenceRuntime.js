// SCIIP Explorer 3.0 — M3.08
// Governed Live Production Corpus Candidate Discovery Execution & Evidence Runtime
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
function stableId(parts,prefix='G308'){const s=parts.join('|');const h=s.split('').reduce((a,c)=>((a*33+c.charCodeAt(0))>>>0),5381);return `${prefix}-${h.toString(16).toUpperCase().padStart(8,'0')}`;}
function exact(a,b){return clean(a)!=='UNAVAILABLE'&&clean(a)===clean(b);}

export function buildGovernedLiveProductionCorpusCandidateDiscoveryExecutionEvidenceRuntime(){
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_08_GOVERNED_LIVE_PRODUCTION_CORPUS_CANDIDATE_DISCOVERY_EXECUTION_EVIDENCE_RUNTIME',
  version:'3.0-m3.08',status:'READY',
  installerExecutesWrite:false,certificationExecutesWrite:false,executionReadOnly:true,
  liveProductionCorpusRequired:true,syntheticCorpusProhibited:true,actualRecordsRequired:true,
  discoveryEvidenceReceiptRequired:true,rejectionEvidenceRequired:true,singleWinnerOnly:true,
  canonicalMutationAllowed:false,automaticCommit:false,automaticRetryAllowed:false,
  generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,
  persistentWriteAuthority:false,realCanonicalCommittedCountAtInstall:0
 });
}

export async function executeLiveProductionCandidateDiscovery({
 corpusAdapter,m307Runtime,policy={},clock=()=>new Date().toISOString()
}={}){
 if(typeof corpusAdapter?.readCandidateCorpus!=='function')
  return Object.freeze({status:'BLOCKED',state:'LIVE_PRODUCTION_CORPUS_ADAPTER_MISSING'});
 if(typeof m307Runtime?.discoverAndRankProductionCandidates!=='function')
  return Object.freeze({status:'BLOCKED',state:'M3_07_DISCOVERY_RUNTIME_MISSING'});
 const corpus=await corpusAdapter.readCandidateCorpus({mode:'M3_08_LIVE_DISCOVERY_READ_ONLY'});
 if(corpus?.production!==true||corpus?.synthetic===true||!Array.isArray(corpus?.records))
  return Object.freeze({status:'BLOCKED',state:'LIVE_PRODUCTION_CORPUS_UNVERIFIED',liveWriteExecuted:false,canonicalCommitted:false});
 const records=corpus.records.filter(r=>r?.actualProductionCandidate===true&&r?.synthetic!==true);
 if(!records.length)
  return Object.freeze({status:'BLOCKED',state:'NO_ACTUAL_PRODUCTION_CANDIDATES',evaluatedCount:0,liveWriteExecuted:false,canonicalCommitted:false});

 const discovery=m307Runtime.discoverAndRankProductionCandidates(records);
 const evaluated=Array.isArray(discovery?.evaluated)?discovery.evaluated:[];
 const rejections=evaluated.filter(x=>x?.qualified!==true).map(x=>Object.freeze({
  propertyId:clean(x?.propertyId),fieldPath:clean(x?.fieldPath),riskScore:x?.riskScore,
  qualificationScore:x?.qualificationScore,reason:clean(x?.reason)
 }));
 const winner=discovery?.winner||null;
 const winnerAllowed=!winner||(
   winner.qualified===true&&winner.riskScore<(policy?.maxRiskScore??200)&&
   clean(winner.propertyId)!=='UNAVAILABLE'&&clean(winner.fieldPath)!=='UNAVAILABLE'
 );
 let state;
 if(discovery?.status!=='READY'||!winner) state='LIVE_PRODUCTION_DISCOVERY_NO_QUALIFIED_WINNER';
 else if(!winnerAllowed) state='LIVE_PRODUCTION_DISCOVERY_WINNER_POLICY_REJECTED';
 else state='LIVE_PRODUCTION_CANARY_CANDIDATE_DISCOVERED';
 const ready=state==='LIVE_PRODUCTION_CANARY_CANDIDATE_DISCOVERED';
 const executedAt=clock();
 const executionId=stableId([clean(corpus?.corpusId),String(records.length),clean(discovery?.discoveryId),clean(winner?.propertyId),clean(winner?.fieldPath),state],'GDEX');
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_08_LIVE_PRODUCTION_DISCOVERY_EXECUTION',
  version:'3.0-m3.08',status:ready?'EXECUTED':'BLOCKED',state,executionId,executedAt,
  corpusId:clean(corpus?.corpusId),corpusVersion:clean(corpus?.version),
  productionCorpusVerified:true,syntheticCorpus:false,
  sourceRecordCount:corpus.records.length,evaluatedCount:evaluated.length,
  qualifiedCount:discovery?.qualifiedCount||0,rejectedCount:rejections.length,
  rejections:Object.freeze(rejections),winner:winner?Object.freeze(clone(winner)):null,
  m307DiscoveryId:clean(discovery?.discoveryId),readOnly:true,
  liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0
 });
}

export function buildLiveProductionDiscoveryEvidenceReceipt({execution={},governance={}}={}){
 const m307=governance?.m307Runtime||{},m306=governance?.m306Runtime||{},m305=governance?.m305Harness||{};
 const chainReady=m307?.status==='READY'&&m307?.discoveryReadOnly===true&&
  m306?.status==='READY'&&m306?.materializationReadOnly===true&&
  m305?.status==='READY'&&m305?.operatorExecutionSeparate===true;
 const executionReady=execution?.status==='EXECUTED'&&execution?.state==='LIVE_PRODUCTION_CANARY_CANDIDATE_DISCOVERED'&&
  execution?.productionCorpusVerified===true&&execution?.syntheticCorpus===false&&
  execution?.readOnly===true&&execution?.liveWriteExecuted===false&&execution?.canonicalCommitted===false;
 const ready=chainReady&&executionReady;
 const receiptId=stableId([clean(execution?.executionId),clean(execution?.corpusId),clean(execution?.corpusVersion),
  String(execution?.evaluatedCount),String(execution?.qualifiedCount),String(execution?.rejectedCount),
  clean(execution?.winner?.propertyId),clean(execution?.winner?.fieldPath),ready?'CERTIFIED':'BLOCKED'],'GDER');
 return Object.freeze({
  contract:'SCIIP_EXPLORER_3_M3_08_LIVE_PRODUCTION_DISCOVERY_EVIDENCE_RECEIPT',
  version:'3.0-m3.08',status:ready?'CERTIFIED':'BLOCKED',
  state:ready?'LIVE_PRODUCTION_DISCOVERY_EVIDENCE_CERTIFIED':'LIVE_PRODUCTION_DISCOVERY_EVIDENCE_BLOCKED',
  receiptId,executionId:clean(execution?.executionId),corpusId:clean(execution?.corpusId),
  corpusVersion:clean(execution?.corpusVersion),evaluatedCount:execution?.evaluatedCount||0,
  qualifiedCount:execution?.qualifiedCount||0,rejectedCount:execution?.rejectedCount||0,
  rejectionEvidence:Object.freeze(clone(execution?.rejections||[])),
  selectedCandidate:execution?.winner?Object.freeze(clone(execution.winner)):null,
  m307DiscoveryId:clean(execution?.m307DiscoveryId),immutable:true,readOnly:true,
  liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0,
  automaticCommit:false,automaticRetryAllowed:false,generalizedWriteAuthority:false,
  bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false
 });
}

export async function materializeCertifiedLiveWinner({
 evidenceReceipt={},governance={},m307Runtime,adapter,hashCanonical
}={}){
 if(evidenceReceipt?.status!=='CERTIFIED'||evidenceReceipt?.state!=='LIVE_PRODUCTION_DISCOVERY_EVIDENCE_CERTIFIED')
  return Object.freeze({status:'BLOCKED',state:'LIVE_DISCOVERY_EVIDENCE_NOT_CERTIFIED'});
 if(typeof m307Runtime?.materializeDiscoveredWinner!=='function')
  return Object.freeze({status:'BLOCKED',state:'M3_07_MATERIALIZATION_RUNTIME_MISSING'});
 const discoveryResult={
  status:'READY',state:'PRODUCTION_CANARY_CANDIDATE_DISCOVERED',
  discoveryId:evidenceReceipt.m307DiscoveryId,winner:evidenceReceipt.selectedCandidate
 };
 const materialized=await m307Runtime.materializeDiscoveredWinner({discoveryResult,governance,adapter,hashCanonical});
 if(materialized?.status!=='MATERIALIZED')
  return Object.freeze({...materialized,state:`M3_08_${clean(materialized?.state)}`});
 return Object.freeze({
  ...materialized,
  contract:'SCIIP_EXPLORER_3_M3_08_CERTIFIED_LIVE_WINNER_MATERIALIZATION',
  version:'3.0-m3.08',
  state:'CERTIFIED_LIVE_PRODUCTION_CANARY_WINNER_MATERIALIZED',
  discoveryEvidenceReceiptId:evidenceReceipt.receiptId,
  liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0
 });
}
