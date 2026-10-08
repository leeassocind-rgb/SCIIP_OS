// SCIIP Explorer 3.0 — M3.20B
// Canonical Source-of-Truth & Prior-Commit Reconciliation Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const id=(p,parts)=>`${p}-${sha(parts.join('|')).slice(0,16).toUpperCase()}`;

function fileSha(p){return sha(fs.readFileSync(p));}
function walk(dir, predicate, out=[], depth=0){
  if(depth>12||!fs.existsSync(dir)) return out;
  let entries=[]; try{entries=fs.readdirSync(dir,{withFileTypes:true});}catch{return out;}
  for(const e of entries){
    if(['node_modules','.git','dist','.sciip-backups','coverage'].includes(e.name)) continue;
    const p=path.join(dir,e.name);
    if(e.isDirectory()) walk(p,predicate,out,depth+1);
    else if(predicate(p,e.name)) out.push(p);
  }
  return out;
}

export function buildCanonicalSourceOfTruthPriorCommitReconciliationRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_20B_CANONICAL_SOURCE_OF_TRUTH_PRIOR_COMMIT_RECONCILIATION_RUNTIME',
    version:'3.0-m3.20b',
    status:'READY',
    m320aEvidenceRequired:true,
    m319EvidenceRequired:true,
    generatorTraceRequired:true,
    sourceOfTruthResolutionRequired:true,
    priorTransitionReconciliationRequired:true,
    artifactDriftDetectionRequired:true,
    generatedAssetDetectionRequired:true,
    strictReadConsistencyCertificationRequired:true,
    liveMutationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    canonicalCommittedCountAtInstall:0
  });
}

