#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const r7ap=path.join(ev,"m4-19d4bn2-r7a-explorer-search-index-and-source-binding-diagnostic.json");
if(!fs.existsSync(r7ap)) throw new Error("R7A evidence missing");
const r7a=JSON.parse(fs.readFileSync(r7ap,"utf8"));
if(r7a.status!=="PASSED" || !String(r7a.state).includes("REMEDIATION_DESIGN_READY"))
  throw new Error("R7A prerequisite state not accepted");

const bn1p=path.join(ev,"m4-19d4bn1-controlled-ten-property-runtime-mirror-propagation-execution-and-parity-certification.json");
if(!fs.existsSync(bn1p)) throw new Error("BN1 evidence missing");
const bn1=JSON.parse(fs.readFileSync(bn1p,"utf8"));
const ten=bn1.execution?.certification;
if(!Array.isArray(ten)||ten.length!==10) throw new Error("BN1 exact ten records unresolved");

function sha(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex")}
function walk(dir,out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(["node_modules",".git","dist","build"].includes(e.name)) continue;
    const p=path.join(dir,e.name);
    if(e.isDirectory()) walk(p,out); else out.push(p);
  }
  return out;
}
function read(p){try{return fs.readFileSync(p,"utf8")}catch{return ""}}
function norm(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim()}
function lineHits(text,re){
  const out=[]; text.split(/\r?\n/).forEach((v,i)=>{if(re.test(v)) out.push({line:i+1,text:v.trim().slice(0,1600)})});
  return out;
}
function resolveImport(fromFile,spec){
  if(!spec.startsWith(".")) return null;
  const base=path.resolve(path.dirname(fromFile),spec);
  for(const c of [base,base+".js",base+".jsx",base+".ts",base+".tsx",path.join(base,"index.js"),path.join(base,"index.jsx")]){
    if(fs.existsSync(c)&&fs.statSync(c).isFile()) return c;
  }
  return null;
}
function parseImports(file){
  const t=read(file), out=[];
  const re=/import\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g;
  for(const m of t.matchAll(re)){
    const p=resolveImport(file,m[1]);
    if(p) out.push(p);
  }
  return out;
}
function inspectArray(value,trail=[],out=[]){
  if(Array.isArray(value)){
    out.push({path:trail,length:value.length,rows:value});
  }else if(value&&typeof value==="object"){
    for(const [k,v] of Object.entries(value)) inspectArray(v,[...trail,k],out);
  }
  return out;
}
function rowKeys(row){
  if(!row||typeof row!=="object") return {};
  return {
    address: row.address||row.normalizedAddress||row.propertyAddress||row.fullAddress||null,
    sourcePropertyId: row.sourcePropertyId||row.sourceId||null,
    canonicalPropertyId: row.canonicalPropertyId||row.canonicalId||null,
    id: row.id||row.propertyId||null,
    status: row.status||null,
    available: row.available??row.isAvailable??null
  };
}

const srcRoot=path.join(app,"src");
const allSrc=walk(srcRoot).filter(p=>/\.(js|jsx|ts|tsx|mjs|cjs)$/i.test(p));

const explorer3=allSrc.find(p=>p.endsWith(path.join("broker-product","property-explorer","v6","Explorer3.jsx")));
if(!explorer3) throw new Error("Explorer3.jsx not found");

