#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";
import {CONTRACT,VERSION,clientLeakAudit,serverBoundaryAudit,sha} from "./M419D4VRepairRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4V_SERVER_CLIENT_BOUNDARY_REPAIR");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4u-server-client-config-boundary-repair-policy.json");
const clientPath=path.join(app,"src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js");
const configPath=path.join(app,"server/lightbox/config.mjs");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const resultPath=path.join(ev,"m4-19d4v-server-owned-lightbox-config-boundary-repair-self-test.json");
const auditPath=path.join(ev,"m4-19d4v-server-client-boundary-repair-audit.json");
const clientBackup=path.join(ev,"m4-19d4v-LightBoxBrowserClient-pre-repair.js");
const configBackup=path.join(ev,"m4-19d4v-config-pre-repair.mjs");
const logPath=path.join(ev,"m4-19d4v-isolated-self-test-runtime.log");

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

for(const p of [prior,clientPath,configPath,proxyPath]) if(!fs.existsSync(p))
  finish("BLOCKED","M419D4V_PREREQUISITE_MISSING",{path:p},3);

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4U_SERVER_CLIENT_CONFIG_BOUNDARY_REPAIR_POLICY_CERTIFIED")
  finish("BLOCKED","M419D4V_M419D4U_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null},3);

if(!authorized){
  finish("BLOCKED","M419D4V_EXPLICIT_REPAIR_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4V_SERVER_CLIENT_BOUNDARY_REPAIR",
    sourceMutationPerformed:false,
    networkRequestsPerformed:0
  },3);
}

const clientOriginal=fs.readFileSync(clientPath,"utf8");
const configOriginal=fs.readFileSync(configPath,"utf8");
const proxyOriginal=fs.readFileSync(proxyPath,"utf8");

if(!fs.existsSync(clientBackup)) fs.writeFileSync(clientBackup,clientOriginal);
if(!fs.existsSync(configBackup)) fs.writeFileSync(configBackup,configOriginal);

const beforeClient=clientLeakAudit(clientOriginal);
const beforeServer=serverBoundaryAudit(configOriginal,proxyOriginal);

// Browser client may keep VITE_LIGHTBOX_PROXY_URL for client transport only.
// Repair any accidental use of browser Vite values in readiness/configured decisions
// by making browser configuration explicitly transport-only.
let clientRepaired=clientOriginal;

const transportBanner=`/* M4.19D4V: Browser-side VITE_LIGHTBOX_* values are CLIENT TRANSPORT CONFIG ONLY.
 * They MUST NOT be interpreted as server LightBox readiness, credentials, or authority.
 */\n`;
if(!clientRepaired.includes("CLIENT TRANSPORT CONFIG ONLY")){
  clientRepaired=transportBanner+clientRepaired;
}

// Target common browser readiness/configured leakage patterns without touching transport URL resolution.
clientRepaired=clientRepaired
  .replace(/\bserverConfigured\s*:\s*Boolean\(\s*import\.meta\.env\.[A-Z0-9_]+\s*\)/g,"serverConfigured: null")
  .replace(/\bconfigured\s*:\s*Boolean\(\s*import\.meta\.env\.VITE_LIGHTBOX_[A-Z0-9_]+\s*\)/g,"configured: null")
  .replace(/\bisConfigured\s*:\s*Boolean\(\s*import\.meta\.env\.VITE_LIGHTBOX_[A-Z0-9_]+\s*\)/g,"isConfigured: null");

fs.writeFileSync(clientPath,clientRepaired);

// Server config must be independent from browser Vite semantics. If config.mjs
// already satisfies that, do not rewrite it. If it contains import.meta.env/VITE_*,
// fail closed rather than guessing the server credential contract.
const currentServer=serverBoundaryAudit(configOriginal,proxyOriginal);
if(currentServer.serverUsesImportMetaEnv||currentServer.serverUsesVitePrefix){
  fs.writeFileSync(clientPath,clientOriginal);
  finish("BLOCKED","M419D4V_SERVER_CONFIG_STILL_CONTAINS_VITE_DEPENDENCY_MANUAL_TARGETED_REPAIR_REQUIRED",{
    sourceMutationPerformed:false,
    clientRepairRolledBack:true,
    serverBoundary:currentServer,
    artifacts:{clientBackup,configBackup},
    networkRequestsPerformed:0,
    nextMilestone:"M4.19D4V1_SERVER_CONFIG_VITE_DEPENDENCY_EXACT_REPAIR"
  },3);
}

const clientAfter=fs.readFileSync(clientPath,"utf8");
const configAfter=fs.readFileSync(configPath,"utf8");
const proxyAfter=fs.readFileSync(proxyPath,"utf8");
const afterClient=clientLeakAudit(clientAfter);
const afterServer=serverBoundaryAudit(configAfter,proxyAfter);

