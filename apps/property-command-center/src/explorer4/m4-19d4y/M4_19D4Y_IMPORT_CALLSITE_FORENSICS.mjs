#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,imports,configIdentifiers,callsites,sha} from "./M419D4YImportRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4x-server-config-object-producer-exact-binding.json");
const resultPath=path.join(ev,"m4-19d4y-proxy-bootstrap-config-import-callsite-forensics.json");
const auditPath=path.join(ev,"m4-19d4y-proxy-bootstrap-config-import-callsite-audit.json");

const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
const configPath=path.join(app,"server/lightbox/config.mjs");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [prior,proxyPath,configPath]) if(!fs.existsSync(p)) block("M419D4Y_PREREQUISITE_MISSING",{path:p});

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4X_SERVER_CONFIG_OBJECT_PRODUCER_EXACT_BINDING_CERTIFIED")
  block("M419D4Y_M419D4X_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.binding?.classification!=="CONFIG_MODULE_NOT_PROVEN_AS_PROXY_BOOTSTRAP_INPUT")
  block("M419D4Y_EXPECTED_IMPORT_CALLSITE_BRANCH",{observed:pdoc?.binding?.classification??null});

const proxy=fs.readFileSync(proxyPath,"utf8");
const cfg=fs.readFileSync(configPath,"utf8");

const proxyImports=imports(proxy);
const cfgExports=[];
for(const m of cfg.matchAll(/\bexport\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) cfgExports.push(m[1]);
for(const m of cfg.matchAll(/\bexport\s*\{\s*([^}]+)\}/g)){
  for(const part of m[1].split(",")){
    const n=part.trim().split(/\s+as\s+/)[0];
    if(n) cfgExports.push(n);
  }
}

const relevantImports=proxyImports.filter(x=>
  /config/i.test(x.specifier) ||
  /lightbox/i.test(x.specifier) ||
  x.specifier.startsWith("./")
);

const identifiers=configIdentifiers(proxy);
const proxyCalls=callsites(proxy);

const directConfigImport=proxyImports.find(x=>/\.\/config(?:\.mjs)?$/.test(x.specifier));
const siblingImports=proxyImports.filter(x=>x.specifier.startsWith("./"));

const indirectionCandidates=[];
for(const imp of siblingImports){
  const base=path.resolve(path.dirname(proxyPath),imp.specifier);
  const cands=[base,base+".mjs",base+".js",base+".cjs",path.join(base,"index.mjs"),path.join(base,"index.js")];
  const hit=cands.find(fs.existsSync);
  if(!hit) continue;
  let text; try{text=fs.readFileSync(hit,"utf8")}catch{continue}
  const childImports=imports(text);
  if(childImports.some(x=>/\.\/config(?:\.mjs)?$/.test(x.specifier)||/lightbox\/config/.test(x.specifier))){
    indirectionCandidates.push({
      via:path.relative(repo,hit),
      parentImport:imp,
      childImports
    });
  }
}

// Exact usage proof: config identifier must feed port/allowedOrigins or constructor/service bootstrap.
const usage=[];
for(const id of identifiers){
  const re=new RegExp(`\\b${id}\\.(port|allowedOrigins|baseUrl|apiKey|timeoutMs|enabled)\\b`,"g");
  for(const m of proxy.matchAll(re)){
    usage.push({identifier:id,property:m[1],index:m.index});
  }
}

const configImportProven=!!directConfigImport || indirectionCandidates.length>0;
const configUsageProven=usage.length>0;

let classification,next;
if(directConfigImport && configUsageProven){
  classification="DIRECT_CONFIG_IMPORT_AND_BOOTSTRAP_USAGE_PROVEN";
  next="M4.19D4Z_SERVER_CONFIG_PRECEDENCE_AND_ISOLATED_SELF_TEST";
}else if(indirectionCandidates.length && configUsageProven){
  classification="INDIRECT_CONFIG_IMPORT_AND_BOOTSTRAP_USAGE_PROVEN";
  next="M4.19D4Z_INDIRECT_CONFIG_CHAIN_PRECEDENCE_AND_ISOLATED_SELF_TEST";
}else if(configImportProven && !configUsageProven){
  classification="CONFIG_IMPORT_PROVEN_USAGE_NOT_PROVEN";
  next="M4.19D4Z_PROXY_BOOTSTRAP_CONFIG_USAGE_EXACT_BINDING";
}else{
  classification="CONFIG_IMPORT_CHAIN_NOT_RECOVERED_FROM_PROXY_SOURCE";
  next="M4.19D4Z_PROXY_BOOTSTRAP_FACTORY_ORCHESTRATOR_CONFIG_CHAIN_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4Y_PROXY_BOOTSTRAP_CONFIG_IMPORT_CALLSITE_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  proxySource:path.relative(repo,proxyPath),
  configSource:path.relative(repo,configPath),
  proxyImports,
  relevantImports,
  configExports:[...new Set(cfgExports)],
  configIdentifiers:identifiers,
  configUsage:usage,
  directConfigImport:directConfigImport||null,
  indirectionCandidates,
  proxyCallsites:proxyCalls,
  configImportProven,
  configUsageProven,
  classification,
  sourceHashes:{
    proxy:sha(proxy),
    config:sha(cfg)
  },
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4Y_PROXY_BOOTSTRAP_CONFIG_IMPORT_CALLSITE_FORENSICS_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    classification,
    configImportProven,
    configUsageProven,
    directConfigImport:!!directConfigImport,
    indirectConfigImportPaths:indirectionCandidates.map(x=>x.via),
    configIdentifiers:identifiers,
    configUsage:usage,
    configExports:[...new Set(cfgExports)],
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    secretValuesExposed:false
  },
  policy:{
    importChainMustBeExact:true,
    usageMustBeExact:true,
    noPrecedenceMutationBeforeImportUsageProof:true,
    noProxyRestart:true,
    noEnrichmentRetry:true
  },
  safety:{
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false
  },
  artifacts:{importCallsiteAudit:auditPath},
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
