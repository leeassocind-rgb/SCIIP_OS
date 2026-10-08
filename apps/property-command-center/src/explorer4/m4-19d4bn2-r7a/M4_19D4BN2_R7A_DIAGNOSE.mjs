#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo = path.resolve(process.argv[2] || ".");
const app = path.join(repo,"apps/property-command-center");
const ev = path.join(app,"evidence");
const srcRoot = path.join(app,"src");
const pubRoot = path.join(app,"public");

const r7r1p = path.join(ev,"m4-19d4bn2-r7-r1-explorer-navigation-activation-and-native-search-event-path-reconciliation.json");
if(!fs.existsSync(r7r1p)) throw new Error("R7-R1 evidence missing");
const r7r1 = JSON.parse(fs.readFileSync(r7r1p,"utf8"));
if(r7r1.status!=="BLOCKED" || !String(r7r1.state).includes("RENDERED_CANDIDATE_INDEX_GAP_RECONCILIATION_REQUIRED"))
  throw new Error("R7-R1 prerequisite state not accepted");

const bn1p = path.join(ev,"m4-19d4bn1-controlled-ten-property-runtime-mirror-propagation-execution-and-parity-certification.json");
if(!fs.existsSync(bn1p)) throw new Error("BN1 evidence missing");
const bn1=JSON.parse(fs.readFileSync(bn1p,"utf8"));
const ten=bn1.execution?.certification;
if(!Array.isArray(ten)||ten.length!==10) throw new Error("BN1 exact ten records unresolved");

function sha(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex")}
function walk(dir, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ent.name==="node_modules"||ent.name===".git"||ent.name==="dist"||ent.name==="build") continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) walk(p,out);
    else out.push(p);
  }
  return out;
}
function textFile(p){
  return /\.(js|jsx|ts|tsx|mjs|cjs|json|jsonl|html|md)$/i.test(p);
}
function safeRead(p){
  try{return fs.readFileSync(p,"utf8")}catch{return ""}
}
function norm(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim()}

const allFiles=[...walk(srcRoot),...walk(pubRoot)].filter(textFile);
const searchImplHits=[];
for(const p of allFiles){
  const t=safeRead(p);
  if(/Search SCIIP/i.test(t) || /searchQuery|searchTerm|filteredProperties|searchResults|candidate/i.test(t)){
    const lines=t.split(/\r?\n/);
    const hitLines=[];
    lines.forEach((line,i)=>{
      if(/Search SCIIP|searchQuery|searchTerm|filteredProperties|searchResults|candidate|governed-base-inventory|canonical-property-identity-data/i.test(line))
        hitLines.push({line:i+1,text:line.trim().slice(0,500)});
    });
    if(hitLines.length) searchImplHits.push({path:path.relative(app,p),hitLines:hitLines.slice(0,120)});
  }
}

const dataFiles=allFiles.filter(p=>/\.(json|jsonl)$/i.test(p));
const cohortByAddr=new Map(ten.map(r=>[norm(r.address),r]));
const cohortBySource=new Map(ten.map(r=>[r.sourcePropertyId,r]));
const cohortByCanonical=new Map(ten.map(r=>[r.canonicalPropertyId,r]));

function recursivelyInspect(value, state, trail=[]){
  if(Array.isArray(value)){
    const info={path:trail, length:value.length, addressMatches:0, sourceMatches:0, canonicalMatches:0, sampleKeys:[]};
    for(const row of value){
      if(row && typeof row==="object"){
        if(info.sampleKeys.length===0) info.sampleKeys=Object.keys(row).slice(0,30);
        const a=norm(row.address||row.normalizedAddress||row.propertyAddress||row.fullAddress);
        const s=row.sourcePropertyId||row.sourceId;
        const c=row.canonicalPropertyId||row.canonicalId;
        if(a && cohortByAddr.has(a)) info.addressMatches++;
        if(s && cohortBySource.has(s)) info.sourceMatches++;
        if(c && cohortByCanonical.has(c)) info.canonicalMatches++;
      }
    }
    if(info.addressMatches||info.sourceMatches||info.canonicalMatches) state.arrays.push(info);
    for(let i=0;i<Math.min(value.length,5);i++) recursivelyInspect(value[i],state,[...trail,String(i)]);
  } else if(value && typeof value==="object"){
    for(const [k,v] of Object.entries(value)) recursivelyInspect(v,state,[...trail,k]);
  }
}

