#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj4a-production-storage-binding-reconciliation.json");
const out=path.join(ev,"m4-19d4bj4a1-canonical-source-public-materialization-lineage-reconciliation.json");
const srcCanonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const publicCanonical=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const adapterPath=path.join(app,"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js");

const readJson=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const rel=p=>path.relative(app,p);

if(!fs.existsSync(prior)) throw new Error("BJ4A evidence missing");
const P=readJson(prior);
if(P.state!=="M419D4BJ4A_CANONICAL_STORE_WRITE_AUTHORITY_REMAINS_UNRESOLVED_TARGETED_SOURCE_MATERIALIZATION_LINEAGE_REQUIRED")
  throw new Error(`BJ4A state mismatch: ${P.state}`);
if(P.priorExecution?.writesAttempted!==0) throw new Error("BJ4A1 requires zero prior BJ4 writes");

for(const p of [srcCanonical,publicCanonical,adapterPath]) if(!fs.existsSync(p)) throw new Error("required file missing: "+p);

console.log("[BJ4A1] prior zero-write state accepted");
console.log("[BJ4A1] tracing exact source/public canonical lineage; writes remain OFF");

function walk(dir,acc=[]){
  if(!fs.existsSync(dir)) return acc;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()){
      if(["node_modules",".git","dist","build","coverage","explorer4"].includes(e.name)) continue;
      walk(p,acc);
    }else if(/\.(js|mjs|cjs|jsx|ts|tsx|py|sh|command|json|md)$/.test(e.name)) acc.push(p);
  }
  return acc;
}
const roots=[
 path.join(app,"src"),
 path.join(app,"tools"),
 path.join(app,"scripts"),
 path.join(app,"server"),
 app
].filter(fs.existsSync);
const all=[...new Set(roots.flatMap(r=>walk(r)))];

