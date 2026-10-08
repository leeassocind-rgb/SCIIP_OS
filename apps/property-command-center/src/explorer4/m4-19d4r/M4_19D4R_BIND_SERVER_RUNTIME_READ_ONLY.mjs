#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  CONTRACT,VERSION,collectConfigKeys,classifyConfigKeys,parseEnvFile,sha
} from "./M419D4RBindingRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4q-repaired-proxy-startup-failure-forensics.json");
const configPath=path.join(app,"server/lightbox/config.mjs");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const resultPath=path.join(ev,"m4-19d4r-lightbox-server-runtime-variable-binding-gate.json");
const planPath=path.join(ev,"m4-19d4r-lightbox-server-runtime-binding-plan.json");

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
      networkRequestsPerformed:0,
      enrichmentRequestsPerformed:0,
      processMutationPerformed:false,
      sourceMutationPerformed:false,
      canonicalMutationPerformed:false,
      temporalMutationPerformed:false,
      identityMutationPerformed:false,
      operationalIngestionPerformed:false,
      secretValuesExposed:false
    }
  };
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(code);
};

for(const p of [prior,configPath,proxyPath]) if(!fs.existsSync(p))
  finish("BLOCKED","M419D4R_PREREQUISITE_MISSING",{path:p},3);

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4Q_REPAIRED_PROXY_STARTUP_FAILURE_FORENSICS_CERTIFIED")
  finish("BLOCKED","M419D4R_M419D4Q_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null},3);
if(pdoc?.forensics?.classification!=="SERVER_CONFIGURATION_REJECTED_AT_STARTUP")
  finish("BLOCKED","M419D4R_SERVER_CONFIGURATION_REJECTED_CLASSIFICATION_REQUIRED",{observed:pdoc?.forensics?.classification??null},3);

const cfg=fs.readFileSync(configPath,"utf8");
const proxy=fs.readFileSync(proxyPath,"utf8");

// Follow local imports from config/proxy to recover indirection-layer config keys.
const importRe=/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g;
const queue=[configPath,proxyPath];
const visited=new Set();
const files=[];
while(queue.length){
  const p=queue.shift();
  if(visited.has(p)||!fs.existsSync(p)) continue;
  visited.add(p);
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  files.push({path:p,text});
  for(const m of text.matchAll(importRe)){
    const spec=m[1];
    if(!spec.startsWith(".")) continue;
    let target=path.resolve(path.dirname(p),spec);
    const candidates=[target,target+".mjs",target+".js",target+".cjs",path.join(target,"index.mjs"),path.join(target,"index.js")];
    const hit=candidates.find(fs.existsSync);
    if(hit && hit.startsWith(app)) queue.push(hit);
  }
}

const keySources=new Map();
for(const f of files){
  for(const k of collectConfigKeys(f.text)){
    if(!keySources.has(k)) keySources.set(k,[]);
    keySources.get(k).push(path.relative(repo,f.path));
  }
}
const keys=[...keySources.keys()].sort();
const cls=classifyConfigKeys(keys);

// Infer readiness semantics from config source.
const readinessSnippets=[];
for(const f of files){
  const lines=f.text.split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    if(/configured|readiness|credential|api[_ ]?key|client[_ ]?id|client[_ ]?secret|base[_ ]?url/i.test(lines[i])){
      readinessSnippets.push({
        file:path.relative(repo,f.path),
        line:i+1,
        snippet:lines.slice(Math.max(0,i-2),Math.min(lines.length,i+3)).join(" ").trim().slice(0,900)
      });
    }
  }
}

// Approved local sources only. Values used in-memory, never persisted.
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
    if((merged[k]===undefined||merged[k]==="")&&v!==""){
      merged[k]=v; sourceByName[k]=path.relative(repo,p);
    }
  }
}

const configured=keys.filter(k=>!!merged[k]);
const missing=keys.filter(k=>!merged[k]);

