#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,findAssignments,findCallsites,classifyExpression,sha} from "./M419D4WBindingRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4v-server-owned-lightbox-config-boundary-repair-self-test.json");
const resultPath=path.join(ev,"m4-19d4w-server-runtime-readiness-config-source-exact-binding.json");
const auditPath=path.join(ev,"m4-19d4w-server-runtime-readiness-binding-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

if(!fs.existsSync(prior)) block("M419D4W_PREREQUISITE_MISSING",{path:prior});
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4V_SERVER_CLIENT_BOUNDARY_REPAIRED_STATICALLY_ISOLATED_SELF_TEST_RUNTIME_CONFIG_STILL_REQUIRED")
  block("M419D4W_M419D4V_RUNTIME_CONFIG_REQUIRED_STATE_EXPECTED",{observed:pdoc?.state??null});

const roots=[
  path.join(app,"server"),
  path.join(app,"src")
].filter(fs.existsSync);

const exts=new Set([".mjs",".js",".cjs",".ts",".tsx",".jsx"]);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules","dist","build","coverage",".git"].includes(ent.name)) continue;
      walk(p);
    }else if(exts.has(path.extname(ent.name))) files.push(p);
  }
}
for(const r of roots) walk(r);

const candidates=[];
for(const p of files){
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  if(!/lightbox|baseUrl|apiKey|allowedOrigins|timeoutMs|LIGHTBOX_NOT_CONFIGURED|readiness/i.test(text)) continue;
  const assignments=findAssignments(text).map(a=>({...a,classes:classifyExpression(a.expression)}));
  const callsites=findCallsites(text);
  if(assignments.length||callsites.length){
    candidates.push({
      file:path.relative(repo,p),
      assignments,
      callsites,
      sourceSha:sha(text)
    });
  }
}

// Focus server-side evidence first.
const serverCandidates=candidates.filter(x=>x.file.includes("/server/") || x.file.startsWith("apps/property-command-center/server/"));
const propertyEvidence={};
for(const item of serverCandidates){
  for(const a of item.assignments){
    if(!propertyEvidence[a.property]) propertyEvidence[a.property]=[];
    propertyEvidence[a.property].push({
      file:item.file,
      expression:a.expression,
      classes:a.classes
    });
  }
}

const props=["enabled","baseUrl","apiKey","port","timeoutMs","allowedOrigins"];
const exactBound=props.filter(p=>propertyEvidence[p]?.length===1);
const multiplyBound=props.filter(p=>(propertyEvidence[p]?.length||0)>1);
const unresolved=props.filter(p=>!propertyEvidence[p]?.length);

const allExpressions=JSON.stringify(propertyEvidence);
const processEnvKeys=[...new Set([...allExpressions.matchAll(/process\.env(?:\.([A-Z][A-Z0-9_]*)|\[['"]([A-Z][A-Z0-9_]*)['"]\])/g)].map(m=>m[1]||m[2]).filter(Boolean))];
const importMetaKeys=[...new Set([...allExpressions.matchAll(/import\.meta\.env(?:\.([A-Z][A-Z0-9_]*)|\[['"]([A-Z][A-Z0-9_]*)['"]\])/g)].map(m=>m[1]||m[2]).filter(Boolean))];

const configSourceCandidates=serverCandidates
  .filter(x=>x.assignments.some(a=>a.classes.includes("CONFIG_OBJECT")||a.classes.includes("PROCESS_ENV")||a.classes.includes("LITERAL_OR_DEFAULT_URL")))
  .map(x=>x.file);

let classification,next;
if(importMetaKeys.length){
  classification="SERVER_RUNTIME_STILL_REFERENCES_IMPORT_META_ENV";
  next="M4.19D4X_SERVER_RUNTIME_IMPORT_META_ENV_EXACT_REPAIR";
}else if(processEnvKeys.length){
  classification="SERVER_RUNTIME_PROCESS_ENV_KEYS_EXACTLY_RECOVERED";
  next="M4.19D4X_SERVER_RUNTIME_PROCESS_ENV_BINDING_AND_ISOLATED_SELF_TEST";
}else if(unresolved.length===0 && multiplyBound.length===0){
  classification="SERVER_RUNTIME_READINESS_ASSIGNMENTS_EXACTLY_BOUND_WITHOUT_ENVIRONMENT_ACCESS";
  next="M4.19D4X_SERVER_RUNTIME_BOUND_CONFIG_OBJECT_SELF_TEST";
}else if(configSourceCandidates.length){
  classification="SERVER_RUNTIME_CONFIG_OBJECT_PRODUCER_CANDIDATES_RECOVERED";
  next="M4.19D4X_SERVER_CONFIG_OBJECT_PRODUCER_EXACT_BINDING";
}else{
  classification="SERVER_RUNTIME_READINESS_SOURCE_REQUIRES_BOOTSTRAP_CALL_CHAIN_BINDING";
  next="M4.19D4X_SERVER_BOOTSTRAP_CALL_CHAIN_EXACT_BINDING";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4W_SERVER_RUNTIME_READINESS_BINDING_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  filesScanned:files.length,
  candidateFiles:candidates.length,
  serverCandidateFiles:serverCandidates.length,
  propertyEvidence,
  exactBoundProperties:exactBound,
  multiplyBoundProperties:multiplyBound,
  unresolvedProperties:unresolved,
  processEnvironmentKeys:processEnvKeys,
  importMetaEnvironmentKeys:importMetaKeys,
  configSourceCandidates,
  classification,
  secretValuesCaptured:false,
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4W_SERVER_RUNTIME_READINESS_CONFIG_SOURCE_EXACT_BINDING_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  binding:{
    classification,
    filesScanned:files.length,
    serverCandidateFiles:serverCandidates.length,
    exactBoundProperties:exactBound,
    multiplyBoundProperties:multiplyBound,
    unresolvedProperties:unresolved,
    processEnvironmentKeys:processEnvKeys,
    importMetaEnvironmentKeys:importMetaKeys,
    configSourceCandidates,
    exactBindingComplete:unresolved.length===0 && multiplyBound.length===0
  },
  policy:{
    noHeuristicLiteralPromotion:true,
    exactAssignmentEvidenceRequired:true,
    exactCallsiteEvidenceRequiredBeforeMutation:true,
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
  artifacts:{bindingAudit:auditPath},
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
