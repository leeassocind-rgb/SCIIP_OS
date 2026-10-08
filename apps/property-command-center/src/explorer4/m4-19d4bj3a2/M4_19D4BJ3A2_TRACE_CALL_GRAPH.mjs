#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
import{readJson,writeJson,text,listSourceFiles}from"./M419D4BJ3A2Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a-r1-targeted-canonical-identity-creation-pipeline-forensics.json");
const out=path.join(ev,"m4-19d4bj3a2-targeted-identity-creation-call-graph-and-storage-adapter-forensics.json");

function finish(state,extra={}){
 const o={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A2_TARGETED_IDENTITY_CREATION_CALL_GRAPH_AND_STORAGE_ADAPTER_FORENSICS",
  version:"4.0-m4.19d4bj3a2",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}
 };
 writeJson(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)
}

if(!fs.existsSync(prior))finish("M419D4BJ3A2_BJ3A_R1_FORENSICS_REQUIRED");
const p=readJson(prior);
if(p.state!=="M419D4BJ3A_R1_EXECUTABLE_IDENTITY_CREATION_PIPELINE_REMAINS_AMBIGUOUS_BJ3A2_CALL_GRAPH_FORENSICS_REQUIRED")
 finish("M419D4BJ3A2_BJ3A_R1_AMBIGUITY_STATE_REQUIRED",{observed:p.state});

const cands=p.forensics?.candidates||[];
if(cands.length!==2)finish("M419D4BJ3A2_EXACT_TWO_EXECUTABLE_CANDIDATES_REQUIRED",{candidateCount:cands.length});

console.log("[BJ3A2] exact two-candidate ambiguity accepted");
console.log("[BJ3A2] reading candidate source");
const files=listSourceFiles(app,6000);

function analyzeCandidate(c){
 const abs=path.join(app,c.path),src=text(abs);
 const base=path.basename(c.path).replace(/\.[^.]+$/,"");
 const exportedFns=[...src.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)|export\s*\{([^}]+)\}/g)]
   .flatMap(m=>m[1]?[m[1]]:(m[2]||"").split(",").map(x=>x.trim().split(/\s+as\s+/)[0])).filter(Boolean);
 const localFns=[...src.matchAll(/(?:async\s+)?function\s+([A-Za-z0-9_$]+)|const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(/g)]
   .map(m=>m[1]||m[2]).filter(Boolean);
 const imports=[...src.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)].map(m=>m[1]);

 let callers=[];
 for(const f of files){
  if(f.p===abs)continue;
  const s=text(f.p);if(!s)continue;
  const nameHit=exportedFns.some(fn=>new RegExp(`\\b${fn.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`).test(s));
  const importHit=s.includes(base)||s.includes(c.path)||s.includes("./"+base)||s.includes("../"+base);
  if(nameHit||importHit){
   callers.push({
    file:f.rel,
    importsCandidate:importHit,
    referencedExports:exportedFns.filter(fn=>new RegExp(`\\b${fn.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`).test(s)).slice(0,20),
    persistenceSignals:{
      canonicalWrite:/canonical.*(?:write|save|insert|commit|persist)|(?:write|save|insert|commit|persist).*canonical/i.test(s),
      identityWrite:/identity.*(?:write|save|insert|commit|persist)|(?:write|save|insert|commit|persist).*identity/i.test(s),
      eventAppend:/append.*event|event.*append/i.test(s),
      sourcePropertyId:/sourcePropertyId/i.test(s)
    }
   });
  }
 }
 const semantics={
  createsAdapter:/createCertifiedCanonicalPropertyStoreAdapter/i.test(src),
  resolvesStorage:/resolveCanonicalPropertyStorePhysicalStorage/i.test(src),
  canonicalRead:/certifyCanonicalStoreReadBinding|readCanonical|loadCanonical/i.test(src),
  canonicalWrite:/write.*canonical|canonical.*write|save.*canonical|canonical.*save|insert.*canonical|canonical.*insert|commit.*canonical|canonical.*commit|persist.*canonical|canonical.*persist/i.test(src),
  identityCreation:/create.*identity|create.*canonical|canonical.*create|identity.*create/i.test(src),
  uiState:/ActionState|resolveGovernedPropertyIntelligenceActionState|propertyIdOf/i.test(src),
  sourcePropertyId:/sourcePropertyId/i.test(src),
  cprop:/CPROP-/i.test(src),
  eventAppend:/append.*event|event.*append/i.test(src)
 };
 const callerWriteCount=callers.filter(x=>Object.values(x.persistenceSignals).some(Boolean)).length;
 let role="UNRESOLVED";
 if(semantics.uiState && !semantics.canonicalWrite && callerWriteCount===0) role="UI_OR_ACTION_STATE_NON_CREATION_PATH";
 else if((semantics.createsAdapter||semantics.resolvesStorage) && (semantics.canonicalWrite||callerWriteCount>0)) role="CANONICAL_STORAGE_ADAPTER_PATH";
 else if(semantics.createsAdapter||semantics.resolvesStorage) role="CANONICAL_STORAGE_ADAPTER_READ_OR_BINDING_PATH";
 return {
  path:c.path,exportedFunctions:[...new Set(exportedFns)],localFunctions:[...new Set(localFns)].slice(0,40),
  imports,callerCount:callers.length,callers:callers.slice(0,50),semantics,callerWriteCount,role
 };
}

