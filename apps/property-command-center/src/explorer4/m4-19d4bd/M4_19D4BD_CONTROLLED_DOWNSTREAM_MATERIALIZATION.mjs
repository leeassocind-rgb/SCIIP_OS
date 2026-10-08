#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {sha,norm,recordsOf,duplicateMatches} from "./M419D4BDBERuntime.js";

const repo=path.resolve(process.argv[2]||".");
const auth=process.argv[3]||"";
const REQUIRED_AUTH="AUTHORIZE_M419D4BD_CONTROLLED_DOWNSTREAM_MATERIALIZATION";
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");

const bcPath=path.join(ev,"m4-19d4bc-explorer-visibility-parity-simulation.json");
const bbPre=path.join(ev,"m4-19d4bb-downstream-materialization-preauthorization-manifest.json");
const bbAudit=path.join(ev,"m4-19d4bb-downstream-surface-discovery-audit.json");
const result=path.join(ev,"m4-19d4bd-controlled-downstream-materialization-execution.json");
const audit=path.join(ev,"m4-19d4bd-production-materializer-binding-and-execution-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BD_CONTROLLED_DOWNSTREAM_MATERIALIZATION_EXECUTION",
 version:"4.0-m4.19d4bd",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:state.includes("EXECUTED"),automaticRetry:false},
 safety:{networkRequestsPerformed:0,currentStateMutationPerformed:false,canonicalMutationPerformed:false,
 identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bcPath,bbPre,bbAudit]) if(!fs.existsSync(p)) done("BLOCKED","M419D4BD_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const bc=JSON.parse(fs.readFileSync(bcPath,"utf8"));
if(bc.state!=="M419D4BC_EXPLORER_VISIBILITY_PARITY_SIMULATION_CERTIFIED_PROPAGATION_EXECUTION_NOT_AUTHORIZED")
 done("BLOCKED","M419D4BD_BC_CERTIFIED_SIMULATION_STATE_REQUIRED",{observed:bc.state},3);

const pre=JSON.parse(fs.readFileSync(bbPre,"utf8"));
const sourceText=fs.readFileSync(pre.sourceInventoryPath,"utf8");
if(sha(sourceText)!==pre.sourceInventorySha256) done("BLOCKED","M419D4BD_SOURCE_INVENTORY_CHANGED_AFTER_BB",{},3);

const auditBB=JSON.parse(fs.readFileSync(bbAudit,"utf8"));
const candidatePaths=(auditBB.candidates??[]).map(x=>x.path).filter(Boolean);

function inspectFile(p){
 let t="";try{t=fs.readFileSync(p,"utf8")}catch{return null}
 const lower=t.toLowerCase();
 const ext=path.extname(p).toLowerCase();
 const original=!p.includes("/src/explorer4/")&&!p.includes("/evidence/");
 const referencesSource=/governed-base-inventory\.json/i.test(t);
 const hasWrite=/writeFileSync|writeFile\(|renameSync|copyFileSync|fs\.promises\.writeFile|outputFile/i.test(t);
 const hasMaterialize=/materializ|hydrate|compile|build.*inventory|inventory.*build|generate.*explorer|explorer.*generate/i.test(lower);
 const hasCli=/process\.argv|#!/i.test(t);
 return {path:p,ext,original,referencesSource,hasWrite,hasMaterialize,hasCli};
}
const inspected=candidatePaths.map(inspectFile).filter(Boolean);
const scriptCandidates=inspected.filter(x=>x.original&&x.referencesSource&&x.hasWrite&&x.hasMaterialize&&[".js",".mjs",".ts"].includes(x.ext));

/* Also inspect package scripts for an explicit original command whose command text
   points at one of the proven original materializer scripts. */
const pkgPaths=[path.join(app,"package.json"),path.join(repo,"package.json")].filter(fs.existsSync);
const packageScriptCandidates=[];
for(const pp of pkgPaths){
 try{
  const pkg=JSON.parse(fs.readFileSync(pp,"utf8"));
  for(const [name,cmd] of Object.entries(pkg.scripts??{})){
   if(/materializ|inventory|explorer|build/i.test(name+" "+cmd)){
    const matches=scriptCandidates.filter(x=>cmd.includes(path.basename(x.path))||cmd.includes(path.relative(path.dirname(pp),x.path)));
    if(matches.length===1) packageScriptCandidates.push({packageJson:pp,name,command:cmd,script:matches[0].path});
   }
  }
 }catch{}
}

const uniqueByScript=[...new Map(scriptCandidates.map(x=>[x.path,x])).values()];
const exactBinding=(packageScriptCandidates.length===1)?{
 mode:"PACKAGE_SCRIPT",packageJson:packageScriptCandidates[0].packageJson,
 npmScript:packageScriptCandidates[0].name,scriptPath:packageScriptCandidates[0].script
}:(packageScriptCandidates.length===0&&uniqueByScript.length===1&&uniqueByScript[0].hasCli)?{
 mode:"DIRECT_NODE_CLI",scriptPath:uniqueByScript[0].path
}:null;

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BD_PRODUCTION_MATERIALIZER_BINDING_AND_EXECUTION_AUDIT",
 version:"4.0-m4.19d4bd",generatedAt:new Date().toISOString(),
 candidateSurfaceCount:candidatePaths.length,inspected,scriptCandidates:uniqueByScript,
 packageScriptCandidates,exactBinding,executionAuthorized:auth===REQUIRED_AUTH
});