function analyzeFile(f){
  let t=""; try{t=fs.readFileSync(f,"utf8")}catch{return null}
  const basename="canonical-property-identity-data.json";
  if(!t.includes(basename) && !t.includes("production-validation-data") && !t.includes("production-validation")) return null;
  const hasSrc=t.includes("src/production-validation/canonical-property-identity-data.json") ||
               /src[\/\\]production-validation[\/\\]canonical-property-identity-data\.json/.test(t);
  const hasPublic=t.includes("public/production-validation-data/canonical-property-identity-data.json") ||
                  /public[\/\\]production-validation-data[\/\\]canonical-property-identity-data\.json/.test(t);
  const hasBase=t.includes(basename);
  const copy=/copyFile|copyFileSync|cpSync|fs\.cp|shutil\.copy|shutil\.copy2|\bcp\s/.test(t);
  const rename=/rename|renameSync|os\.replace/.test(t);
  const write=/writeFile|writeFileSync|appendFile|appendFileSync|atomicWrite/.test(t);
  const read=/readFile|readFileSync|fetch\(|import\s/.test(t);
  const pathResolve=/path\.join|path\.resolve|resolveCanonicalPropertyStorePhysicalStorage|canonicalStorePath|storagePath|physicalPath/.test(t);
  const srcToPublic=(hasSrc&&hasPublic&&(copy||write||rename)) ||
    (/src[\/\\]production-validation/.test(t)&&/public[\/\\]production-validation-data/.test(t)&&(copy||write||rename));
  const publicToSrc=(hasSrc&&hasPublic&&/public/.test(t)&&/src/.test(t)&&/(copy|write)/.test(String({copy,write})));
  return {path:rel(f),hasSrc,hasPublic,hasBase,copy,rename,write,read,pathResolve,srcToPublic,publicToSrc};
}
const refs=all.map(analyzeFile).filter(Boolean);

const adapterText=fs.readFileSync(adapterPath,"utf8");
const adapterLines=adapterText.split(/\r?\n/);
const adapterEvidence=[];
for(let i=0;i<adapterLines.length;i++){
  const s=adapterLines[i];
  if(/canonical-property-identity-data|production-validation|production-validation-data|canonicalStorePath|storagePath|physical|writeAtomic|atomicWriteJson|resolveCanonicalPropertyStorePhysicalStorage/i.test(s)){
    adapterEvidence.push({line:i+1,text:s.trim()});
  }
}

const srcSha=sha(srcCanonical), pubSha=sha(publicCanonical);
const byteIdentical=srcSha===pubSha;
const srcStat=fs.statSync(srcCanonical), pubStat=fs.statSync(publicCanonical);

const directSrcToPublic=refs.filter(x=>x.srcToPublic);
const srcWriters=refs.filter(x=>x.hasSrc&&x.write);
const publicWriters=refs.filter(x=>x.hasPublic&&x.write);
const basenameWriters=refs.filter(x=>x.hasBase&&x.write);
const adapterRef=refs.find(x=>x.path==="src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js")||null;

// Detect path preference in adapter source from literal ordering and explicit directory clues.
const srcIndex=adapterText.search(/src[\/\\]production-validation|production-validation[\/\\]canonical-property-identity-data/);
const publicIndex=adapterText.search(/public[\/\\]production-validation-data|production-validation-data[\/\\]canonical-property-identity-data/);
let adapterPathPreference="UNRESOLVED";
if(srcIndex>=0 && (publicIndex<0 || srcIndex<publicIndex)) adapterPathPreference="SRC_FIRST_OR_SRC_ONLY";
else if(publicIndex>=0 && (srcIndex<0 || publicIndex<srcIndex)) adapterPathPreference="PUBLIC_FIRST_OR_PUBLIC_ONLY";

// Look for manifests/receipts explicitly naming authoritative source.
const authorityEvidence=[];
for(const f of all.filter(x=>/\.(json|md|js|mjs)$/.test(x))){
  let t=""; try{t=fs.readFileSync(f,"utf8")}catch{continue}
  if(!/canonical-property-identity-data\.json/.test(t)) continue;
  const signals=[];
  if(/authoritative source|source of truth|authoritativeSource|sourceOfTruth/i.test(t)) signals.push("AUTHORITATIVE_SOURCE");
  if(/public.*mirror|generated.*public|materializ.*public|copy.*public/i.test(t)) signals.push("PUBLIC_MIRROR_OR_MATERIALIZATION");
  if(/src\/production-validation\/canonical-property-identity-data\.json/.test(t)) signals.push("EXPLICIT_SRC_PATH");
  if(/public\/production-validation-data\/canonical-property-identity-data\.json/.test(t)) signals.push("EXPLICIT_PUBLIC_PATH");
  if(signals.length>=2) authorityEvidence.push({path:rel(f),signals});
}

let classification="UNRESOLVED";
let authoritativeCanonicalStore=null;
let runtimeMirror=null;
let confidence="LOW";

const strongSrcToPublic=directSrcToPublic.length===1;
const adapterPrefersSrc=adapterPathPreference==="SRC_FIRST_OR_SRC_ONLY";
const srcAuthorityArtifacts=authorityEvidence.filter(x=>x.signals.includes("AUTHORITATIVE_SOURCE")&&x.signals.includes("EXPLICIT_SRC_PATH"));
const publicMirrorArtifacts=authorityEvidence.filter(x=>x.signals.includes("PUBLIC_MIRROR_OR_MATERIALIZATION")&&x.signals.includes("EXPLICIT_PUBLIC_PATH"));

if(byteIdentical && strongSrcToPublic){
  classification="SRC_AUTHORITATIVE_PUBLIC_GENERATED_MIRROR";
  authoritativeCanonicalStore=srcCanonical; runtimeMirror=publicCanonical; confidence="HIGH";
}else if(byteIdentical && adapterPrefersSrc && srcWriters.length>0 && publicWriters.length===0){
  classification="SRC_AUTHORITATIVE_PUBLIC_RUNTIME_MIRROR";
  authoritativeCanonicalStore=srcCanonical; runtimeMirror=publicCanonical; confidence="HIGH";
}else if(byteIdentical && srcAuthorityArtifacts.length>0 && publicMirrorArtifacts.length>0){
  classification="SRC_AUTHORITATIVE_PUBLIC_GENERATED_MIRROR";
  authoritativeCanonicalStore=srcCanonical; runtimeMirror=publicCanonical; confidence="HIGH";
}else if(byteIdentical && adapterPrefersSrc && srcWriters.length>0){
  classification="SRC_WRITE_AUTHORITY_STRONGLY_SUPPORTED_PUBLIC_MIRROR_LIKELY";
  authoritativeCanonicalStore=srcCanonical; runtimeMirror=publicCanonical; confidence="MEDIUM";
}

const bindingProven=confidence==="HIGH" && !!authoritativeCanonicalStore;

const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ4A1_CANONICAL_SOURCE_TO_PUBLIC_MATERIALIZATION_LINEAGE_RECONCILIATION",
 version:"4.0-m4.19d4bj4a1",
 status:"PASSED",
 state:bindingProven
  ?"M419D4BJ4A1_CANONICAL_WRITE_AUTHORITY_AND_PUBLIC_MIRROR_LINEAGE_CERTIFIED_A2_EVENT_STORE_RECONCILIATION_READY"
  :"M419D4BJ4A1_CANONICAL_WRITE_AUTHORITY_NOT_YET_UNIQUELY_PROVEN_TARGETED_ADAPTER_PATH_RESOLUTION_RUNTIME_PROBE_REQUIRED",
 certifiedAt:new Date().toISOString(),
 reconciliation:{
   srcCandidate:srcCanonical,
   publicCandidate:publicCanonical,
   srcSha256:srcSha,
   publicSha256:pubSha,
   byteIdentical,
   srcBytes:srcStat.size,
   publicBytes:pubStat.size,
   srcMtime:srcStat.mtime.toISOString(),
   publicMtime:pubStat.mtime.toISOString(),
   classification,
   confidence,
   authoritativeCanonicalStore,
   runtimeMirror,
   bindingProven
 },
 executableLineage:{
   filesInspected:all.length,
   referenceCount:refs.length,
   directSrcToPublic,
   srcWriters,
   publicWriters,
   basenameWriters:basenameWriters.slice(0,50),
   adapterRef,
   adapterPathPreference,
   adapterEvidence:adapterEvidence.slice(0,120),
   authorityEvidence:authorityEvidence.slice(0,80)
 },
 policy:{
   identicalBytesInsufficientAlone:true,
   exactProducerOrAdapterAuthorityRequired:true,
   noProductionWrite:true,
   noBJ4Retry:true
 },
 nextMilestone:bindingProven
  ?"M4.19D4BJ4A2_CANONICAL_CREATION_EVENT_STORE_LINEAGE_RECONCILIATION"
  :"M4.19D4BJ4A1R1_TARGETED_CANONICAL_ADAPTER_PATH_RESOLUTION_RUNTIME_PROBE",
 authorityClosure:{
   temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
   operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
   networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,
   productionIdentityMutationPerformed:false,temporalMutationPerformed:false,
   governedInventoryMutationPerformed:false,downstreamPropagationPerformed:false,automaticRetry:false
 }
};
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
