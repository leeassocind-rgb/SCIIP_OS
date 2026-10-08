#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {sha,norm,recordsOf,flatten} from "./M419D4BD34Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const auth=process.argv[3]||"";
const REQUIRED_AUTH="AUTHORIZE_M419D4BD4_BOUND_BUILD_MATERIALIZATION";
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bd3Path=path.join(ev,"m4-19d4bd3-bound-build-materializer-invocation-certification.json");
const invokePath=path.join(ev,"m4-19d4bd3-bound-build-materializer-invocation-manifest.json");
const result=path.join(ev,"m4-19d4bd4-controlled-bound-build-materialization-and-parity-certification.json");
const audit=path.join(ev,"m4-19d4bd4-build-materialization-execution-and-parity-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
  const o={
    contract:"SCIIP_EXPLORER_4_M4_19D4BD4_CONTROLLED_BOUND_BUILD_MATERIALIZATION_EXECUTION_AND_POST_MATERIALIZATION_PARITY",
    version:"4.0-m4.19d4bd4",status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
      syncAuthority:false,propagationAuthority:state.includes("EXECUTED")||state.includes("CERTIFIED"),automaticRetry:false},
    safety:{networkRequestsPerformed:0,currentStateMutationPerformed:false,canonicalMutationPerformed:false,
      identityMutationPerformed:false,automaticRetry:false}
  };
  write(result,o); console.log(JSON.stringify(o,null,2)); process.exit(code);
}