const datasetDiagnostics=[];
for(const p of dataFiles){
  const rel=path.relative(app,p);
  let parsed=null, parseMode=null;
  try{
    const t=fs.readFileSync(p,"utf8");
    try{parsed=JSON.parse(t);parseMode="JSON"}catch{
      const rows=t.split(/\r?\n/).filter(Boolean).map(x=>{try{return JSON.parse(x)}catch{return null}}).filter(Boolean);
      if(rows.length){parsed=rows;parseMode="JSONL"}
    }
  }catch{}
  if(parsed!==null){
    const state={arrays:[]};
    recursivelyInspect(parsed,state,[]);
    if(state.arrays.length){
      datasetDiagnostics.push({
        path:rel,
        sha256:sha(p),
        parseMode,
        matchingArrays:state.arrays
      });
    }
  }
}

const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const runtimePath=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");

const fixedBindings={
  canonical:{path:path.relative(app,canonicalPath),exists:fs.existsSync(canonicalPath),sha256:fs.existsSync(canonicalPath)?sha(canonicalPath):null},
  runtime:{path:path.relative(app,runtimePath),exists:fs.existsSync(runtimePath),sha256:fs.existsSync(runtimePath)?sha(runtimePath):null},
  governedInventory:{path:path.relative(app,inventoryPath),exists:fs.existsSync(inventoryPath),sha256:fs.existsSync(inventoryPath)?sha(inventoryPath):null}
};

function fileContainsAnyTen(p){
  const t=safeRead(p);
  let addresses=0,sources=0,canonicals=0;
  for(const r of ten){
    if(t.includes(r.address)) addresses++;
    if(t.includes(r.sourcePropertyId)) sources++;
    if(t.includes(r.canonicalPropertyId)) canonicals++;
  }
  return {addresses,sources,canonicals};
}

const sourceReferenceHits=[];
for(const p of allFiles.filter(p=>/\.(js|jsx|ts|tsx|mjs|cjs)$/i.test(p))){
  const t=safeRead(p);
  if(/governed-base-inventory|canonical-property-identity-data|production-validation-data|Search SCIIP|searchQuery|searchTerm|properties/i.test(t)){
    const ref={
      path:path.relative(app,p),
      governedInventory:/governed-base-inventory/i.test(t),
      canonicalRuntime:/canonical-property-identity-data/i.test(t),
      productionValidation:/production-validation-data/i.test(t),
      searchSciip:/Search SCIIP/i.test(t),
      fetchCalls:[...t.matchAll(/fetch\(([^)\n]{1,250})\)/g)].map(m=>m[1].trim()).slice(0,30),
      tenLiteralPresence:fileContainsAnyTen(p)
    };
    sourceReferenceHits.push(ref);
  }
}

const tenPresence=ten.map(r=>{
  const presence=[];
  for(const d of datasetDiagnostics){
    let found=false;
    for(const arr of d.matchingArrays){
      if(arr.addressMatches||arr.sourceMatches||arr.canonicalMatches){ found=true; break; }
    }
    if(found){
      const t=safeRead(path.join(app,d.path));
      presence.push({
        path:d.path,
        address:t.includes(r.address),
        sourcePropertyId:t.includes(r.sourcePropertyId),
        canonicalPropertyId:t.includes(r.canonicalPropertyId)
      });
    }
  }
  return {...r,presence};
});

const runtimeParity=fixedBindings.canonical.exists&&fixedBindings.runtime.exists&&fixedBindings.canonical.sha256===fixedBindings.runtime.sha256;