export function traceCanonicalAssetGeneration({repoRoot}={}){
  const repo=path.resolve(repoRoot||'.');
  const searchRoots=[
    path.join(repo,'tools'),
    path.join(repo,'apps','property-command-center'),
    path.join(repo,'packages')
  ].filter(fs.existsSync);

  const files=[];
  for(const r of searchRoots){
    walk(r,(p,n)=>/\.(js|mjs|cjs|ts|tsx|json)$/.test(n),files);
  }

  const refs=[];
  for(const p of files){
    let t=''; try{t=fs.readFileSync(p,'utf8');}catch{continue;}
    if(!t.includes('canonical-property-identity-data.json')) continue;
    const lower=t.toLowerCase();
    const role=
      /sync-production-validation-assets|copyfile|writefile|rename|cp\s/.test(lower)?'GENERATOR_OR_SYNC_WRITER':
      /readfile|import|fetch/.test(lower)?'CONSUMER_OR_READER':
      'REFERENCE_ONLY';
    refs.push({
      filePath:p,
      role,
      hasWriteSignal:/writeFile|copyFile|renameSync|rename\(|cpSync|cp\s/.test(t),
      hasReadSignal:/readFile|import\s|fetch\(/.test(t),
      hasSyncSignal:/sync-production-validation-assets|production-validation|sync/i.test(t)
    });
  }

  refs.sort((a,b)=>{
    const score=x=>(x.role==='GENERATOR_OR_SYNC_WRITER'?100:0)+(x.hasSyncSignal?20:0)+(x.hasWriteSignal?10:0);
    return score(b)-score(a)||a.filePath.localeCompare(b.filePath);
  });

  return Object.freeze({
    status:'TRACED',
    state:refs.length?'CANONICAL_ASSET_GENERATION_REFERENCES_TRACED':'NO_CANONICAL_ASSET_GENERATION_REFERENCES_FOUND',
    referenceCount:refs.length,
    references:Object.freeze(refs),
    likelyGenerators:Object.freeze(refs.filter(x=>x.role==='GENERATOR_OR_SYNC_WRITER')),
    readOnly:true
  });
}

export function resolveCanonicalSourceOfTruth({repoRoot,generationTrace}={}){
  const repo=path.resolve(repoRoot||'.');
  const publicPath=path.join(repo,'apps','property-command-center','public','production-validation-data','canonical-property-identity-data.json');
  const candidates=[];

  const jsonFiles=[];
  walk(repo,(p,n)=>n==='canonical-property-identity-data.json',jsonFiles);

  for(const p of jsonFiles){
    let parsed=null;
    try{parsed=JSON.parse(fs.readFileSync(p,'utf8'));}catch{}
    if(!parsed) continue;
    candidates.push({
      filePath:p,
      bytes:fs.statSync(p).size,
      sha256:fileSha(p),
      eventCount:Array.isArray(parsed?.events)?parsed.events.length:null,
      version:clean(parsed?.version||parsed?.datasetVersion||parsed?.corpusVersion),
      isPublicValidation:p===publicPath,
      pathSignals:{
        productionValidation:/production-validation-data/.test(p),
        source:/src|source|canonical|storage|data/.test(p),
        generated:/generated|dist|build|public/.test(p)
      }
    });
  }

  const likelySourceCandidates=candidates.filter(c=>!c.isPublicValidation);
  const likelySource=likelySourceCandidates.sort((a,b)=>{
    const score=x=>(x.pathSignals.source?10:0)-(x.pathSignals.generated?5:0);
    return score(b)-score(a)||a.filePath.localeCompare(b.filePath);
  })[0]||null;

  return Object.freeze({
    status:'RESOLVED',
    state:'CANONICAL_SOURCE_OF_TRUTH_CANDIDATES_RESOLVED',
    publicValidationArtifact:candidates.find(c=>c.isPublicValidation)||null,
    candidates:Object.freeze(candidates),
    likelySourceOfTruth:likelySource,
    generatedAssetLikely:!!generationTrace?.likelyGenerators?.length,
    readOnly:true
  });
}

function findTransitions(events,propertyId,fieldName,beforeValue,afterValue){
  const matches=[];
  events.forEach((event,eventIndex)=>{
    const pid=event?.canonicalPropertyId??event?.propertyId??event?.canonical_property_id??event?.property_id;
    if(pid!==propertyId) return;
    (Array.isArray(event?.changes)?event.changes:[]).forEach((change,changeIndex)=>{
      if(change?.field!==fieldName) return;
      const beforeMatch=JSON.stringify(change?.before)===JSON.stringify(beforeValue);
      const afterMatch=JSON.stringify(change?.after)===JSON.stringify(afterValue);
      if(beforeMatch&&afterMatch){
        matches.push({
          eventIndex,changeIndex,
          eventId:clean(event?.eventId||`event-${eventIndex}`),
          eventType:clean(event?.eventType),
          version:clean(event?.version||event?.revision||event?.sequence||event?.eventId),
          executionManifestId:clean(event?.executionManifestId),
          executionId:clean(event?.executionId),
          eventHash:sha(JSON.stringify(event)),
          changeHash:sha(JSON.stringify(change))
        });
      }
    });
  });
  return matches;
}

export function reconcilePriorCanonicalTransition({repoRoot,m319Evidence,sourceResolution}={}){
  const repo=path.resolve(repoRoot||'.');
  const pre=m319Evidence?.preCommitCertification;
  if(!pre) return Object.freeze({status:'BLOCKED',state:'M3_19_PRECOMMIT_MISSING'});

  const propertyId=pre?.target?.propertyId;
  const fieldName=pre?.target?.fieldName;
  const beforeValue=pre?.target?.beforeValue;
  const afterValue=pre?.target?.afterValue;

  const corpora=(sourceResolution?.candidates||[]);
  const corpusMatches=[];

  for(const c of corpora){
    let parsed; try{parsed=JSON.parse(fs.readFileSync(c.filePath,'utf8'));}catch{continue;}
    const events=Array.isArray(parsed?.events)?parsed.events:[];
    const matches=findTransitions(events,propertyId,fieldName,beforeValue,afterValue);
    if(matches.length){
      corpusMatches.push({
        filePath:c.filePath,
        sha256:c.sha256,
        isPublicValidation:c.isPublicValidation,
        matches
      });
    }
  }

  const evidenceFiles=[];
  const evRoot=path.join(repo,'apps','property-command-center','evidence');
  if(fs.existsSync(evRoot)){
    walk(evRoot,(p,n)=>/\.(json|jsonl|txt|log)$/.test(n),evidenceFiles);
  }

  const evidenceHits=[];
  const needleValues=[
    String(propertyId),String(fieldName),String(beforeValue),String(afterValue),
    clean(pre?.executionManifestId)
  ];

  for(const p of evidenceFiles){
    let t=''; try{t=fs.readFileSync(p,'utf8');}catch{continue;}
    const hitCount=needleValues.filter(v=>v!=='UNAVAILABLE'&&t.includes(v)).length;
    if(hitCount>=3){
      evidenceHits.push({filePath:p,hitCount});
    }
  }

  evidenceHits.sort((a,b)=>b.hitCount-a.hitCount||a.filePath.localeCompare(b.filePath));

  const hasExactTransition=corpusMatches.length>0;
  const m320Signature=corpusMatches.some(c=>c.matches.some(m=>
    m.eventType==='CANONICAL_CANARY_COMMIT' ||
    m.executionManifestId===clean(pre?.executionManifestId)
  ));

  const classification=
    m320Signature?'PRIOR_GOVERNED_CANARY_COMMIT_DETECTED':
    hasExactTransition?'PREEXISTING_CANONICAL_TRANSITION_DETECTED':
    'NO_PRIOR_TRANSITION_FOUND';

  return Object.freeze({
    status:'RECONCILED',
    state:'PRIOR_CANONICAL_TRANSITION_RECONCILED',
    classification,
    exactTransitionFound:hasExactTransition,
    governedM320SignatureDetected:m320Signature,
    corpusMatches:Object.freeze(corpusMatches),
    evidenceHits:Object.freeze(evidenceHits.slice(0,50)),
    target:Object.freeze({propertyId,fieldName,beforeValue,afterValue,executionManifestId:pre.executionManifestId}),
    readOnly:true
  });
}

export function detectCanonicalArtifactDrift({beforeObservation,afterObservation}={}){
  const drift=
    clean(beforeObservation?.sha256)!==clean(afterObservation?.sha256) ||
    Number(beforeObservation?.bytes||0)!==Number(afterObservation?.bytes||0);

  return Object.freeze({
    status:'ASSESSED',
    state:drift?'CANONICAL_VALIDATION_ARTIFACT_DRIFT_DETECTED':'NO_CANONICAL_VALIDATION_ARTIFACT_DRIFT',
    driftDetected:drift,
    before:Object.freeze(clone(beforeObservation||{})),
    after:Object.freeze(clone(afterObservation||{})),
    readOnly:true
  });
}

export function certifyStrictReadConsistency({observedValue,expectedBeforeValue,targetFound}={}){
  const exact=targetFound===true && JSON.stringify(observedValue)===JSON.stringify(expectedBeforeValue);
  return Object.freeze({
    status:exact?'CERTIFIED':'BLOCKED',
    state:exact?'STRICT_CANONICAL_READ_CONSISTENCY_CERTIFIED':'STRICT_CANONICAL_READ_CONSISTENCY_BLOCKED',
    targetFound:targetFound===true,
    observedValue:clone(observedValue),
    expectedBeforeValue:clone(expectedBeforeValue),
    exactReadConsistency:exact
  });
}

export function buildM320BDecision({
  generationTrace,
  sourceResolution,
  priorTransitionReconciliation,
  artifactDrift,
  strictReadConsistency
}={}){
  const generatedAssetLikely=sourceResolution?.generatedAssetLikely===true;
  const priorTransition=priorTransitionReconciliation?.exactTransitionFound===true;
  const strictOk=strictReadConsistency?.status==='CERTIFIED';
  const drift=artifactDrift?.driftDetected===true;

  let disposition='HOLD_M3_20_LIVE_EXECUTION';
  let reason='UNRESOLVED_CANONICAL_STATE';

  if(priorTransition){
    disposition='DO_NOT_EXECUTE_DUPLICATE_CANARY';
    reason=priorTransitionReconciliation.classification;
  }else if(!strictOk){
    disposition='HOLD_M3_20_LIVE_EXECUTION';
    reason='CURRENT_STATE_DOES_NOT_MATCH_M3_19_BEFORE_STATE';
  }else if(generatedAssetLikely&&drift){
    disposition='HOLD_M3_20_LIVE_EXECUTION';
    reason='PUBLIC_VALIDATION_ARTIFACT_IS_GENERATED_AND_DRIFTING';
  }else if(strictOk&&!priorTransition){
    disposition='M3_20_LIVE_EXECUTION_MAY_PROCEED_AFTER_SOURCE_OF_TRUTH_BINDING';
    reason='STRICT_BEFORE_STATE_CONFIRMED_NO_PRIOR_TRANSITION_FOUND';
  }

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_20B_RECONCILIATION_DECISION',
    version:'3.0-m3.20b',
    status:'CERTIFIED',
    state:'CANONICAL_SOURCE_OF_TRUTH_PRIOR_COMMIT_RECONCILIATION_CERTIFIED',
    decisionId:id('G3BD',[
      disposition,reason,
      clean(sourceResolution?.publicValidationArtifact?.sha256),
      String(priorTransition),
      String(drift),
      String(strictOk)
    ]),
    disposition,
    reason,
    generatedAssetLikely,
    priorTransitionDetected:priorTransition,
    artifactDriftDetected:drift,
    strictReadConsistencyCertified:strictOk,
    liveExecutionAllowed:disposition==='M3_20_LIVE_EXECUTION_MAY_PROCEED_AFTER_SOURCE_OF_TRUTH_BINDING',
    liveMutationExecuted:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}