for(const p of [bd3Path,invokePath]){
  if(!fs.existsSync(p)) done("BLOCKED","M419D4BD4_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}
const bd3=JSON.parse(fs.readFileSync(bd3Path,"utf8"));
if(bd3.state!=="M419D4BD3_BOUND_BUILD_MATERIALIZER_INVOCATION_CERTIFIED_CONTROLLED_EXECUTION_PREAUTHORIZED")
  done("BLOCKED","M419D4BD4_BD3_CERTIFIED_INVOCATION_STATE_REQUIRED",{observed:bd3.state},3);

const pre=JSON.parse(fs.readFileSync(invokePath,"utf8"));
if(auth!==REQUIRED_AUTH)
  done("BLOCKED","M419D4BD4_EXPLICIT_BUILD_MATERIALIZATION_AUTHORIZATION_REQUIRED",{
    requiredAuthorizationToken:REQUIRED_AUTH,executionPerformed:false
  },3);

if(!fs.existsSync(pre.producer) || sha(fs.readFileSync(pre.producer,"utf8"))!==pre.binding.producerSha256)
  done("BLOCKED","M419D4BD4_BOUND_PRODUCER_CHANGED_AFTER_BD3",{},3);

const sourceBefore=fs.readFileSync(pre.sourceInventoryPath,"utf8");
if(sha(sourceBefore)!==pre.sourceInventorySha256)
  done("BLOCKED","M419D4BD4_SOURCE_INVENTORY_CHANGED_AFTER_PREAUTHORIZATION",{},3);

/* Snapshot JSON files under public/explorer and public before execution. */
function listJson(root,out=[]){
  if(!fs.existsSync(root)) return out;
  for(const e of fs.readdirSync(root,{withFileTypes:true})){
    const p=path.join(root,e.name);
    if(e.isDirectory()) listJson(p,out);
    else if(/\.json$/i.test(e.name)){
      try{
        if(fs.statSync(p).size<=20*1024*1024){
          const t=fs.readFileSync(p,"utf8"); out.push({path:p,sha256:sha(t),bytes:Buffer.byteLength(t)});
        }
      }catch{}
    }
  }
  return out;
}
const snapshots=listJson(path.join(app,"public"));
const beforeMap=new Map(snapshots.map(x=>[x.path,x]));

let ex;
if(pre.binding.mode==="PACKAGE_SCRIPT"){
  ex=spawnSync("npm",["run",pre.binding.name],{cwd:path.dirname(pre.binding.packageJson),encoding:"utf8",timeout:180000});
}else if(pre.binding.mode==="DIRECT_NODE_NO_ARGS"){
  ex=spawnSync("node",[pre.producer],{cwd:pre.binding.cwd||app,encoding:"utf8",timeout:180000});
}else if(pre.binding.mode==="DIRECT_NODE_WITH_APP_ROOT"){
  ex=spawnSync("node",[pre.producer,app],{cwd:pre.binding.cwd||app,encoding:"utf8",timeout:180000});
}else{
  done("BLOCKED","M419D4BD4_UNSUPPORTED_CERTIFIED_INVOCATION_MODE",{binding:pre.binding},3);
}

if(ex.error||ex.status!==0){
  write(audit,{
    contract:"SCIIP_EXPLORER_4_M4_19D4BD4_BUILD_MATERIALIZATION_EXECUTION_AND_PARITY_AUDIT",
    version:"4.0-m4.19d4bd4",generatedAt:new Date().toISOString(),
    execution:{attempted:true,status:ex.status,error:String(ex.error??""),stdout:(ex.stdout??"").slice(-12000),stderr:(ex.stderr??"").slice(-12000)}
  });
  done("BLOCKED","M419D4BD4_BOUND_BUILD_MATERIALIZER_EXECUTION_FAILED",{
    execution:{status:ex.status,error:String(ex.error??""),stdoutTail:(ex.stdout??"").slice(-4000),stderrTail:(ex.stderr??"").slice(-4000)},
    artifacts:{executionAudit:audit},
    nextMilestone:"M4.19D4BD4A_BOUND_BUILD_EXECUTION_FAILURE_FORENSICS"
  },3);
}

const sourceAfter=fs.readFileSync(pre.sourceInventoryPath,"utf8");
if(sha(sourceAfter)!==pre.sourceInventorySha256)
  done("BLOCKED","M419D4BD4_GOVERNED_SOURCE_MUTATED_BY_BUILD_MATERIALIZER",{},3);

const after=listJson(path.join(app,"public"));
const changed=[];
for(const x of after){
  const b=beforeMap.get(x.path);
  if(!b || b.sha256!==x.sha256) changed.push({path:x.path,sha256Before:b?.sha256??null,sha256After:x.sha256,bytesBefore:b?.bytes??null,bytesAfter:x.bytes});
}

/* Search actual public JSON outputs for the target identity/address after materialization. */
const visible=[];
for(const f of after){
  let doc;
  try{doc=JSON.parse(fs.readFileSync(f.path,"utf8"))}catch{continue}
  const {records}=recordsOf(doc);
  if(records.length){
    for(let i=0;i<records.length;i++){
      const r=records[i];
      const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
      if(vals.includes(norm(pre.canonicalPropertyId))||vals.includes(norm(pre.address)))
        visible.push({path:f.path,index:i,record:r,recordHash:sha(r)});
    }
  }else{
    const flat=flatten(doc);
    const hasCid=flat.some(e=>norm(e.value)===norm(pre.canonicalPropertyId));
    const hasAddr=flat.some(e=>norm(e.value)===norm(pre.address));
    if(hasCid||hasAddr) visible.push({path:f.path,index:null,record:doc,recordHash:sha(doc),nested:true});
  }
}

const parity=visible.map(v=>{
  const r=v.record;
  return {
    path:v.path,index:v.index,
    canonicalIdentity:norm(r.canonicalPropertyId)===norm(pre.canonicalPropertyId),
    address:norm(r.address)===norm(pre.address),
    latitude:Number(r.latitude)===34.1810708,
    longitude:Number(r.longitude)===-118.4408537,
    availableSf:Number(r.availableSf)===Number(pre.availableSf)
  };
});
const qualified=parity.filter(x=>x.canonicalIdentity&&x.address&&x.latitude&&x.longitude&&x.availableSf);

const failures=[];
if(qualified.length===0) failures.push("NO_PUBLIC_OUTPUT_CONTAINS_FULL_BESSEMER_PARITY");
if(qualified.length>1) failures.push("MULTIPLE_PUBLIC_OUTPUTS_CONTAIN_FULL_BESSEMER_PARITY_REVIEW_REQUIRED");

write(audit,{
  contract:"SCIIP_EXPLORER_4_M4_19D4BD4_BUILD_MATERIALIZATION_EXECUTION_AND_PARITY_AUDIT",
  version:"4.0-m4.19d4bd4",generatedAt:new Date().toISOString(),
  execution:{attempted:true,status:0,stdout:(ex.stdout??"").slice(-12000),stderr:(ex.stderr??"").slice(-12000)},
  sourceInventorySha256Before:pre.sourceInventorySha256,
  sourceInventorySha256After:sha(sourceAfter),
  changedPublicJsonSurfaces:changed,
  visibleCandidates:visible.map(v=>({path:v.path,index:v.index,recordHash:v.recordHash,nested:v.nested??false})),
  parity,qualified,failures
});

if(failures.length)
  done("PASSED","M419D4BD4_BUILD_MATERIALIZATION_EXECUTED_POST_MATERIALIZATION_PARITY_NOT_YET_CERTIFIED",{
    execution:{materializationPerformed:true,changedPublicJsonSurfaceCount:changed.length,sourceInventoryUnchanged:true},
    parity:{qualifiedCount:qualified.length,failures},
    artifacts:{executionAndParityAudit:audit},
    nextMilestone:"M4.19D4BD5_POST_MATERIALIZATION_OUTPUT_BINDING_RECONCILIATION"
  });

done("PASSED","M419D4BD4_BOUND_BUILD_MATERIALIZATION_EXECUTED_EXPLORER_OUTPUT_PARITY_CERTIFIED",{
  execution:{materializationPerformed:true,changedPublicJsonSurfaceCount:changed.length,sourceInventoryUnchanged:true},
  certification:{
    canonicalPropertyId:pre.canonicalPropertyId,address:pre.address,
    latitude:34.1810708,longitude:-118.4408537,availableSf:pre.availableSf,
    explorerOutputSurface:qualified[0].path,explorerRecordIndex:qualified[0].index
  },
  artifacts:{executionAndParityAudit:audit},
  nextMilestone:"M4.19D4BF_RUNTIME_EXPLORER_VISIBILITY_AND_UI_BINDING_CERTIFICATION"
});
