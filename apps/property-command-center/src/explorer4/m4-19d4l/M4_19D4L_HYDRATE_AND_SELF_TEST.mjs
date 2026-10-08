#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";
import {CONTRACT,VERSION,parseEnv,redactEnv,sha} from "./M419D4LEnvRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4L_TEMP_PROXY_ENV_HYDRATION");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4k-lightbox-proxy-runtime-error-capture-controlled-retry.json");
const envPath=path.join(app,".env.local");
const proxyEntry=path.join(app,"server/lightbox/proxy-server.mjs");
const resultPath=path.join(ev,"m4-19d4l-isolated-proxy-environment-hydration-self-test-certification.json");
const logPath=path.join(ev,"m4-19d4l-temp-proxy-runtime.log");

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
      existingProxy8787Touched:false,
      temporaryProxyPort:8788,
      enrichmentRequestsPerformed:0,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      secretValuesExposed:false,
      automaticRetry:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [prior,envPath,proxyEntry]) if(!fs.existsSync(p))
  finish("BLOCKED","M419D4L_PREREQUISITE_MISSING",{path:p},3);

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4K_TEMP_PROXY_SELF_TEST_FAILED")
  finish("BLOCKED","M419D4L_M419D4K_SELF_TEST_FAILED_STATE_REQUIRED",{observed:pdoc?.state??null},3);

if(!authorized){
  finish("BLOCKED","M419D4L_EXPLICIT_TEMP_PROXY_ENV_HYDRATION_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4L_TEMP_PROXY_ENV_HYDRATION",
    temporaryProxyStarted:false,
    localDiagnosticRequestsPerformed:0
  },3);
}

const fileEnv=parseEnv(fs.readFileSync(envPath,"utf8"));
const env={...process.env,...fileEnv,LIGHTBOX_PROXY_PORT:"8788"};
const safeAudit=redactEnv(fileEnv);

fs.writeFileSync(logPath,"");
let logs="";
const child=spawn(process.execPath,[proxyEntry],{cwd:app,env,stdio:["ignore","pipe","pipe"]});
let exited=false, exitCode=null, signal=null;
child.on("exit",(c,s)=>{exited=true;exitCode=c;signal=s;});
const capture=(stream,chunk)=>{
  const t=`${new Date().toISOString()} ${stream} ${chunk.toString()}`;
  logs+=t; fs.appendFileSync(logPath,t);
};
child.stdout.on("data",c=>capture("STDOUT",c));
child.stderr.on("data",c=>capture("STDERR",c));

function get(pathName){
  return new Promise((resolve,reject)=>{
    const req=http.request({host:"127.0.0.1",port:8788,path:pathName,method:"GET",headers:{accept:"application/json"}},res=>{
      let data=""; res.on("data",c=>data+=c);
      res.on("end",()=>resolve({statusCode:res.statusCode,raw:data}));
    });
    req.on("error",reject); req.end();
  });
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

let selfTest=null;
for(let i=0;i<30;i++){
  if(exited) break;
  try{
    const r=await get("/api/lightbox/self-test");
    if(r.statusCode===200){selfTest=r;break;}
  }catch{}
  await sleep(150);
}

let parsed=null;
if(selfTest){ try{parsed=JSON.parse(selfTest.raw)}catch{} }

const ready=!!(
  selfTest &&
  selfTest.statusCode===200 &&
  parsed?.status==="READY" &&
  parsed?.configured===true
);

// Terminate only the temporary proxy.
if(!exited){
  child.kill("SIGTERM");
  for(let i=0;i<10 && !exited;i++) await sleep(50);
  if(!exited) child.kill("SIGKILL");
}
await sleep(100);

if(!ready){
  finish("BLOCKED","M419D4L_ENV_HYDRATED_TEMP_PROXY_SELF_TEST_NOT_READY",{
    environment:{
      envFileLoaded:true,
      envFilePath:envPath,
      environmentAudit:safeAudit,
      environmentValuesExposed:false
    },
    selfTest:{
      attempted:true,
      httpStatus:selfTest?.statusCode??null,
      parsedStatus:parsed?.status??null,
      configured:parsed?.configured??null
    },
    child:{exitCode,signal},
    runtimeLogSha:sha(logs),
    artifacts:{runtimeLog:logPath},
    localDiagnosticRequestsPerformed:true
  },3);
}

finish("PASSED","M419D4L_ISOLATED_LIGHTBOX_PROXY_ENVIRONMENT_HYDRATED_SELF_TEST_CERTIFIED",{
  environment:{
    envFileLoaded:true,
    envFilePath:envPath,
    environmentAudit:safeAudit,
    environmentValuesExposed:false
  },
  selfTest:{
    httpStatus:selfTest.statusCode,
    status:parsed.status,
    configured:parsed.configured,
    canonicalAuthority:parsed.canonicalAuthority??null,
    parcelContract:parsed.parcelContract??null
  },
  temporaryProxy:{
    port:8788,
    started:true,
    selfTestCertified:true,
    terminatedAfterCertification:true
  },
  runtimeLogSha:sha(logs),
  artifacts:{runtimeLog:logPath},
  localDiagnosticRequestsPerformed:true,
  enrichmentRequestsPerformed:0,
  nextMilestone:"M4.19D4M_ENV_HYDRATED_PROXY_CONTROLLED_SINGLE_POST_EXECUTION_AND_RUNTIME_CAPTURE"
},0);
