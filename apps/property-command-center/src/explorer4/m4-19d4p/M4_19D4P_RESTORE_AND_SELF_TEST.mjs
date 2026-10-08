#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn,execFileSync} from "node:child_process";
import {
  CONTRACT,VERSION,envNamesFromSource,parseEnvFile,safeAudit,sha
} from "./M419D4PConfigRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorized=process.argv.includes("AUTHORIZE_M419D4P_RUNTIME_CONFIGURATION_RESTORE_SELF_TEST");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4o-lightbox-enrich-error-boundary-repair-validation.json");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
const configPath=path.join(app,"server/lightbox/config.mjs");
const resultPath=path.join(ev,"m4-19d4p-repaired-proxy-runtime-configuration-restore-self-test.json");
const auditPath=path.join(ev,"m4-19d4p-runtime-configuration-source-audit.json");
const logPath=path.join(ev,"m4-19d4p-repaired-proxy-self-test-runtime.log");

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
      canonicalMutationPerformed:false,temporalMutationPerformed:false,identityMutationPerformed:false,
      operationalIngestionPerformed:false,secretValuesExposed:false,automaticRetry:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [prior,proxyPath,configPath]) if(!fs.existsSync(p))
  finish("BLOCKED","M419D4P_PREREQUISITE_MISSING",{path:p},3);

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4O_ERROR_BOUNDARY_REPAIR_APPLIED_STATICALLY_ISOLATED_RUNTIME_CONFIGURATION_REQUIRED")
  finish("BLOCKED","M419D4P_M419D4O_RUNTIME_CONFIGURATION_REQUIRED_STATE_EXPECTED",{observed:pdoc?.state??null},3);

if(!authorized){
  finish("BLOCKED","M419D4P_EXPLICIT_RUNTIME_CONFIGURATION_RESTORE_SELF_TEST_AUTHORIZATION_REQUIRED",{
    authorizationArgument:"AUTHORIZE_M419D4P_RUNTIME_CONFIGURATION_RESTORE_SELF_TEST",
    networkRequestsPerformed:0
  },3);
}

const configText=fs.readFileSync(configPath,"utf8");
const proxyText=fs.readFileSync(proxyPath,"utf8");
const requiredNames=[...new Set([
  ...envNamesFromSource(configText),
  ...envNamesFromSource(proxyText)
])].sort();

// Ignore ordinary optional runtime controls when evaluating credential completeness.
const serverNames=requiredNames.filter(n=>/LIGHTBOX/i.test(n));
const likelyCredentialNames=serverNames.filter(n=>/API_KEY|CLIENT_ID|CLIENT_SECRET|TOKEN|AUTH/i.test(n));
const likelyEndpointNames=serverNames.filter(n=>/BASE_URL|URL|PORT|TIMEOUT|ORIGIN/i.test(n));

const candidateFiles=[
  path.join(app,".env.local"),
  path.join(app,".env"),
  path.join(app,".env.server"),
  path.join(app,".env.lightbox"),
  path.join(app,"server/lightbox/.env"),
  path.join(app,"server/lightbox/.env.local"),
  path.join(repo,".env"),
  path.join(repo,".env.local"),
  path.join(repo,".env.lightbox")
].filter(fs.existsSync);

const merged={...process.env};
const sourceByName={};
for(const p of candidateFiles){
  const vals=parseEnvFile(fs.readFileSync(p,"utf8"));
  for(const [k,v] of Object.entries(vals)){
    if((merged[k]===undefined || merged[k]==="") && v!==""){
      merged[k]=v;
      sourceByName[k]=path.relative(repo,p);
    }
  }
}

// On macOS, launchctl can hold process environment set outside .env files.
// Query only names already required by the source contract.
const launchctlConfigured=[];
if(process.platform==="darwin"){
  for(const name of serverNames){
    if(merged[name]) continue;
    try{
      const v=execFileSync("launchctl",["getenv",name],{encoding:"utf8"}).trim();
      if(v){
        merged[name]=v;
        sourceByName[name]="launchctl";
        launchctlConfigured.push(name);
      }
    }catch{}
  }
}

merged.LIGHTBOX_PROXY_PORT="8788";
sourceByName.LIGHTBOX_PROXY_PORT=sourceByName.LIGHTBOX_PROXY_PORT||"M4.19D4P isolated validation override";

const audits=safeAudit(merged,serverNames);
const missingCredentialNames=likelyCredentialNames.filter(n=>!merged[n]);
const configuredCredentialNames=likelyCredentialNames.filter(n=>!!merged[n]);
const configuredEndpointNames=likelyEndpointNames.filter(n=>!!merged[n]);

const sourceAudit={
  contract:"SCIIP_EXPLORER_4_M4_19D4P_RUNTIME_CONFIGURATION_SOURCE_AUDIT",
  version:VERSION,generatedAt:new Date().toISOString(),
  requiredServerEnvironmentVariableNames:serverNames,
  likelyCredentialVariableNames:likelyCredentialNames,
  likelyEndpointVariableNames:likelyEndpointNames,
  candidateConfigurationFiles:candidateFiles.map(p=>path.relative(repo,p)),
  configuredVariableAudit:audits,
  configuredCredentialVariableNames:configuredCredentialNames,
  missingCredentialVariableNames:missingCredentialNames,
  configuredEndpointVariableNames:configuredEndpointNames,
  sourceByVariableName:Object.fromEntries(Object.entries(sourceByName).filter(([k])=>serverNames.includes(k))),
  launchctlConfiguredVariableNames:launchctlConfigured,
  valuesPersisted:false,
  valuesExposed:false
};
write(auditPath,sourceAudit);

