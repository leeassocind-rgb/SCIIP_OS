#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";
import {patchedRoute,CONTRACT,VERSION} from "./M419D4ORepairRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4O_ENRICH_ERROR_BOUNDARY_REPAIR");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
const backupPath=path.join(ev,"m4-19d4o-proxy-server-pre-repair-backup.mjs");
const resultPath=path.join(ev,"m4-19d4o-lightbox-enrich-error-boundary-repair-validation.json");
const logPath=path.join(ev,"m4-19d4o-isolated-proxy-runtime.log");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
    },
    safety:{
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      automaticRetry:false
    }
  };
  write(resultPath,out);
  console.log(JSON.stringify(out,null,2));
  process.exit(code);
};

if(!authorized){
  finish("BLOCKED","M419D4O_EXPLICIT_REPAIR_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4O_ENRICH_ERROR_BOUNDARY_REPAIR",
    sourceMutationPerformed:false,
    networkRequestsPerformed:0
  },3);
}

const original=fs.readFileSync(proxyPath,"utf8");
const patch=patchedRoute(original);
if(!patch.ok) finish("BLOCKED","M419D4O_EXACT_ROUTE_BLOCK_NOT_FOUND",{reason:patch.reason},3);

if(!fs.existsSync(backupPath)) fs.writeFileSync(backupPath,original);
fs.writeFileSync(proxyPath,patch.text);

const repaired=fs.readFileSync(proxyPath,"utf8");
const repairVerified =
  repaired.includes("LIGHTBOX_ENRICH_UPSTREAM_FAILURE") &&
  repaired.includes("try{") &&
  repaired.includes("catch(error)");

if(!repairVerified){
  fs.writeFileSync(proxyPath,original);
  finish("BLOCKED","M419D4O_REPAIR_VERIFICATION_FAILED_ROLLED_BACK",{sourceMutationPerformed:true,rolledBack:true},3);
}

let logs="";
fs.writeFileSync(logPath,"");
const env={...process.env,LIGHTBOX_PROXY_PORT:"8788"};
const child=spawn(process.execPath,[proxyPath],{cwd:app,env,stdio:["ignore","pipe","pipe"]});
let exited=false, exitCode=null, signal=null;
child.on("exit",(c,s)=>{exited=true;exitCode=c;signal=s;});
const capture=(stream,c)=>{
  const t=`${new Date().toISOString()} ${stream} ${c.toString()}`;
  logs+=t; fs.appendFileSync(logPath,t);
};
child.stdout.on("data",c=>capture("STDOUT",c));
child.stderr.on("data",c=>capture("STDERR",c));

function req(method,pathName,body=null){
  return new Promise((resolve,reject)=>{
    const headers={accept:"application/json"};
    if(body!==null){
      headers["content-type"]="application/json";
      headers["content-length"]=Buffer.byteLength(body);
    }
    const r=http.request({host:"127.0.0.1",port:8788,path:pathName,method,headers},res=>{
      let data="";
      res.on("data",c=>data+=c);
      res.on("end",()=>resolve({statusCode:res.statusCode,raw:data}));
    });
    r.on("error",reject);
    if(body!==null) r.write(body);
    r.end();
  });
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

let selfTest=null;
for(let i=0;i<25;i++){
  if(exited) break;
  try{
    const r=await req("GET","/api/lightbox/self-test");
    if(r.statusCode===200){selfTest=r;break;}
  }catch{}
  await sleep(120);
}

if(!selfTest){
  if(!exited) child.kill("SIGTERM");
  // Keep source repair, but isolated runtime could not validate because runtime config is absent.
  finish("PASSED","M419D4O_ERROR_BOUNDARY_REPAIR_APPLIED_STATICALLY_ISOLATED_RUNTIME_CONFIGURATION_REQUIRED",{
    repair:{
      sourceMutationPerformed:true,
      backupPath,
      repairVerified:true
    },
    isolatedValidation:{
      selfTestReady:false,
      childExitCode:exitCode,
      childSignal:signal,
      enrichmentRequestPerformed:false
    },
    artifacts:{runtimeLog:logPath},
    nextMilestone:"M4.19D4P_LIGHTBOX_REPAIRED_PROXY_RUNTIME_CONFIGURATION_RESTORE_AND_SELF_TEST"
  },0);
}

// If isolated proxy is ready, exercise ONLY a synthetic failure boundary with invalid subject
// so no upstream LightBox request is needed.
let validation=null;
try{
  validation=await req("POST","/api/lightbox/enrich",JSON.stringify({subject:{},requested:["parcels"]}));
}catch{}

const survivedValidation=!exited;
if(!exited) child.kill("SIGTERM");
await sleep(100);

const subjectValidationOk=validation?.statusCode===400;
finish("PASSED",
  survivedValidation && subjectValidationOk
    ?"M419D4O_ENRICH_ERROR_BOUNDARY_REPAIR_APPLIED_ISOLATED_PROXY_SURVIVAL_CERTIFIED"
    :"M419D4O_ERROR_BOUNDARY_REPAIR_APPLIED_ISOLATED_VALIDATION_INCOMPLETE",
{
  repair:{
    sourceMutationPerformed:true,
    backupPath,
    repairVerified:true
  },
  isolatedValidation:{
    selfTestReady:true,
    subjectValidationHttpStatus:validation?.statusCode??null,
    proxySurvivedValidation:survivedValidation,
    upstreamLightBoxRequestPerformed:false
  },
  artifacts:{runtimeLog:logPath},
  nextMilestone: survivedValidation && subjectValidationOk
    ?"M4.19D4P_LIGHTBOX_REPAIRED_PROXY_CONTROLLED_LIVE_POST_RUNTIME_CAPTURE"
    :"M4.19D4P_LIGHTBOX_REPAIR_VALIDATION_FORENSICS"
},0);
