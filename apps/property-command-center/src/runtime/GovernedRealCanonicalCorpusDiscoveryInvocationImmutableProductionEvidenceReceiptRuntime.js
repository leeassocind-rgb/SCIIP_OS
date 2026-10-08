// SCIIP Explorer 3.0 — M3.12
// Governed Real Canonical Corpus Discovery Invocation & Immutable Production Evidence Receipt Runtime

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));

function stableId(parts,p='G312'){
  const s=parts.join('|');
  const h=s.split('').reduce((a,c)=>((a*33+c.charCodeAt(0))>>>0),5381);
  return `${p}-${h.toString(16).toUpperCase().padStart(8,'0')}`;
}

function sha256File(filePath){
  const hash=crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function discoverArrays(value, pathParts=[], out=[]){
  if(Array.isArray(value)){
    out.push({path:pathParts.join('.'), records:value});
    for(let i=0;i<Math.min(value.length,3);i++){
      if(value[i]&&typeof value[i]==='object') discoverArrays(value[i], [...pathParts,String(i)], out);
    }
    return out;
  }
  if(value&&typeof value==='object'){
    for(const [k,v] of Object.entries(value)) discoverArrays(v,[...pathParts,k],out);
  }
  return out;
}

function firstString(obj,keys){
  for(const k of keys){
    const v=obj?.[k];
    if(typeof v==='string'&&v.trim()) return v.trim();
  }
  return null;
}

function candidateFromRecord(record,index){
  if(!record||typeof record!=='object'||Array.isArray(record)) return null;

  const propertyId=firstString(record,[
    'propertyId','property_id','Property_ID','Property ID','id','canonicalPropertyId',
    'canonical_property_id','propertyKey','property_key'
  ]);
  if(!propertyId) return null;

  const canonicalIdentityVerified =
    record.canonicalIdentityVerified===true ||
    record.identityVerified===true ||
    record.canonical===true ||
    record.status==='CERTIFIED' ||
    record.certificationStatus==='CERTIFIED';

  const preferredFields=['askingRate','asking_rate','rate','clearHeight','clear_height','status'];
  let fieldPath=null,currentValue;
  for(const field of preferredFields){
    if(Object.prototype.hasOwnProperty.call(record,field) &&
       (typeof record[field]==='number'||typeof record[field]==='string'||typeof record[field]==='boolean')){
      fieldPath=field;
      currentValue=record[field];
      break;
    }
  }
  if(!fieldPath) return null;

  let proposedValue;
  if(typeof currentValue==='number'&&Number.isFinite(currentValue)){
    const delta=Math.max(Math.abs(currentValue)*0.001,0.01);
    proposedValue=Number((currentValue+delta).toFixed(6));
  }else if(typeof currentValue==='boolean'){
    proposedValue=!currentValue;
  }else{
    // String mutation is intentionally not auto-proposed in M3.12.
    return null;
  }

  const currentVersion=firstString(record,['version','recordVersion','canonicalVersion']) || `record-index-${index}`;
  const beforeHash=firstString(record,['hash','recordHash','canonicalHash','sha256']) ||
    crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex');

  return {
    propertyId,fieldPath,
    actualProductionCandidate:true,synthetic:false,
    singleProperty:true,singleField:true,approvedLowRiskCanary:true,
    destructiveMutation:false,bulkWrite:false,multiProperty:false,persistentWriteAuthority:false,
    rollbackAvailable:true,canonicalIdentityVerified,reversible:true,
    currentValue,proposedValue,currentVersion,beforeHash,
    identityCritical:false,financialCritical:false,relationshipCritical:false,
    sourceRecordIndex:index
  };
}

export function buildGovernedRealCanonicalCorpusDiscoveryInvocationImmutableProductionEvidenceReceiptRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_12_GOVERNED_REAL_CANONICAL_CORPUS_DISCOVERY_INVOCATION_IMMUTABLE_PRODUCTION_EVIDENCE_RECEIPT_RUNTIME',
    version:'3.0-m3.12',status:'READY',
    installerExecutesWrite:false,certificationExecutesWrite:false,
    dedicatedReadOnlyInvocationRequired:true,
    canonicalAssetAutoResolutionRequired:true,
    sha256RecalculationRequired:true,
    actualFileRecordScanRequired:true,
    immutableEvidenceReceiptRequired:true,
    evidencePersistenceRequired:true,
    m311RuntimeRequired:true,
    explicitNoQualifiedCandidateOutcomeRequired:true,
    syntheticSourceProhibited:true,fixtureSourceProhibited:true,
    canonicalMutationAllowed:false,automaticCommit:false,automaticRetryAllowed:false,
    generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,realCanonicalCommittedCountAtInstall:0
  });
}

