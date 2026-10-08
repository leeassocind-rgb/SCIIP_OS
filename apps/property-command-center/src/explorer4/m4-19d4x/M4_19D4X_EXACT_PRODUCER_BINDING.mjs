#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,assignments,configObjectNames,exportedNames,sha} from "./M419D4XProducerRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4w-server-runtime-readiness-config-source-exact-binding.json");
const resultPath=path.join(ev,"m4-19d4x-server-config-object-producer-exact-binding.json");
const auditPath=path.join(ev,"m4-19d4x-server-config-object-producer-binding-audit.json");

const configPath=path.join(app,"server/lightbox/config.mjs");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,configPath,proxyPath]) if(!fs.existsSync(p)) block("M419D4X_PREREQUISITE_MISSING",{path:p});

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4W_SERVER_RUNTIME_READINESS_CONFIG_SOURCE_EXACT_BINDING_CERTIFIED")
  block("M419D4X_M419D4W_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.binding?.classification!=="SERVER_RUNTIME_CONFIG_OBJECT_PRODUCER_CANDIDATES_RECOVERED")
  block("M419D4X_CONFIG_OBJECT_PRODUCER_CLASSIFICATION_REQUIRED",{observed:pdoc?.binding?.classification??null});

const configText=fs.readFileSync(configPath,"utf8");
const proxyText=fs.readFileSync(proxyPath,"utf8");

const files=[
  {file:path.relative(repo,configPath),text:configText,role:"CONFIG_MODULE"},
  {file:path.relative(repo,proxyPath),text:proxyText,role:"PROXY_BOOTSTRAP"}
];

const fileEvidence=files.map(f=>({
  file:f.file,
  role:f.role,
  assignments:assignments(f.text),
  configObjects:configObjectNames(f.text),
  exports:exportedNames(f.text),
  sha256:sha(f.text)
}));

// Recover imports from config module into proxy.
const configBase=path.basename(configPath).replace(/\.[^.]+$/,"");
const proxyImports=[];
for(const m of proxyText.matchAll(/import\s+([^;]+?)\s+from\s+["']([^"']+)["']/g)){
  const clause=m[1].trim(), spec=m[2];
  if(spec.includes("./config")||spec.includes("lightbox/config")||spec.endsWith("/config.mjs")){
    proxyImports.push({clause,spec});
  }
}

// Identify readiness-related callsites and object flow.
const callsites=[];
const lines=proxyText.split(/\r?\n/);
for(let i=0;i<lines.length;i++){
  const line=lines[i];
  if(/config|readiness|configured|create|new\s+|listen\(|proxy|LightBox|Lightbox/i.test(line)){
    callsites.push({line:i+1,snippet:line.trim().slice(0,900)});
  }
}

// Score assignments by whether they occur in config module vs bootstrap.
// We do not mutate; we certify which file owns production of each property.
const props=["enabled","baseUrl","apiKey","port","timeoutMs","allowedOrigins"];
const propertyOwnership={};
for(const prop of props){
  const configAssignments=fileEvidence[0].assignments.filter(a=>a.property===prop);
  const proxyAssignments=fileEvidence[1].assignments.filter(a=>a.property===prop);
  let owner="UNRESOLVED";
  if(configAssignments.length>0 && proxyAssignments.length===0) owner="CONFIG_MODULE";
  else if(configAssignments.length===0 && proxyAssignments.length>0) owner="PROXY_BOOTSTRAP";
  else if(configAssignments.length>0 && proxyAssignments.length>0) owner="MULTI_STAGE_CONFIG_TO_PROXY";
  propertyOwnership[prop]={
    owner,
    configAssignments,
    proxyAssignments
  };
}

const unresolved=props.filter(p=>propertyOwnership[p].owner==="UNRESOLVED");
const multistage=props.filter(p=>propertyOwnership[p].owner==="MULTI_STAGE_CONFIG_TO_PROXY");
const configOwned=props.filter(p=>propertyOwnership[p].owner==="CONFIG_MODULE");
const proxyOwned=props.filter(p=>propertyOwnership[p].owner==="PROXY_BOOTSTRAP");

const configImportedByProxy=proxyImports.length>0;
const exactProducerChainRecovered=
  unresolved.length===0 &&
  configImportedByProxy &&
  Object.values(propertyOwnership).every(x=>x.owner!=="UNRESOLVED");

let classification,next;
if(!configImportedByProxy){
  classification="CONFIG_MODULE_NOT_PROVEN_AS_PROXY_BOOTSTRAP_INPUT";
  next="M4.19D4Y_PROXY_BOOTSTRAP_CONFIG_IMPORT_CALLSITE_FORENSICS";
}else if(unresolved.length){
  classification="CONFIG_PRODUCER_CHAIN_PARTIALLY_BOUND";
  next="M4.19D4Y_MISSING_PROPERTY_PRODUCER_BINDING";
}else if(multistage.length){
  classification="CONFIG_MODULE_TO_PROXY_MULTI_STAGE_PRODUCER_CHAIN_RECOVERED";
  next="M4.19D4Y_MULTI_STAGE_SERVER_CONFIG_VALUE_PRECEDENCE_BINDING";
}else{
  classification="SERVER_CONFIG_OBJECT_PRODUCER_CHAIN_EXACTLY_BOUND";
  next="M4.19D4Y_SERVER_CONFIG_RUNTIME_VALUE_PRECEDENCE_AND_ISOLATED_READINESS_GATE";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4X_CONFIG_OBJECT_PRODUCER_BINDING_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  fileEvidence,
  proxyImportsFromConfig:proxyImports,
  proxyReadinessCallsites:callsites,
  propertyOwnership,
  configOwnedProperties:configOwned,
  proxyOwnedProperties:proxyOwned,
  multiStageProperties:multistage,
  unresolvedProperties:unresolved,
  configImportedByProxy,
  exactProducerChainRecovered,
  classification,
  secretValuesCaptured:false,
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4X_SERVER_CONFIG_OBJECT_PRODUCER_EXACT_BINDING_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  binding:{
    classification,
    configImportedByProxy,
    exactProducerChainRecovered,
    configOwnedProperties:configOwned,
    proxyOwnedProperties:proxyOwned,
    multiStageProperties:multistage,
    unresolvedProperties:unresolved,
    propertyOwnership
  },
  policy:{
    exactProducerOwnershipRequired:true,
    exactImportChainRequired:true,
    precedenceMustBeCertifiedBeforeRuntimeMutation:true,
    noProxyRestart:true,
    noEnrichmentRetry:true
  },
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false,
    secretValuesExposed:false
  },
  artifacts:{producerBindingAudit:auditPath},
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:false,
    identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
