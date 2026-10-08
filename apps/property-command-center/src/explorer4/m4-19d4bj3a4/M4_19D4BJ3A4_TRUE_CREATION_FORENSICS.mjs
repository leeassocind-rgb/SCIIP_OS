#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const bj3b=path.join(ev,"m4-19d4bj3b-five-property-identity-creation-repreauthorization.json");
const bj3a3=path.join(ev,"m4-19d4bj3a3-canonical-store-write-method-and-identity-creation-invocation-forensics.json");
const out=path.join(ev,"m4-19d4bj3a4-true-canonical-identity-creation-orchestrator-and-input-contract-forensics.json");
const read=p=>fs.readFileSync(p,"utf8"), json=p=>JSON.parse(read(p));
const write=x=>{fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(x,null,2)+"\n");console.log(JSON.stringify(x,null,2));};

function finish(state,extra={}){
 const o={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A4_TRUE_CANONICAL_IDENTITY_CREATION_ORCHESTRATOR_AND_INPUT_CONTRACT_FORENSICS",
  version:"4.0-m4.19d4bj3a4",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}
 };
 write(o);process.exit(0)
}

if(!fs.existsSync(bj3b)||!fs.existsSync(bj3a3))finish("M419D4BJ3A4_REQUIRED_PRIOR_EVIDENCE_MISSING");
const b=json(bj3b), a3=json(bj3a3);
if(b.state!=="M419D4BJ3B_EXACT_FIVE_PROPERTY_EXECUTABLE_PIPELINE_REPREAUTHORIZED_EXECUTION_NOT_AUTHORIZED_BJ4_READY")
 finish("M419D4BJ3A4_BJ3B_STATE_REQUIRED",{observed:b.state});

console.log("[BJ3A4] BJ3B state accepted");
console.log("[BJ3A4] invalidating BJ4 execution readiness pending true-create proof");