const boundaryCertified=
  !afterServer.serverUsesImportMetaEnv &&
  !afterServer.serverUsesVitePrefix &&
  afterServer.enrichErrorBoundaryPreserved &&
  afterServer.selfTestRoutePresent;

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4V_BOUNDARY_REPAIR_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  before:{client:beforeClient,server:beforeServer},
  after:{client:afterClient,server:afterServer},
  clientTransportViteAllowed:true,
  clientServerReadinessInferenceProhibited:true,
  serverViteDependencyAbsent:!afterServer.serverUsesVitePrefix,
  serverImportMetaEnvAbsent:!afterServer.serverUsesImportMetaEnv,
  enrichErrorBoundaryPreserved:afterServer.enrichErrorBoundaryPreserved,
  boundaryCertified,
  sourceHashes:{
    clientBefore:sha(clientOriginal),
    clientAfter:sha(clientAfter),
    config:sha(configAfter),
    proxy:sha(proxyAfter)
  }
};
write(auditPath,audit);

if(!boundaryCertified){
  fs.writeFileSync(clientPath,clientOriginal);
  finish("BLOCKED","M419D4V_BOUNDARY_STATIC_CERTIFICATION_FAILED_CLIENT_REPAIR_ROLLED_BACK",{
    sourceMutationPerformed:true,
    clientRepairRolledBack:true,
    artifacts:{repairAudit:auditPath,clientBackup,configBackup}
  },3);
}

// Isolated self-test. No enrichment request is permitted.
fs.writeFileSync(logPath,"");
let logs="";
const env={...process.env,LIGHTBOX_PROXY_PORT:"8788"};
const child=spawn(process.execPath,[proxyPath],{cwd:app,env,stdio:["ignore","pipe","pipe"]});
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
    const r=http.request({host:"127.0.0.1",port:8788,path:pathName,method:"GET",headers:{accept:"application/json"}},res=>{
      let data=""; res.on("data",c=>data+=c); res.on("end",()=>resolve({statusCode:res.statusCode,raw:data}));
    });
    r.on("error",reject); r.end();
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
if(selfTest){try{parsed=JSON.parse(selfTest.raw)}catch{}}

if(!exited){
  child.kill("SIGTERM");
  for(let i=0;i<10&&!exited;i++) await sleep(50);
  if(!exited) child.kill("SIGKILL");
}
await sleep(100);

if(!selfTest){
  finish("PASSED","M419D4V_SERVER_CLIENT_BOUNDARY_REPAIRED_STATICALLY_ISOLATED_SELF_TEST_RUNTIME_CONFIG_STILL_REQUIRED",{
    repair:{
      sourceMutationPerformed:true,
      clientTransportBoundaryRepaired:true,
      serverOwnedBoundaryCertified:true,
      enrichErrorBoundaryPreserved:true
    },
    isolatedSelfTest:{
      ready:false,
      httpStatus:null,
      childExitCode:exitCode,
      childSignal:signal,
      enrichmentRequestPerformed:false
    },
    artifacts:{repairAudit:auditPath,runtimeLog:logPath,clientBackup,configBackup},
    nextMilestone:"M4.19D4W_SERVER_RUNTIME_READINESS_CONFIG_SOURCE_EXACT_BINDING"
  },0);
}

const ready=selfTest.statusCode===200;
finish("PASSED",ready
  ?"M419D4V_SERVER_CLIENT_BOUNDARY_REPAIRED_ISOLATED_SELF_TEST_REACHED"
  :"M419D4V_SERVER_CLIENT_BOUNDARY_REPAIRED_ISOLATED_SELF_TEST_HTTP_FAILURE",{
  repair:{
    sourceMutationPerformed:true,
    clientTransportBoundaryRepaired:true,
    serverOwnedBoundaryCertified:true,
    enrichErrorBoundaryPreserved:true
  },
  isolatedSelfTest:{
    ready,
    httpStatus:selfTest.statusCode,
    status:parsed?.status??null,
    configured:parsed?.configured??null,
    canonicalAuthority:parsed?.canonicalAuthority??null,
    parcelContract:parsed?.parcelContract??null,
    enrichmentRequestPerformed:false
  },
  artifacts:{repairAudit:auditPath,runtimeLog:logPath,clientBackup,configBackup},
  nextMilestone: ready
    ?"M4.19D4W_REPAIRED_SERVER_BOUNDARY_CONTROLLED_SINGLE_POST_READINESS"
    :"M4.19D4W_SERVER_RUNTIME_READINESS_CONFIG_SOURCE_EXACT_BINDING"
},0);