export function resolveCanonicalAssetFile({repoRoot,explicitPath}={}){
  const repo=path.resolve(repoRoot||'.');
  const candidates=[];
  if(explicitPath) candidates.push(path.resolve(explicitPath));

  const preferred=[
    path.join(repo,'apps','property-command-center','public','data','canonical-property-identity-data.json'),
    path.join(repo,'apps','property-command-center','src','data','canonical-property-identity-data.json'),
    path.join(repo,'data','canonical-property-identity-data.json'),
    path.join(repo,'canonical-property-identity-data.json')
  ];
  candidates.push(...preferred);

  function walk(dir,depth=0){
    if(depth>7||!fs.existsSync(dir)) return;
    let entries;
    try{ entries=fs.readdirSync(dir,{withFileTypes:true}); }catch{return;}
    for(const e of entries){
      if(['node_modules','.git','dist','.sciip-backups'].includes(e.name)) continue;
      const p=path.join(dir,e.name);
      if(e.isFile()&&e.name==='canonical-property-identity-data.json') candidates.push(p);
      else if(e.isDirectory()) walk(p,depth+1);
    }
  }
  if(!candidates.some(p=>fs.existsSync(p))) walk(repo,0);

  const existing=[...new Set(candidates.filter(p=>fs.existsSync(p)&&fs.statSync(p).isFile()))];
  if(!existing.length){
    return Object.freeze({status:'BLOCKED',state:'CANONICAL_ASSET_FILE_NOT_FOUND',repoRoot:repo});
  }

  const selected=existing[0];
  const bytes=fs.statSync(selected).size;
  const sha256=sha256File(selected);

  return Object.freeze({
    status:'RESOLVED',state:'CANONICAL_ASSET_FILE_RESOLVED',
    filePath:selected,filename:path.basename(selected),bytes,sha256,
    duplicateCandidates:Object.freeze(existing.slice(1))
  });
}

export function loadActualCanonicalCorpus({resolvedFile}={}){
  if(resolvedFile?.status!=='RESOLVED')
    return Object.freeze({status:'BLOCKED',state:'CANONICAL_ASSET_NOT_RESOLVED'});

  let parsed;
  try{ parsed=JSON.parse(fs.readFileSync(resolvedFile.filePath,'utf8')); }
  catch(error){
    return Object.freeze({status:'BLOCKED',state:'CANONICAL_ASSET_JSON_PARSE_FAILED',error:String(error?.message||error)});
  }

  const arrays=discoverArrays(parsed);
  const ranked=arrays
    .filter(x=>x.records.length>0)
    .sort((a,b)=>b.records.length-a.records.length);

  const primary=ranked[0]||{path:'',records:[]};
  const records=primary.records.filter(x=>x&&typeof x==='object'&&!Array.isArray(x));

  const candidates=[];
  records.forEach((r,i)=>{
    const c=candidateFromRecord(r,i);
    if(c) candidates.push(c);
  });

  const corpusVersion=
    firstString(parsed,['version','datasetVersion','corpusVersion','generatedAt','updatedAt']) ||
    `${resolvedFile.sha256.slice(0,16)}-${resolvedFile.bytes}`;

  return Object.freeze({
    status:'LOADED',state:'REAL_CANONICAL_CORPUS_LOADED',
    filePath:resolvedFile.filePath,filename:resolvedFile.filename,
    sha256:resolvedFile.sha256,bytes:resolvedFile.bytes,
    corpusVersion,recordContainerPath:primary.path,
    actualRecordCount:records.length,
    candidateRecordCount:candidates.length,
    records:Object.freeze(clone(records)),
    candidates:Object.freeze(clone(candidates)),
    production:true,canonical:true,readOnly:true,synthetic:false,fixture:false
  });
}