const authKeys=cls.auth;
const hasApiKey=authKeys.includes("LIGHTBOX_API_KEY") && !!merged.LIGHTBOX_API_KEY;
const oauthDeclared=authKeys.includes("LIGHTBOX_CLIENT_ID") && authKeys.includes("LIGHTBOX_CLIENT_SECRET");
const hasOauth=oauthDeclared && !!merged.LIGHTBOX_CLIENT_ID && !!merged.LIGHTBOX_CLIENT_SECRET;
const baseUrlDeclared=keys.includes("LIGHTBOX_BASE_URL");
const hasBaseUrl=!baseUrlDeclared || !!merged.LIGHTBOX_BASE_URL;

// Evaluate likely startup contract from the source-native key set.
const authModeSatisfied = authKeys.length===0 ? false : (hasApiKey||hasOauth);
const bindingReady=authModeSatisfied && hasBaseUrl;

const plan={
  contract:"SCIIP_EXPLORER_4_M4_19D4R_LIGHTBOX_SERVER_RUNTIME_BINDING_PLAN",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  discovery:{
    filesInspected:files.map(f=>path.relative(repo,f.path)),
    recoveredLightBoxKeys:keys,
    keySources:Object.fromEntries([...keySources.entries()]),
    readinessSnippets,
    authKeys,
    endpointKeys:cls.endpoint,
    runtimeKeys:cls.runtime
  },
  currentBinding:{
    configuredVariableNames:configured,
    missingVariableNames:missing,
    sourceByVariableName:Object.fromEntries(Object.entries(sourceByName).filter(([k])=>keys.includes(k))),
    apiKeyModeSatisfied:hasApiKey,
    oauthModeDeclared:oauthDeclared,
    oauthModeSatisfied:hasOauth,
    baseUrlSatisfied:hasBaseUrl,
    bindingReady,
    valuesPersisted:false,
    valuesExposed:false
  },
  nextAction:bindingReady
    ? "RUNTIME_BINDING_READY_FOR_ISOLATED_REPAIRED_PROXY_SELF_TEST"
    : "OPERATOR_OR_SECRET_PROVIDER_BINDING_REQUIRED_FOR_MISSING_SERVER_RUNTIME_VALUES"
};
write(planPath,plan);

let state,next;
if(keys.length===0){
  state="M419D4R_LIGHTBOX_RUNTIME_INDIRECTION_KEYS_NOT_RECOVERED";
  next="M4.19D4S_LIGHTBOX_CONFIG_ACCESSOR_IMPLEMENTATION_FORENSICS";
}else if(bindingReady){
  state="M419D4R_LIGHTBOX_SERVER_RUNTIME_VARIABLE_BINDING_CERTIFIED_SELF_TEST_READY";
  next="M4.19D4S_REPAIRED_PROXY_BOUND_RUNTIME_SELF_TEST";
}else{
  state="M419D4R_LIGHTBOX_SERVER_RUNTIME_BINDING_INCOMPLETE_OPERATOR_OR_SECRET_PROVIDER_REQUIRED";
  next="M4.19D4S_LIGHTBOX_OPERATOR_OR_SECRET_PROVIDER_BINDING_GATE";
}

finish("PASSED",state,{
  bindingGate:{
    filesInspected:files.length,
    recoveredLightBoxVariableNames:keys,
    configuredVariableNames:configured,
    missingVariableNames:missing,
    apiKeyModeSatisfied:hasApiKey,
    oauthModeDeclared:oauthDeclared,
    oauthModeSatisfied:hasOauth,
    baseUrlSatisfied:hasBaseUrl,
    bindingReady,
    secretValuesExposed:false
  },
  interpretation:{
    priorEmptyRequiredVariableInventoryCorrected:keys.length>0,
    configurationIndirectionRecovered:keys.length>0
  },
  artifacts:{runtimeBindingPlan:planPath},
  nextMilestone:next
},0);
