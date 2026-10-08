#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import http from "node:http";
import {CONTRACT,VERSION,sha,classifyLog} from "./M419D4KCaptureRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4K_TEMP_PROXY_AND_SINGLE_POST_RETRY");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4j-lightbox-post-socket-hangup-failure-forensics.json");
const launcher=path.join(ev,"m4-19d4h-corrected-single-record-post-dry-run-launcher.json");
const resultPath=path.join(ev,"m4-19d4k-lightbox-proxy-runtime-error-capture-controlled-retry.json");
const logPath=path.join(ev,"m4-19d4k-temp-proxy-runtime.log");
const responsePath=path.join(ev,"m4-19d4k-controlled-single-post-response.json");

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
      maximumControlledPostRetries:1,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      automaticRetry:false,
      evidenceFabricated:false
    }
  };
  write(resultPath,out);
  console.log(JSON.stringify(out,null,2));
  process.exit(code);
};

for(const p of [prior,launcher]) if(!fs.existsSync(p)) finish("BLOCKED","M419D4K_PREREQUISITE_MISSING",{path:p},3);
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4J_SOCKET_HANGUP_CAUSAL_FORENSICS_CERTIFIED_RUNTIME_ERROR_CAPTURE_REQUIRED")
  finish("BLOCKED","M419D4K_M419D4J_RUNTIME_CAPTURE_REQUIRED_STATE_EXPECTED",{observed:pdoc?.state??null},3);

if(!authorized){
  finish("BLOCKED","M419D4K_EXPLICIT_TEMP_PROXY_AND_SINGLE_RETRY_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4K_TEMP_PROXY_AND_SINGLE_POST_RETRY",
    networkRequestsPerformed:0,
    temporaryProxyStarted:false
  },3);
}

const ldoc=JSON.parse(fs.readFileSync(launcher,"utf8"));
const requestBody=JSON.stringify(ldoc.body);
const tempPort=8788;
const proxyEntry=path.join(app,"server/lightbox/proxy-server.mjs");
if(!fs.existsSync(proxyEntry)) finish("BLOCKED","M419D4K_PROXY_ENTRYPOINT_MISSING",{path:proxyEntry},3);

// Capture stdout/stderr in-memory and persist after each chunk.
let logs="";
fs.writeFileSync(logPath,"");
const env={...process.env,LIGHTBOX_PROXY_PORT:String(tempPort)};

const child=spawn(process.execPath,[proxyEntry],{
  cwd:app,
  env,
  stdio:["ignore","pipe","pipe"]
});
const append=(prefix,chunk)=>{
  const text=`${new Date().toISOString()} ${prefix} ${chunk.toString()}`;
  logs+=text; fs.appendFileSync(logPath,text);
};
child.stdout.on("data",c=>append("STDOUT",c));
child.stderr.on("data",c=>append("STDERR",c));

let childExited=false, childExitCode=null, childSignal=null;
child.on("exit",(code,signal)=>{childExited=true;childExitCode=code;childSignal=signal;});

function httpReq({method,pathName,body=null}){
  return new Promise((resolve,reject)=>{
    const headers={"accept":"application/json"};
    if(body!==null){
      headers["content-type"]="application/json";
      headers["content-length"]=Buffer.byteLength(body);
    }
    const req=http.request({
      host:"127.0.0.1",port:tempPort,path:pathName,method,headers
    },res=>{
      let data="";
      res.on("data",c=>data+=c);
      res.on("end",()=>resolve({statusCode:res.statusCode,raw:data}));
    });
    req.on("error",reject);
    if(body!==null) req.write(body);
    req.end();
  });
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

let selfTest=null;
for(let i=0;i<20;i++){
  if(childExited) break;
  try{
    const r=await httpReq({method:"GET",pathName:"/api/lightbox/self-test"});
    if(r.statusCode===200){selfTest=r;break;}
  }catch{}
  await sleep(150);
}
if(!selfTest){
  if(!childExited) child.kill("SIGTERM");
  await sleep(100);
  finish("BLOCKED","M419D4K_TEMP_PROXY_SELF_TEST_FAILED",{
    networkRequestsPerformed:0,
    diagnosticLocalRequestsAttempted:true,
    childExitCode,childSignal,
    logClassification:classifyLog(logs),
    artifacts:{runtimeLog:logPath}
  },3);
}

// Exactly one controlled POST after self-test succeeds.
let post=null, postError=null;
try{
  post=await httpReq({method:"POST",pathName:"/api/lightbox/enrich",body:requestBody});
}catch(e){
  postError=String(e.message);
}

await sleep(250);
const survivedRetry=!childExited;

// Terminate only the temporary proxy.
if(!childExited){
  child.kill("SIGTERM");
  for(let i=0;i<10 && !childExited;i++) await sleep(50);
  if(!childExited) child.kill("SIGKILL");
}
await sleep(100);

const responseArtifact={
  contract:"SCIIP_EXPLORER_4_M4_19D4K_CONTROLLED_SINGLE_POST_RESPONSE",
  version:VERSION,
  executedAt:new Date().toISOString(),
  request:{
    method:"POST",
    path:"/api/lightbox/enrich",
    bodySha:sha(ldoc.body),
    subject:ldoc.body?.subject??null,
    requested:ldoc.body?.requested??null
  },
  response:post?{
    statusCode:post.statusCode,
    bodySha:sha(post.raw),
    raw:post.raw
  }:null,
  error:postError
};
write(responsePath,responseArtifact);

const classification=classifyLog(logs);
const postSucceeded=!!post && post.statusCode>=200 && post.statusCode<300;
const postReturnedHttp=!!post;

let state,next;
if(postSucceeded){
  state="M419D4K_CONTROLLED_SINGLE_POST_RETRY_RETURNED_SUCCESS_RUNTIME_CAPTURE_COMPLETE";
  next="M4.19D4L_LIGHTBOX_CONTROLLED_RETRY_RESPONSE_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION";
}else if(postReturnedHttp){
  state="M419D4K_CONTROLLED_SINGLE_POST_RETRY_RETURNED_HTTP_FAILURE_RUNTIME_CAPTURE_COMPLETE";
  next="M4.19D4L_LIGHTBOX_HTTP_FAILURE_CAUSAL_CLASSIFICATION_AND_RECOVERY_POLICY";
}else{
  state="M419D4K_CONTROLLED_SINGLE_POST_RETRY_REPRODUCED_CONNECTION_FAILURE_RUNTIME_ERROR_CAPTURED";
  next="M4.19D4L_LIGHTBOX_RUNTIME_EXCEPTION_ROOT_CAUSE_AND_PROXY_ERROR_BOUNDARY_REPAIR_POLICY";
}

finish("PASSED",state,{
  runtimeCapture:{
    temporaryProxyStarted:true,
    selfTestStatus:selfTest.statusCode,
    oneControlledPostPerformed:true,
    controlledPostReturnedHttp:postReturnedHttp,
    controlledPostHttpStatus:post?.statusCode??null,
    controlledPostError:postError,
    temporaryProxySurvivedRetry:survivedRetry,
    childExitCode,
    childSignal,
    runtimeLogClassification:classification,
    runtimeLogSha:sha(logs)
  },
  networkRequestsPerformed:1,
  localDiagnosticRequestsPerformed:true,
  artifacts:{
    runtimeLog:logPath,
    controlledPostResponse:responsePath
  },
  nextMilestone:next
},0);
