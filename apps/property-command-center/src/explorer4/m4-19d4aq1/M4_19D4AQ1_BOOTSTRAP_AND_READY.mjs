#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";
import {CONTRACT,VERSION} from "./M419D4AQ1Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4AQ1_PROXY_BOOTSTRAP");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const aqPath=path.join(ev,"m4-19d4aq-controlled-single-lightbox-point-read-execution-parcel-evidence-qualification.json");
const resultPath=path.join(ev,"m4-19d4aq1-lightbox-proxy-runtime-bootstrap-readiness-recovery.json");
const logPath=path.join(ev,"m4-19d4aq1-lightbox-proxy-runtime.log");
const retryPath=path.join(ev,"m4-19d4aq1-controlled-point-read-retry-preauthorization.json");
const envPath=path.join(app,".env.local");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const finish=(status,state,extra={},code=0)=>{
  const out={
    contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{
      temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
      operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,
      automaticRetry:false
    },
    safety:{
      enrichmentRequestsPerformed:0,pointReadsPerformed:0,
      canonicalMutationPerformed:false,temporalMutationPerformed:false,
      identityMutationPerformed:false,operationalIngestionPerformed:false,
      secretValuesExposed:false,automaticRetry:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [aqPath,proxyPath]){
  if(!fs.existsSync(p)) finish("BLOCKED","M419D4AQ1_PREREQUISITE_MISSING",{path:p},3);
}
const aq=JSON.parse(fs.readFileSync(aqPath,"utf8"));
if(aq?.state!=="M419D4AQ_LIGHTBOX_POINT_READ_TRANSPORT_FAILED"){
  finish("BLOCKED","M419D4AQ1_AQ_TRANSPORT_FAILURE_STATE_REQUIRED",{observed:aq?.state??null},3);
}
if(!authorized){
  finish("BLOCKED","M419D4AQ1_EXPLICIT_PROXY_BOOTSTRAP_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4AQ1_PROXY_BOOTSTRAP"
  },3);
}

function parseEnv(text=""){
  const out={};
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith("#"))continue;
    const m=line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if(!m)continue;
    let v=m[2].trim();
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);
    out[m[1]]=v;
  }
  return out;
}
const fileEnv=fs.existsSync(envPath)?parseEnv(fs.readFileSync(envPath,"utf8")):{};
const childEnv={...process.env,...fileEnv,LIGHTBOX_PROXY_PORT:"8787"};

const keyPresent=!!childEnv.LIGHTBOX_API_KEY;
if(!keyPresent){
  finish("BLOCKED","M419D4AQ1_REQUIRED_LIGHTBOX_API_KEY_NOT_BOUND",{
    environment:{envFileLoaded:fs.existsSync(envPath),apiKeyBound:false}
  },3);
}

function isListening(){
  return new Promise(resolve=>{
    const req=http.get("http://127.0.0.1:8787/api/lightbox/self-test",res=>{
      let raw="";res.on("data",c=>raw+=c);res.on("end",()=>{
        let doc=null;try{doc=JSON.parse(raw)}catch{}
        resolve({reachable:true,httpStatus:res.statusCode,doc});
      });
    });
    req.on("error",()=>resolve({reachable:false,httpStatus:null,doc:null}));
    req.setTimeout(1200,()=>{req.destroy();resolve({reachable:false,httpStatus:null,doc:null})});
  });
}

let initial=await isListening();
let child=null;
let startedByMilestone=false;

if(!initial.reachable){
  const log=fs.openSync(logPath,"a");
  child=spawn(process.execPath,[proxyPath],{
    cwd:app,
    env:childEnv,
    detached:true,
    stdio:["ignore",log,log]
  });
  child.unref();
  startedByMilestone=true;
  fs.closeSync(log);

  let ready=null;
  for(let i=0;i<20;i++){
    await new Promise(r=>setTimeout(r,250));
    ready=await isListening();
    if(ready.reachable)break;
  }
  initial=ready;
}

if(!initial?.reachable){
  finish("BLOCKED","M419D4AQ1_PROXY_BOOTSTRAP_FAILED",{
    bootstrap:{startedByMilestone,listenerReachable:false},
    artifacts:{runtimeLog:logPath}
  },3);
}

const readyDoc=initial.doc;
const ready = initial.httpStatus===200 &&
  readyDoc?.status==="READY" &&
  readyDoc?.configured===true;

if(!ready){
  finish("BLOCKED","M419D4AQ1_PROXY_REACHABLE_BUT_NOT_READY",{
    bootstrap:{
      startedByMilestone,
      listenerReachable:true,
      httpStatus:initial.httpStatus,
      status:readyDoc?.status??null,
      configured:readyDoc?.configured??null
    },
    artifacts:{runtimeLog:logPath}
  },3);
}

const retry={
  contract:"SCIIP_EXPLORER_4_M4_19D4AQ1_CONTROLLED_POINT_READ_RETRY_PREAUTHORIZATION",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  priorFailure:"ECONNREFUSED_127.0.0.1_8787",
  proxyReadiness:{
    endpoint:"http://127.0.0.1:8787/api/lightbox/self-test",
    httpStatus:initial.httpStatus,
    status:readyDoc.status,
    configured:readyDoc.configured,
    canonicalAuthority:readyDoc.canonicalAuthority??null,
    parcelContract:readyDoc.parcelContract??null
  },
  retryPolicy:{
    maximumPointReadRetries:1,
    automaticRetry:false,
    executionAuthorized:false,
    explicitAuthorizationRequired:true
  }
};
write(retryPath,retry);

finish("PASSED","M419D4AQ1_LIGHTBOX_PROXY_RUNTIME_READY_SINGLE_POINT_READ_RETRY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
  bootstrap:{
    startedByMilestone,
    listenerReachable:true,
    httpStatus:initial.httpStatus,
    status:readyDoc.status,
    configured:readyDoc.configured,
    canonicalAuthority:readyDoc.canonicalAuthority??null,
    parcelContract:readyDoc.parcelContract??null
  },
  policy:{
    blindRetryProhibited:true,
    runtimeCauseIdentified:true,
    oneControlledRetryMaximum:true,
    automaticRetry:false,
    executionAuthorized:false
  },
  artifacts:{
    runtimeLog:logPath,
    retryPreauthorization:retryPath
  },
  nextMilestone:"M4.19D4AQ2_CONTROLLED_SINGLE_LIGHTBOX_POINT_READ_RETRY_AND_PARCEL_EVIDENCE_QUALIFICATION"
},0);