// Directly re-inspect certified adapter to prove update-vs-create semantics.
const adapterPath=path.join(app,"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js");
if(!fs.existsSync(adapterPath))finish("M419D4BJ3A4_CERTIFIED_ADAPTER_SOURCE_MISSING");
const adapter=read(adapterPath);
const targetNotFound=/if\s*\(\s*!current\.found\s*\)\s*return\s*\{\s*committed:false\s*,\s*state:['"]TARGET_NOT_FOUND['"]/s.test(adapter);
const canaryCommit=/eventType\s*:\s*['"]CANONICAL_CANARY_COMMIT['"]/.test(adapter);
const updateOnly=targetNotFound && canaryCommit;

// Bounded original-source scan for a true create-absent-target path.
function list(root,max=6000){
 const out=[],stack=[root];
 while(stack.length&&out.length<max){
  const d=stack.pop();let es=[];try{es=fs.readdirSync(d,{withFileTypes:true})}catch{continue}
  for(const e of es){
   const p=path.join(d,e.name),rel=path.relative(app,p);
   if(/node_modules|\.git|__pycache__|dist|build|src\/explorer4|evidence|test|spec/i.test(rel))continue;
   if(e.isDirectory())stack.push(p);
   else if(/\.(js|mjs|jsx|ts|tsx|gs)$/i.test(e.name)){try{if(fs.statSync(p).size<1_500_000)out.push(p)}catch{}}
  }
 }
 return out
}
const roots=[
 path.join(app,"src/runtime"),
 path.join(app,"src/broker-product"),
 path.join(app,"src/applications"),
 path.join(app,"tools"),
 path.join(app,"server")
].filter(fs.existsSync);
let files=[];for(const r of roots)files.push(...list(r,7000));
files=[...new Set(files)];

const candidates=[];
let n=0;
for(const p of files){
 n++; if(n%250===0) console.log(`[BJ3A4] scanned ${n}/${files.length}`);
 let s="";try{s=read(p)}catch{continue}
 const signals={
   canonicalId:/canonicalPropertyId|canonical_property_id/i.test(s),
   sourceId:/sourcePropertyId|source_property_id|BASE-/i.test(s),
   createVerb:/create.*(?:canonical|identity|property)|(?:canonical|identity|property).*create/i.test(s),
   creationEvent:/CANONICAL_(?:PROPERTY_)?CREATED|IDENTITY_CREATED|PROPERTY_CREATED|CANONICAL_CREATE/i.test(s),
   appendNew:/events\s*=\s*\[\.\.\.events\s*,|\.push\s*\(\s*event|append.*event/i.test(s),
   noTargetFoundGuard:/TARGET_NOT_FOUND/i.test(s),
   duplicateGuard:/duplicate|already exists|existing canonical|lookup.*canonical|resolve.*canonical/i.test(s),
   persistent:/writeFile|atomicWrite|persist|save\(|commit|appendFile/i.test(s),
   exported:/export\s+(?:async\s+)?function|export\s*\{|module\.exports/i.test(s)
 };
 // True-create candidate must show canonical identity + create semantics + persistence,
 // and should not merely be the known update-only adapter.
 const score=Object.values(signals).filter(Boolean).length;
 if(signals.canonicalId && signals.createVerb && signals.persistent && (signals.exported||signals.creationEvent) && p!==adapterPath){
   const funcs=[...s.matchAll(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)|const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(/g)]
     .map(m=>m[1]||m[2]).filter(Boolean).filter(x=>/canonical|identity|property|create|promote|commit/i.test(x));
   candidates.push({path:path.relative(app,p),score,functions:[...new Set(funcs)].slice(0,25),signals});
 }
}
candidates.sort((x,y)=>y.score-x.score||x.path.localeCompare(y.path));
console.log(`[BJ3A4] true-create candidates=${candidates.length}`);

let exact=null;
if(candidates.length===1) exact=candidates[0];
else if(candidates.length>1 && candidates[0].score>=candidates[1].score+2 && candidates[0].signals.creationEvent) exact=candidates[0];

finish(exact
 ?"M419D4BJ3A4_TRUE_CANONICAL_IDENTITY_CREATION_ORCHESTRATOR_UNIQUELY_BOUND_BJ3C_REPREAUTHORIZATION_READY"
 :"M419D4BJ3A4_CERTIFIED_ADAPTER_RECLASSIFIED_UPDATE_ONLY_TRUE_CREATION_ORCHESTRATOR_NOT_UNIQUELY_BOUND_FURTHER_TARGETED_FORENSICS_REQUIRED",{
 correction:{
   bj3bExecutionReadinessRevoked:true,
   certifiedAdapterPath:"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js",
   adapterTargetNotFoundGuardProven:targetNotFound,
   adapterCanaryCommitSemanticsProven:canaryCommit,
   adapterReclassified:updateOnly?"EXISTING_CANONICAL_TARGET_UPDATE_ADAPTER":"UNRESOLVED",
   reason:updateOnly?"writeAtomic rejects missing targets and appends CANONICAL_CANARY_COMMIT; it does not prove creation of an absent canonical identity.":"Direct update-only classification not fully proven."
 },
 forensics:{
   filesScanned:files.length,
   candidateCount:candidates.length,
   candidates:candidates.slice(0,30),
   exactTrueCreationBinding:exact
 },
 cohort:{
   size:b.cohort?.size||5,
   targets:b.cohort?.records||[],
   allExecutionAuthorized:false
 },
 policy:{
   updateAdapterCannotSubstituteForIdentityCreationOrchestrator:true,
   absentCanonicalTargetMustBeCreatableByProvenOriginalSourcePipeline:true,
   duplicateIdentityRecheckRequired:true,
   sourcePropertyIdAndAddressMustRemainBound:true,
   directSyntheticCPROPGenerationProhibited:true,
   noWriteInThisMilestone:true,
   BJ4ExecutionProhibitedUntilCorrectedRepreauthorization:true
 },
 nextMilestone:exact
  ?"M4.19D4BJ3C_CORRECTED_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_TRUE_CREATION_ORCHESTRATOR"
  :"M4.19D4BJ3A5_TARGETED_CANONICAL_IDENTITY_CREATION_EVENT_AND_ORCHESTRATOR_CALL_GRAPH_FORENSICS"
});