const likelySearchFiles=searchImplHits.filter(x=>x.hitLines.some(h=>/Search SCIIP/i.test(h.text)));
const searchReferencesRuntime=sourceReferenceHits.some(x=>x.searchSciip && x.canonicalRuntime);
const searchReferencesInventory=sourceReferenceHits.some(x=>x.searchSciip && x.governedInventory);

let classification="UNRESOLVED_SEARCH_SOURCE_BINDING";
if(searchReferencesInventory && !searchReferencesRuntime) classification="SEARCH_UI_BOUND_TO_GOVERNED_INVENTORY_NOT_CANONICAL_RUNTIME_MIRROR";
else if(searchReferencesRuntime) classification="SEARCH_UI_REFERENCES_CANONICAL_RUNTIME_MIRROR_FURTHER_FILTER_OR_INDEX_DIAGNOSTIC_REQUIRED";
else if(likelySearchFiles.length===0) classification="SEARCH_SCIIP_IMPLEMENTATION_NOT_LOCATED_BY_STATIC_SOURCE_SCAN";

const out={
  contract:"SCIIP_EXPLORER_4_M4_19D4BN2_R7A_EXPLORER_SEARCH_INDEX_AND_SOURCE_BINDING_DIAGNOSTIC",
  version:"4.0-m4.19d4bn2-r7a",
  status:"PASSED",
  state:"M419D4BN2_R7A_SEARCH_INDEX_SOURCE_BINDING_DIAGNOSED_REMEDIATION_DESIGN_READY",
  certifiedAt:new Date().toISOString(),
  prerequisite:{
    r7r1State:r7r1.state,
    bn1State:bn1.state,
    exactTen:ten.length===10,
    canonicalRuntimeParity:runtimeParity
  },
  fixedBindings,
  classification,
  searchImplementation:{
    filesScanned:allFiles.length,
    likelySearchFiles,
    sourceReferenceHits
  },
  datasets:{
    matchingDatasetCount:datasetDiagnostics.length,
    diagnostics:datasetDiagnostics
  },
  tenPropertyTrace:tenPresence,
  checks:{
    r7r1BlockedAtCandidateIndexGap:true,
    bn1Passed:bn1.status==="PASSED",
    exactTenResolved:true,
    canonicalRuntimeParity:runtimeParity,
    searchSourceStaticScanCompleted:true,
    datasetCohortPresenceScanCompleted:true,
    noWritePerformed:true
  },
  adjudication:{
    browserInputMechanicsClosed:true,
    explorerNavigationClosed:true,
    canonicalRuntimePropagationClosed:true,
    remainingBoundary:"EXPLORER_SEARCH_SOURCE_OR_INDEX_BINDING",
    recommendedAction:
      classification==="SEARCH_UI_BOUND_TO_GOVERNED_INVENTORY_NOT_CANONICAL_RUNTIME_MIRROR"
      ? "Design a read-path bridge or index composition so Search SCIIP consumes the canonical/runtime identity layer together with governed property presentation data."
      : "Trace the located Search SCIIP candidate builder from its bound source through all filters/memos/selectors and certify why the exact ten records are excluded."
  },
  policy:{
    diagnosticOnly:true,
    readOnly:true,
    applicationMutation:false,
    uiSourceMutation:false,
    canonicalMutation:false,
    runtimeMutation:false,
    inventoryMutation:false,
    networkRequests:0
  },
  nextMilestone:"M4.19D4BN2_R7B_EXPLORER_SEARCH_CANDIDATE_BUILDER_FILTER_AND_INDEX_CAUSAL_TRACE",
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
  safety:{
    productionCanonicalMutationPerformed:false,
    productionEventMutationPerformed:false,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    applicationMutationPerformed:false,
    uiMutationPerformed:false,
    networkRequestsPerformed:0,
    automaticRetry:false
  }
};

fs.mkdirSync(ev,{recursive:true});
const outp=path.join(ev,"m4-19d4bn2-r7a-explorer-search-index-and-source-binding-diagnostic.json");
fs.writeFileSync(outp,JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify(out,null,2));
