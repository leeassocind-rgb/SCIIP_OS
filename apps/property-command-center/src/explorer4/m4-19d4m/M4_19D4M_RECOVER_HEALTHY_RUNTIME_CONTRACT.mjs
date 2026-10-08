#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {CONTRACT,VERSION,parseEnvNames,sha} from "./M419D4MRuntimeEnv.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4l-isolated-proxy-environment-hydration-self-test-certification.json");
const resultPath=path.join(ev,"m4-19d4m-healthy-8787-runtime-environment-contract-recovery.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const fail=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

if(!fs.existsSync(prior)) fail("M419D4M_PREREQUISITE_MISSING",{path:prior});
const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(priorDoc?.state!=="M419D4L_ENV_HYDRATED_TEMP_PROXY_SELF_TEST_NOT_READY")
  fail("M419D4M_M419D4L_BLOCKED_STATE_REQUIRED",{observed:priorDoc?.state??null});

let lsof;
try{
  lsof=execFileSync("lsof",["-nP","-iTCP:8787","-sTCP:LISTEN"],{encoding:"utf8"});
}catch(e){
  fail("M419D4M_HEALTHY_8787_LISTENER_NOT_FOUND",{error:"lsof failed or no listener"});
}
const lines=lsof.trim().split(/\r?\n/);
if(lines.length<2) fail("M419D4M_HEALTHY_8787_LISTENER_NOT_FOUND",{lsofHeader:lines[0]||null});

const cols=lines[1].trim().split(/\s+/);
const pid=Number(cols[1]);
if(!Number.isInteger(pid)||pid<=0) fail("M419D4M_8787_LISTENER_PID_NOT_PARSED",{line:lines[1]});

let args="", envText="", cwd="", exe="";
try{ args=execFileSync("ps",["-p",String(pid),"-o","command="],{encoding:"utf8"}).trim(); }catch{}
try{ envText=execFileSync("ps",["eww","-p",String(pid),"-o","command="],{encoding:"utf8"}).trim(); }catch{}
try{ cwd=execFileSync("lsof",["-a","-p",String(pid),"-d","cwd","-Fn"],{encoding:"utf8"}).split(/\r?\n/).find(x=>x.startsWith("n"))?.slice(1)||""; }catch{}
try{ exe=execFileSync("lsof",["-a","-p",String(pid),"-d","txt","-Fn"],{encoding:"utf8"}).split(/\r?\n/).find(x=>x.startsWith("n"))?.slice(1)||""; }catch{}

const envNames=parseEnvNames(envText);
const lightboxNames=envNames.filter(n=>/LIGHTBOX|SCIIP|GOOGLE|MAP|API|CLIENT|SECRET|TOKEN|KEY|URL|PORT|TIMEOUT/i.test(n));
const requiredServerNames=lightboxNames.filter(n=>/LIGHTBOX/i.test(n) && !/^VITE_/.test(n));

const envLocalPath=path.join(app,".env.local");
let envLocalNames=[];
if(fs.existsSync(envLocalPath)){
  for(const line of fs.readFileSync(envLocalPath,"utf8").split(/\r?\n/)){
    const m=line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if(m) envLocalNames.push(m[1]);
  }
}
envLocalNames=[...new Set(envLocalNames)].sort();

const missingFromEnvLocal=requiredServerNames.filter(n=>!envLocalNames.includes(n));
const runtimeContractRecovered=requiredServerNames.length>0;

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:runtimeContractRecovered
    ?"M419D4M_HEALTHY_8787_SERVER_RUNTIME_ENVIRONMENT_CONTRACT_RECOVERED"
    :"M419D4M_HEALTHY_8787_PROCESS_FOUND_SERVER_ENVIRONMENT_CONTRACT_NOT_RECOVERED",
  certifiedAt:new Date().toISOString(),
  healthyProxy:{
    pid,
    commandFingerprint:sha(args).slice(0,16),
    workingDirectory:cwd||null,
    executable:exe||null,
    listenerPort:8787,
    listenerConfirmed:true
  },
  environmentContract:{
    allEnvironmentVariableNames:envNames,
    lightBoxRelevantEnvironmentVariableNames:lightboxNames,
    requiredServerLightBoxVariableNames:requiredServerNames,
    envLocalVariableNames:envLocalNames,
    requiredServerVariablesMissingFromEnvLocal:missingFromEnvLocal,
    runtimeContractRecovered,
    environmentValuesCaptured:false,
    environmentValuesPersisted:false,
    secretValuesExposed:false
  },
  interpretation:{
    envLocalInsufficientForHealthyProxyReproduction:missingFromEnvLocal.length>0,
    healthy8787ContainsAdditionalServerRuntimeConfiguration:missingFromEnvLocal.length>0
  },
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    processMutationPerformed:false,
    existing8787ProxyTouched:false,
    secretValuesExposed:false
  },
  nextMilestone:runtimeContractRecovered
    ?"M4.19D4N_HEALTHY_RUNTIME_ENVIRONMENT_REPRODUCTION_WITH_VALUE_PRESERVING_PROCESS_INHERITANCE"
    :"M4.19D4N_PROXY_LAUNCH_ORIGIN_AND_SECRET_PROVIDER_FORENSICS"
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