if(!exactBinding){
 done("PASSED","M419D4BD_EXACT_PRODUCTION_MATERIALIZER_NOT_UNIQUELY_BOUND_EXECUTION_BLOCKED",{
  binding:{candidateSurfaceCount:candidatePaths.length,scriptCandidateCount:uniqueByScript.length,
   packageScriptCandidateCount:packageScriptCandidates.length,exactBinding:null},
  policy:{blindDownstreamMutationProhibited:true,originalProductionMaterializerRequired:true,
   exactInvocationRequired:true,sourceInventoryMustRemainImmutable:true},
  artifacts:{materializerBindingAudit:audit},
  nextMilestone:"M4.19D4BD1_EXACT_PRODUCTION_MATERIALIZER_TARGET_AND_INVOCATION_FORENSICS"
 });
}

if(auth!==REQUIRED_AUTH){
 done("BLOCKED","M419D4BD_EXPLICIT_PROPAGATION_AUTHORIZATION_REQUIRED",{
  binding:exactBinding,requiredAuthorizationToken:REQUIRED_AUTH
 },3);
}

/* Snapshot candidate JSON surfaces before execution so BE can prove what changed. */
const snapshots=[];
for(const p of candidatePaths){
 if(path.extname(p).toLowerCase()!==".json"||!fs.existsSync(p)) continue;
 try{
  const t=fs.readFileSync(p,"utf8"); snapshots.push({path:p,sha256Before:sha(t),bytesBefore:Buffer.byteLength(t)});
 }catch{}
}
const sourceHashBefore=sha(sourceText);

let execResult;
if(exactBinding.mode==="PACKAGE_SCRIPT"){
 const cwd=path.dirname(exactBinding.packageJson);
 execResult=spawnSync("npm",["run",exactBinding.npmScript],{cwd,encoding:"utf8",timeout:120000});
}else{
 execResult=spawnSync("node",[exactBinding.scriptPath],{cwd:app,encoding:"utf8",timeout:120000});
}
if(execResult.error||execResult.status!==0){
 write(audit,{...JSON.parse(fs.readFileSync(audit,"utf8")),execution:{
  attempted:true,status:execResult.status,error:String(execResult.error??""),stdout:(execResult.stdout??"").slice(-12000),stderr:(execResult.stderr??"").slice(-12000)
 }});
 done("BLOCKED","M419D4BD_PRODUCTION_MATERIALIZER_EXECUTION_FAILED",{
  binding:exactBinding,execution:{status:execResult.status,error:String(execResult.error??""),
   stdoutTail:(execResult.stdout??"").slice(-4000),stderrTail:(execResult.stderr??"").slice(-4000)},
  nextMilestone:"M4.19D4BD2_PRODUCTION_MATERIALIZER_EXECUTION_FAILURE_FORENSICS"
 },3);
}

const sourceHashAfter=sha(fs.readFileSync(pre.sourceInventoryPath,"utf8"));
if(sourceHashAfter!==sourceHashBefore) done("BLOCKED","M419D4BD_SOURCE_INVENTORY_MUTATED_BY_DOWNSTREAM_MATERIALIZER",{
 sourceHashBefore,sourceHashAfter
},3);

const changed=[];
for(const s of snapshots){
 if(!fs.existsSync(s.path)) continue;
 const t=fs.readFileSync(s.path,"utf8"), h=sha(t);
 if(h!==s.sha256Before) changed.push({...s,sha256After:h,bytesAfter:Buffer.byteLength(t)});
}
const execAudit=JSON.parse(fs.readFileSync(audit,"utf8"));
write(audit,{...execAudit,execution:{attempted:true,status:0,stdout:(execResult.stdout??"").slice(-12000),
 stderr:(execResult.stderr??"").slice(-12000),changedJsonSurfaces:changed,sourceInventorySha256Before:sourceHashBefore,
 sourceInventorySha256After:sourceHashAfter}});

done("PASSED","M419D4BD_CONTROLLED_PRODUCTION_DOWNSTREAM_MATERIALIZATION_EXECUTED_POST_PROPAGATION_CERTIFICATION_REQUIRED",{
 execution:{binding:exactBinding,changedJsonSurfaceCount:changed.length,changedJsonSurfaces:changed,
 sourceInventoryUnchanged:true},
 artifacts:{materializerBindingAndExecutionAudit:audit},
 nextMilestone:"M4.19D4BE_POST_PROPAGATION_EXPLORER_PARITY_CERTIFICATION"
});
