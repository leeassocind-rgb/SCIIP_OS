import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const hb=v=>crypto.createHash('sha256').update(v).digest('hex');
const freeze=v=>Object.freeze(v);

export function buildM323CRuntime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_23C_CANONICAL_SOURCE_HASH_OSCILLATION_FORENSICS_MUTATOR_PROVENANCE_CERTIFICATION_RUNTIME',
    version:'3.0-m3.23c',status:'READY',
    sourceHashOscillationAnalysisRequired:true,
    mutatorProvenanceTraceRequired:true,
    byteLevelDiffRequired:true,
    semanticDiffRequired:true,
    durableSourceClassificationRequired:true,
    stabilizationRecommendationRequired:true,
    liveMutationAllowed:false,
    sourceMutationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    canonicalCommittedCountAtInstall:0
  });
}

function walk(dir,out=[],depth=0){
  if(depth>14||!fs.existsSync(dir)) return out;
  let es=[]; try{es=fs.readdirSync(dir,{withFileTypes:true});}catch{return out;}
  for(const e of es){
    if(['node_modules','.git','dist','.sciip-backups','coverage'].includes(e.name)) continue;
    const p=path.join(dir,e.name);
    if(e.isDirectory()) walk(p,out,depth+1);
    else if(/\.(js|mjs|cjs|ts|tsx|json|sh|command|py)$/.test(e.name)) out.push(p);
  }
  return out;
}

export function traceMutatorProvenance({repoRoot,targetSourcePath}={}){
  const repo=path.resolve(repoRoot||'.');
  const basename=path.basename(targetSourcePath||'canonical-property-identity-data.json');
  const refs=[];
  for(const p of walk(repo,[])){
    let t=''; try{t=fs.readFileSync(p,'utf8');}catch{continue;}
    if(!t.includes(basename) && !/production-validation/.test(t)) continue;
    const writeSignals=[
      ['writeFile',/writeFile|writeFileSync/],
      ['copyFile',/copyFile|copyFileSync/],
      ['rename',/renameSync|rename\(/],
      ['cp',/\bcpSync\b|\bcp\s/],
      ['generate',/generate|serialize|JSON\.stringify/],
      ['sync',/sync-production-validation-assets|production-validation.*sync|sync.*production-validation/i]
    ].filter(([,r])=>r.test(t)).map(([n])=>n);
    const readSignals=[
      ['readFile',/readFile|readFileSync/],
      ['import',/\bimport\b|\brequire\(/],
      ['fetch',/\bfetch\(/]
    ].filter(([,r])=>r.test(t)).map(([n])=>n);
    if(writeSignals.length||readSignals.length){
      refs.push({
        filePath:p,writeSignals,readSignals,
        referencesCanonicalBasename:t.includes(basename),
        score:writeSignals.length*20+readSignals.length*2+(t.includes('sync-production-validation-assets')?50:0)
      });
    }
  }
  refs.sort((a,b)=>b.score-a.score||a.filePath.localeCompare(b.filePath));
  return freeze({
    status:'TRACED',
    references:freeze(refs.slice(0,100)),
    likelyMutators:freeze(refs.filter(x=>x.writeSignals.length).slice(0,50))
  });
}

function normalizeJson(v){
  if(Array.isArray(v)) return v.map(normalizeJson);
  if(v&&typeof v==='object'){
    const o={}; for(const k of Object.keys(v).sort()) o[k]=normalizeJson(v[k]); return o;
  }
  return v;
}

export function compareCanonicalStates({stateAPath,stateBPath}={}){
  if(!stateAPath||!fs.existsSync(stateAPath)||!stateBPath||!fs.existsSync(stateBPath)){
    return freeze({status:'BLOCKED',state:'COMPARISON_FILE_MISSING'});
  }
  const aBytes=fs.readFileSync(stateAPath), bBytes=fs.readFileSync(stateBPath);
  let a,b; try{a=JSON.parse(aBytes);b=JSON.parse(bBytes);}catch{return freeze({status:'BLOCKED',state:'COMPARISON_JSON_INVALID'});}
  const aNorm=JSON.stringify(normalizeJson(a)), bNorm=JSON.stringify(normalizeJson(b));
  const aEvents=Array.isArray(a?.events)?a.events:[], bEvents=Array.isArray(b?.events)?b.events:[];
  const aIds=new Set(aEvents.map(e=>e?.eventId).filter(Boolean)), bIds=new Set(bEvents.map(e=>e?.eventId).filter(Boolean));
  const onlyA=[...aIds].filter(x=>!bIds.has(x)), onlyB=[...bIds].filter(x=>!aIds.has(x));
  return freeze({
    status:'CERTIFIED',
    stateA:freeze({filePath:stateAPath,sha256:hb(aBytes),bytes:aBytes.length,eventCount:aEvents.length}),
    stateB:freeze({filePath:stateBPath,sha256:hb(bBytes),bytes:bBytes.length,eventCount:bEvents.length}),
    byteEquivalent:Buffer.compare(aBytes,bBytes)===0,
    semanticEquivalent:aNorm===bNorm,
    eventIdSetEquivalent:onlyA.length===0&&onlyB.length===0,
    onlyInA:freeze(onlyA.slice(0,100)),
    onlyInB:freeze(onlyB.slice(0,100))
  });
}

export function classifyDurableSource({provenanceTrace,comparison}={}){
  const publicGeneratedLikely=(provenanceTrace?.likelyMutators||[]).some(x=>/sync-production-validation-assets/.test(x.filePath));
  let classification='UNRESOLVED',reason='INSUFFICIENT_EVIDENCE';
  if(publicGeneratedLikely&&comparison?.semanticEquivalent===true){
    classification='AUTHORITATIVE_SOURCE_WITH_GENERATED_PUBLIC_COPY';
    reason='PUBLIC_COPY_GENERATED_AND_SEMANTICALLY_EQUIVALENT';
  }else if(publicGeneratedLikely&&comparison?.semanticEquivalent===false){
    classification='AUTHORITATIVE_SOURCE_WITH_NON_EQUIVALENT_GENERATED_PUBLIC_COPY';
    reason='PUBLIC_COPY_GENERATED_BUT_SEMANTICS_DIFFER';
  }
  return freeze({status:'CERTIFIED',classification,reason,publicGeneratedLikely});
}

export function buildStabilizationRecommendation({classification,oscillationHashes=[]}={}){
  const unique=[...new Set(oscillationHashes.filter(Boolean))];
  let recommendation='HOLD_LIVE_EXECUTION';
  let controls=[];
  if(classification?.classification==='AUTHORITATIVE_SOURCE_WITH_GENERATED_PUBLIC_COPY'){
    recommendation='PIN_AUTHORITATIVE_SOURCE_AND_EXCLUDE_PUBLIC_SYNC_FROM_EXECUTION_WINDOW';
    controls=[
      'Bind live gate only to src/production-validation canonical source',
      'Ignore public generated copy SHA for authorization',
      'Block build/sync between final binding and commit',
      'Re-read authoritative SHA and target value immediately before mutation'
    ];
  }
  return freeze({
    status:'CERTIFIED',
    recommendation,
    observedDistinctHashes:freeze(unique),
    oscillationDetected:unique.length>1,
    controls:freeze(controls),
    liveExecutionAllowed:false
  });
}