// config.mjs may allow API key OR OAuth client pair. Determine a satisfiable auth mode
// from names found in the real source rather than requiring every possible credential variable.
const hasApiKey = serverNames.includes("LIGHTBOX_API_KEY") && !!merged.LIGHTBOX_API_KEY;
const oauthNames=["LIGHTBOX_CLIENT_ID","LIGHTBOX_CLIENT_SECRET"].filter(n=>serverNames.includes(n));
const hasOauth = oauthNames.length===2 && oauthNames.every(n=>!!merged[n]);
const anyAuthModeDeclared=serverNames.some(n=>/API_KEY|CLIENT_ID|CLIENT_SECRET/.test(n));
const authSatisfied=!anyAuthModeDeclared || hasApiKey || hasOauth;

if(!authSatisfied){
  finish("BLOCKED","M419D4P_SERVER_SIDE_LIGHTBOX_CREDENTIAL_SOURCE_NOT_FOUND",{
    configurationRecovery:{
      serverEnvironmentVariableNames:serverNames,
      configuredCredentialVariableNames:configuredCredentialNames,
      missingCredentialVariableNames:missingCredentialNames,
      apiKeyModeAvailable:serverNames.includes("LIGHTBOX_API_KEY"),
      oauthModeAvailable:oauthNames.length===2,
      configurationValuesExposed:false
    },
    artifacts:{configurationSourceAudit:auditPath},
    networkRequestsPerformed:0,
    nextMilestone:"M4.19D4Q_LIGHTBOX_SERVER_CREDENTIAL_SOURCE_BINDING_OR_OPERATOR_CONFIGURATION_GATE"
  },3);
}

fs.writeFileSync(logPath,"");
let logs="";
const child=spawn(process.execPath,[proxyPath],{cwd:app,env:merged,stdio:["ignore","pipe","pipe"]});
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
    r.on("error",reject);r.end();
  });
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

let selfTest=null;
for(let i=0;i<35;i++){
  if(exited) break;
  try{
    const r=await get("/api/lightbox/self-test");
    if(r.statusCode===200){selfTest=r;break;}
  }catch{}
  await sleep(150);
}
let parsed=null;
if(selfTest){try{parsed=JSON.parse(selfTest.raw)}catch{}}

const ready=!!(selfTest?.statusCode===200 && parsed?.status==="READY" && parsed?.configured===true);

if(!exited){
  child.kill("SIGTERM");
  for(let i=0;i<10 && !exited;i++) await sleep(50);
  if(!exited) child.kill("SIGKILL");
}
await sleep(100);

if(!ready){
  finish("BLOCKED","M419D4P_RUNTIME_CONFIGURATION_RECOVERED_BUT_REPAIRED_PROXY_SELF_TEST_NOT_READY",{
    configurationRecovery:{
      authSatisfied,
      apiKeyModeUsed:hasApiKey,
      oauthModeUsed:hasOauth,
      configurationValuesExposed:false
    },
    selfTest:{
      httpStatus:selfTest?.statusCode??null,
      status:parsed?.status??null,
      configured:parsed?.configured??null,
      childExitCode:exitCode,
      childSignal:signal
    },
    runtimeLogSha:sha(logs),
    artifacts:{configurationSourceAudit:auditPath,runtimeLog:logPath},
    nextMilestone:"M4.19D4Q_LIGHTBOX_REPAIRED_PROXY_STARTUP_FAILURE_FORENSICS"
  },3);
}

finish("PASSED","M419D4P_REPAIRED_LIGHTBOX_PROXY_RUNTIME_CONFIGURATION_RESTORED_SELF_TEST_CERTIFIED",{
  configurationRecovery:{
    authSatisfied:true,
    apiKeyModeUsed:hasApiKey,
    oauthModeUsed:hasOauth,
    configuredServerVariableNames:serverNames.filter(n=>!!merged[n]),
    configurationValuesExposed:false
  },
  selfTest:{
    httpStatus:selfTest.statusCode,
    status:parsed.status,
    configured:parsed.configured,
    canonicalAuthority:parsed.canonicalAuthority??null,
    parcelContract:parsed.parcelContract??null
  },
  isolatedProxy:{
    port:8788,
    repairedSourceUsed:true,
    selfTestCertified:true,
    terminatedAfterCertification:true
  },
  runtimeLogSha:sha(logs),
  artifacts:{configurationSourceAudit:auditPath,runtimeLog:logPath},
  networkRequestsPerformed:0,
  localDiagnosticRequestsPerformed:true,
  nextMilestone:"M4.19D4Q_REPAIRED_PROXY_CONTROLLED_SINGLE_POST_RUNTIME_CAPTURE"
},0);