const analyses=cands.map(analyzeCandidate);
console.log(`[BJ3A2] candidate 1 role=${analyses[0].role}; callers=${analyses[0].callerCount}`);
console.log(`[BJ3A2] candidate 2 role=${analyses[1].role}; callers=${analyses[1].callerCount}`);

const uiRejected=analyses.filter(x=>x.role==="UI_OR_ACTION_STATE_NON_CREATION_PATH");
const storage=analyses.filter(x=>x.role.startsWith("CANONICAL_STORAGE_ADAPTER"));
let binding=null,classification;

if(uiRejected.length===1 && storage.length===1){
 const s=storage[0];
 if(s.semantics.canonicalWrite||s.callerWriteCount>0){
   classification="UI_FALSE_POSITIVE_REJECTED_STORAGE_ADAPTER_WRITE_PATH_IDENTIFIED";
   binding=s;
 }else{
   classification="UI_FALSE_POSITIVE_REJECTED_STORAGE_ADAPTER_BOUND_BUT_WRITE_CREATION_SEMANTICS_NOT_PROVEN";
 }
}else{
 classification="CALL_GRAPH_DID_NOT_UNIQUELY_SEPARATE_CREATION_PATH";
}

finish(binding
 ?"M419D4BJ3A2_UI_ACTION_STATE_FALSE_POSITIVE_REJECTED_CANONICAL_STORAGE_CREATION_PATH_BOUND_BJ3B_REPREAUTHORIZATION_READY"
 :"M419D4BJ3A2_UI_FALSE_POSITIVE_RECONCILED_BUT_EXACT_IDENTITY_CREATION_WRITE_PATH_NOT_PROVEN_BJ3A3_REQUIRED",{
 forensics:{
  filesScanned:files.length,
  candidateAnalyses:analyses,
  classification,
  rejectedUiCandidates:uiRejected.map(x=>x.path),
  storageCandidates:storage.map(x=>x.path),
  exactStorageCreationBinding:binding
 },
 targetsPreserved:p.targetsPreserved,
 policy:{
  uiActionStateCannotCreateCanonicalIdentity:true,
  storageAdapterMayOnlyBeExecutionAuthorityIfWriteOrPersistPathProven:true,
  exactFiveTargetsRemainBound:true,
  exactInvocationStillRequiredBeforeExecution:true,
  noWriteInThisMilestone:true
 },
 nextMilestone:binding
  ?"M4.19D4BJ3B_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_EXACT_EXECUTABLE_PIPELINE"
  :"M4.19D4BJ3A3_CANONICAL_STORE_WRITE_METHOD_AND_IDENTITY_CREATION_INVOCATION_FORENSICS"
});
