#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,readinessSignals,assignmentSignals} from "./M419D4TReadinessRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4s-lightbox-config-object-defaults-secret-source-forensics.json");
const resultPath=path.join(ev,"m4-19d4t-lightbox-readiness-implementation-targeted-forensics.json");
const auditPath=path.join(ev,"m4-19d4t-lightbox-readiness-assignment-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

if(!fs.existsSync(prior)) block("M419D4T_PREREQUISITE_MISSING",{path:prior});
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4S_LIGHTBOX_CONFIG_OBJECT_DEFAULTS_SECRET_SOURCE_FORENSICS_CERTIFIED")
  block("M419D4T_M419D4S_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.forensics?.classification!=="READINESS_LOGIC_PRESENT_BUT_CONFIGURATION_SOURCE_UNRESOLVED")
  block("M419D4T_READINESS_UNRESOLVED_CLASSIFICATION_REQUIRED",{observed:pdoc?.forensics?.classification??null});

const roots=[
  path.join(app,"server/lightbox"),
  path.join(app,"src")
].filter(fs.existsSync);

const codeExt=new Set([".mjs",".js",".cjs",".ts",".tsx",".jsx"]);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(["node_modules","dist","build","coverage",".git"].includes(ent.name)) continue;
      walk(p);
    }else if(codeExt.has(path.extname(ent.name))){
      files.push(p);
    }
  }
}
for(const r of roots) walk(r);

const relevant=[];
for(const p of files){
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  if(!/lightbox|configured|readiness|apiKey|baseUrl|timeoutMs|allowedOrigins/i.test(text)) continue;
  const rs=readinessSignals(text);
  const as=assignmentSignals(text);
  if(rs.length||as.length){
    relevant.push({
      file:path.relative(repo,p),
      readinessSignals:rs,
      assignments:as
    });
  }
}

const propertyMap={};
for(const f of relevant){
  for(const a of f.assignments){
    if(!propertyMap[a.property]) propertyMap[a.property]=[];
    propertyMap[a.property].push({file:f.file,expression:a.expression});
  }
}

const props=["baseUrl","apiKey","enabled","port","timeoutMs","allowedOrigins"];
const recovered=props.filter(p=>propertyMap[p]?.length);
const unresolved=props.filter(p=>!propertyMap[p]?.length);

const allExpr=JSON.stringify(propertyMap);
const usesImportMetaEnv=/import\.meta\.env/.test(allExpr);
const usesProcessEnv=/process\.env/.test(allExpr);
const usesVitePrefix=/VITE_LIGHTBOX/i.test(allExpr);
const usesHardcodedDefault=/localhost|127\.0\.0\.1|https?:\/\//i.test(allExpr);
const usesConfigObject=/config\.|settings\.|options\./i.test(allExpr);

let classification,next;
if(usesVitePrefix && !usesProcessEnv){
  classification="SERVER_READINESS_DEPENDS_ON_VITE_CLIENT_CONFIGURATION";
  next="M4.19D4U_SERVER_CLIENT_CONFIG_BOUNDARY_REPAIR_POLICY";
}else if(usesConfigObject){
  classification="READINESS_VALUES_FLOW_FROM_CONFIG_OBJECT";
  next="M4.19D4U_CONFIG_OBJECT_PRODUCER_BINDING_FORENSICS";
}else if(usesHardcodedDefault && recovered.includes("baseUrl")){
  classification="READINESS_DEFAULTS_PRESENT_API_KEY_OR_ENABLEMENT_GAP_REMAINS";
  next="M4.19D4U_READINESS_DEFAULTS_AND_CREDENTIAL_REQUIREMENT_POLICY";
}else if(recovered.length>0){
  classification="READINESS_ASSIGNMENT_PATH_PARTIALLY_RECOVERED";
  next="M4.19D4U_READINESS_ASSIGNMENT_SOURCE_COMPLETION_FORENSICS";
}else{
  classification="READINESS_ASSIGNMENT_PATH_NOT_RECOVERED";
  next="M4.19D4U_LIGHTBOX_BOOTSTRAP_CALLSITE_BROADER_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4T_READINESS_ASSIGNMENT_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  filesScanned:files.length,
  relevantFiles:relevant.length,
  propertyAssignments:propertyMap,
  recoveredProperties:recovered,
  unresolvedProperties:unresolved,
  semanticFlags:{
    usesImportMetaEnv,
    usesProcessEnv,
    usesVitePrefix,
    usesHardcodedDefault,
    usesConfigObject
  },
  classification,
  secretValuesCaptured:false,
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4T_LIGHTBOX_READINESS_IMPLEMENTATION_TARGETED_FORENSICS_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    classification,
    filesScanned:files.length,
    relevantFiles:relevant.length,
    recoveredReadinessProperties:recovered,
    unresolvedReadinessProperties:unresolved,
    usesImportMetaEnv,
    usesProcessEnv,
    usesVitePrefix,
    usesHardcodedDefault,
    usesConfigObject,
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    secretValuesExposed:false
  },
  policy:{
    readinessProducerMustBeProvenBeforeRestart:true,
    noBlindRuntimeBinding:true,
    noProxyRestart:true,
    noEnrichmentRetry:true
  },
  artifacts:{readinessAssignmentAudit:auditPath},
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
