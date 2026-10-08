#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,imports,declarations,configFlows,sha} from "./M419D4ZFactoryRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4y-proxy-bootstrap-config-import-callsite-forensics.json");
const resultPath=path.join(ev,"m4-19d4z-proxy-bootstrap-factory-orchestrator-config-chain-forensics.json");
const auditPath=path.join(ev,"m4-19d4z-proxy-bootstrap-factory-orchestrator-config-chain-audit.json");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,proxyPath]) if(!fs.existsSync(p)) block("M419D4Z_PREREQUISITE_MISSING",{path:p});

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4Y_PROXY_BOOTSTRAP_CONFIG_IMPORT_CALLSITE_FORENSICS_CERTIFIED")
  block("M419D4Z_M419D4Y_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.forensics?.classification!=="CONFIG_IMPORT_CHAIN_NOT_RECOVERED_FROM_PROXY_SOURCE")
  block("M419D4Z_FACTORY_ORCHESTRATOR_BRANCH_REQUIRED",{observed:pdoc?.forensics?.classification??null});

const roots=[path.join(app,"server"),path.join(app,"src")].filter(fs.existsSync);
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

const proxy=fs.readFileSync(proxyPath,"utf8");
const proxyDecls=declarations(proxy);
const proxyFlows=configFlows(proxy);
const proxyImports=imports(proxy);

const proxyConfigDecls=proxyDecls.filter(d=>d.groups?.includes("config") || /\bconfig\b/.test(d.match));
const candidateIdentifiers=new Set(["config"]);
for(const d of proxyDecls){
  for(const g of d.groups||[]) if(typeof g==="string" && /config|orchestrator|service|factory/i.test(g)) candidateIdentifiers.add(g);
}

const relevant=[];
for(const p of files){
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  if(!/getLightBoxConfig|publicLightBoxConfig|LightBox|Lightbox|orchestrator|proxy-server|config/i.test(text)) continue;
  const imps=imports(text);
  const decls=declarations(text);
  const flows=configFlows(text);
  relevant.push({
    file:path.relative(repo,p),
    imports:imps,
    declarations:decls,
    flows,
    sha256:sha(text)
  });
}

// Build local import graph edges.
const edges=[];
for(const f of relevant){
  const abs=path.join(repo,f.file);
  for(const imp of f.imports){
    if(!imp.specifier.startsWith(".")) continue;
    const base=path.resolve(path.dirname(abs),imp.specifier);
    const cands=[base,base+".mjs",base+".js",base+".cjs",path.join(base,"index.mjs"),path.join(base,"index.js")];
    const hit=cands.find(fs.existsSync);
    if(hit) edges.push({from:f.file,to:path.relative(repo,hit),clause:imp.clause,specifier:imp.specifier});
  }
}

const proxyRel=path.relative(repo,proxyPath);
const configRel="apps/property-command-center/server/lightbox/config.mjs";

// Reverse reachability: what can reach proxy and what can reach config.
function reachable(start,target,maxDepth=6){
  const adj=new Map();
  for(const e of edges){
    if(!adj.has(e.from)) adj.set(e.from,[]);
    adj.get(e.from).push(e.to);
  }
  const q=[[start,[]]], seen=new Set();
  while(q.length){
    const [cur,pathSoFar]=q.shift();
    if(cur===target) return pathSoFar;
    if(seen.has(cur)||pathSoFar.length>=maxDepth) continue;
    seen.add(cur);
    for(const n of adj.get(cur)||[]) q.push([n,[...pathSoFar,{from:cur,to:n}]]);
  }
  return null;
}

// Look for any relevant file importing config and proxy/orchestrator chain evidence.
const configImporters=edges.filter(e=>e.to===configRel);
const proxyLocalImports=edges.filter(e=>e.from===proxyRel);
const configToProxyPaths=[];
for(const imp of configImporters){
  const p=reachable(imp.from,proxyRel,8);
  if(p) configToProxyPaths.push({configImporter:imp.from,path:p});
}

// More useful in this repo: proxy may import orchestrator/service, which imports config.
const proxyToConfigPath=reachable(proxyRel,configRel,8);

// Recover exact config declaration in proxy source if present.
const configDeclarationLines=proxy.split(/\r?\n/).map((line,i)=>({line:i+1,text:line.trim()}))
  .filter(x=>/\bconfig\b\s*=|getLightBoxConfig|publicLightBoxConfig/i.test(x.text));

let classification,next;
if(proxyToConfigPath){
  classification="PROXY_TO_CONFIG_MULTI_HOP_IMPORT_CHAIN_PROVEN";
  next="M4.19D4AA_MULTI_HOP_CONFIG_PRECEDENCE_AND_ISOLATED_SELF_TEST";
}else if(configDeclarationLines.length){
  classification="PROXY_CONFIG_IDENTIFIER_DECLARATION_RECOVERED_IMPORT_ORIGIN_STILL_INDIRECT";
  next="M4.19D4AA_CONFIG_IDENTIFIER_ORIGIN_EXACT_BINDING";
}else if(proxyLocalImports.length){
  classification="PROXY_LOCAL_FACTORY_OR_ORCHESTRATOR_IMPORTS_RECOVERED_CONFIG_ORIGIN_NOT_YET_PROVEN";
  next="M4.19D4AA_PROXY_LOCAL_FACTORY_ORCHESTRATOR_CONFIG_ORIGIN_BINDING";
}else{
  classification="PROXY_CONFIG_ORIGIN_REQUIRES_BOOTSTRAP_WRAPPER_FORENSICS";
  next="M4.19D4AA_PROXY_BOOTSTRAP_WRAPPER_CONFIG_ORIGIN_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4Z_FACTORY_ORCHESTRATOR_CONFIG_CHAIN_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  filesScanned:files.length,
  relevantFiles:relevant.length,
  importEdges:edges,
  proxyLocalImports,
  configImporters,
  proxyToConfigPath,
  configToProxyPaths,
  proxyConfigDeclarations:configDeclarationLines,
  proxyDeclarations:proxyDecls,
  proxyFlows,
  classification,
  secretValuesCaptured:false,
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4Z_PROXY_BOOTSTRAP_FACTORY_ORCHESTRATOR_CONFIG_CHAIN_FORENSICS_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    classification,
    filesScanned:files.length,
    relevantFiles:relevant.length,
    proxyLocalImportCount:proxyLocalImports.length,
    configImporterCount:configImporters.length,
    proxyToConfigPath,
    proxyConfigDeclarationLines:configDeclarationLines,
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    secretValuesExposed:false
  },
  policy:{
    exactMultiHopImportProofPreferred:true,
    configIdentifierOriginMustBeProven:true,
    noRuntimeMutationBeforeOriginProof:true,
    noProxyRestart:true,
    noEnrichmentRetry:true
  },
  safety:{
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false
  },
  artifacts:{factoryOrchestratorChainAudit:auditPath},
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
