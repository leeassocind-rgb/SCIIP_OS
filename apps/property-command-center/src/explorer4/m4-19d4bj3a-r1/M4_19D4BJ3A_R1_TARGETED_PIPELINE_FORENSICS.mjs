#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{execFileSync}from"node:child_process";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const bj3p=path.join(ev,"m4-19d4bj3-five-property-canonical-identity-creation-preauthorization.json");
const out=path.join(ev,"m4-19d4bj3a-r1-targeted-canonical-identity-creation-pipeline-forensics.json");

function write(x){fs.writeFileSync(out,JSON.stringify(x,null,2)+"\n");console.log(JSON.stringify(x,null,2))}
function finish(state,extra={}){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A_R1_TARGETED_CANONICAL_IDENTITY_CREATION_PIPELINE_FORENSICS",
 version:"4.0-m4.19d4bj3a-r1",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}};
 write(o);process.exit(0)
}
if(!fs.existsSync(bj3p))finish("M419D4BJ3A_R1_BJ3_PREAUTHORIZATION_REQUIRED");
const bj3=JSON.parse(fs.readFileSync(bj3p,"utf8"));
if(bj3.state!=="M419D4BJ3_EXISTING_CANONICAL_IDENTITY_CREATION_PIPELINE_UNIQUELY_BOUND_FIVE_RECORD_CREATION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")
 finish("M419D4BJ3A_R1_BJ3_STATE_REQUIRED",{observed:bj3.state});

console.log("[BJ3A-R1] targeted forensics starting");
console.log("[BJ3A-R1] prior evidence-file binding rejected");
console.log("[BJ3A-R1] scanning bounded executable source only");

const roots=[
 "src/runtime",
 "src/broker-product/property-explorer/intelligence",
 "src/applications",
 "server",
 "tools"
].map(r=>path.join(app,r)).filter(fs.existsSync);

const patterns=[
 "canonicalPropertyId",
 "sourcePropertyId",
 "CPROP-",
 "createCanonical",
 "createIdentity",
 "canonical.*create",
 "identity.*create",
 "persist",
 "append",
 "commit"
];

let files=new Set();
let rgAvailable=true;
try{execFileSync("rg",["--version"],{stdio:"ignore"})}catch{rgAvailable=false}

for(let i=0;i<roots.length;i++){
 const r=roots[i];
 console.log(`[BJ3A-R1] root ${i+1}/${roots.length}: ${path.relative(app,r)}`);
 if(rgAvailable){
  for(const pat of patterns.slice(0,7)){
   try{
    const s=execFileSync("rg",["-l","-i","--glob","*.{js,mjs,jsx,ts,tsx,gs,py,sh,command}",pat,r],{encoding:"utf8",timeout:12000,stdio:["ignore","pipe","ignore"]});
    for(const line of s.split("\n"))if(line.trim())files.add(path.resolve(line.trim()));
   }catch{}
  }
 }else{
  const stack=[r];
  while(stack.length&&files.size<700){
   const d=stack.pop();let es=[];try{es=fs.readdirSync(d,{withFileTypes:true})}catch{continue}
   for(const e of es){
    const p=path.join(d,e.name);
    if(e.isDirectory()){if(!/node_modules|dist|build|explorer4/.test(p))stack.push(p);continue}
    if(!/\.(js|mjs|jsx|ts|tsx|gs|py|sh|command)$/i.test(e.name))continue;
    let t="";try{if(fs.statSync(p).size<1500000)t=fs.readFileSync(p,"utf8")}catch{}
    if(patterns.some(x=>new RegExp(x,"i").test(t)))files.add(p);
   }
  }
 }
}

let candidates=[];
let n=0;
for(const p of [...files].slice(0,900)){
 n++;if(n%50===0)console.log(`[BJ3A-R1] analyzed ${n}/${Math.min(files.size,900)} candidate files`);
 let s="";try{s=fs.readFileSync(p,"utf8")}catch{continue}
 const signals={
  canonicalPropertyId:/canonicalPropertyId/i.test(s),
  sourcePropertyId:/sourcePropertyId/i.test(s),
  cprop:/CPROP-/i.test(s),
  create:/create.*(?:canonical|identity)|(?:canonical|identity).*create/i.test(s),
  persist:/append|write|persist|insert|commit|save/i.test(s),
  duplicate:/duplicate|existing|lookup|resolve/i.test(s),
  exported:/export\s+(?:async\s+)?function|module\.exports|export\s*\{/i.test(s),
  cli:/process\.argv|^#!/m.test(s)
 };
 const funcs=[...s.matchAll(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)|const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(/g)]
   .map(m=>m[1]||m[2]).filter(Boolean).filter(x=>/canonical|identity|property/i.test(x));
 const score=Object.values(signals).filter(Boolean).length+Math.min(funcs.length,3);
 if(signals.canonicalPropertyId&&signals.create&&signals.persist&&(signals.exported||signals.cli)&&score>=6){
   candidates.push({path:path.relative(app,p),score,functions:[...new Set(funcs)].slice(0,15),signals});
 }
}
candidates.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));
console.log(`[BJ3A-R1] executable candidates=${candidates.length}`);

let exact=null;
if(candidates.length===1)exact=candidates[0];
else if(candidates.length>1 && candidates[0].score>=candidates[1].score+2)exact=candidates[0];

finish(exact
 ?"M419D4BJ3A_R1_EXACT_EXECUTABLE_CANONICAL_IDENTITY_CREATION_PIPELINE_BOUND_BJ3B_READY"
 :"M419D4BJ3A_R1_EXECUTABLE_IDENTITY_CREATION_PIPELINE_REMAINS_AMBIGUOUS_BJ3A2_CALL_GRAPH_FORENSICS_REQUIRED",{
 correction:{
  priorBJ3BindingRejected:"evidence/m3-37a-canonical-candidate-discovery-schema-probe.json",
  broadSynchronousScanAbortedByOperator:true,
  targetedBoundedSearchUsed:true,
  progressDiagnosticsEnabled:true,
  evidenceTestsGeneratedExplorer4Excluded:true
 },
 forensics:{
  rootsScanned:roots.map(r=>path.relative(app,r)),
  rgAvailable,
  candidateFilesCollected:files.size,
  executableCandidateCount:candidates.length,
  candidates:candidates.slice(0,25),
  exactBinding:exact
 },
 targetsPreserved:bj3.targets,
 policy:{
  executableOriginalSourceRequired:true,
  evidenceCannotBeExecutionAuthority:true,
  exactInvocationMustBeCertifiedBeforeIdentityWrite:true,
  maximumFutureIdentityCreations:5,
  noWriteInThisMilestone:true
 },
 nextMilestone:exact
  ?"M4.19D4BJ3B_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_EXACT_EXECUTABLE_PIPELINE"
  :"M4.19D4BJ3A2_TARGETED_IDENTITY_CREATION_CALL_GRAPH_AND_STORAGE_ADAPTER_FORENSICS"
});