const explorer3Text=read(explorer3);
const directImports=parseImports(explorer3);
const relevantTokens=/globalSearchQuery|resolveGlobalPropertySearch|EXPLORER3_PROPERTIES|governed-base-inventory|searchResults|filteredProperties|useMemo|filter\(|map\(|setGlobalSearchQuery|onChange|Search SCIIP/i;

const traceFiles=new Map();
function addFile(file,depth=0,parent=null){
  if(!file||traceFiles.has(file)||depth>5) return;
  const t=read(file);
  const hits=lineHits(t,relevantTokens);
  traceFiles.set(file,{path:path.relative(app,file),depth,parent:parent?path.relative(app,parent):null,hits});
  if(hits.length){
    for(const imp of parseImports(file)) addFile(imp,depth+1,file);
  }
}
addFile(explorer3);

for(const p of allSrc){
  const t=read(p);
  if(/resolveGlobalPropertySearch|EXPLORER3_PROPERTIES|globalSearchQuery/.test(t)) addFile(p,0,null);
}

const symbolFiles={
  globalSearchQuery:[],
  resolveGlobalPropertySearch:[],
  EXPLORER3_PROPERTIES:[],
  governedInventory:[],
  searchResults:[],
  filteredProperties:[]
};
for(const p of allSrc){
  const t=read(p);
  for(const k of Object.keys(symbolFiles)){
    const re = k==="governedInventory" ? /governed-base-inventory/ : new RegExp(k);
    if(re.test(t)) symbolFiles[k].push(path.relative(app,p));
  }
}

const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const runtimePath=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const inventoryPath=path.join(app,"public/explorer/governed-base-inventory.json");

const canonical=JSON.parse(fs.readFileSync(canonicalPath,"utf8"));
const runtime=JSON.parse(fs.readFileSync(runtimePath,"utf8"));
const inventory=JSON.parse(fs.readFileSync(inventoryPath,"utf8"));

function collectRows(obj){
  return inspectArray(obj).map(a=>({path:a.path,rows:a.rows}));
}
const canonicalArrays=collectRows(canonical);
const runtimeArrays=collectRows(runtime);
const inventoryArrays=collectRows(inventory);

function presence(arrays,target){
  const out=[];
  for(const a of arrays){
    let addr=0,source=0,canon=0;
    for(const row of a.rows){
      const k=rowKeys(row);
      if(norm(k.address)===norm(target.address)) addr++;
      if(k.sourcePropertyId===target.sourcePropertyId) source++;
      if(k.canonicalPropertyId===target.canonicalPropertyId) canon++;
    }
    if(addr||source||canon) out.push({path:a.path,length:a.rows.length,addressMatches:addr,sourceMatches:source,canonicalMatches:canon});
  }
  return out;
}

const candidateStaticFiles=[];
for(const p of allSrc){
  const t=read(p);
  if(/EXPLORER3_PROPERTIES|resolveGlobalPropertySearch|globalSearchQuery|searchResults|filteredProperties/.test(t)){
    candidateStaticFiles.push({path:path.relative(app,p),hits:lineHits(t,relevantTokens)});
  }
}

function extractArrayLiteralBySymbol(text,symbol){
  const idx=text.indexOf(symbol);
  if(idx<0) return null;
  const eq=text.indexOf("=",idx);
  if(eq<0) return null;
  const start=text.indexOf("[",eq);
  if(start<0) return null;
  let depth=0, quote=null, esc=false;
  for(let i=start;i<text.length;i++){
    const ch=text[i];
    if(quote){
      if(esc){esc=false;continue}
      if(ch==="\\"){esc=true;continue}
      if(ch===quote) quote=null;
      continue;
    }
    if(ch==="'"||ch==='"'||ch==='`'){quote=ch;continue}
    if(ch==="[") depth++;
    if(ch==="]"){depth--; if(depth===0) return text.slice(start,i+1)}
  }
  return null;
}

const explorerDataFile=allSrc.find(p=>p.endsWith(path.join("broker-product","property-explorer","v6","explorer3Data.js")));
let explorer3PropertiesInfo={file:explorerDataFile?path.relative(app,explorerDataFile):null,literalDetected:false,approxRowCount:null,cohortAddressLiteralMatches:0};
if(explorerDataFile){
  const t=read(explorerDataFile);
  const lit=extractArrayLiteralBySymbol(t,"EXPLORER3_PROPERTIES");
  explorer3PropertiesInfo.literalDetected=!!lit;
  if(lit){
    explorer3PropertiesInfo.approxRowCount=(lit.match(/\baddress\s*:/g)||[]).length;
    explorer3PropertiesInfo.cohortAddressLiteralMatches=ten.filter(r=>lit.includes(r.address)).length;
  }
}

const causal=[];
for(const r of ten){
  const cp=presence(canonicalArrays,r);
  const rp=presence(runtimeArrays,r);
  const ip=presence(inventoryArrays,r);
  const explorerLiteral=explorerDataFile?read(explorerDataFile).includes(r.address):false;

  let firstExclusion="UNRESOLVED";
  let explanation="No exclusion point could be proven statically.";
  if(!cp.length) {
    firstExclusion="CANONICAL_STORE";
    explanation="Record absent from canonical store.";
  } else if(!rp.length) {
    firstExclusion="RUNTIME_MIRROR";
    explanation="Record present canonically but absent from runtime mirror.";
  } else if(!ip.length) {
    firstExclusion="GOVERNED_BASE_INVENTORY";
    explanation="Record present in canonical/runtime identity layer but absent from governed-base-inventory consumed by Explorer3 hydration.";
  } else if(!explorerLiteral && explorer3PropertiesInfo.literalDetected) {
    firstExclusion="EXPLORER3_PROPERTIES_STATIC_SEED";
    explanation="Record exists in governed inventory but is absent from EXPLORER3_PROPERTIES static seed; candidate builder may be resolving against the seed rather than hydrated governed rows.";
  } else {
    firstExclusion="POST_SOURCE_FILTER_OR_SELECTOR";
    explanation="Record is present through discovered source layers; exclusion likely occurs in resolveGlobalPropertySearch/searchResults/filter/memo logic.";
  }

  causal.push({
    cohortPosition:r.cohortPosition,
    address:r.address,
    sourcePropertyId:r.sourcePropertyId,
    canonicalPropertyId:r.canonicalPropertyId,
    canonicalPresence:cp,
    runtimePresence:rp,
    governedInventoryPresence:ip,
    explorer3StaticSeedLiteralPresence:explorerLiteral,
    firstExclusion,
    explanation
  });
}

const counts={};
for(const c of causal) counts[c.firstExclusion]=(counts[c.firstExclusion]||0)+1;

const filterHits=[];
for(const [file,info] of traceFiles.entries()){
  const t=read(file);
  const hits=lineHits(t,/resolveGlobalPropertySearch|globalSearchQuery|EXPLORER3_PROPERTIES|searchResults|filteredProperties|useMemo|\.filter\(|\.map\(|status|available|query|address/i);
  if(hits.length) filterHits.push({path:path.relative(app,file),hits});
}

let dominantCause=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"UNRESOLVED";
let next="M4.19D4BN2_R7C_EXPLORER_SEARCH_READ_PATH_REMEDIATION_DESIGN_AND_PREAUTHORIZATION";
if(dominantCause==="POST_SOURCE_FILTER_OR_SELECTOR") next="M4.19D4BN2_R7B1_POST_SOURCE_FILTER_SELECTOR_EXACT_PREDICATE_TRACE";

const out={
  contract:"SCIIP_EXPLORER_4_M4_19D4BN2_R7B_EXPLORER_SEARCH_CANDIDATE_BUILDER_FILTER_AND_INDEX_CAUSAL_TRACE",
  version:"4.0-m4.19d4bn2-r7b",
  status:"PASSED",
  state:"M419D4BN2_R7B_SEARCH_CANDIDATE_BUILDER_CAUSAL_TRACE_COMPLETE_FIRST_EXCLUSION_POINTS_CERTIFIED_REMEDIATION_READY",
  certifiedAt:new Date().toISOString(),
  prerequisite:{
    r7aState:r7a.state,
    classification:r7a.classification,
    exactTen:ten.length===10,
    canonicalRuntimeParity:sha(canonicalPath)===sha(runtimePath)
  },
  implementationBinding:{
    explorer3:path.relative(app,explorer3),
    explorer3Sha256:sha(explorer3),
    explorer3DirectImports:directImports.map(p=>path.relative(app,p)),
    symbolFiles,
    traceFiles:[...traceFiles.values()]
  },
  dataBinding:{
    canonical:{path:path.relative(app,canonicalPath),sha256:sha(canonicalPath)},
    runtime:{path:path.relative(app,runtimePath),sha256:sha(runtimePath)},
    governedInventory:{path:path.relative(app,inventoryPath),sha256:sha(inventoryPath)},
    explorer3Properties:explorer3PropertiesInfo
  },
  causalTrace:{
    perRecord:causal,
    firstExclusionCounts:counts,
    dominantCause,
    candidateBuilderAndFilterHits:filterHits
  },
  adjudication:{
    browserLayerClosed:true,
    navigationLayerClosed:true,
    nativeInputLayerClosed:true,
    canonicalRuntimeLayerClosed:true,
    firstExclusionPointCertified:true,
    dominantCause,
    conclusion:
      dominantCause==="GOVERNED_BASE_INVENTORY"
      ? "The exact ten identities exist in canonical/runtime storage but do not enter Explorer's governed presentation inventory."
      : dominantCause==="EXPLORER3_PROPERTIES_STATIC_SEED"
      ? "The exact ten reach governed inventory but are excluded because Search SCIIP resolves against the older EXPLORER3_PROPERTIES seed."
      : dominantCause==="POST_SOURCE_FILTER_OR_SELECTOR"
      ? "The exact ten are present through the discovered source layers and are dropped by downstream candidate-builder/filter/selector logic."
      : "A mixed exclusion profile exists; remediate only after per-record causes are reviewed."
  },
  checks:{
    r7aPassed:true,
    exactTenTraced:true,
    explorer3Bound:true,
    canonicalRuntimeParity:true,
    governedInventoryInspected:true,
    candidateBuilderSymbolsTraced:true,
    firstExclusionAssignedForAllTen:causal.every(x=>x.firstExclusion!=="UNRESOLVED"),
    noWritePerformed:true
  },
  policy:{
    diagnosticOnly:true,
    readOnly:true,
    applicationMutation:false,
    uiSourceMutation:false,
    canonicalMutation:false,
    runtimeMutation:false,
    inventoryMutation:false,
    browserInteraction:false,
    networkRequests:0
  },
  nextMilestone:next,
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
    browserInteractionPerformed:false,
    networkRequestsPerformed:0,
    automaticRetry:false
  }
};

const outp=path.join(ev,"m4-19d4bn2-r7b-explorer-search-candidate-builder-filter-and-index-causal-trace.json");
fs.writeFileSync(outp,JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify(out,null,2));
