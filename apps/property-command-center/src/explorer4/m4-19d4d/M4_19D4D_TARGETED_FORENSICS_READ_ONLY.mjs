#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,extractFunctionBlocks,semanticFlags,sha} from "./M419D4DForensicsRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4c-lightbox-runtime-bootstrap-contract-proxy-route-targeted-inspection.json");
const resultPath=path.join(ev,"m4-19d4d-lightbox-data-route-implementation-targeted-forensics.json");
const routePath=path.join(ev,"m4-19d4d-lightbox-enrich-route-implementation-evidence.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
if(!fs.existsSync(prior)) throw new Error(`missing prerequisite: ${prior}`);
const priorDoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(priorDoc?.state!=="M419D4C_LIGHTBOX_TARGETED_INSPECTION_COMPLETE_DATA_ENDPOINT_NOT_PROVEN")
  throw new Error(`unexpected prior state: ${priorDoc?.state}`);

const roots=[
  path.join(app,"server/lightbox"),
  path.join(app,"src/broker-product/property-explorer/integrations/lightbox"),
  path.join(app,"src")
];
const deny=new Set(["node_modules",".git","dist","build",".next","coverage"]);
const files=[];
function walk(d,depth=0){
  if(depth>7||!fs.existsSync(d)) return;
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    if(deny.has(e.name)) continue;
    const p=path.join(d,e.name);
    if(e.isDirectory()){walk(p,depth+1);continue}
    if(e.isFile() && /\.(js|mjs|cjs|ts|tsx)$/i.test(e.name)) files.push(p);
  }
}
roots.forEach(r=>walk(r));

const seen=new Set(), docs=[];
for(const p of files){
  const rp=path.resolve(p); if(seen.has(rp)) continue; seen.add(rp);
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  if(text.length>2_000_000) continue;
  if(!/lightbox|\/api\/lightbox\/enrich|enrichment/i.test(text)) continue;

  const flags=semanticFlags(text);
  const routeBlocks=extractFunctionBlocks(text);
  const imports=[...text.matchAll(/(?:import .*? from |require\()["'`]([^"'`]+)["'`]/g)].map(m=>m[1]);
  const env=[...new Set([...text.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)].map(m=>m[1]))];
  const listenSnippets=[...text.matchAll(/.{0,120}\.listen\s*\([^;\n]{0,180}/g)].map(m=>m[0]);
  const createServerSnippets=[...text.matchAll(/.{0,120}(?:createServer|http\.createServer|https\.createServer)\s*\([^;\n]{0,180}/g)].map(m=>m[0]);
  const enrichRefs=[...text.matchAll(/.{0,180}(?:\/api\/lightbox\/enrich|enrich[A-Za-z0-9_$]*|Enrichment[A-Za-z0-9_$]*)[^;\n]{0,220}/g)].map(m=>m[0]).slice(0,30);

  docs.push({
    relativePath:path.relative(repo,p), sha256:sha(text), flags, imports, env,
    routeBlockCount:routeBlocks.length,
    routeBlockSha:routeBlocks.map(b=>sha(b)),
    listenSnippets, createServerSnippets, enrichRefs
  });
}

const enrichDocs=docs.filter(d=>d.routeBlockCount>0 || d.enrichRefs.length>0);
const listenerDocs=docs.filter(d=>d.flags.listener||d.flags.serverCreate);
const availableDocs=docs.filter(d=>d.flags.availableSf);
const provenanceDocs=docs.filter(d=>d.flags.sourceProvenance);
const timestampDocs=docs.filter(d=>d.flags.timestamp);

const proxyDoc=enrichDocs.find(d=>d.relativePath.endsWith("server/lightbox/proxy-server.mjs"))||null;
const serviceDocs=enrichDocs.filter(d=>/EnrichmentService|EnrichmentOrchestrator|EvidenceExtractor|BrowserClient/.test(d.relativePath));

const routeEvidence={
  contract:"SCIIP_EXPLORER_4_M4_19D4D_LIGHTBOX_ENRICH_ROUTE_IMPLEMENTATION_EVIDENCE",
  version:VERSION,generatedAt:new Date().toISOString(),
  proxyImplementation:proxyDoc,
  relatedServiceImplementations:serviceDocs,
  listenerImplementations:listenerDocs,
  availableSfSemanticImplementations:availableDocs,
  provenanceImplementations:provenanceDocs,
  timestampImplementations:timestampDocs
};
write(routePath,routeEvidence);

const listenerProven=listenerDocs.length>0;
const availableSfProven=availableDocs.length>0;
const enrichImplementationProven=!!proxyDoc || serviceDocs.length>0;

let state,next;
if(!enrichImplementationProven){
  state="M419D4D_LIGHTBOX_ENRICH_IMPLEMENTATION_NOT_PROVEN";
  next="M4.19D4E_LIGHTBOX_PROXY_IMPLEMENTATION_SOURCE_RECOVERY";
}else if(!listenerProven){
  state="M419D4D_LIGHTBOX_ENRICH_IMPLEMENTATION_PROVEN_RUNTIME_LISTENER_NOT_PROVEN";
  next="M4.19D4E_LIGHTBOX_PROXY_BOOTSTRAP_AND_LISTENER_BINDING";
}else if(!availableSfProven){
  state="M419D4D_LIGHTBOX_ENRICH_ROUTE_PROVEN_AVAILABLE_SF_SEMANTIC_PATH_ABSENT";
  next="M4.19D5_LIGHTBOX_FIELD_SEMANTICS_GAP_DECISION_AND_ALTERNATE_SOURCE_POLICY";
}else{
  state="M419D4D_LIGHTBOX_ENRICH_ROUTE_AND_AVAILABLE_SF_SEMANTIC_PATH_PROVEN_DRY_RUN_BINDING_READY";
  next="M4.19D4E_LIGHTBOX_PROXY_BOOTSTRAP_AND_SINGLE_RECORD_DRY_RUN_BINDING";
}

const out={
  contract:CONTRACT,version:VERSION,status:"PASSED",state,certifiedAt:new Date().toISOString(),
  forensics:{
    codeFilesInspected:docs.length,
    enrichImplementationFiles:enrichDocs.length,
    listenerImplementationFiles:listenerDocs.length,
    availableSfSemanticFiles:availableDocs.length,
    provenanceSemanticFiles:provenanceDocs.length,
    timestampSemanticFiles:timestampDocs.length,
    enrichImplementationProven,
    listenerProven,
    sourceNativeAvailableSfSemanticPathProven:availableSfProven,
    networkRequestPerformed:false,
    secretValuesExposed:false
  },
  artifacts:{routeImplementationEvidence:routePath},
  authorityClosure:{
    temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,automaticRetry:false
  },
  nextMilestone:next
};
write(resultPath,out); console.log(JSON.stringify(out,null,2));
