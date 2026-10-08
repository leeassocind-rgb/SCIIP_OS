#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";
import {CONTRACT,VERSION,parseEnvFile,fingerprint} from "./M419D4ACEnvRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4AC_ISOLATED_PROXY_SELF_TEST");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4ab-server-config-precedence-effective-runtime-binding.json");
const proxy=path.join(app,"server/lightbox/proxy-server.mjs");
const envPath=path.join(app,".env.local");
const resultPath=path.join(ev,"m4-19d4ac-isolated-proxy-environment-binding-self-test.json");
const logPath=path.join(ev,"m4-19d4ac-isolated-proxy-runtime.log");
const auditPath=path.join(ev,"m4-19d4ac-isolated-proxy-environment-binding-audit.json");

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

for(const p of [prior,proxy]) if(!fs.existsSync(p))
  finish("BLOCKED","M419D4AC_PREREQUISITE_MISSING",{path:p},3);

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4AB_SERVER_CONFIG_PRECEDENCE_AND_EFFECTIVE_RUNTIME_BINDING_CERTIFIED")
  finish("BLOCKED","M419D4AC_M419D4AB_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null},3);
if(pdoc?.binding?.precedenceComplete!==true)
  finish("BLOCKED","M419D4AC_PRECEDENCE_COMPLETE_REQUIRED",{},3);

if(!authorized){
  finish("BLOCKED","M419D4AC_EXPLICIT_ISOLATED_SELF_TEST_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4AC_ISOLATED_PROXY_SELF_TEST",
    processMutationPerformed:false,
    networkRequestsPerformed:0
  },3);
}

const required=["LIGHTBOX_API_KEY"];
const optional=[
  "LIGHTBOX_BASE_URL",
  "LIGHTBOX_PROXY_PORT",
  "LIGHTBOX_TIMEOUT_MS",
  "LIGHTBOX_ALLOWED_ORIGINS"
];

const fileEnv=fs.existsSync(envPath)?parseEnvFile(fs.readFileSync(envPath,"utf8")):{};
const sources={};
const bound={};
for(const k of [...required,...optional]){
  if(process.env[k]!==undefined && String(process.env[k]).length){
    bound[k]=String(process.env[k]); sources[k]="CURRENT_PROCESS_ENV";
  }else if(fileEnv[k]!==undefined && String(fileEnv[k]).length){
    bound[k]=String(fileEnv[k]); sources[k]="APP_ENV_LOCAL";
  }
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AC_ENVIRONMENT_BINDING_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  requiredNames:required,
  optionalNames:optional,
  configuredNames:Object.keys(bound),
  missingRequiredNames:required.filter(k=>!bound[k]),
  sourceByName:sources,
  fingerprints:Object.fromEntries(Object.entries(bound).map(([k,v])=>[k,fingerprint(v)])),
  valuesExposed:false,
  valuesPersisted:false
};
write(auditPath,audit);

if(audit.missingRequiredNames.length){
  finish("BLOCKED","M419D4AC_REQUIRED_SERVER_RUNTIME_CREDENTIAL_NOT_BOUND",{
    environmentBinding:{
      requiredNames:required,
      configuredNames:audit.configuredNames,
      missingRequiredNames:audit.missingRequiredNames,
      sourceByName:sources
    },
    networkRequestsPerformed:0,
    processMutationPerformed:false,
    artifacts:{environmentBindingAudit:auditPath},
    nextMilestone:"M4.19D4AD_LIGHTBOX_API_KEY_APPROVED_LOCAL_SOURCE_BINDING_GATE"
  },3);
}

const childEnv={...process.env,...bound,LIGHTBOX_PROXY_PORT:"8788"};
fs.writeFileSync(logPath,"");
let logs="";
const child=spawn(process.execPath,[proxy],{
  cwd:app,
  env:childEnv,
  stdio:["ignore","pipe","pipe"]
});
let exited=false,exitCode=null,signal=null;
child.on("exit",(c,s)=>{exited=true;exitCode=c;signal=s;});
const cap=(stream,c)=>{
  const t=`${new Date().toISOString()} ${stream} ${c.toString()}`;
  logs+=t; fs.appendFileSync(logPath,t);
};
child.stdout.on("data",c=>cap("STDOUT",c));
child.stderr.on("data",c=>cap("STDERR",c));

function get(pathName){
  return new Promise((resolve,reject)=>{
    const r=http.request({
      host:"127.0.0.1",port:8788,path:pathName,method:"GET",
      headers:{accept:"application/json"}
    },res=>{
      let data=""; res.on("data",c=>data+=c); res.on("end",()=>resolve({statusCode:res.statusCode,raw:data}));
    });
    r.on("error",reject); r.end();
  });
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

let selfTest=null;
for(let i=0;i<40;i++){
  if(exited) break;
  try{
    const r=await get("/api/lightbox/self-test");
    if(r.statusCode){selfTest=r;break;}
  }catch{}
  await sleep(150);
}

let parsed=null;
if(selfTest){try{parsed=JSON.parse(selfTest.raw)}catch{}}

if(!exited){
  child.kill("SIGTERM");
  for(let i=0;i<10&&!exited;i++) await sleep(50);
  if(!exited) child.kill("SIGKILL");
}
await sleep(100);

if(!selfTest){
  finish("BLOCKED","M419D4AC_ISOLATED_PROXY_SELF_TEST_NOT_REACHED",{
    environmentBinding:{
      requiredNames:required,
      configuredNames:audit.configuredNames,
      sourceByName:sources
    },
    selfTest:{
      attempted:true,httpStatus:null,status:null,configured:null,
      childExitCode:exitCode,childSignal:signal
    },
    localDiagnosticRequestsPerformed:true,
    externalNetworkRequestsPerformed:0,
    artifacts:{environmentBindingAudit:auditPath,runtimeLog:logPath},
    nextMilestone:"M4.19D4AD_ISOLATED_PROXY_STARTUP_RUNTIME_FORENSICS"
  },3);
}

const ready=selfTest.statusCode===200 && parsed?.status==="READY" && parsed?.configured===true;
finish(ready?"PASSED":"BLOCKED",ready
  ?"M419D4AC_ISOLATED_REPAIRED_PROXY_ENVIRONMENT_BOUND_SELF_TEST_READY"
  :"M419D4AC_ISOLATED_PROXY_SELF_TEST_RESPONDED_NOT_READY",{
  environmentBinding:{
    requiredNames:required,
    configuredNames:audit.configuredNames,
    sourceByName:sources,
    apiKeyBound:true
  },
  selfTest:{
    attempted:true,
    httpStatus:selfTest.statusCode,
    status:parsed?.status??null,
    configured:parsed?.configured??null,
    canonicalAuthority:parsed?.canonicalAuthority??null,
    parcelContract:parsed?.parcelContract??null
  },
  localDiagnosticRequestsPerformed:true,
  externalNetworkRequestsPerformed:0,
  artifacts:{environmentBindingAudit:auditPath,runtimeLog:logPath},
  nextMilestone:ready
    ?"M4.19D4AD_CONTROLLED_SINGLE_RECORD_ENRICH_READ_PREAUTHORIZATION"
    :"M4.19D4AD_ISOLATED_PROXY_SELF_TEST_NOT_READY_FORENSICS"
},ready?0:3);