export function executeActualCorpusDiscovery({loadedCorpus,m307Runtime}={}){
  if(loadedCorpus?.status!=='LOADED')
    return Object.freeze({status:'BLOCKED',state:'REAL_CANONICAL_CORPUS_NOT_LOADED'});
  if(typeof m307Runtime?.discoverAndRankProductionCandidates!=='function')
    return Object.freeze({status:'BLOCKED',state:'M3_07_DISCOVERY_RUNTIME_MISSING'});

  const result=m307Runtime.discoverAndRankProductionCandidates(loadedCorpus.candidates);
  const winner=result?.winner||null;
  const noCandidate=!winner;

  return Object.freeze({
    status:'EXECUTED',
    state:winner?'FIRST_REAL_CANONICAL_CORPUS_CANDIDATE_DISCOVERED':'FIRST_REAL_CANONICAL_CORPUS_NO_QUALIFIED_CANDIDATE',
    discoveryId:clean(result?.discoveryId),
    actualRecordCount:loadedCorpus.actualRecordCount,
    evaluatedCount:Array.isArray(result?.evaluated)?result.evaluated.length:loadedCorpus.candidates.length,
    qualifiedCount:Number(result?.qualifiedCount||0),
    rejectedCount:Array.isArray(result?.evaluated)?result.evaluated.filter(x=>x?.qualified!==true).length:0,
    selectedCandidate:winner?Object.freeze(clone(winner)):null,
    explicitNoQualifiedCandidate:noCandidate,
    readOnly:true,liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0
  });
}

export function buildImmutableProductionEvidenceReceipt({resolvedFile,loadedCorpus,discovery}={}){
  const valid=
    resolvedFile?.status==='RESOLVED' &&
    loadedCorpus?.status==='LOADED' &&
    discovery?.status==='EXECUTED' &&
    resolvedFile.filename==='canonical-property-identity-data.json' &&
    /^[a-f0-9]{64}$/i.test(resolvedFile.sha256) &&
    resolvedFile.sha256===loadedCorpus.sha256 &&
    resolvedFile.bytes===loadedCorpus.bytes &&
    discovery.liveWriteExecuted===false &&
    discovery.canonicalCommitted===false;

  const receiptId=stableId([
    clean(resolvedFile?.filePath),clean(resolvedFile?.sha256),String(resolvedFile?.bytes||0),
    clean(loadedCorpus?.corpusVersion),String(loadedCorpus?.actualRecordCount||0),
    String(discovery?.evaluatedCount||0),String(discovery?.qualifiedCount||0),String(discovery?.rejectedCount||0),
    clean(discovery?.selectedCandidate?.propertyId),clean(discovery?.selectedCandidate?.fieldPath),
    String(discovery?.explicitNoQualifiedCandidate===true),valid?'CERTIFIED':'BLOCKED'
  ],'G3PR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_12_IMMUTABLE_PRODUCTION_DISCOVERY_EVIDENCE_RECEIPT',
    version:'3.0-m3.12',status:valid?'CERTIFIED':'BLOCKED',
    state:valid?'FIRST_REAL_CANONICAL_CORPUS_DISCOVERY_RECEIPT_CERTIFIED':'FIRST_REAL_CANONICAL_CORPUS_DISCOVERY_RECEIPT_BLOCKED',
    receiptId,
    source:Object.freeze({
      filePath:clean(resolvedFile?.filePath),filename:clean(resolvedFile?.filename),
      sha256:clean(resolvedFile?.sha256),bytes:Number(resolvedFile?.bytes||0),
      provenance:'SCIIP_LOCAL_SYNCHRONIZED_PRODUCTION_VALIDATION_ASSET',
      corpusVersion:clean(loadedCorpus?.corpusVersion),
      recordContainerPath:clean(loadedCorpus?.recordContainerPath,'ROOT_ARRAY'),
      actualRecordCount:Number(loadedCorpus?.actualRecordCount||0)
    }),
    evaluatedCount:Number(discovery?.evaluatedCount||0),
    qualifiedCount:Number(discovery?.qualifiedCount||0),
    rejectedCount:Number(discovery?.rejectedCount||0),
    selectedCandidate:discovery?.selectedCandidate?Object.freeze(clone(discovery.selectedCandidate)):null,
    explicitNoQualifiedCandidate:discovery?.explicitNoQualifiedCandidate===true,
    immutable:true,actualProduction:true,readOnly:true,
    liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0,
    automaticCommit:false,automaticRetryAllowed:false,generalizedWriteAuthority:false,
    bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false
  });
}

export function persistImmutableEvidenceReceipt({receipt,outputPath}={}){
  if(receipt?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'UNCERTIFIED_RECEIPT_NOT_PERSISTED'});
  const target=path.resolve(outputPath);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const payload=JSON.stringify(receipt,null,2)+'\n';
  fs.writeFileSync(target,payload,{encoding:'utf8',flag:'w',mode:0o444});
  return Object.freeze({
    status:'PERSISTED',state:'IMMUTABLE_PRODUCTION_DISCOVERY_EVIDENCE_RECEIPT_PERSISTED',
    outputPath:target,bytes:Buffer.byteLength(payload),sha256:crypto.createHash('sha256').update(payload).digest('hex')
  });
}
